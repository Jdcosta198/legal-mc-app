'use strict';
/* Legal Martínez & Cortés · Despacho privado (v2)
   Funciona con la base de datos actual (professionals, cases, documents, events y bucket legal-pdfs).
   Si se instala db/mejoras-despacho.sql, se activan solos: plazos "realizados", cliente/materia/notas
   en expedientes y cotizaciones compartidas en la nube. */
const $=id=>document.getElementById(id);
const SUPABASE_URL='https://ebjpgzgymopbnpzevwbm.supabase.co',SUPABASE_KEY='sb_publishable_6yvsgINxRDxJi2QKrnU4rQ_ZzoaqNU2',BUCKET='legal-pdfs',MAX_PDF=20971520;
const TZ='America/Costa_Rica';
const incomingType=new URLSearchParams(location.hash.slice(1)).get('type');
let passwordFlow=incomingType==='invite'||incomingType==='recovery';

// Sesión: por defecto se cierra al cerrar el navegador; "Mantener la sesión" la guarda en este dispositivo.
const REMEMBER='lmc-remember';
const remembered=()=>{try{return localStorage.getItem(REMEMBER)==='1'}catch{return false}};
const authStorage={getItem(k){try{return localStorage.getItem(k)??sessionStorage.getItem(k)}catch{return null}},setItem(k,v){try{(remembered()?localStorage:sessionStorage).setItem(k,v);(remembered()?sessionStorage:localStorage).removeItem(k)}catch{}},removeItem(k){try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch{}}};
const client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:authStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

let currentUser=null,profile=null,cases=[],documents=[],events=[],editing=null,loading=false,epoch=0,lastData='';
const features={done:false,caseExtra:false,quotes:false,checked:false};
const urls=new Set();
const dateFmt=new Intl.DateTimeFormat('es-CR',{dateStyle:'medium',timeStyle:'short',timeZone:TZ});
const dayFmt=new Intl.DateTimeFormat('en-CA',{timeZone:TZ});
const date=v=>dateFmt.format(new Date(v));
const dayKey=v=>dayFmt.format(new Date(v));

// ---------- utilidades de interfaz (todo el texto del usuario va por textContent) ----------
function h(tag,attrs={},...kids){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs||{})){if(v==null||v===false)continue;if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k.startsWith('on'))e[k]=v;else e.setAttribute(k,v===true?'':v)}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
let msgTimer=0;
function message(text,error=false){clearTimeout(msgTimer);$('message').textContent=text;$('message').classList.toggle('error',error);if(text)$('message').scrollIntoView({block:'nearest',behavior:'smooth'});if(text&&!error&&!/…$/.test(text))msgTimer=setTimeout(()=>{if($('message').textContent===text)$('message').textContent=''},8000)}
function fail(error){console.warn('Operación no completada',error?.code||error?.status||'',error?.message||'');let explanation='No se pudo completar la operación. Revisa tu conexión y sesión; si persiste, contacta al administrador.';
 if(error?.status===429||['over_email_send_rate_limit','over_request_rate_limit'].includes(error?.code))explanation='El servicio ha limitado temporalmente las solicitudes. Si estás recuperando tu contraseña, revisa los correos recibidos y correo no deseado. Espera antes de volver a solicitar el enlace; si se agotó el cupo de correos, puede tardar hasta una hora. Tu contraseña actual sigue siendo válida.';
 if(error?.code==='email_address_not_authorized')explanation='El proveedor de correo todavía no permite enviar a esta dirección. El administrador debe configurar el servicio de correo para habilitar la recuperación.';
 if(error?.code==='42501'||/row-level security|permission denied/i.test(error?.message||''))explanation='Tu cuenta no tiene permiso para esta acción. Si debería tenerlo, pedile al administrador que lo revise.';
 message(!navigator.onLine?'Sin conexión. No se guardaron cambios. Vuelve a intentarlo cuando tengas Internet.':explanation,true)}
