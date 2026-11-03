'use strict';
/* Escanear documentos con la cámara y convertirlos en PDF dentro del teléfono (nada sale del dispositivo hasta subirlo).
   Cada foto se endereza según el EXIF, se reduce a 2000 px, se pasa a escala de grises con contraste de documento
   y se guarda como página JPEG de un PDF armado aquí mismo. */
(()=>{
const $=id=>document.getElementById(id);
const pages=[];// {blob,w,h,url}
let modo='doc';

async function bitmap(file){
 if('createImageBitmap'in window){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch{}}
 return await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ko(Error('No se pudo leer la foto.'));i.src=URL.createObjectURL(file)});
}
async function procesar(file){
 const img=await bitmap(file),W=img.width||img.naturalWidth,H=img.height||img.naturalHeight,k=Math.min(1,2000/Math.max(W,H));
 const w=Math.round(W*k),h=Math.round(H*k),c=document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d',{willReadFrequently:true});g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(img,0,0,w,h);img.close?.();
 if(modo==='doc'){
  const d=g.getImageData(0,0,w,h),p=d.data,hist=new Uint32Array(256);
  for(let i=0;i<p.length;i+=4){const y=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000|0;p[i]=y;hist[y]++}
  // Estira el contraste entre el 2 % más oscuro y el 2 % más claro (papel blanco, tinta negra).
  const n=w*h;let lo=0,hi=255,acc=0;for(;lo<255&&(acc+=hist[lo])<n*.02;lo++);acc=0;for(;hi>0&&(acc+=hist[hi])<n*.02;hi--);
  const r=Math.max(1,hi-lo);for(let i=0;i<p.length;i+=4){let y=(p[i]-lo)*255/r;y=y<0?0:y>255?255:y;p[i]=p[i+1]=p[i+2]=y}
  g.putImageData(d,0,0);
 }
 const blob=await new Promise(ok=>c.toBlob(ok,'image/jpeg',modo==='doc'?.7:.78));
 return {blob,w,h,url:URL.createObjectURL(blob)};
}

/** Arma un PDF con una imagen JPEG por página (ancho A4, alto proporcional). */
async function armarPdf(list){
 const enc=new TextEncoder(),parts=[],offs=[];let len=0;
 const push=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
 const obj=(n,body)=>{offs[n]=len;push(`${n} 0 obj\n`);for(const b of[].concat(body))push(b);push('\nendobj\n')};
 push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
 const N=list.length,kids=list.map((_,i)=>`${3+i*3} 0 R`).join(' ');
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${kids}] /Count ${N} >>`);
 for(let i=0;i<N;i++){const {blob,w,h}=list[i],pw=595.28,ph=+(pw*h/w).toFixed(2),pg=3+i*3,img=pg+1,ct=pg+2,data=new Uint8Array(await blob.arrayBuffer());
  obj(pg,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${i} ${img} 0 R >> >> /Contents ${ct} 0 R >>`);
  obj(img,[`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`,data,'\nendstream']);
  const s=`q ${pw} 0 0 ${ph} 0 0 cm /Im${i} Do Q`;obj(ct,`<< /Length ${s.length} >>\nstream\n${s}\nendstream`)}
 const total=3+N*3,xref=len;push(`xref\n0 ${total}\n0000000000 65535 f \n`);for(let n=1;n<total;n++)push(String(offs[n]).padStart(10,'0')+' 00000 n \n');
 push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 return new Blob(parts,{type:'application/pdf'});
}

function pintar(){
 const box=$('scan-pages');if(!box)return;box.replaceChildren(...pages.map((p,i)=>{const f=document.createElement('figure');f.innerHTML=`<img alt="Página ${i+1}"><figcaption>${i+1}</figcaption><button type="button" class="scan-x" aria-label="Quitar página ${i+1}">×</button>`;f.querySelector('img').src=p.url;f.querySelector('button').onclick=()=>{URL.revokeObjectURL(p.url);pages.splice(i,1);pintar()};return f}));
 $('scan-panel').hidden=!pages.length;$('scan-make').textContent=`Crear PDF (${pages.length} página${pages.length===1?'':'s'})`;
}
function montar(){
 const drop=$('drop');if(!drop||$('scan-btn'))return;
 const wrap=document.createElement('div');wrap.className='scan';
 wrap.innerHTML=`<button type="button" class="secondary scan-btn" id="scan-btn"><span aria-hidden="true">📷</span> Escanear con la cámara</button><input id="scan-input" type="file" accept="image/*" capture="environment" multiple hidden>
 <div id="scan-panel" class="scan-panel" hidden><div class="scan-head"><b>Páginas escaneadas</b><label><input type="checkbox" id="scan-color"> A color</label></div><div id="scan-pages" class="scan-pages"></div><div class="scan-actions"><button type="button" class="secondary" id="scan-more">＋ Otra página</button><button type="button" class="pill" id="scan-make">Crear PDF</button></div><p class="label">Las fotos se convierten en PDF dentro de este dispositivo.</p></div>`;
 drop.closest('div').append(wrap);
 const pick=()=>$('scan-input').click();
 $('scan-btn').onclick=pick;$('scan-more').onclick=pick;
 $('scan-color').onchange=e=>{modo=e.target.checked?'color':'doc'};
 $('scan-input').onchange=async e=>{const files=[...e.target.files];e.target.value='';if(!files.length)return;$('scan-btn').disabled=true;$('scan-btn').textContent='Procesando…';
  try{for(const f of files)pages.push(await procesar(f));pintar()}catch(err){window.LegalDespacho?.message?.(err.message||'No se pudo procesar la foto.',true)}
  finally{$('scan-btn').disabled=false;$('scan-btn').innerHTML='<span aria-hidden="true">📷</span> Escanear con la cámara'}};
 $('scan-make').onclick=async()=>{if(!pages.length)return;const b=$('scan-make');b.disabled=true;
  try{const blob=await armarPdf(pages),d=new Date(),name=`Escaneo ${d.toLocaleDateString('es-CR').replace(/\//g,'-')} ${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}.pdf`;
   const file=new File([blob],name,{type:'application/pdf'});
   if(file.size>20971520)throw Error('El PDF supera 20 MB. Quitá páginas o escaneá en blanco y negro.');
   const dt=new DataTransfer();dt.items.add(file);$('pdf').files=dt.files;$('pdf').dispatchEvent(new Event('change'));
   for(const p of pages)URL.revokeObjectURL(p.url);pages.length=0;pintar();
   window.LegalDespacho?.message?.(`PDF listo (${(file.size/1048576).toFixed(2)} MB). Elegí el expediente y tocá "Subir PDF privado".`);
   ($('document-case').value?$('upload-form').querySelector('[type=submit]'):$('document-case')).focus();
  }catch(err){window.LegalDespacho?.message?.(err.message||'No se pudo crear el PDF.',true)}finally{b.disabled=false}};
 document.addEventListener('legal-signout',()=>{for(const p of pages)URL.revokeObjectURL(p.url);pages.length=0;pintar()});
}
window.LegalScan={armarPdf,procesar,pages};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',montar);else montar();
})();
