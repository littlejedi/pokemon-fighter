import {readFile,writeFile} from 'node:fs/promises';
const source=await readFile('assets/audio/source/trainerbattle.asm','utf8'),channels=[];
for(const chunk of source.split(/Music_TrainerBattle_Ch\d+::/).slice(1)){
 let t=0,octave=3,speed=12,volume=10,loopStart=0;const events=[];
 for(const raw of chunk.split('\n')){const line=raw.trim();let m;
 if(line==='.mainloop:')loopStart=t;
 if(m=line.match(/^octave (\d+)/))octave=+m[1];
 if(m=line.match(/^note_type (\d+), (\d+)/)){speed=+m[1];volume=+m[2]}
 if(m=line.match(/^(?:note ([A-G][#_]), |rest )(\d+)/)){const duration=+m[2]*112*speed/(256*60);if(m[1]){const pitch={C_:0,'C#':1,D_:2,'D#':3,E_:4,F_:5,'F#':6,G_:7,'G#':8,A_:9,'A#':10,B_:11}[m[1]];events.push([+t.toFixed(5),(octave+1)*12+pitch,+duration.toFixed(5),volume/15])}t+=duration}
 }
 channels.push({events,duration:+t.toFixed(5),loopStart:+loopStart.toFixed(5)});
}
await writeFile('assets/audio/trainer-battle.json',JSON.stringify({title:'Pokémon Red/Blue — Trainer Battle',source:'https://github.com/pret/pokered/blob/master/audio/music/trainerbattle.asm',arrangement:'Simplified pulse/pulse/triangle playback; original note sequence',channels})+'\n');
console.log(channels.map(c=>({notes:c.events.length,duration:c.duration,loopStart:c.loopStart})));
