import {TEAMS as CLUBS} from './data/teams.js';
import {ROSTER} from './data/roster-2025.js';
import {CLUB_STYLES,CLUB_STYLE_IDS,convertStats,classify,commonSkill} from './rules.js';
export {RULES,TYPES,SKILLS} from './rules.js';
export const SEASON=2025;
export const DATA_STATUS={target:150,verified:ROSTER.length,status:'공식 기록 검증 · 밸런스 테스트 중'};
export const TEAMS=CLUBS.map((t,i)=>({...t,style:CLUB_STYLES[CLUB_STYLE_IDS[i]],desc:CLUB_STYLES[CLUB_STYLE_IDS[i]].desc}));
// Hand-authored game-only signature skills, not real historical abilities.
const signatures={'54400':'fifty','62415':'speedster','72443':'captain','65357':'bridge'};
export const PLAYERS=ROSTER.map(p=>{const type=classify(p.stats);return {...p,type,rates:convertStats(p.stats),skill:signatures[p.id]??commonSkill(p.stats,type)};});
export const EFFECTS=[{id:'eye',name:'눈야구 훈련',desc:'볼넷·사구 2회마다 다음 타자 홈런 +12%p'},{id:'bottom',name:'공포의 하위 타선',desc:'7~9번 타자가 출루하면 다음 타자 단타 +12%p'},{id:'factory',name:'홈런 공장',desc:'단타 확률 5%p를 홈런 확률로 전환'},{id:'coach',name:'대타 전문 코치',desc:'새로 영입한 선수의 매 스테이지 첫 타석 단타 +15%p'},{id:'grit',name:'끈질긴 타선',desc:'현재 이닝 아웃당 단타 +4%p'},{id:'focus',name:'득점권 집중',desc:'2·3루에 주자가 있으면 2루타 +6%p'},{id:'lead',name:'리드오프',desc:'1번 타자 볼넷 +12%p'},{id:'festival',name:'홈런 축제',desc:'모든 홈런에 보너스 +1점'}];
export const RESULTS=['아웃','볼넷·사구','단타','2루타','3루타','홈런'];
