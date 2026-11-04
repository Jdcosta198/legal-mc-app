// Motor de cálculo de honorarios, timbres y cargos oficiales (Costa Rica).
// Portado y documentado desde la Calculadora Jurídica CR del bufete. Funciones puras,
// sin dependencias, probadas en tests/arancel.test.mjs.
import { TARIFAS, tarifa } from './catalogo.js';

export const ARANCEL = Object.freeze({
  nombre: 'Arancel de Honorarios por Servicios Profesionales de Abogacía y Notariado',
  version: 'Versión vigente 4 de 4 (16/02/2024)',
  verificado: '30/07/2026',
  url: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=88156'
});

export const HORA_PROFESIONAL = 90750;   // Arancel art. 7 y 63
export const IVA = 0.13;                 // Ley 9635: servicios profesionales
export const SALARIO_BASE_2026 = 462200; // Poder Judicial, salario base 2026

export const FUENTES = Object.freeze({
  arancel: ARANCEL.url,
  arancel109: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?nValor1=1&nValor2=88156&nValor3=115062&nValor5=110&param1=NRA&strTipM=FA',
  registryLaw: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=31339&nValor3=33059&param1=NRTC&strTipM=TC',
  propertyTransferTax: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/normas/nrm_articulo.aspx?nValor1=1&nValor2=13266&nValor3=89981&nValor5=77921&param1=NRA',
  agriculturalStamp: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?nValor1=1&nValor2=2206&nValor3=145406&nValor5=11230&nValor6=2%2F2%2F2023+00%3A00%3A00&param1=NRA&strTipM=FA',
  municipalStamp: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?nValor1=1&nValor2=40197&nValor3=142986&nValor5=176671&param1=NRA',
  vehicleTariffs: 'https://www.registronacional.go.cr/tramites_servicios/tramitesregistros/bienes%20muebles/bienes_muebles_aranceles.htm',
  booksLegalization: 'https://consultas.registronacional.go.cr/tramites_servicios/tramitesregistros/personas%20juridicas/personas_juridicas_legalizacion_libros_mercantiles.htm',
  legalEntitiesTariffs: 'https://www.registronacional.go.cr/tramites_servicios/tramitesregistros/personas%20juridicas/personas_juridicas_aranceles.htm',
  stampDiscount: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=3460&nValor3=3662&param1=NRTC&strTipM=TC',
  lawSimple: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_norma.aspx?nValor1=1&nValor2=103382&nValor3=143677&param1=NRM&strTipM=FN',
  movableRegistryGuide: 'https://www.registronacional.go.cr/centroinforegistral/registros/bienes%20muebles/GuiasCalificacion/Guia%20Calificacion%20Registro%20Bienes%20Muebles.pdf',
  salaryBase2026: 'https://pj.poder-judicial.go.cr/index.php/component/content/article/2333-poder-judicial-fija-en-462-200-00-el-salario-base-para-multas-y-penas-por-la-comision-de-figuras-delictivas-en-el-2026?Itemid=409&catid=8',
  cpc: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=81360',
  codigoCivil: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=15437%2C15437&nValor3=148770&param1=NRTC&strTipM=TC',
  codigoNotarial129: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?nValor1=1&nValor2=42683&nValor3=110022&nValor5=184617&param1=NRA',
  hacienda: 'https://ovitribucr.hacienda.go.cr/home/'
});

const ok = n => Number.isFinite(n);
const colones = n => Math.round(Math.max(0, ok(n) ? n : 0));

// ---------------------------------------------------------------------------
// Escalas progresivas
// ---------------------------------------------------------------------------
// Tarifa general de abogacía (art. 16): 20% hasta ₡16,5 M; 15% hasta ₡82,5 M; 10% sobre el exceso.
export const TRAMOS_GENERAL = Object.freeze([[16500000, .20], [82500000, .15], [Infinity, .10]]);
// Tarifa notarial (art. 74): 2% hasta ₡11 M; 1,5% hasta ₡16,5 M; 1,25% hasta ₡33 M; 1% sobre el exceso.
export const TRAMOS_NOTARIAL = Object.freeze([[11000000, .02], [16500000, .015], [33000000, .0125], [Infinity, .01]]);
// Albacea (Código Civil 557): 5% sobre los primeros ₡10.000 y 2,5% sobre el exceso.
export const TRAMOS_ALBACEA = Object.freeze([[10000, .05], [Infinity, .025]]);

