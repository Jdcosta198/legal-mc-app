// Guarda solo la interfaz pública (pantallas, estilos, imágenes). Nunca guarda datos del despacho:
// las consultas a Supabase son de otro origen y no pasan por esta caché.
const CACHE='legal-mc-v6';
const ASSETS=['/','/index.html','/app.html','/theme.css','/workspace.css','/despacho.css','/install.css','/effects.css','/living.css','/landing.css','/app.js','/native.js','/install.js','/effects.js','/living-art.js','/workspace-ui.js','/supabase-2.118.0.js','/calc/ui.js','/calc/arancel.js','/calc/catalogo.js','/calc/soluciones.js','/justice.webp','/icon.svg','/icon-192.png','/icon-512.png','/manifest.webmanifest','/qr-app.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
 const path=u.pathname==='/app'?'/app.html':u.pathname;
 if(!ASSETS.includes(path)&&!path.startsWith('/splash/')&&!/^\/icon-/.test(path))return;
 // Red primero: siempre la versión más reciente; la caché solo sirve sin conexión.
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type==='basic'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(path,copy))}return r}).catch(async()=>(await caches.match(path))||(e.request.mode==='navigate'?caches.match('/app.html'):Response.error())))});
