import fs from "node:fs";

const file = "codex-vitae.jsx";
if (!fs.existsSync(file)) {
  console.warn("[missions] codex-vitae.jsx not found; skipping patch.");
  process.exit(0);
}

let s = fs.readFileSync(file, "utf8");

// 1) Mission factory. Replace only the exact section and tolerate previous patches.
const missionForStart = s.indexOf("const missionFor=");
const missionProgressStart = s.indexOf("const missionProgress=", missionForStart);
if (missionForStart >= 0 && missionProgressStart > missionForStart) {
  const missionForNew = `const missionFor=d=>{
  const old=missions[d];
  if(old&&old.date===today()&&!old.cancelled)return old;
  const pool=MISSION_POOLS[d]||[];
  if(!pool.length)return null;
  const rerolls=Number(old?.rerolls||0)+1;
  const base=pool[(missionSeed(today(),d)+rerolls)%pool.length];
  const m={...base,difficulty:d,xp:DIFFICULTIES.find(x=>x.key===d)?.xp||0,date:today(),completed:false,cancelled:false,rerolls};
  setMissions(x=>({...x,[d]:m}));
  return m;
};
`;
  s = s.slice(0, missionForStart) + missionForNew + s.slice(missionProgressStart);
}

// 2) Mission card. IMPORTANT: remove any old activeMission/mp declarations that
// may have been left immediately before the card by an earlier patch. This makes
// the script idempotent and prevents "Identifier ... has already been declared".
const cardMarker = "const missionCard=";
const myRankMarker = "const myGlobalRank=";
const cardStart = s.indexOf(cardMarker);
const rankStart = cardStart >= 0 ? s.indexOf(myRankMarker, cardStart) : -1;
if (cardStart >= 0 && rankStart > cardStart) {
  let replaceStart = cardStart;
  const activeBefore = s.lastIndexOf("const activeMission=", cardStart);
  const mpBefore = s.lastIndexOf("const mp=", cardStart);
  const cleanupStart = Math.max(activeBefore, mpBefore);
  if (cleanupStart >= 0 && cardStart - cleanupStart < 2500) replaceStart = cleanupStart;

  const missionCardNew = `const activeMission=missions[difficulty]&&missions[difficulty].date===today()?missions[difficulty]:null;
const mp=activeMission?missionProgress(activeMission):0;
const selectedDifficulty=DIFFICULTIES.find(d=>d.key===difficulty)||DIFFICULTIES[0];
const missionCard=<div className="cv-card cv-missions-card"><div className="cv-section-head"><div><h2>Missão do sistema</h2><p className="cv-muted">Escolha uma dificuldade para ver uma missão. Apenas uma aparece por vez.</p></div><b>{activeMissionCount}/5</b></div><div className="cv-mission-picker"><label htmlFor="cv-difficulty-select">Dificuldade</label><div className="cv-select-wrap"><select id="cv-difficulty-select" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>{DIFFICULTIES.map(d=><option key={d.key} value={d.key}>{d.label} · {d.xp} XP</option>)}</select><ChevronRight className="cv-select-arrow" size={18}/></div></div>{!activeMission?<div className="cv-mission-empty"><p>Nenhuma missão ativa nesta dificuldade.</p><button className="cv-button" type="button" onClick={()=>missionFor(difficulty)}>🎯 Receber missão de {selectedDifficulty.label}</button></div>:activeMission.cancelled?<div className="cv-quest cv-cancelled-mission"><div className="cv-quest-info"><b>Missão cancelada</b><small>Você pode escolher outra missão desta dificuldade agora.</small></div><button className="cv-button" type="button" onClick={()=>missionFor(difficulty)}>🔄 Receber nova missão</button></div>:activeMission.completed?<div className="cv-quest cv-completed-mission"><div className="cv-quest-info"><b>{activeMission.title}</b><small>Missão concluída.</small></div><Check size={22}/></div>:<div className="cv-quest cv-active-mission"><div className="cv-quest-info"><b>{activeMission.title}</b><small>{activeMission.desc}</small><div className="cv-progress"><span style={{width:(Math.min(100,mp/activeMission.target*100))+"%"}}/></div><small>{mp}/{activeMission.target} · +{activeMission.xp} XP</small></div><div className="cv-mission-actions">{missionReady(activeMission)&&<button className="cv-button" disabled={saving} onClick={()=>claimMission(activeMission)}>{saving?"Verificando...":"🏆 Resgatar XP"}</button>}<button type="button" className="cv-button cv-cancel-mission" onClick={()=>cancelMission(activeMission)}>✕ Cancelar missão</button></div></div>}</div>;
`;
  s = s.slice(0, replaceStart) + missionCardNew + s.slice(rankStart);
}

// 3) Global leaderboard refresh. The deterministic sorting itself is handled by
// fix-global-leaderboard-runtime.mjs; this patch only handles the UI fallback.
const boardAnchor = /useEffect\(\(\)=>\{if\(tab!=="board"\|\|!session\)return;getLeaderboard\(boardMode\)\.then\(setBoard\)\.catch\(e=>setError\(e\.message\)\)\},\[tab,boardMode,session\]\);/;
const boardEffect = `const sortLeaderboard=(rows,mode)=>[...(rows||[])].sort((a,b)=>mode==="time"?Number(b.usage_seconds||0)-Number(a.usage_seconds||0)||Number(b.total_xp||0)-Number(a.total_xp||0):Number(b.level||1)-Number(a.level||1)||Number(b.total_xp||0)-Number(a.total_xp||0)||Number(b.quests_completed_ever||0)-Number(a.quests_completed_ever||0));
 useEffect(()=>{if(tab!=="board"||!session)return;let cancelled=false;const load=async()=>{try{const rows=await getLeaderboard(boardMode,5000);if(!cancelled)setBoard(sortLeaderboard(rows,boardMode))}catch(e){if(!cancelled)setError(e?.message||"Não foi possível atualizar o placar global.")}};load();const timer=setInterval(load,60000);return()=>{cancelled=true;clearInterval(timer)}},[tab,boardMode,session]);`;
if (!s.includes("const sortLeaderboard=") && boardAnchor.test(s)) s = s.replace(boardAnchor, boardEffect);

// 4) Keep the user's displayed global rank synchronized every minute.
const rankEffectRe = /useEffect\(\(\)=>\{if\(!session\)return;getLeaderboard\("level"\)\.then\(rows=>\{const i=rows\.findIndex\(p=>p\.id===session\.user\.id\);setGlobalRank\(i\)\}\)\.catch\(\(\)=>setGlobalRank\(-1\)\)\},\[session,profile\?\.total_xp\]\);/;
const rankEffectNew = `useEffect(()=>{if(!session)return;let cancelled=false;const loadRank=async()=>{try{const rows=await getLeaderboard("level",5000);const i=rows.findIndex(p=>p.id===session.user.id);if(!cancelled)setGlobalRank(i)}catch{if(!cancelled)setGlobalRank(-1)}};loadRank();const timer=setInterval(loadRank,60000);return()=>{cancelled=true;clearInterval(timer)}},[session,profile?.level,profile?.total_xp]);`;
if (rankEffectRe.test(s)) s = s.replace(rankEffectRe, rankEffectNew);

fs.writeFileSync(file, s);
console.log("[missions] mobile mission and leaderboard patch applied safely.");
