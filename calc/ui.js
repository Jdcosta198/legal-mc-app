// Calculadora jurídica del despacho (interfaz). Motor probado en calc/arancel.js.
// Guarda cotizaciones en la nube si la tabla "quotes" existe (db/mejoras-despacho.sql);
// si no, en un historial privado de este dispositivo.
import * as AR from './arancel.js';
import { GRUPOS, TRABAJOS, trabajo } from './soluciones.js';

const root = document.getElementById('calc-root');
const D = () => window.LegalDespacho;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => AR.formatoColones(Math.round(Number(n) || 0));
const norm = s => String(s || '').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
const num = v => { const s = String(v ?? '').trim().replace(/[^\d.,-]/g, ''); if (!s) return 0; const n = Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s); return Number.isFinite(n) ? n : 0; };
const METHOD = { fixed: 'Monto fijo de referencia', legalScale: 'Tarifa general progresiva (art. 16)', notarialScale: 'Tarifa notarial progresiva (art. 74)', executorScale: 'Escala del albacea (CC 557)', percent: 'Porcentaje sobre la base', hours: 'Por hora profesional (art. 7)' };
const LOCAL = 'lmc-cotizaciones';

const st = { tab: 'calc', mode: 'abogacia', q: '', group: null, actionId: null, serviceId: null, amount: '', hours: '', quantity: '1', complexity: '0', agreedFee: '', discount: '', expenses: '', d6: false, client: '', phone: '', caseId: '', notes: '', validDays: '15', catQ: '', history: [] };

const tarifa = () => st.serviceId ? AR.tarifa(st.serviceId) : null;
const job = () => st.actionId ? trabajo(st.actionId) : null;
function compute() {
  const t = tarifa(); if (!t) return null;
  const input = { amount: num(st.amount), hours: t.method === 'hours' ? (st.hours === '' ? (t.defaultHours || 1) : num(st.hours)) : 0, quantity: Math.trunc(num(st.quantity)) || 0, complexity: Number(st.complexity) || 0, discount: num(st.discount), expenses: num(st.expenses), stamps: 0, agreedFee: num(st.agreedFee) };
  const cargos = t.mode === 'notariado' ? AR.timbresNotariales(t, input.amount, job()?.costProfile || undefined) : [];
  const ct = AR.totalesCargos(cargos, st.d6);
  const full = { ...input, stamps: ct.official, expenses: input.expenses + ct.expenses };
  return { t, job: job(), input: full, r: AR.calcular(t, full), v: AR.validar(st.mode, t.area, t, full), cargos, ct, etapas: AR.etapasDePago(t) };
}

