'use strict';
/* PDF de texto para guardar el resultado de una consulta al Registro Nacional.
   Arma el PDF aquí mismo (sin librerías ni servidores): A4, encabezado del despacho, datos de la consulta,
   el texto del Registro en letra de ancho fijo para que las columnas queden alineadas, y pie con páginas.
   Se usa en la app y dentro de la página del Registro (registro-bot.js). */
(()=>{
const W=595.28,H=841.89,M=48,ANCHO=W-2*M;
// Fuentes estándar de PDF: no hay que incrustar nada. Courier tiene todos sus caracteres de 600/1000 de ancho.
const F={body:{f:'F1',size:8.4},bold:{f:'F2',size:8.4},title:{f:'F3',size:13},label:{f:'F4',size:8},small:{f:'F4',size:7}};
const charsPorLinea=size=>Math.floor(ANCHO/(size*.6));
const MAPA={'‘':"'",'’':"'",'“':'"','”':'"','–':'-','—':'-','…':'...','•':'·',' ':' ','\t':'    ','₡':'CRC '};
/** Texto → bytes WinAnsi (español completo: tildes, ñ, ü, ¿, ¡, º). Lo que no existe en WinAnsi se aproxima o se omite. */
function bytes(s){const out=[];for(const ch of String(s).normalize('NFC')){const c=MAPA[ch]??ch;for(const x of c){const n=x.codePointAt(0);
 if(n===0x20AC)out.push(0x80);else if(n>=32&&n<127)out.push(n);else if(n>=0xA0&&n<=0xFF)out.push(n);else if(n<32)continue;else{const b=x.normalize('NFD')[0];const m=b.codePointAt(0);out.push(m>=32&&m<127?m:63)}}}return out}
const esc=arr=>arr.map(b=>b===40||b===41||b===92?[92,b]:[b]).flat();
/** Parte un texto en renglones de máximo n caracteres, respetando palabras cuando se puede. */
function partir(txt,n){const out=[];for(const linea of String(txt).replace(/\r/g,'').split('\n')){let s=linea.replace(/\s+$/,'');if(!s){out.push('');continue}
 while(s.length>n){let k=s.lastIndexOf(' ',n);if(k<n*.5)k=n;out.push(s.slice(0,k));s=s.slice(k).replace(/^ /,'')}out.push(s)}return out}

/**
 * crear({titulo, subtitulo, datos:[[etiqueta,valor]], bloques:[{t:'h'|'p'|'fila'|'sep', x}], pie}) → Uint8Array (PDF)
 */
function crear({titulo='Consulta al Registro Nacional',subtitulo='',datos=[],bloques=[],pie='',autor='',encabezado='LEGAL MARTÍNEZ & CORTÉS'}){
 const paginas=[];let ops=[],y=0;
 const nueva=()=>{ops=[];paginas.push(ops);y=H-M};
 const txt=(estilo,x,yy,s)=>ops.push({estilo,x,y:yy,s});
 const linea=(x1,yy,x2,gris=.75,w=.6)=>ops.push({linea:[x1,yy,x2],gris,w});
 const espacio=need=>{if(y-need<M+28)nueva()};
 nueva();
 // Encabezado
 txt(F.label,M,y,String(encabezado).toUpperCase()+' · CONSULTA AL REGISTRO NACIONAL');y-=18;
 for(const l of partir(titulo,charsPorLinea(F.title.size)*1.05|0)){txt(F.title,M,y,l);y-=16}
 if(subtitulo){for(const l of partir(subtitulo,charsPorLinea(F.label.size)*1.15|0)){txt(F.label,M,y,l);y-=11}}
 y-=4;linea(M,y,W-M,.2,1);y-=14;
 // Datos de la consulta
 const colEt=Math.max(...datos.map(d=>d[0].length),8)+2,n=charsPorLinea(F.body.size);
 for(const [k,v] of datos){const ls=partir(String(v??''),n-colEt);espacio(11*ls.length);txt(F.bold,M,y,k);ls.forEach((l,i)=>{txt(F.body,M+colEt*F.body.size*.6,y,l);y-=10.5});}
 y-=4;linea(M,y,W-M);y-=14;
 // Resultado del Registro
 for(const b of bloques){
  if(b.t==='sep'){espacio(10);y-=3;linea(M,y,W-M,.85,.4);y-=9;continue}
  const st=b.t==='h'?F.bold:F.body,ls=partir(b.x,n);
  if(b.t==='h'){espacio(26);y-=4}
  for(const l of ls){espacio(11);txt(st,M,y,l);y-=10.5}
  if(b.t==='h')y-=1;
 }
 // Pie de cada página
 const total=paginas.length;
 paginas.forEach((p,i)=>{p.push({linea:[M,M+4,W-M],gris:.75,w:.5});const left=pie||'Copia informativa de una consulta gratuita. No sustituye una certificación registral.';
  p.push({estilo:F.small,x:M,y:M-6,s:left.slice(0,120)});const pg=`Página ${i+1} de ${total}`;p.push({estilo:F.small,x:W-M-pg.length*F.small.size*.52,y:M-6,s:pg})});
 // Ensamblado del PDF
 const parts=[],offs=[];let len=0;const ascii=t=>new Uint8Array([...t].map(ch=>ch.charCodeAt(0)&255));const push=b=>{const u=b instanceof Uint8Array?b:typeof b==='string'?ascii(b):new Uint8Array(b);parts.push(u);len+=u.length};
 const obj=(num,body)=>{offs[num]=len;push(`${num} 0 obj\n`);[].concat(body).forEach(push);push('\nendobj\n')};
 push('%PDF-1.4\n');push(new Uint8Array([37,226,227,207,211,10]));
 const fonts={F1:'Courier',F2:'Courier-Bold',F3:'Helvetica-Bold',F4:'Helvetica'};
 const NF=4,fontBase=3,pageBase=fontBase+NF+1;// 1 catalog,2 pages,3..6 fonts,7 info, 8.. pages
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
 obj(2,`<< /Type /Pages /Kids [${paginas.map((_,i)=>`${pageBase+i*2} 0 R`).join(' ')}] /Count ${paginas.length} >>`);
 Object.values(fonts).forEach((name,i)=>obj(fontBase+i,`<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`));
 const fecha=new Date(),pdfDate='D:'+fecha.toISOString().replace(/[-:T]/g,'').slice(0,14)+'Z';
 obj(fontBase+NF,['<< /Title (',new Uint8Array(esc(bytes(titulo.slice(0,200)))),') /Author (',new Uint8Array(esc(bytes(autor||'Legal Martínez & Cortés'))),`) /Producer (Legal M&C) /CreationDate (${pdfDate}) >>`]);
 const asc=t=>[...t].map(ch=>ch.charCodeAt(0)&255);
 paginas.forEach((p,i)=>{const num=pageBase+i*2;
  const c=[];for(const o of p){if(o.linea){const [x1,yy,x2]=o.linea;c.push(...asc(`${o.gris} G ${o.w} w ${x1.toFixed(2)} ${yy.toFixed(2)} m ${x2.toFixed(2)} ${yy.toFixed(2)} l S\n`))}
   else{c.push(...asc(`BT /${o.estilo.f} ${o.estilo.size} Tf 0.1 g ${o.x.toFixed(2)} ${o.y.toFixed(2)} Td (`),...esc(bytes(o.s)),...asc(') Tj ET\n'))}}
  const res=`<< /Font << ${Object.keys(fonts).map((k,j)=>`/${k} ${fontBase+j} 0 R`).join(' ')} >> >>`;
  obj(num,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources ${res} /Contents ${num+1} 0 R >>`);
  obj(num+1,[`<< /Length ${c.length} >>\nstream\n`,new Uint8Array(c),'\nendstream'])});
 const total2=pageBase+paginas.length*2,xref=len;push(`xref\n0 ${total2}\n0000000000 65535 f \n`);
 for(let k=1;k<total2;k++)push(String(offs[k]).padStart(10,'0')+' 00000 n \n');
 push(`trailer\n<< /Size ${total2} /Root 1 0 R /Info ${fontBase+NF} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 const outB=new Uint8Array(len);let o=0;for(const p of parts){outB.set(p,o);o+=p.length}return outB;
}
/** Nombre de archivo para el expediente: "Registro - Vehículo BKN-216 - 2026-11-03 1338.pdf" */
function nombreArchivo(resumen,fecha=new Date()){const z=n=>String(n).padStart(2,'0');
 const f=`${fecha.getFullYear()}-${z(fecha.getMonth()+1)}-${z(fecha.getDate())} ${z(fecha.getHours())}${z(fecha.getMinutes())}`;
 return ('Registro - '+String(resumen||'consulta').replace(/:/g,'').replace(/[\\/*?"<>|]+/g,'-').replace(/\s+/g,' ').trim()).slice(0,150)+' - '+f+'.pdf'}
globalThis.RegistroPDF={crear,nombreArchivo,partir,bytes};
})();
