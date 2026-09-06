import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ATTACKS,POKEMON_IDS,POKEMON_HEIGHTS,TRAINER_HEIGHTS,pokemonStageHeight,attackFrame,attackPhase,faceOpponent} from '../src/battle-rules.js';
test('battle heights agree with cached Pokédex records for all 15 species',()=>{const data=JSON.parse(readFileSync('assets/meta/pokedex.json'));for(let i=0;i<15;i++)assert.equal(POKEMON_HEIGHTS[i],data.find(d=>d.id===POKEMON_IDS[i]).heightM)});
test('Pikachu is one quarter Blastoise height, and both use trainer world scale',()=>{assert.equal(pokemonStageHeight(13)/pokemonStageHeight(0),4);assert.ok(pokemonStageHeight(0)<TRAINER_HEIGHTS[0]/3);assert.ok(pokemonStageHeight(13)>TRAINER_HEIGHTS[0]*.85);assert.ok(pokemonStageHeight(1)>TRAINER_HEIGHTS[1]*1.5)});
test('animation frame contact matches the active damage phase',()=>{for(const type of ['punch','kick']){assert.equal(attackPhase(type,0),'startup');assert.equal(attackPhase(type,ATTACKS[type].activeStart),'active');assert.equal(attackFrame(type,ATTACKS[type].activeStart),type==='punch'?3:9);assert.equal(attackPhase(type,ATTACKS[type].activeEnd),'recovery');assert.equal(attackFrame(type,ATTACKS[type].duration),0)}});
test('facing changes by relative position and is stable for equal x',()=>{assert.equal(faceOpponent(10,20),1);assert.equal(faceOpponent(20,10),-1);assert.equal(faceOpponent(20,20,-1),-1)});
