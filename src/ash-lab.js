import {art,loadArt,drawTrainer} from './art.js';
import {poseAt,RIG_HEIGHT} from './ash-rig.js';
import {atlasFrame} from './atlas-animation.js';
import {ATTACKS,attackPhase} from './battle-rules.js';
const $=s=>document.querySelector(s),canvas=$('#preview'),c=canvas.getContext('2d');
const names={punch:'出拳',kick:'踢腿',idle:'待机',walk:'行走',guard:'防御',hurt:'受击',jump:'跳跃',command:'指令',special:'必杀'};
let clip='punch',time=0,playing=true,dir=1,last=0,ready=false;
for(const [id,name] of Object.entries(names)){const b=document.createElement('button');b.textContent=name;b.dataset.clip=id;b.classList.toggle('active',id===clip);b.setAttribute('aria-pressed',String(id===clip));b.onclick=()=>{clip=id;time=0;document.querySelectorAll('[data-clip]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b))})};$('#clips').append(b)}
function pause(value){playing=value;$('#play').textContent=playing?'Ⅱ 暂停':'▶ 播放';$('#play').setAttribute('aria-label',playing?'暂停播放':'播放动画')}
$('#play').onclick=()=>pause(!playing);$('#direction').onclick=()=>{dir*=-1;$('#direction').textContent=dir===1?'面向右侧 →':'← 面向左侧'};
$('#scrub').oninput=ev=>{pause(false);time=+ev.target.value*art.atlases.trainers[0].animations[clip].duration};
$('#step').onclick=()=>{if(!ready)return;pause(false);const a=art.atlases.trainers[0].animations[clip];time=a.times.find(t=>t>time+1e-5)??0};
await loadArt();ready=true;
function render(now){const dt=Math.min(.06,(now-last)/1000||0);last=now;const a=art.atlases.trainers[0],spec=a.animations[clip];if(playing)time=(time+dt*Number($('#speed').value))%(spec.duration+.22);
 const sample=Math.min(time,spec.duration),frame=atlasFrame(a,clip,sample),local=spec.frames.indexOf(frame),sampleTime=spec.times[local]||0;
 c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,720,420);c.fillStyle='#17343e';c.fillRect(0,0,720,420);
 c.strokeStyle='#ffffff09';c.lineWidth=1;for(let x=20;x<720;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,420);c.stroke()}for(let y=20;y<420;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(720,y);c.stroke()}
 c.strokeStyle='#b5ccb04d';c.beginPath();c.moveTo(36,356);c.lineTo(684,356);c.stroke();c.fillStyle='#ffffff18';c.beginPath();c.ellipse(330,358,75,7,0,0,Math.PI*2);c.fill();
 drawTrainer(c,0,330,350,RIG_HEIGHT,dir,clip,sample,0,false,sample);
 if($('#bones').checked){c.save();c.translate(330,350);c.scale(dir,1);c.strokeStyle='#ffd176';c.fillStyle='#16333f';c.lineWidth=1.5;for(const chain of Object.values(poseAt(clip,sampleTime).bones)){c.beginPath();chain.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();for(const [x,y] of chain){c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();c.stroke()}}c.restore()}
 const phase=ATTACKS[clip]?({startup:'起手 · 蓄力',active:'命中 · 伸展',recovery:'收招 · 回位',idle:'恢复架势'}[attackPhase(clip,sample)]):names[clip];
 $('#phase').textContent=phase;$('#clock').textContent=`${sample.toFixed(3)} / ${spec.duration.toFixed(3)} s`;$('#frame-readout').textContent=`FRAME ${String(local+1).padStart(2,'0')} / ${spec.frames.length} · ${names[clip]}`;$('#scrub').value=sample/spec.duration;canvas.dataset.pose=JSON.stringify({clip,time:sample,frame,dir,playing,phase});requestAnimationFrame(render)}requestAnimationFrame(render);
