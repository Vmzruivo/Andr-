import fs from 'node:fs';
const file='codex-vitae.jsx';let s=fs.readFileSync(file,'utf8');
const marker='const content={';
const block=` const myGlobalRank=board.findIndex(p=>p.id===session?.user?.id)+1;
 const globalTitle=myGlobalRank===1?'Lenda Global':myGlobalRank===2?'Elite Global':myGlobalRank===3?'Veterano Global':myGlobalRank>0?\`Top \${myGlobalRank} Global\`:'Aventureiro Global';
 const globalRankCard=myGlobalRank>0?<div className="cv-card cv-my-global"><div><span className="cv-global-label">👑 PLACAR GLOBAL</span><h3>{globalTitle}</h3><p>Você está em <b>#{myGlobalRank}</b> entre os jogadores.</p></div><div className="cv-global-badge">{myGlobalRank<=3?'👑':'#'+myGlobalRank}</div></div>:null;
`;
if(!s.includes(marker))throw Error('content não encontrado');s=s.replace(marker,block+marker);
const boardStart='board:<section>';
if(!s.includes(boardStart))throw Error('placar não encontrado');
s=s.replace(boardStart,'board:<section>{globalRankCard}');
const css=' .cv-my-global{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border:1px solid rgba(201,164,85,.35);background:linear-gradient(135deg,rgba(201,164,85,.12),rgba(255,255,255,.02))}.cv-global-label{font-size:10px;color:'+"${GOLD_LIGHT}"+';font-weight:900;letter-spacing:.08em}.cv-my-global h3{margin:4px 0 2px;font-family:Georgia,serif}.cv-my-global p{margin:0;color:'+"${MUTED}"+';font-size:12px}.cv-my-global b{color:'+"${TEXT}"+'}.cv-global-badge{font-size:25px;font-weight:900;color:'+"${GOLD_LIGHT}"+';min-width:45px;text-align:center}\n';
if(!s.includes('.cv-my-global{')){const media='@media(max-width:620px)';s=s.replace(media,css+media)}
fs.writeFileSync(file,s);console.log('Global title patch applied');
