import fs from 'node:fs';
const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
if(s.includes('CODEX_PROFILE_SAVE_FIX_V2')){console.log('profile save fix already applied');process.exit(0)}
// Remove stale handlers first.
s=s.replace(/const saveName=async\(\)=>\{[\s\S]*?\};\n/g,'');
s=s.replace(/const togglePrivacy=async\(\)=>\{[\s\S]*?\};\n/g,'');
s=s.replace(/const equipTitle=async t=>\{[\s\S]*?\};\n/g,'');
s=s.replace(/const uploadAvatar=async e=>\{[\s\S]*?\};\n/g,'');
const marker='// CODEX_PROFILE_SAVE_FIX_V2';
const helper=`\n${marker}\nconst saveProfileChanges=async patch=>{if(!session?.user?.id)throw new Error("Sua sessão expirou. Entre novamente.");const clean={...patch};if(Object.prototype.hasOwnProperty.call(clean,"name")){clean.name=String(clean.name||"").trim();if(clean.name.length<2)throw new Error("O nome precisa ter pelo menos 2 caracteres.");if(clean.name.length>24)throw new Error("O nome pode ter no máximo 24 caracteres.")}setSaving(true);setError("");try{const p=await updateProgress(session.user.id,clean);setProfile(p);if(Object.prototype.hasOwnProperty.call(clean,"name"))setName(p.name||clean.name);return p}catch(e){setError(e?.message||"Não foi possível salvar as alterações.");throw e}finally{setSaving(false)}};\nconst saveName=async()=>{try{await saveProfileChanges({name})}catch{}};\nconst togglePrivacy=async()=>{try{await saveProfileChanges({is_private:!effectiveProfile.is_private})}catch{}};\nconst equipTitle=async t=>{try{await saveProfileChanges({equipped_title:t})}catch{}};\nconst uploadAvatar=async e=>{const f=e.target.files?.[0];if(!f)return;setError("");try{const data=await resizeImage(f);await saveProfileChanges({avatar_url:data});recordActivity("photo");recordActivity("profile");recordActivity("area","settings")}catch{}finally{e.target.value=""}};\n`;
const anchor='const questKey=session?';
if(!s.includes(anchor))throw new Error('profile state anchor not found');
s=s.replace(anchor,helper+'\n '+anchor);
fs.writeFileSync(file,s);
console.log('profile save fix applied');
