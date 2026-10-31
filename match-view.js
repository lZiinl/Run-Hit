import {RULES,TEAMS,RESULTS} from './data.js';
import {probabilities} from './engine.js';

const titles=['OUT','WALK','SINGLE','DOUBLE','TRIPLE','HOME RUN'];
const trails=['','M360 310 L500 210','M360 310 Q440 160 560 145','M360 310 Q210 50 135 100','M360 310 Q500 0 610 75','M360 310 Q310 -30 440 20'];
const positions=[[500,210],[360,110],[220,210]];
export function stadiumSvg(bases,event){
 return `<svg class="ballpark" viewBox="0 0 720 360" aria-hidden="true">
 <defs><radialGradient id="grass"><stop stop-color="#327458"/><stop offset="1" stop-color="#122d2d"/></radialGradient><pattern id="seats" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="10" height="3" rx="1" fill="#85aeae" opacity=".25"/></pattern></defs>
 <path d="M45 180 Q360 -155 675 180 L360 350Z" fill="url(#seats)"/>
 <path d="M90 180 Q360 -100 630 180 L360 345Z" fill="url(#grass)" stroke="#749a72" stroke-width="3"/>
 <path d="M155 215 Q360 -5 565 215M215 260 Q360 90 505 260" fill="none" stroke="#90b879" stroke-opacity=".08" stroke-width="38"/>
 <path d="M360 310 L500 210 L360 110 L220 210Z" fill="#ba9167" opacity=".85"/>
 <path d="M360 282 L463 210 L360 137 L257 210Z" fill="#407b54"/>
 <path d="M360 310L105 125M360 310L615 125" stroke="#ecedd1" stroke-opacity=".6" stroke-width="2"/>
 <ellipse cx="360" cy="220" rx="19" ry="11" fill="#c3a078"/><path d="M352 220h16" stroke="#fff6df" stroke-width="4"/>
 ${positions.map(([x,y],i)=>`<g transform="translate(${x} ${y})"><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" fill="${bases[i]?'#e4fa8a':'#ede4cf'}"/>${bases[i]?'<circle class="runner-halo" r="20" fill="none" stroke="#d5f47b" stroke-width="2"/><circle cy="-17" r="6" fill="#efffc5"/>':''}<text y="31" text-anchor="middle" fill="#d4dec1" font-size="12">${i+1}루</text></g>`).join('')}
 <path d="M351 305h18v10l-9 7-9-7Z" fill="#fff5dc"/>
 <g class="batter-figure" fill="#d5ed78"><circle cx="336" cy="291" r="6"/><path d="M332 299l-5 17h7l3-11 6 11h7l-9-18Z"/><path d="M335 301l-15-8" stroke="#d5ed78" stroke-width="5"/><path d="M318 294l-12-19" stroke="#e9c491" stroke-width="5" stroke-linecap="round"/></g>
 ${event&&event.result>1?`<path class="hit-trail" d="${trails[event.result]}" pathLength="1" fill="none" stroke="#f3f9bc" stroke-width="3" stroke-linecap="round"/><circle class="flying-ball flight-${event.result}" cx="360" cy="310" r="5" fill="#fff9df"/>`:''}
 <text x="360" y="62" text-anchor="middle" fill="#b8d6a2" opacity=".55" font-size="11" letter-spacing="5">RUN & HIT BALLPARK</text></svg>`;
}

export function renderMatch({game,attack,log,speed,running,animate=false}){
 const event=log[0],next=game.lineup[attack.cursor%9],prob=probabilities(game,attack),target=RULES.targets[game.stage];
 const tone=event?event.result===5?'homer':event.runs+event.bonus?'score':event.result===0?'out':'hit':'ready';
 const gain=event?event.runs+event.bonus:0,bases=event?.basesAfter??attack.bases;
 return `<section class="match ${tone} ${animate?'animate':''}" style="--play-speed:${Math.max(.35,1/speed)};--club-color:${TEAMS[(event?.player??next).team].color}">
 <div class="match-top"><span><i></i> LIVE · ${RULES.stageNames[game.stage]}</span><span>${attack.inning} / ${RULES.innings} 이닝 <b class="out-dots" aria-label="${attack.outs}아웃">${'●'.repeat(attack.outs)}${'○'.repeat(3-attack.outs)}</b></span></div>
 <div class="match-score"><div><small>이번 라운드</small><strong class="score-value">${attack.score.toString().padStart(2,'0')}</strong><span> / ${target}점</span></div><div class="score-breakdown"><span>실제 득점 <b>${attack.real}</b></span><span>보너스 <b>${attack.bonus}</b></span><span>누적 <b>${game.total}</b></span></div></div>
 <div class="goal-track" role="progressbar" aria-label="목표 득점" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${Math.min(attack.score,target)}"><i style="width:${Math.min(100,attack.score/target*100)}%"></i></div>
 <div class="match-arena"><div class="arena-field"><div class="stadium-glow"></div>${stadiumSvg(bases,event)}
 <div class="play-call" role="status" aria-live="polite"><span class="play-kicker">${event?`${TEAMS[event.player.team].name} · ${event.player.name}`:'당신의 타선, 준비 완료'}</span><h2>${event?(event.result===5&&event.runs===4?'GRAND SLAM':titles[event.result]):'PLAY BALL'}</h2><div class="call-detail">${event?RESULTS[event.result]:'첫 타석을 기다리는 중'} ${gain?`<b class="run-pop">+${gain}점</b>`:''}</div></div>
 ${event?.result===5?`<div class="celebration" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--n:${i};--x:${(i*37)%100}%;--rot:${i*47}deg"></i>`).join('')}</div>`:''}
 <div class="bases-caption">${bases.some(Boolean)?bases.map((b,i)=>b?`${i+1}루`:'').filter(Boolean).join(' · ')+' 주자':'주자 없음'}${event?.ended?' · 이닝 종료 후 베이스 초기화':''}</div>
 </div><aside class="play-spotlight"><small>LAST AT BAT</small>${event?`<div class="player-medallion" aria-hidden="true">${event.player.name.slice(0,1)}</div><h3>${event.player.name}</h3><p>${TEAMS[event.player.team].name}</p><div class="run-receipt"><span>실제 득점 <b>+${event.runs}</b></span><span>효과 보너스 <b>+${event.bonus}</b></span></div>`:'<h3>한 방의 시작</h3><p>선수와 시너지가 만든 결과가<br>이곳에 표시됩니다.</p>'}</aside></div>
 <div class="effect-ribbon"><span class="effect-label">이번 타석 적용 효과</span><div>${event?.notes.length?[...new Set(event.notes)].map((note,i)=>`<span class="effect-chip" style="--i:${i}"><b>✦</b> ${note}</span>`).join(''):'<span class="no-effect">선발의 조합이 타격 확률을 바꿉니다</span>'}</div></div>
 ${attack.done?`<div class="round-outcome ${attack.won?'won':''}"><span>${attack.won?'ROUND CLEAR':'GAME OVER'}</span><strong>${attack.won?'목표 달성! 다음 무대로.':'이번 도전은 여기까지.'}</strong><button class="primary" data-action="next">${attack.won&&game.stage<RULES.targets.length-1?'다음 스테이지 →':'최종 결과 보기 →'}</button></div>`:`<div class="on-deck"><span>NEXT</span><strong>${attack.cursor%9+1}번 ${next.name}</strong><small>${TEAMS[next.team].name}</small><span class="pitch-status">${running?'다음 타석 준비 중':'일시 정지'}</span></div>`}
 </section><div class="controls match-controls">${!attack.done?`<button data-action="speed">속도 ${speed}×</button><button data-action="pause">${running?'일시 정지':'계속 진행'}</button><button data-action="fast">연출 건너뛰기 →</button>`:''}<span>라운드 ${game.stage+1}/${RULES.targets.length} · 이닝당 최대 ${RULES.maxPA}타석</span></div>
 ${!attack.done?`<details class="match-details"><summary>다음 타자 적용 확률</summary><p>${prob.rates.map((r,i)=>`${RESULTS[i]} ${(r*100).toFixed(1)}%`).join(' · ')}</p></details>`:''}
 <details class="match-details"><summary>경기 중계 · 최근 ${Math.min(log.length,12)}타석</summary><div class="compact-log">${log.slice(0,12).map(l=>`<p><strong>${l.player.name}</strong> ${RESULTS[l.result]} <b>+${l.runs+l.bonus}점</b><small>${l.notes.join(' · ')}</small></p>`).join('')||'아직 타석 기록이 없습니다.'}</div></details>`;
}
