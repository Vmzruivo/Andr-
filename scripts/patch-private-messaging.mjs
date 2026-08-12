import fs from 'node:fs';

const lib='src/lib/supabaseClient.js';
let s=fs.readFileSync(lib,'utf8');
const oldCreate=`export async function createPrivateConversation(myId,otherId){if(myId===otherId)throw new Error("Você não pode conversar consigo mesmo.");const {data:mine,error:mineError}=await supabase.from("conversation_members").select("conversation_id").eq("user_id",myId);if(mineError)throw mineError;const ids=(mine||[]).map(x=>x.conversation_id);if(ids.length){const {data:common,error}=await supabase.from("conversation_members").select("conversation_id").eq("user_id",otherId).in("conversation_id",ids);if(error)throw error;if(common?.length)return common[0].conversation_id}const {data:conversation,error}=await supabase.from("conversations").insert({}).select().single();if(error)throw error;for(const userId of[myId,otherId]){const {error:memberError}=await supabase.from("conversation_members").insert({conversation_id:conversation.id,user_id:userId});if(memberError)throw memberError}return conversation.id}`;
const newCreate=`export async function createPrivateConversation(myId,otherId){if(!myId||myId===otherId)throw new Error("Você não pode conversar consigo mesmo.");const {data,error}=await supabase.rpc("create_private_conversation",{p_other_user:otherId});if(error){if(/AUTH_REQUIRED/i.test(error.message||""))throw new Error("Sessão expirada. Entre novamente.");if(/RECIPIENT_NOT_FOUND/i.test(error.message||""))throw new Error("Usuário não encontrado.");if(/INVALID_RECIPIENT/i.test(error.message||""))throw new Error("Destinatário inválido.");throw error}if(!data)throw new Error("Não foi possível abrir a conversa.");return data}`;
if(s.includes(oldCreate)) s=s.replace(oldCreate,newCreate);
else if(!s.includes('supabase.rpc("create_private_conversation"')) throw new Error('createPrivateConversation implementation not found');
if(!s.includes('export function subscribeToConversationList(')){
  const marker='export async function getMessages(conversationId)';
  if(!s.includes(marker)) throw new Error('getMessages marker not found');
  s=s.replace(marker,`export function subscribeToConversationList(userId,onChange){return supabase.channel(\`codex-conversations-${userId}\`).on("postgres_changes",{event:"INSERT",schema:"public",table:"conversation_members",filter:\`user_id=eq.${userId}\`},onChange).on("postgres_changes",{event:"UPDATE",schema:"public",table:"conversations"},onChange).subscribe()}\n${marker}`);
}
fs.writeFileSync(lib,s);

const app='codex-vitae.jsx';
s=fs.readFileSync(app,'utf8');
if(!s.includes('subscribeToConversationList')){
  s=s.replace('subscribeToMessages, getMyLikes', 'subscribeToMessages, subscribeToConversationList, getMyLikes');
  if(!s.includes('subscribeToConversationList')) throw new Error('Messaging import marker not found');
}
if(!s.includes('CODEX_PRIVATE_CHAT_REALTIME_V2')){
  const marker='\n const content={';
  if(!s.includes(marker)) throw new Error('content marker not found');
  const effects=`\n // CODEX_PRIVATE_CHAT_REALTIME_V2\n useEffect(()=>{if(!session)return;let alive=true;const refresh=async()=>{try{const rows=await getMyConversations(session.user.id);if(alive)setConversations(rows)}catch(e){if(alive)setError(e.message)}};refresh();const channel=subscribeToConversationList(session.user.id,refresh);return()=>{alive=false;channel?.unsubscribe?.()}} ,[session]);\n useEffect(()=>{if(!session||!chatId){setMessages([]);return}let alive=true;setMessages([]);getMessages(chatId).then(rows=>{if(alive)setMessages(rows)}).catch(e=>{if(alive)setError(e.message)});const channel=subscribeToMessages(chatId,msg=>{if(!alive)return;setMessages(prev=>prev.some(x=>x.id===msg.id)?prev:[...prev,msg])});return()=>{alive=false;channel?.unsubscribe?.()}} ,[session,chatId]);\n`;
  s=s.replace(marker,effects+marker);
}
fs.writeFileSync(app,s);
console.log('Private messaging realtime patch applied');