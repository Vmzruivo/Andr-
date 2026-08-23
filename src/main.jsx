import React from "react";
import { createRoot } from "react-dom/client";
import CodexVitae from "../codex-vitae.jsx";
import AdminPanel from "./AdminPanel.jsx";
import "./app.css";
import "./mission-layout.css";
import "./mobile-fix.css";
import "./ritual-force.css";

class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(error){return {error}}
  render(){
    if(this.state.error){
      const title=this.props.title||"Ritual";
      const message=String(this.state.error?.message||this.state.error||"Erro desconhecido");
      if(this.props.compact)return null;
      return <main className="ritual-error" style={{minHeight:"100vh",background:"#09070b",color:"#F7F0E8",fontFamily:"system-ui,sans-serif",display:"grid",placeItems:"center",padding:24}}><section style={{width:"min(100%,520px)",background:"#17111b",border:"1px solid rgba(231,205,140,.25)",borderRadius:26,padding:24,boxShadow:"0 24px 80px rgba(0,0,0,.45)"}}><div className="ritual-mark ritual-mark-small">R</div><h1 style={{marginTop:12}}>{title}</h1><p>O aplicativo encontrou um erro ao iniciar.</p><pre style={{whiteSpace:"pre-wrap",fontSize:12,color:"#E7CD8C",overflowWrap:"anywhere"}}>{message}</pre><button onClick={()=>window.location.reload()} style={{border:0,borderRadius:14,padding:"12px 18px",fontWeight:900,cursor:"pointer"}}>Recarregar</button></section></main>;
    }
    return this.props.children;
  }
}

function App(){
  return <div className="ritual-shell">
    <div className="ritual-atmosphere" aria-hidden="true"><span/><span/><span/></div>
    <div className="ritual-app-layer">
      <ErrorBoundary title="Ritual"><CodexVitae/></ErrorBoundary>
      <ErrorBoundary title="Painel ADM" compact><AdminPanel/></ErrorBoundary>
    </div>
  </div>;
}

const root=document.getElementById("root");
if(root)createRoot(root).render(<App/>);
else console.error("#root não encontrado");
