import fs from 'node:fs';
const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');

s=s.replace(
 'const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[tab,setTab]=useState("home"),[posts,setPosts]=useState([]),[likes,setLikes]=useState(new Set()),[board,setBoard]=useState([]),[boardMode,setBoardMode]=useState("level")',
 'const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[tab,setTab]=useState("home"),[posts,setPosts]=useState([]),[likes,setLikes]=useState(new Set()),[board,setBoard]=useState([]),[globalRank,setGlobalRank]=useState(-1),[boardMode,setBoardMode]=useState("level")'
);

const anchor='useEffect(()=>{if(tab!=="board"||!session)return;getLeaderboard(boardMode).then(setBoard).catch(e=>setError(e.message))},[tab,boardMode,session]);';
const rankEffect=anchor+'\n useEffect(()=>{if(!session)return;getLeaderboard("level").then(rows=>{const i=rows.findIndex(p=>p.id===session.user.id);setGlobalRank(i)}).catch(()=>setGlobalRank(-1))},[session,profile?.total_xp]);';
if(s.includes(anchor)&&!s.includes('setGlobalRank(i)')) s=s.replace(anchor,rankEffect);

const old='const completeQuest=async q=>{if(!session)return;setError("");const date=today();const done=q.dates.includes(date);const dates=done?q.dates.filter(d=>d!==date):[...q.dates,date];setQuests(xs=>xs.map(x=>x.id===q.id?{...x,dates}:x));const xpDelta=done?-q.xp:q.xp;const nextXp=Math.max(0,(effectiveProfile.total_xp||0)+xpDelta);';
const neu='const completeQuest=async q=>{if(!session)return;setError("");const date=today();const done=q.dates.includes(date);const dates=done?q.dates.filter(d=>d!==date):[...q.dates,date];setQuests(xs=>xs.map(x=>x.id===q.id?{...x,dates}:x));let xpDelta=done?-q.xp:q.xp;let dailyRankBonus=0;if(!done){try{const key=`codex-vitae-rank-bonus:${session.user.id}:${date}`;const claimed=localStorage.getItem(key)==="1";if(!claimed&&globalRank>=0&&globalRank<3){dailyRankBonus=[50,30,20][globalRank];localStorage.setItem(key,"1")}}catch{} }xpDelta+=dailyRankBonus;const nextXp=Math.max(0,(effectiveProfile.total_xp||0)+xpDelta);';
if(!s.includes('dailyRankBonus')&&s.includes(old)) s=s.replace(old,neu);

fs.writeFileSync(file,s);
console.log('Rank rewards patch applied');
