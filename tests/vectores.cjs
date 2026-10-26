// Generador determinista de casos de prueba (mismo código corre en el navegador y en Node)
// para comparar la calculadora original con el motor portado.
function vectores(tarifas, api) {
  let seed = 20261026;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const montos = [0, 1, 9999, 10000, 10001, 99999, 100000, 250000, 250001, 1e6, 5e6, 11e6, 11000001, 16.5e6, 16500001, 25e6, 33e6, 33000001, 5e7, 82.5e6, 82500001, 1e8, 5e8, 5e8 + 1, 2.5e9];
  const comp = [0, .15, .3, .5];
  const perfiles = [undefined, 'general', 'registry', 'property-transfer', 'mortgage', 'vehicle-transfer', 'vehicle-registration', 'notarial-certification', 'registry-fixed', 'corporation-formation', 'books-legalization'];
  const out = [];
  for (const t of tarifas) {
    for (let k = 0; k < 30; k++) {
      const amount = k < montos.length ? montos[k] : Math.round(rnd() * 3e8);
      const input = { amount, hours: Math.round(rnd() * 8), quantity: 1 + Math.floor(rnd() * 3), complexity: comp[k % 4],
        discount: k % 5 === 0 ? Math.round(rnd() * 200000) : 0, expenses: Math.round(rnd() * 50000), stamps: Math.round(rnd() * 9000),
        agreedFee: k % 7 === 0 ? Math.round(rnd() * 2e6) : 0 };
      const calc = api.calcular(t, input);
      const val = api.validar(t.mode, t.area, t, input);
      const perfil = perfiles[k % perfiles.length];
      const tim = api.timbres(t, amount, perfil).map(c => [c.id, c.label, c.category, c.amount, c.status, c.discountEligible, c.note ?? null]);
      const tot = api.totales(api.timbres(t, amount, perfil), k % 2 === 0);
      out.push([t.id, k, [calc.honorariosBase, calc.ajusteComplejidad, calc.honorariosAntesDescuento, calc.descuentos, calc.subtotal, calc.iva, calc.gastos, calc.timbres, calc.total],
        val.isValid, Object.entries(val.errors).sort(), tim, tot, api.cantidad(t).label, api.complejidad(t.mode, input.complexity)]);
    }
  }
  return JSON.stringify(out);
}
if (typeof module !== 'undefined') module.exports = { vectores };
