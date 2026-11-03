"""Prueba del asistente del Registro (registro-bot.js) contra páginas SIMULADAS de rnpdigital.com.

Las páginas reproducen lo que se mapeó del sitio real el 3-nov-2026: índice de "Consultas Gratuitas" con
enlaces JSF, formularios con los mismos nombres de campos, selecciones que recargan campos por AJAX,
el aviso "Procesando", resultados en página nueva (#printerDiv) o en la misma página, y el inicio de sesión.
El asistente se inyecta en cada carga como lo hace la app de Android (con window.mobileApp simulado).
Uso: python3 tests/registro_bot_test.py   (requiere Playwright)
"""
import json, pathlib, sys, time
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
BOT = (ROOT / 'registro-bot.js').read_text()
results = []
def check(name, cond, detail=''):
    results.append(bool(cond)); print(('  OK    ' if cond else '  FALLA ') + name + ('' if cond or not detail else f'  ({detail})'))

SHELL = '''<!doctype html><html><head><meta charset="utf-8"><title>Sistema de Certificaciones e Informes Digitales del Registro Nacional</title>
<script>/* Como el sitio real (Prototype 1.6): JSON.stringify convierte listas en texto */Array.prototype.toJSON=function(){return '['+this.join(', ')+']'};String.prototype.toJSON=function(){return '"'+this+'"'};
function jsfcljs(f,p,t){var a=p.split(',');for(var i=0;i<a.length;i+=2){var x=document.createElement('input');x.type='hidden';x.name=a[i];x.value=a[i+1];f.appendChild(x)}f.submit()}</script></head>
<body><form id="menuSuperiorForm"><a href="#">Inicio</a> {sesion}</form><div id="content"><div id="central">
<div class="avisos"><b>Avisos importantes</b><p>Estimado usuario, recuerde que no deben rechazar su Certificación digital.</p></div>
{body}</div></div></body></html>'''

INDEX = '''<h3>Consultas Gratuitas</h3><form id="j_id263" method="post" action="/shopping/consultaDocumentos/indiceDocumentos.jspx">
<h4>Bienes Inmuebles</h4>
<a href="#" onclick="jsfcljs(document.forms['j_id263'],'go,finca','');return false">Consulta por Número de Finca</a>
<a href="#" onclick="jsfcljs(document.forms['j_id263'],'go,persona','');return false">Consulta de Personas por Identificación</a>
<h4>Bienes Muebles</h4>
<a href="#" onclick="jsfcljs(document.forms['j_id263'],'go,vehiculo','');return false">Consulta de Vehículo</a>
<a href="#" onclick="jsfcljs(document.forms['j_id263'],'go,personaBM','');return false">Consulta de Personas por Identificación</a>
</form>'''

FINCA = '''<span>Consulta Por Número de Finca</span><form id="params" method="post" action="/shopping/consultaDocumentos/RespConsultaNumeroFinca.jspx"><table>
<tr><td>Provincia:</td><td><select name="params:j_id269"><option value="1">1 - San José</option><option value="2">2 - Alajuela</option><option value="3">3 - Cartago</option><option value="4">4 - Heredia</option><option value="5">5 - Guanacaste</option><option value="6">6- Puntarenas</option><option value="7">7 - Limón</option></select></td>
<td>Finca</td><td><input type="text" name="params:finca" id="params:finca"></td>
<td>Duplicado</td><td><select name="params:j_id280"><option value=""></option><option>A</option><option>B</option><option>F</option><option>M</option><option>Z</option></select></td>
<td>Horizontal</td><td><select name="params:j_id309"><option value=""></option><option>F</option><option>M</option></select></td></tr>
<tr><td>Derecho:</td><td><input type="text" name="params:j_id314" maxlength="3"></td></tr></table>
<a href="#" onclick="jsfcljs(document.forms['params'],'params:j_id319,params:j_id319','');return false"><img alt="Consultar" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></a></form>'''

