import fs from 'node:fs';

const file = 'codex-vitae.jsx';
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, 'utf8');

// final-ui-admin-fix can use the stable content marker when the old schedule
// block was already removed. Restore the small leaderboard declarations that
// live between the mission card and the content object.
if (!s.includes('const myGlobalRank=')) {
  const contentStart = s.indexOf('const content={');
  if (contentStart >= 0) {
    const restore = `
 const myGlobalRank=board.findIndex(p=>p.id===session?.user?.id)+1;
 const globalTitle=myGlobalRank===1?'Lenda Global':myGlobalRank===2?'Elite Global':myGlobalRank===3?'Veterano Global':myGlobalRank>0?'Top '+myGlobalRank+' Global':'Aventureiro Global';
 const globalRankCard=myGlobalRank>0?<div className="cv-card cv-my-global"><div><span className="cv-global-label">👑 PLACAR GLOBAL</span><h3>{globalTitle}</h3><p>Você está em <b>#{myGlobalRank}</b> entre os jogadores.</p></div><div className="cv-global-badge">{myGlobalRank<=3?'👑':'#'+myGlobalRank}</div></div>:null;
`;
    s = s.slice(0, contentStart) + restore + s.slice(contentStart);
  }
}

fs.writeFileSync(file, s);
console.log('Final UI markers repaired');
