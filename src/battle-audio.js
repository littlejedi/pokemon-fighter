// Original local music recordings and countdown speech; one audio context for the entire game.
export class BattleAudio{
 constructor(){this.context=null;this.master=null;this.score=null;this.buffers={};this.voices=new Set();this.musicStart=null;this.position=0;this.trackName=null;this.musicGain=null;this.ready=this.load();}
 async load(){try{const files={three:'three.wav',two:'two.wav',one:'one.wav',fight:'fight.wav',battle:'trainer-battle-original.mp3',victory:'trainer-victory-original.mp3'};this.raw=await Promise.all(Object.entries(files).map(async([key,file])=>{const response=await fetch(`/assets/audio/${file}`);if(!response.ok)throw Error(`Audio unavailable: ${file}`);return [key,await response.arrayBuffer()]}));this.score={type:'original-game-recording'};}catch(e){this.error=e.message}}
 async enable(){try{this.context??=new(window.AudioContext||window.webkitAudioContext)();if(!this.master){this.master=this.context.createGain();this.master.gain.value=.65;this.master.connect(this.context.destination);this.musicGain=this.context.createGain();this.musicGain.gain.value=.5;this.musicGain.connect(this.master)}await this.context.resume();await this.ready;for(const [key,data]of this.raw||[])if(!this.buffers[key])this.buffers[key]=await this.context.decodeAudioData(data.slice(0));return this.context.state==='running'&&!!this.buffers.battle&&!!this.buffers.victory}catch{return false}}
 track(node){this.voices.add(node);node.onended=()=>this.voices.delete(node);return node}
 stopMusic(){if(this.musicStart!==null)this.position=this.context.currentTime-this.musicStart;if(this.musicSource){try{this.musicSource.stop()}catch{}this.voices.delete(this.musicSource);this.musicSource=null;}this.musicStart=null}
 stop(){this.stopMusic();for(const n of this.voices){try{n.stop()}catch{}}this.voices.clear();this.musicStart=null}
 reset(){this.stop();this.position=0;this.trackName=null}
 tone(freq,duration=.1,gain=.08,type='square',when){if(!this.context||this.context.state!=='running')return;const t=when??this.context.currentTime,o=this.track(this.context.createOscillator()),g=this.context.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.02,duration));o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02)}
 impact(kind='punch',blocked=false){
  if(!this.context||this.context.state!=='running')return;
  const ctx=this.context,t=ctx.currentTime,kick=kind==='kick',duration=blocked?.065:kick?.14:.105;
  // A sharp filtered noise transient followed by a low body thump.
  if(!this.impactNoise){this.impactNoise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.16),ctx.sampleRate);const data=this.impactNoise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
  const noise=this.track(ctx.createBufferSource()),filter=ctx.createBiquadFilter(),snap=ctx.createGain();noise.buffer=this.impactNoise;
  filter.type='bandpass';filter.frequency.value=blocked?650:kick?1400:2200;filter.Q.value=.65;
  snap.gain.setValueAtTime(blocked?.16:kick?.43:.38,t);snap.gain.exponentialRampToValueAtTime(.0001,t+duration*.65);
  noise.connect(filter);filter.connect(snap);snap.connect(this.master);noise.start(t);noise.stop(t+duration);
  const thump=this.track(ctx.createOscillator()),body=ctx.createGain();thump.type='sine';thump.frequency.setValueAtTime(blocked?130:kick?150:190,t);thump.frequency.exponentialRampToValueAtTime(blocked?75:kick?45:65,t+duration);
  body.gain.setValueAtTime(0,t);body.gain.linearRampToValueAtTime(blocked?.12:kick?.45:.33,t+.003);body.gain.exponentialRampToValueAtTime(.0001,t+duration);
  thump.connect(body);body.connect(this.master);thump.start(t);thump.stop(t+duration+.01);
 }
 cue(value){if(!this.context||this.context.state!=='running')return;const key={3:'three',2:'two',1:'one',FIGHT:'fight'}[value],buffer=this.buffers[key];if(buffer){const n=this.track(this.context.createBufferSource()),g=this.context.createGain();n.buffer=buffer;g.gain.value=1.1;n.connect(g);g.connect(this.master);n.start()};if(value==='FIGHT'){[261.63,329.63,392,523.25].forEach((f,i)=>this.tone(f,.3,.09,'square',this.context.currentTime+i*.065))}else this.tone(440+Number(value)*110,.16,.05)}
 update({enabled,paused,fighting,victory=false,duck=false}){
 if(!this.context)return;this.master.gain.setTargetAtTime(enabled?.65:0,this.context.currentTime,.025);
 const desired=victory?'victory':fighting?'battle':null;
 if(desired!==this.trackName){this.stopMusic();this.position=0;this.trackName=desired;}
 if(!enabled||paused||!desired||!this.buffers[desired]){if(this.musicStart!==null||paused)this.stop();return}
 this.musicGain.gain.setTargetAtTime(duck?.2:.5,this.context.currentTime,.15);
 if(this.musicStart===null){const buffer=this.buffers[desired],offset=this.position%buffer.duration,n=this.track(this.context.createBufferSource());this.musicSource=n;n.buffer=buffer;n.loop=true;n.connect(this.musicGain);n.start(0,offset);this.musicStart=this.context.currentTime-offset;}
 }
}
