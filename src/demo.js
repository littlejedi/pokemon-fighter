export const KO_DURATION=2.2;
export const VICTORY_DURATION=7;
export const SELECT_DURATION=4.8;
export const COUNTDOWN_DURATION=3.7;
export const DEMO_EVENTS=[
 {at:1.8,actor:0,type:'punch'},{at:2.8,actor:1,type:'punch'},
 {at:3.9,actor:0,type:'kick'},{at:5.1,actor:1,type:'kick'},
 {at:6.3,actor:0,type:'punch'},{at:7.4,actor:1,type:'punch'},
 {at:10,actor:0,type:'special'},{at:11.5,actor:1,type:'special'},
 {at:13,actor:0,type:'summon'},{at:16,actor:1,type:'summon'},
 {at:21,actor:0,type:'kick'},{at:22.2,actor:1,type:'punch'},
 {at:23.3,actor:1,type:'kick'},{at:24.5,actor:0,type:'punch'}
];
export function demoTargets(t){return t<8.4||t>=19?[434,514]:[270,690]}
export function randomSource(seed){let state=seed>>>0;return()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296}}
export function newDemo(cycle=1,seed=Math.floor(Math.random()*4294967296)){
 const rand=randomSource(seed),order=rand()<.5?[0,1]:[1,0],first=rand()<.5?'punch':'kick';
 const types=[first,first,first==='punch'?'kick':'punch',first==='punch'?'kick':'punch',rand()<.5?'punch':'kick',rand()<.5?'punch':'kick'];
 const events=DEMO_EVENTS.map((e,i)=>i<6?{...e,at:e.at+(rand()-.5)*.22,actor:order[i%2],type:types[i]}:{...e});
 const movement=Array.from({length:17},(_,i)=>({at:i*.45,center:474+(rand()-.5)*75,gap:70+rand()*65}));
 const jumps=[{at:.5+rand()*.25,actor:order[0]},{at:5.7,actor:order[1]}];
 return {phase:'select',phaseTime:0,cue:null,selectionTick:-1,elapsed:0,event:0,cycle,seed,events,movement,jumps,jumpIndex:0,actions:[],hits:[],motions:[],finisherAt:26,finisherIndex:0};
}
export function openingTargets(d){const beat=d.movement[Math.min(d.movement.length-1,Math.floor(d.elapsed/.45))];return [beat.center-beat.gap/2,beat.center+beat.gap/2]}
export function countdownLabel(t){return t<1?'3':t<2?'2':t<3?'1':'FIGHT'}
export function selectionAt(t){const ids=[0,1,2,3,4,5,6,7,8,13,14],tick=Math.floor(t/.23);return {left:t>=2.1?0:ids[tick%ids.length],right:t>=3.1?14:ids[(tick*3+4)%ids.length],leftLocked:t>=2.1,rightLocked:t>=3.1}}