function empty(container,text){container.replaceChildren(h('p',{class:'empty',text}))}
function action(label,fn,cls='secondary'){const b=h('button',{type:'button',class:cls,text:label});b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){fail(e)}finally{b.disabled=false}};return b}
async function busy(form,fn){const buttons=form.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);try{await fn()}catch(e){fail(e)}finally{buttons.forEach(b=>b.disabled=false)}}
const caseById=id=>cases.find(c=>c.id===id);
const caseName=id=>caseById(id)?.title||'Expediente';
const isDone=ev=>features.done&&ev.done===true;

function resetPrivate(){document.dispatchEvent(new Event('legal-signout'));epoch++;currentUser=null;profile=null;cases=[];documents=[];events=[];lastData='';
 for(const id of ['case-list','document-list','event-list','metrics','home-urgent','home-docs'])$(id).replaceChildren();for(const url of urls)URL.revokeObjectURL(url);urls.clear();
 $('workspace').hidden=true;$('logout').hidden=true;$('case-dialog').close();$('detail-dialog').close();$('greeting').textContent=''}
const VIEWS=['home','cases','documents','events','library','calculator'];
function selectView(view,{push=true}={}){if(!VIEWS.includes(view))view='home';for(const name of VIEWS)$('view-'+name).hidden=name!==view;
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('selected',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false')});
 if(push){const u=new URL(location.href);u.searchParams.set('view',view);history.replaceState(null,'',u.pathname+u.search+location.hash)}
 if(view==='calculator')document.dispatchEvent(new Event('legal-calc-show'))}

// ---------- Inicio ----------
function renderHome(){
 const now=Date.now(),today=dayKey(now),week=now+7*86400000;
 const open=events.filter(e=>!isDone(e));const overdue=open.filter(e=>new Date(e.due_at).getTime()<now);
 const todayList=open.filter(e=>dayKey(e.due_at)===today&&new Date(e.due_at).getTime()>=now);
 const weekList=open.filter(e=>{const t=new Date(e.due_at).getTime();return t>=now&&t<=week});
 const active=cases.filter(c=>c.status!=='closed');
 const metric=(n,label,cls='',view)=>{const b=h('button',{class:'metric '+cls,type:'button'},h('strong',{text:String(n)}),h('span',{text:label}));b.onclick=()=>selectView(view);return b};
 $('metrics').replaceChildren(metric(active.length,'Expedientes activos','', 'cases'),metric(overdue.length,overdue.length===1?'Plazo vencido':'Plazos vencidos',overdue.length?'bad':'', 'events'),metric(weekList.length,'Próximos 7 días','', 'events'),metric(documents.length,'PDF en el despacho','', 'documents'));
 $('home-title').textContent=overdue.length?`Atención: ${overdue.length} plazo${overdue.length>1?'s':''} vencido${overdue.length>1?'s':''}`:todayList.length?`Hoy tenés ${todayList.length} actuación${todayList.length>1?'es':''}`:'Hoy en el despacho';
 const next=open.filter(e=>new Date(e.due_at).getTime()>=now).sort((a,b)=>new Date(a.due_at)-new Date(b.due_at))[0];
 $('hero-line').textContent=next?`Próximo plazo: ${next.title} · ${date(next.due_at)}`:'El equilibrio de tu práctica. Todo el despacho en un solo lugar.';
 const urgent=[...overdue,...weekList].sort((a,b)=>new Date(a.due_at)-new Date(b.due_at)).slice(0,6);
 if(!urgent.length)empty($('home-urgent'),'Sin plazos en los próximos 7 días.');else $('home-urgent').replaceChildren(...urgent.map(eventRow));
 const docs=documents.slice(0,5);if(!docs.length)empty($('home-docs'),'Todavía no hay documentos.');else $('home-docs').replaceChildren(...docs.map(d=>{const r=h('div',{class:'mini'},h('span',{class:'mini-ic',text:'PDF'}),h('div',{class:'mini-body'},h('strong',{text:d.filename}),h('small',{text:caseName(d.case_id)+' · '+date(d.created_at)})));r.append(action('Ver',()=>openPdf(d,'view')));return r}))}

// ---------- Expedientes ----------
function caseCard(c){const docs=documents.filter(d=>d.case_id===c.id).length;const evs=events.filter(e=>e.case_id===c.id&&!isDone(e));const next=evs.filter(e=>new Date(e.due_at)>=new Date()).sort((a,b)=>new Date(a.due_at)-new Date(b.due_at))[0];const late=evs.some(e=>new Date(e.due_at)<new Date());
 const meta=[c.reference||'Sin referencia',c.client_name,c.area].filter(Boolean).join(' · ');
 const row=h('article',{class:'record'},h('div',{},h('h3',{text:c.title}),h('p',{text:meta}),h('div',{class:'tags'},h('span',{class:'record-tag '+(c.status==='closed'?'closed':''),text:c.status==='closed'?'Cerrado':'Activo'}),h('span',{class:'record-tag info',text:docs+' PDF'}),late?h('span',{class:'record-tag bad',text:'Plazo vencido'}):null),next?h('p',{class:'next',text:'Próximo: '+next.title+' · '+date(next.due_at)}):null));
 row.append(h('div',{class:'actions'},action('Abrir',()=>openDetail(c)),action('Editar',()=>openCase(c))));return row}
function renderCases(){const q=$('search').value.toLocaleLowerCase('es'),st=$('case-state').value;
 const list=cases.filter(c=>(!st||c.status===st)&&[c.title,c.reference,c.client_name,c.area].join(' ').toLocaleLowerCase('es').includes(q));
 if(!list.length)empty($('case-list'),q?'No hay coincidencias.':st==='closed'?'No hay expedientes cerrados.':'Todavía no hay expedientes. Crea uno ficticio para las pruebas.');else $('case-list').replaceChildren(...list.map(caseCard))}
function fillCaseSelects(){for(const id of ['document-case','event-case','document-filter']){const sel=$(id),selected=sel.value;const opts=[new Option(id==='document-filter'?'Todos los expedientes':'Selecciona un expediente','')];for(const c of cases)if(c.status!=='closed'||id==='document-filter'||c.id===selected)opts.push(new Option(c.title+(c.reference?' · '+c.reference:''),c.id));sel.replaceChildren(...opts);if(cases.some(c=>c.id===selected))sel.value=selected}}
function openDetail(c){const docs=documents.filter(d=>d.case_id===c.id),evs=events.filter(e=>e.case_id===c.id).sort((a,b)=>new Date(a.due_at)-new Date(b.due_at));
 const body=h('div',{},h('span',{class:'kicker',text:c.reference||'Expediente'}),h('h2',{text:c.title}),h('p',{class:'label',text:[c.client_name&&'Cliente: '+c.client_name,c.area&&'Materia: '+c.area,c.status==='closed'?'Cerrado':'Activo'].filter(Boolean).join(' · ')}),c.notes?h('p',{class:'notes',text:c.notes}):null,
  h('h3',{class:'block-title',text:`Documentos (${docs.length})`}),docs.length?h('div',{class:'mini-list'},docs.map(d=>{const r=h('div',{class:'mini'},h('span',{class:'mini-ic',text:'PDF'}),h('div',{class:'mini-body'},h('strong',{text:d.filename}),h('small',{text:(d.byte_size/1048576).toFixed(2)+' MB · '+date(d.created_at)})));r.append(action('Ver',()=>openPdf(d,'view')));return r})):h('p',{class:'empty',text:'Sin documentos.'}),
  h('h3',{class:'block-title',text:`Agenda (${evs.length})`}),evs.length?h('div',{class:'mini-list'},evs.map(eventRow)):h('p',{class:'empty',text:'Sin actuaciones.'}),
  h('div',{class:'dialog-actions'},action('Subir PDF',()=>{$('detail-dialog').close();selectView('documents');$('document-case').value=c.id;$('pdf').focus()}),action('Nuevo plazo',()=>{$('detail-dialog').close();selectView('events');$('event-case').value=c.id;$('event-title').focus()}),action('Editar',()=>{$('detail-dialog').close();openCase(c)},'pill')));
 $('detail-body').replaceChildren(body);$('detail-dialog').showModal()}
$('detail-dialog').addEventListener('click',e=>{if(e.target.closest('[data-close]')||e.target===$('detail-dialog'))$('detail-dialog').close()});

// ---------- Documentos ----------
function renderDocuments(){const sel=$('document-filter').value,q=$('document-search').value.toLocaleLowerCase('es');
 const list=documents.filter(d=>(!sel||d.case_id===sel)&&d.filename.toLocaleLowerCase('es').includes(q));
 if(!list.length){empty($('document-list'),q||sel?'No hay documentos que coincidan.':'No hay documentos cargados.');return}
 $('document-list').replaceChildren(...list.map(d=>{const row=h('article',{class:'record'},h('div',{},h('h3',{text:d.filename}),h('p',{text:caseName(d.case_id)+' · '+(d.byte_size/1048576).toFixed(2)+' MB · '+date(d.created_at)})));row.append(h('div',{class:'actions'},action('Ver',()=>openPdf(d,'view'),'pill small'),action('Descargar',()=>openPdf(d,'download'))));return row}))}
async function openPdf(d,mode){
 const N=window.LegalNative;
 if(N?.isNative){const result=await client.storage.from(BUCKET).download(d.object_path);if(result.error)throw result.error;const blob=new Blob([result.data],{type:'application/pdf'});if(mode==='view')await N.openFile(d.filename,blob,'application/pdf');else await N.shareFile(d.filename,blob,'Guardar o compartir PDF');return}
 // En iPhone instalado y en algunos navegadores, la ventana debe abrirse dentro del toque del usuario.
 const win=mode==='view'?window.open('','_blank'):null;
 try{const result=await client.storage.from(BUCKET).download(d.object_path);if(result.error)throw result.error;if(!currentUser){win?.close();return}
  const blob=new Blob([result.data],{type:'application/pdf'}),url=URL.createObjectURL(blob);urls.add(url);setTimeout(()=>{URL.revokeObjectURL(url);urls.delete(url)},120000);
  if(win){try{win.opener=null}catch{}win.location.href=url;message('PDF abierto en otra pestaña. Si no lo ves, revisá el bloqueador de ventanas.');return}
  const a=h('a',{href:url,download:d.filename,rel:'noopener'});document.body.append(a);a.click();a.remove();message('PDF descargado. El archivo guardado queda bajo tu control en este dispositivo.')}
 catch(e){win?.close();throw e}}
function uploadWithProgress(path,file,onProgress){return new Promise(async(resolve,reject)=>{const {data}=await client.auth.getSession();const token=data.session?.access_token;if(!token)return reject(Object.assign(new Error('Sin sesión'),{status:401}));
 const xhr=new XMLHttpRequest();xhr.open('POST',`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`);
 xhr.setRequestHeader('Authorization','Bearer '+token);xhr.setRequestHeader('apikey',SUPABASE_KEY);xhr.setRequestHeader('Content-Type','application/pdf');xhr.setRequestHeader('x-upsert','false');xhr.setRequestHeader('cache-control','0');
 xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(e.loaded/e.total)};xhr.onload=()=>{if(xhr.status>=200&&xhr.status<300){onProgress(1);resolve()}else{let err;try{err=JSON.parse(xhr.responseText)}catch{err={}}reject(Object.assign(new Error(err.message||err.error||'Error '+xhr.status),{status:xhr.status,code:err.statusCode||err.error}))}};
 xhr.onerror=()=>reject(new Error('Sin conexión'));xhr.send(file)})}
