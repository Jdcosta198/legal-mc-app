'use strict';
/* Puente con las apps nativas (Android/iOS con Capacitor). En la web no hace nada especial.
   En el teléfono: abre los PDF con el visor del sistema, comparte archivos (calendario, proforma),
   abre los enlaces externos en el navegador y maneja el botón "atrás" de Android. */
(()=>{
const C=window.Capacitor,native=!!(C&&C.isNativePlatform&&C.isNativePlatform());
const P=()=>C?.Plugins||{};
const toBase64=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(blob)});
const safeName=n=>String(n||'archivo').replace(/[\\/:*?"<>|]+/g,'_').slice(0,120);
async function writeCache(name,blob){const {Filesystem}=P();const r=await Filesystem.writeFile({path:'legal-mc/'+Date.now()+'-'+safeName(name),data:await toBase64(blob),directory:'CACHE',recursive:true});return r.uri}
const api={
 isNative:native,
 platform:native?C.getPlatform():'web',
 webUrl:'https://jdcosta198.github.io/legal-mc-app',
 async openFile(name,blob,mime){const uri=await writeCache(name,blob);await P().FileOpener.openFile({path:uri,mimeType:mime||blob.type||'application/octet-stream'})},
 async shareFile(name,blob,title){const uri=await writeCache(name,blob);await P().Share.share({title:title||name,files:[uri],dialogTitle:title||'Compartir'})},
 async openExternal(url){if(native&&P().Browser)return P().Browser.open({url});window.open(url,'_blank','noopener')}
};
window.LegalNative=api;
if(!native)return;
document.documentElement.classList.add('is-native','is-standalone');
// Enlaces externos: navegador del sistema, nunca dentro de la app.
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const href=a.getAttribute('href');if(/^https?:\/\//.test(href)&&!href.startsWith(location.origin)){e.preventDefault();api.openExternal(href)}},true);
const open0=window.open.bind(window);window.open=(url,...rest)=>{if(typeof url==='string'&&/^https?:\/\//.test(url)&&!url.startsWith(location.origin)){api.openExternal(url);return null}return open0(url,...rest)};
// Botón "atrás" de Android: cierra ventanas, vuelve al inicio y luego minimiza.
P().App?.addListener('backButton',()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();if(d){d.close();return}const home=document.getElementById('view-home');if(home&&home.hidden&&!document.getElementById('workspace')?.hidden){document.querySelector('[data-view=home]')?.click();return}P().App.minimizeApp()});
P().StatusBar?.setStyle?.({style:'DARK'}).catch(()=>{});
})();
