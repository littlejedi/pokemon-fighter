import {BattleAudio} from './battle-audio.js';
import {drawSelection,drawCountdown,drawVictory} from './demo-scenes.js';
import {demoTargets,newDemo,SELECT_DURATION,COUNTDOWN_DURATION,countdownLabel,openingTargets,KO_DURATION,VICTORY_DURATION} from './demo.js';
import { art, loadArt, drawPortrait, drawPartnerPortrait, drawTrainer, drawPokemon, drawStage, drawShadow, drawProjectile, drawHit, drawSummon, drawCinematic } from './art.js';
import { ATTACKS, CINEMATIC_DURATION, SUMMON_TIMING, TRAINER_HEIGHTS, POKEMON_HEIGHTS, pokemonStageHeight, faceOpponent, attackFrame, summonPhase, lerp, smooth } from './battle-rules.js';
const fighters = {
0:{name:'小智',en:'ASH KETCHUM',type:'全能型 · 电',color:'#426d9c',hair:'#232b27',skin:'#e6b68a',poke:'皮卡丘',move:'电光突进',super:'十万伏特',style:'速攻连击',speed:205,power:1,pk:25},
1:{name:'小刚',en:'BROCK',type:'力量型 · 岩石',color:'#a77443',hair:'#534231',skin:'#c69b71',poke:'大岩蛇',move:'岩石封锁',super:'巨岩冲击',style:'坚固防守',speed:150,power:1.3,pk:95},
2:{name:'小霞',en:'MISTY',type:'技巧型 · 水',color:'#e6c550',hair:'#db7437',skin:'#ecc5a0',poke:'宝石海星',move:'泡沫光线',super:'水炮漩涡',style:'灵活牵制',speed:215,power:.92,pk:121},
3:{name:'马志士',en:'LT. SURGE',type:'力量型 · 电',color:'#788656',hair:'#d4b660',skin:'#d3aa82',poke:'雷丘',move:'雷电拳',super:'百万吨雷击',style:'重拳压制',speed:160,power:1.25,pk:26},
4:{name:'莉佳',en:'ERIKA',type:'控制型 · 草',color:'#b55952',hair:'#26372e',skin:'#e9c39c',poke:'霸王花',move:'麻痹粉',super:'花瓣之舞',style:'花舞控场',speed:175,power:1,pk:45},
5:{name:'阿桔',en:'KOGA',type:'技巧型 · 毒',color:'#665577',hair:'#3b3845',skin:'#d7b391',poke:'双弹瓦斯',move:'毒雾手里剑',super:'剧毒烟幕',style:'忍术游击',speed:225,power:.9,pk:110},
6:{name:'娜姿',en:'SABRINA',type:'控制型 · 超能',color:'#a44457',hair:'#28364b',skin:'#e7bb9c',poke:'胡地',move:'念力波',super:'精神强念',style:'念力远攻',speed:175,power:1.1,pk:65},
7:{name:'夏伯',en:'BLAINE',type:'爆发型 · 火',color:'#d77542',hair:'#dddcc4',skin:'#d7b08b',poke:'鸭嘴火兽',move:'喷射火焰',super:'大字爆炎',style:'烈焰爆发',speed:165,power:1.2,pk:126},
8:{name:'坂木',en:'GIOVANNI',type:'力量型 · 地面',color:'#554b48',hair:'#37322b',skin:'#cba587',poke:'钻角犀兽',move:'地震重踏',super:'大地之怒',style:'大地压制',speed:150,power:1.35,pk:112},
13:{name:'青绿',en:'BLUE OAK',type:'技巧型 · 综合',color:'#7a5694',hair:'#966343',skin:'#d9b48e',poke:'水箭龟',move:'高速连击',super:'加农水炮',style:'战术反击',speed:215,power:1,pk:9},
14:{name:'大木博士',en:'PROFESSOR OAK',type:'全能型 · 综合',color:'#d9d9c7',hair:'#9c9d89',skin:'#ddb698',poke:'肯泰罗',move:'属性解析',super:'猛牛冲撞',style:'精准打击',speed:180,power:1.1,pk:128},
};
const sound=new BattleAudio();
let demo=null,cleanView=false;
const $=s=>document.querySelector(s);let chosen=0,stage=0,muted=true,paused=false,started=false,over=false,round=1,wins=[0,0],time=99,keys={},last=0,aiTick=0,aiAction=0,shake=0,flash=0,effects=[],projectiles=[],banner='准备好，训练家！',bannerTime=999,combo=0,comboTime=0;
const stages=[{name:'常青道馆',en:'VIRIDIAN GYM',sub:'关都地区 · 常青市',wall:'#88996c',dark:'#405b48',floor:'#687d55'},{name:'华蓝道馆',en:'CERULEAN GYM',sub:'关都地区 · 华蓝市',wall:'#799da3',dark:'#3a606c',floor:'#617f83'},{name:'石英高原',en:'INDIGO PLATEAU',sub:'关都地区 · 宝可梦联盟',wall:'#929098',dark:'#505169',floor:'#6c697d'}];
$('#app').innerHTML=`<header class="topbar"><div class="brand"><i class="ball"></i><div><strong>KANTO FIGHTERS<span style="color:var(--orange)">.</span></strong><small>关 都 格 斗 大 会</small></div></div><nav class="nav"><button class="active" id="nav-battle">对战大厅</button><button id="nav-roster">训练家图鉴</button><button id="nav-guide">操作指南 ↗</button></nav><div class="online"><i class="dot"></i> 本地街机 <span style="color:#a0a496">/ VER. 1.0</span></div></header><main class="main"><section class="intro"><div><div class="eyebrow">THE ORIGINAL 151. A WHOLE NEW FIGHT.</div><h1>熟悉的伙伴，全新的对决<span style="color:var(--orange)">。</span></h1><p>从真新镇出发，在关都的街机擂台上，成为最强训练家。</p></div><div class="edition">EST. 1996 — KANTO ARCADE SERIES</div></section><div class="layout"><section><div class="arena-shell"><div class="arena-top"><div class="live-label"><i></i> 自由对战 <span style="color:#626e58;margin:0 9px">/</span> PLAYER VS CPU</div><span id="round-label">ROUND 01 · BEST OF 3</span></div><div class="canvas-wrap"><canvas id="game" width="1920" height="996" aria-label="宝可梦训练家格斗场，使用 A D 移动，W 跳跃，J K 攻击，L 必杀，I 召唤"></canvas><button id="audio-enable" class="audio-enable" hidden>♪ 开启声音并从选人开始</button><div class="asset-loading" id="asset-loading"><span class="loading-ball"></span><strong>正在准备关都道馆</strong><small id="asset-progress">载入训练家与伙伴贴图…</small><button id="asset-retry" hidden>重新加载</button></div></div><div class="arena-bottom"><div>⌖ <strong id="stage-label">常青道馆</strong><span id="stage-sub" style="margin-left:12px">关都地区 · 常青市</span></div><div class="iconbuttons"><button id="sound" title="开启声音" aria-label="开启声音">♪ <span style="font-size:9px">OFF</span></button><button id="pause" title="暂停 / P" aria-label="暂停">Ⅱ</button><button id="fullscreen" title="全屏" aria-label="全屏">⛶</button></div></div></div><div class="under-arena"><div class="status"><i class="dot"></i><span id="status">街机已就绪 · 选择你的训练家</span></div><div class="actions"><button class="action" id="demo-button">▶ 演示对决</button><button class="action" id="record-view">录屏视图</button><button class="action" id="stage-button">⌖ 切换场地</button><button class="action primary" id="start">开始对战 <span style="margin-left:9px">↗</span></button></div></div><div class="touch-controls"><div><button data-key="a">←</button><button data-key="w">↑</button><button data-key="d">→</button><button data-key="s">防</button></div><div><button data-key="j">拳</button><button data-key="k">踢</button><button data-key="l">技</button><button data-key="i">召</button></div></div></section><aside class="sidebar"><section class="panel"><div class="panel-title"><h2>你的训练家</h2><span>PLAYER 01</span></div><div class="fighter-profile"><canvas class="portrait" id="profile" width="204" height="219"></canvas><div><h3 id="fighter-name"></h3><p id="fighter-en"></p><span class="tag" id="fighter-type"></span></div></div><div class="moves"><div class="move"><span>战斗风格</span><b id="fighter-style"></b></div><div class="move"><span>普通攻击</span><b><span class="normal-name">电光拳 / 旋风踢</span> <kbd class="key">J</kbd><kbd class="key">K</kbd></b></div><div class="move"><span>必杀招式</span><b><span id="fighter-move"></span><kbd class="key">L</kbd></b></div><div class="move"><span>伙伴召唤</span><b id="summon-name"></b></div></div><div class="summon"><canvas id="pokemon" width="144" height="144"></canvas><div style="flex:1"><strong id="pokemon-name"></strong><small>羁绊能量 <span id="energy-label">100%</span> · <span class="key" style="height:17px;min-width:17px">I</span> 召唤</small><small id="partner-size" class="partner-size"></small><div class="meter"><i id="energy-meter"></i></div></div></div></section><section class="panel help-panel"><h3>✧ 训练家小贴士</h3><p>近身连击积攒羁绊能量。<br>能量满格后播放召唤特写，伙伴登场释放绝招后离场。<br>按住 <kbd class="key">S</kbd> 防御，抓住反击时机。</p></section></aside></div><section class="roster" id="roster"><div class="sectionhead"><h2>选择你的训练家 <span>CHOOSE YOUR FIGHTER</span></h2><small>初代集结 <b style="color:var(--orange);margin-left:8px">${Object.keys(fighters).length}</b> / ${Object.keys(fighters).length}</small></div><div class="roster-grid">${Object.entries(fighters).map(([key,f])=>{const i=Number(key);return `<button class="fighter-card ${i===0?'selected':''}" data-fighter="${i}" title="${f.name} · ${f.type}" aria-label="选择${f.name}" aria-pressed="${i===0}">${i===0?'<span class="player-label">1P</span>':''}<canvas width="192" height="186" data-portrait="${i}"></canvas><span class="name">${f.name}</span></button>`}).join('')}</div></section><footer class="footer"><strong>GOTTA FIGHT 'EM ALL.</strong><span>致敬每一个从真新镇出发的你。 <span style="margin-left:18px">非官方同人作品 · 仅供学习交流</span></span><span>1996 → 2026</span></footer></main><div class="record-controls"><button id="record-sound">♪ 开启声音</button><button id="record-pause">暂停 / 继续</button><button id="record-restart">从头播放</button><button id="record-exit">退出录屏视图 · Esc</button></div><div class="modal hidden" id="modal"><div class="dialog"><button class="close" aria-label="关闭">×</button><div id="modal-content"></div></div></div>`;
const canvas=$('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';let assetsReady=false;
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)}
let p,e;function make(id,x,dir){return{id,x,y:0,vy:0,slow:0,poison:0,hp:100,energy:100,dir,pose:'idle',move:null,attack:0,cool:0,stun:0,guard:false}}function reset(match=true){keys={};cinematic=null;summons=[];hitstop=0;$('#pause').textContent='Ⅱ';$('#start').onclick=start;if(match){round=1;wins=[0,0]}p=make(chosen,235,1);e=make(chosen===14?0:14,725,-1);time=99;over=false;effects=[];projectiles=[];combo=0;aiTick=0;$('#round-label').textContent=`ROUND ${String(round).padStart(2,'0')} · BEST OF 3`;banner=started?`ROUND ${round} — FIGHT!`:'准备好，训练家！';bannerTime=started?1.6:999;$('#start').innerHTML=started?'重新对战 ↻':'开始对战 ↗';}
function select(id){if(!fighters[id])return;demo=null;sound.reset();$('#audio-enable').hidden=true;$('#demo-button').textContent='▶ 演示对决';chosen=id;document.querySelectorAll('.fighter-card').forEach(el=>{const i=Number(el.dataset.fighter);el.classList.toggle('selected',i===id);el.setAttribute('aria-pressed',i===id);el.querySelector('.player-label')?.remove();if(i===id)el.insertAdjacentHTML('afterbegin','<span class="player-label">1P</span>')});const f=fighters[id];$('#fighter-name').textContent=f.name;$('#fighter-en').textContent=f.en;$('#fighter-type').textContent=f.type;$('#fighter-style').textContent=f.style;$('.normal-name').textContent=[['电光拳','旋风踢'],['碎岩拳','磐石踢'],['水流掌','燕返踢'],['重雷拳','军靴踢'],['花瓣掌','叶刃踢'],['忍者拳','影袭踢'],['念力掌','浮空踢'],['火花拳','烈焰踢'],['破岩拳','地裂踢'],['冰霜掌','冰刃踢'],['空手劈','回旋踢'],['幽影掌','暗袭踢'],['龙爪拳','龙尾踢'],['疾风拳','反击踢'],['精准拳','弱点踢']][id].join(' / ');$('#fighter-move').textContent=f.move;$('#summon-name').textContent=f.super;$('#pokemon-name').textContent=f.poke+' · '+f.super;$('#partner-size').textContent='图鉴身高 '+POKEMON_HEIGHTS[id]+' m'+(id===1?' · 盘曲登场':'');drawPortrait($('#profile'),id);drawPartnerPortrait($('#pokemon'),id);started=false;paused=false;reset();$('#energy-label').textContent='100%';$('#energy-meter').style.width='100%';$('#status').textContent='已选择 '+f.name+' · 准备迎战';}
document.querySelectorAll('[data-fighter]').forEach(el=>el.onclick=()=>select(+el.dataset.fighter));
let wasPaused=false;function beep(freq=180,duration=.08){if(!muted)sound.tone(freq,duration,.07)}
function updateSoundButtons(){const label=muted?'♪ 开启声音':'♪ 声音已开启';$('#record-sound').textContent=label;$('#sound').innerHTML=muted?'♪ OFF':'♪ ON';$('#sound').setAttribute('aria-label',muted?'开启声音':'静音');$('#audio-enable').hidden=!demo||!muted}
async function enableDemoSound(){muted=false;const ok=await sound.enable();if(!ok)muted=true;updateSoundButtons();}

