import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYERS,RULES} from './data.js';
import {newGame,seeded,draftOffers,releasePlayer} from './engine.js';
test('favorite probability is 30% per slot and is not a guaranteed candidate',()=>{
 const rng=seeded(311),g=newGame(8,rng);let total=0,empty=0,multiple=0;
 for(let i=0;i<10000;i++){const offers=draftOffers(g,rng),count=offers.filter(p=>p.team===g.favorite).length;total+=count;if(count===0)empty++;if(count>=2)multiple++;}
 assert.ok(Math.abs(total/30000-RULES.favoriteChance)<.015);assert.ok(empty>3000&&empty<3900);assert.ok(multiple>1500);
});
test('release removes only the selected bench player and reopens a roster slot',()=>{
 const g=newGame(0,seeded(2)),lineup=g.lineup.map(p=>p.id),p=PLAYERS.find(p=>!lineup.includes(p.id));g.bench.push(p);
 assert.equal(releasePlayer(g,lineup[0]),false);assert.equal(g.bench.length,1);
 assert.equal(releasePlayer(g,p.id),true);assert.equal(g.bench.length,0);assert.deepEqual(g.lineup.map(p=>p.id),lineup);
 assert.equal(releasePlayer(g,p.id),false);assert.equal(releasePlayer(g,'missing'),false);
 const rng=seeded(10);let seen=false;for(let i=0;i<1000;i++)if(draftOffers(g,rng).some(x=>x.id===p.id))seen=true;assert.ok(seen);
});
