import fs from 'node:fs';

const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
const before=(s.match(/Ritual/g)||[]).length;
s=s.replaceAll('Codex Vitae','Ritual');
// Keep the product language consistent without touching feature names.
s=s.replaceAll('Sua aventura começa aqui.','Sua missão diária de evolução.');
fs.writeFileSync(file,s);
console.log(`Ritual brand patch applied (${before} existing replacements).`);
