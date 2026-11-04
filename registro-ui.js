'use strict';
/* Sección "Registro" del despacho: consultas gratuitas de rnpdigital.com con el usuario del profesional.
   - App de Android: abre el Registro dentro de la app y el asistente (registro-bot.js) llena y consulta solo.
   - Web (computadora o iPhone): abre el Registro en otra ventana; el favorito "Legal M&C · Registro" activa el asistente.
   El resultado vuelve como texto y se guarda como PDF en el expediente elegido. La contraseña de rnpdigital
   la escribe la persona en la página del Registro; esta app nunca la pide ni la guarda. */
(()=>{
const R=window.RegistroCatalogo,PDF=window.RegistroPDF;if(!R||!PDF)return;
const $=id=>document.getElementById(id);
const D=()=>window.LegalDespacho;
const C=window.Capacitor,nativo=!!(C&&C.isNativePlatform&&C.isNativePlatform());
const IAB=()=>C&&C.Plugins&&C.Plugins.InAppBrowser;
const ORIGEN_REGISTRO='https://www.rnpdigital.com';
const HIST='lmc-registro-historial',PREF='lmc-registro-pref';
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let seccion='inmuebles',actual=null,codigoBot=null,ventana=null,trabajoActivo=null,consultasRecientes=[];
const el=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(v==null||v===false)continue;if(k==='text')e.textContent=v;else if(k==='class')e.className=v;else if(k.startsWith('on'))e[k]=v;else e.setAttribute(k,v===true?'':v)}for(const k of kids.flat())if(k!=null)e.append(k);return e};
const b64=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fecha=t=>new Date(t).toLocaleString('es-CR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

/* ---------- Código del asistente ---------- */
async function codigo(){if(codigoBot)return codigoBot;const r=await fetch(new URL('registro-bot.js',document.baseURI||location.href),{cache:'no-cache'});if(!r.ok)throw new Error('No se pudo cargar el asistente del Registro.');codigoBot=await r.text();return codigoBot}
const urlBot=()=>new URL('registro-bot.js',location.href).href;
const urlPuente=()=>new URL('registro-puente.html',location.href).href;
/** Favorito para la web. El Registro no deja cargar scripts de otros sitios, así que el favorito pide el código
    a la ventana de la app que lo abrió (o, si no hay, a una ventanita de la app) y lo guarda para la próxima vez. */
function favorito(){const P=JSON.stringify(urlPuente());
 return `javascript:(function(){var K='lmc-registro-codigo',o='${location.origin}';function go(c){try{(0,eval)(c)}catch(x){alert('Legal M&C: '+x.message)}}function ok(e){if(e.data&&e.data.lmc&&e.data.tipo==='codigo'&&typeof e.data.codigo==='string'&&(e.origin===o)){removeEventListener('message',ok);clearTimeout(t);try{localStorage.setItem(K,e.data.codigo)}catch(x){}go(e.data.codigo)}}addEventListener('message',ok);var c=null;try{c=localStorage.getItem(K)}catch(x){}var t=setTimeout(function(){if(c){removeEventListener('message',ok);go(c)}else window.open(${P},'lmcpuente','width=380,height=260')},window.opener?1200:0);if(window.opener)try{opener.postMessage({lmc:1,tipo:'pedir-codigo'},o)}catch(x){}})();`}

/* ---------- Historial (solo en este dispositivo) ---------- */
const historial=()=>store.get(HIST,[]);
function guardarHist(item){const l=historial().filter(x=>x.id!==item.id);l.unshift(item);
 // Se guarda el texto de las 12 consultas más recientes para poder verlas o guardarlas después; de las demás, solo el resumen.
 l.forEach((x,i)=>{if(i>=12)delete x.captura});store.set(HIST,l.slice(0,40));pintarHistorial()}
function actualizarHist(id,cambios){const l=historial();const x=l.find(y=>y.id===id);if(!x)return;Object.assign(x,cambios);store.set(HIST,l);pintarHistorial()}

/* ---------- PDF y guardado en el expediente ---------- */
function armarPdf(captura,t){
 const d=D(),caso=t.casoId&&d?.cases.find(c=>c.id===t.casoId);
 const datos=[['Consulta',R.porId[t.consulta]?.nombre||captura.titulo],['Datos consultados',t.resumen||'—']];
 if(caso)datos.push(['Expediente',caso.title+(caso.reference?' · '+caso.reference:'')]);
 datos.push(['Emitido',captura.emitido||fecha(Date.now())],['Consultó',(d?.profile?.display_name||'Profesional del despacho')+' con su usuario de rnpdigital'],['Fuente','rnpdigital.com · consulta gratuita del Registro Nacional']);
 const bytes=PDF.crear({titulo:t.resumen||captura.titulo,subtitulo:captura.titulo,datos,bloques:captura.bloques,autor:d?.profile?.display_name});
 return new File([bytes],PDF.nombreArchivo(t.resumen||captura.titulo),{type:'application/pdf'})}
async function guardarEnExpediente(captura,t,casoId){
 const d=D();if(!d?.user)throw new Error('Iniciá sesión en el despacho para guardar.');
 if(!casoId)throw new Error('Elegí el expediente.');
 const file=armarPdf(captura,{...t,casoId});const doc=await d.subirPdf(casoId,file);
 const caso=d.cases.find(c=>c.id===casoId);return {doc,nombre:caso?caso.title:'expediente',archivo:file.name}}
async function verPdf(captura,t){const file=armarPdf(captura,t);
 if(nativo&&window.LegalNative?.openFile)return window.LegalNative.openFile(file.name,file,'application/pdf');
 const url=URL.createObjectURL(file);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000)}

