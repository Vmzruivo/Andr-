import fs from 'node:fs';
const f='codex-vitae.jsx'; let s=fs.readFileSync(f,'utf8');
if(s.includes('CODEX_HOME_SCHEDULE_V1')) process.exit(0);
const marker='// CODEX_HOME_SCHEDULE_V1';
const helpers=`${marker}\nfunction scheduleFromGoals(goals){const list=(goals||[]).filter(g=>!g.completed).sort((a,b)=>String(a.deadline||'9999').localeCompare(String(b.deadline||'9999')));return list.slice(0,7).map((g,i)=>({id:g.id||i,title:g.title||g.name||'Meta',deadline:g.deadline||null,progress:g.progress||0,target:g.target||1,priority:i<2?'Alta':'Normal'}));}\n`;
s=s.replace('function readLocal(key,fallback)',helpers+'function readLocal(key,fallback)');
// Mission difficulty buttons: never overflow the viewport; use a wrapping grid with compact labels.
s=s.replace('gridTemplateColumns:"repeat(5,1fr)"','gridTemplateColumns:"repeat(5,minmax(0,1fr))"');
s=s.replace('<button key={d.key} className={difficulty===d.key?"active":""} onClick={()=>setDifficulty(d.key)}>{d.label}<small>{d.xp} XP</small></button>','<button key={d.key} style={{minWidth:0,padding:"8px 4px",fontSize:"12px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}} className={difficulty===d.key?"active":""} onClick={()=>setDifficulty(d.key)}>{d.label}<small style={{display:"block",fontSize:"10px"}}>{d.xp} XP</small></button>');
// If the generated mission card exists, add a responsive rule through an inline style wrapper.
const missionMarker='const missionCard=<div className="cv-card">';
if(s.includes(missionMarker)) s=s.replace(missionMarker,'const missionCard=<div className="cv-card" style={{overflow:"hidden"}}>');
// Build a schedule card from the existing goals state and place it directly after missions on Home.
const homeEnd='</section>,\\n feed:';
if(s.includes(homeEnd)){
  const card='<div className="cv-card cv-schedule"><div className="cv-section-head"><div><h2>📅 Seu cronograma</h2><p className="cv-muted">Organizado automaticamente a partir das suas metas.</p></div></div>{scheduleFromGoals(goals).length?<div className="cv-list">{scheduleFromGoals(goals).map((g,i)=><div className="cv-quest" key={g.id||i}><div className="cv-quest-info"><b>{g.title}</b><small>{g.deadline?`Prazo: ${g.deadline}`:'Sem prazo'} · {g.priority}</small><div className="cv-progress"><span style={{width:`${Math.min(100,(g.progress/g.target)*100)}%`}}/></div><small>{g.progress}/{g.target}</small></div></div>)}</div>:<p className="cv-muted">Crie uma meta para o cronograma ser montado automaticamente.</p>}</div></section>,\\n feed:';
  s=s.replace(homeEnd,card);
}
fs.writeFileSync(f,s); console.log('Home schedule patch applied');
