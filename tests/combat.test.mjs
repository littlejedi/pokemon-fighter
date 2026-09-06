import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as rules from '../src/battle-rules.js';
import * as demoRules from '../src/demo.js';
const source=readFileSync('src/main.js','utf8').replace(/^import .*?;\n/gm,'').replace('select(0);prepareArt();requestAnimationFrame(render);','select(0);assetsReady=true;');
function game(){
 const nodes=new Map(),canvas=new Proxy({},{get:()=>()=>{}});
 const node=()=>({style:{},dataset:{},textContent:'',innerHTML:'',classList:{add(){},remove(){},contains(){return true},toggle(){}},getContext:()=>canvas,setAttribute(){},querySelector(){return null}});
 const doc={querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll:()=>[]};
 const context=vm.createContext({...rules,...demoRules,BattleAudio:class{reset(){}stop(){}tone(){}impact(){}cue(){}update(){}async enable(){return true}},document:doc,window:{addEventListener(){}},requestAnimationFrame(){},drawPortrait(){},drawPartnerPortrait(){},console,Math});
 vm.runInContext(source,context);vm.runInContext('start();aiTick=9999;',context);return code=>vm.runInContext(code,context);
}
test('11 trainers retain unique partners and super moves; Elite Four are unavailable',()=>{const run=game();assert.equal(run('Object.keys(fighters).length'),11);assert.equal(run('new Set(Object.values(fighters).map(f=>f.super)).size'),11);for(const id of [9,10,11,12]){assert.equal(run(`fighters[${id}]`),undefined);run(`select(${id})`);assert.equal(run('chosen'),0)};run('select(13)');assert.equal(run('fighters[p.id].poke'),'水箭龟');assert.equal(run('e.id'),14);run('select(14)');assert.equal(run('fighters[p.id].poke'),'肯泰罗')});
test('punch waits for contact frame, hits once, gains energy and cannot cancel recovery',()=>{
 const run=game();run('e.x=p.x+70;p.energy=50;attack(p,e,"punch");advanceMove(p,e,.17)');assert.equal(run('e.hp'),100);
 assert.equal(run('attackFrame(p.move.type,p.move.elapsed)'),2);
 run('advanceMove(p,e,.02)');assert.equal(run('e.hp'),94);assert.equal(run('p.energy'),59);assert.equal(run('attackFrame(p.move.type,p.move.elapsed)'),3);
 run('advanceMove(p,e,.05)');assert.equal(run('e.hp'),94);assert.equal(run('attack(p,e,"kick")'),false);
 run('advanceMove(p,e,.3)');assert.equal(run('p.move'),null);
});
test('kick uses separate windup/contact/recovery frames and damage window',()=>{const run=game();run('e.x=p.x+110;attack(p,e,"kick");advanceMove(p,e,.25)');assert.equal(run('e.hp'),100);assert.equal(run('attackFrame(p.move.type,p.move.elapsed)'),8);run('advanceMove(p,e,.06)');assert.equal(run('e.hp'),91);assert.equal(run('attackFrame(p.move.type,p.move.elapsed)'),9)});
test('range, facing and guarding affect contact damage',()=>{
 for(const scenario of ['e.x=p.x+200','e.x=p.x-70']){const run=game();run(scenario+';attack(p,e,"punch");advanceMove(p,e,.2)');assert.equal(run('e.hp'),100)}
 const run=game();run('e.x=p.x+70;e.guard=true;attack(p,e,"punch");advanceMove(p,e,.2)');assert.equal(run('e.hp'),98.8);
});
test('taking a hit interrupts an uncommitted attack',()=>{const run=game();run('e.x=p.x+70;attack(p,e,"punch");advanceMove(p,e,.1);hit(p,5,e);advanceMove(p,e,.2)');assert.equal(run('e.hp'),100);assert.equal(run('p.move'),null)});
test('crossing above opponent reverses both facings in the same update',()=>{const run=game();run('p.x=700;e.x=650;p.y=120;p.vy=0;update(.001)');assert.equal(run('p.dir'),-1);assert.equal(run('e.dir'),1);run('p.x=600;update(.001)');assert.equal(run('p.dir'),1);assert.equal(run('e.dir'),-1)});
test('summon consumes full energy once, freezes battle during 3.2 second cutscene',()=>{
 const run=game();run('p.energy=99');assert.equal(run('attack(p,e,"summon")'),false);run('p.energy=100;attack(p,e,"summon")');assert.equal(run('p.energy'),0);assert.equal(run('summons.length'),0);assert.equal(run('projectiles.length'),0);
 const time=run('time'),x=run('e.x');run('update(1);update(1);update(1)');assert.equal(run('time'),time);assert.equal(run('e.x'),x);assert.equal(run('cinematic.elapsed'),3);assert.equal(run('e.hp'),100);assert.equal(run('attack(p,e,"punch")'),false);assert.equal(run('attack(e,p,"summon")'),false);
 run('update(.21)');assert.equal(run('cinematic'),null);assert.equal(run('summons.length'),1);assert.equal(run('projectiles.length'),0);
});
test('partner enters, charges, fires exactly once, exits and stays absent',()=>{
 const run=game();assert.equal(run('summons.length'),0);run('attack(p,e,"summon");update(3.21);advanceSummons(.4)');assert.equal(run('summons[0].phase'),'charge');assert.equal(run('projectiles.length'),0);
 run('advanceSummons(.33)');assert.equal(run('projectiles.length'),1);assert.equal(run('projectiles[0].big'),true);
 run('advanceSummons(.15)');assert.equal(run('projectiles.length'),1);run('advanceSummons(.4)');assert.equal(run('summons[0].phase'),'exit');run('advanceSummons(.5)');assert.equal(run('summons.length'),0);assert.equal(run('projectiles.length'),1);
});
test('summoned partner turns to its opponent after a crossing',()=>{const run=game();run('attack(p,e,"summon");update(3.21);advanceSummons(.4);e.x=summons[0].x-80;advanceSummons(.01)');assert.equal(run('summons[0].dir'),-1)});
test('projectile damage occurs after cinematic and on actual collision',()=>{const run=game();run('attack(p,e,"summon");update(3.21);advanceSummons(.73);projectiles[0].x=e.x;update(.001)');assert.equal(run('e.hp'),70)});
test('pause freezes cutscene and switching trainer cancels all summon state',()=>{const run=game();run('attack(p,e,"summon");update(.5);paused=true;update(2)');assert.equal(run('cinematic.elapsed'),.5);run('select(2)');assert.equal(run('cinematic'),null);assert.equal(run('summons.length'),0);assert.equal(run('p.energy'),100);assert.equal(run('started'),false)});
test('pause and best-of-three round progression remain correct',()=>{const run=game();run('paused=true;update(1)');assert.equal(run('time'),99);run('paused=false;e.hp=0;update(.01)');assert.equal(run('wins[0]'),1);run('document.querySelector("#start").onclick()');assert.equal(run('round'),2);assert.equal(run('wins[0]'),1);run('e.hp=0;update(.01)');assert.equal(run('wins[0]'),2);run('document.querySelector("#start").onclick()');assert.equal(run('round'),1);assert.equal(run('wins[0]'),0)});
test('grass and poison effects survive the timing changes',()=>{const run=game();run('p.id=4;hit(e,5,p)');assert.equal(run('e.slow'),2);run('e.stun=0;p.id=5;hit(e,5,p);hitstop=0;update(.1)');assert.ok(run('e.poison')>0);assert.ok(run('e.hp')<90)});
test('default opponent is Oak, and choosing Oak assigns Ash',()=>{const run=game();assert.equal(run('e.id'),14);run('select(14)');assert.equal(run('e.id'),0)});
test('demo completes both fighters punches, kicks, specials and summons before looping',()=>{
 const run=game();run('startDemo()');assert.equal(run('p.id'),0);assert.equal(run('e.id'),14);
 run('for(let i=0;i<3200&&demo.elapsed<26;i++)update(1/60)');
 const actions=JSON.parse(run('JSON.stringify(demo.actions)')),hits=JSON.parse(run('JSON.stringify(demo.hits)'));
 for(const id of [0,14]){for(const type of ['punch','kick','special','summon'])assert.ok(actions.some(a=>a.id===id&&a.type===type),`${id} ${type}`);for(const kind of ['punch','kick','special','summon'])assert.ok(hits.some(h=>h.source===id&&h.kind===kind),`${id} hits with ${kind}`)}
 assert.equal(run('demo.event'),14);assert.ok(run('p.hp')>0);assert.ok(run('e.hp')>0);
 run('for(let i=0;i<3000&&demo.cycle===1;i++)update(1/60)');assert.equal(run('demo.cycle'),2);assert.equal(run('p.hp'),100);assert.equal(run('e.hp'),100);
});
test('demo pause freezes sequence and clean-view exit preserves it',()=>{const run=game();run('startDemo();update(.1);paused=true');const t=run('demo.elapsed');run('update(1)');assert.equal(run('demo.elapsed'),t);run('setCleanView(true);setCleanView(false)');assert.equal(run('demo.elapsed'),t);run('stopDemo()');assert.equal(run('demo'),null);assert.equal(run('started'),false)});
test('selection and countdown freeze combat, then start fighting',()=>{const run=game();run('startDemo(false)');assert.equal(run('demo.phase'),'select');assert.equal(run('attack(p,e,"punch")'),false);run('update(4.81)');assert.equal(run('demo.phase'),'countdown');assert.equal(run('demo.cue'),'3');assert.equal(run('time'),99);run('update(1)');assert.equal(run('demo.cue'),'2');run('update(1)');assert.equal(run('demo.cue'),'1');run('update(1)');assert.equal(run('demo.cue'),'FIGHT');run('update(.71)');assert.equal(run('demo.phase'),'fight');assert.equal(run('demo.elapsed'),0);assert.equal(run('p.hp'),100)});
test('seeded openings vary order and positions, with jumps and timely summons',()=>{for(const seed of [1,25,2026,9999]){const run=game();run(`startDemo(false);demo=newDemo(1,${seed})`);run('for(let i=0;i<3000&&demo.elapsed<26;i++)update(1/60)');assert.equal(run('demo.event'),14);assert.ok(run('demo.motions.some(m=>m.type==="jump")'));assert.ok(run('demo.motions.some(m=>m.type==="retreat")'));assert.ok(run('demo.motions.some(m=>m.type==="advance")'));assert.ok(run('demo.actions.find(a=>a.type==="summon").at')<13.1)}});
test('demo reaches actual Oak KO, holds zero HP during fall and victory, then loops',()=>{
 for(const seed of [1,5,25,42,2026,40000]){
  const run=game();run(`startDemo(false);demo=newDemo(1,${seed})`);
  run('for(let i=0;i<5000&&demo.phase!=="ko";i++)update(1/60)');
  assert.equal(run('demo.phase'),'ko',`seed ${seed}`);assert.equal(run('e.hp'),0);assert.ok(run('p.hp')>0);assert.equal(run('demo.winner'),0);
  assert.ok(run('demo.hits.at(-1).source')===0);assert.equal(run('demo.event'),14);assert.ok(run('demo.finisherIndex')>0);assert.equal(run('attack(p,e,"punch")'),false);
  const time=run('time');run('paused=true;update(4)');assert.equal(run('demo.phaseTime'),0);run('paused=false;update(2.21)');assert.equal(run('demo.phase'),'victory');assert.equal(run('time'),time);assert.equal(run('e.hp'),0);
  run('update(6.5)');assert.equal(run('demo.phase'),'victory');assert.equal(run('e.hp'),0);run('update(.6)');assert.equal(run('demo.phase'),'select');assert.equal(run('demo.cycle'),2);assert.equal(run('e.hp'),100);
 }
});
