import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});for(const f of ['index.html','style.css','app.js','data.js','engine.js'])await copyFile(f,`dist/${f}`);await writeFile('dist/.nojekyll','');console.log('Static site ready: dist/');