/** Desglose por tramos: [{desde, hasta, tasa, base, monto}] */
export function tramos(escala, monto) {
  const m = Math.max(0, monto || 0); let desde = 0; const out = [];
  for (const [hasta, tasa] of escala) {
    const base = Math.max(0, Math.min(m, hasta) - desde);
    if (base > 0) out.push({ desde, hasta, tasa, base, monto: base * tasa });
    if (m <= hasta) break; desde = hasta;
  }
  return out;
}
const sumaTramos = (escala, monto) => tramos(escala, monto).reduce((s, t) => s + t.monto, 0);
export const escalaGeneral = m => sumaTramos(TRAMOS_GENERAL, m);
export const escalaNotarial = m => sumaTramos(TRAMOS_NOTARIAL, m);
export const escalaAlbacea = m => sumaTramos(TRAMOS_ALBACEA, m);
export const escalaDe = t => ({ legalScale: TRAMOS_GENERAL, notarialScale: TRAMOS_NOTARIAL, executorScale: TRAMOS_ALBACEA }[t?.method] || null);

// ---------------------------------------------------------------------------
// Honorario mínimo del Arancel
// ---------------------------------------------------------------------------
/** Honorario mínimo arancelario (sin redondear) para una actuación. */
export function honorarioMinimo(t, { amount = 0, hours = 0, quantity = 1 } = {}) {
  const f = t.factor ?? 1; let a = 0;
  switch (t.method) {
    case 'fixed': a = t.reference; break;
    case 'legalScale': a = escalaGeneral(amount) * f; break;
    case 'notarialScale': a = escalaNotarial(amount) * f; break;
    case 'executorScale': a = escalaAlbacea(amount) * f; break;
    case 'percent': a = Math.max(0, amount) * f; break;
    case 'hours': a = HORA_PROFESIONAL * Math.max(0, hours || t.defaultHours || 1); break;
  }
  // El monto de referencia del catálogo opera como mínimo absoluto.
  return Math.max(t.reference, a) * Math.max(1, quantity || 1);
}

/**
 * Cálculo completo de una cotización.
 * input: {amount, hours, quantity, complexity (0, .15, .3, .5), discount, expenses, stamps, agreedFee}
 */
export function calcular(t, input) {
  const minimo = colones(honorarioMinimo(t, input));
  const pactado = input.agreedFee > 0;
  const base = pactado ? colones(input.agreedFee) : minimo;
  const conAjuste = pactado ? base : colones(minimo * (1 + Math.max(0, input.complexity || 0)));
  const ajusteComplejidad = Math.max(0, conAjuste - base);
  const honorariosAntesDescuento = base + ajusteComplejidad;
  const descuentos = colones(input.discount);
  const subtotal = Math.max(0, honorariosAntesDescuento - descuentos);
  const iva = Math.round(subtotal * IVA);
  const gastos = colones(input.expenses);
  const timbres = colones(input.stamps);
  return {
    minimo, honorariosBase: base, ajusteComplejidad, honorariosAntesDescuento, descuentos, subtotal, iva, gastos, timbres,
    total: subtotal + iva + gastos + timbres, moneda: 'CRC',
    referenciaNormativa: { name: ARANCEL.nombre, article: t.article, version: ARANCEL.version, verifiedAt: ARANCEL.verificado, url: ARANCEL.url }
  };
}

const ESCALAS = ['legalScale', 'notarialScale', 'executorScale', 'percent'];
const METODOS = ['fixed', ...ESCALAS, 'hours'];
const NO_NEGATIVOS = { discount: 'descuento', expenses: 'gasto', stamps: 'monto de timbres', agreedFee: 'honorario pactado' };
export const formatoColones = n => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n);

