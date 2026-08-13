import { createClient } from "@supabase/supabase-js";
import { cleanText, cleanName, safeLimit, requireUserId, isSameUser } from "./appSecurity";

const url=import.meta.env.VITE_SUPABASE_URL||"https://kpfezbmtmxczpdvqogje.supabase.co";
const configuredKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY||"";
export const supabaseConfig={url,configured:!!configuredKey};
// Never crash module evaluation: a missing deployment secret must show a usable UI
// instead of producing a completely blank page. Auth/data operations will report
// the configuration error through Supabase when they are actually used.
const key=configuredKey||"missing-publishable-key";
export const supabase=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{headers:{"x-codex-client":"codex-vitae"}}});

const cleanEmail=v=>String(v||"").trim().toLowerCase();
export async function signUp(email,password,name){const cleanEmailValue=cleanEmail(email),cleanNameValue=cleanName(name);if(!cleanEmailValue)throw new Error("Digite seu e-mail.");if(!password||password.length<6)throw new Error("A senha precisa ter pelo menos 6 caracteres.");if(cleanNameValue.length<2)throw new Error("O nome precisa ter pelo menos 2 caracteres.");const {data,error}=await supabase.auth.signUp({email:cleanEmailValue,password,options:{data:{name:cleanNameValue}}});if(error)throw error;return{...data,email:cleanEmailValue,requiresEmailConfirmation:!data.session}}
export async function verifySignupCode(email,token){const {data,error}=await supabase.auth.verifyOtp({email:cleanEmail(email),token:String(token||"").replace(/\D/g,"").slice(0,6),type:"signup"});if(error)throw error;return data}
export async function resendConfirmation(email){const {error}=await supabase.auth.resend({type:"signup",email:cleanEmail(email)});if(error)throw error}
export async function signIn(email,password){const {data,error}=await supabase.auth.signInWithPassword({email:cleanEmail(email),password});if(error)throw error;return data}
export async function signOut(){const {error}=await supabase.auth.signOut();if(error)throw error}
export async function deleteMyAccount(){const {error}=await supabase.rpc("delete_my_account");if(error)throw error;await supabase.auth.signOut()}
export async function getProfile(userId){requireUserId(userId);const {data,error}=await supabase.from("profiles").select("*").eq("id",userId).maybeSingle();if(error)throw error;if(!data)throw new Error("Perfil não encontrado.");return data}
export async function saveProfile(profile){const safe={...profile,id:requireUserId(profile?.id),name:cleanName(profile?.name)};delete safe.email;delete safe.role;delete safe.is_admin;const {data,error}=await supabase.from("profiles").upsert(safe,{onConflict:"id"}).select();if(error)throw error;if(!data?.length)throw new Error("Não foi possível salvar o perfil.");return data[0]}
export async function updateProgress(userId,patch){requireUserId(userId);const allowed={};for(const k of ["level","total_xp","quests_completed_ever","max_streak_ever","usage_seconds"]){if(Object.prototype.hasOwnProperty.call(patch||{},k))allowed[k]=Math.max(0,Number(patch[k])||0)}if(Object.prototype.hasOwnProperty.call(patch||{},"name"))allowed.name=cleanName(patch.name);if(Object.prototype.hasOwnProperty.call(patch||{},"is_private"))allowed.is_private=!!patch.is_private;if(Object.prototype.hasOwnProperty.call(patch||{},"equipped_title"))allowed.equipped_title=cleanText(patch.equipped_title,80)||null;if(Object.prototype.hasOwnProperty.call(patch||{},"avatar_url"))allowed.avatar_url=patch.avatar_url||null;const {error}=await supabase.from("profiles").update(allowed).eq("id",userId);if(error)throw error;return getProfile(userId)}
export async function claimSystemMission(missionDate,difficulty,xp){const {data,error}=await supabase.rpc("claim_system_mission",{p_mission_date:missionDate,p_difficulty:difficulty,p_xp:Math.max(0,Number(xp)||0)});if(error)throw error;return data}
const profileFields="id,name,avatar_url,level,total_xp,quests_completed_ever,max_streak_ever,usage_seconds,equipped_title,is_private";