// ---------------- vistas ----------------
function render() {
  const tabs = [['calc', 'Calcular'], ['cat', `Catálogo (${AR.TARIFAS.length})`], ['hist', 'Cotizaciones'], ['notes', 'Notas jurídicas']];
  root.innerHTML = `<div class="calc-tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" aria-selected="${st.tab === id}" class="${st.tab === id ? 'selected' : ''}" data-c="tab" data-id="${id}">${l}</button>`).join('')}</div><div id="calc-body">${st.tab === 'cat' ? catalog() : st.tab === 'hist' ? historyView() : st.tab === 'notes' ? notes() : main()}</div>`;
  if (st.tab === 'calc') refresh();
}
const modeSwitch = () => `<div class="seg" role="group" aria-label="Tipo de actuación">${[['abogacia', 'Abogacía'], ['notariado', 'Notariado']].map(([m, l]) => `<button type="button" class="${st.mode === m ? 'on' : ''}" aria-pressed="${st.mode === m}" data-c="mode" data-id="${m}">${l}</button>`).join('')}</div>`;
function main() {
  const t = tarifa(), j = job();
  return `<div class="calc-grid"><div class="calc-col">
  <div class="card calc-step"><div class="step-h"><span class="step-n">1</span><div><h3>¿Qué necesita el cliente?</h3><p class="label">Buscá entre ${TRABAJOS.length} trabajos jurídicos o elegí una materia.</p></div></div>${modeSwitch()}
   <input id="cq" data-k="q" type="search" autocomplete="off" placeholder="Ej.: compraventa, pensión, despido, amparo, sociedad…" value="${esc(st.q)}" aria-label="Buscar trabajo jurídico"><div id="picker">${picker()}</div></div>
  ${t ? `<div class="card calc-step"><div class="step-h"><span class="step-n">2</span><div><h3>Datos del cálculo</h3><p class="label">${esc(METHOD[t.method])}${t.factor !== 1 ? ` × ${(t.factor * 100).toLocaleString('es-CR')} %` : ''}</p></div></div>
   <div class="picked"><div><span class="kicker">${esc(j?.stage || t.area)}</span><strong>${esc(j?.name || t.name)}</strong><small>${esc(t.name)} · Arancel art. ${esc(t.article)}</small><small>${esc(t.note)}</small><small class="cap">Requiere: ${esc(t.capacity)}</small></div><button type="button" class="secondary" data-c="clear">Cambiar</button></div>
   <div class="form-grid calc-form">${fields(t)}</div></div>
  <div class="card calc-step"><div class="step-h"><span class="step-n">3</span><div><h3>Cliente y proforma</h3><p class="label">${D()?.features?.quotes ? 'La cotización se guarda en la nube del despacho.' : 'La cotización se guarda en el historial de este dispositivo.'}</p></div></div>
   <div class="form-grid calc-form">${clientFields()}</div><div class="dialog-actions"><button type="button" class="secondary" data-c="proforma">Ver proforma</button><button type="button" class="pill" data-c="save">Guardar cotización</button></div></div>` : ''}
  </div><aside class="calc-side" id="calc-out" aria-live="polite"></aside></div>`;
}
function picker() {
  const q = norm(st.q.trim());
  if (q) {
    const w = q.split(/\s+/);
    const jobs = TRABAJOS.filter(a => a.mode === st.mode && w.every(x => norm(a.name + ' ' + a.description + ' ' + a.stage + ' ' + (AR.tarifa(a.serviceId)?.name || '')).includes(x))).slice(0, 14);
    const tars = AR.TARIFAS.filter(t => t.mode === st.mode && w.every(x => norm(t.name + ' ' + t.area + ' ' + t.article).includes(x))).slice(0, 6);
    if (!jobs.length && !tars.length) return `<p class="empty">Sin resultados en ${st.mode === 'abogacia' ? 'abogacía' : 'notariado'}. Probá otra palabra o cambiá a ${st.mode === 'abogacia' ? 'Notariado' : 'Abogacía'}.</p>`;
    return `<div class="picks">${jobs.map(jobBtn).join('')}${tars.length ? `<p class="section-kicker" style="margin:12px 0 2px">ACTUACIONES DEL ARANCEL</p>${tars.map(tarBtn).join('')}` : ''}</div>`;
  }
  const gs = GRUPOS.filter(g => g.mode === st.mode), g = gs.find(x => x.id === st.group);
  return `<div class="group-chips">${gs.map(x => `<button type="button" class="${x.id === st.group ? 'on' : ''}" data-c="group" data-id="${x.id}"><span aria-hidden="true">${esc(x.icon)}</span> ${esc(x.shortTitle)}</button>`).join('')}</div>${g ? `<p class="label">${esc(g.description)}</p><div class="picks">${g.actions.map(jobBtn).join('')}</div>` : ''}`;
}
function jobBtn(a) { const t = AR.tarifa(a.serviceId); return `<button type="button" class="pick ${a.id === st.actionId ? 'on' : ''}" data-c="pick" data-id="${esc(a.id)}"><span><strong>${esc(a.name)}</strong><small>${esc(a.description)}</small></span><span class="pick-r"><em>${esc(a.stage)}</em><b>${t.method === 'fixed' ? money(t.reference) : 'Art. ' + esc(t.article)}</b></span></button>`; }
function tarBtn(t) { return `<button type="button" class="pick ${t.id === st.serviceId && !st.actionId ? 'on' : ''}" data-c="pickt" data-id="${esc(t.id)}"><span><strong>${esc(t.name)}</strong><small>${esc(t.area)} · Art. ${esc(t.article)}</small></span><span class="pick-r"><b>${t.method === 'fixed' ? money(t.reference) : esc(METHOD[t.method])}</b></span></button>`; }
function field(k, label, { help = '', wide = false, type = 'text', mode = 'decimal', ph = '' } = {}) { return `<div class="${wide ? 'calc-wide' : ''}"><label for="c-${k}">${esc(label)}</label><input id="c-${k}" data-k="${k}" type="${type}" ${mode ? `inputmode="${mode}"` : ''} placeholder="${esc(ph)}" value="${esc(st[k])}">${help ? `<small>${esc(help)}</small>` : ''}<small class="err" id="e-${k}"></small></div>`; }
function fields(t) {
  const q = AR.etiquetaCantidad(t), scale = ['legalScale', 'notarialScale', 'executorScale', 'percent'].includes(t.method);
  return `${scale ? field('amount', (t.baseLabel || 'Cuantía') + ' (₡)', { wide: true, ph: '0', help: t.mode === 'notariado' ? 'También es la base de timbres, derechos e impuestos.' : '' }) : ''}${t.method === 'hours' ? field('hours', 'Horas profesionales', { ph: String(t.defaultHours || 1), help: `${money(AR.HORA_PROFESIONAL)} por hora (art. 7).` }) : ''}${t.mode === 'notariado' && !scale ? field('amount', 'Valor del acto para timbres (₡, opcional)', { ph: '0', help: 'Vacío si el acto es inestimable.' }) : ''}${field('quantity', q.label, { type: 'number', mode: 'numeric', help: q.help })}
  <div><label for="c-complexity">Complejidad</label><select id="c-complexity" data-k="complexity">${AR.NIVELES_COMPLEJIDAD.map(v => `<option value="${v}" ${Number(st.complexity) === v ? 'selected' : ''}>${esc(AR.etiquetaComplejidad(t.mode, v))}</option>`).join('')}</select></div>
  ${field('agreedFee', 'Honorario pactado (₡, opcional)', { ph: 'Mínimo del Arancel', help: 'No puede ser inferior al mínimo.' })}${field('discount', 'Descuento (₡)', { ph: '0' })}${field('expenses', 'Gastos y suplidos (₡)', { ph: '0' })}
  ${t.mode === 'notariado' ? `<label class="check-row calc-wide"><input type="checkbox" data-k="d6" ${st.d6 ? 'checked' : ''}> Aplicar descuento del 6 % en timbres elegibles</label>` : ''}`;
}
function clientFields() {
  const cs = D()?.cases || [];
  return `<div class="calc-wide"><label for="c-caseId">Expediente (opcional)</label><select id="c-caseId" data-k="caseId"><option value="">Sin vincular</option>${cs.filter(c => c.status !== 'closed').map(c => `<option value="${esc(c.id)}" ${st.caseId === c.id ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></div>${field('client', 'Cliente', { mode: '', ph: 'Nombre completo o razón social' })}${field('phone', 'WhatsApp (con 506)', { type: 'tel', mode: 'tel', ph: '50688888888' })}${field('validDays', 'Vigencia (días)', { type: 'number', mode: 'numeric' })}<div class="calc-wide"><label for="c-notes">Alcance y condiciones</label><textarea id="c-notes" data-k="notes" rows="3" placeholder="Etapas incluidas, audiencias, recursos, exclusiones…">${esc(st.notes)}</textarea></div>`;
}
function out() {
  const R = compute();
  if (!R) return `<div class="calc-total"><span class="kicker">Total estimado</span><strong>₡0</strong><p>Elegí un trabajo jurídico para calcular el honorario mínimo del Arancel, el IVA y, en notariado, los timbres, derechos e impuestos.</p></div><p class="label">${esc(AR.ARANCEL.nombre)} · ${esc(AR.ARANCEL.version)} · verificado ${esc(AR.ARANCEL.verificado)}.</p>`;
  const { t, r, v, cargos, ct, etapas, input } = R, errs = Object.values(v.errors), pend = cargos.filter(c => c.status === 'pendiente');
  const sc = AR.escalaDe(t), tr = sc && input.amount > 0 ? AR.tramos(sc, input.amount) : [];
  const row = (l, val, cls = '') => `<div class="tr ${cls}"><span>${l}</span><b>${val}</b></div>`;
  return `<div class="calc-total ${v.isValid ? '' : 'invalid'}"><span class="kicker">Total estimado</span><strong>${v.isValid ? money(r.total) : '—'}</strong>${v.isValid ? '' : `<div class="calc-errs">${errs.map(e => `<div>⚠ ${esc(e)}</div>`).join('')}</div>`}
   ${row('Mínimo del Arancel', money(r.minimo))}${input.agreedFee > 0 ? row('Honorario pactado', money(r.honorariosBase)) : ''}${r.ajusteComplejidad ? row('Ajuste por complejidad', '+ ' + money(r.ajusteComplejidad)) : ''}${r.descuentos ? row('Descuento', '− ' + money(r.descuentos)) : ''}${row('Honorarios', money(r.subtotal))}${row('IVA 13 %', money(r.iva))}${t.mode === 'notariado' ? row('Timbres, derechos e impuestos' + (ct.stampDiscount ? ' (−6 %)' : ''), money(r.timbres)) : ''}${r.gastos ? row('Gastos y suplidos', money(r.gastos)) : ''}${etapas && v.isValid ? row('Forma de pago (Arancel)', etapas.map(e => Math.round(e[1] * 100) + ' %').join(' · ')) : ''}</div>
  ${cargos.length ? `<details class="card calc-det" open><summary>Timbres, derechos e impuestos</summary>${pend.length ? `<p class="notice">${pend.length} cargo(s) por confirmar con la tasación oficial antes de facturar.</p>` : ''}${cargos.map(c => `<div class="tr ${c.status === 'pendiente' ? 'pend' : ''}"><span>${esc(c.label)}${c.note ? `<small>${esc(c.note)}</small>` : ''}</span><b>${c.status === 'pendiente' ? 'Confirmar' : money(c.amount)}</b></div>`).join('')}</details>` : ''}
  ${tr.length ? `<details class="card calc-det"><summary>Cómo se calculó</summary>${tr.map(x => `<div class="tr"><span>${(x.tasa * 100).toLocaleString('es-CR')} % sobre ${money(x.base)}</span><b>${money(x.monto)}</b></div>`).join('')}${t.factor !== 1 ? `<div class="tr"><span>× ${(t.factor * 100).toLocaleString('es-CR')} % (art. ${esc(t.article)})</span><b>${money(tr.reduce((s, x) => s + x.monto, 0) * t.factor)}</b></div>` : ''}${t.reference ? `<div class="tr"><span>Mínimo absoluto</span><b>${money(t.reference)}</b></div>` : ''}</details>` : ''}
  <p class="label">Arancel, art. ${esc(t.article)} · ${esc(AR.ARANCEL.version)} · <a href="${AR.ARANCEL.url}" target="_blank" rel="noopener noreferrer">texto oficial ↗</a></p>`;
}
function refresh() {
  const o = document.getElementById('calc-out'); if (o) o.innerHTML = out();
  const R = compute();
  root.querySelectorAll('.err').forEach(el => { const k = el.id.slice(2); el.textContent = R?.v.errors[k] || ''; el.closest('div')?.classList.toggle('has-err', !!(R?.v.errors[k])); });
}
function catalog() {
  return `<div class="filter-row">${modeSwitch()}<div class="grow"><label for="ccat">Buscar en el catálogo</label><input id="ccat" data-k="catQ" type="search" placeholder="Actuación, materia o artículo…" value="${esc(st.catQ)}"></div></div><div id="cat-list" class="cat-list">${catList()}</div>`;
}
function catList() {
  const w = norm(st.catQ.trim()).split(/\s+/).filter(Boolean);
  const xs = AR.TARIFAS.filter(t => t.mode === st.mode && w.every(x => norm(t.name + ' ' + t.area + ' ' + t.article + ' ' + t.note).includes(x)));
  if (!xs.length) return '<p class="empty">Sin actuaciones que coincidan.</p>';
  return xs.map(t => `<div class="cat-row"><div><strong>${esc(t.name)}</strong><small>${esc(t.area)} · Art. ${esc(t.article)} · ${esc(METHOD[t.method])}${t.factor !== 1 ? ` × ${(t.factor * 100).toLocaleString('es-CR')} %` : ''}</small><small>${esc(t.note)}</small></div><div class="cat-r"><b>${t.reference ? money(t.reference) : '—'}</b><button type="button" class="secondary" data-c="pickt" data-id="${esc(t.id)}">Calcular</button></div></div>`).join('');
}
function historyView() {
  const cloud = D()?.features?.quotes, list = st.history;
  return `<p class="label">${cloud ? 'Cotizaciones guardadas en la nube del despacho (visibles para ambos profesionales).' : 'Cotizaciones guardadas en este dispositivo. Para compartirlas entre ambos profesionales, instalá la mejora de base de datos (db/mejoras-despacho.sql).'}</p>
  <div class="records">${list.length ? list.map((q, i) => `<article class="record"><div><h3>${esc(q.client_name || 'Sin cliente')}</h3><p>${esc(q.service)}</p><p>${esc(new Date(q.created_at).toLocaleString('es-CR'))}</p></div><div class="actions"><b class="q-total">${money(q.total)}</b><button type="button" class="secondary" data-c="hprof" data-id="${i}">Proforma</button>${q.client_phone ? `<button type="button" class="secondary" data-c="hwa" data-id="${i}">WhatsApp</button>` : ''}</div></article>`).join('') : '<p class="empty">Todavía no hay cotizaciones guardadas.</p>'}</div>`;
}
function notes() {
  const F = AR.FUENTES;
  const ns = ['La representación, defensa, asesoría y redacción jurídica corresponde a una persona profesional en Derecho debidamente incorporada. La cotización debe definir etapas, audiencias, recursos y gastos incluidos.', 'La autorización de instrumentos públicos, certificaciones, autenticaciones y actuaciones con fe pública exige que el notario esté habilitado.', 'El artículo 129 del Código Notarial permite determinados asuntos en sede notarial: deben ser no contenciosos y no pueden figurar como interesados personas menores de edad ni incapaces.', 'El Arancel establece honorarios mínimos obligatorios. La calculadora impide honorarios pactados o descuentos por debajo del mínimo; un monto superior debe convenirse por escrito.', 'La proforma no es un comprobante tributario. La factura electrónica se emite en Tico Factura o un sistema autorizado.', 'El timbre fiscal documental se muestra en ₡0: la Ley 10586 derogó los artículos 239 a 248 del Código Fiscal.', 'Los timbres, derechos e impuestos son estimaciones; los marcados "Confirmar" deben verificarse con la tasación oficial.'];
  const links = [[F.arancel, 'Arancel vigente de Abogacía y Notariado'], [F.arancel109, 'Artículo 109 — Timbre del Colegio de Abogados'], [F.registryLaw, 'Ley de Aranceles del Registro Público'], [F.vehicleTariffs, 'Registro Nacional — aranceles de bienes muebles'], [F.agriculturalStamp, 'Ley del Timbre Agrario'], [F.municipalStamp, 'Timbre Municipal'], [F.propertyTransferTax, 'Impuesto de traspaso de inmuebles'], [F.stampDiscount, 'Ley de Expendio de Timbres'], [F.cpc, 'Código Procesal Civil — sucesorios'], [F.codigoCivil, 'Código Civil — albaceazgo (art. 557)'], [F.codigoNotarial129, 'Código Notarial, artículo 129'], [F.hacienda, 'Tico Factura · Hacienda']];
  return `<div class="cards"><div class="card"><h3>Notas jurídicas</h3><ol class="notes-list">${ns.map(n => `<li>${esc(n)}</li>`).join('')}</ol></div><div class="card"><h3>Fuentes oficiales</h3>${links.map(([u, l]) => `<a class="resource" href="${u}" target="_blank" rel="noopener noreferrer"><span>${esc(l)}</span><span aria-hidden="true">↗</span></a>`).join('')}<p class="label">${esc(AR.ARANCEL.version)} · verificado ${esc(AR.ARANCEL.verificado)}.</p></div></div>`;
}

// ---------------- proforma ----------------
function doc() {
  const R = compute(); if (!R) throw Error('Elegí primero un trabajo jurídico.'); if (!R.v.isValid) throw Error(Object.values(R.v.errors)[0]);
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return { number: `PF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`, date: d.toISOString(), validDays: Math.max(1, Math.trunc(num(st.validDays)) || 15), client: st.client.trim(), phone: st.phone.replace(/\D/g, ''), service: (R.job ? R.job.name + ' — ' : '') + R.t.name, article: R.t.article, base: R.input.amount, baseLabel: R.t.baseLabel || 'Valor del acto', notes: st.notes.trim(), complexity: Number(st.complexity) ? AR.etiquetaComplejidad(R.t.mode, Number(st.complexity)) : '', r: R.r, cargos: R.cargos, stampDiscount: R.ct.stampDiscount, etapas: R.etapas, tarifaId: R.t.id, trabajoId: R.job?.id || null, issuer: D()?.profile?.display_name || '' };
}
function proformaHtml(x) {
  const lines = [['Honorarios profesionales' + (x.complexity ? ` (${x.complexity})` : ''), x.r.honorariosAntesDescuento]]; if (x.r.descuentos) lines.push(['Descuento', -x.r.descuentos]); lines.push(['IVA 13 % sobre honorarios', x.r.iva]); for (const c of x.cargos || []) lines.push([c.label + (c.status === 'pendiente' ? ' (por confirmar)' : ''), c.amount]); if (x.stampDiscount) lines.push(['Descuento 6 % en timbres', -x.stampDiscount]); if (x.r.gastos) lines.push(['Gastos y suplidos', x.r.gastos]);
  return `<article class="proforma"><header><div><div class="pf-firm">Legal Martínez &amp; Cortés</div><div class="pf-sub">${x.issuer ? esc(x.issuer) + ' · ' : ''}Costa Rica</div></div><div class="pf-meta"><div class="pf-title">PROFORMA</div><div>N.º ${esc(x.number)}</div><div>Fecha: ${esc(new Date(x.date).toLocaleDateString('es-CR'))}</div><div>Vigencia: ${esc(x.validDays)} días</div></div></header>
  <section class="pf-grid"><div><span>Cliente</span><strong>${esc(x.client || '—')}</strong></div><div><span>Servicio</span><strong>${esc(x.service)}</strong></div>${x.base ? `<div><span>Base de cálculo</span><strong>${esc(x.baseLabel)}: ${money(x.base)}</strong></div>` : ''}<div><span>Fundamento</span><strong>Arancel, art. ${esc(x.article)}</strong></div></section>${x.notes ? `<section class="pf-notes"><span>Alcance y condiciones</span><p>${esc(x.notes)}</p></section>` : ''}
  <table class="pf-table"><thead><tr><th>Concepto</th><th>Monto</th></tr></thead><tbody>${lines.map(([l, a]) => `<tr><td>${esc(l)}</td><td>${a < 0 ? '− ' : ''}${money(Math.abs(a))}</td></tr>`).join('')}</tbody><tfoot><tr><td>TOTAL</td><td>${money(x.r.total)}</td></tr></tfoot></table>
  ${x.etapas ? `<section class="pf-notes"><span>Forma de pago sugerida por el Arancel</span><p>${x.etapas.map(([l, p]) => `${Math.round(p * 100)} % — ${esc(l)}: ${money(x.r.total * p)}`).join('<br>')}</p></section>` : ''}
  <footer><p>Documento preliminar sin validez tributaria. Honorarios conforme al ${esc(AR.ARANCEL.nombre)} (${esc(AR.ARANCEL.version)}); timbres e impuestos estimados sujetos a la tasación oficial. No constituye contrato: la aceptación requiere acuerdo escrito con alcance, forma de pago y firma de ambas partes.</p><div class="pf-sign"><div>Firma del profesional</div><div>Aceptación de la persona cliente</div></div></footer></article>`;
}
let dlg;
function showProforma(x) {
  if (!dlg) { dlg = document.createElement('dialog'); dlg.className = 'pf-dialog'; document.body.append(dlg); dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-pf=close]')) dlg.close(); if (e.target.closest('[data-pf=print]') && window.LegalNative?.isNative) { const html = '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width"><title>Proforma</title><style>' + [...document.styleSheets].flatMap(s => { try { return [...s.cssRules].map(r => r.cssText) } catch { return [] } }).filter(t => /pf-|proforma/.test(t)).join('') + 'body{margin:0;background:#fff}</style>' + dlg.querySelector('.pf-wrap').innerHTML; window.LegalNative.shareFile('Proforma-Legal-MC.html', new Blob([html], { type: 'text/html' }), 'Compartir proforma').catch(err => D()?.message(err.message, true)); return; }
 if (e.target.closest('[data-pf=print]')) { document.body.classList.add('printing'); const done = () => { document.body.classList.remove('printing'); removeEventListener('afterprint', done); }; addEventListener('afterprint', done); print(); setTimeout(done, 60000); } }); }
  dlg.innerHTML = `<div class="pf-wrap">${proformaHtml(x)}</div><div class="dialog-actions no-print"><button type="button" class="secondary" data-pf="close">Cerrar</button><button type="button" class="pill" data-pf="print">Imprimir o guardar PDF</button></div>`;
  dlg.showModal();
}
function whatsapp(x) { const phone = (x.client_phone || x.phone || '').replace(/\D/g, ''); if (phone.length < 8) return D()?.message('Agregá un teléfono con código de país (506…).', true); const t = `Estimado(a) ${x.client_name || x.client}: le saluda Legal Martínez & Cortés. Le compartimos una propuesta de servicios profesionales por ${money(x.total ?? x.r.total)} (${x.service}). Con gusto conversamos las condiciones. Este mensaje no constituye contrato.`; window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(t), '_blank', 'noopener'); }

