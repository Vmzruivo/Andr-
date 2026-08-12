import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
// The schedule was already installed by the previous V2 patch. Do not append a second implementation.
if(s.includes('homeGoalSchedule')){console.log('schedule already present');process.exit(0)}
const marker='// CODEX_SCHEDULE_HOME_V3';
const helper=`\n${marker}\nconst homeGoalSchedule=(()=>{const all=(goals||[]).flatMap(g=>(g.goal_objectives||[]).filter(o=>!o.completed_at).map(o=>({...o,goalTitle:g.title,goalDeadline:g.deadline,goalDifficulty:g.difficulty}))).sort((a,b)=>String(a.due_date||a.goalDeadline||'9999').localeCompare(String(b.due_date||b.goalDeadline||'9999'))).slice(0,8);if(!all.length)return <div className="cv-card cv-home-schedule"><h2>📅 Seu cronograma</h2><p className="cv-muted">Crie uma meta e seus objetivos aparecerão aqui automaticamente.</p><button className="cv-button" onClick={()=>setTab('goals')}>Criar meta</button></div>;return <div className="cv-card cv-home-schedule"><div className="cv-section-head"><div><h2>📅 Seu cronograma</h2><p className="cv-muted">Organizado automaticamente a partir das suas metas e objetivos.</p></div><span className="cv-badge">{all.length} próximos</span></div><div className="cv-home-schedule-list">{all.map(o=><div key={o.id} className="cv-quest"><div className="cv-quest-info"><b>{o.title}</b><small>{o.goalTitle} · {o.due_date||o.goalDeadline?new Date((o.due_date||o.goalDeadline)+'T12:00:00').toLocaleDateString('pt-BR'):'Sem prazo'} · +{o.xp||0} XP</small></div><button className="cv-button" onClick={()=>setTab('goals')}>Abrir meta</button></div>)}</div></div>})()\n`;
const anchor='const content={';
if(!s.includes(anchor))throw new Error('Content anchor not found');
s=s.replace(anchor,helper+'\n'+anchor);
const needle='{missionCard}</section>';
if(s.includes(needle))s=s.replace(needle,'{missionCard}{homeGoalSchedule}</section>');
else throw new Error('Home mission marker not found');
s=s.replace('gridTemplateColumns:"repeat(5,1fr)"','gridTemplateColumns:"repeat(5,minmax(0,1fr))"');
s=s.replace('<small>{d.xp} XP</small>','<small style={{fontSize:9,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.xp} XP</small>');
fs.writeFileSync(f,s);
console.log('goal schedule patch applied');