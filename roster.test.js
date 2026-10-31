import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYERS,TEAMS,SKILLS,SEASON,TYPES} from './data.js';
import {convertStats,clubBoost} from './rules.js';
import {newGame,newAttack,seeded,draftOffers,rerollOffers,probabilities,step} from './engine.js';
test('release roster is 150 distinct 2025 batters with official sources and valid probabilities',()=>{
 assert.equal(PLAYERS.length,150);assert.equal(new Set(PLAYERS.map(p=>p.id)).size,150);
 for(let t=0;t<10;t++)assert.equal(PLAYERS.filter(p=>p.team===t).length,15);
 for(const p of PLAYERS){assert.equal(p.season,SEASON);assert.ok(p.source.startsWith('https://www.koreabaseball.com/'));assert.ok(SKILLS[p.skill]);assert.deepEqual(p.rates,convertStats(p.stats));assert.ok(Math.abs(p.rates.reduce((a,b)=>a+b)-1)<1e-12);assert.ok(p.rates.every(x=>x>=0&&x<=1));}
 assert.equal(new Set(PLAYERS.map(p=>p.rates.join(','))).size,150);
 assert.equal(new Set(PLAYERS.map(p=>p.type)).size,TYPES.length);
});
test('all clubs start with exactly three favorites, six other clubs, nine unique players',()=>{
 for(let t=0;t<10;t++)for(let seed=0;seed<30;seed++){const g=newGame(t,seeded(seed));assert.equal(g.lineup.filter(p=>p.team===t).length,3);assert.equal(new Set(g.lineup.map(p=>p.id)).size,9);assert.equal(new Set(g.lineup.filter(p=>p.team!==t).map(p=>p.team)).size,6);}
});
test('draft preserves favorite/off-club coverage, excludes owned players, limits rerolls',()=>{
 for(let t=0;t<10;t++){const rng=seeded(77+t),g=newGame(t,rng);let offers=draftOffers(g,rng);for(let round=0;round<3;round++){
 assert.equal(offers.length,3);assert.equal(new Set(offers.map(p=>p.id)).size,3);assert.ok(offers.some(p=>p.team===t));assert.ok(offers.some(p=>p.team!==t));assert.ok(offers.every(p=>!g.lineup.some(x=>x.id===p.id)));
 if(round<2){const previous=offers;offers=rerollOffers(g,previous,rng);assert.ok(offers.every(p=>!previous.some(x=>x.id===p.id)));}}
 assert.equal(g.rerolls,0);assert.equal(rerollOffers(g,offers,rng),null);}
});
test('exhausted favorite pool still returns valid distinct alternatives',()=>{const g=newGame(0,seeded(1));g.bench=PLAYERS.filter(p=>p.team===0&&!g.lineup.some(x=>x.id===p.id));const offers=draftOffers(g,seeded(2));assert.equal(offers.length,3);assert.ok(offers.every(p=>p.team!==0));});
test('club thresholds upgrade rather than stack and affect only affiliated batters',()=>{
 assert.deepEqual([2,3,4,5,6,7,9].map(clubBoost),[0,.04,.04,.07,.07,.10,.10]);
 const g=newGame(0,seeded(1)),s=newAttack();g.stage=2;
 // Synthetic fixtures isolate club count from batting-type and individual effects.
 const fixture=team=>({...PLAYERS[0],team,skill:'walk',type:3,rates:[.6,.1,.2,.05,.01,.04]});
 for(const n of [2,3,5,7]){g.lineup=Array.from({length:9},(_,i)=>fixture(i<n?0:i));s.cursor=0;let r=probabilities(g,s).rates;assert.ok(Math.abs(r[2]-(.2+.03+clubBoost(n)))<1e-12);s.cursor=8;assert.ok(Math.abs(probabilities(g,s).rates[2]-.23)<1e-12);}
});
test('cross-club type synergy and personal conditions change actual probability',()=>{
 const g=newGame(0,seeded(2)),s=newAttack();g.lineup=g.lineup.map((p,i)=>({...p,team:i,type:i<3?1:0,skill:'walk'}));
 const before=probabilities(g,s).rates;s.previous=true;assert.ok(Math.abs(probabilities(g,s).rates[2]-before[2]-.06)<1e-12);
 g.lineup[0]={...g.lineup[0],skill:'slug'};const noRunners=probabilities(g,s).rates[5];s.bases=[true,true,false];assert.ok(Math.abs(probabilities(g,s).rates[5]-noRunners-.12)<1e-12);
});
test('signature homer bonus and sprint advancement resolve in scoring',()=>{
 const g=newGame(),s=newAttack();g.lineup[0]=PLAYERS.find(p=>p.skill==='fifty');s.bases=[true,true,true];const event=step(g,s,()=>.999999);assert.equal(event.runs,4);assert.equal(event.bonus,1);assert.equal(s.score,5);
 const g2=newGame(),s2=newAttack();g2.lineup[0]=PLAYERS.find(p=>p.skill==='speedster');s2.bases=[false,true,false];const r=probabilities(g2,s2).rates;const e=step(g2,s2,()=>r[0]+r[1]+r[2]/2);assert.equal(e.result,2);assert.equal(e.runs,1);assert.deepEqual(s2.bases,[true,false,false]);
});
