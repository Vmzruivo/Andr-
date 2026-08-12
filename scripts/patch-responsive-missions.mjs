import fs from 'node:fs';
const f='codex-vitae.jsx';
let s=fs.readFileSync(f,'utf8');
const marker='/* CODEX_RESPONSIVE_MISSIONS_V1 */';
if(s.includes(marker)){console.log('responsive missions already applied');process.exit(0)}
const css=`<style>${marker}
.cv-switch{grid-template-columns:repeat(5,minmax(0,1fr)) !important;gap:4px !important;width:100%;min-width:0;overflow:hidden}
.cv-switch button{min-width:0 !important;width:100%;padding:7px 3px !important;font-size:clamp(8px,2.7vw,12px) !important;line-height:1.15;white-space:normal;overflow:hidden;word-break:break-word}
.cv-switch button small{display:block;margin-top:3px;font-size:clamp(7px,2.2vw,10px) !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:380px){.cv-switch{gap:2px !important}.cv-switch button{padding:6px 1px !important;font-size:8px !important}.cv-switch button small{font-size:7px !important}}
</style>`;
const markerNeedle='return <';
const idx=s.indexOf(markerNeedle);
if(idx<0)throw new Error('React return not found');
s=s.slice(0,idx)+css+'\n'+s.slice(idx);
fs.writeFileSync(f,s);
console.log('responsive mission selector applied');