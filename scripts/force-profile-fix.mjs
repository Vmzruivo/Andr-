import fs from 'node:fs';

const file = 'codex-vitae.jsx';
let s = fs.readFileSync(file, 'utf8');

// Remove every previous profile patch block so repeated builds are idempotent.
s = s.replace(/\n?\/\/ CODEX_PROFILE_SAVE_FIX_V2[\s\S]*?\n(?=const questKey=session\?)/g, '\n');
s = s.replace(/\n?\/\/ CODEX_FORCE_PROFILE_FIX_V3[\s\S]*?\n(?=const questKey=session\?)/g, '\n');

// Remove stale standalone handlers left by older patch versions.
for (const name of ['saveName', 'togglePrivacy', 'equipTitle', 'uploadAvatar', 'persistName', 'persistPrivacy', 'persistTitle', 'persistAvatar']) {
  const re = new RegExp(`\\n?const ${name}\\s*=.*?;(?=\\n(?:const |\\/\\/ CODEX|useEffect|\\s*const questKey))`, 'gs');
  s = s.replace(re, '\n');
}

const marker = '// CODEX_PROFILE_PERSISTENCE_V4';
const block = `\n${marker}\nconst persistProfile=async patch=>{if(!session?.user?.id)throw new Error("Sessão expirada. Entre novamente.");const clean={...patch};if(Object.prototype.hasOwnProperty.call(clean,"name")){clean.name=String(clean.name||"").trim();if(clean.name.length<2)throw new Error("O nome precisa ter pelo menos 2 caracteres.");if(clean.name.length>24)throw new Error("O nome pode ter no máximo 24 caracteres.")}setSaving(true);setError("");try{const updated=await updateProgress(session.user.id,clean);setProfile(updated);if(Object.prototype.hasOwnProperty.call(clean,"name"))setName(updated.name||clean.name);return updated}catch(err){setError(err?.message||"Não foi possível salvar as alterações.");throw err}finally{setSaving(false)}};\nconst persistName=async()=>{try{await persistProfile({name})}catch{}};\nconst persistPrivacy=async()=>{try{await persistProfile({is_private:!effectiveProfile.is_private})}catch{}};\nconst persistTitle=async title=>{try{await persistProfile({equipped_title:title})}catch{}};\nconst persistAvatar=async event=>{const file=event.target.files?.[0];if(!file)return;try{if(!isImageFile(file))throw new Error("Escolha um arquivo de imagem. Formatos aceitos: JPG, JPEG, PNG, WEBP, GIF, BMP, SVG, AVIF, HEIC, HEIF, TIF e TIFF.");const data=await resizeImage(file);await persistProfile({avatar_url:data});recordActivity("photo");recordActivity("profile");recordActivity("area","settings")}catch(err){setError(err?.message||"Não foi possível salvar a foto.")}finally{event.target.value=""}};\n`;

const anchor = 'const questKey=session?';
if (!s.includes(anchor)) throw new Error('profile state anchor not found');

s = s.replace(/\n?\/\/ CODEX_PROFILE_PERSISTENCE_V4[\s\S]*?\n(?=const questKey=session\?)/g, '\n');
s = s.replace(anchor, block + '\n' + anchor);

// Ensure UI handlers always point to the single canonical implementation.
s = s.replace(/onClick=\{saveName\}/g, 'onClick={persistName}');
s = s.replace(/onChange=\{uploadAvatar\}/g, 'onChange={persistAvatar}');
s = s.replace(/onClick=\{togglePrivacy\}/g, 'onClick={persistPrivacy}');
s = s.replace(/onClick=\{t=>equipTitle\(t\)\}/g, 'onClick={t=>persistTitle(t)}');
s = s.replace(/onClick=\{\(\)=>equipTitle\(([^)]*)\)\}/g, 'onClick={()=>persistTitle($1)}');

fs.writeFileSync(file, s);
console.log('profile persistence normalized');