/* ---------- Mensajes del asistente ---------- */
async function alMensaje(m,responder){
 if(!m||!m.lmc||!trabajoActivo||(m.trabajo&&m.trabajo!==trabajoActivo.id&&m.tipo!=='pedir-codigo'))return;
 const t=trabajoActivo;
 if(m.tipo==='consulta'){consultasRecientes.push(Date.now());pintarModo()}
 if(m.tipo==='estado'){estado(m.fase==='login'?'Esperando que inicies sesión en el Registro…':m.fase==='consultando'?'Consultando en el Registro…':m.fase==='manual'?'Completá la consulta a mano en el Registro y tocá Guardar.':'')}
 if(m.tipo==='resultado'){const c=m.captura;
  guardarHist({id:t.id,consulta:t.consulta,datos:t.datos,resumen:t.resumen,fecha:Date.now(),casoId:t.casoId||'',estado:c.vacio?'sin-datos':'resultado',captura:c});
  estado(c.vacio?'El Registro no encontró datos con esos números.':'Resultado recibido del Registro.');
  if(t.guardarSolo&&t.casoId&&!c.vacio){try{const r=await guardarEnExpediente(c,t,t.casoId);actualizarHist(t.id,{estado:'guardado',docId:r.doc.id,casoId:t.casoId});responder({lmc:1,tipo:'guardado',ok:true,nombre:r.nombre});estado(`Guardado en «${r.nombre}».`)}
   catch(e){responder({lmc:1,tipo:'guardado',ok:false,error:e.message});estado('No se pudo guardar: '+e.message,true)}}}
 if(m.tipo==='guardar'){const c=m.captura;try{const r=await guardarEnExpediente(c,t,m.casoId);
   guardarHist({id:t.id+(historial().some(x=>x.id===t.id&&x.estado==='guardado')?'-'+Date.now():''),consulta:t.consulta,datos:t.datos,resumen:t.resumen,fecha:Date.now(),casoId:m.casoId,estado:'guardado',docId:r.doc.id,captura:c});
   responder({lmc:1,tipo:'guardado',ok:true,nombre:r.nombre});estado(`Guardado en «${r.nombre}».`)}
  catch(e){responder({lmc:1,tipo:'guardado',ok:false,error:e.message||'error'});estado('No se pudo guardar: '+(e.message||e),true)}}}