function setProgress(p){const bar=$('upload-progress');if(p==null){bar.hidden=true;return}bar.hidden=false;bar.querySelector('span').style.width=Math.round(p*100)+'%';bar.querySelector('em').textContent=Math.round(p*100)+' %'}
$('pdf').addEventListener('change',()=>{const f=$('pdf').files[0];$('drop-text').textContent=f?`${f.name} · ${(f.size/1048576).toFixed(2)} MB`:'Tocá para elegir un PDF o arrastralo aquí';$('drop').classList.toggle('has-file',!!f)});
for(const ev of ['dragenter','dragover'])$('drop').addEventListener(ev,e=>{e.preventDefault();$('drop').classList.add('over')});
for(const ev of ['dragleave','drop'])$('drop').addEventListener(ev,()=>$('drop').classList.remove('over'));
$('drop').addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer.files.length){$('pdf').files=e.dataTransfer.files;$('pdf').dispatchEvent(new Event('change'))}});

// ---------- Agenda ----------
function eventRow(ev){const t=new Date(ev.due_at).getTime(),late=!isDone(ev)&&t<Date.now();
 const r=h('div',{class:'mini event'+(late?' late':'')+(isDone(ev)?' done':'')},h('span',{class:'mini-ic',text:isDone(ev)?'✓':late?'!':'◷'}),h('div',{class:'mini-body'},h('strong',{text:ev.title}),h('small',{text:caseName(ev.case_id)+' · '+date(ev.due_at)})));
 if(features.done)r.append(action(isDone(ev)?'Reabrir':'Hecho',async()=>{const res=await client.from('events').update({done:!isDone(ev)}).eq('id',ev.id);if(res.error)throw res.error;await refresh(true)}));
 return r}
