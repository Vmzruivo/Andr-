import { createClient } from "@supabase/supabase-js";

// These values are safe for the browser only because they are the Supabase
// publishable/anon credentials. Database security must still be enforced by RLS.
const url = import.meta.env.VITE_SUPABASE_URL || "https://kpfezbmtmxczpdvqogje.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_oD41poIileZVeuzUV7qspg_eIOE89tW";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export async function signUp(email, password, name) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "Aventureiro").trim() || "Aventureiro";
  if (!cleanEmail) throw new Error("Digite seu e-mail.");
  if (!password || password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  if (cleanName.length < 2) throw new Error("O nome precisa ter pelo menos 2 caracteres.");
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { name: cleanName }, emailRedirectTo: redirectTo } });
  if (error) {
    const msg = String(error.message || "");
    if (/email rate limit exceeded|rate limit|after\s+60\s+seconds|60\s+seconds/i.test(msg)) throw new Error("O Supabase bloqueou temporariamente o envio de e-mails por limite de segurança. Aguarde o bloqueio terminar antes de tentar novamente. Não clique várias vezes em Registrar.");
    if (/already registered|already been registered|user already registered/i.test(msg)) throw new Error("Este e-mail já possui uma conta. Use Entrar em vez de Registrar.");
    throw error;
  }
  return { ...data, requiresEmailConfirmation: !data.session, email: cleanEmail };
}
export async function signIn(email, password) { const { data, error } = await supabase.auth.signInWithPassword({ email: String(email || "").trim().toLowerCase(), password }); if (error) { if (/email not confirmed/i.test(error.message || "")) throw new Error("Sua conta ainda não foi confirmada. Abra o e-mail de confirmação e depois tente entrar novamente."); throw error; } return data; }
export async function signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; }
export async function deleteMyAccount() { const { error } = await supabase.rpc("delete_my_account"); if (error) throw error; await supabase.auth.signOut(); }
export async function resendConfirmation(email) { const cleanEmail = String(email || "").trim().toLowerCase(); if (!cleanEmail) throw new Error("Digite seu e-mail."); const redirectTo = `${window.location.origin}${window.location.pathname}`; const { error } = await supabase.auth.resend({ type: "signup", email: cleanEmail, options: { emailRedirectTo: redirectTo } }); if (error) { const msg = String(error.message || ""); if (/rate limit|60\s+seconds/i.test(msg)) throw new Error("Aguarde um pouco antes de reenviar o e-mail de confirmação novamente."); throw error; } }
export async function getProfile(userId) { const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single(); if (error) throw error; return data; }
export async function saveProfile(profile) { const { data, error } = await supabase.from("profiles").upsert(profile).select().single(); if (error) { if (error.code === "23505") throw new Error("Esse nome de usuário já está em uso. Escolha outro nome."); throw error; } return data; }
export async function updateProgress(userId, patch) { const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single(); if (error) { if (error.code === "23505" || /profiles_name_unique_ci|duplicate key|unique constraint/i.test(error.message || "")) throw new Error("Esse nome de usuário já está em uso. Escolha outro nome."); throw error; } return data; }
export async function claimSystemMission(missionDate, difficulty, xp) { const { data, error } = await supabase.rpc("claim_system_mission", { p_mission_date: missionDate, p_difficulty: difficulty, p_xp: xp }); if (error) throw error; return data; }

