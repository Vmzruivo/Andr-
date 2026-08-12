import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
if(s.includes('CODEX_SCHEDULE_HOME_V1')){console.log('already applied');process.exit(0)}
const marker='// CODEX_SCHEDULE_HOME_V1';
const schedule=`
const goalSchedule=(()=>{const goals=quests||[];if(!goals.length)return null;const todayName=new Date().toLocaleDateString('pt-BR',{weekday:'long'});const items=goals.filter(g=>!g.completed).slice(0,6);return <div className="cv-card" style={{marginTop:14}}><div className="cv-section-head"><div><h2>📅 Seu cronograma</h2><p className="cv-muted">Organizado a partir das suas metas e objetivos.</p></div><span className="cv-badge">{todayName}</span></div><div style={{display:'grid',gap:10}}>{items.map((g,i)=><div key={g.id||i} className="cv-quest"><div className="cv-quest-info"><b>{g.title||g.text||'Objetivo'}</b><small>{g.deadline?\`Prazo: \${new Date(g.deadline).toLocaleDateString('pt-BR')}\`:'Objetivo da sua meta'}</small><div className="cv-progress"><span style={{width:\`\${g.completed?100:0}%\`}}/></div></div><span className="cv-badge">{g.xp||0} XP</span></div>)}</div></div>})()
`;
s=s.replace(marker,marker+'\n'+schedule);
// Place schedule immediately after the system mission card on Home.
const needle='{missionCard}</section>,\\n feed:';
if(!s.includes(needle)) throw new Error('Home mission placement not found');
s=s.replace(needle,'{missionCard}{goalSchedule}</section>,\\n feed:');
// Responsive five difficulty buttons: use auto-fit and smaller labels so Nightmare stays inside mobile width.
s=s.replace('gridTemplateColumns:"repeat(5,1fr)"','gridTemplateColumns:"repeat(5,minmax(0,1fr))"');
s=s.replace('<small>{d.xp} XP</small>','<small style={{fontSize:10,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.xp} XP</small>');
fs.writeFileSync(f,s);
console.log('schedule home + responsive mission tabs applied');