async function loadHistory() {
  try { if (D()?.features?.quotes) st.history = (await D().listQuotes()).map(q => ({ ...q, total: Number(q.total) })); else st.history = JSON.parse(localStorage.getItem(LOCAL) || '[]'); } catch { st.history = []; }
}
async function save() {
  const x = doc(); if (!x.client) throw Error('Indicá el nombre del cliente.');
  const row = { client_name: x.client, client_phone: x.phone || null, case_id: st.caseId || null, service: x.service + ' (Arancel art. ' + x.article + ')', tariff_id: x.tarifaId, total: x.r.total, detail: x };
  if (D()?.features?.quotes) await D().saveQuote(row);
  else { const list = JSON.parse(localStorage.getItem(LOCAL) || '[]'); list.unshift({ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() }); localStorage.setItem(LOCAL, JSON.stringify(list.slice(0, 200))); }
  Object.assign(st, { agreedFee: '', discount: '', expenses: '', notes: '' }); st.tab = 'hist'; await loadHistory(); render();
  D()?.message('Cotización guardada.');
}

// ---------------- eventos ----------------
function pick(serviceId, actionId) { st.serviceId = serviceId; st.actionId = actionId; st.mode = AR.tarifa(serviceId).mode; st.tab = 'calc'; render(); setTimeout(() => { const f = root.querySelector('.calc-form input'); f?.focus({ preventScroll: true }); f?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 40); }
root.addEventListener('click', async e => {
  const b = e.target.closest('[data-c]'); if (!b) return; const id = b.dataset.id;
  try {
    switch (b.dataset.c) {
      case 'tab': st.tab = id; if (id === 'hist') await loadHistory(); render(); break;
      case 'mode': if (st.mode !== id) { st.mode = id; st.group = null; if (tarifa()?.mode !== id) { st.serviceId = null; st.actionId = null; } } render(); break;
      case 'group': st.group = st.group === id ? null : id; document.getElementById('picker').innerHTML = picker(); break;
      case 'pick': { const a = trabajo(id); if (a) pick(a.serviceId, a.id); } break;
      case 'pickt': pick(id, null); break;
      case 'clear': st.serviceId = null; st.actionId = null; render(); break;
      case 'proforma': showProforma(doc()); break;
      case 'save': b.disabled = true; try { await save(); } finally { b.disabled = false; } break;
      case 'hprof': { const q = st.history[Number(id)]; if (q?.detail) showProforma(q.detail); } break;
      case 'hwa': whatsapp(st.history[Number(id)]); break;
    }
  } catch (err) { D()?.message(err.message || 'No se pudo completar la operación.', true); }
});
root.addEventListener('input', e => {
  const k = e.target.dataset?.k; if (!k) return; st[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (k === 'q') { document.getElementById('picker').innerHTML = picker(); return; }
  if (k === 'catQ') { document.getElementById('cat-list').innerHTML = catList(); return; }
  if (k === 'caseId') { const c = (D()?.cases || []).find(x => x.id === e.target.value); if (c?.client_name && !st.client) { st.client = c.client_name; const i = document.getElementById('c-client'); if (i) i.value = st.client; } }
  refresh();
});
document.addEventListener('legal-signout', () => { Object.assign(st, { client: '', phone: '', caseId: '', notes: '', history: [] }); render(); });
document.addEventListener('legal-features', () => { if (st.tab === 'calc' && tarifa()) render(); });
function updateCases() { const sel = document.getElementById('c-caseId'); if (!sel || document.activeElement === sel) return; const v = sel.value; sel.innerHTML = '<option value="">Sin vincular</option>' + (D()?.cases || []).filter(c => c.status !== 'closed').map(c => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join(''); sel.value = v; }
D()?.listeners.add(updateCases);
render();
window.LegalCalc = { st, compute, render, pick };
