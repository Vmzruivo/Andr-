import fs from 'node:fs';
const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
// Emergency-safe fallback: older UI patches can reference homeGoalSchedule without
// defining it. Keep the app bootable; the schedule is optional UI.
if(!/\bconst\s+homeGoalSchedule\s*=/.test(s)){
  const marker='export default function CodexVitae(){';
  if(!s.includes(marker)) throw new Error('CodexVitae component marker not found');
  s=s.replace(marker,'const homeGoalSchedule=null;\n\n'+marker);
  fs.writeFileSync(file,s);
  console.log('homeGoalSchedule fallback inserted');
}else{
  console.log('homeGoalSchedule already defined');
}
