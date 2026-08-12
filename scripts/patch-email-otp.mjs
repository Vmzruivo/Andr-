import fs from 'node:fs';
const f='codex-vitae.jsx';let s=fs.readFileSync(f,'utf8');
if(s.includes('CODEX_EMAIL_OTP_V1')){console.log('OTP patch already applied');process.exit(0)}
s=s.replace('deleteMyAccount } from "./src/lib/supabaseClient";','deleteMyAccount, verifySignupCode } from "./src/lib/supabaseClient";');
s=s.replace('[authMode,setAuthMode]=useState("login"),[authBusy,setAuthBusy]=useState(false),[confirmationSent,setConfirmationSent]=useState(false),[email,setEmail]=useState("")','[authMode,setAuthMode]=useState("login"),[authBusy,setAuthBusy]=useState(false),[confirmationSent,setConfirmationSent]=useState(false),[verificationCode,setVerificationCode]=useState(""),[email,setEmail]=useState("")');
s=s.replace('const resend=async()=>{','const verifyCode=async()=>{setError("");if(!/^\\d{6}$/.test(verificationCode)){setError("Digite o código de 6 dígitos recebido no seu Gmail.");return}setAuthBusy(true);try{await verifySignupCode(email,verificationCode);setConfirmationSent(false);setVerificationCode("");setError("");await signIn(email,password)}catch(e){setError(e.message)}finally{setAuthBusy(false)}};\nconst resend=async()=>{');
const old='<h1>Confirme seu e-mail</h1>\n  <p>Enviamos um link de confirmação para <b>{email.trim()}</b>. Abra sua caixa de entrada (e o spam) e toque no link para ativar sua conta.</p>';
const neu='<h1>Verifique seu Gmail</h1>\n  <p>Enviamos um <b>código de 6 dígitos</b> para <b>{email.trim()}</b>. Digite o código abaixo para ativar sua conta.</p>\n  <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={verificationCode} onChange={e=>setVerificationCode(e.target.value.replace(/\\D/g,\"\").slice(0,6))} onKeyDown={e=>e.key==="Enter"&&verifyCode()}/>';
if(!s.includes(old))throw new Error('Confirmation text not found');s=s.replace(old,neu);
s=s.replace('<button className="cv-button" disabled={authBusy} onClick={resend}>{authBusy?"Enviando…":"Reenviar e-mail de confirmação"}</button>','<button className="cv-button" disabled={authBusy||verificationCode.length!==6} onClick={verifyCode}>{authBusy?"Verificando…":"Confirmar código"}</button>\n  <button className="cv-link" disabled={authBusy} onClick={resend}>{authBusy?"Aguarde…":"Enviar novo código"}</button>');
s=s.replace('CODEX_MISSION_RELIABILITY_V2','CODEX_MISSION_RELIABILITY_V2');
s=s.replace('CODEX_EMAIL_OTP_V1','CODEX_EMAIL_OTP_V1');
fs.writeFileSync(f,s);console.log('Email OTP patch applied');