const profileFields = "id,name,avatar_url,level,total_xp,quests_completed_ever,max_streak_ever,usage_seconds,equipped_title,is_private";
export async function getFeed(limit = 30) { const { data, error } = await supabase.from("posts").select(`*, profiles!posts_author_id_fkey(${profileFields})`).order("created_at", { ascending: false }).limit(limit); if (error) throw error; return data || []; }
export async function publishPost({ authorId, text, imageUrl = null, achievementId = null }) { const cleanText = String(text || "").trim(); if (!cleanText && !imageUrl) throw new Error("Escreva algo ou escolha uma foto para publicar."); const { data, error } = await supabase.from("posts").insert({ author_id: authorId, text: cleanText, image_url: imageUrl, achievement_id: achievementId }).select(`*, profiles!posts_author_id_fkey(${profileFields})`).single(); if (error) throw error; return data; }
export async function updatePost(postId, authorId, text) { const clean = String(text || "").trim(); if (!clean) throw new Error("A publicação não pode ficar vazia."); const { data, error } = await supabase.from("posts").update({ text: clean }).eq("id", postId).eq("author_id", authorId).select(`*, profiles!posts_author_id_fkey(${profileFields})`).single(); if (error) throw error; return data; }
export async function deletePost(postId, authorId) { const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", authorId); if (error) throw error; }
export async function getComments(postId) { const { data, error } = await supabase.from("comments").select(`*, profiles!comments_author_id_fkey(${profileFields})`).eq("post_id", postId).order("created_at", { ascending: true }); if (error) throw error; return data || []; }
export async function addComment({ postId, authorId, text }) { const clean = String(text || "").trim(); if (!clean) throw new Error("O comentário não pode ficar vazio."); const { data, error } = await supabase.from("comments").insert({ post_id: postId, author_id: authorId, text: clean }).select(`*, profiles!comments_author_id_fkey(${profileFields})`).single(); if (error) throw error; return data; }
export function subscribeToComments(postId, onChange) { return supabase.channel(`codex-comments-${postId}`).on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, onChange).subscribe(); }
export async function getMyLikes(userId) { const { data, error } = await supabase.from("likes").select("post_id").eq("user_id", userId); if (error) throw error; return new Set((data || []).map(x => x.post_id)); }
export async function toggleLike(postId, userId, liked) { if (liked) { const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId); if (error) throw error; } else { const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId }); if (error) throw error; } const { count, error } = await supabase.from("likes").select("post_id", { count: "exact", head: true }).eq("post_id", postId); if (error) throw error; return { likes_count: count || 0 }; }
export function subscribeToFeed(onChange) { return supabase.channel("codex-feed").on("postgres_changes", { event: "*", schema: "public", table: "posts" }, onChange).on("postgres_changes", { event: "*", schema: "public", table: "likes" }, onChange).on("postgres_changes", { event: "*", schema: "public", table: "comments" }, onChange).subscribe(); }
export async function getLeaderboard(mode = "level", limit = 50) { const order = mode === "time" ? "usage_seconds" : "total_xp"; const { data, error } = await supabase.from("profiles").select(profileFields).order(order, { ascending: false }).limit(limit); if (error) throw error; return data || []; }
export async function createPrivateConversation(myId, otherId) { if (myId === otherId) throw new Error("Você não pode conversar consigo mesmo."); const { data: mine, error: mineError } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", myId); if (mineError) throw mineError; const ids = (mine || []).map(x => x.conversation_id); if (ids.length) { const { data: common, error } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", otherId).in("conversation_id", ids); if (error) throw error; if (common?.length) return common[0].conversation_id; } const { data: conversation, error } = await supabase.from("conversations").insert({}).select().single(); if (error) throw error; for (const userId of [myId, otherId]) { const { error: memberError } = await supabase.from("conversation_members").insert({ conversation_id: conversation.id, user_id: userId }); if (memberError) throw memberError; } return conversation.id; }
export async function getMyConversations(userId) { const { data: memberships, error } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", userId); if (error) throw error; const ids = [...new Set((memberships || []).map(x => x.conversation_id))]; if (!ids.length) return []; const { data: members, error: memberError } = await supabase.from("conversation_members").select(`conversation_id,user_id,profiles!conversation_members_user_id_fkey(${profileFields})`).in("conversation_id", ids); if (memberError) throw memberError; return ids.map(id => ({ id, members: (members || []).filter(m => m.conversation_id === id).map(m => m.profiles).filter(Boolean) })); }
export async function getMessages(conversationId) { const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }); if (error) throw error; return data || []; }
export async function sendMessage(conversationId, senderId, text) { const { data, error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, text: text.trim() }).select().single(); if (error) throw error; return data; }
export function subscribeToMessages(conversationId, onMessage) { return supabase.channel(`codex-chat-${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, payload => onMessage(payload.new)).subscribe(); }
