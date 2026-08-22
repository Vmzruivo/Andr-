import fs from 'node:fs';

const path = 'codex-vitae.jsx';
if (!fs.existsSync(path)) process.exit(0);

let s = fs.readFileSync(path, 'utf8');

// Keep the global board controls in normal document flow on small screens.
s = s.replace(/className="cv-board-toggle/g, 'className="cv-board-toggle cv-board-toggle-fixed');
s = s.replace(/className='cv-board-toggle/g, "className='cv-board-toggle cv-board-toggle-fixed");

const css = `\n<style id="cv-board-mission-layout-fix">\n.cv-board-toggle-fixed{position:relative!important;top:auto!important;right:auto!important;left:auto!important;bottom:auto!important;z-index:1!important;display:flex!important;width:100%!important;min-height:56px!important;margin:12px 0 16px!important;transform:none!important;overflow:hidden!important;box-sizing:border-box!important}\n.cv-board-toggle-fixed>*{position:static!important;flex:1 1 50%!important;width:auto!important;min-width:0!important;box-sizing:border-box!important}\n.cv-board-toggle-fixed button{min-height:56px!important;white-space:nowrap!important}\n@media(max-width:600px){.cv-board-toggle-fixed{margin:12px 0 18px!important}.cv-board-toggle-fixed button{font-size:16px!important;padding:12px 8px!important}.cv-board-toggle-fixed+*{margin-top:0!important}}\n.cv-quest-panel,.cv-quest-list{width:100%!important;max-width:100%!important;box-sizing:border-box!important}\n.cv-quest{width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow:hidden!important}\n.cv-quest-info{min-width:0!important;width:auto!important;overflow-wrap:anywhere!important;word-break:normal!important}\n.cv-quest button{max-width:100%!important;white-space:normal!important}\n</style>\n`;
if (!s.includes('cv-board-mission-layout-fix')) s += css;

fs.writeFileSync(path, s);

// Also provide cancellation semantics to existing mission controls without touching the database schema.
const missionCancel = `\n// Mission cancellation helper: UI can call this with the active mission state.\nexport function cancelActiveMission(setMission) {\n  if (typeof setMission === 'function') setMission(null);\n}\n`;
if (!s.includes('cancelActiveMission')) fs.appendFileSync(path, missionCancel);