function start(){if(!assetsReady)return;sound.reset();$('#audio-enable').hidden=true;demo=null;$('#demo-button').textContent='▶ 演示对决';started=true;paused=false;reset();$('#status').textContent='对战进行中 · P 暂停 / 继续';beep(500,.15)}$('#start').onclick=start;
function setCleanView(value){cleanView=value;document.body?.classList.toggle('recording-view',value)}
function startDemo(withSound=true){if(!assetsReady)return;select(0);started=true;paused=false;reset();demo=newDemo();bannerTime=0;p.x=300;e.x=660;if(withSound)enableDemoSound();updateSoundButtons();$('#demo-button').textContent='■ 停止演示';$('#status').textContent='自动演示 · 小智 vs 大木博士 · 循环播放';}
function stopDemo(){sound.reset();$('#audio-enable').hidden=true;demo=null;started=false;paused=false;reset();setCleanView(false);$('#demo-button').textContent='▶ 演示对决';$('#status').textContent='演示已结束 · 可手动对战';}
$('#demo-button').onclick=()=>demo?stopDemo():startDemo();
$('#record-view').onclick=()=>{if(!demo)startDemo();setCleanView(true)};
$('#record-exit').onclick=()=>setCleanView(false);
$('#record-pause').onclick=()=>$('#pause').onclick();
$('#record-restart').onclick=()=>startDemo(!muted);
$('#audio-enable').onclick=()=>startDemo(true);
$('#record-sound').onclick=()=>$('#sound').onclick();
function advanceDemoIntro(dt){
 demo.phaseTime+=dt;
 if(demo.phase==='select'){
  const tick=Math.floor(Math.min(3.1,demo.phaseTime)/.23);if(tick!==demo.selectionTick){demo.selectionTick=tick;beep(740,.035)}
  if(demo.phaseTime>=SELECT_DURATION){demo.phase='countdown';demo.phaseTime=0;demo.cue='3';if(!muted)sound.cue('3');}
 }else{
  const cue=countdownLabel(demo.phaseTime);if(cue!==demo.cue){demo.cue=cue;if(!muted)sound.cue(cue)}
  if(demo.phaseTime>=COUNTDOWN_DURATION){demo.phase='fight';demo.phaseTime=0;demo.elapsed=0;banner='FIGHT!';bannerTime=.35;}
 }
}
function advanceDemo(dt){
 demo.elapsed+=dt;
 let targets=demo.elapsed<8.4?openingTargets(demo):demoTargets(demo.elapsed);
 const upcoming=demo.events[demo.event];if(upcoming&&upcoming.at-demo.elapsed<.35&&demo.elapsed<8.4){const center=(p.x+e.x)/2;targets=[center-40,center+40]}
 const jump=demo.jumps[demo.jumpIndex];if(jump&&demo.elapsed>=jump.at){const a=jump.actor===0?p:e;if(!a.move&&a.stun<=0&&a.y===0){a.vy=330;demo.motions.push({type:'jump',id:a.id,at:demo.elapsed});demo.jumpIndex++}else if(demo.elapsed>jump.at+.3)demo.jumpIndex++;}
 for(const [i,a] of [p,e].entries()){a.guard=false;if(!a.move&&a.stun<=0){const delta=targets[i]-a.x;a.x+=Math.sign(delta)*Math.min(Math.abs(delta),fighters[a.id].speed*.75*dt);if(Math.abs(delta)>1){a.pose='walk';if(demo.elapsed<8.4&&Math.abs(delta)>12&&(!demo.motions.length||demo.elapsed-demo.motions.at(-1).at>.2))demo.motions.push({type:delta*a.dir>0?'advance':'retreat',id:a.id,at:demo.elapsed});}}}
 p.dir=faceOpponent(p.x,e.x,p.dir);e.dir=faceOpponent(e.x,p.x,e.dir);
 const event=demo.events[demo.event];
 if(event&&demo.elapsed>=event.at){const actor=event.actor===0?p:e,target=event.actor===0?e:p;if(event.type==='summon')actor.energy=100;if(attack(actor,target,event.type)){demo.actions.push({id:actor.id,type:event.type,at:demo.elapsed});demo.event++;}}
 if(!event&&demo.elapsed>=demo.finisherAt){
  const counter=demo.finisherIndex%3===1&&p.hp>12,actor=counter?e:p,target=counter?p:e,type=counter?'punch':demo.finisherIndex%2?'punch':'kick';
  if(attack(actor,target,type)){demo.actions.push({id:actor.id,type,at:demo.elapsed});demo.finisherIndex++;demo.finisherAt=demo.elapsed+1.05;}
 }

}
function show(content){keys={};wasPaused=paused;paused=true;$('#modal-content').innerHTML=content;$('#modal').classList.remove('hidden')}function close(){if($('#modal').classList.contains('hidden'))return;$('#modal').classList.add('hidden');paused=wasPaused}$('.close').onclick=close;$('#modal').onclick=ev=>{if(ev.target===$('#modal'))close()};
$('#nav-guide').onclick=()=>show(`<div class="eyebrow">TRAINER'S HANDBOOK</div><h2>先掌握招式，再成为传奇。</h2><p>三局两胜，每局 99 秒。击倒对手，或在倒计时结束时保有更多体力，即可获胜。</p><div class="guide-grid"><div><b>A / D</b>　左右移动<br><b>W</b>　跳跃闪避<br><b>S</b>　防御（减少 80% 伤害）</div><div><b>J / K</b>　直拳 / 回旋踢<br><b>L</b>　属性必杀 · 消耗 20 能量<br><b>I</b>　伙伴召唤 · 消耗 100 能量</div></div><p>普通招式命中和受到攻击会积攒能量。防御时无法攻击；跳跃可以避开低空飞行招式。不同训练家的移动速度、力量和必杀效果不同。P 暂停，Enter 开始，Esc 关闭弹窗。手机可使用擂台下方的触屏按钮。</p>`);
$('#nav-roster').onclick=()=>{$('#roster').scrollIntoView({behavior:'smooth',block:'center'});show(`<div class="eyebrow">KANTO / TRAINER ARCHIVE</div><h2>初代群星，全部集结。</h2><p>点击下方训练家卡片即可选用。每位训练家拥有专属属性招式和召唤伙伴。</p><div class="guide-grid">${Object.entries(fighters).map(([key,f])=>{const i=Number(key);return `<div class="archive-entry"><img src="/assets/trainers/${i}.png" alt="${f.name}"><section><b>${f.name}</b> · ${f.type}<br>${f.style} · ${f.move}<br><span style="color:#818b6c">${f.poke} / ${f.super}</span></section></div>`}).join('')}</div>`)};$('#nav-battle').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
$('#stage-button').onclick=()=>{show(`<div class="eyebrow">SELECT YOUR STAGE</div><h2>下一站，在哪里交手？</h2>${stages.map((s,i)=>`<button class="stage-option" data-stage="${i}"><img src="/assets/stages/${['viridian','cerulean','indigo'][i]}.png" alt="${s.name}场景预览"><span class="stage-option-label">${i===stage?'●':'○'}　${s.name} <span style="float:right;font:12px monospace">${s.en}</span></span></button>`).join('')}`);document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{stage=+b.dataset.stage;$('#stage-label').textContent=stages[stage].name;$('#stage-sub').textContent=stages[stage].sub;close()})};
$('#sound').onclick=async()=>{if(muted){await enableDemoSound()}else{muted=true;sound.stop();updateSoundButtons()}};$('#pause').onclick=()=>{if(started&&!over){paused=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#status').textContent=paused?'已暂停 · P 继续':'对战进行中 · P 暂停 / 继续'}};$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.arena-shell').requestFullscreen()}catch{$('#status').textContent='浏览器暂不支持全屏'}};
window.addEventListener('keydown',ev=>{const k=ev.key.toLowerCase();if(['a','d','w','s','j','k','l','i','p','enter',' '].includes(k)&&!ev.target.closest('button'))ev.preventDefault();if(k==='escape'){if(cleanView)setCleanView(false);else close();return}if(!$('#modal').classList.contains('hidden'))return;if(k==='enter'&&!ev.repeat){start();return}if(k==='p'&&!ev.repeat){$('#pause').click();return}if(demo)return;if(started&&!paused&&!over&&!ev.repeat){const action={j:'punch',k:'kick',l:'special',i:'summon'}[k];if(action)attack(p,e,action)}keys[k]=true});window.addEventListener('keyup',ev=>keys[ev.key.toLowerCase()]=false);window.addEventListener('blur',()=>{keys={};if(started&&!over&&!demo)paused=true});document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=ev=>{ev.preventDefault();b.setPointerCapture(ev.pointerId);keys[b.dataset.key]=true;if(!demo&&started&&!paused&&!over){const action={j:'punch',k:'kick',l:'special',i:'summon'}[b.dataset.key];if(action)attack(p,e,action)}};b.onpointerup=b.onpointercancel=()=>keys[b.dataset.key]=false});
const skillColors=['#efd65c','#b8b69e','#86d5db','#f5d657','#b8d578','#bc92d2','#ddb1e8','#f6a365','#c9b79c','#b4e5eb','#e0b28a','#b190d4','#e7c473','#91d4e2','#cfbfa2'];
let cinematic=null,summons=[],hitstop=0;
function hit(target,damage,source,kind){
 if(target.stun>0||target.hp<=0)return false;
 const blocked=target.guard&&target.y===0;
 target.hp=Math.max(0,target.hp-damage*(blocked?.2:1));if(demo)demo.hits.push({source:source.id,target:target.id,kind:source.attackType||kind||source.move?.type||'projectile',at:demo.elapsed});target.energy=Math.min(100,target.energy+damage*.7);
 target.stun=blocked?.12:.25;target.move=null;target.pose=blocked?'guard':'hurt';
 if(!blocked){if(source.id===4)target.slow=2;if(source.id===5)target.poison=2.5;if(source.id===6)target.stun=.42}
 target.x=Math.max(45,Math.min(915,target.x+source.dir*(blocked?5:18)));
 effects.push({x:target.x,y:355-target.y,life:.28,color:blocked?'#badfd0':'#ffe6a0',type:'hit'});
 shake=blocked?2:6;hitstop=blocked?.025:.065;
 const contact=source.move?.type;
 if(contact==='punch'||contact==='kick'){if(!muted)sound.impact(contact,blocked)}else beep(blocked?100:240,.08);
 if((source===p||source.actor===p)&&!blocked){combo=comboTime>0?combo+1:1;comboTime=1.3}
 if(kind==='poison'&&!blocked)target.hp=Math.max(0,target.hp-2);
 return true;
}
function syncEnergy(){ $('#energy-label').textContent=Math.floor(p.energy)+'%';$('#energy-meter').style.width=p.energy+'%' }
function attack(a,b,type){
 if(!started||paused||over||(demo&&demo.phase!=='fight')||cinematic||a.move||a.cool>0||a.stun>0||a.guard)return false;
 if(type==='summon'){
  if(a.energy<100||summons.length)return false;
  a.energy-=100;a.dir=faceOpponent(a.x,b.x,a.dir);a.pose='command';a.cool=.5;keys={};
  cinematic={owner:a,target:b,id:a.id,elapsed:0,duration:CINEMATIC_DURATION,dir:a.dir};
  bannerTime=0;syncEnergy();beep(620,.28);return true;
 }
 const spec=ATTACKS[type];if(!spec)return false;
 if(type==='special'){if(a.energy<20)return false;a.energy-=20}
 a.move={type,elapsed:0,connected:false,released:false};a.pose=type;a.attack=spec.duration;a.cool=spec.duration;
 syncEnergy();return true;
}
function projectile(a,b,big=false,origin){
 const dir=origin?.dir??a.dir,h=origin?pokemonStageHeight(a.id):0;
 projectiles.push({x:origin?origin.x+dir*Math.min(70,h*.32):a.x+dir*45,y:origin?425-h*.56:350-a.y,dir,owner:a,life:3,big,color:skillColors[a.id],damage:(big?30:12)*fighters[a.id].power});
 beep(big?700:430,big?.4:.14);
}
function advanceMove(a,b,dt){
 if(!a.move)return;
 const move=a.move,spec=ATTACKS[move.type];move.elapsed+=dt;a.attack=Math.max(0,spec.duration-move.elapsed);a.pose=move.type;
 if(move.type==='special'&&move.elapsed>=spec.activeStart&&!move.released){projectile(a,b);move.released=true}
 if(move.type!=='special'&&!move.connected&&move.elapsed>=spec.activeStart&&move.elapsed<spec.activeEnd){
  const reach=spec.reach+([1,3,8].includes(a.id)?18:0);
  if((b.x-a.x)*a.dir>=0&&Math.abs(a.x-b.x)<reach&&Math.abs(a.y-b.y)<65){
   move.connected=hit(b,spec.damage*fighters[a.id].power,a);if(move.connected)a.energy=Math.min(100,a.energy+9);
  }
 }
 if(move.elapsed>=spec.duration){a.move=null;a.pose='idle';a.attack=0}
}
function beginFieldSummon(c){
 const h=pokemonStageHeight(c.id),margin=Math.min(175,Math.max(60,h*.5));
 const targetX=Math.max(margin,Math.min(960-margin,c.owner.x+c.dir*80));
 summons.push({owner:c.owner,target:c.target,id:c.id,elapsed:0,x:c.dir===1?-200:1160,startX:c.dir===1?-200:1160,targetX,dir:c.dir,released:false});
 c.owner.pose='idle';keys={};
}
function advanceSummons(dt){
 for(const s of summons){
  s.elapsed+=dt;const phase=summonPhase(s.elapsed);s.phase=phase;
  if(phase==='enter')s.x=lerp(s.startX,s.targetX,smooth(s.elapsed/SUMMON_TIMING.enter));
  else if(phase==='exit')s.x=lerp(s.targetX,s.startX,smooth((s.elapsed-SUMMON_TIMING.exit)/(SUMMON_TIMING.end-SUMMON_TIMING.exit)));
  else s.x=s.targetX;
  s.dir=faceOpponent(s.x,s.target.x,s.dir);
  if(!s.released&&s.elapsed>=SUMMON_TIMING.release){s.released=true;projectile(s.owner,s.target,true,s);flash=.12;shake=5;banner=fighters[s.id].super;bannerTime=.65}
 }
 summons=summons.filter(s=>s.elapsed<SUMMON_TIMING.end);
}
function update(dt){
 if(!started||paused||over)return;
 if(demo&&(demo.phase==='ko'||demo.phase==='victory')){
  demo.phaseTime+=dt;
  if(demo.phase==='ko'&&demo.phaseTime>=KO_DURATION){demo.phase='victory';demo.phaseTime=0;sound.reset();}
  else if(demo.phase==='victory'&&demo.phaseTime>=VICTORY_DURATION){const cycle=demo.cycle+1;reset();sound.reset();demo=newDemo(cycle);bannerTime=0;p.x=300;e.x=660;}
  return;
 }
 if(demo&&demo.phase!=='fight'){advanceDemoIntro(dt);return;}
 if(cinematic){cinematic.elapsed+=dt;if(cinematic.elapsed>=CINEMATIC_DURATION){beginFieldSummon(cinematic);cinematic=null}syncEnergy();return}
 if(hitstop>0){hitstop=Math.max(0,hitstop-dt);return}
 time=Math.max(0,time-dt);bannerTime-=dt;comboTime-=dt;
 for(const a of[p,e]){
  a.slow=Math.max(0,a.slow-dt);if(a.poison>0){a.poison-=dt;a.hp=Math.max(0,a.hp-dt*1.8)}
  a.cool=Math.max(0,a.cool-dt);a.stun=Math.max(0,a.stun-dt);a.energy=Math.min(100,a.energy+dt*1.6);
  a.vy-=900*dt;a.y=Math.max(0,a.y+a.vy*dt);if(a.y===0)a.vy=0;
  if(!a.move)a.pose=a.stun>0?'hurt':'idle';
 }
 if(demo){advanceDemo(dt);if(cinematic)return;}else{
 p.guard=!!keys.s&&p.y===0&&!p.move&&p.stun<=0;
 if(p.stun<=0){
  const move=(keys.d?1:0)-(keys.a?1:0);
  if(!p.guard&&!p.move){p.x+=move*fighters[p.id].speed*(p.slow>0?.55:1)*dt;if(move)p.pose='walk'}
  if(keys.w&&p.y===0&&!p.guard&&!p.move)p.vy=380;
  for(const [key,type]of[['j','punch'],['k','kick'],['l','special'],['i','summon']])if(keys[key])attack(p,e,type);
 }
 if(cinematic)return;
 aiTick-=dt;
 if(aiTick<=0){
  aiTick=.25+Math.random()*.45;aiAction=Math.random();e.guard=!e.move&&aiAction<.16&&Math.abs(p.x-e.x)<180;
  if(aiAction>.85&&e.y===0&&!e.move)e.vy=370;
  if(aiAction>.94&&e.energy>=100)attack(e,p,'summon');
  else if(aiAction>.7&&Math.abs(p.x-e.x)>180)attack(e,p,'special');
  else if(Math.abs(p.x-e.x)<120&&aiAction>.25)attack(e,p,aiAction>.6?'kick':'punch');
 }
 if(cinematic)return;
 if(!e.guard&&!e.move&&e.stun<=0){const dist=Math.abs(e.x-p.x);if(dist>88){e.x+=e.dir*fighters[e.id].speed*(e.slow>0?.4:.65)*dt;e.pose='walk'}else if(aiAction<.3)e.x-=e.dir*60*dt}
 }
 for(const a of[p,e])a.x=Math.max(45,Math.min(915,a.x));
 // Resolve collision using current positions, then turn immediately after crossings.
 if(Math.abs(p.x-e.x)<48&&Math.abs(p.y-e.y)<70){const center=(p.x+e.x)/2,side=p.x<=e.x?1:-1;p.x=center-side*25;e.x=center+side*25}
 p.dir=faceOpponent(p.x,e.x,p.dir);e.dir=faceOpponent(e.x,p.x,e.dir);
 advanceMove(p,e,dt);advanceMove(e,p,dt);advanceSummons(dt);
 for(const q of projectiles){
  q.x+=q.dir*(q.big?490:[0,3,13].includes(q.owner.id)?560:[4,5].includes(q.owner.id)?250:390)*dt;q.life-=dt;
  const target=q.owner===p?e:p,bottom=425-target.y,top=bottom-TRAINER_HEIGHTS[target.id],radius=q.big?32:14;
  if(Math.abs(q.x-target.x)<(q.big?48:30)&&q.y+radius>=top&&q.y-radius<=bottom){hit(target,q.damage,{id:q.owner.id,dir:q.dir,actor:q.owner,attackType:q.big?'summon':'special'},q.owner.id===5?'poison':'');q.life=0}
 }
 projectiles=projectiles.filter(q=>q.life>0&&q.x>-250&&q.x<1210);effects.forEach(f=>f.life-=dt);effects=effects.filter(f=>f.life>0);
 shake=Math.max(0,shake-dt*35);flash=Math.max(0,flash-dt);
 if(demo&&e.hp<=0){
  e.hp=0;e.move=null;e.pose='hurt';p.move=null;p.pose='idle';cinematic=null;summons=[];projectiles=[];effects=[];hitstop=0;shake=0;
  demo.phase='ko';demo.phaseTime=0;demo.winner=0;bannerTime=0;$('#status').textContent='K.O. · 小智获胜';beep(130,.4);syncEnergy();return;
 }
 if(p.hp<=0||e.hp<=0||time<=0){
  over=true;cinematic=null;summons=[];const winner=p.hp===e.hp?-1:p.hp>e.hp?0:1;if(winner>=0)wins[winner]++;
  banner=winner<0?'DRAW · 平局':winner===0?'YOU WIN · 你赢了！':'YOU LOSE · 再接再厉';bannerTime=999;
  $('#status').textContent=Math.max(...wins)>=2?'比赛结束 · '+(wins[0]>=2?'恭喜获得胜利！':'继续挑战，成为最强训练家！'):'本局结束 · 点击进入下一回合';
  $('#start').textContent=Math.max(...wins)>=2?'再战一场 ↻':'下一回合 →';
  $('#start').onclick=()=>{if(Math.max(...wins)>=2)start();else{round++;reset(false);$('#status').textContent='对战进行中 · P 暂停 / 继续'}$('#start').onclick=start};
 }
 syncEnergy();
}
function txt(text,x,y,size,color='#edf1d4',align='left',font='monospace'){ctx.fillStyle=color;ctx.font=`bold ${size}px ${font}`;ctx.textAlign=align;ctx.fillText(text,x,y)}
function roundedBox(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function hud(){
  const shadow=ctx.createLinearGradient(0,0,0,112);shadow.addColorStop(0,'#0a2037dd');shadow.addColorStop(1,'#0a203700');ctx.fillStyle=shadow;ctx.fillRect(0,0,960,112);
  for(const [a,right] of [[p,false],[e,true]]){
    const x=right?563:27;const tint=right?'#75cbf1':'#ffcc6a';
    txt(demo?'CPU':right?'CPU':'1P',right?931:28,28,11,tint,right?'right':'left');
    txt(fighters[a.id].name,right?895:63,29,20,'#fff',right?'right':'left','"Noto Sans SC", sans-serif');
    roundedBox(x,39,370,19,4,'#122b3dcc','#d7e3e777');
    const bar=ctx.createLinearGradient(0,41,0,55);bar.addColorStop(0,a.hp>30?'#def893':'#ffb191');bar.addColorStop(1,a.hp>30?'#88ce62':'#e45953');
    roundedBox(right?x+367-364*a.hp/100:x+3,42,364*a.hp/100,13,2,bar);
    txt(fighters[a.id].en,right?897:63,73,9,'#dce7ed',right?'right':'left');
    for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(right?928-i*14:32+i*14,69,3.5,0,Math.PI*2);ctx.fillStyle=wins[right?1:0]>i?tint:'#8399a480';ctx.fill()}
    const ex=right?732:28;roundedBox(ex,463,200,9,4,'#0c2949b3');roundedBox(right?ex+198-196*a.energy/100:ex+2,465,196*a.energy/100,5,2,tint);
    txt(a.energy>=100?'伙伴召唤 READY':'羁绊能量 '+Math.floor(a.energy)+'%',right?930:29,455,10,'#f9faf4',right?'right':'left','sans-serif');
  }
  roundedBox(443,14,74,64,10,'#102c40de','#e3eddf99');txt(String(Math.ceil(time)).padStart(2,'0'),480,56,39,'#fff3d5','center','"Barlow Condensed", sans-serif');txt('TIME',480,70,8,'#b5ced6','center');
  txt('KANTO LEAGUE  /  '+stages[stage].en,480,482,8,'#e7edf1','center');
}
let sceneTime=0;
function render(now){
 const dt=Math.min(.035,(now-last)/1000||.016);last=now;if(!paused)sceneTime+=dt;const t=sceneTime;
 ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,960,498);
 if(!assetsReady){requestAnimationFrame(render);return}
 update(dt);sound.update({enabled:!muted,paused,fighting:!!demo&&demo.phase==='fight',victory:demo?.phase==='victory',duck:!!cinematic});ctx.save();if(shake>0)ctx.translate(Math.sin(t*90)*shake,Math.cos(t*70)*shake*.5);drawStage(ctx,stage,t);
 for(const a of[p,e]){
  drawShadow(ctx,a.x,426,Math.max(20,48-a.y*.07),.32);
  if(demo?.phase==='ko'&&a===e){const fall=smooth(Math.min(1,demo.phaseTime/1.1));ctx.save();ctx.translate(a.x,415);ctx.rotate(fall*Math.PI/2);drawTrainer(ctx,a.id,0,0,undefined,a.dir,'hurt',t,0,false,0);ctx.restore();}
  else drawTrainer(ctx,a.id,a.x,425-a.y,undefined,a.dir,a.y>0&&!a.move?'jump':a.pose,t,a.stun,a.guard,a.move?.elapsed??0);
  if(a.guard){ctx.save();ctx.strokeStyle='#bcefffaa';ctx.shadowColor='#70d6fa';ctx.shadowBlur=15;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(a.x+a.dir*24,358-a.y,33,64,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(a.slow>0||a.poison>0){txt(a.poison>0?'中毒':'减速',a.x,224-a.y,10,a.poison>0?'#e5b2f4':'#b8f0fa','center','sans-serif')}
 }
 for(const q of projectiles)drawProjectile(ctx,q,t);
 for(const f of effects)drawHit(ctx,f);
 for(const s of summons)drawSummon(ctx,s,t);
 ctx.restore();hud();
 if((bannerTime>0||paused)&&!cinematic){
  const text=paused?'PAUSED · 已暂停':banner;
  const w=started?490:390,x=480-w/2;
  roundedBox(x,123,w,53,7,'#102c3cd9','#e9f1e155');
  txt(text,480,157,started?23:22,'#fff3d8','center','"Noto Sans SC", sans-serif');
  if(!started){txt('点击「开始对战」或按 ENTER',480,198,11,'#fff5dc','center','sans-serif')}
 }
 if(comboTime>0&&combo>1){txt(String(combo),65,168,42,'#fff0a0');txt('HIT COMBO',66,188,12,'#fff4db')}
 if(flash>0){ctx.fillStyle=`rgba(249,240,191,${flash*2})`;ctx.fillRect(0,0,960,498)}
 if(cinematic)drawCinematic(ctx,cinematic,fighters[cinematic.id]);
 if(demo&&demo.phase==='fight'&&demo.elapsed<.6){ctx.fillStyle=`rgba(6,18,26,${1-demo.elapsed/.6})`;ctx.fillRect(0,0,960,498);}
 if(demo?.phase==='ko'){txt('K.O.',480,230,80,'#ffcd70');txt('小智获胜',480,273,22);}
 if(demo?.phase==='victory')drawVictory(ctx,demo);
 if(demo?.phase==='select')drawSelection(ctx,demo,fighters);
 if(demo?.phase==='countdown')drawCountdown(ctx,demo);
 if(demo&&demo.phase!=='fight'&&paused){roundedBox(355,12,250,42,8,'#132535ee');txt('已暂停 · P 继续',480,40,16);}
 if(cinematic&&paused){roundedBox(355,211,250,55,8,'#132535ee');txt('已暂停 · P 继续',480,246,20,'#fff','center','sans-serif')}
 canvas.dataset.audio=JSON.stringify({enabled:!muted,state:sound.context?.state??'locked',scoreReady:!!sound.score,voiceReady:['three','two','one','fight'].filter(k=>sound.buffers?.[k]).length,musicTrack:sound.trackName,musicReady:!!sound.buffers?.battle&&!!sound.buffers?.victory});
 canvas.dataset.battle=JSON.stringify({demo:demo?{phase:demo.phase,phaseTime:demo.phaseTime,seed:demo.seed,motions:demo.motions,cycle:demo.cycle,elapsed:demo.elapsed,event:demo.event,actions:demo.actions,hits:demo.hits}:null,phase:demo&&demo.phase!=='fight'?demo.phase:cinematic?'cinematic':summons.length?'summon':'fight',cinematicTime:cinematic?.elapsed??0,fieldPokemon:summons.length,summons:summons.map(s=>({id:s.id,phase:s.phase??'enter',dir:s.dir,height:pokemonStageHeight(s.id)})),player:{id:p.id,x:p.x,y:p.y,dir:p.dir,move:p.move?.type??null,frame:attackFrame(p.move?.type,p.move?.elapsed??0),hp:p.hp},enemy:{id:e.id,x:e.x,y:e.y,dir:e.dir,hp:e.hp},time,paused});
 requestAnimationFrame(render)
}
async function prepareArt(){
 $('#asset-retry').hidden=true;
 $('#start').disabled=true;
 try{
  await loadArt((done,total)=>{$('#asset-progress').textContent=`训练家 · 宝可梦 · 道馆  ${done} / ${total}`});
  assetsReady=true;$('#asset-loading').hidden=true;$('#start').disabled=false;
  if(window.location?.search.includes('demo=1')){startDemo(false);if(window.location.search.includes('clean=1'))setCleanView(true)}
  document.querySelectorAll('[data-portrait]').forEach(el=>drawPortrait(el,+el.dataset.portrait));
  drawPortrait($('#profile'),chosen);drawPartnerPortrait($('#pokemon'),chosen);
 }catch(error){$('#asset-progress').textContent=error.message;$('#asset-retry').hidden=false;$('#status').textContent='素材加载未完成 · 点击重新加载'}
}
$('#asset-retry').onclick=prepareArt;
select(0);prepareArt();requestAnimationFrame(render);
