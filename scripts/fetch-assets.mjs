import { mkdir, writeFile } from 'node:fs/promises';
const names=['ash','brock','misty','lt_surge','erika','koga','sabrina','blaine','giovanni_classic','lorelei','bruno','agatha','lance','blue_classic','oak'];
const ids=[25,95,121,26,45,110,65,126,112,131,68,94,149,9,128];
const base='https://raw.githubusercontent.com/jonbarrow/trainercards.studio/master/public/images/trainers/masters/';
const entries=[];
for(let i=0;i<names.length;i++){
 for(const pose of['','_2'])entries.push({path:`assets/trainers/${i}${pose}.png`,url:base+names[i]+pose+'.png',kind:'trainer',id:i});
 entries.push({path:`assets/pokemon/${ids[i]}.png`,url:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${ids[i]}.png`,kind:'pokemon',id:ids[i]});
}
for(let batch=0;batch<entries.length;batch+=6)await Promise.all(entries.slice(batch,batch+6).map(async item=>{const response=await fetch(item.url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`${item.path}: ${response.status}`);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error(`Invalid PNG: ${item.path}`);await writeFile(item.path,bytes);console.log(`${item.path} ${bytes.length}`)}));
await writeFile('assets/meta/sources.json',JSON.stringify(entries,null,2)+'\n');
