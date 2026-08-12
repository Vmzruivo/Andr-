import fs from 'node:fs';
const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
const marker='CODEX_ADMIN_PANEL_V1';
if(s.includes(marker)){console.log('admin panel already applied');process.exit(0)}
const block=`\n/* ${marker} */\nconst ADMIN_PANEL_CONFIG = { title: 'Painel Administrativo', superTitle: 'Administrador Supremo', sections: ['Usuários','Missões','Ranking','Feed','Administradores','Configurações'] };\n`;
const anchor='const GOLD=';
if(!s.includes(anchor)) throw new Error('admin anchor not found');
s=s.replace(anchor,block+'\n'+anchor);
fs.writeFileSync(file,s);
console.log('admin panel foundation added');