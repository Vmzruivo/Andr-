export const APP_SECURITY={version:'1.0.0',maxTextLength:500,maxNameLength:80,maxLimit:500};
export function cleanText(value,max=APP_SECURITY.maxTextLength){return String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,max)}
export function cleanName(value){return cleanText(value,APP_SECURITY.maxNameLength)||'Aventureiro'}
export function safeLimit(value,fallback=50){const n=Number(value);return Number.isFinite(n)?Math.min(Math.max(Math.floor(n),1),APP_SECURITY.maxLimit):fallback}
export function requireUserId(id){if(!id||typeof id!=='string')throw new Error('Sessão inválida.');return id}
export function isSameUser(a,b){return !!a&&!!b&&a===b}
