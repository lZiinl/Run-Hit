import test from 'node:test';
import assert from 'node:assert/strict';
import {RULES,PLAYERS,EFFECTS} from './data.js';
import {newGame,newAttack,probabilities,step,seeded,sample} from './engine.js';
import {openingReport} from './scripts/check-opening.mjs';
test('all ten clubs clear each introductory round at least 95% without drafting',()=>{
 for(const row of openingReport())for(const key of ['round1','round2'])assert.ok(row[key]>=.95,`${row.team} ${key}: ${row[key]}`);
});
test('opening assistance expires at round three',()=>{
 const g=newGame(0,seeded(1)),s=newAttack();g.stage=2;const normal=probabilities(g,s).rates;g.stage=0;const easy=probabilities(g,s).rates;
 assert.ok(Math.abs(easy[2]-normal[2]-RULES.earlyBoost[0])<1e-10);
 assert.ok(probabilities(g,s).notes.includes('초반 적응 보너스'));g.stage=2;assert.ok(!probabilities(g,s).notes.includes('초반 적응 보너스'));
});
test('captain activates in inning three, not inning two',()=>{
 const g=newGame(0,seeded(1)),s=newAttack();g.stage=2;g.lineup[0]=PLAYERS.find(p=>p.skill==='captain');s.inning=2;const before=probabilities(g,s).rates;s.inning=3;const after=probabilities(g,s).rates;
 assert.ok(Math.abs(after[3]-before[3]-.05)<1e-10);assert.ok(Math.abs(after[5]-before[5]-.05)<1e-10);
});
test('eight rounds can finish and all seven rewards have nonempty unique choices',()=>{
 const g=newGame(0,seeded(1));let wins=0;
 assert.equal(RULES.targets.length,8);assert.equal(RULES.stageNames.length,8);assert.equal(RULES.innings,3);
 for(let stage=0;stage<RULES.targets.length;stage++){
  g.stage=stage;const s=newAttack();let count=0;while(!s.done){step(g,s,()=>.999999);assert.ok(++count<=90);}assert.ok(s.won);wins++;
  if(stage<RULES.targets.length-1){const offers=sample(EFFECTS.filter(e=>!g.effects.includes(e.id)),3,seeded(stage));assert.ok(offers.length>0);g.effects.push(offers[0].id);}
 }
 assert.equal(wins,8);assert.equal(new Set(g.effects).size,7);
});
