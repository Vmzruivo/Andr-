import fs from 'node:fs';

const file='codex-vitae.jsx';
if(!fs.existsSync(file)) process.exit(0);
let s=fs.readFileSync(file,'utf8');

// Always rebuild the mission card with an explicit, visible cancellation action.
const start=s.indexOf('const missionCard=');
const end=s.indexOf('const myGlobalRank=',start);
if(start<0||end<0){console.log('Mission card markers not found; leaving file unchanged.');process.exit(0)}

const replacement=`const missionCard=<div className="cv-card cv-missions-card"><div className="cv-section-head"><div><h2>Missão do sistema</h2><p className="cv-muted">Você pode manter uma missão ativa por dificuldade.</p></div><b>{activeMissionCount}/5 ativas</b></div><div className="cv-switch cv-mission-difficulties" style={{margin:"14px 0",display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))"}}>{DIFFICULTIES.map(d=>{const mm=missions[d.key]&&missions[d.key].date===today()?missions[d.key]:null;return <button key={d.key} className={difficulty===d.key?"active":""} onClick={()=>setDifficulty(d.key)}>{d.label}<small>{mm?.completed?"✓ concluída":mm?.cancelled?"✕ cancelada":mm?\`${missionProgress(mm)}/\${mm.target}\`:\`${d.xp} XP\`}</small></button>})}</div>{!activeMission?<button className="cv-button" onClick={()=>missionFor(difficulty)}>🎯 Receber missão de {DIFFICULTIES.find(d=>d.key===difficulty)?.label}</button>:activeMission.cancelled?<div className="cv-quest"><div className="cv-quest-info"><b>Missão cancelada</b><small>Esta missão foi cancelada.</small></div></div>:activeMission.completed?<div className="cv-quest"><div className="cv-quest-info"><b>{activeMission.title}</b><small>Missão concluída.</small></div><Check/></div>:<div className="cv-quest cv-active-mission"><div className="cv-quest-info"><b>{activeMission.title}</b><small>{activeMission.desc}</small><div className="cv-progress"><span style={{width:\`${Math.min(100,mp/activeMission.target*100)}%\`}}/></div><small>{mp}/{activeMission.target} · +{activeMission.xp} XP</small></div><div className="cv-mission-actions">{missionReady(activeMission)&&<button className="cv-button" disabled={saving} onClick={()=>claimMission(activeMission)}>{saving?"Verificando...":"🏆 Resgatar XP"}</button>}<button type="button" className="cv-button cv-cancel-mission" onClick={()=>cancelMission(activeMission)}>✕ Cancelar missão</button></div></div>}</div>;
`;
s=s.slice(0,start)+replacement+s.slice(end);

const css=`\n<style id="cv-mission-cancel-fix">\n.cv-missions-card{overflow:visible!important}\n.cv-active-mission{display:flex!important;align-items:stretch!important;gap:14px!important;flex-wrap:wrap!important}\n.cv-active-mission .cv-quest-info{flex:1 1 260px!important;min-width:0!important}\n.cv-mission-actions{display:flex!important;flex:0 1 220px!important;flex-direction:column!important;gap:8px!important;justify-content:center!important}\n.cv-mission-actions .cv-button{width:100%!important;position:static!important;transform:none!important}\n.cv-cancel-mission{background:#7A4356!important;color:#F5EFE6!important;border:1px solid #A65C73!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:46px!important;visibility:visible!important;opacity:1!important}\n@media(max-width:600px){.cv-mission-difficulties{grid-template-columns:repeat(2,minmax(0,1fr))!important}.cv-mission-actions{flex-basis:100%!important;width:100%!important}.cv-cancel-mission{min-height:48px!important;font-size:15px!important}}\n</style>\n`;
if(!s.includes('cv-mission-cancel-fix')) s+=css;
fs.writeFileSync(file,s);
console.log('Mission cancellation UI fixed.');
