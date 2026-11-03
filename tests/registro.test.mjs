// Pruebas del catálogo de consultas del Registro y del PDF (node --test).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
await import('../registro-catalogo.js');
await import('../registro-pdf.js');
const R = globalThis.RegistroCatalogo, P = globalThis.RegistroPDF;

test('el catálogo cubre las 39 consultas gratuitas, sin repetir identificadores', () => {
  assert.equal(R.CONSULTAS.length, 39);
  assert.equal(new Set(R.CONSULTAS.map(c => c.id)).size, 39);
  for (const c of R.CONSULTAS) {
    assert.ok(R.SECCIONES.some(s => s[0] === c.sec), c.id);
    assert.ok(c.link && c.campos.length && typeof c.plan === 'function', c.id);
  }
  // Las que comparten texto en el índice se distinguen por su posición.
  assert.equal(R.porId['bm-persona-id'].nth, 1);
  assert.equal(R.porId['bi-persona-id'].nth, 0);
});

test('lee números de finca como los escribe la gente', () => {
  assert.deepEqual(R.leerFinca('4-179693-002'), { provincia: '4', numero: '179693', duplicado: '', horizontal: '', derecho: '002' });
  assert.deepEqual(R.leerFinca('1 123456 F 000'), { provincia: '1', numero: '123456', duplicado: '', horizontal: 'F', derecho: '000' });
  assert.deepEqual(R.leerFinca('4179693002'), { provincia: '4', numero: '179693', duplicado: '', horizontal: '', derecho: '002' });
  assert.equal(R.leerFinca('9-123'), null);
});

test('cédulas, placas y planos', () => {
  assert.deepEqual(R.leerCedJur('3-101-264096'), { tipo: '3', clase: '101', consecutivo: '264096' });
  assert.deepEqual(R.leerCedFis('402010838'), { p1: '4', p2: '0201', p3: '0838' });
  assert.deepEqual(R.leerCedFis('4-201-838'), { p1: '4', p2: '0201', p3: '0838' });
  assert.deepEqual(R.leerPlaca('BKN-216'), { clase: '', numero: 'BKN216' });
  assert.deepEqual(R.leerPlaca('cl 123456'), { clase: 'CL', numero: '123456' });
  assert.deepEqual(R.leerPlaca('MOT-456789'), { clase: 'MOT', numero: '456789' });
  assert.deepEqual(R.leerPlano('H-0959238-1991'), { provincia: '4', numero: '959238', anio: '1991' });
  assert.deepEqual(R.leerPlano('SJ-12345-2001'), { provincia: '1', numero: '12345', anio: '2001' });
});

test('la consulta rápida reconoce el tipo de número', () => {
  const r = t => R.reconocer(t)?.consulta;
  assert.equal(r('4-179693-002'), 'bi-finca');
  assert.equal(r('BKN-216'), 'bm-vehiculo');
  assert.equal(r('3-101-264096'), 'pj-cedula');
  assert.equal(r('4-0201-0838'), 'bi-persona-id');
  assert.equal(r('H-959238-1991'), 'cat-plano');
  assert.equal(r('INVERSIONES DEL PACIFICO S.A.'), 'pj-nombre');
  assert.equal(r(''), undefined);
});

test('prepara los pasos exactos que se probaron en el Registro real', () => {
  assert.deepEqual(R.preparar('bi-finca', { provincia: '4', numero: '179693', derecho: '2' }).pasos,
    [{ s: { o: 'HEREDIA', ov: ['1', '7'] }, v: '4' }, { t: { ne: 'finca' }, v: '179693' }, { t: { ml: 3 }, v: '002' }]);
  const v = R.preparar('bm-vehiculo', { por: 'PLA', placa: 'BKN-216' }).pasos;
  assert.deepEqual(v.map(p => p.v), ['PLA', '', 'BKN216']);
  const p = R.preparar('cat-plano', { por: 'P', plano: 'H-0959238-1991' }).pasos;
  assert.deepEqual(p.map(x => x.v), ['P', '4', '959238', '1991']);
  const pj = R.preparar('pj-cedula', { cedula: '4-000-042139' }).pasos;
  assert.deepEqual(pj.map(x => x.v), ['4', '000', '042139']);
});

test('valida antes de consultar (no gasta consultas con datos malos)', () => {
  assert.throws(() => R.preparar('bi-finca', { provincia: '4', numero: '' }), e => e.campo === 'numero');
  assert.throws(() => R.preparar('bi-finca', { provincia: '9', numero: '1' }), e => e.campo === 'provincia');
  assert.throws(() => R.preparar('pj-cedula', { cedula: '3-101' }), e => e.campo === 'cedula');
  assert.throws(() => R.preparar('bm-vehiculo', { por: 'PLA', placa: '###' }), e => e.campo === 'placa');
  assert.throws(() => R.preparar('bi-persona-id', { tipoId: '1', id: '123' }), e => e.campo === 'id');
  // Los campos que no aplican no se exigen (placa no se pide si se busca por chasis).
  assert.equal(R.preparar('bm-vehiculo', { por: 'CHA', valor: 'MA3ZF62S3GA842498' }).pasos.length, 2);
});

test('todas las consultas generan pasos con datos de ejemplo', () => {
  const ej = { provincia: '1', numero: '12345', tomo: '2014', asiento: '29235', consecutivo: '1', secuencia: '1', cedula: '3-101-123456', nombre: 'PRUEBA',
    tipoId: '1', id: '1-1234-1234', tipoNombre: '1', por: 'PLA', placa: 'BKN-216', valor: 'X1', plano: 'SJ-12345-2001', serie: '2024' };
  for (const c of R.CONSULTAS) {
    const d = { ...ej }; for (const f of c.campos) if (f.t === 'sel' && !f.ops.some(o => o[0] === d[f.k])) d[f.k] = f.ops[0][0];
    const r = R.preparar(c.id, d);
    assert.ok(r.pasos.length >= 1 && r.pasos.every(p => (p.s || p.t) && typeof p.v === 'string'), c.id);
    assert.ok(r.resumen.startsWith(c.nombre), c.id);
  }
});

test('el PDF es válido, tiene tildes y parte el texto largo', () => {
  const b = P.crear({ titulo: 'Finca por número: 4-179693-002', datos: [['Consulta', 'Finca (año)']], bloques: Array.from({ length: 120 }, (_, i) => ({ t: 'fila', x: 'PROVINCIA: HEREDIA  |  Señor Ñúñez ' + i })) });
  const s = Buffer.from(b).toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4') && s.trimEnd().endsWith('%%EOF'));
  assert.ok(s.includes('Se\xf1or \xd1\xfa\xf1ez'));
  assert.match(s, /\/Count 2/);
  assert.ok(s.includes('Finca \\(a\xf1o\\)'));
  assert.equal(P.nombreArchivo('Vehículo: BKN-216', new Date(2026, 10, 3, 13, 38)), 'Registro - Vehículo BKN-216 - 2026-11-03 1338.pdf');
});

test('registro-bot.js está al día con sus fuentes', () => {
  execFileSync(process.execPath, [new URL('../scripts/build-bot.mjs', import.meta.url).pathname, '--check']);
  const bot = readFileSync(new URL('../registro-bot.js', import.meta.url), 'utf8');
  assert.ok(bot.includes('RegistroCatalogo') && bot.includes('RegistroPDF') && bot.includes('__lmcStart'));
});