function renderEvents(){const now=Date.now(),today=dayKey(now),week=now+7*86400000;const sorted=events.slice().sort((a,b)=>new Date(a.due_at)-new Date(b.due_at));
 const open=sorted.filter(e=>!isDone(e));
 const groups=[['Vencidos',open.filter(e=>new Date(e.due_at).getTime()<now),'bad'],['Hoy',open.filter(e=>new Date(e.due_at).getTime()>=now&&dayKey(e.due_at)===today),'today'],['Próximos 7 días',open.filter(e=>dayKey(e.due_at)>today&&new Date(e.due_at).getTime()<=week),''],['Más adelante',open.filter(e=>new Date(e.due_at).getTime()>week),''],['Realizados',sorted.filter(isDone).reverse().slice(0,30),'muted']];
 const out=groups.filter(g=>g[1].length).map(([title,list,cls])=>h('div',{class:'event-group '+cls},h('h3',{class:'block-title',text:`${title} (${list.length})`}),h('div',{class:'mini-list'},list.map(eventRow))));
 if(!out.length)empty($('event-list'),'No hay actuaciones o plazos registrados.');else $('event-list').replaceChildren(...out)}
function exportIcs(){const stamp=x=>new Date(x).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
 const list=events.filter(e=>!isDone(e)&&new Date(e.due_at)>=new Date(Date.now()-86400000));if(!list.length){message('No hay plazos pendientes para exportar.');return}
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Legal Martinez Cortes//Despacho//ES','CALSCALE:GREGORIAN',...list.flatMap(e=>['BEGIN:VEVENT','UID:'+e.id+'@legal-mc','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(e.due_at),'DTEND:'+stamp(new Date(e.due_at).getTime()+3600000),'SUMMARY:'+esc(e.title),'DESCRIPTION:'+esc(caseName(e.case_id)+' · Verificar el plazo en el expediente original.'),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(e.title),'TRIGGER:-P1D','END:VALARM','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(e.title),'TRIGGER:-PT2H','END:VALARM','END:VEVENT']),'END:VCALENDAR'].join('\r\n');
 const icsBlob=new Blob([ics],{type:'text/calendar;charset=utf-8'});if(window.LegalNative?.isNative){window.LegalNative.shareFile('agenda-legal-mc.ics',icsBlob,'Agregar al calendario').then(()=>message(`Se exportaron ${list.length} plazo(s). Elegí la app de calendario para agregarlos.`)).catch(fail);return}
 const url=URL.createObjectURL(icsBlob);const a=h('a',{href:url,download:'agenda-legal-mc.ics'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 message(`Se exportaron ${list.length} plazo(s) con avisos 1 día y 2 horas antes. Abrí el archivo para agregarlos al calendario del teléfono.`)}
$('export-ics').onclick=exportIcs;

// ---------- Datos ----------
async function detectFeatures(){if(features.checked)return;features.checked=true;
 const probe=async(table,cols)=>{const r=await client.from(table).select(cols).limit(1);return !r.error};
 const [d,c,q]=await Promise.all([probe('events','done'),probe('cases','client_name,area,notes'),probe('quotes','id')]);features.done=d;features.caseExtra=c;features.quotes=q;
 $('case-extra').hidden=!c;document.dispatchEvent(new CustomEvent('legal-features',{detail:{...features}}))}
function renderAll(){fillCaseSelects();renderHome();renderCases();renderDocuments();renderEvents()}
async function refresh(force=false){
 if(!currentUser||loading||(document.hidden&&!force))return;
 if(!navigator.onLine){$('sync-status').textContent='Sin conexión · Los cambios no se guardan fuera de línea.';$('net').hidden=false;return}
 $('net').hidden=true;loading=true;const stamp=epoch;
 try{
  const membership=await client.from('professionals').select('display_name').eq('user_id',currentUser.id).maybeSingle();
  if(membership.error)throw membership.error;if(stamp!==epoch)return;
  if(!membership.data){resetPrivate();await client.auth.signOut({scope:'local'});$('login').hidden=false;message('Esta cuenta no tiene acceso autorizado al despacho.',true);return}
  profile=membership.data;await detectFeatures();
  const results=await Promise.all([client.from('cases').select('*').order('created_at',{ascending:false}).limit(1000),client.from('documents').select('*').order('created_at',{ascending:false}).limit(1000),client.from('events').select('*').order('due_at').limit(1000)]);
  if(stamp!==epoch)return;for(const r of results)if(r.error)throw r.error;
  const fp=JSON.stringify(results.map(r=>r.data));
  [cases,documents,events]=results.map(r=>r.data);$('greeting').textContent='Hola, '+profile.display_name;
  // Solo se redibuja si hubo cambios: no se pierde lo que se está escribiendo ni se cierran listas abiertas.
  if(fp!==lastData||force){lastData=fp;renderAll()}
  $('sync-status').textContent='Actualizado a las '+new Date().toLocaleTimeString('es-CR',{timeZone:TZ})+' · Se sincroniza cada 20 segundos mientras esta pantalla está abierta.';
  if(results.some(r=>r.data.length===1000))$('sync-status').textContent+=' Vista limitada a 1.000 registros por sección.';
  window.LegalDespacho.notify();
 }catch(e){$('sync-status').textContent='No se pudo actualizar. La información visible puede estar desactualizada.';fail(e)}finally{loading=false}}
async function showSession(session){
 if(!session){resetPrivate();$('login').hidden=false;$('password-panel').hidden=true;return}
 currentUser=session.user;$('login').hidden=true;$('logout').hidden=false;
 if(passwordFlow){$('password-panel').hidden=false;$('workspace').hidden=true;return}
 $('password-panel').hidden=true;$('workspace').hidden=false;
 const v=new URLSearchParams(location.search).get('view');selectView(VIEWS.includes(v)?v:'home',{push:false});
 await refresh(true)}

// ---------- Acceso ----------
$('remember').checked=remembered()||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
$('toggle-password').onclick=()=>{const visible=$('password').type==='password';$('password').type=visible?'text':'password';$('toggle-password').textContent=visible?'Ocultar':'Mostrar';$('toggle-password').setAttribute('aria-pressed',String(visible))};
$('login-form').onsubmit=event=>{event.preventDefault();busy(event.currentTarget,async()=>{try{localStorage.setItem(REMEMBER,$('remember').checked?'1':'0')}catch{}message('Comprobando acceso…');
 const r=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});$('password').value='';
 if(r.error){message(r.error.status===429?'Demasiados intentos. Esperá unos minutos antes de volver a intentar.':'No se pudo iniciar sesión. Comprueba tu correo y contraseña. Si no la recuerdas, usa Recuperar contraseña.',true);return}
 message('');await showSession(r.data.session)})};
