import fs from 'node:fs';
const file='codex-vitae.jsx';let s=fs.readFileSync(file,'utf8');
// Equip title in profile: keep a dedicated equipped title and show it beside the user's name.
const oldTitle='function titleForLevel(level){if(level>=20)return"Lenda Viva";if(level>=15)return"Herói Consagrado";if(level>=10)return"Mestre-Aventureiro";if(level>=6)return"Andarilho Experiente";if(level>=3)return"Aventureiro";return"Novato"}';
const newTitle=`function titleForLevel(level){if(level>=20)return"Lenda Viva";if(level>=15)return"Herói Consagrado";if(level>=10)return"Mestre-Aventureiro";if(level>=6)return"Andarilho Experiente";if(level>=3)return"Aventureiro";return"Novato"}
function equippedTitleFor(p){return p?.equipped_title||p?.title||titleForLevel(p?.level||1)}`;
if(s.includes(oldTitle))s=s.replace(oldTitle,newTitle);
// Profile default includes equipped title.
s=s.replace('max_streak_ever:0,usage_seconds:0}','max_streak_ever:0,usage_seconds:0,equipped_title:null}');
// Add title selector near profile settings: this is injected immediately before the save-name button.
const save='const saveName=async()=>{';
const injected=`const equipTitle=async t=>{try{const p=await updateProgress(session.user.id,{equipped_title:t});setProfile(p)}catch(e){setError(e.message)}};\n ${save}`;
if(s.includes(save)&&!s.includes('const equipTitle='))s=s.replace(save,injected);
// Save name should preserve currently equipped title automatically via DB update of only name.
// Render equipped title in own profile and public profile views.
s=s.replace('<p className="cv-title">{titleForLevel(overall.level)}</p>','<p className="cv-title">{equippedTitleFor(effectiveProfile)}</p>');
// Message bubbles: prepend sender name + equipped title. Handles common message render variants.
s=s.replace('{m.sender_id===session.user.id?"Você":""}', '{m.sender_id===session.user.id?`${effectiveProfile.name} · ${equippedTitleFor(effectiveProfile)}`:(m.sender_name?`${m.sender_name} · ${m.sender_title||"Aventureiro"}`:"Aventureiro")}');
s=s.replace('{m.text}</div>', '<div className="cv-message-author">{m.sender_id===session.user.id?`${effectiveProfile.name} · ${equippedTitleFor(effectiveProfile)}`:(m.sender_name?`${m.sender_name} · ${m.sender_title||"Aventureiro"}`:"Aventureiro")}</div>{m.text}</div>');
// Feed/profile cards use title if the loaded post/profile already carries it.
s=s.replace('{p.author_name}</b>', '{p.author_name}</b>{p.author_title&&<small className="cv-author-title"> · {p.author_title}</small>}');
// Add CSS and title selector before closing style template.
s=s.replace('</style>', '.cv-message-author{font-size:11px;font-weight:800;color:'+`\${GOLD_LIGHT}`+';margin-bottom:4px}.cv-author-title{font-weight:600;color:'+`\${MUTED}`+'}.cv-title-equip{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.cv-title-equip button{border:1px solid rgba(255,255,255,.08);background:'+`\${SURFACE_2}`+';color:'+`\${MUTED}`+';border-radius:9px;padding:6px 8px}.cv-title-equip button.active{border-color:'+`\${GOLD}`+';color:'+`\${GOLD_LIGHT}`+'}</style>');
// Add a simple title equipment block in settings after the name input when present.
const nameInput='value={name} onChange={e=>setName(e.target.value)}';
if(s.includes(nameInput)&&!s.includes('cv-title-equip'))s=s.replace(nameInput,nameInput+'/><div className="cv-title-equip">{[titleForLevel(effectiveProfile.level||1),"Lenda Global","Elite Global","Veterano Global"].filter((v,i,a)=>a.indexOf(v)===i).map(t=><button type="button" key={t} className={equippedTitleFor(effectiveProfile)===t?"active":""} onClick={()=>equipTitle(t)}>Título: {t}</button>)}</div><input');
fs.writeFileSync(file,s);console.log('titles patch applied');