/** Valida una cotización. Impide honorarios o descuentos por debajo del mínimo del Arancel. */
export function validar(mode, area, t, input) {
  const e = {};
  if (!area) e.area = 'Seleccione el área jurídica.';
  if (!t) e.service = 'Seleccione el trabajo jurídico.';
  if (!ok(input.quantity) || input.quantity <= 0 || !Number.isInteger(input.quantity)) e.quantity = 'La cantidad debe ser un número entero mayor que cero.';
  if (!ok(input.complexity) || input.complexity < 0) e.complexity = 'Seleccione un nivel de complejidad válido.';
  for (const [k, label] of Object.entries(NO_NEGATIVOS)) if (!ok(input[k]) || input[k] < 0) e[k] = `Ingrese un ${label} válido y no negativo.`;
  if (t) {
    if (t.mode !== mode) e.service = 'El trabajo seleccionado no corresponde al tipo de actuación profesional.';
    if (!METODOS.includes(t.method) || !ok(t.reference) || t.reference < 0) e.service = 'No se encontró una tarifa aplicable para este trabajo jurídico.';
    if (ESCALAS.includes(t.method) && (!ok(input.amount) || input.amount <= 0)) e.amount = 'Ingrese una cuantía o valor base mayor que cero.';
    if (t.method === 'hours' && (!ok(input.hours) || input.hours <= 0)) e.hours = 'El número de horas debe ser mayor que cero.';
    if (Object.keys(e).length === 0) {
      const minimo = colones(honorarioMinimo(t, input)), r = calcular(t, input);
      if (input.agreedFee > 0 && colones(input.agreedFee) < minimo) e.agreedFee = `El honorario pactado no puede ser inferior al mínimo calculado de ${formatoColones(minimo)}.`;
      else if (input.discount > r.honorariosAntesDescuento) e.discount = 'El descuento no puede superar los honorarios antes del descuento.';
      else if (r.subtotal < minimo) e.discount = `El descuento reduciría los honorarios por debajo del mínimo calculado de ${formatoColones(minimo)}.`;
      else if (!ok(r.total) || r.total <= 0) e.total = 'El cálculo no produjo un total válido mayor que cero.';
    }
  }
  return { isValid: Object.keys(e).length === 0, errors: e };
}

export const NIVELES_COMPLEJIDAD = [0, .15, .3, .5];
export function etiquetaComplejidad(mode, v) {
  if (v === 0) return mode === 'notariado' ? 'Ordinaria' : 'Estándar';
  if (v === .15) return 'Media (+15 %)';
  if (v === .3) return 'Alta (+30 %)';
  if (v === .5) return mode === 'notariado' ? 'Acto complejo (+50 %)' : 'Urgente o extraordinaria (+50 %)';
  return `Ajuste ${(v * 100).toLocaleString('es-CR')} %`;
}

/** Etiqueta contextual del campo "cantidad" según la actuación. */
export function etiquetaCantidad(t) {
  if (!t) return { label: 'Cantidad', help: 'Seleccione primero un trabajo jurídico.' };
  const s = `${t.name} ${t.area}`.toLocaleLowerCase('es');
  if (s.includes('firma') || s.includes('autenticación')) return { label: 'Número de firmas', help: 'Cantidad de firmas que requieren la actuación profesional.' };
  if (s.includes('certificación')) return { label: 'Número de certificaciones', help: 'Cantidad de certificaciones o asientos por emitir.' };
  if (s.includes('acta')) return { label: 'Número de actas', help: 'Cantidad de actas independientes.' };
  if (s.includes('finca') || s.includes('lote') || s.includes('segregación')) return { label: 'Número de fincas o lotes', help: 'Cantidad de inmuebles comprendidos en la actuación.' };
  if (s.includes('testimonio')) return { label: 'Número de testimonios', help: 'Cantidad de testimonios solicitados.' };
  if (s.includes('documento') || s.includes('poder') || s.includes('contrato')) return { label: 'Número de documentos', help: 'Cantidad de documentos jurídicos independientes.' };
  if (s.includes('persona') || s.includes('heredero') || s.includes('adopción')) return { label: 'Número de personas', help: 'Cantidad de personas respecto de las cuales se presta el servicio.' };
  if (t.method === 'hours') return { label: 'Número de asuntos', help: 'Cantidad de asuntos independientes; las horas se indican por separado.' };
  return { label: 'Número de gestiones', help: 'Cantidad de actuaciones o gestiones independientes.' };
}

