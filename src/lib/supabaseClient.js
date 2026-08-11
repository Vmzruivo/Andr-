import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://kpfezbmtmxczpdvqogje.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_oD41poIileZVeuzUV7qspg_eIOE89wT";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
  return data;
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; }
export async function getProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error; return data;
}
export async function saveProfile(profile) {
  const { data, error } = await supabase.from("profiles").upsert(profile).select().single();
  if (error) throw error; return data;
}
export async function updateProgress(userId, patch) {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single();
  if (error) throw error; return data;
}

const profileFields = "id,name,avatar_url,level,total_xp,quests_completed_ever,max_streak_ever,usage_seconds";
export async function getFeed(limit = 30) {
  const { data, error } = await supabase.from("posts")
    .select(`*, profiles!posts_author_id_fkey(${profileFields})`)
    .order("created_at", { ascending: false }).limit(limit);
  if (error) throw error; return data || [];
}
export async function publishPost({ authorId, text, achievementId = null }) {
  const { data, error } = await supabase.from("posts")
    .insert({ author_id: authorId, text: text.trim(), achievement_id: achievementId })
    .select(`*, profiles!posts_author_id_fkey(${profileFields})`).single();
  if (error) throw error; return data;
}
export async function getMyLikes(userId) {
  const { data, error } = await supabase.from("likes").select("post_id").eq("user_id", userId);
  if (error) throw error; return new Set((data || []).map(x => x.post_id));
}
export async function toggleLike(postId, userId, liked) {
  if (liked) {
    const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
  const { count, error } = await supabase.from("likes").select("post_id", { count: "exact", head: true }).eq("post_id", postId);
  if (error) throw error;
  return { likes_count: count || 0 };
}
export function subscribeToFeed(onChange) {
  return supabase.channel("codex-feed")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, onChange)
    .subscribe();
}
export async function getLeaderboard(mode = "level", limit = 50) {
  const order = mode === "time" ? "usage_seconds" : "total_xp";
  const { data, error } = await supabase.from("profiles")
    .select(profileFields).order(order, { ascending: false }).limit(limit);
  if (error) throw error; return data || [];
}

export async function createPrivateConversation(myId, otherId) {
  if (myId === otherId) throw new Error("Você não pode conversar consigo mesmo.");
  const { data: mine, error: mineError } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", myId);
  if (mineError) throw mineError;
  const ids = (mine || []).map(x => x.conversation_id);
  if (ids.length) {
    const { data: common, error } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", otherId).in("conversation_id", ids);
    if (error) throw error;
    if (common?.length) return common[0].conversation_id;
  }
  const { data: conversation, error } = await supabase.from("conversations").insert({}).select().single();
  if (error) throw error;
  for (const userId of [myId, otherId]) {
    const { error: memberError } = await supabase.from("conversation_members").insert({ conversation_id: conversation.id, user_id: userId });
    if (memberError) throw memberError;
  }
  return conversation.id;
}
export async function getMyConversations(userId) {
  const { data: memberships, error } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", userId);
  if (error) throw error;
  const ids = [...new Set((memberships || []).map(x => x.conversation_id))];
  if (!ids.length) return [];
  const { data: members, error: memberError } = await supabase.from("conversation_members").select(`conversation_id,user_id,profiles!conversation_members_user_id_fkey(${profileFields})`).in("conversation_id", ids);
  if (memberError) throw memberError;
  return ids.map(id => ({ id, members: (members || []).filter(m => m.conversation_id === id).map(m => m.profiles).filter(Boolean) }));
}
export async function getMessages(conversationId) {
  const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw error; return data || [];
}
export async function sendMessage(conversationId, senderId, text) {
  const { data, error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, text: text.trim() }).select().single();
  if (error) throw error; return data;
}
export function subscribeToMessages(conversationId, onMessage) {
  return supabase.channel(`codex-chat-${conversationId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, payload => onMessage(payload.new))
    .subscribe();
}
