import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMatch} from './match-view.js';
import {newGame,newAttack,seeded,step} from './engine.js';
import {PLAYERS} from './data.js';

test('home run presentation uses actual runs and bonus without changing match state',()=>{
 const game=newGame(0,seeded(1)),attack=newAttack();game.lineup[0]=PLAYERS.find(p=>p.skill==='fifty');attack.bases=[true,true,true];
 const event=step(game,attack,()=>.999999),before=JSON.stringify({game,attack,event});
 const html=renderMatch({game,attack,log:[event],speed:4,running:false,animate:true});
 assert.ok(html.includes('GRAND SLAM'));assert.ok(html.includes('+5점'));assert.ok(html.includes('효과 보너스 <b>+1'));assert.ok(html.includes('ROUND CLEAR'));
 assert.ok(!html.includes('data-action="fast"'));assert.equal(JSON.stringify({game,attack,event}),before);
});
test('all six outcomes, ready, paused and skipped states render without replaying animation',()=>{
 const game=newGame(0,seeded(1)),attack=newAttack();
 for(let result=0;result<6;result++){
  const event={player:game.lineup[0],result,runs:0,bonus:0,notes:[],ended:false,basesAfter:[true,false,false]};
  const html=renderMatch({game,attack,log:[event],speed:1,running:false,animate:false});
  assert.ok(!html.includes(' animate'));assert.ok(html.includes('일시 정지'));assert.ok(html.includes('1루 주자'));assert.ok(html.includes('data-action="fast"'));
 }
 assert.ok(renderMatch({game,attack,log:[],speed:1,running:true}).includes('PLAY BALL'));
});
test('event preserves final bases for the completed at-bat before inning reset',()=>{
 const game=newGame(0,seeded(2)),attack=newAttack();game.stage=2;attack.outs=2;attack.bases=[true,false,true];
 const event=step(game,attack,()=>0);assert.equal(event.ended,true);assert.deepEqual(event.basesAfter,[true,false,true]);assert.deepEqual(attack.bases,[false,false,false]);
});
