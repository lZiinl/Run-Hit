import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const files=['style.css','app.js','data.js','engine.js','match-view.js','rules.js','data/teams.js','data/roster-2025.js'];

export async function build(outDir=resolve(root,'dist')){
 const contents=await Promise.all(files.map(file=>readFile(resolve(root,file))));
 const template=await readFile(resolve(root,'index.html'),'utf8');
 const hash=createHash('sha256').update(template);
 files.forEach((file,i)=>hash.update(file).update(contents[i]));
 const version=hash.digest('hex').slice(0,16),assetPath=`assets/${version}`;
 await mkdir(resolve(outDir,assetPath,'data'),{recursive:true});
 await Promise.all(files.map((file,i)=>writeFile(resolve(outDir,assetPath,file),contents[i])));
 // Keep the entire module graph under a content-versioned directory.
 // Relative imports now resolve to this same version, even for nested modules.
 const html=template.replace('href="./style.css"',`href="./${assetPath}/style.css"`)
  .replace('src="./app.js"',`src="./${assetPath}/app.js"`)
  .replace('</head>',`<meta name="run-hit-build" content="${version}"></head>`);
 await writeFile(resolve(outDir,'index.html'),html);
 await writeFile(resolve(outDir,'.nojekyll'),'');
 await writeFile(resolve(outDir,'version.json'),JSON.stringify({version,commit:process.env.GITHUB_SHA??null})+'\n');
 return {version,assetPath};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {version}=await build();console.log(`Static site ready: dist/ (version ${version})`);
}
