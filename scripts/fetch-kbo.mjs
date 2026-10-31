import {mkdir,writeFile} from 'node:fs/promises';
const base='https://www.koreabaseball.com/Record/Player/HitterBasic/';
const prefix='ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$';
await mkdir('data/sources',{recursive:true});
for(const page of ['Basic1','BasicOld']){
 const url=base+page+'.aspx';let response=await fetch(url,{signal:AbortSignal.timeout(30000)}),html=await response.text();const cookie=response.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 for(const team of ['LG','LG','HH','SK','SS','NC','KT','LT','HT','OB','WO']){
  const form=new URLSearchParams();for(const m of html.matchAll(/<input[^>]+name="([^"]+)"[^>]+value="([^"]*)"/g))form.set(m[1],m[2].replaceAll('&amp;','&'));
  for(const m of html.matchAll(/<select name="([^"]+)"[\s\S]*?<\/select>/g))form.set(m[1],m[0].match(/<option selected="selected" value="([^"]*)"/)?.[1]??'');
  for(const [k,v] of Object.entries({'ddlSeason$ddlSeason':'2025','ddlSeries$ddlSeries':'0','ddlTeam$ddlTeam':team,hfOrderByCol:'PA_CN',hfOrderBy:'DESC',hfPage:'1'}))form.set(prefix+k,v);
  form.set('__EVENTTARGET',prefix+'ddlTeam$ddlTeam');
  response=await fetch(url,{method:'POST',body:form,headers:{Cookie:cookie},signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(response.status);html=await response.text();
  await writeFile(`data/sources/${team}-${page}.html`,html);console.log(team,page,html.length);
 }
}
