import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {build} from './build.mjs';

test('Pages HTML and complete module graph use one versioned asset directory',async t=>{
 const tempRoot=resolve(tmpdir()),dir=await mkdtemp(join(tempRoot,'run-hit-build-'));
 t.after(async()=>{if(!resolve(dir).startsWith(tempRoot+sep)||!dir.includes('run-hit-build-'))throw Error('Unsafe cleanup path');await rm(dir,{recursive:true,force:true});});
 const result=await build(dir),html=await readFile(join(dir,'index.html'),'utf8');
 assert.ok(html.includes(`src="./${result.assetPath}/app.js"`));
 assert.ok(html.includes(`href="./${result.assetPath}/style.css"`));
 assert.ok(!html.includes('src="./app.js"'));
 const queue=['app.js'],seen=new Set();
 while(queue.length){const file=queue.shift();if(seen.has(file))continue;seen.add(file);
  const source=await readFile(join(dir,result.assetPath,file),'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*)['"]\.\/([^'"]+)['"]/g)){
   assert.ok((await stat(join(dir,result.assetPath,match[1]))).isFile());queue.push(match[1]);
  }
 }
 assert.ok(seen.has('match-view.js'));assert.ok(seen.has('data/roster-2025.js'));
 assert.ok((await readFile(join(dir,result.assetPath,'app.js'),'utf8')).includes('renderMatch'));
 assert.equal(JSON.parse(await readFile(join(dir,'version.json'),'utf8')).version,result.version);
 assert.equal((await build(dir)).version,result.version);
});
