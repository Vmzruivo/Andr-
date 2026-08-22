import fs from 'node:fs';

const file = 'codex-vitae.jsx';
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, 'utf8');
const MARK = 'CODEX_FINAL_UI_ADMIN_FIX_V5';
if (s.includes(MARK)) {
  console.log('final UI/admin fix already applied');
  process.exit(0);
}

const oldMissionFor = 'const missionFor=d=>{const old=missions[d];if(old&&old.date===today())return old;const pool=MISSION_POOLS[d],base=pool[missionSeed(today(),d)%pool.length],m={...base,difficulty:d,xp:DIFFICULTIES.find(x=>x.key===d).xp,date:today(),completed:false};setMissions(x=>({...x,[d]:m}));return m};';
const newMissionFor = 'const missionFor=d=>{const existing=missions[d];if(existing&&existing.date===today()&&!existing.cancelled&&!existing.completed)return existing;const pool=MISSION_POOLS[d],base=pool[missionSeed(today(),d)%pool.length],m={...base,difficulty:d,xp:DIFFICULTIES.find(x=>x.key===d).xp,date:today(),completed:false,cancelled:false};setMissions(x=>{const next={...x};Object.keys(next).forEach(k=>{if(k!==d&&next[k]?.date===today()&&!next[k]?.completed&&!next[k]?.cancelled)next[k]={...next[k],cancelled:true,cancelledAt:new Date().toISOString()}});next[d]=m;return next});return m};';
if (s.includes(oldMissionFor)) s = s.replace(oldMissionFor, newMissionFor);

// The schedule patch may already have been removed by an earlier build guard.
// Use the next stable marker in that case instead of failing the build.
const missionStart = s.indexOf('const missionCard=');
if (missionStart < 0) {
  console.log('Mission card marker not found; skipping mission/admin UI patch.');
  process.exit(0);
}
const scheduleStart = s.indexOf('const homeGoalSchedule=', missionStart);
const contentStart = s.indexOf('const content={', missionStart);
const missionEnd = scheduleStart >= 0 ? scheduleStart : contentStart;
if (missionEnd < 0) {
  console.log('No stable mission end marker found; skipping mission/admin UI patch.');
  process.exit(0);
}

const missionBlock = `/* ${MARK} */
 const [showMissionChoices,setShowMissionChoices]=useState(false);
 const activeMission=missions[difficulty]&&missions[difficulty].date===today()&&!missions[difficulty].cancelled?missions[difficulty]:null;
 const completedMission=missions[difficulty]&&missions[difficulty].date===today()&&missions[difficulty].completed?missions[difficulty]:null;
 const mp=activeMission?missionProgress(activeMission):0;
 const activeMissionCount=Object.values(missions).filter(m=>m&&m.date===today()&&!m.cancelled&&!m.completed).length;
 const missionCard=<div className="cv-card cv-missions-clean"><div className="cv-section-head"><div><h2>Missão do sistema</h2><p className="cv-muted">Você pode manter uma missão ativa. Escolha outra dificuldade quando quiser.</p></div><b>{activeMissionCount}/1 ativa</b></div>{activeMission?<div className="cv-quest cv-quest-single"><div className="cv-quest-info"><span className="cv-badge">{DIFFICULTIES.find(d=>d.key===difficulty)?.label}</span><b>{activeMission.title}</b><small>{activeMission.desc}</small><div className="cv-progress"><span style={{width:Math.min(100,mp/Math.max(1,activeMission.target)*100)+'%'}}/></div><small>{mp}/{activeMission.target} · +{activeMission.xp} XP</small></div><div className="cv-mission-actions">{missionReady(activeMission)&&<button className="cv-button" disabled={saving} onClick={()=>claimMission(activeMission)}>{saving?'Verificando...':'Resgatar XP'}</button>}<button type="button" className="cv-button secondary cv-cancel-mission" onClick={()=>cancelMission(activeMission)}>✕ Cancelar missão</button></div></div>:completedMission?<div className="cv-quest cv-quest-single"><div className="cv-quest-info"><b>✓ Missão concluída</b><small>Você recebeu +{completedMission.xp} XP. Escolha outra missão quando quiser.</small></div></div>:<button className="cv-button" onClick={()=>setShowMissionChoices(true)}>🎯 Escolher missão</button>}{showMissionChoices&&<div className="cv-mission-choices"><div className="cv-section-head"><b>Escolha a dificuldade</b><button className="cv-icon" onClick={()=>setShowMissionChoices(false)}><X size={18}/></button></div><div className="cv-mission-choice-grid">{DIFFICULTIES.map(d=>{const mm=missions[d.key]&&missions[d.key].date===today()&&!missions[d.key].cancelled&&!missions[d.key].completed;return <button type="button" key={d.key} className={difficulty===d.key?'active':''} onClick={()=>{setDifficulty(d.key);setShowMissionChoices(false);if(!mm)missionFor(d.key)}}><strong>{d.label}</strong><small>{mm?missionProgress(missions[d.key])+'/'+missions[d.key].target:'+'+d.xp+' XP'}</small></button>})}</div></div>}</div>;
 `;
s = s.slice(0, missionStart) + missionBlock + s.slice(missionEnd);

