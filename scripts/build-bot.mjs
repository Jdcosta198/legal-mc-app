// Une el catálogo, el generador de PDF y el asistente en un solo archivo: /registro-bot.js
// (es lo que se inyecta dentro de rnpdigital.com en la app de Android y lo que carga el favorito en la web).
// Uso: node scripts/build-bot.mjs   ·   node scripts/build-bot.mjs --check (falla si el archivo no está al día)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const partes = ['registro-catalogo.js', 'registro-pdf.js', 'registro/bot.js'];
const out = '/* Generado por scripts/build-bot.mjs a partir de ' + partes.join(', ') + '. No editar a mano. */\n'
  + partes.map(p => readFileSync(root + p, 'utf8').replace(/^'use strict';\n/, '')).join('\n;\n');
const dest = root + 'registro-bot.js';
if (process.argv.includes('--check')) {
  if (!existsSync(dest) || readFileSync(dest, 'utf8') !== out) { console.error('registro-bot.js no está al día: ejecutá node scripts/build-bot.mjs'); process.exit(1); }
  console.log('registro-bot.js al día');
} else { writeFileSync(dest, out); console.log('registro-bot.js listo,', (out.length / 1024).toFixed(1), 'KB'); }