PERSONA = '''<span>Consulta de Personas por Tipo de Identificación - Bienes Inmuebles</span><form id="params" onsubmit="return false"><div id="campos">
<select name="params:j_id270" onchange="recargar(this.value)"><option value="">Elija el Tipo de Búsqueda</option><option value="1">Persona Física por Cédula Identidad</option><option value="7">Persona Física Carne de Seguro Social</option><option value="2">Persona Jurídica</option><option value="12">DIDI</option></select>
<span id="ids">Cédula Jurídica: <input type="text" name="params:cedulaJuridica1" maxlength="1"><input type="text" name="params:cedulaJuridica2" maxlength="3"><input type="text" name="params:cedulaJuridica3" maxlength="7"></span></div>
<a href="#" onclick="buscar();return false"><img alt="Consultar" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></a></form><div id="res"></div>
<div id="proc" style="display:none;position:fixed;inset:0"><div>Su petición esta siendo ejecutada, por favor espere.</div></div>
<script>
function recargar(v){document.getElementById('proc').style.display='block';setTimeout(function(){var s=document.getElementById('ids');
 s.innerHTML = v==='1' ? 'Cédula de Identidad: <input type="text" name="params:cedula1" maxlength="1"><input type="text" name="params:cedula2" maxlength="4"><input type="text" name="params:cedula3" maxlength="4">'
 : v==='2' ? 'Cédula Jurídica: <input type="text" name="params:cedulaJuridica1" maxlength="1"><input type="text" name="params:cedulaJuridica2" maxlength="3"><input type="text" name="params:cedulaJuridica3" maxlength="7">'
 : '<input type="text" name="params:otro" maxlength="20">';
 document.getElementById('proc').style.display='none'},600)}
function buscar(){var q=function(n){var e=document.querySelector('[name="params:'+n+'"]');return e?e.value:''};window.__enviado=[q('cedula1'),q('cedula2'),q('cedula3')].join('-');
 document.getElementById('proc').style.display='block';setTimeout(function(){document.getElementById('proc').style.display='none';
 document.getElementById('res').innerHTML = window.__enviado==='4-0201-0838' ? '<p>JUAN DIEGO CORTES ESPINOZA</p><table><tr><td>PROVINCIA</td><td>NÚMERO</td><td>DERECHO</td></tr><tr><td>4 HEREDIA</td><td><a href="#" onclick="jsfcljs(document.forms[\\'params\\'],\\'ver,1\\',\\'\\');return false">179693</a></td><td>002</td></tr></table>' : '<p>No se encontraron datos</p>'},1500)}
</script>'''

VEHICULO = '''<span>Consulta de Vehículo</span><form id="params" method="post" action="/shopping/consultaDocumentos/RespConsultaVehiculo.jspx">
<select name="params:j_id269" onchange="modo(this.value)"><option value="PLA">Número de Placa</option><option value="CHA">Número de Chasis</option><option value="VIN" selected>Número de VIN</option></select>
<div id="m"><input type="text" name="vinNumber" maxlength="20"></div>
<a href="#" onclick="jsfcljs(document.forms['params'],'params:j_id311,params:j_id311','');return false"><img alt="Consultar" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></a>
<a href="#" onclick="return false"><img alt="Limpiar Datos" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></a></form>
<script>function modo(v){setTimeout(function(){document.getElementById('m').innerHTML = v==='PLA' ?
 '<table><tr><td>Clase:</td><td><select name="class" onchange="clase(this.value)"><option value=" ">- PARTICULAR</option><option value="CL">CL-CARGA LIVIANA</option><option value="MOT">MOT-MOTOCICLETAS</option></select></td></tr><tr><td>Código:</td><td><select name="code"><option value=" ">- PARTICULAR</option></select></td></tr><tr><td>Número de Placa:</td><td><input type="text" name="carNumber" maxlength="6"></td></tr></table>'
 : '<input type="text" name="vinNumber" maxlength="20">'},500)}
function clase(v){setTimeout(function(){document.querySelector('[name=code]').innerHTML='<option value=" ">-'+v+'</option>'},300)}</script>'''

LOGIN = '''<b>INGRESO PARA USUARIOS REGISTRADOS</b><form id="jid2cb7fc" method="post" action="/shopping/login.jspx">
Correo electrónico: <input type="text" name="jid2cb7fc:correo"> Contraseña: <input type="password" name="jid2cb7fc:pass"> <input type="submit" value="Ingresar"></form>'''

