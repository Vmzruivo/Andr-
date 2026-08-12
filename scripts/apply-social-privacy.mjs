import fs from "node:fs";

const path = "codex-vitae.jsx";
let s = fs.readFileSync(path, "utf8");
const MARKER = "// CODEX_SOCIAL_PRIVACY_V1";
if (s.includes(MARKER)) { console.log("Social/privacy patch already applied."); process.exit(0); }

function replaceOnce(pattern, replacement, label) {
  const before = s; s = s.replace(pattern, replacement);
  if (s === before) throw new Error(`Patch target not found: ${label}`);
}

replaceOnce(/import \{ Home, Trophy, Medal, MessageCircle, Settings, Users, Flame, Star, Clock, LogIn, Send, ArrowLeft, Heart, Camera, Plus, Trash2, User, X, Check, UserRound, LogOut, ChevronRight, Mail \} from "lucide-react";/,
`import { Home, Trophy, Medal, MessageCircle, Settings, Users, Flame, Star, Clock, LogIn, Send, ArrowLeft, Heart, Camera, Plus, Trash2, User, X, Check, UserRound, LogOut, ChevronRight, Mail, Lock, Globe, Image as ImageIcon } from "lucide-react";`, "lucide imports");

replaceOnce(/import \{ supabase, signUp, signIn, signOut, resendConfirmation, getProfile, saveProfile, updateProgress, getFeed, publishPost, subscribeToFeed, getLeaderboard, createPrivateConversation, getMyConversations, getMessages, sendMessage, subscribeToMessages, getMyLikes, toggleLike \} from "\.\/src\/lib\/supabaseClient";/,
`import { supabase, signUp, signIn, signOut, resendConfirmation, getProfile, saveProfile, updateProgress, getFeed, publishPost, updatePost, deletePost, subscribeToFeed, getLeaderboard, createPrivateConversation, getMyConversations, getMessages, sendMessage, subscribeToMessages, getMyLikes, toggleLike } from "./src/lib/supabaseClient";`, "supabase imports");

replaceOnce(/\[loading,setLoading\]=useState\(true\),\[postText,setPostText\]=useState\(""\),/,
`[loading,setLoading]=useState(true),[postText,setPostText]=useState(""),[postImage,setPostImage]=useState(null),`, "post image state");

