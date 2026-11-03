// Calculadora de plazos procesales en la Agenda. Usa el motor probado plazos.js.
import { calcular, PRESETS, MEDIOS } from './plazos.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hoyCR = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Costa_Rica' }).format(new Date());
const KEY = 'lmc-plazos-opciones';
const leer = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } };
const guardar = o => { try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {} };

function montar() {
  const form = $('event-form'); if (!form || $('plazo-calc')) return;
  const op = leer();
  const box = document.createElement('details'); box.id = 'plazo-calc'; box.className = 'card plazo-calc';
  const materias = [...new Set(PRESETS.map(p => p.materia))];
  box.innerHTML = `<summary><span class="plazo-ic" aria-hidden="true">⏱</span><span><b>Calcular un vencimiento</b><small>Días hábiles de Costa Rica, feriados y notificación electrónica (Ley 8687)</small></span></summary>
  <div class="plazo-grid">
   <div><label for="pz-fecha">Fecha de transmisión o notificación</label><input id="pz-fecha" type="date" required></div>
   <div><label for="pz-medio">Medio de notificación</label><select id="pz-medio">${Object.entries(MEDIOS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></div>
   <div class="pz-wide"><label for="pz-preset">Actuación</label><select id="pz-preset"><option value="">Otro plazo (indicar)</option>${materias.map(m => `<optgroup label="${esc(m)}">${PRESETS.filter(p => p.materia === m).map(p => `<option value="${p.id}">${esc(p.nombre)} · ${p.cantidad} ${p.unidad === 'habiles' ? 'días hábiles' : p.unidad === 'meses' ? 'meses' : p.unidad === 'anos' ? 'año' : 'días'} · ${esc(p.norma)}${p.ok ? '' : ' ⚠'}</option>`).join('')}</optgroup>`).join('')}</select></div>
   <div><label for="pz-n">Plazo</label><input id="pz-n" type="number" min="1" max="3650" value="3" inputmode="numeric"></div>
   <div><label for="pz-unidad">Unidad</label><select id="pz-unidad"><option value="habiles">Días hábiles</option><option value="naturales">Días naturales</option><option value="meses">Meses</option><option value="anos">Años</option></select></div>
  </div>
  <fieldset class="pz-op"><legend>Días inhábiles adicionales</legend>
   <label><input type="checkbox" id="pz-dudosos"${op.dudosos ? ' checked' : ''}> No contar 31 de agosto ni 1.º de diciembre</label>
   <label><input type="checkbox" id="pz-ss"${op.semanaSanta ? ' checked' : ''}> Cierre del Poder Judicial lunes a miércoles santos</label>
   <label class="pz-cierre"><input type="checkbox" id="pz-cierre"${op.cierre ? ' checked' : ''}> Cierre de fin de año del <input id="pz-desde" type="text" inputmode="numeric" maxlength="5" value="${esc(op.cierre?.desde || '12-21')}" aria-label="Inicio del cierre (MM-DD)"> al <input id="pz-hasta" type="text" inputmode="numeric" maxlength="5" value="${esc(op.cierre?.hasta || '01-04')}" aria-label="Fin del cierre (MM-DD)"> (MM-DD)</label>
   <p class="label">Por seguridad estos días se cuentan como hábiles hasta que los marqués; así el vencimiento nunca queda después del real. Confirmá las fechas en la circular de la Secretaría General de la Corte.</p>
  </fieldset>
  <div id="pz-out" class="pz-out" aria-live="polite"></div>`;
  form.before(box);
  $('pz-fecha').value = hoyCR();
  const fill = () => { const p = PRESETS.find(x => x.id === $('pz-preset').value); if (p) { $('pz-n').value = p.cantidad; $('pz-unidad').value = p.unidad } run() };
  $('pz-preset').onchange = fill;
  box.addEventListener('input', e => { if (e.target.id !== 'pz-preset') run() });
  box.addEventListener('change', e => { if (e.target.id !== 'pz-preset') run() });
  run();
}