let recoveryReadyAt=0;
$('recover').onclick=()=>busy($('login'),async()=>{if(!$('email').reportValidity())return;if(Date.now()<recoveryReadyAt){message('Espera '+Math.ceil((recoveryReadyAt-Date.now())/1000)+' segundos antes de solicitar otro enlace.',true);return}recoveryReadyAt=Date.now()+60000;message('Solicitando enlace de recuperación…');const r=await client.auth.resetPasswordForEmail($('email').value.trim(),{redirectTo:(window.LegalNative?.isNative?window.LegalNative.webUrl:location.origin)+'/legal-mc-app/app.html'});if(r.error)throw r.error;message('Si la cuenta está habilitada, recibirás un correo para restablecer la contraseña. Revisa también correo no deseado.')});
$('password-form').onsubmit=event=>{event.preventDefault();busy(event.currentTarget,async()=>{const password=$('new-password').value;if(password!==$('confirm-password').value){message('Las contraseñas no coinciden.',true);return}const r=await client.auth.updateUser({password});if(r.error)throw r.error;$('password-form').reset();passwordFlow=false;history.replaceState(null,'',location.pathname);message('Contraseña guardada.');await showSession((await client.auth.getSession()).data.session)})};
$('logout').onclick=async()=>{resetPrivate();const r=await client.auth.signOut({scope:'local'});$('login').hidden=false;$('password-panel').hidden=true;message(r.error?'La sesión local se cerró; no se pudo confirmar el cierre en el servidor.':'Sesión cerrada en este dispositivo.')};