// ---------------------------------------------------------------------------
// Forma de pago sugerida por el Arancel (se usa para el calendario de cuotas)
// ---------------------------------------------------------------------------
export function etapasDePago(t) {
  if (!t) return null;
  if (t.id === 'abo-mon') return [['Presentación de la demanda o contestación', .5], ['Sentencia firme', .25], ['Remate o aprobación de la liquidación', .25]];
  if (t.id === 'abo-ejec') return [['Presentación', .5], ['Remate en firme o arreglo', .5]];
  if (['abo-pension', 'abo-querella'].includes(t.id)) return [['Presentación', .5], [t.id === 'abo-querella' ? 'Juicio' : 'Sentencia', .5]];
  if (t.method === 'legalScale' && /^16/.test(t.article)) return [['Presentación de la demanda o contestación', 1 / 3], ['Fin de la fase probatoria', 1 / 3], ['Sentencia', 1 / 3]];
  if (/pago completo|pago con presentación/i.test(t.note)) return [['Presentación', 1]];
  return null;
}

// ---------------------------------------------------------------------------
// Timbres, derechos registrales e impuestos (actos notariales)
// ---------------------------------------------------------------------------
const porMil = (monto, tasa, minimo = 0) => monto > 0 ? Math.max(minimo, Math.ceil(monto / 1000) * tasa) : 0;

/** Timbre del Colegio de Abogados según la cuantía (Arancel art. 109). */
export function timbreColegio(monto, inestimable = false) {
  if (inestimable || monto <= 0) return 275;
  if (monto <= 250000) return 0;
  if (monto <= 1000000) return 1100;
  if (monto <= 5000000) return 2200;
  if (monto <= 25000000) return 5500;
  if (monto <= 50000000) return 11000;
  if (monto <= 100000000) return 16500;
  if (monto <= 500000000) return 27500;
  return 55000;
}

const cargo = (id, label, category, amount, status, source, note, discountEligible = false) =>
  ({ id, label, category, amount: colones(amount), status, discountEligible, source, note });
const timbreFiscalDerogado = () => cargo('auto-fiscal-repealed', 'Timbre fiscal documental', 'timbre', 0, 'calculado', FUENTES.lawSimple,
  '₡0. La Ley 10586 derogó los artículos 239 a 248 del Código Fiscal. No se suma el antiguo timbre fiscal documental; otros tributos especiales siguen calculándose por separado.');

const PERFIL_POR_TARIFA = {
  'not-auto': 'vehicle-transfer', 'not-auto-gest': 'vehicle-registration', 'not-hip': 'mortgage', 'not-hip-vend': 'mortgage',
  'not-cert': 'notarial-certification', 'not-const-soc': 'corporation-formation', 'not-poder': 'registry-fixed'
};
const TRASPASOS = ['not-cv', 'not-suc-adjud', 'not-suc-protocol', 'not-div-mat', 'not-conv-div-gan', 'not-gan', 'not-div-comun', 'not-fide-tras', 'not-fide-dev'];

/** Determina qué paquete de timbres aplica a un acto notarial. */
export function perfilTimbres(t, perfil) {
  if (perfil && perfil !== 'general') return perfil;
  if (!t) return 'general';
  if (TRASPASOS.includes(t.id)) return 'property-transfer';
  if (PERFIL_POR_TARIFA[t.id]) return PERFIL_POR_TARIFA[t.id];
  return t.venue.toLocaleLowerCase('es').includes('registral') ? 'registry' : 'general';
}

