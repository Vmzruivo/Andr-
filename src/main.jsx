import React from "react";
import { createRoot } from "react-dom/client";
import CodexVitae from "../codex-vitae.jsx";
import "./app.css";
import "./mission-layout.css";

class AppErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(error){return {error}}
  render(){
    if(this.state.error)return <main style={{minHeight:"100vh",background:"#140D12",color:"#F5EFE6",fontFamily:"system-ui,sans-serif",display:"grid",placeItems:"center",padding:24}}><section style={{width:"min(100%,520px)",background:"#1E1520",border:"1px solid #7A4356",borderRadius:18,padding:22}}><h1 style={{marginTop:0}}>Codex Vitae</h1><p>O aplicativo encontrou um erro ao iniciar.</p><pre style={{whiteSpace:"pre-wrap",fontSize:12,color:"#E7CD8C",overflowWrap:"anywhere"}}>{String(this.state.error?.message||this.state.error)}</pre><button onClick={()=>window.location.reload()} style={{border:0,borderRadius:10,padding:"11px 15px",fontWeight:800,cursor:"pointer"}}>Recarregar</button></section></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <AppErrorBoundary><CodexVitae /></AppErrorBoundary>
);
