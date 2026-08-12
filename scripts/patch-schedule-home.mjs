import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
const marker='// CODEX_SCHEDULE_HOME_V3';
if(s.includes(marker)){console.log('schedule already applied');process.exit(0)}
const helper=`\n${marker}\nconst homeGoalSchedule=(()=>{const all=(goals||[]).flatMap(g=>(g.goal_objectives||[]).filter(o=>!o.completed_at).map(o=>({...o,goalTitle:g.title,goalDeadline:g.deadline,goalDifficulty:g.difficulty}))).sort((a,b)=>String(a.due_date||a.goalDeadline||'9999').localeCompare(String(b.due_date||b.goalDeadline||'9999'))).slice(0,8);if(!all.length)return <div className="cv-card cv-home-schedule"><h2>📅 Seu cronograma</h2><p className="cv-muted">Crie uma meta e seus objetivos aparecerão aqui automaticamente.</p><button className="cv-button" onClick={()=>setTab('goals')}>Criar meta</button></div>;return <div className="cv-card cv-home-schedule"><div className="cv-section-head"><div><h2>📅 Seu cronograma</h2><p className="cv-muted">Organizado automaticamente a partir das suas metas e objetivos.</p></div><span className="cv-badge">{all.length} próximos</span></div><div className="cv-home-schedule-list">{all.map(o=><div key={o.id} className="cv-quest"><div className="cv-quest-info"><b>{o.title}</b><small>{o.goalTitle} · {o.due_date||o.goalDeadline?new Date((o.due_date||o.goalDeadline)+'T12:00:00').toLocaleDateString('pt-BR'):'Sem prazo'} · +{o.xp||0} XP</small></div><button className="cv-button" onClick={()=>setTab('goals')}>Abrir meta</button></div>)}</div></div>})()\n`;
const anchor='const content={';
if(!s.includes(anchor))throw new Error('Content anchor not found');
s=s.replace(anchor,helper+'\n'+anchor);
const needle='{missionCard}</section>';
if(s.includes(needle))s=s.replace(needle,'{missionCard}{homeGoalSchedule}</section>');
else throw new Error('Home mission marker not found');
// Keep all five difficulty buttons inside the viewport on phones.
s=s.replace('gridTemplateColumns:"repeat(5,1fr)"','gridTemplateColumns:"repeat(5,minmax(0,1fr))"');
s=s.replace('gridTemplateColumns:"repeat(5,minmax(0,1fr))"','gridTemplateColumns:"repeat(5,minmax(0,1fr))"');
s=s.replace('<small>{d.xp} XP</small>','<small style={{fontSize:9,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.xp} XP</small>');
const cssMarker='.cv-actions{display:flex;gap:8px;margin-top:12px}';
const cssAdd='.cv-home-schedule{margin-top:14px}.cv-home-schedule-list{display:grid;gap:10px}.cv-home-schedule .cv-quest{min-width:0}.cv-home-schedule .cv-quest-info{min-width:0}.cv-home-schedule .cv-quest-info b,.cv-home-schedule .cv-quest-info small{overflow:hidden;text-overflow:ellipsis}.cv-home-schedule .cv-button{flex:none;white-space:nowrap}@media(max-width:560px){.cv-home-schedule .cv-quest{align-items:flex-start}.cv-home-schedule .cv-quest .cv-button{font-size:11px;padding:7px 9px}.cv-home-schedule .cv-section-head{align-items:flex-start}.cv-home-schedule .cv-badge{font-size:10px;white-space:nowrap}}.cv-actions{display:flex;gap:8px;margin-top:12px}';
if(s.includes(cssMarker)&&!s.includes('.cv-home-schedule{')) s=s.replace(cssMarker,cssAdd);
fs.writeFileSync(f,s);
console.log('goal schedule + responsive mission layout applied');