def resp_finca(f):
    return f'''<div id="printerDiv"><h5>REPÚBLICA DE COSTA RICA<br>REGISTRO NACIONAL<br>CONSULTA POR NÚMERO DE FINCA<br></h5>
<table><tr><td>PROVINCIA: HEREDIA</td><td>FINCA: {f.get('params:finca',[''])[0]}</td><td>DERECHO: {f.get('params:j_id314',[''])[0]}</td></tr></table>
<p>PROPIETARIO:<br>JUAN DIEGO CORTES ESPINOZA</p><p>Emitido el 03-11-2026 a las 13:40 horas</p>
<a href="#" onclick="return false"><img alt="Imprimir"></a><a href="#" onclick="window.__compro=1;return false"><img alt="Comprar"></a></div>'''

def resp_vehiculo(f):
    return f'''<div id="printerDiv"><h5>REPÚBLICA DE COSTA RICA<br>REGISTRO NACIONAL<br>CONSULTA DE VEHÍCULO POR PLACA</h5>
<p>El Vehículo Placa: {f.get('carNumber',[''])[0]}</p><table><tr><td>Marca:</td><td>SUZUKI</td><td>Estilo:</td><td>SWIFT</td></tr></table>
<p>Clase enviada: [{f.get('class',[''])[0]}]</p><p>Emitido: 03-Nov-2026 a las 13:38 horas</p></div>'''

class Sitio:
    def __init__(self): self.logueado = True; self.posts = []
    def handle(self, route):
        req = route.request; u = urlparse(req.url); path = u.path
        form = parse_qs(req.post_data or '') if req.method == 'POST' else {}
        if req.method == 'POST': self.posts.append((path, form))
        body = None
        if not self.logueado or path.endswith('/login.jspx'):
            if path.endswith('/login.jspx') and form.get('jid2cb7fc:pass'): self.logueado = True; body = '<p>Bienvenido</p>' + INDEX
            elif not self.logueado: body = LOGIN
        if body is None:
            if path.endswith('indiceDocumentos.jspx') and form.get('go'):
                body = {'finca': FINCA, 'persona': PERSONA, 'vehiculo': VEHICULO, 'personaBM': PERSONA}[form['go'][0]]
            elif path.endswith('indiceDocumentos.jspx'): body = INDEX
            elif path.endswith('paramConsultaFinca.jspx'): body = FINCA
            elif path.endswith('paramConsultaVehiculo.jspx'): body = VEHICULO
            elif path.endswith('RespConsultaNumeroFinca.jspx'): body = resp_finca(form)
            elif path.endswith('RespConsultaVehiculo.jspx'): body = resp_vehiculo(form)
            else: body = INDEX
        html = SHELL.replace('{body}', body).replace('{sesion}', '<a href="#">Desconectar</a> <a href="#">Juan Diego Cortés</a>' if self.logueado else '')
        route.fulfill(status=200, content_type='text/html; charset=utf-8', body=html)

STUB = '''window.mobileApp={postMessage:function(m){var l=JSON.parse(localStorage.getItem('__msgs')||'[]');l.push(m.detail||m);localStorage.setItem('__msgs',JSON.stringify(l))},close:function(){localStorage.setItem('__cerrado','1')}};'''

def correr(page, sitio, trabajo, espera_ms=20000, accion=None):
    """Abre el índice como la app y re-inyecta el asistente en cada carga, igual que en Android."""
    def inyectar():
        try: page.evaluate(STUB + BOT + ';window.__lmcStart(' + json.dumps(trabajo) + ')')
        except Exception: pass
    page.on('load', lambda *_: inyectar())
    page.goto('https://www.rnpdigital.com/shopping/consultaDocumentos/indiceDocumentos.jspx')
    t0 = time.time()
    while time.time() - t0 < espera_ms / 1000:
        page.wait_for_timeout(300)
        if accion: accion()
        try:
            msgs = json.loads(page.evaluate("localStorage.getItem('__msgs')||'[]'"))
        except Exception: continue
        if any(m.get('tipo') == 'resultado' for m in msgs): return msgs
    return json.loads(page.evaluate("localStorage.getItem('__msgs')||'[]'"))

def nuevo(browser, sitio):
    ctx = browser.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('https://www.rnpdigital.com/**', sitio.handle)
    return ctx, ctx.new_page()

def resultado(msgs):
    r = [m for m in msgs if m.get('tipo') == 'resultado']; return r[-1]['captura'] if r else None

