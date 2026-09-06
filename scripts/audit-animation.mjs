import {ACTIVE_FIGHTER_IDS} from '../src/battle-rules.js';
import {readFileSync,existsSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('assets/meta/atlases.json'));
const failures=[];
for(const id of ACTIVE_FIGHTER_IDS){
 const trainer=manifest.trainers[id],partner=manifest.partners[id];
 if(!trainer||!existsSync('.'+trainer.path))failures.push(`Trainer ${id}: side-view sprite atlas missing`);
 else {if(trainer.animations?!['punch','kick'].every(name=>trainer.animations[name]?.frames.length>=6):trainer.frames.length!==12)failures.push(`Trainer ${id}: expected 12 limb-animation frames`);if(!trainer.reviewed)failures.push(`Trainer ${id}: visual pose review missing`)}
 if(!partner||!existsSync('.'+partner.path))failures.push(`Partner ${id}: side-view texture missing`);
 else if(!partner.reviewed)failures.push(`Partner ${id}: facing review missing`);
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}else console.log('All 11 trainer animations and 11 partner profiles are present and visually reviewed.');
