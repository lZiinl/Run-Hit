import {newGame,newAttack,seeded,step} from '../engine.js';
import {TEAMS} from '../data.js';
export function openingReport(runs=2000){return TEAMS.map((team,index)=>{
 const passed=[0,0];
 for(let seed=1;seed<=runs;seed++){
  const rng=seeded(seed*101+index),game=newGame(index,rng);
  // No recruits, upgrades or lineup optimization: beginner/skip baseline.
  for(let stage=0;stage<2;stage++){game.stage=stage;const state=newAttack();while(!state.done)step(game,state,rng);if(state.won)passed[stage]++;}
 }
 return {team:team.id,runs,round1:passed[0]/runs,round2:passed[1]/runs};
});}
if(process.argv[1]?.endsWith('check-opening.mjs'))console.table(openingReport());