let ultimo = null;
function run() {
  const out = $('pz-out');
  const mmdd = v => /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v);
  const opciones = { dudosos: $('pz-dudosos').checked, semanaSanta: $('pz-ss').checked, cierre: null };
  if ($('pz-cierre').checked) {
    if (!mmdd($('pz-desde').value) || !mmdd($('pz-hasta').value)) { out.innerHTML = '<p class="pz-err">Escribí el cierre como MM-DD, por ejemplo 12-21 y 01-04.</p>'; return }
    opciones.cierre = { desde: $('pz-desde').value, hasta: $('pz-hasta').value };
  }
  guardar(opciones);
  const p = PRESETS.find(x => x.id === $('pz-preset').value);
  try {
    const r = calcular({ fecha: $('pz-fecha').value, medio: $('pz-medio').value, cantidad: $('pz-n').value, unidad: $('pz-unidad').value, opciones });
    ultimo = { r, p };
    const hoy = hoyCR(), vencido = r.vence < hoy, hoyVence = r.vence === hoy;
    out.innerHTML = `<div class="pz-result${vencido ? ' late' : ''}"><div><span class="label">Vence</span><strong id="pz-vence">${esc(r.largo.vence)}</strong><small>al cierre del despacho${vencido ? ' · <b>ya venció</b>' : hoyVence ? ' · <b>vence hoy</b>' : ''}</small></div>
     <div><span class="label">Presentar a más tardar</span><strong id="pz-recomendado">${esc(r.largo.recomendado)}</strong><small>un día hábil de margen</small></div></div>
     <ol class="pz-pasos">${r.pasos.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
     ${r.excluidos.length ? `<details class="pz-exc"><summary>Días no contados (${r.excluidos.length})</summary><ul>${r.excluidos.map(([d, m]) => `<li>${d.split('-').reverse().join('/')} · ${esc(m)}</li>`).join('')}</ul></details>` : ''}
     ${p && !p.ok ? `<p class="pz-warn">⚠ El plazo de ${esc(p.norma)} debe confirmarse en el SCIJ antes de usarlo.</p>` : ''}
     <div class="pz-actions"><button type="button" class="pill" id="pz-agenda">Llevar a la agenda</button><button type="button" class="secondary" id="pz-copiar">Copiar cómputo</button></div>`;
    $('pz-agenda').onclick = aAgenda; $('pz-copiar').onclick = copiar;
  } catch (e) { ultimo = null; out.innerHTML = `<p class="pz-err">${esc(e.message)}</p>` }
}

function aAgenda() {
  if (!ultimo) return; const { r, p } = ultimo;
  $('event-title').value = (`Vence: ${p ? p.nombre + ' (' + p.norma + ')' : 'plazo de ' + $('pz-n').value + ' ' + $('pz-unidad').selectedOptions[0].text.toLowerCase()} · presentar a más tardar ${r.recomendado.split('-').reverse().join('/')}`).slice(0, 200);
  $('event-date').value = `${r.vence}T16:30`;
  const sel = $('event-case'); $('event-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
  (sel && sel.options.length > 1 && !sel.value ? sel : $('event-title')).focus();
  window.LegalDespacho?.message?.('Revisá el expediente y tocá "Añadir a la agenda" para guardar el vencimiento.');
}
async function copiar() {
  if (!ultimo) return; const { r, p } = ultimo;
  const txt = [p ? `Plazo: ${p.nombre} — ${p.cantidad} ${p.unidad === 'habiles' ? 'días hábiles' : p.unidad} (${p.norma})` : `Plazo: ${$('pz-n').value} ${$('pz-unidad').selectedOptions[0].text.toLowerCase()}`, ...r.pasos,
    r.excluidos.length ? 'Días inhábiles en el periodo: ' + r.excluidos.map(([d, m]) => `${d.split('-').reverse().join('/')} (${m})`).join('; ') : '',
    `Vence: ${r.largo.vence}, al cierre del despacho.`, `Recomendación: presentar a más tardar el ${r.largo.recomendado}.`].filter(Boolean).join('\n');
  try { await navigator.clipboard.writeText(txt); $('pz-copiar').textContent = 'Copiado ✓' } catch { window.prompt('Copiá el cómputo:', txt) }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
