import fs from "node:fs";

const path = "codex-vitae.jsx";
let s = fs.readFileSync(path, "utf8");
const MARKER = "// CODEX_SOCIAL_PRIVACY_V1";
if (s.includes(MARKER)) {
  console.log("Social/privacy patch already applied.");
  process.exit(0);
}

function replaceOnce(pattern, replacement, label) {
  const before = s;
  s = s.replace(pattern, replacement);
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
`$1\n<div className="cv-settings-extra">\n  <div className="cv-setting-row"><div><b>Perfil particular</b><small>Somente você e pessoas com quem conversa poderão ver seu perfil. Ele também deixa de aparecer no ranking público e seus posts ficam fora do feed público.</small></div><label className="cv-switch"><input type="checkbox" checked={!!effectiveProfile.is_private} onChange={togglePrivacy}/><span></span></label></div>\n  <div className="cv-setting-row"><div><b>Nome de usuário único</b><small>Seu nome não pode ser igual ao de outra conta. A verificação é feita no banco de dados.</small></div><Lock size={22}/></div>\n</div>`, "settings controls");

const photoInputPatterns = [
  /(<textarea[^>]*value=\{postText\}[\s\S]*?<\/textarea>)/,
  /(<input[^>]*value=\{postText\}[^>]*\/>)/,
  /(<textarea[^>]*value=\{postText\}[^>]*\/>)/
];
let photoInputPat = photoInputPatterns.find(p => p.test(s));
if (photoInputPat) {
  s = s.replace(photoInputPat, `<div className="cv-post-photo-tools"><label className="cv-photo-button"><ImageIcon size={18}/> Foto<input type="file" accept="image/*" onChange={uploadPostImage} hidden/></label>{postImage&&<button type="button" className="cv-photo-clear" onClick={()=>setPostImage(null)}>Remover foto</button>}</div>\n$1`);
  console.log("Feed photo picker inserted.");
} else {
  const hits = [...s.matchAll(/.{0,220}postText.{0,420}/g)].map(m => m[0]);
  console.log("Could not find the feed composer control. postText contexts:");
  console.log(hits.slice(0, 8).join("\n---\n"));
}

if (/\{p\.text\}/.test(s)) {
  s = s.replace(/\{p\.text\}/, `{p.image_url&&<img className="cv-post-image" src={p.image_url} alt="Foto da publicação" loading="lazy"/>}{p.text}`);
  console.log("Feed photo rendering inserted.");
} else {
  console.log("Could not find {p.text}; photo rendering will be added in a follow-up patch.");
}

s += `\n${MARKER}\n`;
fs.writeFileSync(path, s);
console.log("Applied unique username and private profile patch; feed photo support included when composer target is detected.");