const boardStart = s.indexOf(' board:<section>');
const achievementsStart = s.indexOf('achievements:<section>', boardStart);
if (boardStart >= 0 && achievementsStart > boardStart) {
  const boardBlock = ` board:<section><div className="cv-card cv-global-board"><div className="cv-section-head"><div><h2>🏆 Placar Global</h2><p className="cv-muted">Os 5 melhores ficam em destaque. Os demais aparecem na classificação normal.</p></div></div><div className="cv-switch cv-board-switch"><button type="button" className={boardMode==='level'?'active':''} onClick={()=>setBoardMode('level')}>Nível</button><button type="button" className={boardMode==='time'?'active':''} onClick={()=>setBoardMode('time')}>Tempo</button></div>{board.length>0&&<><div className="cv-top5-title">👑 Top 5 em destaque</div><div className="cv-top5">{board.slice(0,5).map((p,i)=><button type="button" className={'cv-top5-card rank-'+(i+1)} key={p.id} onClick={()=>openProfile(p)}><span className="cv-top5-rank">{i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span><div className="cv-avatar podium-avatar">{p.avatar_url?<img src={p.avatar_url} alt=""/>:(p.name||'A')[0]}</div><strong>{p.name||'Aventureiro'}</strong><small>{boardMode==='level'?'Nível '+(p.level||1)+' · '+(p.total_xp||0)+' XP':Math.floor((p.usage_seconds||0)/60)+' min de jornada'}</small><span>{i===0?'Lenda Global':i===1?'Elite Global':i===2?'Veterano Global':'Top '+(i+1)+' Global'}</span></button>)}</div><div className="cv-top5-title normal">📋 Classificação</div>{board.slice(5).map((p,i)=><button type="button" className="cv-rank" key={p.id} onClick={()=>openProfile(p)}><b>#{i+6}</b><div className="cv-avatar tiny">{p.avatar_url?<img src={p.avatar_url} alt=""/>:(p.name||'A')[0]}</div><div><strong>{p.name||'Aventureiro'}</strong><small>{boardMode==='level'?'Nível '+(p.level||1)+' · '+(p.total_xp||0)+' XP':Math.floor((p.usage_seconds||0)/60)+' min de jornada'}</small></div><ChevronRight size={16}/></button>)}</>}{board.length===0&&<p className="cv-muted">Nenhum jogador disponível.</p>}</div></section>,
`;
  s = s.slice(0, boardStart) + boardBlock + s.slice(achievementsStart);
}

const cssMarker = 'const css=`';
const cssAdd = `
/* ${MARK} */
.cv-global-board .cv-switch{position:static!important;display:flex!important;width:100%!important;margin:12px 0 18px!important;transform:none!important;box-sizing:border-box!important;overflow:hidden!important}
.cv-global-board .cv-switch button{position:static!important;flex:1 1 50%!important;width:50%!important;min-height:52px!important;transform:none!important;box-sizing:border-box!important}
.cv-top5{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;align-items:stretch}
.cv-top5-card{min-width:0!important;width:100%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:12px 7px!important;border:1px solid #7A4356!important;border-radius:16px!important;background:#291C2B!important;color:#F5EFE6!important;box-sizing:border-box!important;overflow:hidden!important}
.cv-top5-card strong,.cv-top5-card small,.cv-top5-card span{max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
.cv-top5-rank{font-size:22px!important}.cv-top5-title{font-weight:900;margin:12px 0 8px;color:#E7CD8C}.cv-top5-title.normal{margin-top:20px}.cv-global-board .cv-rank{width:100%!important;box-sizing:border-box!important;margin-bottom:8px}
.cv-missions-clean .cv-quest-single{display:flex!important;flex-direction:column!important;gap:12px!important}.cv-mission-actions{display:flex!important;gap:8px!important;flex-wrap:wrap!important}.cv-mission-actions .cv-button{flex:1 1 180px!important}.cv-cancel-mission{display:flex!important;visibility:visible!important;opacity:1!important}.cv-mission-choices{margin-top:14px;padding:12px;border:1px solid #7A4356;border-radius:14px;background:#291C2B}.cv-mission-choice-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.cv-mission-choice-grid button{min-width:0!important;padding:12px!important;border:1px solid #7A4356;border-radius:10px;background:#1E1520;color:#F5EFE6}.cv-mission-choice-grid button.active{background:#C9A455;color:#140D12}.cv-mission-choice-grid small{display:block;margin-top:4px}
@media(max-width:700px){.cv-top5{grid-template-columns:repeat(2,minmax(0,1fr))}.cv-top5-card:first-child{grid-column:1/-1}.cv-mission-choice-grid{grid-template-columns:1fr 1fr}.cv-mission-actions{width:100%}.cv-mission-actions .cv-button{flex:1 1 100%}}
`;
if (!s.includes('.cv-top5{') && s.includes(cssMarker)) {
  s = s.replace(cssMarker, cssMarker + cssAdd);
}

if (!s.includes('import AdminPanel from "./src/AdminPanel"')) {
  const reactImportEnd = 'import React, { useEffect, useMemo, useRef, useState } from "react";';
  if (s.includes(reactImportEnd)) s = s.replace(reactImportEnd, reactImportEnd + '\nimport AdminPanel from "./src/AdminPanel";');
}
if (!s.includes('<AdminPanel/>')) {
  const idx = s.lastIndexOf('</main>');
  if (idx >= 0) s = s.slice(0, idx) + '<AdminPanel/>' + s.slice(idx);
}

fs.writeFileSync(file, s);
console.log('Final mission, leaderboard and admin integration applied');