/* ---------- Abrir el Registro ---------- */
async function abrirNativo(t){
 const iab=IAB(),code=await codigo();let url=R.BASE+R.INDICE,abierto=true;
 await iab.removeAllListeners?.();
 const esRegistro=u=>{try{return /(^|\.)rnpdigital\.com$/i.test(new URL(u).hostname)}catch{return false}};
 const inyectar=()=>{if(abierto&&esRegistro(url))iab.executeScript({code:code+'\n;window.__lmcStart('+JSON.stringify(t)+');'}).catch(()=>{})};
 iab.addListener('urlChangeEvent',e=>{url=e.url||url});
 iab.addListener('browserPageLoaded',()=>setTimeout(inyectar,150));
 iab.addListener('messageFromWebview',e=>alMensaje(e.detail||e,msg=>iab.postMessage({detail:msg}).catch(()=>{})));
 iab.addListener('closeEvent',()=>{abierto=false;estado('');pintarHistorial();setTimeout(()=>iab.removeAllListeners?.(),300)});
 await iab.openWebView({url,title:'Registro Nacional',toolbarType:'navigation',showReloadButton:true,preventDeeplink:true,isPresentAfterPageLoad:false,closeModal:false,textZoom:100});
 estado('Registro abierto. Si te lo pide, iniciá sesión con tu usuario de rnpdigital.')}
let oyenteWeb=false;
function abrirWeb(t){
 const c=R.porId[t.consulta],destino=R.BASE+(c&&c.url?'consultaDocumentos/'+c.url:R.INDICE),job=b64(JSON.stringify(t));
 ventana=window.open(destino+'#lmcjob='+job,'lmcjob:'+job);
 if(!ventana){estado('El navegador bloqueó la ventana del Registro. Permití ventanas emergentes para este sitio.',true);return}
 if(!oyenteWeb){oyenteWeb=true;window.addEventListener('message',async e=>{if(e.origin!==ORIGEN_REGISTRO||!ventana||e.source!==ventana)return;const m=e.data;
  if(m&&m.lmc&&m.tipo==='pedir-codigo'){try{ventana.postMessage({lmc:1,tipo:'codigo',codigo:await codigo()},ORIGEN_REGISTRO)}catch{}return}
  alMensaje(m,msg=>{try{ventana.postMessage(msg,ORIGEN_REGISTRO)}catch{}})})}
 estado('Registro abierto en otra ventana. Iniciá sesión si te lo pide y tocá el favorito «Legal M&C · Registro». Cuando cargue el resultado, tocalo otra vez para guardarlo.')}

/* ---------- Pantalla ---------- */
function estado(txt,error=false){const s=$('reg-estado');if(!s)return;s.textContent=txt||'';s.hidden=!txt;s.classList.toggle('error',!!error)}
function pintarModo(){const box=$('reg-modo');if(!box)return;const ahora=Date.now();consultasRecientes=consultasRecientes.filter(x=>ahora-x<R.LIMITE.ventanaMs);
 box.replaceChildren(el('div',{class:'reg-modo-ic','aria-hidden':'true',text:nativo?'▦':'↗'}),el('div',{},
  el('strong',{text:nativo?'El Registro se abre dentro de la app':'El Registro se abre en otra ventana'}),
  el('small',{text:nativo?'Entrás con tu usuario de rnpdigital la primera vez; el asistente llena la consulta, la ejecuta y guarda el resultado en el expediente.':'Iniciá sesión en rnpdigital y usá el favorito «Legal M&C · Registro» para que el asistente llene la consulta y te devuelva el resultado.'}),
  el('small',{class:'reg-limite',text:`Para proteger tu cuenta: máximo ${R.LIMITE.maximo} consultas cada 2 minutos (el Registro bloquea la cuenta al pasar de ${R.LIMITE.delRegistro}).`})));
 $('reg-web').hidden=nativo}
function pintarTabs(){const box=$('reg-tabs');box.replaceChildren(...R.SECCIONES.map(([id,nombre])=>{const b=el('button',{type:'button',role:'tab','aria-selected':String(id===seccion),class:id===seccion?'selected':'',text:nombre});b.onclick=()=>{seccion=id;todas=true;pintarTabs();pintarLista()};return b}))}
let todas=true;
function pintarLista(){const box=$('reg-lista');let lista=R.CONSULTAS.filter(c=>c.sec===seccion).sort((a,b)=>(b.principal||0)-(a.principal||0));
 // Con una consulta elegida, la lista se recoge para que el formulario quede a la vista.
 const recogida=actual&&!todas&&actual.sec===seccion;if(recogida)lista=[actual];box.classList.toggle('recogida',!!recogida);
 const mas=recogida?[Object.assign(el('button',{type:'button',class:'secondary reg-mas',text:'Ver todas las consultas de '+(R.SECCIONES.find(x=>x[0]===seccion)||[])[1].toLowerCase()}),{onclick:()=>{todas=true;pintarLista()}})]:[];
 box.replaceChildren(...mas.length?[]:[],...lista.map(c=>{const b=el('button',{type:'button',class:'reg-item'+(actual&&actual.id===c.id?' selected':''),'aria-pressed':String(!!(actual&&actual.id===c.id))},el('strong',{text:c.nombre}),el('small',{text:c.desc||''}));b.onclick=()=>elegir(c.id);return b}),...mas)}
