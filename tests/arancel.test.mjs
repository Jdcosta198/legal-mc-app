import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import * as A from '../calc/arancel.js';
import { GRUPOS, TRABAJOS } from '../calc/soluciones.js';

const require = createRequire(import.meta.url);
const { vectores } = require('./vectores.cjs');
const sha = s => createHash('sha256').update(s).digest('hex');

// Huellas obtenidas el 26/10/2026 ejecutando EXACTAMENTE el mismo generador sobre la
// Calculadora Jurídica CR original (calculadora-juridica-cr.jdcostarica845.chatgpt.site).
const HUELLA_ORIGINAL_CALCULOS = 'f0a801261862087eef372d2fd93d47a988fa47fdc5056efb82f199275996a205';
const HUELLA_ORIGINAL_CATALOGO = '588c05f785cb457a1da90586c87700152328d91b4d5422736324d8e9c5266bc8';
const HUELLA_ORIGINAL_GUIA = '33e15685f8265e222b46fe197034d91c0b71a0b5d80321548bf455e9fbdcaf32';

test('4.800 cálculos idénticos a la calculadora original (honorarios, validación, timbres, totales)', () => {
  const api = { calcular: A.calcular, validar: A.validar, timbres: A.timbresNotariales, totales: A.totalesCargos, cantidad: A.etiquetaCantidad, complejidad: A.etiquetaComplejidad };
  assert.equal(sha(vectores(A.TARIFAS, api)), HUELLA_ORIGINAL_CALCULOS);
});

test('catálogo de 160 actuaciones idéntico al original', () => {
  const t = JSON.stringify(A.TARIFAS.map(x => [x.id, x.mode, x.area, x.name, x.article, x.method, x.reference, x.venue, x.capacity, x.note, x.factor ?? 1, x.baseLabel ?? null, x.defaultHours ?? null]));
  assert.equal(A.TARIFAS.length, 160);
  assert.equal(sha(t), HUELLA_ORIGINAL_CATALOGO);
});

test('guía de 280 trabajos idéntica al original y sin referencias rotas', () => {
  const z = JSON.stringify(GRUPOS.map(g => [g.id, g.mode, g.title, g.shortTitle, g.icon, g.description, g.actions.map(a => [a.name, a.description, a.stage, a.serviceId, a.costProfile])]));
  assert.equal(sha(z), HUELLA_ORIGINAL_GUIA);
  assert.equal(TRABAJOS.length, 280);
  for (const a of TRABAJOS) {
    const t = A.tarifa(a.serviceId);
    assert.ok(t, `tarifa inexistente: ${a.serviceId}`);
    assert.equal(t.mode, a.mode, `${a.name} apunta a una tarifa de otro modo`);
  }
  assert.equal(new Set(A.TARIFAS.map(t => t.id)).size, A.TARIFAS.length, 'ids de tarifa duplicados');
});

test('tarifa general (art. 16) calculada a mano', () => {
  assert.equal(A.escalaGeneral(10_000_000), 2_000_000);            // 20 %
  assert.equal(A.escalaGeneral(16_500_000), 3_300_000);
  assert.equal(A.escalaGeneral(82_500_000), 3_300_000 + 9_900_000); // + 15 % de 66 M
  assert.equal(A.escalaGeneral(100_000_000), 13_200_000 + 1_750_000);
  assert.equal(A.escalaGeneral(0), 0);
  assert.equal(A.escalaGeneral(-5), 0);
});

test('tarifa notarial (art. 74) calculada a mano', () => {
  assert.equal(A.escalaNotarial(11_000_000), 220_000);
  assert.equal(A.escalaNotarial(16_500_000), 302_500);
  assert.equal(A.escalaNotarial(33_000_000), 508_750);
  assert.equal(A.escalaNotarial(50_000_000), 678_750);
});

test('albacea (CC 557) y desglose por tramos', () => {
  assert.equal(A.escalaAlbacea(10_000), 500);
  assert.equal(A.escalaAlbacea(110_000), 3_000);
  const tr = A.tramos(A.TRAMOS_GENERAL, 20_000_000);
  assert.deepEqual(tr.map(x => [x.base, x.tasa]), [[16_500_000, .2], [3_500_000, .15]]);
});

