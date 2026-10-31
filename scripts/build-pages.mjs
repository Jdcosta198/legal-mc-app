// Prepara la app web para GitHub Pages, que la sirve en una subcarpeta (/legal-mc-app/).
// Copia los archivos públicos a _site/ y ajusta SOLO las rutas del propio sitio, con reglas por tipo de archivo.
import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
const B = (process.env.PAGES_BASE || '/legal-mc-app').replace(/\/$/, '');
const SITE = (process.env.PAGES_URL || 'https://jdcosta198.github.io/legal-mc-app').replace(/\/$/, '');
const root = new URL('..', import.meta.url).pathname, out = join(root, '_site');
const skip = new Set(['native', 'tests', 'db', 'scripts', '.github', '.git', '_site', 'node_modules', 'package.json', 'package-lock.json', 'vercel.json', '.vercelignore', '.gitignore', 'README.md', 'CAMBIOS.md']);
rmSync(out, { recursive: true, force: true }); mkdirSync(out);
for (const f of readdirSync(root)) if (!skip.has(f)) cpSync(join(root, f), join(out, f), { recursive: true });
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const ASSET = /(['"])\/((?:[\w-]+\/)*[\w.-]+\.(?:html|js|css|png|svg|webp|jpg|webmanifest|mobileconfig))(?=['"?#])/g;
const fix = {
  '.html': s => s.replace(/\b(href|src|content)="\/(?!\/)/g, `$1="${B}/`).replace(/url\((['"]?)\/(?!\/)/g, `url($1${B}/`),
  '.css': s => s.replace(/url\((['"]?)\/(?!\/)/g, `url($1${B}/`),
  '.webmanifest': s => { const m = JSON.parse(s); const f = v => typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? B + v : v;
    const walkJ = o => { if (Array.isArray(o)) return o.map(walkJ); if (o && typeof o === 'object') { for (const k of Object.keys(o)) o[k] = ['id', 'start_url', 'scope', 'src', 'url'].includes(k) ? f(o[k]) : walkJ(o[k]); } return o; };
    return JSON.stringify(walkJ(m), null, 1); },
  '.js': (s, p) => {
    if (p.endsWith('supabase-2.118.0.js')) return s;
    if (p.endsWith('sw.js')) {
      // El service worker compara rutas sin el prefijo de la subcarpeta y lo agrega al guardar y buscar.
      return s.replace("const CACHE=", `const B='${B}';const CACHE=`)
        .replace('c.addAll(ASSETS)', 'c.addAll(ASSETS.map(a=>B+a))')
        .replace("const path=u.pathname==='/app'?'/app.html':u.pathname;", "if(!u.pathname.startsWith(B+'/'))return;const p0=u.pathname.slice(B.length);const path=p0==='/app'?'/app.html':p0;")
        .replace('c.put(path,copy)', 'c.put(B+path,copy)').replace('caches.match(path)', 'caches.match(B+path)').replace("caches.match('/app.html')", "caches.match(B+'/app.html')");
    }
    return s.replace(ASSET, `$1${B}/$2`).replace(/https:\/\/bufete-martinez-legal-pwa\.vercel\.app/g, SITE);
  }
};
let n = 0;
for (const p of walk(out)) { const fn = fix[extname(p)]; if (!fn) continue; const s = readFileSync(p, 'utf8'), o = fn(s, p); if (o !== s) { writeFileSync(p, o); n++; console.log('  ajustado', relative(out, p)); } }
writeFileSync(join(out, '.nojekyll'), '');
cpSync(join(root, 'scripts', 'qr-pages.svg'), join(out, 'qr-app.svg'));
cpSync(join(root, 'scripts', 'legal-mc-pages.mobileconfig'), join(out, 'legal-mc.mobileconfig'));
console.log('_site listo,', n, 'archivos ajustados para', SITE + '/');