// ---------- Formularios ----------
function openCase(c=null){editing=c;$('case-title').value=c?.title||'';$('case-reference').value=c?.reference||'';$('case-status').value=c?.status||'active';
 if(features.caseExtra){$('case-client').value=c?.client_name||'';$('case-area').value=c?.area||'';$('case-notes').value=c?.notes||''}
 $('case-dialog-title').textContent=c?'Editar expediente':'Nuevo expediente';$('case-dialog').showModal()}
$('new-case').onclick=()=>openCase();$('cancel-case').onclick=()=>$('case-dialog').close();
$('case-form').onsubmit=event=>{event.preventDefault();busy(event.currentTarget,async()=>{const title=$('case-title').value.trim();if(!title){message('Escribe un nombre para el expediente.',true);return}
 const values={title,reference:$('case-reference').value.trim(),status:$('case-status').value};
 if(features.caseExtra)Object.assign(values,{client_name:$('case-client').value.trim()||null,area:$('case-area').value||null,notes:$('case-notes').value.trim()||null});
 let r;if(editing){r=await client.from('cases').update({...values,updated_at:new Date().toISOString()}).eq('id',editing.id).eq('updated_at',editing.updated_at).select('id');if(!r.error&&!r.data.length){message('Otro profesional modificó este expediente. Cierra este formulario, actualiza y vuelve a editar.',true);return}}
 else{r=await client.from('cases').insert({...values,created_by:currentUser.id}).select('id')}
 if(r.error)throw r.error;$('case-dialog').close();message('Expediente guardado en el despacho compartido.');await refresh(true)})};
