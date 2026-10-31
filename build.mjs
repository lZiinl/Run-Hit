import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('dist/data',{recursive:true});for(const f of ['index.html','style.css','app.js','data.js','engine.js','rules.js','data/teams.js','data/roster-2025.js'])await copyFile(f,`dist/${f}`);await writeFile('dist/.nojekyll','');console.log('Static site ready: dist/');
