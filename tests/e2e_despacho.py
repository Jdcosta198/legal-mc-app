"""Prueba de punta a punta del despacho v2 en Chromium, con Supabase SIMULADO.

Se ejecuta dos veces: con la base de datos actual (sin mejoras) y con db/mejoras-despacho.sql
instalado (plazos "hechos", cliente/materia/notas y cotizaciones en la nube).
Uso: python3 tests/e2e_despacho.py   (requiere Playwright)
"""
import json, uuid, threading, functools, http.server, socketserver, pathlib, re, sys
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'tests' / 'capturas'; SHOTS.mkdir(exist_ok=True)
U = {'licenciado@bufete.test': str(uuid.uuid4()), 'asistente@bufete.test': str(uuid.uuid4())}
NAMES = {U['licenciado@bufete.test']: 'Lic. Wanerges Martínez', U['asistente@bufete.test']: 'Licda. Cortés'}
results = []

def check(name, cond, detail=''):
    results.append((name, bool(cond))); print(('  OK    ' if cond else '  FALLA ') + name + ('' if cond or not detail else f'  ({detail})'))

class Backend:
    def __init__(self, mejoras):
        self.mejoras = mejoras; self.db = {'cases': [], 'documents': [], 'events': [], 'quotes': []}; self.objects = {}
    def __call__(self, route, request):
        u = urlparse(request.url); qs = parse_qs(u.query); m = request.method; p = u.path
        auth = request.headers.get('authorization', ''); uid = auth[11:] if auth.startswith('Bearer jwt-') else None
        def reply(status, body, ctype='application/json'):
            route.fulfill(status=status, content_type=ctype, body=body if isinstance(body, (bytes, str)) else json.dumps(body))
        if p == '/auth/v1/token':
            b = json.loads(request.post_data or '{}')
            if 'refresh_token' in b: i = b['refresh_token'][8:]
            elif b.get('email') in U and b.get('password') == 'clave-segura-2026': i = U[b['email']]
            else: return reply(400, {'error': 'invalid_grant', 'error_description': 'Invalid login credentials', 'code': 'invalid_credentials'})
            email = [k for k, v in U.items() if v == i][0]
            return reply(200, {'access_token': 'jwt-' + i, 'refresh_token': 'refresh-' + i, 'token_type': 'bearer', 'expires_in': 3600, 'expires_at': 4102444800,
                               'user': {'id': i, 'email': email, 'aud': 'authenticated', 'role': 'authenticated', 'app_metadata': {}, 'user_metadata': {}, 'created_at': '2026-10-01T00:00:00Z'}})
        if p.startswith('/auth/v1/'): return reply(200, {})
        if uid not in U.values(): return reply(401, {'message': 'JWT inválido'})
        if p == '/rest/v1/professionals': return reply(200, [{'display_name': NAMES[uid]}])
        if p.startswith('/rest/v1/'):
            t = p.split('/')[-1]
            if t == 'quotes' and not self.mejoras: return reply(404, {'code': '42P01', 'message': 'relation "public.quotes" does not exist'})
            sel = qs.get('select', ['*'])[0]
            if not self.mejoras and (('done' in sel and t == 'events') or ('client_name' in sel and t == 'cases')):
                return reply(400, {'code': '42703', 'message': 'column does not exist'})
            obj = 'vnd.pgrst.object' in request.headers.get('accept', '')
            if m == 'GET':
                return reply(200, self.db[t])
            if m == 'POST':
                body = json.loads(request.post_data); rows = body if isinstance(body, list) else [body]; out = []
                for r in rows:
                    if not self.mejoras and t == 'cases' and any(k in r for k in ('client_name', 'area', 'notes')): return reply(400, {'code': 'PGRST204', 'message': 'column not found'})
                    r = {'id': r.get('id') or str(uuid.uuid4()), 'created_at': '2026-10-26T21:00:00Z', 'updated_at': '2026-10-26T21:00:00Z', **r}
                    if t == 'cases': r.setdefault('status', 'active')
                    if t == 'events' and self.mejoras: r.setdefault('done', False)
                    self.db[t].insert(0, r); out.append(r)
                return reply(201, out[0] if obj else out)
            if m == 'PATCH':
                rid = qs['id'][0][3:]; upd = json.loads(request.post_data); hit = []
                for r in self.db[t]:
                    if r['id'] == rid and ('updated_at' not in qs or qs['updated_at'][0][3:] == r['updated_at']):
                        r.update(upd); r['updated_at'] = '2026-10-26T21:05:00Z'; hit.append(r)
                return reply(200, hit)
        if p.startswith('/storage/v1/object/legal-pdfs/'):
            key = p[len('/storage/v1/object/legal-pdfs/'):]
            if m == 'POST': self.objects[key] = request.post_data_buffer; return reply(200, {'Key': 'legal-pdfs/' + key})
            if m == 'GET': return reply(200, self.objects.get(key, b'%PDF-1.4'), 'application/pdf')
        if p == '/storage/v1/object/legal-pdfs' and m == 'DELETE': return reply(200, [])
        return reply(404, {'message': 'no simulado ' + m + ' ' + p})

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve():
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT))); httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd, f'http://127.0.0.1:{httpd.server_address[1]}'

