import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {TEAMS} from '../data/teams.js';
const fields={PA_CN:'pa',AB_CN:'ab',HIT_CN:'hits',H2_CN:'doubles',H3_CN:'triples',HR_CN:'hr',BB_CN:'bb',HP_CN:'hbp',SB_CN:'sb',SH_CN:'sac',SF_CN:'sf'};
function parse(html,team){
 for(const [name,value] of [['ddlSeason','2025'],['ddlSeries','0'],['ddlTeam',team]]){
  const select=[...html.matchAll(/<select name="([^"]+)"[\s\S]*?<\/select>/g)].find(m=>m[1].endsWith(`${name}$${name}`));
  if(!select||!select[0].includes(`selected="selected" value="${value}"`))throw Error(`Wrong source filter: ${team} ${name}`);
 }
 return [...html.matchAll(/<tr>[\s\S]*?<\/tr>/g)].filter(m=>m[0].includes('playerId=')).map(m=>{
  const row=m[0],person=row.match(/playerId=(\d+)">([^<]+)</),stats={};
  for(const [source,key]of Object.entries(fields)){const v=row.match(new RegExp(`data-id="${source}">([^<]+)<`));if(v)stats[key]=Number(v[1]);}
  return {id:person[1],name:person[2],stats};
 });
}
const players=[],sources=[];
for(let team=0;team<TEAMS.length;team++){
 const code=TEAMS[team].id,docs={};
 for(const page of ['Basic1','BasicOld']){const path=`data/sources/${code}-${page}.html`,html=await readFile(path,'utf8');docs[page]=parse(html,code);sources.push({path,url:`https://www.koreabaseball.com/Record/Player/HitterBasic/${page}.aspx`,season:2025,series:0,team:code,sha256:createHash('sha256').update(html).digest('hex')});}
 const candidates=docs.Basic1.sort((a,b)=>b.stats.pa-a.stats.pa||a.id.localeCompare(b.id)).slice(0,15);
 if(candidates.length!==15)throw Error(`Need 15 batters: ${code}`);
 for(const p of candidates){const old=docs.BasicOld.find(x=>x.id===p.id);if(!old)throw Error(`Missing second table ${p.id}`);for(const key of Object.keys(p.stats))if(key in old.stats&&p.stats[key]!==old.stats[key])throw Error(`Record mismatch ${p.id} ${key}`);
  const stats={...p.stats,...old.stats};if(Object.values(stats).some(v=>!Number.isInteger(v)||v<0)||stats.hits>stats.ab||stats.doubles+stats.triples+stats.hr>stats.hits||stats.ab+stats.bb+stats.hbp+stats.sac+stats.sf>stats.pa)throw Error(`Invalid counting stats ${p.id}`);
  if(players.some(x=>x.id===p.id))throw Error(`Duplicate player ${p.id}`);
  players.push({...p,stats,team,season:2025,source:`https://www.koreabaseball.com/Record/Player/HitterDetail/Total.aspx?playerId=${p.id}`});
 }
}
if(process.argv.includes('--check')){
 const {ROSTER}=await import('../data/roster-2025.js');if(JSON.stringify(ROSTER)!==JSON.stringify(players))throw Error('Roster differs from official source snapshots');
 const manifest=JSON.parse(await readFile('data/sources/manifest.json','utf8'));if(JSON.stringify(manifest.sources)!==JSON.stringify(sources))throw Error('Source snapshot hashes differ');
}else{
 await writeFile('data/roster-2025.js',`// Generated from KBO official 2025 regular-season tables. Do not edit by hand.\nexport const ROSTER = ${JSON.stringify(players,null,2)};\n`);
 await writeFile('data/sources/manifest.json',JSON.stringify({season:2025,retrievedAt:new Date().toISOString(),selection:'Top 15 PA per team as attributed by the KBO 2025 regular-season table; season totals, not team splits.',sources},null,2)+'\n');
}
console.log(`Verified ${players.length} players, 15 per team; both official tables agree.`);
