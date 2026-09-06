// Frame selection shared by the game and the pose inspection page.
export function atlasFrame(atlas,pose,time=0){
 const clip=atlas.animations?.[pose]||atlas.animations?.idle;if(!clip)return 0;
 const t=clip.loop?((time%clip.duration)+clip.duration)%clip.duration:Math.max(0,Math.min(time,clip.duration));
 let index=0;for(let i=1;i<clip.times.length;i++){if(clip.times[i]>t+1e-7)break;index=i}
 return clip.frames[index];
}
