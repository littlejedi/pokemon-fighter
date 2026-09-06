import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const bounds=JSON.parse(readFileSync('assets/meta/bounds.json'));
const pokemon=[25,95,121,26,45,110,65,126,112,131,68,94,149,9,128];
function png(path){const b=readFileSync(path);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)}}
test('all 15 trainers have two distinct high-resolution textures and valid alpha crops',()=>{
 for(let id=0;id<15;id++)for(const pose of['','_2']){const path=`assets/trainers/${id}${pose}.png`,size=png(path),crop=bounds['/'+path];assert.ok(size.width>=800);assert.ok(size.height>=800);assert.ok(crop.bounds[2]>crop.bounds[0]);assert.ok(crop.bounds[3]>crop.bounds[1]);assert.ok(crop.bounds[3]<=size.height)}
 for(let id=0;id<15;id++)assert.notDeepEqual(readFileSync(`assets/trainers/${id}.png`),readFileSync(`assets/trainers/${id}_2.png`));
});
test('each partner has a detailed original image, and all 3 stages are full HD-class textures',()=>{
 for(const id of pokemon){const size=png(`assets/pokemon/${id}.png`);assert.ok(size.width>=475);assert.ok(size.height>=475)}
 for(const name of['viridian','cerulean','indigo']){const size=png(`assets/stages/${name}.png`);assert.ok(size.width>=1500);assert.ok(size.height>=850)}
});
test('production build includes every texture and metadata file',()=>{
 for(const path of Object.keys(bounds)){assert.ok(existsSync('dist'+path));assert.deepEqual(readFileSync('dist'+path),readFileSync('.'+path))}
 for(const name of['viridian','cerulean','indigo'])assert.deepEqual(readFileSync(`dist/assets/stages/${name}.png`),readFileSync(`assets/stages/${name}.png`));
 assert.ok(existsSync('dist/src/art.js'));
});
