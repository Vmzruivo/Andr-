import React from "react";
import { createRoot } from "react-dom/client";
import CodexVitae from "../codex-vitae.jsx";
import AdminPanel from "./AdminPanel.jsx";
import "./app.css";
import "./mission-layout.css";

class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(error){return {error}}
  render(){
    if(this.state.error){
      const title=this.props.title||"Ritual";
      const message=String(this.state.error?.message||this.state.error||"Erro desconhecido");
      if(this.props.compact)return null;
      return <main style={{minHeight:"100vh",background:"#0c080d",color:"#F5EFE6",fontFamily:"system-ui,sans-serif",display:"grid",placeItems:"center",padding:24}}><section style={{width:"min(100%,520px)",background:"#1E1520",border:"1px solid #7A4356",borderRadius:18,padding:22}}><h1 style={{marginTop:0}}>{title}</h1><p>O aplicativo encontrou um erro ao iniciar.</p><pre style={{whiteSpace:"pre-wrap",fontSize:12,color:"#E7CD8C",overflowWrap:"anywhere"}}>{message}</pre><button onClick={()=>window.location.reload()} style={{border:0,borderRadius:10,padding:"11px 15px",fontWeight:800,cursor:"pointer"}}>Recarregar</button></section></main>;
    }
    return this.props.children;
  }
}

function App(){
  return <>
    <ErrorBoundary title="Ritual"><CodexVitae/></ErrorBoundary>
    <ErrorBoundary title="Painel ADM" compact><AdminPanel/></ErrorBoundary>
  </>;
}

const root=document.getElementById("root");
if(root)createRoot(root).render(<App/>);
else console.error("#root não encontrado");