$('upload-form').onsubmit=event=>{event.preventDefault();busy(event.currentTarget,async()=>{const file=$('pdf').files[0],caseId=$('document-case').value;if(!file||!caseId)return;
 if(file.size===0||file.size>MAX_PDF){message('El PDF debe contener datos y no superar 20 MB.',true);return}
 const magic=new TextDecoder().decode(await file.slice(0,5).arrayBuffer());if(magic!=='%PDF-'){message('El archivo no tiene una cabecera PDF válida.',true);return}
 const id=crypto.randomUUID(),path=caseId+'/'+id+'.pdf';message('Subiendo PDF privado…');setProgress(0);
 try{try{await uploadWithProgress(path,file,setProgress)}catch(e){if(e.status&&e.status!==0)throw e;const up=await client.storage.from(BUCKET).upload(path,file,{contentType:'application/pdf',upsert:false,cacheControl:'0'});if(up.error)throw up.error}
  const metadata=await client.from('documents').insert({id,case_id:caseId,filename:file.name.slice(0,240),object_path:path,byte_size:file.size,uploaded_by:currentUser.id});
  if(metadata.error){await client.storage.from(BUCKET).remove([path]);throw metadata.error}}
 finally{setProgress(null)}
 $('upload-form').reset();$('pdf').dispatchEvent(new Event('change'));message('PDF guardado. El otro profesional lo verá al actualizar o en la siguiente sincronización.');await refresh(true)})};
