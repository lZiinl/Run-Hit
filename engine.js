import {RULES,PLAYERS,TYPES,TEAMS} from './data.js';
import {clubBoost} from './rules.js';
export function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function sample(items,n,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
export function newGame(favorite=0,rng=Math.random){if(!TEAMS[favorite])throw Error('Unknown team');const own=sample(PLAYERS.filter(p=>p.team===favorite),3,rng),others=sample(TEAMS.map((_,i)=>i).filter(i=>i!==favorite),6,rng).map(team=>sample(PLAYERS.filter(p=>p.team===team),1,rng)[0]);return {favorite,rerolls:RULES.rerolls,lineup:[...own,...others].map(p=>({...p})),bench:[],effects:[],recruited:[],stage:0,total:0,bestInning:0};}
export function typeCounts(lineup){return TYPES.map((_,t)=>lineup.filter(p=>p.type===t).length);}
export function draftOffers(game,rng=Math.random,previous=[]){
 const owned=new Set([...game.lineup,...game.bench].map(p=>p.id)),pool=PLAYERS.filter(p=>!owned.has(p.id)),fresh=pool.filter(p=>!previous.some(x=>x.id===p.id)),offers=[];
 while(offers.length<3){
  const preferFavorite=rng()<RULES.favoriteChance;
  const matches=p=>(p.team===game.favorite)===preferFavorite;
  let eligible=fresh.filter(p=>!offers.includes(p)&&matches(p));
  if(!eligible.length)eligible=pool.filter(p=>!offers.includes(p)&&matches(p));
  if(!eligible.length)eligible=fresh.filter(p=>!offers.includes(p));
  if(!eligible.length)eligible=pool.filter(p=>!offers.includes(p));
  if(!eligible.length)break;
  offers.push(eligible[Math.floor(rng()*eligible.length)]);
 }
 return offers;
}
export function releasePlayer(game,id){const index=game.bench.findIndex(p=>p.id===id);if(index<0)return false;game.bench.splice(index,1);return true;}
export function rerollOffers(game,previous,rng=Math.random){if(game.rerolls<=0)return null;game.rerolls--;return draftOffers(game,rng,previous);}
export function synergies(lineup){return TEAMS.map((_,t)=>lineup.filter(p=>p.team===t).length);}
export function newAttack(){return {inning:1,outs:0,bases:[false,false,false],score:0,real:0,bonus:0,pa:0,cursor:0,previous:false,buff:0,bottom:false,walks:0,reach:0,seen:[],inningRuns:0,done:false,won:false};}
export function probabilities(game,s){const p=game.lineup[s.cursor%9],r=[...p.rates],notes=[],counts=synergies(game.lineup),types=typeCounts(game.lineup);const add=(i,v,label)=>{const x=Math.min(r[0],v);r[0]-=x;r[i]+=x;if(x>0)notes.push(label);};
 if(RULES.earlyBoost[game.stage])add(2,RULES.earlyBoost[game.stage],'초반 적응 보너스');
 const club=TEAMS[p.team],boost=clubBoost(counts[p.team]);if(boost)add(club.style.result,boost,`${club.name} ${counts[p.team]>=7?7:counts[p.team]>=5?5:3}인 시너지`);
 if(types[0]>=3)add(1,.04,'출루형 3인');if(types[1]>=3&&s.previous)add(2,.06,'교타형 3인');if(types[2]>=3&&s.bases.some(Boolean))add(5,.04,'거포형 3인');if(types[3]>=3)add(2,.03,'주루형 3인');
 if(p.skill==='link'&&s.previous)add(2,.10,'연결 고리');if(p.skill==='slug'&&s.bases.filter(Boolean).length>=2)add(5,.12,'주자 청소');if(p.skill==='sprint'&&!s.bases.some(Boolean))add(2,.10,'내야 흔들기');if(p.skill==='bottom'&&s.cursor%9>=6)add(3,.10,'하위 타선의 힘');if(p.skill==='grit'&&s.outs===2)add(2,.12,'끝까지 승부');
 if(p.skill==='fifty'&&s.bases.some(Boolean))add(5,.08,'고유: 빅 스윙');if(p.skill==='captain'&&s.inning===RULES.innings){add(3,.05,'고유: 승부의 중심');add(5,.05,'고유: 승부의 중심');}if(p.skill==='bridge'&&s.previous)add(2,.08,'고유: 끊기지 않는 흐름');if(s.buff)add(5,s.buff,'직전 타자 지원');
 const has=id=>game.effects.includes(id);if(has('factory')){const v=Math.min(.05,r[2]);r[2]-=v;r[5]+=v;notes.push('홈런 공장');}if(has('bottom')&&s.bottom)add(2,.12,'하위 타선 연결');if(has('coach')&&game.recruited.includes(p.id)&&!s.seen.includes(p.id))add(2,.15,'대타 코치');if(has('grit')&&s.outs)add(2,.04*s.outs,'끈질긴 타선');if(has('focus')&&(s.bases[1]||s.bases[2]))add(3,.06,'득점권 집중');if(has('lead')&&s.cursor%9===0)add(1,.12,'리드오프');return {rates:r,notes};}
export function advance(bases,result,extra=false){let runs=0,b=[...bases];if(result===0)return {bases:b,runs};if(result===1){if(b[0]){if(b[1]){if(b[2])runs++;b[2]=true;}b[1]=true;}b[0]=true;return {bases:b,runs};}const steps=result===5?4:result-1;b=[false,false,false];for(let i=0;i<3;i++)if(bases[i]){const dest=i+steps+(extra?1:0);if(dest>=3)runs++;else b[dest]=true;}if(steps===4)runs++;else b[steps-1]=true;return {bases:b,runs};}
export function step(game,s,rng=Math.random){if(s.done)return null;const p=game.lineup[s.cursor%9],{rates,notes}=probabilities(game,s);let roll=rng(),result=5;for(let i=0;i<6;i++){roll-=rates[i];if(roll<0){result=i;break;}}const extra=result===2&&s.bases.some(Boolean)&&(p.skill==='speedster'||(typeCounts(game.lineup)[3]>=3&&rng()<.20));if(extra)notes.push(p.skill==='speedster'?'고유: 그린 라이트 · 추가 진루':'주루형 3인 · 추가 진루');const move=advance(s.bases,result,extra);s.bases=move.bases;s.buff=0;s.bottom=false;s.lastOut=result===0;s.previous=result!==0;s.seen.push(p.id);let bonus=0;
 if(result===0)s.outs++;else{s.reach++;if(p.skill==='bridge')s.buff+=.06;if(result===1){s.walks++;if(p.skill==='walk')s.buff+=.10;if(game.effects.includes('eye')&&s.walks%2===0)s.buff+=.12;}if(game.effects.includes('bottom')&&s.cursor%9>=6)s.bottom=true;}
 if(result===5){if(p.skill==='fifty'){bonus++;notes.push('고유: 빅 스윙 +1');}if(game.effects.includes('festival')){bonus++;notes.push('홈런 축제 +1');}}
 s.real+=move.runs;s.bonus+=bonus;s.score+=move.runs+bonus;s.inningRuns+=move.runs+bonus;game.total+=move.runs+bonus;game.bestInning=Math.max(game.bestInning,s.inningRuns);s.pa++;s.cursor++;const basesAfter=[...s.bases];let ended=false;
 if(s.score>=RULES.targets[game.stage]){s.done=true;s.won=true;}else if(s.outs>=3||s.pa>=RULES.maxPA){ended=true;if(s.inning>=RULES.innings)s.done=true;else{Object.assign(s,{inning:s.inning+1,outs:0,bases:[false,false,false],pa:0,previous:false,buff:0,bottom:false,lastOut:false,inningRuns:0});}}
 return {player:p,result,runs:move.runs,bonus,notes,ended,basesAfter};}
