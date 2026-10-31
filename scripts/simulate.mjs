import {newGame,newAttack,seeded,draftOffers,step} from '../engine.js';
import {TEAMS,EFFECTS,RULES} from '../data.js';
const report=[];
for(const strategy of ['club','mixed'])for(let team=0;team<TEAMS.length;team++){
 let clears=0,passed=0,appearances=0,totalPA=0,winningPA=0;
 for(let seed=1;seed<=300;seed++){
  const rng=seeded(seed*97+team),g=newGame(team,rng);let pa=0;
  for(let stage=0;stage<5;stage++){
   g.stage=stage;const offers=draftOffers(g,rng);
   const candidate=strategy==='club'?offers.find(p=>p.team===team):offers.reduce((a,b)=>a.rates[0]<b.rates[0]?a:b);
   const targets=g.lineup.map((p,i)=>({p,i})).filter(x=>strategy==='mixed'||x.p.team!==team).sort((a,b)=>b.p.rates[0]-a.p.rates[0]);
   if(candidate&&targets[0])g.lineup[targets[0].i]=candidate;
   const state=newAttack();while(!state.done){step(g,state,rng);pa++;}
   appearances++;if(!state.won)break;passed++;if(stage===4){clears++;winningPA+=pa;}else g.effects.push(EFFECTS[stage].id);
  }
  totalPA+=pa;
 }
 report.push({strategy,team:TEAMS[team].id,runs:300,clears,clearRate:+(clears/3).toFixed(1),stagePassRate:+(passed/appearances*100).toFixed(1),averageAnimationSeconds:+(totalPA/300*RULES.delay/1000).toFixed(1),winningAnimationSeconds:clears?Math.round(winningPA/clears*RULES.delay/1000):0});
}
console.table(report);
console.log('Heuristic simulations only; selection time and visual usability require human playtests.');