$('event-form').onsubmit=event=>{event.preventDefault();busy(event.currentTarget,async()=>{const title=$('event-title').value.trim();if(!title){message('Escribe el nombre de la actuación.',true);return}
 const due=new Date($('event-date').value);if(Number.isNaN(due.getTime())){message('Elegí una fecha válida.',true);return}
 const r=await client.from('events').insert({case_id:$('event-case').value,title,due_at:due.toISOString(),created_by:currentUser.id});if(r.error)throw r.error;
 $('event-title').value='';$('event-date').value='';message('Actuación añadida a la agenda compartida.');await refresh(true)})};
$('search').oninput=renderCases;$('case-state').onchange=renderCases;$('document-filter').onchange=renderDocuments;$('document-search').oninput=renderDocuments;
$('refresh').onclick=()=>refresh(true);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>selectView(b.dataset.view));
document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const k=b.dataset.quick;if(k==='case')openCase();if(k==='pdf'){selectView('documents');$('document-case').focus()}if(k==='event'){selectView('events');$('event-case').focus()}if(k==='quote')selectView('calculator')});

// Puente con la calculadora (calc/ui.js): datos de expedientes y guardado de cotizaciones.
window.LegalDespacho={
 get features(){return {...features}},get cases(){return cases},get user(){return currentUser},get profile(){return profile},
 listeners:new Set(),notify(){for(const f of this.listeners)try{f()}catch{}},
 async saveQuote(row){const r=await client.from('quotes').insert({...row,created_by:currentUser.id}).select('*').single();if(r.error)throw r.error;return r.data},
 async listQuotes(){const r=await client.from('quotes').select('*').order('created_at',{ascending:false}).limit(200);if(r.error)throw r.error;return r.data},
 message,fail};

client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')passwordFlow=true;if(event==='SIGNED_OUT'){resetPrivate();$('login').hidden=false}if(['SIGNED_IN','PASSWORD_RECOVERY','INITIAL_SESSION'].includes(event))setTimeout(()=>showSession(session).catch(fail),0)});
setInterval(()=>refresh(),20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('focus',()=>refresh());
window.addEventListener('online',()=>{$('net').hidden=true;refresh(true)});window.addEventListener('offline',()=>{$('net').hidden=false;$('sync-status').textContent='Sin conexión · No se guardan cambios fuera de línea.'});