def main():
  with sync_playwright() as p:
        b = p.chromium.launch()
        # 1) Finca por número: índice → formulario → resultado en página nueva
        s = Sitio(); ctx, pg = nuevo(b, s)
        t = {'id': 't1', 'consulta': 'bi-finca', 'datos': {'provincia': '4', 'numero': '179693', 'derecho': '2'}, 'casos': [['c1', 'Expediente prueba']], 'casoId': 'c1'}
        msgs = correr(pg, s, t)
        cap = resultado(msgs)
        envio = [f for (path, f) in s.posts if path.endswith('RespConsultaNumeroFinca.jspx')]
        check('Finca: llega al resultado', cap is not None, json.dumps(msgs)[:300])
        check('Finca: envía provincia 4, finca 179693 y derecho 002', envio and envio[0].get('params:j_id269') == ['4'] and envio[0].get('params:finca') == ['179693'] and envio[0].get('params:j_id314') == ['002'], str(envio[:1]))
        check('Finca: captura el texto del Registro', cap and 'JUAN DIEGO CORTES ESPINOZA' in json.dumps(cap, ensure_ascii=False) and 'FINCA: 179693' in json.dumps(cap, ensure_ascii=False))
        check('Finca: no incluye avisos ni botones', cap and 'Avisos importantes' not in json.dumps(cap, ensure_ascii=False) and 'Comprar' not in json.dumps(cap, ensure_ascii=False))
        check('Finca: toma la fecha de emisión', cap and cap.get('emitido', '').startswith('Emitido'))
        check('Nunca toca "Comprar"', not pg.evaluate('window.__compro||0'))
        check('Cuenta la consulta para el límite', len(pg.evaluate("JSON.parse(localStorage.getItem('lmc-registro-consultas')||'[]')")) == 1)
        # Guardar: pide a la app guardar en el expediente elegido
        pg.evaluate("window.__lmcBot.guardar()"); pg.wait_for_timeout(300)
        msgs = json.loads(pg.evaluate("localStorage.getItem('__msgs')"))
        g = [m for m in msgs if m.get('tipo') == 'guardar']
        check('Guardar: envía el resultado y el expediente a la app', g and g[-1].get('casoId') == 'c1' and g[-1]['captura']['caracteres'] > 50)
        pg.screenshot(path=str(ROOT / 'tests' / 'capturas' / 'registro-bot-finca.png')) if (ROOT / 'tests' / 'capturas').exists() else None
        ctx.close()

        # 2) Vehículo: el formulario estaba en modo VIN; debe cambiar a placa, esperar la recarga y llenar
        s = Sitio(); ctx, pg = nuevo(b, s)
        msgs = correr(pg, s, {'id': 't2', 'consulta': 'bm-vehiculo', 'datos': {'por': 'PLA', 'placa': 'bkn-216'}})
        envio = [f for (path, f) in s.posts if path.endswith('RespConsultaVehiculo.jspx')]
        check('Vehículo: cambia de VIN a placa y envía BKN216 particular', envio and envio[0].get('carNumber') == ['BKN216'] and envio[0].get('params:j_id269') == ['PLA'], str(envio[:1]))
        check('Vehículo: resultado capturado', resultado(msgs) is not None)
        ctx.close()
        s = Sitio(); ctx, pg = nuevo(b, s)
        msgs = correr(pg, s, {'id': 't2b', 'consulta': 'bm-vehiculo', 'datos': {'por': 'PLA', 'placa': 'MOT-123456'}})
        envio = [f for (path, f) in s.posts if path.endswith('RespConsultaVehiculo.jspx')]
        check('Vehículo: placa con clase (MOT) elige la clase', envio and envio[0].get('class') == ['MOT'] and envio[0].get('carNumber') == ['123456'], str(envio[:1]))
        ctx.close()

        # 3) Persona: selección que recarga campos por AJAX y resultado en la MISMA página tras "Procesando"
        s = Sitio(); ctx, pg = nuevo(b, s)
        msgs = correr(pg, s, {'id': 't3', 'consulta': 'bi-persona-id', 'datos': {'tipoId': '1', 'id': '402010838'}})
        cap = resultado(msgs)
        check('Persona: llena 4-0201-0838 después de la recarga', pg.evaluate('window.__enviado') == '4-0201-0838', str(pg.evaluate('window.__enviado')))
        check('Persona: espera el "Procesando" y captura la lista de fincas', cap and '179693' in json.dumps(cap) and 'HEREDIA' in json.dumps(cap))
        check('Persona: la captura no incluye las opciones del formulario', cap and 'Elija el Tipo' not in json.dumps(cap, ensure_ascii=False))
        ctx.close()

        # 4) Sesión vencida: muestra el aviso, espera que la persona entre y luego sigue sola
        s = Sitio(); s.logueado = False; ctx, pg = nuevo(b, s)
        hecho = {'login': False}
        def entrar():
            if hecho['login']: return
            try:
                if pg.locator('input[type=password]').count():
                    st = pg.evaluate("document.getElementById('lmc-barra-host')&&document.getElementById('lmc-barra-host').shadowRoot.getElementById('st').textContent")
                    hecho['aviso'] = st
                    pg.fill('input[name="jid2cb7fc:correo"]', 'persona@correo.test'); pg.fill('input[name="jid2cb7fc:pass"]', 'clave-de-prueba')
                    hecho['login'] = True; pg.click('input[type=submit]')
            except Exception: pass
        msgs = correr(pg, s, {'id': 't4', 'consulta': 'bi-finca', 'datos': {'provincia': '1', 'numero': '12345', 'derecho': '000'}}, accion=entrar)
        check('Login: pide iniciar sesión sin escribir la contraseña', hecho.get('aviso') and 'Iniciá sesión' in hecho['aviso'], str(hecho.get('aviso')))
        check('Login: después de entrar completa la consulta sola', resultado(msgs) is not None)
        ctx.close()

        # 5) Límite: con 8 consultas recientes no consulta; espera
        s = Sitio(); ctx, pg = nuevo(b, s)
        pg.goto('https://www.rnpdigital.com/shopping/consultaDocumentos/paramConsultaFinca.jspx')
        pg.evaluate("localStorage.setItem('lmc-registro-consultas',JSON.stringify(Array.from({length:8},()=>Date.now()-1000)))")
        pg.on("load", lambda *_: pg.evaluate(STUB + BOT + ";window.__lmcStart({id:'t5',consulta:'bi-finca',datos:{provincia:'4',numero:'179693'}})"))
        pg.evaluate(STUB + BOT + ";window.__lmcStart({id:'t5',consulta:'bi-finca',datos:{provincia:'4',numero:'179693'}})")
        pg.wait_for_timeout(3500)
        st = pg.evaluate("document.getElementById('lmc-barra-host').shadowRoot.getElementById('st').textContent")
        check('Límite: con 8 consultas en 2 min espera en vez de consultar', 'Esperando' in st and not s.posts, st)
        # Un clic manual en Consultar también queda bloqueado
        pg.evaluate("document.querySelector('[name=\"params:finca\"]').value='1'")
        pg.click('img[alt=Consultar]'); pg.wait_for_timeout(400)
        check('Límite: también bloquea el clic a mano', not s.posts)
        ctx.close()

        # 6) Datos inválidos: no consulta
        s = Sitio(); ctx, pg = nuevo(b, s)
        msgs = correr(pg, s, {'id': 't6', 'consulta': 'pj-cedula', 'datos': {'cedula': '3-101'}}, espera_ms=3000)
        st = pg.evaluate("document.getElementById('lmc-barra-host').shadowRoot.getElementById('st').textContent")
        check('Datos inválidos: avisa y no consulta', 'cédula jurídica' in st and not s.posts, st)
        ctx.close()

        # 7) Fuera del Registro no hace nada
        ctx = b.new_context(); pg = ctx.new_page()
        pg.route('https://otro-sitio.test/**', lambda r: r.fulfill(status=200, content_type='text/html', body='<p>hola</p>'))
        pg.goto('https://otro-sitio.test/'); pg.evaluate(STUB + BOT + ";window.__lmcStart&&window.__lmcStart({id:'x',consulta:'bi-finca',datos:{}})")
        check('Fuera de rnpdigital.com no se activa', pg.evaluate("!document.getElementById('lmc-barra-host')&&!window.__lmcBot"))
        ctx.close(); b.close()

  print(f'\n{sum(results)}/{len(results)} pruebas del asistente del Registro superadas')
  sys.exit(0 if all(results) else 1)

if __name__ == '__main__': main()