replaceOnce(/const effectiveProfile=useMemo\(\(\)=>profile\|\|\{id:session\?\.user\?\.id,name:"Aventureiro",avatar_url:null,level:1,total_xp:0,quests_completed_ever:0,max_streak_ever:0,usage_seconds:0\},/,
`const effectiveProfile=useMemo(()=>profile||{id:session?.user?.id,name:"Aventureiro",avatar_url:null,level:1,total_xp:0,quests_completed_ever:0,max_streak_ever:0,usage_seconds:0,is_private:false,equipped_title:null},`, "effective profile defaults");

replaceOnce(/const addPost=async\(\)=>\{if\(!postText\.trim\(\)\)return;try\{const p=await publishPost\(\{authorId:session\.user\.id,text:postText\}\);setPosts\(xs=>\[p,\.\.\.xs\]\);setPostText\(""\)\}catch\(e\)\{setError\(e\.message\)\}\};/,
`const addPost=async()=>{if(!postText.trim()&&!postImage)return;try{const p=await publishPost({authorId:session.user.id,text:postText,imageUrl:postImage});setPosts(xs=>[p,...xs]);setPostText("");setPostImage(null)}catch(e){setError(e.message)}};`, "publish post");

replaceOnce(/const saveName=async\(\)=>\{[\s\S]*?finally\{setSaving\(false\)\}\};\n const uploadAvatar=/,
`const saveName=async()=>{const n=name.trim()||"Aventureiro";setSaving(true);try{const p=await updateProgress(session.user.id,{name:n});setProfile(p);setName(n);setSettingsOpen(false)}catch(e){const msg=String(e.message||"");setError(/duplicate|unique|profiles_name_unique_ci/i.test(msg)?"Esse nome de usuário já está em uso. Escolha outro nome.":msg)}finally{setSaving(false)}};\n const togglePrivacy=async e=>{const next=!!e.target.checked;try{const p=await updateProgress(session.user.id,{is_private:next});setProfile(p)}catch(err){setError(err.message)}};\n const uploadPostImage=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=await resizeImage(f,1100);if(data.length>2200000)throw new Error("Essa foto ficou muito grande. Escolha outra imagem.");setPostImage(data)}catch(err){setError("Não foi possível processar essa imagem. Tente JPG, PNG, WEBP ou outro formato de imagem comum.")}e.target.value=""};\n const uploadAvatar=`, "settings and post image handlers");

replaceOnce(/(<button[^>]*onClick=\{saveName\}[^>]*>[\s\S]*?<\/button>)/,
`$1\n<div className="cv-settings-extra">\n  <div className="cv-setting-row"><div><b>Perfil particular</b><small>Seu perfil fica visível apenas para você e para pessoas com quem você conversa. Ele deixa de aparecer no ranking e seus posts ficam fora do feed público.</small></div><label className="cv-switch"><input type="checkbox" checked={!!effectiveProfile.is_private} onChange={togglePrivacy}/><span></span></label></div>\n  <div className="cv-setting-row"><div><b>Nome de usuário único</b><small>O site não permite duas contas com o mesmo nome.</small></div><Lock size={22}/></div>\n</div>`, "settings controls");

const photoInputPattern = /(<textarea[\s\S]*?value=\{postText\}[\s\S]*?\/\>)/;
if (photoInputPattern.test(s)) {
  s = s.replace(photoInputPattern, `<div className="cv-post-photo-tools"><label className="cv-photo-button"><ImageIcon size={18}/> Adicionar foto<input type="file" accept="image/*" onChange={uploadPostImage} hidden/></label>{postImage&&<button type="button" className="cv-photo-clear" onClick={()=>setPostImage(null)}>Remover foto</button>}</div>\n$1`);
  console.log("Feed photo picker inserted.");
} else { throw new Error("Feed composer textarea with postText was not found."); }

if (/const author=p\.profiles\|\|effectiveProfile;/.test(s)) {
  s = s.replace(/const author=p\.profiles\|\|effectiveProfile;/, `const author=p.profiles||{name:"Perfil privado",avatar_url:null,equipped_title:null};`);
}

if (/\{p\.text\}/.test(s)) {
  s = s.replace(/\{p\.text\}/, `{p.image_url&&<img className="cv-post-image" src={p.image_url} alt="Foto da publicação" loading="lazy"/>}{p.text}`);
}

replaceOnce(/const css=`/, `const css=\`\n.cv-settings-extra{margin-top:18px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px}.cv-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 0}.cv-setting-row small{display:block;color:${MUTED};margin-top:4px;line-height:1.35}.cv-switch{position:relative;width:48px;height:28px;flex:0 0 auto}.cv-switch input{opacity:0;width:0;height:0}.cv-switch span{position:absolute;inset:0;border-radius:999px;background:#4b3b46;cursor:pointer}.cv-switch span:before{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s}.cv-switch input:checked+span{background:${GOLD}}.cv-switch input:checked+span:before{transform:translateX(20px)}.cv-post-photo-tools{display:flex;gap:10px;align-items:center;margin:10px 0}.cv-photo-button{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:10px;background:${SURFACE_2};cursor:pointer}.cv-photo-clear{background:none;border:0;color:${GOLD_LIGHT};cursor:pointer}.cv-post-image{display:block;width:100%;max-height:520px;object-fit:cover;border-radius:14px;margin:10px 0 12px}\n`, "feed/privacy styles");

s += `\n${MARKER}\n`;
fs.writeFileSync(path, s);
console.log("Applied unique usernames, private profiles and feed photo publishing.");
