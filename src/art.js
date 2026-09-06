import {atlasFrame} from './atlas-animation.js';
import { ACTIVE_FIGHTER_IDS, ATTACKS, TRAINER_HEIGHTS, pokemonStageHeight, attackFrame, summonPhase, SUMMON_TIMING, lerp, smooth } from './battle-rules.js';
// Local, preloaded textures. No remote assets or block-art substitutes at runtime.
export const art = { images: new Map(), bounds: {}, atlases: {}, ready: false };
const pokemonIds=[25,95,121,26,45,110,65,126,112,131,68,94,149,9,128];
const stageNames=['viridian','cerulean','indigo'];
export async function loadArt(onProgress=()=>{}) {
  const response=await fetch('/assets/meta/bounds.json');
  if(!response.ok)throw new Error('贴图索引加载失败');
  art.bounds=await response.json();
  const atlasResponse=await fetch('/assets/meta/atlases.json');if(!atlasResponse.ok)throw new Error('动作图集加载失败');art.atlases=await atlasResponse.json();
  const paths=[...new Set([...Object.keys(art.bounds).filter(path=>{const trainer=path.match(/trainers\/(\d+)/),pokemon=path.match(/pokemon\/(\d+)/);return trainer?ACTIVE_FIGHTER_IDS.includes(Number(trainer[1])):pokemon?ACTIVE_FIGHTER_IDS.some(id=>pokemonIds[id]===Number(pokemon[1])):true}),...stageNames.map(n=>`/assets/stages/${n}.png`),...Object.values(art.atlases.trainers).map(a=>a.path),...Object.values(art.atlases.partners).map(a=>a.path)])];
  let done=0;
  await Promise.all(paths.map(path=>new Promise((resolve,reject)=>{
    if(art.images.has(path)){onProgress(++done,paths.length);resolve();return;}
    const image=new Image();
    const timer=setTimeout(()=>reject(new Error(`贴图加载超时：${path}`)),15000);
    image.onload=()=>{clearTimeout(timer);art.images.set(path,image);onProgress(++done,paths.length);resolve()};
    image.onerror=()=>{clearTimeout(timer);reject(new Error(`贴图加载失败：${path}`))};
    image.src=path;
  })));
  art.ready=true;
}
function texture(c,path,x,y,w,h){const image=art.images.get(path);if(!image)return;const b=art.bounds[path]?.bounds||[0,0,image.naturalWidth,image.naturalHeight];c.drawImage(image,...[b[0],b[1],b[2]-b[0],b[3]-b[1]],x,y,w,h)}
export function drawPortrait(canvas,id){
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  const path=`/assets/trainers/${id}.png`,b=art.bounds[path]?.bounds;if(!b)return;
  const bh=b[3]-b[1],bw=b[2]-b[0],height=h*1.94,width=height*bw/bh;
  texture(c,path,(w-width)/2,h*.08,width,height);
}
export function drawPartnerPortrait(canvas,id){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=true;drawPokemon(c,id,canvas.width/2,canvas.height*.93,canvas.height*.86,1,0,false)}
export function drawTrainer(c,id,x,feet,height=TRAINER_HEIGHTS[id],dir=1,pose='idle',t=0,stun=0,guard=false,elapsed=0){
 const atlas=art.atlases.trainers?.[id],image=atlas&&art.images.get(atlas.path);
 if(!image){
  // Temporary compatibility rendering while the external image service is unavailable.
  // This is NOT a substitute for the requested side-view animation atlas.
  const path=`/assets/trainers/${id}${ATTACKS[pose]||pose==='command'?'_2':''}.png`,b=art.bounds[path]?.bounds;if(!b)return;
  const w=height*(b[2]-b[0])/(b[3]-b[1]);c.save();c.translate(x,feet);c.scale(dir,1);texture(c,path,-w/2,-height,w,height);c.restore();return;
 }
 let frame;
 if(atlas.animations){const clip=guard?'guard':stun>0?'hurt':pose;frame=atlasFrame(atlas,clip,ATTACKS[pose]?elapsed:t)}
 else {frame=attackFrame(pose,elapsed);if(pose==='command')frame=3;if(guard)frame=0;if(stun>0)frame=4;}
 const f=atlas.frames[frame],scale=height/atlas.referenceHeight;
 c.save();c.translate(x,feet-(!atlas.animations&&pose==='walk'?Math.abs(Math.sin(t*12))*2:0));c.scale(dir*(atlas.facing??1),1);
 if(stun>0)c.filter='brightness(1.35) saturate(.65)';
 // Baked articulated poses share a fixed root and scale; never recenter each crop.
 c.drawImage(image,...f.crop,(f.localLeft-f.rootX)*scale,(f.localTop-f.baseline)*scale,f.crop[2]*scale,f.crop[3]*scale);
 c.restore();
}
export function drawPokemon(c,id,x,feet,height=pokemonStageHeight(id),dir=1,t=0,battle=true){
 if(battle){
  const sprite=art.atlases.partners?.[id],image=sprite&&art.images.get(sprite.path);
  if(!image){const nativeFacing=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,1,-1][id];drawPokemon(c,id,x,feet,height,dir*nativeFacing,t,false);return}
  const [sx,sy,sw,sh]=sprite.crop,w=height*sw/sh;
  c.save();c.translate(x,feet);c.scale(dir*(sprite.facing??1),1);c.drawImage(image,sx,sy,sw,sh,-w/2,-height,w,height);c.restore();
 }else{
  const path=`/assets/pokemon/${pokemonIds[id]}.png`,b=art.bounds[path]?.bounds;if(!b)return;
  const w=height*(b[2]-b[0])/(b[3]-b[1]);c.save();c.translate(x,feet);c.scale(dir,1);texture(c,path,-w/2,-height,w,height);c.restore();
 }
}
export function drawStage(c,id,t){
  const image=art.images.get(`/assets/stages/${stageNames[id]}.png`);if(!image)return;
  // Crop a tiny overscan margin for a subtle camera drift; no pixel upscaling.
  const drift=Math.sin(t*.16)*2;
  c.drawImage(image,-5+drift,-3,970,507);
  const shade=c.createLinearGradient(0,0,0,498);shade.addColorStop(0,'#071b2c66');shade.addColorStop(.22,'#071b2c00');shade.addColorStop(.78,'#071b2c00');shade.addColorStop(1,'#071b2c77');c.fillStyle=shade;c.fillRect(0,0,960,498);
  // Slow ambient motes / pool reflections provide depth without obscuring art.
  c.save();c.globalAlpha=.38;
  for(let j=0;j<16;j++){const x=(j*71+t*(id===1?8:3))%960,y=120+(j*37%240)+Math.sin(t+j)*6;c.fillStyle=id===1?'#c7f7ff':id===2?'#e7c6ff':'#fff5b6';c.beginPath();c.arc(x,y,j%3===0?1.6:.8,0,Math.PI*2);c.fill()}
  c.restore();
}
export function drawShadow(c,x,y,w=40,alpha=.25){c.save();const g=c.createRadialGradient(x,y,2,x,y,w);g.addColorStop(0,`rgba(12,27,32,${alpha})`);g.addColorStop(1,'rgba(12,27,32,0)');c.fillStyle=g;c.translate(x,y);c.scale(1,.22);c.beginPath();c.arc(0,0,w,0,Math.PI*2);c.fill();c.restore()}
export function drawProjectile(c,q,t){
  c.save();c.translate(q.x,q.y);c.scale(q.dir,1);c.globalCompositeOperation='lighter';c.shadowColor=q.color;c.shadowBlur=q.big?27:16;
  const size=q.big?32:14,id=q.owner.id;
  const trail=c.createLinearGradient(-100,0,25,0);trail.addColorStop(0,q.color+'00');trail.addColorStop(.75,q.color+'99');trail.addColorStop(1,'#fffde9');c.fillStyle=trail;c.beginPath();c.ellipse(-26,0,q.big?95:58,size*.8,0,0,Math.PI*2);c.fill();
  if([0,3].includes(id)){c.strokeStyle='#fff4a0';c.lineWidth=q.big?5:3;for(let k=0;k<3;k++){c.beginPath();c.moveTo(-70,-size+k*size);for(let j=0;j<8;j++)c.lineTo(-70+j*15,Math.sin(j*3+t*24+k)*size);c.stroke()}}
  else if([1,8,14].includes(id)){c.globalCompositeOperation='source-over';c.fillStyle=q.color;c.strokeStyle='#716951';c.lineWidth=2;for(let k=0;k<3;k++){c.save();c.translate(-k*25,k%2*10);c.rotate(t*3);c.beginPath();for(let j=0;j<6;j++)c.lineTo(Math.cos(j)*size,Math.sin(j)*size);c.closePath();c.fill();c.stroke();c.restore()}}
  else if([4,5,11].includes(id)){for(let j=0;j<6;j++){c.fillStyle=q.color+'99';c.beginPath();c.ellipse(Math.cos(t*6+j)*size,Math.sin(t*6+j)*size,12,7,j,0,Math.PI*2);c.fill()}}
  else {const orb=c.createRadialGradient(0,0,0,0,0,size);orb.addColorStop(0,'#fff');orb.addColorStop(.35,'#fff7d9');orb.addColorStop(1,q.color+'88');c.fillStyle=orb;c.beginPath();c.arc(0,0,size,0,Math.PI*2);c.fill();if([2,9,13].includes(id)){c.strokeStyle='#d0faff';c.lineWidth=2;for(let j=0;j<3;j++){c.beginPath();c.ellipse(-j*16,0,size*.55,size,0,0,Math.PI*2);c.stroke()}}}
  c.restore();
}
export function drawHit(c,f){const progress=1-f.life/.28;c.save();c.globalAlpha=1-progress;c.translate(f.x,f.y);c.strokeStyle=f.color;c.shadowColor=f.color;c.shadowBlur=12;c.lineWidth=3;for(let j=0;j<9;j++){const a=j*Math.PI*2/9;c.beginPath();c.moveTo(Math.cos(a)*progress*12,Math.sin(a)*progress*12);c.lineTo(Math.cos(a)*(12+progress*48),Math.sin(a)*(12+progress*48));c.stroke()}c.restore()}
export function drawSummon(c,s,t){
 const phase=summonPhase(s.elapsed),h=pokemonStageHeight(s.id);
 c.save();
 if(phase==='exit')c.globalAlpha=1-smooth((s.elapsed-SUMMON_TIMING.exit)/(SUMMON_TIMING.end-SUMMON_TIMING.exit));
 drawShadow(c,s.x,429,Math.min(105,h*.45),.4);
 if(phase==='charge'){
  const g=c.createRadialGradient(s.x,425-h*.5,2,s.x,425-h*.5,h*.72);g.addColorStop(0,'#fcf5aa88');g.addColorStop(1,'#fcf5aa00');c.fillStyle=g;c.fillRect(s.x-h,425-h*1.5,h*2,h*2);
  c.strokeStyle='#fff3b6aa';c.lineWidth=2;for(let j=0;j<3;j++){c.beginPath();c.ellipse(s.x,425-h*.45,h*.42,h*(.3+j*.12),t*4+j,0,Math.PI*2);c.stroke()}
 }
 const recoil=phase==='release'?Math.sin(Math.min(1,(s.elapsed-SUMMON_TIMING.release)*5)*Math.PI)*6:0;
 drawPokemon(c,s.id,s.x-s.dir*recoil,425,h,s.dir,t);c.restore();
}
export function drawCinematic(c,scene,fighter){
 const t=scene.elapsed,progress=t/scene.duration,command=smooth(t/.6),charge=smooth((t-.75)/.7),reveal=smooth((t-1.95)/.35);
 c.save();c.fillStyle='#06121e';c.fillRect(0,0,960,498);
 const g=c.createLinearGradient(0,0,960,498);g.addColorStop(0,fighter.color);g.addColorStop(.5,'#132737');g.addColorStop(1,'#0a1528');c.fillStyle=g;c.fillRect(0,34,960,430);
 c.save();c.globalAlpha=.23;c.strokeStyle='#b8e7f9';c.lineWidth=2;for(let j=0;j<20;j++){let y=60+j*21;c.beginPath();c.moveTo((t*240+j*83)%400-400,y);c.lineTo(960,y-100);c.stroke()}c.restore();
 // The command portrait and partner share the shot; the camera closes in in phases.
 const path=`/assets/trainers/${scene.id}_2.png`,b=art.bounds[path]?.bounds;
 if(b){const h=510+progress*22,w=h*(b[2]-b[0])/(b[3]-b[1]);c.save();c.globalAlpha=command;c.translate(250-(1-command)*230,520);texture(c,path,-w/2,-h,w,h);c.restore()}
 c.save();c.translate(667+(1-charge)*220,370);const glow=c.createRadialGradient(0,-130,10,0,-130,230);glow.addColorStop(0,'#fffbc78c');glow.addColorStop(1,'#fffbc700');c.fillStyle=glow;c.fillRect(-240,-365,480,470);c.globalAlpha=.45+charge*.55;
 // Cinematic framing is independent of the physical battlefield scale.
 drawPokemon(c,scene.id,0,0,240+charge*35,-1,t,false);
 c.strokeStyle='#ffe9a5';c.lineWidth=2;c.globalAlpha=charge*(1-reveal*.6);for(let j=0;j<3;j++){c.beginPath();c.ellipse(0,-125,150+j*20,125+j*15,t*(j%2?1:-1),0,Math.PI*2);c.stroke()}c.restore();
 c.fillStyle='#050d17';c.fillRect(0,0,960,34);c.fillRect(0,464,960,34);
 c.font='bold 12px monospace';c.fillStyle='#e6c78a';c.textAlign='left';c.fillText('KANTO LEAGUE  /  PARTNER SUMMON',27,23);c.textAlign='right';c.fillStyle='#bacbd0';c.fillText('羁绊必杀',932,23);
 c.font='bold 22px "Noto Sans SC", sans-serif';c.fillStyle='#fff';c.textAlign='left';c.fillText(fighter.name,32,76);
 c.font='13px "Noto Sans SC", sans-serif';c.fillStyle='#fff0c9';c.fillText(t<1?'「'+fighter.poke+'，准备战斗！」':t<2?'「就是现在，释放全部力量！」':'「'+fighter.super+'！」',32,103);
 if(reveal>0){
  c.save();c.globalAlpha=reveal;c.translate((1-reveal)*260,0);c.fillStyle='#091728ed';c.beginPath();c.moveTo(375,365);c.lineTo(960,335);c.lineTo(960,443);c.lineTo(330,443);c.closePath();c.fill();c.fillStyle='#f4c45a';c.fillRect(390,381,4,45);
  c.textAlign='left';c.font='bold 36px "Noto Sans SC", sans-serif';c.fillStyle='#fff4ce';c.fillText(fighter.super,414,409);c.font='11px monospace';c.fillStyle='#9bb7c1';c.fillText(fighter.poke+' / SIGNATURE ATTACK',415,430);c.restore();
 }
 c.fillStyle='#f4d16d';c.fillRect(0,461,960*progress,3);
 c.restore();
}
