import fs from 'node:fs';

const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
const MARK='CODEX_FRIEND_REQUESTS_UI_V1';
if(s.includes(MARK)){
  console.log('friend request UI already applied');
  process.exit(0);
}

const oldImport='getMyLikes, toggleLike, deleteMyAccount, claimSystemMission';
const newImport='getMyLikes, toggleLike, getFriendRequestStatus, sendFriendRequest, respondFriendRequest, getPendingFriendRequests, deleteMyAccount, claimSystemMission';
if(s.includes(oldImport)) s=s.replace(oldImport,newImport);
else throw new Error('supabase import anchor not found');

const stateNeedle='[posts,setPosts]=useState([]),[likes,setLikes]=useState(new Set())';
const stateReplacement='[posts,setPosts]=useState([]),[likes,setLikes]=useState(new Set()),[friendStatuses,setFriendStatuses]=useState({}),[pendingFriendRequests,setPendingFriendRequests]=useState([])';
if(!s.includes(stateNeedle)) throw new Error('state anchor not found');
s=s.replace(stateNeedle,stateReplacement);

const effectAnchor=' useEffect(()=>{if(!session)return;getFeed().then(setPosts)';
const friendEffect=' useEffect(()=>{if(!session)return;getPendingFriendRequests(session.user.id).then(setPendingFriendRequests).catch(()=>{})},[session]);\n useEffect(()=>{if(!session||!profileView?.id||profileView.id===session.user.id)return;getFriendRequestStatus(session.user.id,profileView.id).then(status=>setFriendStatuses(x=>({...x,[profileView.id]:status}))).catch(()=>{})},[session,profileView?.id]);\n';
if(!s.includes(friendEffect)){
  if(!s.includes(effectAnchor)) throw new Error('feed effect anchor not found');
  s=s.replace(effectAnchor,friendEffect+effectAnchor);
}

const fnAnchor=' const startChat=async otherId=>';
const friendFns=' const sendFriend=async userId=>{try{const r=await sendFriendRequest(session.user.id,userId);setFriendStatuses(x=>({...x,[userId]:r}));}catch(e){setError(e.message)}};\n const answerFriend=async(requestId,accept,userId)=>{try{const r=await respondFriendRequest(requestId,accept);setFriendStatuses(x=>({...x,[userId]:r}));setPendingFriendRequests(x=>x.filter(q=>q.id!==requestId));}catch(e){setError(e.message)}};\n';
if(!s.includes('const sendFriend=async')){
  if(!s.includes(fnAnchor)) throw new Error('function anchor not found');
  s=s.replace(fnAnchor,friendFns+fnAnchor);
}

const oldModal='{profileView.id!==session.user.id&&<button className="cv-button" onClick={()=>{setProfileView(null);startChat(profileView.id)}}><MessageCircle size={16}/> Conversar</button>}';
const newModal='{profileView.id!==session.user.id&&(()=>{const fr=friendStatuses[profileView.id];if(fr?.status==="accepted")return <><div className="cv-friend-accepted">✓ Vocês são amigos</div><button className="cv-button" onClick={()=>{setProfileView(null);startChat(profileView.id)}}><MessageCircle size={16}/> Conversar</button></>;if(fr?.status==="pending"&&fr.sender_id===session.user.id)return <button className="cv-button" disabled>Pedido enviado</button>;if(fr?.status==="pending"&&fr.receiver_id===session.user.id)return <div className="cv-friend-actions"><button className="cv-button" onClick={()=>answerFriend(fr.id,true,profileView.id)}>Aceitar</button><button className="cv-button secondary" onClick={()=>answerFriend(fr.id,false,profileView.id)}>Recusar</button></div>;return <button className="cv-button" onClick={()=>sendFriend(profileView.id)}>👥 Adicionar amigo</button>})()}';
if(!s.includes(oldModal)) throw new Error('profile modal action not found');
s=s.replace(oldModal,newModal);

const cssAnchor='.cv-message-author{';
const cssAdd='.cv-friend-accepted{margin-top:12px;padding:10px;border:1px solid rgba(201,164,85,.45);border-radius:10px;color:#E7CD8C;font-weight:800}.cv-friend-actions{display:flex;gap:8px;margin-top:12px}.cv-friend-actions .cv-button{flex:1}.cv-button.secondary{background:#291C2B;color:#F5EFE6;border:1px solid rgba(255,255,255,.08)}';
if(!s.includes('.cv-friend-accepted{')){
  if(!s.includes(cssAnchor)) throw new Error('CSS anchor not found');
  s=s.replace(cssAnchor,cssAdd+cssAnchor);
}

const pendingNeedle='<div className="cv-content">{content[tab]}</div>';
const pendingUi='{pendingFriendRequests.length>0&&<div className="cv-card cv-friend-inbox"><b>👥 Pedidos de amizade</b>{pendingFriendRequests.map(r=><div className="cv-friend-row" key={r.id}><span>{r.profiles?.name||"Aventureiro"}</span><button className="cv-button" onClick={()=>answerFriend(r.id,true,r.sender_id)}>Aceitar</button><button className="cv-button secondary" onClick={()=>answerFriend(r.id,false,r.sender_id)}>Recusar</button></div>)}</div>}';
if(!s.includes('cv-friend-inbox')){
  if(!s.includes(pendingNeedle)) throw new Error('content anchor not found');
  s=s.replace(pendingNeedle,pendingUi+pendingNeedle);
}

s=s.replace('const css=`',`/* ${MARK} */\nconst css=\``);
s=s.replace('.cv-message-author{', '.cv-friend-inbox{margin-bottom:12px}.cv-friend-row{display:flex;align-items:center;gap:7px;padding-top:9px}.cv-friend-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}.cv-friend-row .cv-button{padding:7px 9px;font-size:11px}.cv-message-author{');
fs.writeFileSync(file,s);
console.log('Friend request UI applied');
