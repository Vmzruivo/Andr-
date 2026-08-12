import fs from 'node:fs';
const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
const marker='CODEX_FRIENDS_FEED_V1';
if(s.includes(marker)){console.log('friends feed already patched');process.exit(0)}
// Import the friends-only query.
s=s.replace('getFeed, publishPost','getFeed, getFriendsFeed, publishPost');
// Add feed mode state next to posts.
s=s.replace('[posts,setPosts]=useState([]),[likes', '[posts,setPosts]=useState([]),[feedMode,setFeedMode]=useState("global"),[likes');
// Make the initial feed load and realtime refresh respect the selected mode.
const old=/getFeed\(\)\.then\(setPosts\)\.catch\(e=>setError\(e\.message\)\)/;
if(old.test(s)) s=s.replace(old,'(feedMode==="friends"?getFriendsFeed(session.user.id):getFeed()).then(setPosts).catch(e=>setError(e.message))');
// Add a dedicated mode effect after the main session feed effect if the exact line above was found.
const feedEffect=' useEffect(()=>{if(!session)return;(feedMode==="friends"?getFriendsFeed(session.user.id):getFeed()).then(setPosts).catch(e=>setError(e.message))},[session,feedMode]);';
if(!s.includes(feedEffect)){
  const anchor=' const unlocked=ACHIEVEMENTS.filter';
  if(s.includes(anchor)) s=s.replace(anchor,feedEffect+'\n'+anchor);
}
// Add the selector above the composer.
const heading='<h2>Feed da comunidade</h2>';
const replacement='<div className="cv-section-head"><div><h2>Feed da comunidade</h2><p className="cv-muted">Escolha entre todas as publicações ou somente as dos seus amigos.</p></div><div className="cv-feed-tabs"><button className={feedMode==="global"?"active":""} onClick={()=>setFeedMode("global")}>🌎 Global</button><button className={feedMode==="friends"?"active":""} onClick={()=>setFeedMode("friends")}>👥 Amigos</button></div></div>';
if(s.includes(heading)) s=s.replace(heading,replacement);
// Add a friendly empty state for the friends feed.
s=s.replace('{posts.length===0&&<div className="cv-card cv-muted">Ainda não há publicações.</div>}', '{posts.length===0&&<div className="cv-card cv-muted">{feedMode==="friends"?"Seus amigos ainda não publicaram nada, ou você ainda não tem amigos adicionados.":"Ainda não há publicações."}</div>}');
// Styling: tabs stay usable on mobile.
const cssNeedle='.cv-actions{display:flex;gap:8px;margin-top:12px}';
const cssAdd='.cv-feed-tabs{display:flex;gap:6px;flex-wrap:wrap}.cv-feed-tabs button{border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;border-radius:10px;padding:7px 10px;cursor:pointer}.cv-feed-tabs button.active{background:#C9A455;color:#140D12;border-color:#C9A455}';
if(s.includes(cssNeedle)&&!s.includes('.cv-feed-tabs{'))s=s.replace(cssNeedle,cssNeedle+cssAdd);
// Add marker without changing application semantics.
s='/* '+marker+' */\n'+s;
fs.writeFileSync(file,s);
console.log('Global/Friends feed patch applied');
