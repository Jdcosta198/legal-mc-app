'use strict';
/* Ventanita que abre el favorito "Legal M&C · Registro" cuando no hay una ventana de la app al lado.
   El Registro no permite cargar scripts de otros sitios; por eso esta página (de la app) le envía el código
   del asistente a la ventana del Registro que la abrió, y se cierra. Solo lo envía a rnpdigital.com. */
(async()=>{
const out=document.getElementById('estado');
try{
 if(!window.opener)throw new Error('Abrí esta página desde el favorito, estando en rnpdigital.com.');
 const r=await fetch(new URL('registro-bot.js',location.href),{cache:'no-cache'});if(!r.ok)throw new Error('No se pudo descargar el asistente.');
 const codigo=await r.text();
 window.opener.postMessage({lmc:1,tipo:'codigo',codigo},'https://www.rnpdigital.com');
 out.textContent='Listo. Volvé a la ventana del Registro.';setTimeout(()=>window.close(),700);
}catch(e){out.textContent=e.message}
})();
