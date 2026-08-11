import React, { useState } from "react";
import { Home, Trophy, Medal, MessageCircle, Settings, Users, Flame, Star, Clock } from "lucide-react";

const GOLD = "#C9A455";
const GOLD_LIGHT = "#E7CD8C";
const INK = "#140D12";
const SURFACE = "#1E1520";
const SURFACE_2 = "#291C2B";
const TEXT = "#F5EFE6";
const MUTED = "#A497A3";

const tabs = [
  { id: "home", label: "Início", icon: Home },
  { id: "feed", label: "Feed", icon: Users },
  { id: "board", label: "Placar", icon: Trophy },
  { id: "achievements", label: "Conquistas", icon: Medal },
  { id: "messages", label: "Mensagens", icon: MessageCircle },
];

export default function CodexVitae() {
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useState({ name: "Aventureiro", level: 1, xp: 0, streak: 0 });
  const [posts, setPosts] = useState([]);

  const publish = () => {
    setPosts((p) => [{ id: Date.now(), name: profile.name, text: `Estou no nível ${profile.level} e construindo minha jornada!`, level: profile.level }, ...p]);
  };

  const content = {
    home: (
      <section>
        <div className="cv-card cv-hero">
          <div className="cv-avatar">{profile.name[0]}</div>
          <h1>{profile.name}</h1>
          <p>Novato • Nível {profile.level}</p>
          <div className="cv-progress"><span style={{ width: `${Math.min(profile.xp % 100, 100)}%` }} /></div>
          <small>{profile.xp % 100}/100 XP</small>
        </div>
        <div className="cv-grid">
          <div className="cv-card"><Flame /> <strong>{profile.streak}</strong><small> sequência</small></div>
          <div className="cv-card"><Star /> <strong>{profile.xp}</strong><small> XP total</small></div>
          <div className="cv-card"><Trophy /> <strong>{profile.level}</strong><small> nível</small></div>
          <div className="cv-card"><Clock /> <strong>0m</strong><small> jornada</small></div>
        </div>
      </section>
    ),
    feed: (
      <section>
        <div className="cv-card">
          <h2>Feed da comunidade</h2>
          <p>Compartilhe seu progresso com outros aventureiros.</p>
          <button className="cv-button" onClick={publish}>Compartilhar progresso</button>
        </div>
        {posts.length === 0 ? <div className="cv-empty">Ainda não há publicações.</div> : posts.map((post) => (
          <article className="cv-card" key={post.id}>
            <button className="cv-profile" onClick={() => setTab("home")}><div className="cv-avatar small">{post.name[0]}</div><b>{post.name}</b></button>
            <p>{post.text}</p><small>Nível {post.level}</small>
          </article>
        ))}
      </section>
    ),
    board: (
      <section><div className="cv-card"><h2>Placar global</h2><div className="cv-rank"><b>1º</b><span>🏆 Aventureiro</span><strong>1.250 XP</strong></div><div className="cv-rank"><b>2º</b><span>🔥 Guerreiro</span><strong>980 XP</strong></div><div className="cv-rank"><b>3º</b><span>⭐ Explorador</span><strong>760 XP</strong></div></div><div className="cv-card"><h2>⏱ Ranking por tempo</h2><p>Classificação baseada no tempo de jornada.</p></div></section>
    ),
    achievements: (
      <section><div className="cv-card"><h2>Conquistas</h2><div className="cv-achievements"><div>👣<b> Primeiro Passo</b><small> Complete sua primeira missão</small></div><div>🔥<b> Chama Constante</b><small> 7 dias seguidos</small></div><div>🏆<b> Colecionador</b><small> 50 missões</small></div><div>👑<b> Lenda Viva</b><small> Nível 20</small></div></div></div></section>
    ),
    messages: (
      <section><div className="cv-card"><h2>Mensagens</h2><button className="cv-chat" onClick={() => alert("Área de conversa pronta para conectar ao sistema de mensagens.")}><div className="cv-avatar small">G</div><span><b>Guerreiro</b><small> Vamos evoluir juntos!</small></span></button><button className="cv-chat"><div className="cv-avatar small">E</div><span><b>Explorador</b><small> Nova conquista desbloqueada.</small></span></button></div></section>
    )
  };

  return <main className="cv-app"><style>{`body{margin:0;background:${INK};color:${TEXT}}.cv-app{min-height:100vh;background:${INK};font-family:Arial,sans-serif;padding:24px 16px 100px;box-sizing:border-box}.cv-shell{max-width:680px;margin:auto}.cv-card{background:${SURFACE};border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:20px;margin-bottom:14px;box-shadow:0 12px 30px rgba(0,0,0,.22)}h1,h2{margin:0 0 8px}h1{font-size:30px}h2{font-size:21px}.cv-hero{text-align:center}.cv-hero p,.cv-card small{color:${MUTED}}.cv-avatar{width:78px;height:78px;margin:0 auto 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${GOLD},${GOLD_LIGHT});color:${INK};font-size:32px;font-weight:800}.cv-avatar.small{width:42px;height:42px;margin:0;font-size:18px}.cv-progress{height:8px;background:rgba(255,255,255,.08);border-radius:10px;margin:16px 0 6px;overflow:hidden}.cv-progress span{display:block;height:100%;background:linear-gradient(90deg,${GOLD},${GOLD_LIGHT});border-radius:10px}.cv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cv-grid .cv-card{display:flex;gap:8px;align-items:center;margin:0}.cv-grid svg{color:${GOLD};width:18px}.cv-button{border:0;border-radius:12px;padding:12px 16px;background:${GOLD};color:${INK};font-weight:700;cursor:pointer}.cv-rank{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06)}.cv-rank b{color:${GOLD_LIGHT}.cv-achievements{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cv-achievements div{background:${SURFACE_2};border-radius:14px;padding:15px;font-size:20px}.cv-achievements b,.cv-achievements small{display:block;margin-top:5px}.cv-chat,.cv-profile{width:100%;display:flex;align-items:center;gap:12px;background:transparent;color:${TEXT};border:0;padding:12px 0;text-align:left;cursor:pointer}.cv-chat span{display:flex;flex-direction:column}.cv-empty{text-align:center;color:${MUTED};padding:40px}.cv-nav{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);width:min(650px,calc(100% - 24px));background:${SURFACE};border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:8px;display:grid;grid-template-columns:repeat(5,1fr);box-shadow:0 12px 35px rgba(0,0,0,.5)}.cv-nav button{border:0;background:transparent;color:${MUTED};padding:8px 2px;border-radius:12px;cursor:pointer;font-size:10px}.cv-nav button.active{color:${GOLD_LIGHT};background:rgba(201,164,85,.1)}.cv-nav svg{display:block;margin:auto}.cv-settings{position:fixed;top:20px;right:20px;border:0;background:${SURFACE};color:${MUTED};border-radius:12px;padding:10px}@media(max-width:480px){.cv-achievements{grid-template-columns:1fr 1fr}.cv-nav button{font-size:9px}}`}</style><div className="cv-shell"><button className="cv-settings" title="Configurações"><Settings size={20}/></button><header style={{marginBottom:18}}><small style={{color:GOLD_LIGHT}}>CODEX VITAE</small></header>{content[tab]}</div><nav className="cv-nav">{tabs.map(({id,label,icon:Icon})=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={20}/><span>{label}</span></button>)}</nav></main>;
}
