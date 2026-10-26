'use strict';
/* Descarga e instalación de la app en Android, iPhone/iPad y computadora.
   · Android / Chrome / Edge: instalación en un toque (crea una app real en el teléfono).
   · iPhone / iPad: guía animada paso a paso en Safari, más perfil de instalación opcional.
   · Navegadores dentro de Facebook, Instagram o WhatsApp: no permiten instalar; se indica cómo abrir en Safari o Chrome.
   · Computadora: instalación en Chrome/Edge y código QR para abrirla en el teléfono. */
(()=>{
const SITE='https://bufete-martinez-legal-pwa.vercel.app';
let pending=null;
const ua=navigator.userAgent;
const standalone=()=>!!(window.Capacitor?.isNativePlatform?.())||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const android=/Android/.test(ua);
const inApp=/FBAN|FBAV|FB_IAB|Instagram|Line\/|WhatsApp|Messenger|TikTok|Snapchat|; wv\)/i.test(ua);
const iosNotSafari=ios&&/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
const device=ios?'ios':android?'android':'desktop';

const dialog=document.createElement('dialog');dialog.className='install-dialog';dialog.setAttribute('aria-labelledby','install-title');
document.body.append(dialog);
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

const phoneShare='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/></svg>';
const plusBox='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
const dots='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';

function stepsFor(kind){
 if(kind==='inapp')return{title:'Abrí la página en tu navegador',lead:'Estás dentro de otra aplicación (Facebook, Instagram o WhatsApp), que no permite instalar apps.',steps:[[dots,'Tocá el menú <b>⋯</b> de esta pantalla.'],[phoneShare,ios?'Elegí <b>Abrir en Safari</b>.':'Elegí <b>Abrir en Chrome</b> o en el navegador.'],[plusBox,'Ya en el navegador, tocá <b>Descargar la app</b> otra vez.']],copy:true};
 if(kind==='ios-other')return{title:'En iPhone se instala desde Safari',lead:'Apple solo permite instalar apps web desde Safari.',steps:[[phoneShare,'Copiá el enlace con el botón de abajo.'],[dots,'Abrí <b>Safari</b> y pegá el enlace.'],[plusBox,'Tocá <b>Descargar la app</b> y seguí los pasos.']],copy:true};
 if(kind==='ios')return{title:'Instalar en iPhone o iPad',lead:'Tres toques en Safari. La app queda con su ícono, a pantalla completa y sin barra del navegador.',steps:[[phoneShare,'Tocá <b>Compartir</b> en la barra de Safari (el cuadro con la flecha hacia arriba).'],[plusBox,'Deslizá y elegí <b>Agregar a pantalla de inicio</b>.'],['<b class="step-ok">✓</b>','Tocá <b>Agregar</b>. Abrí la app desde el ícono <b>M&amp;C</b> de tu pantalla de inicio.']],demo:'ios',profile:true};
 if(kind==='android')return{title:'Instalar en Android',lead:'Chrome crea una app real: aparece en el cajón de aplicaciones y abre a pantalla completa.',steps:[[dots,'Tocá el menú <b>⋮</b> de Chrome.'],[plusBox,'Elegí <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b>.'],['<b class="step-ok">✓</b>','Confirmá con <b>Instalar</b> y abrí <b>Legal M&amp;C</b>.']],demo:'android'};
 return{title:'Instalar en la computadora',lead:'En Chrome o Microsoft Edge queda como programa, con su propia ventana y acceso en el menú Inicio.',steps:[[plusBox,'Tocá el ícono de instalar en la barra de direcciones (a la derecha).'],[dots,'O abrí el menú del navegador y elegí <b>Instalar Legal Martínez &amp; Cortés</b>.'],['<b class="step-ok">✓</b>','Confirmá con <b>Instalar</b>.']],qr:true};
}
function demo(kind){if(kind==='ios')return '<div class="install-demo ios" aria-hidden="true"><div class="demo-screen"><div class="demo-site"><span class="demo-logo">M&amp;C</span></div><div class="demo-sheet"><div class="demo-row">Copiar</div><div class="demo-row hl">'+plusBox+' Agregar a pantalla de inicio</div><div class="demo-row">Marcadores</div></div><div class="demo-bar"><span></span><span class="demo-share">'+phoneShare+'</span><span></span></div><span class="demo-finger"></span></div></div>';
 if(kind==='android')return '<div class="install-demo android" aria-hidden="true"><div class="demo-screen"><div class="demo-top"><span class="demo-url">bufete-martinez…</span><span class="demo-dots">'+dots+'</span></div><div class="demo-site"><span class="demo-logo">M&amp;C</span></div><div class="demo-menu"><div class="demo-row">Nueva pestaña</div><div class="demo-row hl">'+plusBox+' Instalar aplicación</div><div class="demo-row">Compartir…</div></div><span class="demo-finger"></span></div></div>';return ''}

function open(kind){
 const s=stepsFor(kind);
 dialog.innerHTML=`<button class="install-close" type="button" aria-label="Cerrar">×</button><div class="install-head"><img src="/icon-192.png" width="64" height="64" alt=""><div><h2 id="install-title">${s.title}</h2><p>${s.lead}</p></div></div>${s.demo?demo(s.demo):''}<ol class="install-steps">${s.steps.map(([ic,t],i)=>`<li style="--i:${i}"><span class="install-ic">${ic}</span><span>${t}</span></li>`).join('')}</ol>${s.copy?'<button type="button" class="pill install-copy">Copiar enlace</button>':''}${s.qr?`<div class="install-qr"><img src="/qr-app.svg" width="132" height="132" alt="Código QR para abrir la app en el teléfono"><p><b>¿La querés en el teléfono?</b><br>Escaneá este código con la cámara y seguí los pasos.</p></div>`:''}${s.profile?'<details class="install-alt"><summary>¿Preferís un archivo de instalación?</summary><p>Descargá el perfil, abrí <b>Ajustes → Perfil descargado → Instalar</b>. Coloca el ícono M&amp;C a pantalla completa. iOS mostrará "No verificado" porque no es de la App Store; podés eliminarlo cuando quieras en Ajustes → General → VPN y gestión de dispositivos.</p><a class="secondary install-profile" href="/legal-mc.mobileconfig" download>Descargar perfil para iPhone</a></details>':''}<p class="install-note">Necesitás Internet para iniciar sesión y sincronizar. Instalar la app no descarga tus documentos privados.</p><button type="button" class="pill install-done">Entendido</button>`;
 dialog.querySelector('.install-close').onclick=()=>dialog.close();dialog.querySelector('.install-done').onclick=()=>dialog.close();
 const cp=dialog.querySelector('.install-copy');if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(SITE+'/');cp.textContent='Enlace copiado ✓'}catch{prompt('Copiá este enlace:',SITE+'/')}};
 if(!dialog.open)dialog.showModal();
}
async function install(){
 if(standalone())return;
 if(inApp)return open('inapp');
 if(iosNotSafari)return open('ios-other');
 if(pending){const ev=pending;pending=null;try{await ev.prompt();const r=await ev.userChoice;if(r.outcome==='accepted')return}catch{}}
 open(device);
}
const buttons=()=>Array.from(document.querySelectorAll('[data-install]'));
function update(){for(const b of buttons()){if(standalone()){b.hidden=true;continue}b.hidden=false;if(b.dataset.label!=='keep')b.innerHTML=(b.dataset.icon==='no'?'':'<span aria-hidden="true">↓</span> ')+(pending?'Instalar app':'Descargar la app')}
 document.documentElement.classList.toggle('is-standalone',standalone());document.documentElement.dataset.device=device}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();pending=e;update()});
addEventListener('appinstalled',()=>{pending=null;update();if(dialog.open)dialog.close()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-install]');if(b){e.preventDefault();install()}const g=e.target.closest('[data-install-guide]');if(g){e.preventDefault();open(g.dataset.installGuide)}});
update();matchMedia('(display-mode: standalone)').addEventListener('change',update);
window.LegalInstall={open,install,device,inApp};
if('serviceWorker'in navigator&&!window.Capacitor?.isNativePlatform?.())navigator.serviceWorker.register('/sw.js').catch(()=>{});
})();
