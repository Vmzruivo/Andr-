import fs from 'node:fs';
const file='codex-vitae.jsx';
let s=fs.readFileSync(file,'utf8');
const MARKER='// CODEX_SOCIAL_PRIVACY_FINAL_V2';
if(s.includes(MARKER)){console.log('Social/privacy finalizer already applied');process.exit(0)}
function once(pattern,replacement,label){const before=s;s=s.replace(pattern,replacement);if(s===before)throw new Error(`Finalizer target not found: ${label}`)}

const addPostRe=/const addPost=async\(\)=>\{[\s\S]*?\};\n const beginEditPost=/;
if(addPostRe.test(s))s=s.replace(addPostRe,`const addPost=async()=>{if(!postText.trim()&&!postImage)return;try{const p=await publishPost({authorId:session.user.id,text:postText,imageUrl:postImage});setPosts(xs=>[p,...xs]);setPostText("");setPostImage(null)}catch(e){setError(e.message)}};\n const beginEditPost=`);else throw new Error('Feed addPost function not found');

if(!s.includes('cv-post-photo-tools'))once(/(<textarea[^>]*placeholder="Compartilhe sua conquista ou progresso…"[\s\S]*?\/>) /,'<div className="cv-post-photo-tools"><label className="cv-photo-button"><ImageIcon size={18}/> Adicionar foto<input type="file" accept="image/*" onChange={uploadPostImage} hidden/></label>{postImage&&<button type="button" className="cv-photo-clear" onClick={()=>setPostImage(null)}>Remover foto</button>}</div>\n$1','feed photo picker');
if(!s.includes('p.image_url&&<img className="cv-post-image"'))s=s.replace('<p className="cv-post-text">{p.text}</p>','{p.image_url&&<img className="cv-post-image" src={p.image_url} alt="Foto da publicação" loading="lazy"/>}<p className="cv-post-text">{p.text}</p>');
s=s.replace('const author=p.profiles||effectiveProfile;','const author=p.profiles||{name:"Perfil privado",avatar_url:null,equipped_title:null};');
s=s.replace('const ca=c.profiles||effectiveProfile;','const ca=c.profiles||{name:"Perfil privado",avatar_url:null,equipped_title:null};');

if(!s.includes('cv-private-toggle'))once(/(<div className="cv-settings-section"><h3>🔐 Privacidade<\/h3><div className="cv-privacy-note">)/,`$1<label className="cv-private-toggle"><input type="checkbox" checked={!!effectiveProfile.is_private} onChange={togglePrivacy}/><span>Deixar meu perfil particular</span></label>`,'private profile switch');

const cssRules=' .cv-post-photo-tools{display:flex;gap:10px;align-items:center;margin:10px 0}.cv-photo-button{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:10px;background:#291C2B;cursor:pointer}.cv-photo-clear{background:none;border:0;color:#E7CD8C;cursor:pointer}.cv-post-image{display:block;width:100%;max-height:520px;object-fit:cover;border-radius:14px;margin:10px 0 12px}.cv-private-toggle{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-weight:800}.cv-private-toggle input{width:18px;height:18px;accent-color:#C9A455;}\n';
if(!s.includes('.cv-post-photo-tools{'))s=s.replace('@media(max-width:620px)',cssRules+'@media(max-width:620px)');
else if(!s.includes('.cv-private-toggle{'))s=s.replace('@media(max-width:620px)',`.cv-private-toggle{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-weight:800}.cv-private-toggle input{width:18px;height:18px;accent-color:#C9A455;}\n@media(max-width:620px)`);

s+=`\n${MARKER}\n`;fs.writeFileSync(file,s);console.log('Final social/privacy features applied');