test('casos típicos del bufete', () => {
  const mon = A.calcular(A.tarifa('abo-mon'), { amount: 10_000_000, hours: 0, quantity: 1, complexity: 0, discount: 0, expenses: 0, stamps: 0, agreedFee: 0 });
  assert.equal(mon.honorariosBase, 1_000_000);            // 50 % de 2 M
  assert.equal(mon.iva, 130_000);
  const hora = A.calcular(A.tarifa('abo-hora'), { amount: 0, hours: 3, quantity: 1, complexity: 0, discount: 0, expenses: 0, stamps: 0, agreedFee: 0 });
  assert.equal(hora.honorariosBase, 272_250);              // 3 × ₡90.750
  const amparo = A.calcular(A.tarifa('abo-amparo'), { amount: 0, hours: 0, quantity: 1, complexity: .5, discount: 0, expenses: 0, stamps: 0, agreedFee: 0 });
  assert.equal(amparo.honorariosAntesDescuento, 272_250);  // 181.500 + 50 %
  const cv = A.calcular(A.tarifa('not-cv'), { amount: 1_000_000, hours: 0, quantity: 1, complexity: 0, discount: 0, expenses: 0, stamps: 0, agreedFee: 0 });
  assert.equal(cv.honorariosBase, 60_500);                 // el mínimo supera el 2 % (₡20.000)
});

test('impide cobrar por debajo del mínimo del Arancel', () => {
  const t = A.tarifa('abo-civil'), base = { amount: 10_000_000, hours: 0, quantity: 1, complexity: 0, discount: 0, expenses: 0, stamps: 0, agreedFee: 0 };
  assert.equal(A.validar('abogacia', t.area, t, base).isValid, true);
  assert.match(A.validar('abogacia', t.area, t, { ...base, agreedFee: 1_500_000 }).errors.agreedFee, /inferior al mínimo/);
  assert.match(A.validar('abogacia', t.area, t, { ...base, discount: 1 }).errors.discount, /por debajo del mínimo/);
  assert.equal(A.validar('abogacia', t.area, t, { ...base, complexity: .3, discount: 500_000 }).isValid, true);
  assert.match(A.validar('abogacia', t.area, t, { ...base, amount: 0 }).errors.amount, /mayor que cero/);
  assert.match(A.validar('notariado', t.area, t, base).errors.service, /no corresponde/);
});

test('timbres de un traspaso de inmueble de ₡50 M', () => {
  const items = A.timbresNotariales(A.tarifa('not-cv'), 50_000_000);
  const by = Object.fromEntries(items.map(i => [i.id, i.amount]));
  assert.equal(by['auto-registry'], 250_000);       // 5 por mil
  assert.equal(by['auto-transfer-tax'], 750_000);   // 1,5 %
  assert.equal(by['auto-agrarian'], 75_000);        // 1,5 por mil
  assert.equal(by['auto-municipal'], 100_000);      // 2 por mil
  assert.equal(by['auto-college'], 11_000);
  assert.equal(by['auto-archive'], 20);
  assert.equal(by['auto-fiscal-repealed'], 0);
  const tot = A.totalesCargos(items, true);
  assert.equal(tot.officialGross, 1_186_020);
  assert.equal(tot.stampDiscount, Math.round((250_000 + 100_000 + 11_000 + 20) * .06));
});

test('formas de pago del Arancel suman 100 %', () => {
  for (const t of A.TARIFAS) {
    const e = A.etapasDePago(t);
    if (e) assert.ok(Math.abs(e.reduce((s, [, p]) => s + p, 0) - 1) < 1e-9, t.id);
  }
  assert.deepEqual(A.etapasDePago(A.tarifa('abo-mon')).map(x => x[1]), [.5, .25, .25]);
  assert.equal(A.etapasDePago(A.tarifa('abo-civil')).length, 3);
});
