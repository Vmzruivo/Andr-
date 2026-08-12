import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
if(s.includes('CODEX_MISSION_RELIABILITY_V2')){console.log('Mission reliability patch already applied');process.exit(0)}
// The mission reliability logic may already be present from a previous patch.
// Never fail the build just because the historical source anchor was replaced.
const oldImport='deleteMyAccount } from "./src/lib/supabaseClient";';
const newImport='deleteMyAccount, claimSystemMission } from "./src/lib/supabaseClient";';
if(s.includes(oldImport)) s=s.replace(oldImport,newImport);
const oldClaim='const claimMission=async m=>{if(!missionReady(m)||m.completed)return;const xp=(effectiveProfile.total_xp||0)+m.xp,li=levelInfo(xp);try{const p=await updateProgress(session.user.id,{total_xp:xp,level:li.level,quests_completed_ever:(effectiveProfile.quests_completed_ever||0)+1});setProfile(p);setMissions(x=>({...x,[m.difficulty]:{...m,completed:true}}));setMissionNotice(`Missão concluída: +${m.xp} XP`);setTimeout(()=>setMissionNotice(""),3500)}catch(e){setError(e.message)}};';
const newClaim='const claimMission=async m=>{if(!session||!missionReady(m)||m.completed||m.cancelled)return;setSaving(true);try{const p=await claimSystemMission(today(),m.difficulty,m.xp);setProfile(p);setMissions(x=>({...x,[m.difficulty]:{...m,completed:true,claimedAt:new Date().toISOString()}}));setMissionNotice(`Missão concluída: +${m.xp} XP`);setTimeout(()=>setMissionNotice(""),3500)}catch(e){setError(e.message)}finally{setSaving(false)}};';
if(s.includes(oldClaim)) s=s.replace(oldClaim,newClaim);
fs.writeFileSync(f,s+'\n// CODEX_MISSION_RELIABILITY_V2\n');
console.log('Mission reliability patch checked without blocking build');