function campoUI(f,valores){const id='reg-f-'+f.k,wrap=el('div',{class:'reg-campo','data-k':f.k});
 wrap.append(el('label',{for:id,text:f.l+(f.req?'':' (opcional)')}));
 let input;if(f.t==='sel'){input=el('select',{id,name:f.k},...f.ops.map(([v,t])=>el('option',{value:v,text:t})));input.value=valores[f.k]??f.ops[0][0]}
 else{input=el('input',{id,name:f.k,type:'text',autocomplete:'off',inputmode:f.dig?'numeric':null,maxlength:f.max||null,placeholder:f.ph||'',spellcheck:'false'});input.value=valores[f.k]||''}
 input.onchange=input.oninput=()=>{wrap.classList.remove('invalid');if(f.t==='sel')pintarVisibles()};
 wrap.append(input);if(f.ayuda)wrap.append(el('small',{class:'label',text:f.ayuda}));return wrap}
function valoresForm(){const v={};document.querySelectorAll('#reg-campos [data-k]').forEach(w=>{const i=w.querySelector('input,select');v[w.dataset.k]=i.value});return v}
function pintarVisibles(){if(!actual)return;const v=valoresForm();for(const f of actual.campos){const w=document.querySelector(`#reg-campos [data-k="${f.k}"]`);if(w)w.hidden=!R.visible(f,v)}}
function elegir(id,valores={}){actual=R.porId[id];if(!actual)return;todas=false;if(actual.sec!==seccion){seccion=actual.sec;pintarTabs()}pintarLista();
 $('reg-form').hidden=false;$('reg-titulo').textContent=actual.nombre;$('reg-desc').textContent=actual.desc||'';
 $('reg-campos').replaceChildren(...actual.campos.map(f=>campoUI(f,valores)));pintarVisibles();llenarCasos();
 const pref=store.get(PREF,{});$('reg-auto').checked=pref.auto!==false;
 const primero=$('reg-campos').querySelector('input:not([hidden]),select');setTimeout(()=>{$('reg-form').scrollIntoView({behavior:'smooth',block:'start'});primero&&primero.focus({preventScroll:true})},50)}
function llenarCasos(){const s=$('reg-caso');if(!s)return;const prev=s.value;const casos=(D()?.cases||[]).filter(c=>c.status!=='closed');
 s.replaceChildren(el('option',{value:'',text:'Sin expediente (solo ver el resultado)'}),...casos.map(c=>el('option',{value:c.id,text:c.title+(c.reference?' · '+c.reference:'')})));
 if(prev&&casos.some(c=>c.id===prev))s.value=prev}
async function consultar(ev){ev.preventDefault();if(!actual)return;
 document.querySelectorAll('#reg-campos .invalid').forEach(w=>w.classList.remove('invalid'));
 let p;try{p=R.preparar(actual.id,valoresForm())}catch(e){const w=e.campo&&document.querySelector(`#reg-campos [data-k="${e.campo}"]`);if(w){w.classList.add('invalid');w.querySelector('input,select').focus()}estado(e.message,true);return}
 const ahora=Date.now();consultasRecientes=consultasRecientes.filter(x=>ahora-x<R.LIMITE.ventanaMs);
 const casoId=$('reg-caso').value,d=D();store.set(PREF,{auto:$('reg-auto').checked});
 const t={id:'r'+ahora.toString(36)+Math.random().toString(36).slice(2,6),consulta:actual.id,datos:p.valores,pasos:p.pasos,resumen:p.resumen,nombre:actual.nombre,
  casoId,guardarSolo:$('reg-auto').checked,casos:(d?.cases||[]).filter(c=>c.status!=='closed').slice(0,300).map(c=>[c.id,c.title]),origen:location.origin,usuario:d?.profile?.display_name||''};
 trabajoActivo=t;
 try{if(nativo&&IAB())await abrirNativo(t);else abrirWeb(t)}catch(e){estado('No se pudo abrir el Registro: '+(e.message||e),true)}}
