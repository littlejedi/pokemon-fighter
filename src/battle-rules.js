// Stable asset IDs: removed Elite Four IDs are deliberately not reused.
export const ACTIVE_FIGHTER_IDS=[0,1,2,3,4,5,6,7,8,13,14];
// Animation timing is also the authoritative combat timing.
export const ATTACKS = Object.freeze({
 punch:{duration:.48,activeStart:.18,activeEnd:.28,reach:100,damage:6,frames:[0,1,2,3,4,5],times:[0,.055,.12,.18,.28,.37]},
 kick:{duration:.7,activeStart:.3,activeEnd:.42,reach:132,damage:9,frames:[6,7,8,9,10,11],times:[0,.105,.21,.3,.42,.55]},
 special:{duration:.65,activeStart:.24,activeEnd:.3,frames:[0,1,2,3,4,5],times:[0,.09,.17,.24,.35,.48]}
});
export const CINEMATIC_DURATION=3.2;
export const SUMMON_TIMING={enter:.38,release:.72,exit:1.22,end:1.72};
export const POKEMON_IDS=[25,95,121,26,45,110,65,126,112,131,68,94,149,9,128];
export const POKEMON_HEIGHTS=[.4,8.8,1.1,.8,1.2,1.2,1.5,1.3,1.9,2.5,1.6,1.5,2.2,1.6,1.4];
export const PIXELS_PER_METER=106;
export const TRAINER_HEIGHTS=[180,194,179,207,178,190,186,180,197,190,205,161,199,184,190];
// Onix's 8.8m measures its long serpentine body; its coiled stance rises 3m.
export function pokemonStageHeight(id){return (id===1?3:POKEMON_HEIGHTS[id])*PIXELS_PER_METER}
export function faceOpponent(x,targetX,previous=1){return x===targetX?previous:targetX>x?1:-1}
export function attackFrame(type,elapsed){const spec=ATTACKS[type];if(!spec||elapsed<0||elapsed>=spec.duration)return 0;let index=0;for(let i=0;i<spec.times.length;i++)if(elapsed>=spec.times[i])index=i;return spec.frames[index]}
export function attackPhase(type,elapsed){const spec=ATTACKS[type];if(!spec||elapsed>=spec.duration)return'idle';return elapsed<spec.activeStart?'startup':elapsed<spec.activeEnd?'active':'recovery'}
export function summonPhase(elapsed){return elapsed<SUMMON_TIMING.enter?'enter':elapsed<SUMMON_TIMING.release?'charge':elapsed<SUMMON_TIMING.exit?'release':elapsed<SUMMON_TIMING.end?'exit':'done'}
export function lerp(a,b,t){return a+(b-a)*Math.max(0,Math.min(1,t))}
export function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