/** Lista de timbres, derechos e impuestos estimados para un acto notarial. */
export function timbresNotariales(t, base, perfil) {
  if (!t || t.mode !== 'notariado') return [];
  const p = perfilTimbres(t, perfil), m = Math.max(0, base || 0);
  const esEscala = ESCALAS.includes(t.method);
  const archivo = m <= 0 ? 0 : m < 100000 ? 10 : 20;
  const colegio = m > 0 ? timbreColegio(m) : esEscala ? 0 : timbreColegio(0, true);
  const st = m > 0 ? 'calculado' : 'pendiente';
  const F = FUENTES;
  switch (p) {
    case 'notarial-certification':
      return [cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', 275, 'calculado', F.arancel109, 'Artículo 109, inciso m): certificación notarial.', true)];
    case 'books-legalization':
      return [
        cargo('auto-books-registry', 'Tasa de legalización del Registro Nacional', 'derecho', 13400, 'calculado', F.booksLegalization),
        cargo('auto-books-college', 'Timbre del Colegio de Abogados', 'timbre', 275, 'calculado', F.booksLegalization, undefined, true),
        cargo('auto-books-accountants', 'Timbre del Colegio de Contadores Privados', 'timbre', 75, 'calculado', F.booksLegalization, undefined, true)];
    case 'corporation-formation':
      return [
        cargo('auto-corporation-registry', 'Derechos de constitución de sociedad mercantil — Registro Nacional', 'derecho', 46220, 'calculado', F.legalEntitiesTariffs, 'Tarifa oficial del Registro de Personas Jurídicas para 2026.', true),
        cargo('auto-corporation-college', 'Timbre del Colegio de Abogados — acto inestimable', 'timbre', 275, 'calculado', F.arancel109, 'Artículo 109, inciso j). Confirme si el instrumento contiene operaciones adicionales.', true),
        cargo('auto-corporation-archive', 'Timbre de Archivo Nacional', 'timbre', 20, 'calculado', F.registryLaw, 'Acto de cuantía inestimable presentado al Registro Nacional.', true),
        timbreFiscalDerogado(),
        cargo('pending-corporation-other', 'Otros timbres o cargos según la estructura del acto', 'timbre', 0, 'pendiente', F.legalEntitiesTariffs, 'La constitución, el capital, los nombramientos y las operaciones adicionales pueden modificar la tasación. Confirme el entero oficial antes de facturar.', true)];
    case 'vehicle-registration':
      return [
        cargo('auto-registry', 'Derechos de inscripción del Registro Nacional', 'derecho', porMil(m, 1, 2000), st, F.movableRegistryGuide, '1 colón por cada mil; mínimo ₡2.000. La base es el mayor valor aplicable.', true),
        cargo('auto-agrarian', 'Timbre Agrario', 'timbre', porMil(m, 3), st, F.movableRegistryGuide, '3 colones por cada mil de la base imponible.'),
        cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', colegio, st, F.arancel109, undefined, true),
        cargo('auto-parks', 'Timbre de Parques Nacionales', 'timbre', 500, 'calculado', F.movableRegistryGuide),
        cargo('auto-archive', 'Timbre de Archivo Nacional', 'timbre', archivo, st, F.movableRegistryGuide),
        cargo('auto-wildlife', 'Timbre de Vida Silvestre', 'timbre', SALARIO_BASE_2026 * .0025, 'calculado', F.salaryBase2026, '0,25 % del salario base 2026 de ₡462.200; se redondea al colón más cercano.'),
        cargo('auto-red-cross', 'Timbre de la Cruz Roja', 'timbre', 500, 'calculado', F.movableRegistryGuide),
        cargo('pending-plates', 'Derecho de placas, si corresponde', 'derecho', 0, 'pendiente', F.movableRegistryGuide, 'Solo aplica cuando el movimiento requiere placas. Ingrese la tarifa oficial vigente indicada por el Registro; si no aplica, confirme ₡0.'),
        timbreFiscalDerogado()];
    case 'vehicle-transfer':
      return [
        cargo('auto-registry', 'Derechos del Registro Nacional', 'derecho', porMil(m, 5, 2000), st, F.vehicleTariffs, '5 colones por cada mil; mínimo ₡2.000.', true),
        cargo('auto-agrarian', 'Timbre Agrario', 'timbre', porMil(m, 3), st, F.vehicleTariffs, '3 colones por cada mil de la base imponible.'),
        cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', colegio, st, F.arancel109, undefined, true),
        cargo('auto-parks', 'Timbre de Parques Nacionales', 'timbre', 500, 'calculado', F.vehicleTariffs, undefined, true),
        cargo('auto-archive', 'Timbre de Archivo Nacional', 'timbre', archivo, st, F.vehicleTariffs, undefined, true),
        cargo('auto-red-cross', 'Timbre de la Cruz Roja', 'timbre', 500, 'calculado', F.vehicleTariffs, undefined, true),
        cargo('auto-transfer-tax', 'Impuesto de traspaso de bien mueble', 'impuesto', m * .025, st, F.vehicleTariffs, '2,5 % de la base imponible.'),
        timbreFiscalDerogado()];
    case 'property-transfer':
      return [
        cargo('auto-registry', 'Derechos del Registro Nacional', 'derecho', porMil(m, 5, 2000), st, F.registryLaw, '5 colones por cada mil o fracción; mínimo ₡2.000.', true),
        cargo('auto-transfer-tax', 'Impuesto de traspaso de bien inmueble', 'impuesto', m * .015, st, F.propertyTransferTax, '1,5 % sobre la base imponible aplicable.'),
        cargo('auto-agrarian', 'Timbre Agrario', 'timbre', porMil(m, 1.5), st, F.agriculturalStamp, 'Tarifa general: 1,50 colones por cada mil o fracción. Vivienda de interés social y otros supuestos pueden tener tarifa especial.'),
        cargo('auto-municipal', 'Timbre Municipal', 'timbre', porMil(m, 2), st, F.municipalStamp, '2 colones por cada mil.', true),
        cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', colegio, st, F.arancel109, undefined, true),
        cargo('auto-archive', 'Timbre de Archivo Nacional', 'timbre', archivo, st, F.registryLaw, undefined, true),
        timbreFiscalDerogado()];
    case 'mortgage':
      return [
        cargo('auto-registry', 'Derechos del Registro Nacional', 'derecho', porMil(m, 1, 2000), st, F.registryLaw, 'Operación sin traspaso: 1 colón por cada mil; mínimo ₡2.000.', true),
        cargo('auto-agrarian', 'Timbre Agrario', 'timbre', porMil(m, 1.5), st, F.agriculturalStamp),
        cargo('auto-municipal', 'Timbre Municipal', 'timbre', porMil(m, 2), st, F.municipalStamp, undefined, true),
        cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', colegio, st, F.arancel109, undefined, true),
        cargo('auto-archive', 'Timbre de Archivo Nacional', 'timbre', archivo, st, F.registryLaw, undefined, true),
        timbreFiscalDerogado()];
    case 'registry-fixed':
      return [
        cargo('auto-registry', 'Derechos mínimos del Registro Nacional', 'derecho', 2000, 'calculado', F.registryLaw, 'Mínimo registral para el acto inestimable. Confirme si el instrumento contiene operaciones adicionales.', true),
        cargo('auto-college', 'Timbre del Colegio de Abogados — acto inestimable', 'timbre', 275, 'calculado', F.arancel109, 'Artículo 109, inciso j).', true),
        cargo('auto-archive', 'Timbre de Archivo Nacional', 'timbre', 20, 'calculado', F.registryLaw, 'Acto de cuantía inestimable.', true),
        timbreFiscalDerogado()];
    case 'registry':
      return [
        cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', colegio, m > 0 || t.method === 'fixed' ? 'calculado' : 'pendiente', F.arancel109, undefined, true),
        cargo('auto-archive', 'Timbre de Archivo Nacional', 'timbre', archivo, st, F.registryLaw, undefined, true),
        cargo('pending-registry', 'Derechos del Registro Nacional', 'derecho', 0, 'pendiente', F.registryLaw, 'Confirmar el acto y la tasación oficial antes de facturar.', true),
        timbreFiscalDerogado()];
    default:
      return [cargo('auto-college', 'Timbre del Colegio de Abogados', 'timbre', colegio, m > 0 || !esEscala ? 'calculado' : 'pendiente', F.arancel109, undefined, true)];
  }
}

/** Suma cargos. Con `descuento6` aplica el 6 % de la Ley de Expendio de Timbres a los rubros elegibles. */
export function totalesCargos(items, descuento6 = false) {
  const r = items.reduce((acc, c) => {
    const n = colones(c.amount);
    if (c.category === 'suplido' || c.category === 'otro') acc.expenses += n;
    else { acc.officialGross += n; if (c.discountEligible) acc.discountBase += n; }
    return acc;
  }, { expenses: 0, officialGross: 0, discountBase: 0 });
  const stampDiscount = descuento6 ? colones(r.discountBase * .06) : 0;
  return { ...r, stampDiscount, official: r.officialGross - stampDiscount };
}

export const CATEGORIAS_CARGO = { timbre: 'Timbre', derecho: 'Derecho registral', impuesto: 'Impuesto', suplido: 'Gasto / suplido', otro: 'Otro cargo' };

export { TARIFAS, tarifa };
