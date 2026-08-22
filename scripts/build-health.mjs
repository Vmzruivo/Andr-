import fs from "node:fs";
import path from "node:path";

// This script is intentionally non-blocking. It reports problems but never
// modifies application source and never prevents Vite from building.
const required = [
  "index.html",
  "package.json",
  "vite.config.js",
  "codex-vitae.jsx",
  "src/main.jsx",
  "src/app.css",
  "src/lib/supabaseClient.js",
];

let warnings = 0;
for (const file of required) {
  if (!fs.existsSync(file)) {
    warnings += 1;
    console.warn(`[build-health] missing: ${file}`);
  }
}

try {
  JSON.parse(fs.readFileSync("package.json", "utf8"));
} catch (error) {
  warnings += 1;
  console.warn(`[build-health] package.json could not be parsed: ${error.message}`);
}

const envKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!envKey) {
  warnings += 1;
  console.warn("[build-health] Supabase publishable/anon key is missing. The build will continue; the app must show a configuration error instead of crashing.");
}

console.log(`[build-health] completed with ${warnings} warning(s). No source files were modified.`);
