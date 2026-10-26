// Copia la app web (carpeta superior) a native/www para empaquetarla dentro de las apps nativas.
import { cpSync, rmSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), web = join(here, '..', '..'), out = join(here, '..', 'www');
const skip = new Set(['native', 'tests', 'db', 'node_modules', '.git', 'splash', 'screens', 'package.json', 'vercel.json', 'legal-mc.mobileconfig', 'README.md', 'CAMBIOS.md', '.gitignore', '.github']);
rmSync(out, { recursive: true, force: true }); mkdirSync(out);
for (const f of readdirSync(web)) if (!skip.has(f) && !f.startsWith('.')) cpSync(join(web, f), join(out, f), { recursive: true });
// En la app nativa la portada abre directamente el despacho (no hace falta "descargar la app").
writeFileSync(join(out, 'index.html'), readFileSync(join(out, 'app.html')));
console.log('www listo:', readdirSync(out).length, 'archivos');
