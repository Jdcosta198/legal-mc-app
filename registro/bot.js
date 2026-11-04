/* Asistente del Registro: corre DENTRO de rnpdigital.com, con la sesión de la persona.
   - En la app de Android lo inyecta el navegador interno en cada página del Registro.
   - En computadora o iPhone se activa con el favorito "Legal M&C · Registro".
   Hace lo mismo que haría la persona a mano: abre la consulta, llena los campos, toca "Consultar"
   y lee el resultado. Nunca compra certificaciones, nunca cambia la cuenta y nunca escribe la contraseña.
   Protege la cuenta: el Registro la bloquea si se hacen más de 10 consultas en 2 minutos;
   aquí el máximo es 8 y se cuentan también las que la persona hace tocando enlaces. */
(()=>{
'use strict';
if(!/(^|\.)rnpdigital\.com$/i.test(location.hostname))return;
const R=globalThis.RegistroCatalogo,PDF=globalThis.RegistroPDF;
if(window.__lmcBot){if(window.__lmcPendiente){const j=window.__lmcPendiente;window.__lmcPendiente=null;window.__lmcBot.iniciar(j)}return}
const nativo=!!(window.mobileApp&&typeof window.mobileApp.postMessage==='function');
const KEY='lmc-registro-trabajo',HITS='lmc-registro-consultas';
// El Registro usa Prototype 1.6, que agrega toJSON a Array/String/Number/Date y hace que JSON.stringify
// convierta las listas en texto ("[1, 2]"). Mientras el asistente serializa algo, esos toJSON se quitan y luego se restauran.
const PROTOS=[Array.prototype,String.prototype,Number.prototype,Boolean.prototype,Date.prototype];
function sinPrototype(fn){const g=PROTOS.map(p=>[p,Object.getOwnPropertyDescriptor(p,'toJSON')]).filter(x=>x[1]&&x[1].configurable);
 for(const [p] of g)delete p.toJSON;try{return fn()}finally{for(const [p,d] of g)Object.defineProperty(p,'toJSON',d)}}
const json=v=>sinPrototype(()=>JSON.stringify(v));
const leer=t=>{let v=JSON.parse(t||'null');if(typeof v==='string'&&/^[\[{]/.test(v))try{v=JSON.parse(v)}catch{}return v};
const ss={get(k){try{return leer(sessionStorage.getItem(k))}catch{return null}},set(k,v){try{sessionStorage.setItem(k,json(v))}catch{}},del(k){try{sessionStorage.removeItem(k)}catch{}}};
const ls={get(k){try{return leer(localStorage.getItem(k))}catch{return null}},set(k,v){try{localStorage.setItem(k,json(v))}catch{}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const vis=e=>!!(e&&(e.offsetWidth||e.offsetHeight||e.getClientRects().length))&&getComputedStyle(e).visibility!=='hidden';
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
let trabajo=null,ocupado=false;

/* ---------- Comunicación con la app ---------- */
function enviar(tipo,datos={}){const m={lmc:1,tipo,trabajo:trabajo&&trabajo.id,...datos};
 try{sinPrototype(()=>{if(nativo)window.mobileApp.postMessage({detail:m});else if(window.opener&&trabajo&&trabajo.origen)window.opener.postMessage(m,trabajo.origen)})}catch{}}
function alRecibir(m){if(!m||!m.lmc)return;
 if(m.tipo==='guardado'){barra.estado(m.ok?`✓ Guardado en el expediente: ${m.nombre||''}`:'No se pudo guardar: '+(m.error||'error desconocido'),m.ok?'ok':'error');if(m.ok&&trabajo){trabajo.guardado=true;ss.set(KEY,trabajo)}}
 if(m.tipo==='iniciar'&&m.trabajo)iniciar(m.trabajo)}
window.addEventListener('messageFromNative',e=>alRecibir(e.detail||e));
window.addEventListener('message',e=>{if(trabajo&&trabajo.origen&&e.origin===trabajo.origen)alRecibir(e.data)});

/* ---------- Límite de consultas (protege la cuenta) ---------- */
const LIM=R.LIMITE;
function consultasRecientes(){const ahora=Date.now();let l=ls.get(HITS);if(!Array.isArray(l))l=[];return l.map(Number).filter(t=>ahora-t<LIM.ventanaMs)}
function registrarConsulta(){const l=consultasRecientes();l.push(Date.now());ls.set(HITS,l);barra.contador();enviar('consulta',{recientes:l.length})}
function esperaNecesaria(){const l=consultasRecientes();if(l.length<LIM.maximo)return 0;return Math.max(0,LIM.ventanaMs-(Date.now()-l[0]))+1500}
// Cuenta también lo que la persona toque a mano: botones "Consultar/Buscar" y enlaces dentro de los resultados.
document.addEventListener('click',e=>{
 const a=e.target.closest&&e.target.closest('a,input[type=button],input[type=submit],button');if(!a||a.closest('#lmc-barra-host'))return;
 const txt=norm(a.innerText||a.value||(a.querySelector&&a.querySelector('img')||{}).alt||'');
 const oc=String(a.getAttribute('onclick')||'');
 const esConsulta=/^(consultar|buscar)$/.test(txt)||(a.closest('#central')&&/jsfcljs|A4J/.test(oc)&&!/imprimir|regresar|comprar|limpiar|cerrar|nueva consulta|ejemplos|info/.test(txt)&&a.closest('table'));
 if(!esConsulta||a.dataset.lmcAuto==='1')return;
 const w=esperaNecesaria();if(w>0){e.preventDefault();e.stopImmediatePropagation();barra.estado(`Esperá ${Math.ceil(w/1000)} s antes de otra consulta: el Registro bloquea la cuenta si se pasan ${LIM.delRegistro} en 2 minutos.`,'error');return}
 registrarConsulta()},true);

/* ---------- Lectura de la página ---------- */
const enLogin=()=>[...document.querySelectorAll('input[type=password]')].some(vis);
// El aviso "Procesando" del Registro es un panel que se oculta con display:none; innerText solo ve lo visible.
const procesando=()=>/su petici[oó]n esta siendo ejecutada/i.test(document.body.innerText);
function botonConsultar(){
 const cands=[...document.querySelectorAll('#central img[alt],#central input[type=button],#central input[type=submit],#central a, img[alt], input[type=button], input[type=submit]')].filter(vis);
 for(const c of cands){const t=norm(c.alt||c.value||c.innerText);if(t==='consultar'||t==='buscar'||(t==='emitir'&&/\/consultaDocumentos\//.test(location.pathname))){const el=c.tagName==='IMG'?(c.closest('a')||c):c;if(el.closest('#lmc-barra-host'))continue;return el}}return null}
// El formulario de la consulta: el del botón Consultar o, si el botón aparece después de elegir el tipo
// de búsqueda (p. ej. Personas por Nombre en Bienes Muebles), el formulario visible dentro de #central.
const formulario=()=>{const b=botonConsultar();if(b)return b.closest('form');const c=document.getElementById('central');if(!c)return null;
 return [...c.querySelectorAll('form')].find(f=>[...f.querySelectorAll('select,input[type=text]')].some(vis))||null};
function hallar(m,tipo){const f=formulario();if(!f)return null;
 const els=[...f.querySelectorAll(tipo==='s'?'select':'input[type=text],input:not([type]),textarea')].filter(vis);
 if(m.n)return els.find(e=>e.name===m.n)||null;
 if(m.ne)return els.find(e=>e.name.endsWith(m.ne))||null;
 if(m.i!=null)return els[m.i]||null;
 if(m.ml)return els.find(e=>e.maxLength===m.ml)||null;
 return els.find(e=>{const vals=[...e.options].map(o=>o.value.trim()),txt=norm([...e.options].map(o=>o.text).join('|'));
  return (!m.ov||m.ov.every(v=>vals.includes(v)))&&(!m.o||txt.includes(norm(m.o)))&&(!m.nov||!vals.includes(m.nov))&&(!m.max||e.options.length<=m.max+1)})||null}
async function esperarQuietud(maxMs=9000){const raiz=document.getElementById('central')||document.body;let ultimo=Date.now();
 const mo=new MutationObserver(()=>{ultimo=Date.now()});mo.observe(raiz,{subtree:true,childList:true,attributes:true});
 const t0=Date.now();await sleep(250);while(Date.now()-t0<maxMs&&(Date.now()-ultimo<500||procesando()))await sleep(120);mo.disconnect()}
function poner(el,v){if(el.tagName==='SELECT'){const op=[...el.options].find(o=>o.value.trim()===String(v).trim());if(!op)return false;if(el.value===op.value)return 'igual';el.value=op.value}
 else{el.focus();el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}
 el.dispatchEvent(new Event('change',{bubbles:true}));el.blur&&el.blur();return true}

/* ---------- Captura del resultado ---------- */
function capturar(){
 const raiz=[document.getElementById('printerDiv')].find(vis)||document.getElementById('central')||document.body;
 const ocultos=[];const ocultar=el=>{if(!el||el.style.display==='none')return;ocultos.push([el,el.style.display]);el.style.display='none'};
 raiz.querySelectorAll('select,input,button,img,script,style,noscript,.rich-modalpanel,#lmc-barra-host,[id$=":ajaxStatus"]').forEach(ocultar);
 [...raiz.querySelectorAll('div,table,td,p')].filter(e=>e.childElementCount<12&&/^\s*Avisos importantes/i.test(e.innerText)&&e.innerText.length<600).forEach(ocultar);
 let texto='';try{texto=raiz.innerText}finally{for(const [el,d] of ocultos)el.style.display=d}
 const lineas=texto.replace(/ /g,' ').split('\n').map(l=>l.split('\t').map(c=>c.trim()).filter(Boolean).join('  |  ')).map(l=>l.replace(/\s+$/,''));
 const bloques=[];let blancos=0;
 for(const l of lineas){if(!l){if(++blancos===1&&bloques.length)bloques.push({t:'p',x:''});continue}blancos=0;
  if(/^(Este sitio se visualiza|Todos los derechos reservados|rnpdigital@)/i.test(l))continue;
  const h=l.length<70&&!/[:|]/.test(l)&&l===l.toUpperCase()&&/[A-ZÁÉÍÓÚÑ]{4}/.test(l);bloques.push({t:h?'h':(l.includes('  |  ')?'fila':'p'),x:l})}
 while(bloques.length&&!bloques[bloques.length-1].x)bloques.pop();
 const todo=lineas.join('\n');
 const titulo=(bloques.find(b=>b.t==='h'&&!/REP[UÚ]BLICA DE COSTA RICA|REGISTRO NACIONAL$/i.test(b.x))||{}).x||document.title;
 const emitido=(todo.match(/(Emitido|Ejecutado)[^\n]{0,60}/i)||[''])[0];
 const vacio=/no se encontr|no existe|no hay (datos|informaci)|debe digitar|no registra|sin resultados|no posee informaci/i.test(todo)&&todo.length<1500;
 return {titulo,emitido,bloques,url:location.href,vacio,caracteres:todo.length}}
function pdfDe(c){const t=trabajo||{};const ahora=new Date();
 const datos=[['Consulta',t.nombre||c.titulo],['Datos consultados',t.detalle||t.resumen||'—'],['Emitido',c.emitido||ahora.toLocaleString('es-CR')],['Fuente','rnpdigital.com · consulta gratuita del Registro Nacional'],['Página',c.url.replace(/;jsessionid=[^?#]*/,'')]];
 if(t.casoNombre)datos.splice(2,0,['Expediente',t.casoNombre]);if(t.usuario)datos.push(['Consultó',t.usuario]);
 return PDF.crear({titulo:t.resumen||c.titulo,subtitulo:c.titulo,datos,bloques:c.bloques,autor:t.usuario})}

/* ---------- Flujo de trabajo ---------- */
function iniciar(t){if(!t||!t.id)return;const previo=ss.get(KEY);
 if(previo&&previo.id===t.id){trabajo=Object.assign({},t,{fase:previo.fase,intentos:previo.intentos||0,marca:previo.marca,guardado:previo.guardado})}
 else{trabajo=Object.assign({fase:'ir',intentos:0},t)}
 if(!trabajo.pasos&&trabajo.consulta){try{const p=R.preparar(trabajo.consulta,trabajo.datos||{});Object.assign(trabajo,{pasos:p.pasos,resumen:p.resumen})}catch(e){barra.estado(e.message,'error');trabajo.fase='lista'}}
 const c=R.porId[trabajo.consulta];if(c){trabajo.nombre=trabajo.nombre||c.nombre;trabajo.link=c.link;trabajo.nth=c.nth;trabajo.url=c.url}
 ss.set(KEY,trabajo);barra.montar();avanzar()}
const guardarTrabajo=()=>trabajo&&ss.set(KEY,trabajo);
function irAlIndice(){location.href=R.BASE+R.INDICE}
async function avanzar(){
 if(ocupado||!trabajo)return;ocupado=true;
 try{
  if(enLogin()){barra.estado('Iniciá sesión con tu usuario de rnpdigital. La consulta sigue sola después.','info');enviar('estado',{fase:'login'});return}
  const f=trabajo.fase;
  if(f==='ir'){
   trabajo.intentos++;if(trabajo.intentos>4){trabajo.fase='lista';guardarTrabajo();barra.estado('No se pudo abrir la consulta automáticamente. Abrila desde "Consultas Gratuitas" y tocá Guardar cuando tengas el resultado.','error');return}
   if(trabajo.url&&location.pathname.endsWith('/'+trabajo.url)&&botonConsultar()){trabajo.fase='llegando';trabajo.marca={t:Date.now()};guardarTrabajo();ocupado=false;return avanzar()}
   const enlaces=[...document.querySelectorAll('a')].filter(a=>norm(a.innerText)===norm(trabajo.link));
   trabajo.fase='llegando';trabajo.marca={t:Date.now()};guardarTrabajo();barra.estado('Abriendo la consulta en el Registro…');
   if(enlaces.length){const a=enlaces[Math.min(trabajo.nth||0,enlaces.length-1)];a.dataset.lmcAuto='1';a.click()}
   else if(trabajo.url&&trabajo.intentos<=2)location.href=R.BASE+'consultaDocumentos/'+trabajo.url;
   else irAlIndice();
   return}
  if(f==='llegando'){
   // Esperar a que aparezca el formulario de la consulta (la página puede tardar o cargar por partes).
   const primero=trabajo.pasos&&trabajo.pasos[0],buscar1=()=>primero&&hallar(primero.s||primero.t,primero.s?'s':'t');
   for(let k=0;k<40&&!botonConsultar()&&!(primero&&primero.s&&buscar1());k++)await sleep(200);
   const hay=buscar1();
   if((!botonConsultar()&&!(primero&&primero.s&&hay))||(primero&&!hay&&!primero.espera&&!primero.s)){
    if(Date.now()-(trabajo.marca&&trabajo.marca.t||0)>15000){trabajo.fase='ir';guardarTrabajo();irAlIndice()}
    return}
   trabajo.fase='llenar';guardarTrabajo()}
  if(trabajo.fase==='llenar'){
   barra.estado('Llenando la consulta…');
   for(const p of trabajo.pasos){const tipo=p.s?'s':'t',m=p.s||p.t;let el=null;
    for(let k=0;k<45&&!(el=hallar(m,tipo));k++)await sleep(200);
    if(!el){barra.estado('El formulario del Registro no tiene el campo esperado. Completalo a mano y tocá Consultar; después Guardar.','error');trabajo.fase='lista';guardarTrabajo();enviar('estado',{fase:'manual'});return}
    const r=poner(el,p.v);if(r===false){barra.estado(`El Registro no acepta el valor "${p.v}". Revisalo y consultá a mano.`,'error');trabajo.fase='lista';guardarTrabajo();return}
    if(r===true&&tipo==='s'&&(p.espera||el.getAttribute('onchange')))await esperarQuietud()}
   // Verificación final antes de consultar: cada dato quedó escrito donde debía.
   await sleep(150);
   for(const p of trabajo.pasos.filter(x=>x.t)){const el=hallar(p.t,'t');if(!el||el.value!==String(p.v)){if(el)poner(el,p.v);}}
   let w=esperaNecesaria();while(w>0){barra.estado(`Esperando ${Math.ceil(w/1000)} s para no pasar el límite del Registro (${LIM.delRegistro} consultas cada 2 minutos)…`,'info');await sleep(Math.min(w,1000));w=esperaNecesaria()}
   const b=botonConsultar();if(!b){barra.estado('No encontré el botón Consultar.','error');trabajo.fase='lista';guardarTrabajo();return}
   const central=document.getElementById('central');
   trabajo.fase='enviada';trabajo.marca={t:Date.now(),path:location.pathname,largo:central?central.innerText.length:0,firma:central?central.innerText.slice(-400):''};guardarTrabajo();
   registrarConsulta();barra.estado('Consultando en el Registro…');enviar('estado',{fase:'consultando'});
   b.dataset.lmcAuto='1';b.click();
   await sleep(900)}
  if(trabajo.fase==='enviada'){
   const t0=trabajo.marca&&trabajo.marca.t||Date.now();
   if(procesando()){barra.estado(`El Registro está procesando… (${Math.round((Date.now()-t0)/1000)} s)`);if(Date.now()-t0>180000){trabajo.fase='lista';guardarTrabajo();barra.estado('El Registro tardó demasiado. Podés esperar o volver a intentar más tarde.','error')}return}
   const central=document.getElementById('central');const txt=central?central.innerText:'';
   const cambio=location.pathname!==trabajo.marca.path||vis(document.getElementById('printerDiv'))||(txt.length!==trabajo.marca.largo||txt.slice(-400)!==trabajo.marca.firma);
   if(!cambio){if(Date.now()-t0>25000){barra.estado('El Registro no respondió. Revisá la página y tocá Consultar de nuevo si hace falta.','error');trabajo.fase='lista';guardarTrabajo()}return}
   await esperarQuietud(4000);
   const c=capturar();trabajo.fase='lista';trabajo.resultado={titulo:c.titulo,emitido:c.emitido,vacio:c.vacio};guardarTrabajo();
   barra.estado(c.vacio?'El Registro no encontró datos con esos números. Revisalos.':'Resultado listo.',c.vacio?'error':'ok');
   enviar('resultado',{captura:c,resumen:trabajo.resumen});
   // El guardado automático lo hace la app al recibir «resultado» (un solo PDF por consulta).
   return}
 }catch(e){barra.estado('Error del asistente: '+(e.message||e),'error')}
 finally{ocupado=false;barra.contador()}}
async function guardar(){
 const c=capturar();if(!c.caracteres){barra.estado('No hay nada que guardar en esta página.','error');return}
 const casoId=barra.caso();
 if(nativo||(window.opener&&trabajo&&trabajo.origen)){
  if(!casoId){barra.estado('Elegí el expediente donde guardar el resultado.','error');return}
  barra.estado('Guardando en el expediente…');enviar('guardar',{captura:c,casoId,resumen:trabajo&&trabajo.resumen});return}
 // Sin app al lado (favorito en iPhone o computadora): descargar o compartir el PDF.
 const bytes=pdfDe(c),nombre=PDF.nombreArchivo(trabajo&&trabajo.resumen||c.titulo),file=new File([bytes],nombre,{type:'application/pdf'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:nombre});barra.estado('PDF listo. Subilo al expediente desde la app.','ok');return}catch(e){if(e.name==='AbortError')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=nombre;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
 barra.estado('PDF descargado. Subilo al expediente desde la app (Documentos → Subir PDF).','ok')}

/* ---------- Barra del asistente (abajo de la página, aislada del estilo del Registro) ---------- */
const barra=(()=>{let host,root,$=()=>null;
 const css=`:host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
 .b{position:fixed;left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom));z-index:2147483646;background:#0b141c;color:#eef3f7;border:1px solid #e9c88855;border-radius:18px;padding:10px 12px;box-shadow:0 12px 40px #0008;display:grid;gap:8px;max-width:760px;margin:0 auto;font-size:14px;line-height:1.35}
 .top{display:flex;align-items:center;gap:8px}.logo{color:#e9c888;font-weight:700;font-size:12px;letter-spacing:.06em;white-space:nowrap}
 .st{flex:1;min-width:0}.st.ok{color:#8fe3b0}.st.error{color:#ffb4a8}.st.info{color:#9fd3ff}
 .cnt{font-size:11px;color:#9fb0bd;white-space:nowrap}
 .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
 select,input{flex:1;min-width:150px;min-height:40px;border-radius:12px;border:1px solid #ffffff33;background:#14212b;color:#fff;padding:6px 10px;font-size:14px}
 button{min-height:40px;border-radius:99px;border:1px solid #ffffff40;background:#ffffff14;color:#fff;padding:6px 14px;font-weight:650;font-size:13px;cursor:pointer}
 button.gold{background:linear-gradient(180deg,#f1d79d,#d8ae62);color:#1d160a;border-color:transparent}
 button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #88ceff;outline-offset:2px}
 .min .row,.min .cnt{display:none}.x{padding:6px 10px;min-height:32px}`;
 function montar(){if(host)return;host=document.createElement('div');host.id='lmc-barra-host';root=host.attachShadow({mode:'open'});
  let casos=(trabajo&&trabajo.casos)||[];if(typeof casos==='string')try{casos=JSON.parse(casos)}catch{casos=[]}if(!Array.isArray(casos))casos=[];const conApp=nativo||(window.opener&&trabajo&&trabajo.origen);
  root.innerHTML=`<style>${css}</style><div class="b" role="region" aria-label="Asistente de consultas al Registro">
  <div class="top"><span class="logo">⚖ ${String((trabajo&&trabajo.marca)||'LEGAL M&C').replace(/[<&>"]/g,x=>({"<":"&lt;","&":"&amp;",">":"&gt;",'"':"&quot;"})[x])}</span><span class="st" id="st" role="status" aria-live="polite">Asistente del Registro listo.</span><span class="cnt" id="cnt"></span><button class="x" id="min" aria-label="Minimizar">–</button></div>
  ${!trabajo?`<div class="row"><input id="rapido" placeholder="Finca, placa, cédula o plano (ej. 4-179693-002)" aria-label="Número a consultar"><button class="gold" id="ir">Consultar</button></div>`:''}
  <div class="row">${conApp&&casos.length?`<select id="caso" aria-label="Expediente"><option value="">Guardar en el expediente…</option>${casos.map(c=>`<option value="${String(c[0]).replace(/"/g,'')}">${String(c[1]).replace(/[<&]/g,'')}</option>`).join('')}</select>`:''}
  <button class="gold" id="guardar">${conApp?'Guardar en expediente':'Guardar PDF'}</button>${nativo?'<button id="cerrar">Volver a la app</button>':''}</div></div>`;
  document.documentElement.appendChild(host);$=id=>root.getElementById(id);
  if(trabajo&&trabajo.casoId&&$('caso'))$('caso').value=trabajo.casoId;
  $('guardar').onclick=()=>guardar();
  $('min').onclick=()=>{root.querySelector('.b').classList.toggle('min')};
  if($('cerrar'))$('cerrar').onclick=()=>{try{window.mobileApp.close()}catch{}};
  if($('rapido')){const go=()=>{const r=R.reconocer($('rapido').value);if(!r){estado('No reconocí el número. Ejemplos: 4-179693-002, BKN-216, 3-101-123456, H-959238-1991.','error');return}
   host.remove();host=null;iniciar({id:'f'+Date.now(),consulta:r.consulta,datos:r.datos})};$('ir').onclick=go;$('rapido').onkeydown=e=>{if(e.key==='Enter')go()}}
  contador()}
 function estado(t,cls=''){montar();const s=$('st');if(s){s.textContent=t;s.className='st '+cls}}
 function contador(){const c=$('cnt');if(c)c.textContent=`${consultasRecientes().length}/${LIM.maximo} en 2 min`}
 const caso=()=>{const s=$('caso');return s?s.value:(trabajo&&trabajo.casoId)||''};
 return {montar,estado,contador,caso}})();

/* ---------- Arranque ---------- */
function trabajoDeEntrada(){
 // 1) La app nativa llama a __lmcStart. 2) En la web, la app abre el Registro con el trabajo en window.name o en el #.
 let raw=null;if(/^lmcjob:/.test(window.name||''))raw=window.name.slice(7);
 const h=location.hash.match(/[#&]lmcjob=([^&]+)/);if(h)raw=h[1];
 if(!raw)return null;try{const json=decodeURIComponent(escape(atob(raw.replace(/-/g,'+').replace(/_/g,'/'))));return JSON.parse(json)}catch{return null}}
window.__lmcBot={iniciar,avanzar,capturar,guardar};
window.__lmcStart=t=>iniciar(t);
const entrada=trabajoDeEntrada();
const guardado=ss.get(KEY);
if(window.__lmcPendiente){const j=window.__lmcPendiente;window.__lmcPendiente=null;iniciar(j)}
else if(entrada)iniciar(entrada);
else if(guardado&&guardado.fase!=='lista'&&Date.now()-(guardado.marca&&guardado.marca.t||Date.now())<300000){trabajo=guardado;barra.montar();avanzar()}
else if(guardado){trabajo=guardado;barra.montar();barra.estado(guardado.resultado?'Resultado listo. Podés guardarlo o seguir consultando.':'Asistente listo.')}
else barra.montar();
setInterval(()=>{if(trabajo&&trabajo.fase!=='lista')avanzar();else barra.contador()},700);
})();
