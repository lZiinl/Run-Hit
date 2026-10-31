// Game-only rules: these effects are not historical claims about clubs/players.
export const RULES={targets:[3,4,5,7,9],innings:2,maxPA:30,bench:5,delay:6500,rerolls:2};
export const CONVERSION={priorPA:60,prior:[.64,.10,.18,.05,.005,.025],reachMultiplier:1.45};
export const TYPES=[{name:'출루형',desc:'3명: 전체 볼넷 +4%p'},{name:'교타형',desc:'3명: 직전 타자 출루 시 전체 단타 +6%p'},{name:'거포형',desc:'3명: 주자가 있으면 전체 홈런 +4%p'},{name:'주루형',desc:'3명: 전체 단타 +3%p · 단타 때 기존 주자 20% 확률로 추가 진루'}];
export const SKILLS={
 walk:{name:'출루의 시작',desc:'볼넷·사구로 출루하면 다음 타자 홈런 +10%p'},
 link:{name:'연결 고리',desc:'직전 타자가 출루했으면 단타 +10%p'},
 slug:{name:'주자 청소',desc:'주자 2명 이상이면 홈런 +12%p'},
 sprint:{name:'내야 흔들기',desc:'베이스가 비었으면 단타 +10%p'},
 bottom:{name:'하위 타선의 힘',desc:'7~9번 타순에서 2루타 +10%p'},
 grit:{name:'끝까지 승부',desc:'2아웃에서 단타 +12%p'},
 fifty:{name:'빅 스윙',desc:'주자가 있으면 홈런 +8%p · 홈런 시 보너스 +1점',unique:true},
 speedster:{name:'그린 라이트',desc:'단타 때 기존 주자는 추가 1루 진루',unique:true},
 captain:{name:'승부의 중심',desc:'마지막 이닝에 2루타·홈런 각각 +5%p',unique:true},
 bridge:{name:'끊기지 않는 흐름',desc:'직전 타자 출루 시 단타 +8%p · 자신의 출루로 다음 타자 홈런 +6%p',unique:true},
};
export const CLUB_STYLES=[
 {name:'연결',result:2,desc:'3/5/7명: 해당 구단 타자 단타 +4/7/10%p'},
 {name:'장타',result:3,desc:'3/5/7명: 해당 구단 타자 2루타 +4/7/10%p'},
 {name:'출루',result:1,desc:'3/5/7명: 해당 구단 타자 볼넷 +4/7/10%p'},
 {name:'한 방',result:5,desc:'3/5/7명: 해당 구단 타자 홈런 +4/7/10%p'},
];
export const CLUB_STYLE_IDS=[0,1,2,3,0,1,0,3,0,2];
export const clubBoost=count=>count>=7?.10:count>=5?.07:count>=3?.04:0;
export function convertStats(s){const single=s.hits-s.doubles-s.triples-s.hr;const counts=[s.pa-s.hits-s.bb-s.hbp,s.bb+s.hbp,single,s.doubles,s.triples,s.hr];if(s.pa<=0||counts.some(x=>!Number.isFinite(x)||x<0))throw Error('Invalid batting record');const rates=counts.map((n,i)=>(n+CONVERSION.priorPA*CONVERSION.prior[i])/(s.pa+CONVERSION.priorPA));for(let i=1;i<6;i++)rates[i]*=CONVERSION.reachMultiplier;const reach=rates.slice(1).reduce((a,b)=>a+b,0);if(reach>.92)for(let i=1;i<6;i++)rates[i]*=.92/reach;rates[0]=1-rates.slice(1).reduce((a,b)=>a+b,0);return rates;}
export function classify(s){return s.sb/s.pa>=.035?3:s.hr/s.pa>=.03?2:(s.bb+s.hbp)/s.pa>=.115?0:1;}
export function commonSkill(s,type){if(s.pa<200)return 'bottom';if(s.bb/s.pa>=.14)return 'grit';return ['walk','link','slug','sprint'][type];}
