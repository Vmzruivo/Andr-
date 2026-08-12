import fs from 'node:fs';

const source = fs.readFileSync('codex-vitae.jsx', 'utf8');
const guards = [
  ['scripts/patch-missions.mjs', 'const MISSION_POOLS=', 'const MISSION_POOLS='],
  ['scripts/patch-avatar.mjs', 'function resizeImage(file,max=720)', 'function resizeImage(file,max=720)'],
  ['scripts/patch-leaderboard.mjs', 'cv-top3', 'cv-top3'],
  ['scripts/patch-rank-rewards.mjs', 'cv-rank-rewards', 'cv-rank-rewards'],
  ['scripts/patch-social.mjs', 'const beginEditPost=', 'const beginEditPost='],
  ['scripts/patch-global-title.mjs', 'const globalTitle=', 'const globalTitle='],
  ['scripts/patch-settings.mjs', 'cv-settings-page', 'cv-settings-page'],
];

for (const [file, sourceMarker, guardMarker] of guards) {
  if (!fs.existsSync(file) || !source.includes(sourceMarker)) continue;
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('CODEX_IDEMPOTENT_GUARD')) continue;
  const readNeedle = "let s=fs.readFileSync(f,'utf8');";
  const readNeedle2 = "let s=fs.readFileSync(file,'utf8');";
  const guard = `\n// CODEX_IDEMPOTENT_GUARD\nif (s.includes(${JSON.stringify(guardMarker)})) { console.log("Already patched: ${file}"); process.exit(0); }\n`;
  if (s.includes(readNeedle)) s = s.replace(readNeedle, readNeedle + guard);
  else if (s.includes(readNeedle2)) s = s.replace(readNeedle2, readNeedle2 + guard);
  fs.writeFileSync(file, s);
}
