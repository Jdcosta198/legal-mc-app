'use strict';
/* Bloqueo con Face ID, Touch ID, huella o PIN del dispositivo (WebAuthn, autenticador del propio teléfono).
   Protege la app abierta o con sesión guardada si alguien toma el teléfono: pide la biometría al abrir
   y después de 5 minutos en segundo plano. La llave nunca sale del dispositivo; no se envía nada al servidor. */
(()=>{
const KEY='lmc-lock',AFTER=5*60*1000;
const $=id=>document.getElementById(id);
const b64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const cfg=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const hasSession=()=>{try{return Object.keys(localStorage).some(k=>/^sb-.*-auth-token$/.test(k))||Object.keys(sessionStorage).some(k=>/^sb-.*-auth-token$/.test(k))}catch{return false}};
const rand=n=>crypto.getRandomValues(new Uint8Array(n));
let supported=false,hiddenAt=0,locked=false;

const overlay=document.createElement('div');overlay.className='lock-screen';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','lock-title');
overlay.innerHTML='<div class="lock-card"><span class="mark">M&amp;C</span><h2 id="lock-title">Despacho bloqueado</h2><p>Confirmá que sos vos para ver los expedientes.</p><button type="button" class="pill" id="lock-open">Desbloquear</button><button type="button" class="lock-link" id="lock-pass">Entrar con contraseña</button><p class="lock-err" id="lock-err" aria-live="polite"></p></div>';

async function unlock(){const c=cfg();if(!c){hide();return}$('lock-err').textContent='';
 try{await navigator.credentials.get({publicKey:{challenge:rand(32),rpId:location.hostname,allowCredentials:[{type:'public-key',id:unb64(c.id)}],userVerification:'required',timeout:60000}});hide()}
 catch(e){$('lock-err').textContent=e?.name==='NotAllowedError'?'No se confirmó. Intentá de nuevo o entrá con la contraseña.':'Este dispositivo no pudo verificarte. Entrá con la contraseña.'}}
function show(){if(locked||!cfg()||!hasSession())return;locked=true;overlay.hidden=false;document.documentElement.classList.add('is-locked');setTimeout(()=>$('lock-open').focus(),50)}
function hide(){locked=false;overlay.hidden=true;document.documentElement.classList.remove('is-locked')}

async function enable(btn){
 try{const user=window.LegalDespacho?.user;const cred=await navigator.credentials.create({publicKey:{challenge:rand(32),rp:{name:'Legal Martínez & Cortés',id:location.hostname},
   user:{id:rand(16),name:user?.email||'despacho',displayName:window.LegalDespacho?.profile?.display_name||'Despacho'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
   authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'discouraged'},timeout:60000,attestation:'none'}});
  localStorage.setItem(KEY,JSON.stringify({id:b64(cred.rawId),at:Date.now()}));window.LegalDespacho?.message?.('Bloqueo activado: la app pedirá Face ID o huella al abrirla y tras 5 minutos sin usarla.');
 }catch(e){if(e?.name!=='NotAllowedError')window.LegalDespacho?.message?.('Este dispositivo no permitió activar el bloqueo.',true)}
 paint(btn)}
function paint(btn){const on=!!cfg();btn.textContent=on?'Desactivar bloqueo':'Activar';btn.closest('.lock-setting').querySelector('small').textContent=on?'Activo: se pide al abrir y tras 5 minutos sin usar la app.':'Pedí Face ID, Touch ID o huella al abrir la app en este dispositivo.'}

function setting(){const home=$('view-home');if(!home||$('lock-toggle'))return;
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const row=document.createElement('div');row.className='lock-setting card';
 row.innerHTML=`<span class="plazo-ic" aria-hidden="true">🔒</span><span><b>Bloqueo con ${ios?'Face ID o Touch ID':'huella o rostro'}</b><small></small></span><button type="button" class="secondary" id="lock-toggle"></button>`;
 home.append(row);const btn=$('lock-toggle');paint(btn);
 btn.onclick=()=>{if(cfg()){try{localStorage.removeItem(KEY)}catch{}paint(btn);window.LegalDespacho?.message?.('Bloqueo desactivado en este dispositivo.')}else enable(btn)}}

async function init(){
 document.body.append(overlay);$('lock-open').onclick=unlock;
 $('lock-pass').onclick=()=>{hide();const out=$('logout');if(out&&!out.hidden)out.click();else{try{for(const k of Object.keys(localStorage))if(/^sb-.*-auth-token$/.test(k))localStorage.removeItem(k)}catch{}location.reload()}};
 try{supported=!!window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()}catch{supported=false}
 if(!supported){hide();return}
 setting();
 if(cfg()&&hasSession())show();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>AFTER)show()});
 document.addEventListener('legal-signout',hide);
}
// El velo se coloca antes de que aparezcan los datos.
if(cfg()&&hasSession())document.documentElement.classList.add('is-locked');
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.LegalLock={show,hide,get enabled(){return !!cfg()},get supported(){return supported}};
})();
