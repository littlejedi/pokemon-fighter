import {writeFile} from 'node:fs/promises';
const ids=[25,95,121,26,45,110,65,126,112,131,68,94,149,9,128];
const records=[];
for(const id of ids){const url=`https://pokeapi.co/api/v2/pokemon/${id}/`;const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`${id}: ${response.status}`);const data=await response.json();records.push({id,name:data.name,heightM:data.height/10,weightKg:data.weight/10,source:url});}
await writeFile('assets/meta/pokedex.json',JSON.stringify(records,null,2)+'\n');console.log(records);
