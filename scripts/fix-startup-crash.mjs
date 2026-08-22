import fs from 'node:fs';

const file = 'codex-vitae.jsx';
let s = fs.readFileSync(file, 'utf8');
let changed = false;

// Remove the stale render reference that caused the production startup crash.
if (s.includes('{homeGoalSchedule}')) {
  s = s.replace(/\{homeGoalSchedule\}/g, '');
  changed = true;
}

// Remove an accidentally injected standalone schedule declaration if present.
s = s.replace(/\/\/ CODEX_SCHEDULE_HOME_V3[\s\S]*?(?=const content=\{)/, '');

if (changed) fs.writeFileSync(file, s);
console.log(changed ? 'Removed stale homeGoalSchedule reference' : 'No stale homeGoalSchedule reference found');
