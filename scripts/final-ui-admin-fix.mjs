import fs from 'node:fs';

const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
const MARK='CODEX_FINAL_UI_ADMIN_FIX_V1';
if(s.includes(MARK)){console.log('final UI/admin fix already applied');process.exit(0)}

// Fix the leaderboard toggle overlay: the global .cv-switch rules used absolute positioning.
const cssStart=s.indexOf('const css=`');
if(cssStart>=0){
  const cssEnd=s.indexOf('`;',cssStart+11);
  if(cssEnd>cssStart){
    const css=`\n/* ${MARK} */\n.cv-global-board .cv-switch,.cv-global-board .cv-section-head .cv-switch{position:static!important;top:auto!important;right:auto!important;left:auto!important;bottom:auto!important;transform:none!important;z-index:1!important;float:none!important;display:flex!important;align-self:stretch!important;box-sizing:border-box!important;overflow:hidden!important;margin:12px 0 0!important}\n.cv-global-board .cv-switch button{position:static!important;flex:1 1 50%!important;width:50%!important;min-width:0!important;height:auto!important;min-height:52px!important;margin:0!important;transform:none!important;white-space:nowrap!important;box-sizing:border-box!important}\n@media(max-width:620px){.cv-global-board .cv-section-head{display:block!important}.cv-global-board .cv-section-head>div:first-child{width:100%!important}.cv-global-board .cv-switch{width:100%!important;margin-top:12px!important}.cv-global-board .cv-switch button{width:50%!important;min-height:54px!important}.cv-global-board .cv-board-list{margin-top:12px!important}}\n`;
    s=s.slice(0,cssEnd)+css+s.slice(cssEnd);
  }
}

// Mount the already-existing secure AdminPanel component. Its Supabase RPCs enforce admin permissions server-side.
if(!s.includes('import AdminPanel from "./src/AdminPanel"')){
  const reactImportEnd='import React, { useEffect, useMemo, useRef, useState } from "react";';
  if(s.includes(reactImportEnd)) s=s.replace(reactImportEnd,reactImportEnd+'\nimport AdminPanel from "./src/AdminPanel";');
}
if(!s.includes('<AdminPanel/>')){
  const idx=s.lastIndexOf('</main>');
  if(idx<0) throw new Error('main closing tag not found');
  s=s.slice(0,idx)+'<AdminPanel/>'+s.slice(idx);
}

fs.writeFileSync(file,s);
console.log('Final leaderboard and admin integration applied');
