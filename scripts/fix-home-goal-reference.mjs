import fs from 'node:fs';

const file = 'codex-vitae.jsx';
let s = fs.readFileSync(file, 'utf8');
let changed = false;

// The old schedule patch left a render reference behind. Remove the stale
// reference instead of inventing a placeholder component during build.
if (s.includes('{homeGoalSchedule}')) {
  s = s.replace(/\{homeGoalSchedule\}/g, '');
  changed = true;
}

// Remove an accidentally injected standalone schedule implementation, if any.
s = s.replace(/\/\/ CODEX_SCHEDULE_HOME_V3[\s\S]*?(?=const content=\{)/, '');

if (changed) fs.writeFileSync(file, s);
console.log(changed ? 'Removed stale homeGoalSchedule render reference' : 'Startup guard: no stale homeGoalSchedule reference found');
