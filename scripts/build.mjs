import { mkdir, cp } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('index.html','dist/index.html');
await cp('ash-lab.html','dist/ash-lab.html');
await cp('src','dist/src',{recursive:true});
await cp('assets','dist/assets',{recursive:true});
console.log('Built static game in dist/');
