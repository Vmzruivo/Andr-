import React,{useEffect,useState,useRef} from "react";
import {supabase} from "./lib/supabaseClient";

const base={background:"#1E1520",color:"#F5EFE6",border:"1px solid #7A4356",borderRadius:14,padding:12};
const btn={border:0,borderRadius:10,padding:"9px 12px",fontWeight:800,cursor:"pointer"};

export default function AdminPanel(){
 const [open,setOpen]=useState(false),[allowed,setAllowed]=useState(false),[role,setRole]=useState(""),[section,setSection]=useState("users"),[users,setUsers]=useState([]),[posts,setPosts]=useState([]),[roles,setRoles]=useState([]),[missions,setMissions]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(""),[email,setEmail]=useState(""),[roleTitle,setRoleTitle]=useState("Administrador"),[roleKind,setRoleKind]=useState("admin"),[mission,setMission]=useState({title:"",description:"",difficulty:"medium",xp:50});
 const [fab,setFab]=useState({x:null,y:null});
 const dragging=useRef(false),offset=useRef({x:0,y:0}),moved=useRef(false);
 const rpc=async(name,params={})=>{const {data,error}=await supabase.rpc(name,params);if(error)throw error;return data};

 const checkAdmin=async session=>{
  if(!session){setAllowed(false);setRole("");setOpen(false);return}
  try{
   const {data,isError}=await Promise.resolve(supabase.rpc("is_admin")).then(r=>({data:r.data,isError:r.error}));
   if(isError)throw isError;
   const ok=Boolean(data);
   setAllowed(ok);
   if(!ok){setRole("");setOpen(false);return}
   const {data:r,error:roleError}=await supabase.from("admin_roles").select("role,title").eq("user_id",session.user.id).maybeSingle();
   setRole(roleError?"admin":(r?.role||"admin"));
  }catch(e){
   setAllowed(false);
   setRole("");
   setOpen(false);
   setError(e?.message||"Não foi possível verificar a permissão administrativa.");
  }
 };

 useEffect(()=>{
  let mounted=true;
  supabase.auth.getSession().then(({data})=>{if(mounted)checkAdmin(data.session)}).catch(()=>{});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   setTimeout(()=>{if(mounted)checkAdmin(session)},0);
  });
  return()=>{mounted=false;subscription.unsubscribe()};
 },[]);

 const load=async()=>{
  if(!allowed)return;
  setLoading(true);setError("");
  try{
   if(section==="users")setUsers((await rpc("admin_list_users"))||[]);
   if(section==="posts")setPosts((await rpc("admin_list_posts"))||[]);
   if(section==="admins")setRoles((await rpc("admin_list_roles"))||[]);
   if(section==="missions")setMissions((await rpc("admin_list_missions"))||[]);
  }catch(e){setError(e?.message||"Erro administrativo");}
  finally{setLoading(false);}
 };
 useEffect(()=>{if(open)load();},[open,section,allowed]);

 const editUser=async u=>{const level=Number(prompt("Nível:",u.level)||u.level),xp=Number(prompt("XP total:",u.total_xp)||u.total_xp),title=prompt("Título:",u.equipped_title||"");try{await rpc("admin_update_profile",{p_user_id:u.id,p_name:u.name,p_level:level,p_total_xp:xp,p_title:title||null,p_is_private:u.is_private});await load()}catch(e){setError(e?.message||"Não foi possível editar o usuário.")}};
 const deletePost=async id=>{if(!confirm("Excluir esta publicação?"))return;try{await rpc("admin_delete_post",{p_post_id:id});await load()}catch(e){setError(e?.message||"Não foi possível excluir a publicação.")}};
 const saveRole=async()=>{try{await rpc("admin_set_role_by_email",{p_email:email,p_role:roleKind,p_title:roleTitle});setEmail("");await load()}catch(e){setError(e?.message||"Não foi possível alterar o administrador.")}};
 const removeRole=async email=>{try{await rpc("admin_remove_role_by_email",{p_email:email});await load()}catch(e){setError(e?.message||"Não foi possível remover o administrador.")}};
 const createMission=async()=>{try{await rpc("admin_create_mission",{p_title:mission.title,p_description:mission.description,p_difficulty:mission.difficulty,p_xp:Number(mission.xp)});setMission({title:"",description:"",difficulty:"medium",xp:50});await load()}catch(e){setError(e?.message||"Não foi possível criar a missão.")}};
 const deleteMission=async id=>{try{await rpc("admin_delete_mission",{p_id:id});await load()}catch(e){setError(e?.message||"Não foi possível excluir a missão.")}};

 const startDrag=e=>{if(e.button!==undefined&&e.button!==0)return;const p=e.touches?.[0]||e;const rect=e.currentTarget.getBoundingClientRect();dragging.current=true;moved.current=false;offset.current={x:p.clientX-rect.left,y:p.clientY-rect.top};e.currentTarget.setPointerCapture?.(e.pointerId)};
 const moveDrag=e=>{if(!dragging.current)return;const p=e.touches?.[0]||e;const w=window.innerWidth,h=window.innerHeight,size=58;const x=Math.max(6,Math.min(w-size-6,p.clientX-offset.current.x)),y=Math.max(6,Math.min(h-size-6,p.clientY-offset.current.y));if(Math.abs(x-(fab.x??w-76))>3||Math.abs(y-(fab.y??h-208))>3)moved.current=true;setFab({x,y})};
 const endDrag=()=>{dragging.current=false};
 if(!allowed)return null;
 const fabStyle={position:"fixed",left:fab.x==null?undefined:fab.x,top:fab.y==null?undefined:fab.y,right:fab.x==null?16:undefined,bottom:fab.y==null?150:undefined,zIndex:10001,width:60,height:60,borderRadius:"50%",border:"2px solid #E2C46F",background:"#C9A455",color:"#140D12",fontSize:26,boxShadow:"0 8px 30px #0009",display:"flex",alignItems:"center",justifyContent:"center",touchAction:"none",userSelect:"none",cursor:"grab"};
 return <>
  <button aria-label="Abrir painel ADM" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClick={()=>{if(!moved.current)setOpen(true)}} style={fabStyle}>👑</button>
  {open&&<div style={{position:"fixed",inset:0,zIndex:10000,background:"#000b",display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
   <div style={{...base,width:"min(100%,1000px)",maxHeight:"92vh",overflow:"auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><div><h2 style={{margin:"0 0 4px"}}>👑 Painel Administrativo</h2><small>Administrador {role==="super_admin"?"Supremo":""}</small></div><button style={btn} onClick={()=>setOpen(false)}>✕</button></div>
    <div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"14px 0"}}>{[["users","👥 Usuários"],["posts","📰 Feed"],["missions","🎯 Missões"],["admins","👑 Administradores"]].map(([k,l])=><button key={k} onClick={()=>setSection(k)} style={{...btn,background:section===k?"#C9A455":"#291C2B",color:section===k?"#140D12":"#F5EFE6"}}>{l}</button>)}</div>
    {error&&<div style={{...base,borderColor:"#A33",marginBottom:10}}>⚠️ {error}</div>}
    {loading?<p>Carregando...</p>:section==="users"?<div>{users.map(u=><div key={u.id} style={{...base,marginBottom:8,display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",flexWrap:"wrap"}}><div><b>{u.name}</b><div style={{fontSize:12,opacity:.8}}>{u.email} · Nível {u.level} · {u.total_xp} XP {u.role?`· ${u.title||u.role}`:""}</div></div><button style={btn} onClick={()=>editUser(u)}>✏️ Editar</button></div>)}</div>:section==="posts"?<div>{posts.map(p=><div key={p.id} style={{...base,marginBottom:8}}><b>{p.author_name||"Usuário"}</b><div style={{margin:"6px 0"}}>{p.text}</div><small>{new Date(p.created_at).toLocaleString()} · ❤️ {p.likes_count} · 💬 {p.comments_count}</small><div><button style={{...btn,marginTop:7}} onClick={()=>deletePost(p.id)}>🗑️ Excluir</button></div></div>)}</div>:section==="admins"?<div>{role==="super_admin"&&<div style={{...base,marginBottom:12}}><h3>Adicionar administrador</h3><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email do usuário" style={{padding:10,borderRadius:9,width:"100%",boxSizing:"border-box",marginBottom:7}}/><select value={roleKind} onChange={e=>setRoleKind(e.target.value)} style={{padding:10,borderRadius:9,marginRight:7}}><option value="admin">Administrador</option><option value="super_admin">Administrador Supremo</option></select><input value={roleTitle} onChange={e=>setRoleTitle(e.target.value)} placeholder="Título" style={{padding:10,borderRadius:9,marginRight:7}}/><button style={btn} onClick={saveRole}>Adicionar</button></div>}{roles.map(r=><div key={r.user_id} style={{...base,marginBottom:8,display:"flex",justifyContent:"space-between",flexWrap:"wrap"}}><span><b>{r.name||r.email}</b><br/><small>{r.email} · {r.title} · {r.role}</small></span>{role==="super_admin"&&<button style={btn} onClick={()=>removeRole(r.email)}>Remover</button>}</div>)}</div>:<div><div style={{...base,marginBottom:12}}><h3>Nova missão administrativa</h3><input value={mission.title} onChange={e=>setMission({...mission,title:e.target.value})} placeholder="Título" style={{padding:10,width:"100%",boxSizing:"border-box",marginBottom:7}}/><textarea value={mission.description} onChange={e=>setMission({...mission,description:e.target.value})} placeholder="Descrição" style={{padding:10,width:"100%",boxSizing:"border-box",marginBottom:7}}/><select value={mission.difficulty} onChange={e=>setMission({...mission,difficulty:e.target.value})} style={{padding:10,marginRight:7}}><option value="beginner">beginner</option><option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option><option value="nightmare">nightmare</option></select><input type="number" value={mission.xp} onChange={e=>setMission({...mission,xp:e.target.value})} style={{padding:10,width:90,marginRight:7}}/><button style={btn} onClick={createMission}>Criar</button></div>{missions.map(m=><div key={m.id} style={{...base,marginBottom:8,display:"flex",justifyContent:"space-between",gap:10}}><span><b>{m.title}</b><br/><small>{m.description} · {m.difficulty} · {m.xp} XP</small></span><button style={btn} onClick={()=>deleteMission(m.id)}>🗑️</button></div>)}</div>}
   </div>
  </div>}
 </>;
}