def page_for(browser, base, backend, mobile=True, ua=None, name='', motion=False):
    ctx = browser.new_context(reduced_motion=None if motion else 'reduce', viewport={'width': 390, 'height': 844} if mobile else {'width': 1440, 'height': 900}, device_scale_factor=2 if mobile else 1,
                              is_mobile=mobile, has_touch=mobile, locale='es-CR', timezone_id='America/Costa_Rica', user_agent=ua)
    pg = ctx.new_page(); pg.errors = []; pg.name = name
    pg.on('pageerror', lambda e: pg.errors.append(str(e)))
    pg.on('console', lambda m: pg.errors.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.route(re.compile(r'https://ebjpgzgymopbnpzevwbm\.supabase\.co/.*'), backend)
    return pg

def login(pg, base, email):
    pg.goto(base + '/app.html'); pg.wait_for_selector('#email')
    pg.fill('#email', email); pg.fill('#password', 'clave-segura-2026'); pg.click('#login-form button[type=submit]')
    pg.wait_for_selector('#workspace:not([hidden])', timeout=10000); pg.wait_for_timeout(400)

def run(browser, base, mejoras):
    tag = 'con mejoras' if mejoras else 'base actual'
    print(f'\n=== Despacho · {tag} ===')
    be = Backend(mejoras)
    a = page_for(browser, base, be, name='iPhone ' + tag)
    d = page_for(browser, base, be, mobile=False, name='PC ' + tag)
    a.goto(base + '/app.html'); a.wait_for_selector('#email')
    a.fill('#email', 'licenciado@bufete.test'); a.fill('#password', 'mala-clave'); a.click('#login-form button[type=submit]'); a.wait_for_timeout(600)
    check('Contraseña incorrecta: mensaje claro', 'No se pudo iniciar sesión' in a.inner_text('#message'))
    login(a, base, 'licenciado@bufete.test')
    check('Inicio de sesión y saludo con el nombre', 'wanerges' in a.inner_text('#greeting').lower())
    check('La vista Inicio abre por defecto', a.is_visible('#view-home'))
    # Expediente
    a.click('[data-quick=case]'); a.fill('#case-title', 'Compraventa finca Quepos'); a.fill('#case-reference', 'BM-2026-001')
    if mejoras: a.fill('#case-client', 'Inversiones del Pacífico S.A.'); a.select_option('#case-area', 'Notarial')
    check('Campos de cliente y materia solo si la base los tiene', a.is_visible('#case-client') == mejoras)
    a.click('#case-form button.pill'); a.wait_for_timeout(500)
    check('Expediente creado', len(be.db['cases']) == 1 and be.db['cases'][0]['title'] == 'Compraventa finca Quepos')
    # PDF
    a.click('#work-dock [data-view=documents]'); a.select_option('#document-case', index=1)
    pdf = b'%PDF-1.4\n' + b'1' * 250000
    a.set_input_files('#pdf', files=[{'name': 'escritura.pdf', 'mimeType': 'application/pdf', 'buffer': pdf}])
    check('El archivo elegido se muestra con su tamaño', 'escritura.pdf' in a.inner_text('#drop-text'))
    a.click('#upload-form button.pill'); a.wait_for_timeout(900)
    check('PDF subido al almacenamiento privado y catalogado', len(be.objects) == 1 and len(be.db['documents']) == 1)
    a.set_input_files('#pdf', files=[{'name': 'falso.pdf', 'mimeType': 'application/pdf', 'buffer': b'hola'}]); a.select_option('#document-case', index=1)
    a.click('#upload-form button.pill'); a.wait_for_timeout(300)
    check('Rechaza archivos que no son PDF', 'cabecera PDF' in a.inner_text('#message') and len(be.objects) == 1)
    # Agenda
    a.click('#work-dock [data-view=events]'); a.select_option('#event-case', index=1); a.fill('#event-title', 'Presentar escritura al Registro'); a.fill('#event-date', '2026-10-20T09:00')
    a.click('#event-form button.pill'); a.wait_for_timeout(500)
    a.select_option('#event-case', index=1); a.fill('#event-title', 'Audiencia preliminar'); a.fill('#event-date', '2026-10-29T10:00'); a.click('#event-form button.pill'); a.wait_for_timeout(500)
    ev = a.inner_text('#event-list')
    check('Agenda separa vencidos y próximos 7 días', 'Vencidos (1)' in ev and 'Próximos 7 días (1)' in ev, ev[:120])
    if mejoras:
        a.click('#event-list .event.late button'); a.wait_for_timeout(500)
        check('Marcar un plazo como hecho (con mejoras)', 'Realizados (1)' in a.inner_text('#event-list'))
    else:
        check('Sin mejoras no aparece el botón "Hecho"', a.locator('#event-list .event button').count() == 0)
    with a.expect_download() as dl: a.click('#export-ics')
    check('Exporta la agenda al calendario (.ics)', dl.value.suggested_filename == 'agenda-legal-mc.ics')
    # Inicio
    a.click('#work-dock [data-view=home]'); a.wait_for_timeout(200)
    home = a.inner_text('#view-home')
    if not mejoras: check('Inicio avisa del plazo vencido', 'plazo vencido' in home.lower(), home[:150])
    check('Inicio muestra el último PDF', 'escritura.pdf' in home)
    a.screenshot(path=str(SHOTS / f'app-inicio-{"mejoras" if mejoras else "base"}.png'), full_page=True)
    # Ver PDF desde el detalle del expediente
    a.click('#work-dock [data-view=cases]'); a.click('#case-list .record .actions button >> nth=0'); a.wait_for_selector('#detail-dialog[open]')
    check('Detalle del expediente con documentos y agenda', 'escritura.pdf' in a.inner_text('#detail-body') and 'Audiencia preliminar' in a.inner_text('#detail-body'))
    with a.expect_popup() as pop: a.click('#detail-body .mini button >> nth=0')
    check('El PDF se abre para verlo, sin descargarlo', pop.value is not None); pop.value.close()
    a.click('#detail-dialog [data-close]')
    # Calculadora
    a.click('#work-dock [data-view=calculator]'); a.wait_for_selector('#cq')
    a.click('[data-c=mode][data-id=notariado]'); a.fill('#cq', 'compraventa inmueble'); a.wait_for_timeout(100)
    a.click('#picker [data-c=pick] >> nth=0'); a.wait_for_selector('#c-amount'); a.fill('#c-amount', '50000000'); a.wait_for_timeout(150)
    total = re.sub(r'\D', '', a.inner_text('.calc-total strong'))
    check('Calculadora: compraventa de ₡50 M = ₡1.953.008 (honorarios + IVA + timbres)', total == '1953008', total)
    a.fill('#c-agreedFee', '1000'); a.wait_for_timeout(100)
    check('Bloquea honorarios por debajo del mínimo del Arancel', 'inferior al mínimo' in a.inner_text('#calc-out'))
    a.fill('#c-agreedFee', ''); a.select_option('#c-caseId', index=1); a.fill('#c-client', 'Inversiones del Pacífico S.A.'); a.fill('#c-notes', 'Incluye estudio registral.')
    a.screenshot(path=str(SHOTS / f'app-calculadora-{"mejoras" if mejoras else "base"}.png'), full_page=True)
    a.click('[data-c=proforma]'); a.wait_for_selector('.pf-dialog[open]')
    check('Proforma con total y cliente', '1953008' in re.sub(r'\D', '', a.inner_text('.proforma')) and 'Inversiones del Pacífico' in a.inner_text('.proforma'))
    a.screenshot(path=str(SHOTS / f'app-proforma-{"mejoras" if mejoras else "base"}.png'))
    a.click('.pf-dialog [data-pf=close]'); a.click('[data-c=save]'); a.wait_for_timeout(500)
    if mejoras: check('Cotización guardada en la nube (tabla quotes)', len(be.db['quotes']) == 1 and be.db['quotes'][0]['tariff_id'] == 'not-cv')
    else: check('Sin mejoras, la cotización queda en el historial del dispositivo', 'Inversiones del Pacífico' in a.inner_text('#calc-root') and not be.db['quotes'])
    # Sincronización con el otro profesional en la PC
    login(d, base, 'asistente@bufete.test')
    check('La PC ve el mismo expediente y PDF', d.locator('#view-home').inner_text().count('escritura.pdf') >= 1)
    d.click('.chips [data-view=cases]'); d.wait_for_timeout(200)
    check('La PC ve el expediente creado en el iPhone', 'Compraventa finca Quepos' in d.inner_text('#case-list'))
    # Escribir mientras llega una sincronización: no se pierde nada
    d.click('.chips [data-view=events]'); d.fill('#event-title', 'Texto a medio escribir'); d.focus('#event-title')
    be.db['cases'].insert(0, {'id': str(uuid.uuid4()), 'title': 'Caso nuevo desde el iPhone', 'reference': '', 'status': 'active', 'created_at': '2026-10-26T21:10:00Z', 'updated_at': '2026-10-26T21:10:00Z'})
    d.evaluate("document.getElementById('refresh').click()"); d.wait_for_timeout(600)
    check('La sincronización no borra lo que se está escribiendo', d.input_value('#event-title') == 'Texto a medio escribir')
    d.click('.chips [data-view=home]'); d.wait_for_timeout(300)
    d.screenshot(path=str(SHOTS / f'app-escritorio-{"mejoras" if mejoras else "base"}.png'))
    for pg in (a, d): check(f'Sin errores de JavaScript ({pg.name})', not pg.errors, '; '.join(pg.errors[:3])); pg.context.close()

def landing(browser, base):
    print('\n=== Portada y descarga ===')
    be = Backend(False)
    IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    FB = IOS.replace('Safari/604.1', '[FBAN/FBIOS;FBAV/480.0;FBBV/1;FBDV/iPhone15,2]')
    AND = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'
    p = page_for(browser, base, be, ua=IOS, name='portada iPhone', motion=True); p.goto(base + '/'); p.wait_for_timeout(1500)
    check('Portada: la imagen tiene movimiento real (WebGL activo)', p.evaluate("!!document.querySelector('.hero.is-living canvas.living-art')"))
    f2 = p.locator('.hero').screenshot(); p.wait_for_timeout(900); f3 = p.locator('.hero').screenshot()
    check('La imagen cambia de un cuadro a otro (animación en curso)', f2 != f3)
    check('iPhone: la tarjeta "Tu equipo" marca iPhone', p.evaluate("document.documentElement.dataset.device") == 'ios')
    p.screenshot(path=str(SHOTS / 'portada-iphone.png')); p.screenshot(path=str(SHOTS / 'portada-iphone-completa.png'), full_page=True)
    p.context.close(); p = page_for(browser, base, be, ua=IOS, name='portada iPhone'); p.goto(base + '/')
    p.click('.hero [data-install]'); p.wait_for_selector('.install-dialog[open]')
    check('iPhone: guía de Safari paso a paso', 'Agregar a pantalla de inicio' in p.inner_text('.install-dialog'))
    check('iPhone: opción de perfil de instalación', p.locator('.install-profile').count() == 1)
    p.wait_for_timeout(1800); p.screenshot(path=str(SHOTS / 'descarga-iphone.png'))
    q = page_for(browser, base, be, ua=FB, name='portada Facebook'); q.goto(base + '/'); q.click('.hero [data-install]'); q.wait_for_selector('.install-dialog[open]')
    check('Desde Facebook/Instagram explica cómo abrir en Safari', 'Abrir en Safari' in q.inner_text('.install-dialog'))
    r = page_for(browser, base, be, ua=AND, name='portada Android'); r.goto(base + '/'); r.click('.hero [data-install]'); r.wait_for_selector('.install-dialog[open]')
    check('Android: guía de instalación con Chrome', 'Instalar aplicación' in r.inner_text('.install-dialog'))
    r.wait_for_timeout(1800); r.screenshot(path=str(SHOTS / 'descarga-android.png'))
    w = page_for(browser, base, be, mobile=False, name='portada PC'); w.goto(base + '/'); w.wait_for_timeout(1200)
    w.screenshot(path=str(SHOTS / 'portada-escritorio.png'))
    w.click('header [data-install]'); w.wait_for_selector('.install-dialog[open]')
    check('PC: guía de instalación y QR para el teléfono', w.locator('.install-qr img').count() == 1)
    m = json.loads((ROOT / 'manifest.webmanifest').read_text())
    check('Manifiesto con íconos normales y adaptables (Android)', any(i.get('purpose') == 'maskable' for i in m['icons']) and any(i['sizes'] == '512x512' for i in m['icons']))
    for pg in (p, q, r, w): check(f'Sin errores de JavaScript ({pg.name})', not pg.errors, '; '.join(pg.errors[:3])); pg.context.close()

def main():
    httpd, base = serve()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        landing(browser, base); run(browser, base, False); run(browser, base, True)
        browser.close()
    httpd.shutdown(); failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} comprobaciones superadas'); sys.exit(1 if failed else 0)

if __name__ == '__main__': main()
