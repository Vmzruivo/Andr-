import { supabase } from "./src/lib/supabaseClient.js";

const STORY_STYLE_ID = "codex-story-style";
const STORY_ROOT_ID = "codex-story-root";
const STORY_MODAL_ID = "codex-story-modal";
const MAX_STORY_BYTES = 1500000;
let currentSession = null;
let stories = [];
let realtimeChannel = null;
let observerStarted = false;

const escapeHtml = (value = "") => String(value).replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;", "'":"&#39;"}[c]));

function injectStyles() {
  if (document.getElementById(STORY_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STORY_STYLE_ID;
  style.textContent = `
    .cv-story-wrap{margin-bottom:14px;overflow:hidden}
    .cv-story-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .cv-story-head h2{margin:0;font-size:20px}
    .cv-story-head span{font-size:12px;color:#A497A3}
    .cv-story-list{display:flex;gap:12px;overflow-x:auto;padding:3px 2px 9px;scrollbar-width:none}
    .cv-story-list::-webkit-scrollbar{display:none}
    .cv-story-item{border:0;background:transparent;color:#F5EFE6;min-width:76px;width:76px;padding:0;cursor:pointer;font:inherit}
    .cv-story-ring{width:68px;height:68px;margin:0 auto 6px;border-radius:50%;padding:3px;background:linear-gradient(135deg,#C9A455,#E7CD8C,#7A4356,#C9A455);box-shadow:0 0 0 2px #1E1520,0 6px 20px rgba(0,0,0,.22);position:relative}
    .cv-story-ring.seen{background:#5d5660}
    .cv-story-avatar{width:100%;height:100%;border-radius:50%;object-fit:cover;background:#291C2B;display:grid;place-items:center;font-weight:800;font-size:23px;color:#F5EFE6;border:2px solid #140D12}
    .cv-story-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700}
    .cv-story-add{position:absolute;right:-2px;bottom:-2px;width:23px;height:23px;border-radius:50%;border:2px solid #140D12;background:#C9A455;color:#140D12;font-weight:900;display:grid;place-items:center}
    .cv-story-create{border:1px dashed rgba(201,164,85,.7);background:linear-gradient(145deg,rgba(201,164,85,.14),rgba(122,67,86,.12));border-radius:18px;padding:10px 12px;color:#F5EFE6;cursor:pointer;font-weight:800;white-space:nowrap}
    .cv-story-modal{position:fixed;inset:0;z-index:9999;background:rgba(8,5,8,.82);display:grid;place-items:center;padding:18px;backdrop-filter:blur(10px)}
    .cv-story-dialog{width:min(440px,100%);max-height:90vh;overflow:auto;background:#1E1520;border:1px solid rgba(201,164,85,.35);border-radius:26px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
    .cv-story-dialog img{width:100%;max-height:58vh;object-fit:contain;border-radius:18px;background:#140D12}
    .cv-story-dialog h3{margin:0 0 5px}
    .cv-story-dialog p{white-space:pre-wrap;line-height:1.5;color:#F5EFE6}
    .cv-story-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .cv-story-close{border:0;background:#291C2B;color:#F5EFE6;border-radius:12px;padding:8px 11px;cursor:pointer}
    .cv-story-input{width:100%;box-sizing:border-box;min-height:110px;resize:vertical;border:1px solid #473444;background:#140D12;color:#F5EFE6;border-radius:15px;padding:12px;font:inherit;outline:none}
    .cv-story-input:focus{border-color:#C9A455}
    .cv-story-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
    .cv-story-btn{border:0;border-radius:13px;padding:10px 14px;background:#C9A455;color:#140D12;font-weight:900;cursor:pointer}
    .cv-story-btn.secondary{background:#291C2B;color:#F5EFE6}
    .cv-story-btn:disabled{opacity:.55;cursor:not-allowed}
    .cv-story-preview{margin-top:10px;border-radius:16px;max-height:220px;max-width:100%;display:block}
    .cv-story-error{color:#ffb4b4;font-size:13px;margin:8px 0 0}
    .cv-story-empty{color:#A497A3;font-size:13px}
  `;
  document.head.appendChild(style);
}

function formatRemaining(expiresAt) {
  const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const hours = Math.max(1, Math.floor(ms / 3600000));
  return `${hours}h restantes`;
}

function latestByUser(rows) {
  const map = new Map();
  for (const row of rows) if (!map.has(row.user_id)) map.set(row.user_id, row);
  return [...map.values()];
}

async function loadStories() {
  if (!currentSession) return;
  const { data, error } = await supabase
    .from("stories")
    .select("id,user_id,text,image_url,created_at,expires_at,profiles(name,avatar_url)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (!error) {
    stories = data || [];
    renderStories();
  }
}

function openViewer(userId) {
  const userStories = stories.filter(s => s.user_id === userId);
  if (!userStories.length) return;
  let index = 0;
  const modal = document.createElement("div");
  modal.className = "cv-story-modal";
  modal.id = STORY_MODAL_ID;
  const render = () => {
    const story = userStories[index];
    const profile = story.profiles || {};
    modal.innerHTML = `<div class="cv-story-dialog">
      <div class="cv-story-top"><div><b>${escapeHtml(profile.name || "Aventureiro")}</b><div class="cv-story-empty">${formatRemaining(story.expires_at)}</div></div><button class="cv-story-close" data-close>Fechar</button></div>
      ${story.image_url ? `<img src="${story.image_url}" alt="Story">` : ""}
      ${story.text ? `<p>${escapeHtml(story.text)}</p>` : ""}
      <div class="cv-story-actions"><button class="cv-story-btn secondary" data-prev ${index === 0 ? "disabled" : ""}>Anterior</button><button class="cv-story-btn" data-next ${index === userStories.length - 1 ? "disabled" : ""}>Próximo</button></div>
    </div>`;
    modal.querySelector("[data-close]").onclick = () => modal.remove();
    modal.querySelector("[data-prev]").onclick = () => { index--; render(); };
    modal.querySelector("[data-next]").onclick = () => { index++; render(); };
  };
  render();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Escolha uma imagem."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("A imagem precisa ter no máximo 8 MB."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > max || h > max) { const scale = Math.min(max / w, max / h); w = Math.round(w * scale); h = Math.round(h * scale); }
        const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL("image/jpeg", .78);
        if (out.length > MAX_STORY_BYTES * 1.4) return reject(new Error("Essa foto ficou muito grande. Escolha outra imagem."));
        resolve(out);
      };
      img.onerror = () => reject(new Error("Formato de imagem não suportado pelo navegador."));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function openCreator() {
  const modal = document.createElement("div");
  modal.className = "cv-story-modal";
  modal.id = STORY_MODAL_ID;
  modal.innerHTML = `<div class="cv-story-dialog"><div class="cv-story-top"><div><h3>✨ Criar story</h3><div class="cv-story-empty">Fica disponível por 24 horas.</div></div><button class="cv-story-close" data-close>Fechar</button></div><textarea class="cv-story-input" maxlength="300" placeholder="O que está acontecendo na sua jornada?"></textarea><label class="cv-story-create" style="display:inline-block;margin-top:10px"><input type="file" accept="image/*" hidden data-image>📷 Adicionar foto</label><img class="cv-story-preview" data-preview hidden><p class="cv-story-error" data-error></p><div class="cv-story-actions"><button class="cv-story-btn" data-publish>Publicar story</button></div></div>`;
  document.body.appendChild(modal);
  let imageData = null;
  modal.querySelector("[data-close]").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  modal.querySelector("[data-image]").onchange = async e => {
    try { imageData = await compressImage(e.target.files?.[0]); const p = modal.querySelector("[data-preview]"); p.src = imageData; p.hidden = false; }
    catch (err) { modal.querySelector("[data-error]").textContent = err.message; }
  };
  modal.querySelector("[data-publish]").onclick = async () => {
    const text = modal.querySelector("textarea").value.trim();
    const error = modal.querySelector("[data-error]");
    if (!text && !imageData) { error.textContent = "Escreva algo ou adicione uma foto."; return; }
    const btn = modal.querySelector("[data-publish]"); btn.disabled = true; error.textContent = "";
    const { error: insertError } = await supabase.from("stories").insert({ user_id: currentSession.user.id, text: text || null, image_url: imageData || null });
    if (insertError) { error.textContent = insertError.message; btn.disabled = false; return; }
    modal.remove(); await loadStories();
  };
}

function renderStories() {
  const target = document.querySelector("#root .cv-card h2")?.closest(".cv-card");
  if (!target || !/Feed da comunidade/i.test(target.textContent || "")) return;
  let root = document.getElementById(STORY_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = STORY_ROOT_ID;
    root.className = "cv-card cv-story-wrap";
    target.parentNode.insertBefore(root, target);
  }
  const latest = latestByUser(stories);
  root.innerHTML = `<div class="cv-story-head"><div><h2>✨ Stories</h2><span>Momentos da comunidade · desaparecem em 24h</span></div><button class="cv-story-create" data-create>＋ Seu story</button></div><div class="cv-story-list">${latest.length ? latest.map(s => { const p = s.profiles || {}; const name = p.name || "Aventureiro"; const avatar = p.avatar_url ? `<img class="cv-story-avatar" src="${p.avatar_url}" alt="">` : `<div class="cv-story-avatar">${escapeHtml(name.slice(0,1).toUpperCase())}</div>`; return `<button class="cv-story-item" data-user="${s.user_id}"><div class="cv-story-ring">${avatar}${s.user_id === currentSession.user.id ? `<span class="cv-story-add">＋</span>` : ""}</div><span class="cv-story-name">${escapeHtml(s.user_id === currentSession.user.id ? "Seu story" : name)}</span></button>`; }).join("") : `<span class="cv-story-empty">Ainda não há stories. Seja o primeiro a publicar.</span>`}</div>`;
  root.querySelector("[data-create]").onclick = openCreator;
  root.querySelectorAll("[data-user]").forEach(btn => btn.onclick = () => openViewer(btn.dataset.user));
}

async function start() {
  injectStyles();
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  if (!currentSession) return;
  await loadStories();
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  realtimeChannel = supabase.channel("codex-stories-live").on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => loadStories()).subscribe();
  if (!observerStarted) {
    observerStarted = true;
    const observer = new MutationObserver(() => renderStories());
    observer.observe(document.getElementById("root"), { childList: true, subtree: true });
  }
  supabase.auth.onAuthStateChange(async (_event, session) => { currentSession = session; if (session) await loadStories(); });
}

start().catch(() => {});