function pintarHistorial(){const box=$('reg-historial');if(!box)return;const l=historial();const d=D();
 if(!l.length){box.replaceChildren(el('p',{class:'empty',text:'Todavía no hay consultas en este dispositivo.'}));return}
 box.replaceChildren(...l.slice(0,15).map(h=>{const caso=h.casoId&&d?.cases.find(c=>c.id===h.casoId);
  const est={guardado:'Guardado'+(caso?' en '+caso.title:''),resultado:'Resultado sin guardar','sin-datos':'Sin datos en el Registro'}[h.estado]||'';
  const row=el('div',{class:'mini reg-h'},el('span',{class:'mini-ic',text:h.estado==='guardado'?'✓':'RN'}),el('div',{class:'mini-body'},el('strong',{text:h.resumen}),el('small',{text:fecha(h.fecha)+' · '+est})));
  const acts=el('div',{class:'reg-h-acts'});
  if(h.estado==='guardado'&&h.docId&&d?.documents?.some(x=>x.id===h.docId))acts.append(boton('Ver',()=>d.openDocument(h.docId,'view')));
  else if(h.captura)acts.append(boton('Ver PDF',()=>verPdf(h.captura,h).catch(e=>estado(e.message,true))));
  if(h.captura&&h.estado==='resultado')acts.append(boton('Guardar',()=>guardarDesdeHist(h)));
  acts.append(boton('Repetir',()=>elegir(h.consulta,h.datos||datosDe(h))));
  row.append(acts);return row}))}
const datosDe=h=>{const r=R.reconocer(h.resumen.split(': ').slice(1).join(': '));return r&&r.consulta===h.consulta?r.datos:{}};
const boton=(t,fn)=>{const b=el('button',{type:'button',class:'secondary',text:t});b.onclick=fn;return b};
async function guardarDesdeHist(h){const s=$('reg-caso');const casoId=h.casoId||s&&s.value;
 if(!casoId){estado('Elegí un expediente en el formulario de arriba (o abrí una consulta) y tocá Guardar otra vez.',true);if(!actual)elegir(h.consulta,datosDe(h));return}
 try{estado('Guardando…');const r=await guardarEnExpediente(h.captura,h,casoId);actualizarHist(h.id,{estado:'guardado',docId:r.doc.id,casoId});estado(`Guardado en «${r.nombre}».`)}catch(e){estado('No se pudo guardar: '+(e.message||e),true)}}
function rapido(ev){ev.preventDefault();const r=R.reconocer($('reg-q').value);
 if(!r){$('reg-q-hint').textContent='No reconocí el número. Ejemplos: finca 4-179693-002, placa BKN-216, cédula 3-101-123456 o 4-0201-0838, plano H-959238-1991.';$('reg-q-hint').classList.add('error');return}
 $('reg-q-hint').classList.remove('error');$('reg-q-hint').textContent='Revisá los datos, elegí el expediente y tocá «Consultar en el Registro».';elegir(r.consulta,r.datos)}

function montar(){const sec=$('view-registro');if(!sec||sec.dataset.listo)return;sec.dataset.listo='1';
 pintarModo();pintarTabs();pintarLista();pintarHistorial();
 $('reg-form').onsubmit=consultar;$('reg-rapido').onsubmit=rapido;
 const fav=$('reg-favorito');if(fav){fav.href=favorito();fav.onclick=e=>{e.preventDefault();estado('Arrastrá el botón dorado a tu barra de favoritos (en el teléfono: guardá cualquier página como favorito y cambiá su dirección por este código).')}}
 const copiar=$('reg-copiar');if(copiar)copiar.onclick=async()=>{try{await navigator.clipboard.writeText(favorito());estado('Código del favorito copiado.')}catch{estado('No se pudo copiar. Mantené presionado el botón dorado y copiá el enlace.',true)}};
 D()?.listeners?.add(()=>{llenarCasos();pintarHistorial()});
 document.addEventListener('legal-signout',()=>{trabajoActivo=null;estado('');$('reg-form').hidden=true;actual=null;pintarLista()})}
document.addEventListener('legal-registro-show',()=>{montar();llenarCasos();pintarHistorial()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',montar);else montar();
window.LegalRegistro={elegir,armarPdf,favorito,urlBot};
})();
