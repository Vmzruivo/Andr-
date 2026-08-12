import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
const marker='CODEX_RESPONSIVE_MISSIONS_V2';
if(s.includes(marker)){console.log('responsive missions already applied');process.exit(0)}
const oldGrid='gridTemplateColumns:"repeat(5,1fr)"';
const newGrid='gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:4,width:"100%",minWidth:0';
if(s.includes(oldGrid))s=s.replace(oldGrid,newGrid);
const oldButton='onClick={()=>setDifficulty(d.key)}>{d.label}<small>{d.xp} XP</small>';
const newButton='onClick={()=>setDifficulty(d.key)} style={{minWidth:0,width:"100%",padding:"7px 3px",fontSize:"clamp(8px,2.7vw,12px)",lineHeight:1.15,whiteSpace:"normal",overflow:"hidden",wordBreak:"break-word"}}>{d.label}<small style={{display:"block",marginTop:3,fontSize:"clamp(7px,2.2vw,10px)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.xp} XP</small>';
if(s.includes(oldButton))s=s.replace(oldButton,newButton);
const cssMarker='/* '+marker+' */';
const css=`\n${cssMarker}\n`;
// Keep a simple marker so repeated builds remain no-ops after the inline replacements above.
if(!s.includes(cssMarker))s=s.replace('const GOLD=',cssMarker+'\nconst GOLD=');
fs.writeFileSync(f,s);
console.log('responsive mission selector applied');