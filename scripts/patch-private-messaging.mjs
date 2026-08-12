import fs from 'node:fs';

const lib='src/lib/supabaseClient.js';
let s=fs.readFileSync(lib,'utf8');
const oldCreate=`export async function createPrivateConversation(myId,otherId){if(myId===otherId)throw new Error("Você não pode conversar consigo mesmo.");const {data,error}=await supabase.rpc("create_private_conversation",{p_other_user_id:otherId});if(error)throw error;return data}`;
const newCreate=`export async function createPrivateConversation(myId,otherId){if(!myId||myId===otherId)throw new Error("Você não pode conversar consigo mesmo.");const {data,error}=await supabase.rpc("create_private_conversation",{p_other_user_id:otherId});if(error)throw error;if(!data)throw new Error("Não foi possível abrir a conversa.");return data}`;
if(s.includes(oldCreate))s=s.replace(oldCreate,newCreate);
fs.writeFileSync(lib,s);

const app='codex-vitae.jsx';
s=fs.readFileSync(app,'utf8');

// Keep the private-chat flow reachable from the player list itself, not only
// after opening a profile modal. This is deliberately idempotent.
const marker='CODEX_PRIVATE_CHAT_ACTIONS_V3';
if(!s.includes(marker)){
  const oldTop=`<button className={`cv-podium rank-${i+1}`} key={p.id} onClick={()=>openProfile(p)}>`;
  const newTop=`<div className={`cv-podium rank-${i+1}`} key={p.id} onClick={()=>openProfile(p)} role="button" tabIndex={0} onKeyDown={e=>e.key==="Enter"&&openProfile(p)}>`;
  if(s.includes(oldTop))s=s.replace(oldTop,newTop);
  const oldTopEnd=`<span className="cv-rank-benefit">{i===0?"Lenda Global · destaque máximo":i===1?"Elite Global · destaque especial":"Veterano Global · destaque especial"}</span></button>)}`;
  const newTopEnd=`<span className="cv-rank-benefit">{i===0?"Lenda Global · destaque máximo":i===1?"Elite Global · destaque especial":"Veterano Global · destaque especial"}</span>{p.id!==session.user.id&&<button type="button" className="cv-button cv-chat-player" onClick={e=>{e.stopPropagation();startChat(p.id)}}><MessageCircle size={14}/> Conversar</button>}</div>)}`;
  if(s.includes(oldTopEnd))s=s.replace(oldTopEnd,newTopEnd);

  const oldRank=`<button className="cv-rank" key={p.id} onClick={()=>openProfile(p)}>`;
  const newRank=`<div className="cv-rank" key={p.id} onClick={()=>openProfile(p)} role="button" tabIndex={0} onKeyDown={e=>e.key==="Enter"&&openProfile(p)}>`;
  if(s.includes(oldRank))s=s.replace(oldRank,newRank);
  const oldRankEnd=`<ChevronRight size={16}/></button>)}{board.length===0`;
  const newRankEnd=`<button type="button" className="cv-button cv-chat-player" onClick={e=>{e.stopPropagation();startChat(p.id)}}><MessageCircle size={14}/> Conversar</button><ChevronRight size={16}/></div>)}{board.length===0`;
  if(s.includes(oldRankEnd))s=s.replace(oldRankEnd,newRankEnd);

  const oldModal=`{profileView.id!==session.user.id&&<button className="cv-button" onClick={()=>{setProfileView(null);startChat(profileView.id)}}><MessageCircle size={16}/> Conversar</button>}`;
  const newModal=`{profileView.id&&profileView.id!==session.user.id&&<button type="button" className="cv-button cv-chat-primary" onClick={()=>{setProfileView(null);startChat(profileView.id)}}><MessageCircle size={17}/> Conversar em privado</button>}`;
  if(s.includes(oldModal))s=s.replace(oldModal,newModal);

  s=s.replace('const css=`',`/* ${marker} */\nconst css=\``);
  s=s.replace('.cv-rank-benefit{','.cv-chat-player{font-size:10px;padding:7px 9px;margin-top:4px;width:100%}.cv-chat-primary{margin-top:12px!important}.cv-rank-benefit{');
}
fs.writeFileSync(app,s);
console.log('Private chat actions exposed on player cards and profile modal');