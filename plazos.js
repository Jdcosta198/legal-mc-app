// Cómputo de plazos procesales en Costa Rica (motor puro, sin interfaz). Probado en tests/plazos.test.mjs.
// Reglas: plazos por días se cuentan en días hábiles (salvo norma expresa); notificación electrónica,
// fax o casillero: notificado el día hábil siguiente a la transmisión y el plazo corre desde el día hábil
// siguiente (art. 38 Ley 8687); por meses o años: de fecha a fecha y, si vence en inhábil, al siguiente hábil.
// Criterio de seguridad: ante una fecha dudosa se cuenta como HÁBIL, para que el vencimiento calculado
// nunca quede después del real. Los cierres colectivos se agregan solo si el usuario los confirma.

const pad = n => String(n).padStart(2, '0');
export const iso = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export const parse = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const add = (d, n) => new Date(d.getTime() + n * 86400000);
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
export const largo = d => `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
export const corto = d => `${d.getUTCDate()} ${MESES[d.getUTCMonth()].slice(0, 3)}`;

/** Domingo de Pascua (algoritmo gregoriano anónimo). */
export function pascua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, mes - 1, dia));
}

/** Feriados de ley (Código de Trabajo, art. 148 y leyes especiales). `dudosos`: se incluyen solo si el usuario lo indica. */
export function feriados(y, { dudosos = false } = {}) {
  const P = pascua(y), f = new Map();
  const put = (m, d, n) => f.set(`${y}-${pad(m)}-${pad(d)}`, n);
  put(1, 1, 'Año Nuevo'); put(4, 11, 'Día de Juan Santamaría'); put(5, 1, 'Día del Trabajo'); put(7, 25, 'Anexión del Partido de Nicoya');
  put(8, 2, 'Virgen de los Ángeles'); put(8, 15, 'Día de la Madre'); put(9, 15, 'Independencia'); put(12, 25, 'Navidad');
  f.set(iso(add(P, -3)), 'Jueves Santo'); f.set(iso(add(P, -2)), 'Viernes Santo');
  if (dudosos) { put(8, 31, 'Día de la Persona Negra'); put(12, 1, 'Abolición del Ejército'); }
  return f;
}

/**
 * Calendario de días inhábiles.
 * opciones: { dudosos, semanaSanta (lunes a miércoles santos), cierre: {desde:'MM-DD', hasta:'MM-DD'} | null, extra: ['AAAA-MM-DD'] }
 */
export function calendario(op = {}) {
  const cache = new Map();
  const extra = new Set(op.extra || []);
  function motivo(d) {
    const k = iso(d), y = d.getUTCFullYear(), wd = d.getUTCDay();
    if (wd === 0 || wd === 6) return wd === 0 ? 'domingo' : 'sábado';
    if (!cache.has(y)) cache.set(y, feriados(y, op));
    const fer = cache.get(y).get(k); if (fer) return 'feriado: ' + fer;
    if (op.semanaSanta) { const P = pascua(y); for (const n of [-6, -5, -4]) if (iso(add(P, n)) === k) return 'Semana Santa (cierre del Poder Judicial)'; }
    if (op.cierre) {
      const md = k.slice(5), { desde, hasta } = op.cierre;
      if (desde <= hasta ? md >= desde && md <= hasta : md >= desde || md <= hasta) return 'cierre colectivo de fin y principio de año';
    }
    if (extra.has(k)) return 'día inhábil agregado por el despacho';
    return null;
  }
  return { motivo, habil: d => !motivo(d), siguienteHabil(d) { let x = add(d, 1); while (motivo(x)) x = add(x, 1); return x; }, primerHabilDesde(d) { let x = d; while (motivo(x)) x = add(x, 1); return x; } };
}

export const MEDIOS = {
  electronico: 'Correo electrónico, fax o casillero (art. 38 Ley 8687)',
  personal: 'Personal o en casa de habitación',
  automatica: 'Automática: 24 horas después de dictada (sin medio señalado)'
};

/**
 * Calcula el vencimiento.
 * entrada: { fecha:'AAAA-MM-DD' (transmisión, notificación o dictado), medio, cantidad, unidad:'habiles'|'naturales'|'meses'|'anos', opciones }
 */
export function calcular({ fecha, medio = 'electronico', cantidad, unidad = 'habiles', opciones = {} }) {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw Error('Indicá la fecha de la notificación.');
  const n = Number(cantidad); if (!Number.isInteger(n) || n < 1 || n > 3650) throw Error('El plazo debe ser un número entero mayor que cero.');
  const cal = calendario(opciones), base = parse(fecha), pasos = [], excluidos = [];
  let notificado;
  if (medio === 'electronico') { notificado = cal.siguienteHabil(base); pasos.push(`Transmisión: ${largo(base)}. Se tiene por notificado el día hábil siguiente: ${largo(notificado)}.`); }
  else if (medio === 'automatica') { notificado = add(base, 1); pasos.push(`Dictada el ${largo(base)}; se tiene por notificada 24 horas después: ${largo(notificado)}.`); }
  else { notificado = base; pasos.push(`Notificación personal: ${largo(base)}.`); }
  const inicio = cal.siguienteHabil(notificado);
  pasos.push(`El plazo corre desde el día hábil siguiente: ${largo(inicio)}.`);
  let vence;
  if (unidad === 'habiles') {
    let x = inicio, c = 1;
    while (c < n) { x = add(x, 1); const m = cal.motivo(x); if (m) excluidos.push([iso(x), m]); else c++; }
    vence = x; pasos.push(`Se cuentan ${n} día${n > 1 ? 's' : ''} hábil${n > 1 ? 'es' : ''}${excluidos.length ? `, sin contar ${excluidos.length} día${excluidos.length > 1 ? 's' : ''} inhábil${excluidos.length > 1 ? 'es' : ''}` : ''}.`);
  } else if (unidad === 'naturales') {
    vence = add(inicio, n - 1); pasos.push(`Se cuentan ${n} días naturales (incluye sábados, domingos y feriados).`);
    if (!cal.habil(vence)) { const v2 = cal.primerHabilDesde(vence); pasos.push(`El último día (${largo(vence)}) es inhábil: se prorroga al ${largo(v2)}.`); vence = v2; }
  } else {
    const meses = unidad === 'anos' ? n * 12 : n, y = notificado.getUTCFullYear(), m0 = notificado.getUTCMonth() + meses, dia = notificado.getUTCDate();
    const ultimo = new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
    let v = new Date(Date.UTC(y, m0, Math.min(dia, ultimo)));
    pasos.push(`Plazo de ${n} ${unidad === 'anos' ? (n > 1 ? 'años' : 'año') : (n > 1 ? 'meses' : 'mes')}: de fecha a fecha desde la notificación, ${largo(v)}${dia > ultimo ? ' (último día del mes)' : ''}.`);
    if (!cal.habil(v)) { const v2 = cal.primerHabilDesde(v); pasos.push(`Ese día es inhábil (${cal.motivo(v)}): se prorroga al ${largo(v2)}.`); v = v2; }
    vence = v;
  }
  // Fecha recomendada: un día hábil antes del vencimiento (si el plazo lo permite).
  let recomendado = vence; { let x = add(vence, -1); while (x >= inicio && !cal.habil(x)) x = add(x, -1); if (x >= inicio) recomendado = x; }
  return { notificado: iso(notificado), inicio: iso(inicio), vence: iso(vence), recomendado: iso(recomendado), excluidos, pasos, largo: { notificado: largo(notificado), inicio: largo(inicio), vence: largo(vence), recomendado: largo(recomendado) } };
}

// Plazos de referencia. ✅ verificados en la fuente; ⚠️ confirmar en el SCIJ antes de usar.
export const PRESETS = [
  { id: 'civ-ap-auto', materia: 'Civil', nombre: 'Apelación de auto escrito', cantidad: 3, unidad: 'habiles', norma: 'CPC art. 67.1', ok: true },
  { id: 'civ-ap-sent', materia: 'Civil', nombre: 'Apelación de sentencia', cantidad: 5, unidad: 'habiles', norma: 'CPC art. 67.1', ok: true },
  { id: 'civ-rev', materia: 'Civil', nombre: 'Revocatoria', cantidad: 3, unidad: 'habiles', norma: 'CPC art. 66', ok: false },
  { id: 'pen-ap-sent', materia: 'Penal', nombre: 'Apelación de sentencia', cantidad: 15, unidad: 'habiles', norma: 'CPP art. 460 (Ley 8837)', ok: true },
  { id: 'pen-cas', materia: 'Penal', nombre: 'Casación', cantidad: 15, unidad: 'habiles', norma: 'CPP art. 469', ok: true },
  { id: 'lab-cas', materia: 'Laboral', nombre: 'Casación ante la Sala Segunda', cantidad: 10, unidad: 'habiles', norma: 'Código de Trabajo art. 586', ok: true },
  { id: 'adm-rec', materia: 'Administrativo', nombre: 'Revocatoria o apelación contra el acto final', cantidad: 3, unidad: 'habiles', norma: 'LGAP art. 346', ok: false },
  { id: 'amp', materia: 'Constitucional', nombre: 'Amparo: 2 meses desde que cesan los efectos directos', cantidad: 2, unidad: 'meses', norma: 'LJC art. 35', ok: true },
  { id: 'cont-cad', materia: 'Contencioso', nombre: 'Caducidad para demandar (regla general)', cantidad: 1, unidad: 'anos', norma: 'CPCA art. 39', ok: false }
];
