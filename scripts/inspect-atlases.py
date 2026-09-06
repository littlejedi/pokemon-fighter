"""Read alpha geometry only; never edits or rewrites generated image pixels.
Requires Pillow. Input: 4x3 trainer PNGs and 3x2 partner PNGs.
Human visual review is required before setting reviewed=true in the manifest.
"""
from pathlib import Path
from PIL import Image
import json
manifest_path=Path('assets/meta/atlases.json')
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {'status':'pending-visual-review','trainers':{},'partners':{}}
active_ids=[0,1,2,3,4,5,6,7,8,13,14]
for i in active_ids:
 if manifest['trainers'].get(str(i),{}).get('source')=='layered-svg-two-bone-ik':continue
 path=Path(f'assets/combat/{i}.png')
 if not path.exists():continue
 im=Image.open(path).convert('RGBA');alpha=im.getchannel('A')
 if alpha.getextrema()[0]!=0:raise ValueError(f'{path} is not transparent; regenerate through image_gen')
 cell_w,cell_h=im.width/4,im.height/3
 frames=[]
 for frame in range(12):
  col,row=frame%4,frame//4;x,y=round(col*cell_w),round(row*cell_h)
  tile=alpha.crop((x,y,round((col+1)*cell_w),round((row+1)*cell_h)))
  box=tile.getbbox()
  if not box:raise ValueError(f'{path} frame {frame} is empty')
  l,t,r,b=box
  feet=tile.crop((0,max(t,b-round((b-t)*.14)),tile.width,b))
  points=[]
  for px in range(feet.width):
   count=sum(1 for py in range(feet.height) if feet.getpixel((px,py))>64)
   points.extend([px]*count)
  root=points[len(points)//2] if points else (l+r)/2
  frames.append({'crop':[x+l,y+t,r-l,b-t],'localLeft':l,'localTop':t,'rootX':root,'baseline':b})
 manifest['trainers'][i]={'path':'/'+str(path),'facing':1,'referenceHeight':frames[0]['crop'][3],'frames':frames,'reviewed':False}
partner_groups=[[0,1,2,3,4],[5,6,7,8,13],[14]]
for group,trainer_ids in enumerate(partner_groups):
 path=Path(f'assets/partners/{group}.png')
 if not path.exists():continue
 im=Image.open(path).convert('RGBA');alpha=im.getchannel('A')
 if alpha.getextrema()[0]!=0:raise ValueError(f'{path} is not transparent; regenerate through image_gen')
 for cell,trainer_id in enumerate(trainer_ids):
  col,row=cell%3,cell//3;x,y=round(col*im.width/3),round(row*im.height/2)
  box=alpha.crop((x,y,round((col+1)*im.width/3),round((row+1)*im.height/2))).getbbox()
  if not box:raise ValueError(f'{path} cell {cell} is empty')
  l,t,r,b=box
  manifest['partners'][trainer_id]={'path':'/'+str(path),'crop':[x+l,y+t,r-l,b-t],'facing':1,'reviewed':False}
Path('assets/meta/atlases.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Indexed',len(manifest['trainers']),'trainer sheets and',len(manifest['partners']),'partners; visual review still required.')
