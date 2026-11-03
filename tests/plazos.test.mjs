import assert from 'node:assert/strict';
import { pascua, iso, calcular, feriados } from '../plazos.js';

let ok = 0; const t = (n, f) => { f(); ok++; console.log('  ✓', n); };

t('Pascua 2024-2027', () => {
  assert.equal(iso(pascua(2024)), '2024-03-31'); assert.equal(iso(pascua(2025)), '2025-04-20');
  assert.equal(iso(pascua(2026)), '2026-04-05'); assert.equal(iso(pascua(2027)), '2027-03-28');
});
t('Feriados 2026: Jueves y Viernes Santo', () => {
  const f = feriados(2026); assert.ok(f.has('2026-04-02')); assert.ok(f.has('2026-04-03')); assert.ok(!f.has('2026-08-31'));
  assert.ok(feriados(2026, { dudosos: true }).has('2026-08-31'));
});
t('Electrónica lunes → notificado martes, corre miércoles (ejemplo Ley 8687)', () => {
  const r = calcular({ fecha: '2026-03-02', medio: 'electronico', cantidad: 3 });
  assert.equal(r.notificado, '2026-03-03'); assert.equal(r.inicio, '2026-03-04'); assert.equal(r.vence, '2026-03-06'); assert.equal(r.recomendado, '2026-03-05');
});
t('Electrónica sábado → notificado lunes, corre martes', () => {
  const r = calcular({ fecha: '2026-03-07', cantidad: 1 });
  assert.equal(r.notificado, '2026-03-09'); assert.equal(r.inicio, '2026-03-10'); assert.equal(r.vence, '2026-03-10');
});
t('Salta Semana Santa (jueves y viernes) y el fin de semana', () => {
  const r = calcular({ fecha: '2026-03-30', cantidad: 5 }); // notif. mar 31, inicia mié 1 abr
  assert.equal(r.inicio, '2026-04-01'); assert.equal(r.vence, '2026-04-09');
  assert.deepEqual(r.excluidos.map(x => x[0]), ['2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05']);
});
t('Opción cierre de Semana Santa completa alarga el plazo', () => {
  const r = calcular({ fecha: '2026-03-26', cantidad: 3, opciones: { semanaSanta: true } }); // notif. vie 27, inicia lun 30 (inhábil)
  assert.equal(r.inicio, '2026-04-06'); assert.equal(r.vence, '2026-04-08');
});
t('Criterio conservador: 31 de agosto cuenta como hábil salvo que se indique', () => {
  const a = calcular({ fecha: '2026-08-26', medio: 'personal', cantidad: 3 }); // inicia jue 27
  assert.equal(a.vence, '2026-08-31');
  const b = calcular({ fecha: '2026-08-26', medio: 'personal', cantidad: 3, opciones: { dudosos: true } });
  assert.equal(b.vence, '2026-09-01');
});
t('Cierre de fin de año que cruza el año', () => {
  const r = calcular({ fecha: '2026-12-17', medio: 'personal', cantidad: 3, opciones: { cierre: { desde: '12-21', hasta: '01-04' } } });
  assert.equal(r.inicio, '2026-12-18'); assert.equal(r.vence, '2027-01-06');
});
t('Meses de fecha a fecha; 31 → último día del mes; prórroga si cae inhábil', () => {
  assert.equal(calcular({ fecha: '2026-01-31', medio: 'personal', cantidad: 1, unidad: 'meses' }).vence, '2026-03-02'); // 28 feb sábado → lun 2 mar
  assert.equal(calcular({ fecha: '2026-03-10', medio: 'personal', cantidad: 2, unidad: 'meses' }).vence, '2026-05-11'); // 10 may domingo
  assert.equal(calcular({ fecha: '2026-06-15', medio: 'personal', cantidad: 1, unidad: 'anos' }).vence, '2027-06-15');
});
t('Días naturales con prórroga al siguiente hábil', () => {
  const r = calcular({ fecha: '2026-03-02', medio: 'personal', cantidad: 5, unidad: 'naturales' }); // inicia mar 3 → sáb 7 → lun 9
  assert.equal(r.vence, '2026-03-09');
});
t('Validación de entradas', () => {
  assert.throws(() => calcular({ fecha: '', cantidad: 3 })); assert.throws(() => calcular({ fecha: '2026-01-05', cantidad: 0 }));
});
console.log(`plazos: ${ok}/11 correctas`);
