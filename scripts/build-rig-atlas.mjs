import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {CLIPS,CELL,RIG_HEIGHT,poseAt,characterSvg} from '../src/ash-rig.js';
import {adultPose,adultSvg} from '../src/adult-rig.js';
const id=Number(process.argv[2]||0),slug={0:'ash',14:'oak',8:'giovanni'}[id];if(!slug)throw Error('Supported rig IDs: 0, 14, 8');
const pose=(clip,t)=>id===0?poseAt(clip,t):adultPose(id,clip,t);
const drawing=p=>id===0?characterSvg(p):adultSvg(p,id);
const frameSvg=(clip,t)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${CELL.width}" height="${CELL.height}"><g transform="translate(${CELL.rootX} ${CELL.baseline})">${drawing(pose(clip,t))}</g></svg>`;
// SVG is the editable drawing source; Sharp rasterizes it without a browser or image service.
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp')}catch{sharp=require(process.env.ASH_SHARP_PATH||'/Users/littlejedi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')}
await mkdir('assets/combat',{recursive:true});await mkdir(`assets/rigs/${slug}`,{recursive:true});
const frames=[],animations={},cells=[];
for(const [name,spec] of Object.entries(CLIPS)){
 const fps=name==='idle'?12:30;
 const times=[...new Set([0,...Array.from({length:(['guard','hurt','jump'].includes(name)?1:Math.ceil(spec.duration*fps))},(_,i)=>+(i/fps).toFixed(6)),...(spec.contact!==undefined?[spec.contact]:[])])].filter(t=>t<spec.duration).sort((a,b)=>a-b);
 animations[name]={duration:spec.duration,loop:!!spec.loop,times,frames:[]};
 for(const t of times){const id=frames.length,col=id%8,row=Math.floor(id/8);animations[name].frames.push(id);frames.push({crop:[col*CELL.width,row*CELL.height,CELL.width,CELL.height],localLeft:0,localTop:0,rootX:CELL.rootX,baseline:CELL.baseline});cells.push(`<g transform="translate(${col*CELL.width+CELL.rootX} ${row*CELL.height+CELL.baseline})">${drawing(pose(name,t))}</g>`)}
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${CELL.width*8}" height="${CELL.height*Math.ceil(frames.length/8)}">${cells.join('')}</svg>`;
await writeFile(`assets/rigs/${slug}/atlas.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`assets/combat/${slug}-rig.png`);
await writeFile(`assets/rigs/${slug}/layers.svg`,frameSvg('idle',0));
await writeFile(`assets/rigs/${slug}/skeleton.json`,JSON.stringify({authoring:id===0?'src/ash-rig.js':'src/adult-rig.js',height:RIG_HEIGHT,cell:CELL,clips:CLIPS,restPose:pose('idle',0)},null,2)+'\n');
const manifest=JSON.parse(await readFile('assets/meta/atlases.json'));
manifest.status='three-trainer-rig-prototypes';manifest.trainers[id]={path:`/assets/combat/${slug}-rig.png`,source:'layered-svg-two-bone-ik',facing:1,referenceHeight:RIG_HEIGHT,reviewed:false,frames,animations};
await writeFile('assets/meta/atlases.json',JSON.stringify(manifest,null,2)+'\n');
const poses=[['idle',0],['punch',.055],['punch',.12],['punch',.18],['punch',.37],['kick',.105],['kick',.21],['kick',.3],['kick',.55],['guard',0],['walk',.2],['hurt',0]];
const contact=`<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="1140"><rect width="100%" height="100%" fill="#e9e9de"/>${poses.map(([clip,t],i)=>`<g transform="translate(${i%4*420} ${Math.floor(i/4)*380})"><path d="M 22 335 H 398" stroke="#bdc6bf"/><text x="22" y="27" font-family="monospace" font-size="16" fill="#344957">${clip.toUpperCase()} / ${t.toFixed(3)}s</text><g transform="translate(160 330)">${drawing(pose(clip,t))}</g></g>`).join('')}</svg>`;
await sharp(Buffer.from(contact)).png().toFile(`assets/rigs/${slug}/contact-sheet.png`);
console.log(`${slug}: ${frames.length} frames, ${Object.keys(animations).length} clips. Review required.`);
