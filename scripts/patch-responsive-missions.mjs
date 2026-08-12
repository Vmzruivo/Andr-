import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
const marker='CODEX_RESPONSIVE_MISSIONS_V3';
if(s.includes(marker)){console.log('responsive missions already applied');process.exit(0)}
const oldGrid='gridTemplateColumns:"repeat(5,minmax(0,1fr))"';
const newGrid='gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:6,width:"100%",minWidth:0';
if(s.includes(oldGrid))s=s.replace(oldGrid,newGrid);
const oldButton='style={{minWidth:0,width:"100%",padding:"7px 3px",fontSize:"clamp(8px,2.7vw,12px)",lineHeight:1.15,whiteSpace:"normal",overflow:"hidden",wordBreak:"break-word"}}';
const newButton='style={{minWidth:0,width:"100%",height:"54px",padding:"8px 4px",fontSize:"clamp(10px,3.4vw,14px)",lineHeight:1.15,whiteSpace:"normal",overflow:"hidden",wordBreak:"normal",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}';
if(s.includes(oldButton))s=s.replace(oldButton,newButton);
const oldSmall='style={{display:"block",marginTop:3,fontSize:"clamp(7px,2.2vw,10px)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}';
const newSmall='style={{display:"block",fontSize:"clamp(9px,2.7vw,11px)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}';
if(s.includes(oldSmall))s=s.replace(oldSmall,newSmall);
const cssMarker='/* '+marker+' */';
if(!s.includes(cssMarker))s=s.replace('const GOLD=',cssMarker+'\nconst GOLD=');
fs.writeFileSync(f,s);
console.log('mission difficulty buttons enlarged for visibility');