import fs from 'node:fs';

const clientFile = 'src/lib/supabaseClient.js';
const appFile = 'codex-vitae.jsx';
if (!fs.existsSync(clientFile)) throw new Error(`Arquivo não encontrado: ${clientFile}`);
if (!fs.existsSync(appFile)) throw new Error(`Arquivo não encontrado: ${appFile}`);

// Keep the existing RPC/security model, but never trust the order returned by it.
let client = fs.readFileSync(clientFile, 'utf8');
const oldLeaderboard = /export async function getLeaderboard\(mode="level",limit=5000\)\{[\s\S]*?\n\}/;
const newLeaderboard = `export async function getLeaderboard(mode="level",limit=5000){
  const safeMode=mode==="time"?"time":"level";
  const {data,error}=await supabase.rpc("get_global_leaderboard",{p_mode:safeMode,p_limit:safeLimit(limit,5000)});
  if(error)throw error;
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
  const rows=(data||[]).filter(Boolean).map(p=>({...p,level:Math.max(1,Math.floor(num(p.level)||1)),total_xp:Math.max(0,num(p.total_xp)),usage_seconds:Math.max(0,num(p.usage_seconds)),quests_completed_ever:Math.max(0,num(p.quests_completed_ever))}));
  rows.sort((a,b)=>safeMode==="time"
    ? num(b.usage_seconds)-num(a.usage_seconds)||num(b.total_xp)-num(a.total_xp)||num(b.level)-num(a.level)||num(b.quests_completed_ever)-num(a.quests_completed_ever)||String(a.id||"").localeCompare(String(b.id||""))
    : num(b.level)-num(a.level)||num(b.total_xp)-num(a.total_xp)||num(b.quests_completed_ever)-num(a.quests_completed_ever)||num(b.usage_seconds)-num(a.usage_seconds)||String(a.id||"").localeCompare(String(b.id||""))
  );
  return rows.slice(0,safeLimit(limit,5000));
}`;
if (!oldLeaderboard.test(client)) throw new Error('Função getLeaderboard não encontrada para correção.');
client = client.replace(oldLeaderboard,newLeaderboard);
fs.writeFileSync(clientFile,client);

let app = fs.readFileSync(appFile,'utf8');
const oldBoardEffect = /useEffect\(\(\)=>\{if\(tab!=="board"\|\|!session\)return;getLeaderboard\(boardMode\)\.then\(setBoard\)\.catch\(e=>setError\(e\.message\)\)\},\[tab,boardMode,session\]\);/;
const newBoardEffect = `useEffect(()=>{if(tab!=="board"||!session)return;let stopped=false;const loadBoard=async()=>{try{const rows=await getLeaderboard(boardMode,5000);if(!stopped)setBoard(rows)}catch(e){if(!stopped)setError(e?.message||"Não foi possível atualizar o placar global.")}};loadBoard();const timer=setInterval(loadBoard,60000);return()=>{stopped=true;clearInterval(timer)}},[tab,boardMode,session]);`;
if (oldBoardEffect.test(app)) app=app.replace(oldBoardEffect,newBoardEffect);

const oldRankEffect = /useEffect\(\(\)=>\{if\(!session\)return;getLeaderboard\("level"\)\.then\(rows=>\{const i=rows\.findIndex\(p=>p\.id===session\.user\.id\);setGlobalRank\(i\)\}\)\.catch\(\()=>setGlobalRank\(-1\)\)\},\[session,profile\?\.total_xp\]\);/;
const newRankEffect = `useEffect(()=>{if(!session)return;let stopped=false;const loadMyRank=async()=>{try{const rows=await getLeaderboard("level",5000);const i=rows.findIndex(p=>p.id===session.user.id);if(!stopped)setGlobalRank(i)}catch{if(!stopped)setGlobalRank(-1)}};loadMyRank();const timer=setInterval(loadMyRank,60000);return()=>{stopped=true;clearInterval(timer)}},[session,profile?.level,profile?.total_xp]);`;
if (oldRankEffect.test(app)) app=app.replace(oldRankEffect,newRankEffect);

if (!app.includes('CODEX_GLOBAL_LEADERBOARD_RUNTIME_V2')) {
  app = app.replace(/\n\s*const \[session,/, '\n // CODEX_GLOBAL_LEADERBOARD_RUNTIME_V2\n const [session,');
}
fs.writeFileSync(appFile,app);
console.log('Global leaderboard runtime fix applied: level/XP ordering + 60s refresh.');
