import fs from 'node:fs';

const file = 'codex-vitae.jsx';
let s = fs.readFileSync(file, 'utf8');

const oldResize = 'function resizeImage(file,max=360){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height;if(w>h&&w>max){h=Math.round(h*max/w);w=max}else if(h>max){w=Math.round(w*max/h);h=max}const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);resolve(c.toDataURL("image/jpeg",.82))};img.onerror=reject;img.src=e.target.result};r.onerror=reject;r.readAsDataURL(file)})}';

const newResize = `const IMAGE_EXTENSIONS=["jpg","jpeg","png","webp","gif","bmp","svg","avif","heic","heif","tif","tiff"];
function isImageFile(file){const type=(file.type||"").toLowerCase();if(type.startsWith("image/"))return true;const name=(file.name||"").toLowerCase();const ext=name.includes(".")?name.split(".").pop():"";return IMAGE_EXTENSIONS.includes(ext)}
function readFileAsDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error("Não foi possível ler esta imagem."));r.readAsDataURL(file)})}
function resizeImage(file,max=720){return new Promise(async(resolve,reject)=>{try{if(!isImageFile(file))throw new Error("Escolha um arquivo de imagem. Formatos aceitos: JPG, JPEG, PNG, WEBP, GIF, BMP, SVG, AVIF, HEIC, HEIF, TIF e TIFF.");if(file.size>8*1024*1024)throw new Error("A foto precisa ter no máximo 8 MB.");const original=await readFileAsDataUrl(file);const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve(original)};img.onload=()=>{if(done)return;let w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!w||!h){finish();return}if(w>h&&w>max){h=Math.round(h*max/w);w=max}else if(h>max){w=Math.round(w*max/h);h=max}try{const c=document.createElement("canvas");c.width=w;c.height=h;const ctx=c.getContext("2d");if(!ctx)throw new Error();ctx.drawImage(img,0,0,w,h);const out=c.toDataURL("image/jpeg",.84);done=true;resolve(out)}catch{finish()}};img.onerror=()=>finish();img.src=original;setTimeout(finish,4000)}catch(e){reject(e)}})};
`;
if (s.includes(oldResize)) s=s.replace(oldResize,newResize);
else if (!s.includes('function isImageFile(file)')) throw new Error('Função resizeImage não encontrada');

s=s.replaceAll('type="file" accept="image/*" onChange={uploadAvatar}', 'type="file" accept="image/*,.heic,.heif,.avif,.bmp,.tif,.tiff,.svg" onChange={uploadAvatar}');

const oldUpload = 'const uploadAvatar=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=await resizeImage(f);const p=await updateProgress(session.user.id,{avatar_url:data});setProfile(p);recordActivity("photo");recordActivity("profile");recordActivity("area","settings")}catch(err){setError(err.message)}e.target.value=""};';
const newUpload = 'const uploadAvatar=async e=>{const f=e.target.files?.[0];if(!f)return;setError("");try{const data=await resizeImage(f);const p=await updateProgress(session.user.id,{avatar_url:data});setProfile(p);recordActivity("photo");recordActivity("profile");recordActivity("area","settings")}catch(err){setError(err?.message||"Não foi possível usar esta imagem.")}finally{e.target.value=""}};';
if (s.includes(oldUpload)) s=s.replace(oldUpload,newUpload);

fs.writeFileSync(file,s);
console.log('Avatar upload patch applied');
