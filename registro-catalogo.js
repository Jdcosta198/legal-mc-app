'use strict';
/* Catálogo de las consultas gratuitas de rnpdigital.com (Registro Nacional de Costa Rica).
   Se usa en dos lugares: en la app (formulario y validación) y dentro de la página del Registro
   (registro-bot.js), donde cada "plan" dice qué campo llenar y con qué valor.
   Mapeado el 3-nov-2026 desde la sección "Consultas Gratuitas" con una cuenta real.
   Las consultas se buscan por el texto del enlace en el índice, no por identificadores internos,
   porque esos cambian cuando el Registro actualiza su sistema. */
(()=>{
const PROV=[['1','San José'],['2','Alajuela'],['3','Cartago'],['4','Heredia'],['5','Guanacaste'],['6','Puntarenas'],['7','Limón']];
const PLANO_LETRA={SJ:'1',A:'2',C:'3',H:'4',G:'5',P:'6',L:'7'};
const CLASES=[["","PARTICULAR"],["TAP","AEROPUERTO INTERNACIONAL JUAN SANTAMARIA"],["352","AGENCIA DE PROTECCION DE DATOS DE LOS HABITANTES"],["AB","ALAJUELA BUS"],["AP","ALAJUELA PUBLICO"],["AL","ASAMBLEA LEGISLATIVA"],["PEB","ASAMBLEA LEGISLATIVA"],["339","ASAMBLEA LEGISLATIVA."],["316","ASOCIACION DE CONSERVACION Y DESARROLLO FORESTAL DE TALAMANCA"],["297","AUTORIDAD REGULADORA DE LOS SERVICIOS PUBLICOS"],["051","BANCO ANGLO COSTARRRICENSE"],["052","BANCO CENTRAL DE COSTA RICA"],["053","BANCO CREDITO AGRICOLA DE CARTAGO"],["054","BANCO DE COSTA RICA"],["305","BANCO HIPOTECARIO DE LA VIVIENDA"],["055","BANCO NACIONAL DE COSTA RICA"],["056","BANCO POPULAR Y DE DESARROLLO COMUNAL"],["BTA","BICICLETA"],["BM","BICIMOTO"],["200","CAJA COSTARRICENSE DEL SEGURO SOCIAL"],["CL","CARGA LIVIANA"],["C","CARGA PESADA"],["CB","CARTAGO BUS"],["CP","CARTAGO PUBLICO"],["325","CENTRO COSTARRICENSE DE PRODUCCION CINEMATOGRAFICA"],["327","CENTRO CULTURAL E HISTORICO JOSE FIGUERES FERRER"],["326","CENTRO NACIONAL DE LA MUSICA"],["111","CLUBES 4 - S"],["311","COLEGIO UNIVERSITARIO DE ALAJUELA"],["01","COLEGIO UNIVERSITARIO DE CARTAGO"],["COL","COLEGIO UNIVERSITARIO DE CARTAGO"],["314","COLEGIO UNIVERSITARIO DE CARTAGO"],["319","COLEGIO UNIVERSITARIO DE LIMON"],["312","COLEGIO UNIVERSITARIO DE PUNTARENAS"],["298","COLEGIO UNIVERSITARIO PARA EL RIESGO Y EL DESARROLLO DEL TROPICO"],["238","COM.NAC.INVESTIGACION CIEN. Y TEC."],["303","COMISION DE ENERGIA ATOMICA DE C.R."],["233","COMISION NACIONAL DE ASUNTOS INDIGENAS"],["057","COMISION NACIONAL DE PRESTAMOS PARA LA EDUCACION"],["322","COMISION NACIONAL DE PREVENCION DE RIESGOS Y ATENCION EMERGENCIAS"],["351","COMISION PARA EL ORDENAMIENTO Y MANEJO DE LA CUENCA DEL RIO REVENTAZON"],["353","COMISIÓN NACIONAL PARA LA GESTION DE LA BIODIVERSIDAD (CONAGEBIO)"],["107","COMPAÑIA NACIONAL DE FUERZA Y LUZ"],["CNF","COMPAÑIA NACIONAL DE FUERZA Y LUZ"],["012","CONCESIONARIO DE OBRA PUBLICA"],["344","CONSEJO DE SALUD OCUPACIONAL"],["260","CONSEJO DE SEGURIDAD VIAL"],["318","CONSEJO DE TRANSPORTE PUBLICO"],["323","CONSEJO NACIONAL DE CONCESIONES"],["328","CONSEJO NACIONAL DE LA POLITICA PUBLICA DE LA PERSONA JOVEN"],["240","CONSEJO NACIONAL DE PERSONAS CON DISCAPACIDAD (CONAPDIS)"],["100","CONSEJO NACIONAL DE PRODUCCION"],["239","CONSEJO NACIONAL DE RECTORES"],["CGR","CONTRALORIA GENERAL DE LA REPUBLICA"],["309","CONTRATOS ACUEDUCTOS Y ALCANTARILLADO"],["306","CONTRATOS COMISION NAC. EMERGENCIA"],["CRC","CRUZ ROJA"],["CC","CUERPO CONSULAR"],["341","CUERPO DE BOMBEROS DE COSTA RICA"],["CD","CUERPO DIPLOMATICO"],["D H","DEFENSORIA DE LOS HABITANTES DE LA REPUBLICA"],["349","DIRECCION NACIONAL DE NOTARIADO"],["252","EDITORIAL COSTA RICA"],["EMB","EMBAJADA DE LA REPUBLICA CHECA"],["12","EMPRESA CONSTRUCTORA"],["101","EMPRESA DE SERVICIOS PUBLICOS DE HEREDIA"],["EE","EQUIPO ESPECIAL"],["302","ESCUELA CENTROAMERICANA DE GANADERIA"],["USA","ESTADOS UNIDOS DE AMERICA"],["EXP","EXPORTACION"],["355","FONDO DE NACIONAL DE FINANCIAMIENTO FORESTAL (FONAFIFO)"],["350","FONDO NACIONAL DE BECAS"],["329","FUNDACION AYUDANOS PARA AYUDAR (CENTRO COSTARRICENSE DE LA CIENCIA Y LA CULTURA)"],["MI4","FUNDACION CONSEJO DE LA TIERRA"],["FUN","FUNDACION FRIEDRICH EBERT"],["GB","GUANACASTE BUS"],["GP","GUANACASTE PUBLICO"],["HB","HEREDIA BUS"],["HP","HEREDIA PUBLICO"],["264","I.N.S.A."],["259","ILLANUT"],["250","IMPRENTA NACIONAL"],["317","INAMU"],["110","INS. COSTARRICENSE DE FERROCARRILES"],["257","INS. COSTARRICENSE DE TURISMO"],["261","INS. MIXTO DE AYUDA SOCIAL"],["262","INS. NACIONAL DE APRENDIZAJE"],["265","INS. TECNOLOGICO DE COSTA RICA"],["258","INST.GEOGRAFICO NACIONAL"],["INC","INSTITUTO COSTARRICENES DE PESCA Y ACUACULTURA"],["003","INSTITUTO COSTARRICENSE CONTRA EL CANCER"],["102","INSTITUTO COSTARRICENSE DE ACUEDUCTOS Y ALCATARILLADOS"],["103","INSTITUTO COSTARRICENSE DE ELECTRICIDAD"],["256","INSTITUTO COSTARRICENSE DE INVESTIGACION Y ENSEÑANZA EN NUTRICION Y SALUD"],["313","INSTITUTO COSTARRICENSE DE PESCA Y ACUACULTURA"],["263","INSTITUTO DE DESARROLLO AGRARIO"],["059","INSTITUTO DE FOMENTO Y ASESORIA MUNICIPAL"],["104","INSTITUTO DE PUERTOS DEL PACIFICO"],["IAG","INSTITUTO GEODESICO AMERICANO"],["113","INSTITUTO NACIONAL DE ESTADISTICA Y CENSOS"],["060","INSTITUTO NACIONAL DE FOMENTO"],["346","INSTITUTO NACIONAL DE INNOVACION Y TRANSFERENCIA EN TECNOLOGIA AGROPECUARIA"],["061","INSTITUTO NACIONAL DE SEGUROS"],["105","INSTITUTO NACIONAL DE VIVIENDA Y URBANISMO"],["109","JUN.ADM.PUER.DES.ECON. VERT.ATLANTICA"],["268","JUNTA ADM. DIR. NAC. DE COMUNICACIONES S"],["331","JUNTA ADMINISTRATIVA ARCHIVO NACIONAL"],["108","JUNTA ADMINISTRATIVA DE SERVICIOS ELECTRICOS DE CARTAGO"],["332","JUNTA ADMINISTRATIVA DEL MUSEO HISTORICO JUAN SANTAMARIA"],["310","JUNTA ADMINISTRATIVA REGISTRO NACIONAL"],["333","JUNTA ADMINISTRATIVA TEATRO MELICO SALAZAR"],["315","JUNTA ADMINISTRATIVA TEATRO NACIONAL"],["330","JUNTA ADMINISTRATIVA TEATRO NACIONAL"],["273","JUNTA DE PEN. Y JUB. MAGISTERIO NACIONAL"],["276","JUNTA PROTEC.SOCIAL SAN JOSE"],["277","JUNTA PROTEC.SOCIAL SAN RAMON"],["LFP","LIMITACIONES FISICAS PERMANENTES"],["LB","LIMON BUS"],["LP","LIMON PUBLICO"],["MD","MISION DIPLOMATICA"],["MI","MISION INTERNACIONAL"],["MOT","MOTOCICLETAS"],["MF","MUNDIAL DE FUTBOL FEMENINO 2014"],["335","MUSEO DE ARTE COSTARRICENSE"],["336","MUSEO DE ARTE Y DISEÑO CONTEMPORANEO"],["253","MUSEO NACIONAL"],["337","MUSEO RAFAEL ANGEL CALDERON GUARDIA"],["002","MUTUALES DE AHORRO Y PRESTAMO"],["OP","OBRA PUBLICA"],["285","OFICINA DEL ARROZ"],["284","OFICINA DEL CAFE"],["286","OFICINA NACIONAL DE SEMILLAS"],["290","PATRONATO NACIONAL DE LA INFANCIA"],["292","PATRONATO NACIONAL DE REHABILITACION"],["PEN","PENSIONADO"],["TAX","PERMISOS DE TAXI"],["PE","PODER EJECUTIVO"],["PJ","PODER JUDICIAL"],["112","PROGRAMA INTEGRAL DE MERCADEO AGROPECUARIO (PIMA)"],["PB","PUNTARENAS BUS"],["PP","PUNTARENAS PUBLICO"],["106","RADIOGRAFICA COSTARRICENSE S.A."],["308","REFINADORA COSTARRICENSE DE PETROLEO (RECOPE)"],["RL","REMOLQUE LIVIANO"],["R","REMOLQUES"],["296","S.E.N.A.R.A."],["SJB","SAN JOSE BUS"],["SJP","SAN JOSE PUBLICO"],["S","SEMIREMOLQUE"],["SE","SERVICIO ESTABLE"],["342","SERVICIO FITOSANITARIO DEL ESTADO"],["SM","SERVICIO MUNICIPAL"],["340","SERVICIO NACIONAL DE SALUD ANIMAL"],["SR","SERVICIO REMOLQUE"],["348","SISTEMA DE BANCA PARA EL DESARROLLO"],["324","SISTEMA DE EMERGENCIAS 911"],["347","SISTEMA NACIONAL DE AREAS DE CONSERVACION"],["338","SISTEMA NACIONAL DE RADIO Y TELEVISION S.A. (SINART S.A.)"],["345","SUPERINTENDENCIA DE TELECOMUNICACIONES (SUTEL)"],["TA","TAXI DE ALAJUELA"],["TC","TAXI DE CARTAGO"],["TG","TAXI DE GUANACASTE"],["TH","TAXI DE HEREDIA"],["TL","TAXI DE LIMON"],["TP","TAXI DE PUNTARENAS"],["TSJ","TAXI DE SAN JOSE"],["TE","TAXI ESTABLE"],["321","TRIBUNAL ADMINISTRATIVO DE TRANSPORTES"],["320","TRIBUNAL REGISTRAL ADMINISTRATIVO"],["TSE","TRIBUNAL SUPREMO DE ELECCIONES"],["TUR","TURISMO"],["301","UNIVERSIDA NACIONAL"],["307","UNIVERSIDAD ADVENTISTA DE CENTRO AMERICA"],["299","UNIVERSIDAD DE COSTA RICA"],["300","UNIVERSIDAD ESTATAL A DISTANCIA"],["343","UNIVERSIDAD TECNICA NACIONAL"],["VE","VEHICULO ESPECIAL"],["VH","VEHICULO HISTORICO"],["D","VEHICULOS DISCAPACITADOS"],["ZFE","ZONAS FRANCAS DE EXPORTACION"]];
const CLASE_SET=new Set(CLASES.map(c=>c[0]).filter(Boolean));

const solo=s=>String(s??'').trim();
const dig=s=>solo(s).replace(/\D/g,'');
const pad=(s,n)=>dig(s).padStart(n,'0');
class ErrorDato extends Error{constructor(campo,msg){super(msg);this.campo=campo}}
const err=(c,m)=>{throw new ErrorDato(c,m)};

/* ---------- Lectura de números tal como los escribe la gente ---------- */
/** "4-179693-002", "4 179693 002", "4-179693-F-002", "4179693002" → partes de la finca. */
function leerFinca(txt){
 const t=solo(txt).toUpperCase().replace(/[–—.]/g,'-');if(!t)return null;
 let m=t.match(/^([1-7])[\s-]*(\d{1,8})(?:[\s-]*([A-Z]))?(?:[\s-]*([FM]))?(?:[\s-]+(\d{1,3}))?$/);
 if(!m&&/^\d{8,12}$/.test(t))m=[t,t[0],t.slice(1,t.length-3),'','',t.slice(-3)];// 4179693002
 if(!m){m=t.match(/^([1-7])-(\d{1,8})-(\d{1,3})$/);if(m)m=[m[0],m[1],m[2],'','',m[3]]}
 if(!m)return null;
 let dup=m[3]||'',hor=m[4]||'';if(dup==='F'||dup==='M'){if(!hor){hor=dup;dup=''}}
 return {provincia:m[1],numero:String(+m[2]),duplicado:dup,horizontal:hor,derecho:m[5]?pad(m[5],3):''};
}
/** "3-101-123456" / "3101123456" → {tipo,clase,consecutivo}. */
function leerCedJur(txt){const d=dig(txt);if(d.length!==10)return null;return {tipo:d[0],clase:d.slice(1,4),consecutivo:d.slice(4)}}
/** "4-0201-0838" / "402010838" / "4-201-838" → {p1,p2,p3}. */
function leerCedFis(txt){const t=solo(txt);let m=t.match(/^(\d)\s*[- ]\s*(\d{1,4})\s*[- ]\s*(\d{1,4})$/);if(m)return {p1:m[1],p2:pad(m[2],4),p3:pad(m[3],4)};
 const d=dig(t);if(d.length===9)return {p1:d[0],p2:d.slice(1,5),p3:d.slice(5)};if(d.length===10&&d[1]==='0')return {p1:d[0],p2:d.slice(2,6),p3:d.slice(6)};return null}
/** "BKN-216", "BKN216", "123456", "CL-123456", "MOT 456789", "TSJ-1234" → {clase,numero}. */
function leerPlaca(txt){const t=solo(txt).toUpperCase().replace(/[\s–—.]/g,'-').replace(/-+/g,'-');if(!t)return null;
 const m=t.match(/^([A-Z0-9]{1,3}(?: [A-Z])?)-(\d{1,6})$/);
 if(m&&CLASE_SET.has(m[1]))return {clase:m[1],numero:m[2]};
 const plano=t.replace(/-/g,'');if(/^[A-Z0-9]{1,6}$/.test(plano))return {clase:'',numero:plano};
 return null}
/** "H-0959238-1991", "4-959238-1991", "SJ-12345-2001" → {provincia,numero,anio}. */
function leerPlano(txt){const t=solo(txt).toUpperCase().replace(/[\s–—.]/g,'-').replace(/-+/g,'-');const m=t.match(/^(SJ|[ACHGPL]|[1-7])-?(\d{1,7})-(\d{4})$/);if(!m)return null;
 const p=PLANO_LETRA[m[1]]||m[1];return {provincia:p,numero:String(+m[2]),anio:m[3]}}
/** "800-1009309-01-0001-001" (citas de gravamen) o "2014-29235" (tomo-asiento). */
function leerCitas(txt){const p=solo(txt).split(/[\s\-\/]+/).filter(Boolean);if(p.length<2||!p.every(x=>/^\d+$/.test(x)))return null;
 return {tomo:String(+p[0]),asiento:String(+p[1]),consecutivo:p[2]?String(+p[2]):'',secuencia:p[3]?String(+p[3]):'',subsecuencia:p[4]?String(+p[4]):''}}

/* ---------- Campos que la app muestra para cada consulta ---------- */
// t: tipo de control · k: clave · l: etiqueta · req: obligatorio · ph: ejemplo · max: largo · ops: opciones [valor,texto]
const C={
 prov:{t:'sel',k:'provincia',l:'Provincia',req:1,ops:PROV},
 num:{t:'txt',k:'numero',l:'Número de finca',req:1,ph:'179693',max:8,dig:1},
 dup:{t:'sel',k:'duplicado',l:'Duplicado',ops:[['','—']].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(x=>[x,x]))},
 hor:{t:'sel',k:'horizontal',l:'Horizontal',ops:[['','—'],['F','F (filial)'],['M','M (matriz)']]},
 der:{t:'txt',k:'derecho',l:'Derecho',ph:'000',max:3,dig:1,ayuda:'Vacío para ver todos los derechos; 000 si la finca no tiene derechos.'},
 tomo:{t:'txt',k:'tomo',l:'Tomo',req:1,ph:'2014',max:4,dig:1},
 asiento:{t:'txt',k:'asiento',l:'Asiento',req:1,ph:'29235',max:8,dig:1},
 consec:{t:'txt',k:'consecutivo',l:'Consecutivo',max:3,dig:1},
 consecReq:{t:'txt',k:'consecutivo',l:'Consecutivo',req:1,max:3,dig:1,ph:'1'},
 sec:{t:'txt',k:'secuencia',l:'Secuencia',max:3,dig:1},
 secReq:{t:'txt',k:'secuencia',l:'Secuencia',req:1,max:3,dig:1,ph:'1'},
 subsec:{t:'txt',k:'subsecuencia',l:'Subsecuencia',max:3,dig:1},
 cedJur:{t:'txt',k:'cedula',l:'Cédula jurídica',req:1,ph:'3-101-123456',fmt:'cedJur'},
 nombre:{t:'txt',k:'nombre',l:'Nombre',req:1,max:60},
};
const ID_BI=[['1','Cédula de identidad'],['2','Cédula jurídica'],['3','Cédula de residencia'],['11','DIMEX'],['12','DIDI'],['5','Pasaporte'],['7','Carné de Seguro Social'],['8','Licencia de conducir'],['4','Carné de pensionado'],['6','Carné de refugiado'],['9','Otro tipo de identificación']];
const ID_BM=[['000001','Cédula de identidad'],['000003','Cédula jurídica'],['000002','Residente'],['000019','DIMEX'],['000017','DIDI'],['000006','Pasaporte'],['000004','Menor de edad'],['000005','Carné de pensionado'],['000008','Carné de refugiado'],['000011','Cédula extranjera'],['000015','Residente permanente'],['000016','Residente temporal'],['000010','Permiso temporal'],['000025','Permiso laboral']];
const fincaCampos=(conDerecho=true)=>[C.prov,C.num,C.dup,C.hor].concat(conDerecho?[C.der]:[]);
const idCampos=ops=>[{t:'sel',k:'tipoId',l:'Tipo de identificación',req:1,ops},{t:'txt',k:'id',l:'Número de identificación',req:1,ph:'4-0201-0838',ayuda:'Con o sin guiones.'}];
const nombreCampos=ops=>[{t:'sel',k:'tipoNombre',l:'Tipo de persona',req:1,ops},{t:'txt',k:'nombre',l:'Nombre (o razón social)',req:1,max:60},{t:'txt',k:'apellido1',l:'Primer apellido',max:21,solo:{tipoNombre:ops[0][0]}},{t:'txt',k:'apellido2',l:'Segundo apellido',max:21,solo:{tipoNombre:ops[0][0]}}];
const vehCampos=[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['PLA','Placa'],['CHA','Chasis'],['MOT','Motor'],['VIN','VIN'],['SER','Serie']]},{t:'txt',k:'placa',l:'Placa',ph:'BKN-216',solo:{por:'PLA'},req:1,fmt:'placa',ayuda:'Con su clase si no es particular: CL-123456, MOT-456789, TSJ-1234.'},{t:'txt',k:'valor',l:'Número',max:20,solo:{por:['CHA','MOT','VIN','SER']},req:1}];
const placaCampos=[{t:'txt',k:'placa',l:'Placa del vehículo',req:1,ph:'BKN-216',fmt:'placa',ayuda:'Con su clase si no es particular: CL-123456, MOT-456789.'}];

/* ---------- Pasos para llenar el formulario en el Registro ----------
   {s:selector,v} elige una opción · {t:selector,v} escribe texto · selector:
   n=nombre exacto · ne=nombre termina en · i=n-ésimo cuadro de texto visible · o=texto de alguna opción · ov=valores de opción presentes */
const SEL_PROV={o:'HEREDIA',ov:['1','7']};
function pasosFinca(v,conDerecho=true){const p=[{s:SEL_PROV,v:v.provincia},{t:{ne:'finca'},v:v.numero}];
 if(v.duplicado)p.push({s:{ov:['A','Z']},v:v.duplicado});if(v.horizontal)p.push({s:{ov:['F','M'],nov:'A'},v:v.horizontal});
 if(conDerecho&&v.derecho)p.push({t:{ml:3},v:v.derecho});return p}
const citas=(v,ks,nombres)=>ks.filter(k=>v[k]!==''&&v[k]!=null).map(k=>({t:nombres?{n:nombres[k]}:{ne:k},v:v[k]}));
function partesId(tipo,id,bm){
 const fis=bm?tipo==='000001':tipo==='1',jur=bm?tipo==='000003':tipo==='2';
 if(fis){const c=leerCedFis(id);if(!c)err('id','La cédula de identidad debe tener 9 dígitos, por ejemplo 4-0201-0838.');return [c.p1,c.p2,c.p3]}
 if(jur){const c=leerCedJur(id);if(!c)err('id','La cédula jurídica debe tener 10 dígitos, por ejemplo 3-101-123456.');return [c.tipo,c.clase,c.consecutivo]}
 const s=solo(id).replace(/\s+/g,'');if(!s)err('id','Escribí el número de identificación.');return [s]}
const pasosId=(sel,v,bm)=>[{s:sel,v:v.tipoId,espera:true}].concat(partesId(v.tipoId,v.id,bm).map((x,i)=>({t:{i},v:x})));
function pasosPlaca(v,selTipo){const p=leerPlaca(v.placa);if(!p)err('placa','Placa no reconocida. Ejemplos: BKN-216, 123456, CL-123456.');
 const out=selTipo?[selTipo]:[];out.push({s:{n:'class'},v:p.clase,espera:true},{t:{n:'carNumber'},v:p.numero});return out}

const L=(sec,id,nombre,link,o)=>Object.assign({sec,id,nombre,link,nth:0},o);
const CONSULTAS=[
 // Bienes inmuebles
 L('inmuebles','bi-finca','Finca por número','Consulta por Número de Finca',{url:'paramConsultaFinca.jspx',desc:'Propietario, naturaleza, medida, plano, gravámenes y anotaciones.',campos:fincaCampos(),plan:v=>pasosFinca(v),principal:1}),
 L('inmuebles','bi-persona-id','Propiedades de una persona','Consulta de Personas por Identificación',{desc:'Fincas y gravámenes inscritos a nombre de una cédula.',campos:idCampos(ID_BI),plan:v=>pasosId({ov:['1','2','12']},v,false),principal:1}),
 L('inmuebles','bi-persona-nombre','Propiedades por nombre','Consulta de Personas por Nombre',{url:'paramConsultaPersonaBINombre.jspx',desc:'Busca fincas por el nombre de la persona física o jurídica.',campos:nombreCampos([['1','Persona física'],['2','Persona jurídica']]),plan:v=>[{s:{ov:['1','2'],max:3},v:v.tipoNombre,espera:true}].concat(v.tipoNombre==='1'?[{t:{i:0},v:v.nombre},{t:{i:1},v:v.apellido1||''},{t:{i:2},v:v.apellido2||''}].filter(x=>x.v):[{t:{i:0},v:v.nombre}])}),
 L('inmuebles','bi-gravamen','Gravámenes e hipotecas','Consulta de Gravámenes e Hipotecas',{url:'paramConsultaGravamen.jspx',desc:'Detalle de un gravamen por sus citas.',campos:[C.tomo,C.asiento,C.consecReq,C.secReq,C.subsec],citas:1,plan:v=>citas(v,['tomo','asiento','consecutivo','secuencia','subsecuencia'])}),
 L('inmuebles','bi-anotaciones','Anotaciones, trámites y marginales','Consulta de Anotaciones, Trámites y Marginales',{url:'paramConsultaAnotacionesTramites.jspx',desc:'Estado de un documento presentado (tomo y asiento).',campos:[C.tomo,C.asiento],citas:1,plan:v=>citas(v,['tomo','asiento'])}),
 L('inmuebles','bi-documento','Documento (diario)','Consulta de Documento',{desc:'Consulta del diario por citas de presentación.',campos:[C.tomo,C.asiento],citas:1,plan:v=>citas(v,['tomo','asiento'])}),
 L('inmuebles','bi-defectos','Diario de defectos','Consulta al Diario de Defectos de Documentos',{desc:'Defectos consignados a un documento.',campos:[C.tomo,C.asiento],citas:1,plan:v=>citas(v,['tomo','asiento'])}),
 L('inmuebles','bi-historia','Historia de la finca','Consulta de Historia de Fincas',{url:'paramConsultaHistoriaFinca.jspx',desc:'Movimientos históricos de la finca.',campos:fincaCampos(),plan:v=>pasosFinca(v)}),
 L('inmuebles','bi-hist-grav','Historia de un gravamen','Historia de Gravámenes',{url:'paramHistoriaGravamenesBI.jspx',desc:'Movimientos históricos de un gravamen.',campos:[C.tomo,C.asiento,C.consecReq,C.secReq,C.subsec],citas:1,plan:v=>citas(v,['tomo','asiento','consecutivo','secuencia','subsecuencia'],{tomo:'tomo',asiento:'asiento',consecutivo:'consec',secuencia:'secuencia',subsecuencia:'subSecuencia'})}),
 L('inmuebles','bi-valores','Valores de la finca','Valores de Finca',{url:'paramConsultaValorFinca.jspx',desc:'Valores fiscales registrados.',campos:fincaCampos(false),plan:v=>pasosFinca(v,false)}),
 L('inmuebles','bi-finca-tomos','Finca en tomos','Consulta por Número de Finca en Tomos',{url:'paramConsultaFincaTomos.jspx',desc:'Fincas aún inscritas en el sistema de tomos.',campos:fincaCampos(),plan:v=>pasosFinca(v)}),
 L('inmuebles','bi-condominio','Condominios','Consulta de Condominios',{url:'paramConsultaCondominio.jspx',desc:'Busca un condominio por su nombre.',campos:[C.nombre],plan:v=>[{t:{i:0},v:v.nombre}]}),
 L('inmuebles','bi-primeras','Libro de primeras presentaciones','Consulta Libro de Primeras Presentaciones',{desc:'Documentos presentados a nombre de una persona.',campos:[{t:'sel',k:'tipoNombre',l:'Tipo',req:1,ops:[['1','Nombre jurídico'],['2','Nombre físico']]},C.nombre],plan:v=>[{s:{ov:['1','2'],max:2},v:v.tipoNombre},{t:{i:0},v:v.nombre}]}),
 L('inmuebles','bi-posesoria','Información posesoria','Información Posesoria y Titulación de Vivienda Campesina',{desc:'Informaciones posesorias por identificación.',campos:idCampos(ID_BI.filter(x=>x[0]!=='2')),plan:v=>pasosId({ov:['1','7','9']},v,false)}),
 // Vehículos y otros bienes muebles
 L('muebles','bm-vehiculo','Vehículo','Consulta de Vehículo',{url:'paramConsultaVehiculo.jspx',desc:'Características, propietario, gravámenes, anotaciones e infracciones.',campos:vehCampos,plan:v=>v.por==='PLA'?pasosPlaca(v,{s:{ov:['PLA','VIN']},v:'PLA',espera:true}):[{s:{ov:['PLA','VIN']},v:v.por,espera:true},{t:{i:0},v:v.valor}],principal:1}),
 L('muebles','bm-persona-id','Vehículos y muebles de una persona','Consulta de Personas por Identificación',{nth:1,url:'bienesMuebles/paramConsultaPersona.jspx',desc:'Bienes muebles inscritos a nombre de una cédula.',campos:idCampos(ID_BM),plan:v=>pasosId({ov:['000001','000003']},v,true),principal:1}),
 L('muebles','bm-persona-nombre','Muebles por nombre','Consulta de Personas por Nombre',{nth:1,url:'bienesMuebles/paramConsultaPersonaName.jspx',desc:'Bienes muebles por nombre de la persona.',campos:nombreCampos([['NOMBRE','Persona física'],['NOMBREPJ','Persona jurídica']]),plan:v=>[{s:{ov:['NOMBRE','NOMBREPJ']},v:v.tipoNombre,espera:true}].concat(v.tipoNombre==='NOMBRE'?[{t:{ne:'nombreInput'},v:v.nombre},{t:{ne:'primerApellidoInput'},v:v.apellido1||''},{t:{ne:'segundoApellidoInput'},v:v.apellido2||''}].filter(x=>x.v):[{t:{ne:'nombreJuridicoInput'},v:v.nombre}])}),
 L('muebles','bm-grav-bien','Gravámenes de un vehículo','Gravámen de un Bien Mueble',{url:'bienesMuebles/paramConsultaGravamenBienMueble.jspx',desc:'Prendas y gravámenes que pesan sobre un vehículo.',campos:placaCampos,plan:v=>pasosPlaca(v,{s:{ov:['000001','000005']},v:'000001',espera:true})}),
 L('muebles','bm-historia','Historia del vehículo','Historia de Bienes',{url:'bienesMuebles/paramConsultaHistoriaBien.jspx',desc:'Movimientos históricos del vehículo.',campos:placaCampos,plan:v=>pasosPlaca(v,{s:{ov:['000001','000002']},v:'000001',espera:true})}),
 L('muebles','bm-gravamenes','Gravamen por citas','Consulta de Gravámenes',{desc:'Detalle de un gravamen mobiliario por sus citas.',campos:[C.tomo,C.asiento,C.secReq],citas:1,plan:v=>citas(v,['tomo','asiento','secuencia'])}),
 L('muebles','bm-grav-grav','Gravámenes de un gravamen','Gravámenes de un Gravámen',{url:'bienesMuebles/paramConsultaGravamenDeGravamen.jspx',desc:'Gravámenes que pesan sobre otro gravamen.',campos:[C.tomo,C.asiento,C.secReq],citas:1,plan:v=>citas(v,['tomo','asiento','secuencia'])}),
 L('muebles','bm-hist-grav','Historia de un gravamen mobiliario','Historia de Gravámenes',{nth:1,url:'bienesMuebles/paramConsultaHistoriaGravamenes.jspx',desc:'Movimientos de un gravamen mobiliario.',campos:[C.tomo,C.asiento,C.secReq],citas:1,plan:v=>citas(v,['tomo','asiento','secuencia'])}),
 L('muebles','bm-citas','Documento por citas','Consulta por Citas de Presentación',{url:'paramConsultaPresentacion.jspx',desc:'Estado de un documento de bienes muebles.',campos:[C.tomo,C.asiento],citas:1,plan:v=>citas(v,['tomo','asiento'])}),
 L('muebles','bm-hist-pres','Historia de presentaciones','Historia de Presentaciones',{url:'bienesMuebles/paramConsultaHistoriaPresentaciones.jspx',desc:'Historia de un documento presentado.',campos:[C.tomo,C.asiento],citas:1,plan:v=>citas(v,['tomo','asiento'])}),
 L('muebles','bm-indice','Índice de personas (gravámenes)','Indice de Personas (gravámenes)',{desc:'Gravámenes mobiliarios donde figura una persona.',campos:idCampos(ID_BM),plan:v=>pasosId({ov:['000001','000003']},v,true)}),
 L('muebles','bm-poliza','Póliza de importación','Consulta de Pólizas',{url:'bienesMuebles/paramConsultaPoliza.jspx',desc:'Vehículo por número de chasis, motor, VIN o serie (vía póliza).',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['CHA','Chasis'],['MOT','Motor'],['VIN','VIN'],['SER','Serie']]},{t:'txt',k:'valor',l:'Número',req:1,max:20}],plan:v=>[{s:{ov:['POL','CHA']},v:v.por,espera:true},{t:{i:0},v:v.valor}]}),
 L('muebles','bm-aeronave','Aeronaves','Consulta de Aeronaves',{url:'bienesMuebles/paramConsultaAeronaves.jspx',desc:'Aeronave por matrícula o número de serie.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['PLA','Matrícula'],['SER','Número de serie']]},{t:'txt',k:'valor',l:'Número',req:1,max:20}],plan:v=>[{s:{ov:['SER','PLA']},v:v.por,espera:true},{t:{i:0},v:v.valor}]}),
 L('muebles','bm-buque','Buques','Consulta de Buques',{url:'bienesMuebles/paramConsultaBuque.jspx',desc:'Embarcación por nombre, casco, motor o serie.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['NOM','Nombre'],['CHA','Número de casco'],['MOT','Número de motor'],['SER','Número de serie']]},{t:'txt',k:'valor',l:'Dato',req:1,max:40}],plan:v=>[{s:{ov:['MAT','NOM']},v:v.por,espera:true},{t:{i:0},v:v.valor}]}),
 // Catastro
 L('catastro','cat-plano','Plano catastrado','Consulta de Plano',{url:'paramConsultaCatastro.jspx',desc:'Área, ubicación, titulares, fincas relacionadas y anotaciones del plano.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['P','Número de plano'],['F','Número de finca']]},{t:'txt',k:'plano',l:'Número de plano',req:1,ph:'H-959238-1991',fmt:'plano',solo:{por:'P'}}].concat(fincaCampos().map(c=>Object.assign({},c,{solo:{por:'F'}}))),
  plan:v=>{if(v.por==='F')return [{s:{ov:['P','F']},v:'F',espera:true}].concat(pasosFinca(v));const p=leerPlano(v.plano);if(!p)err('plano','Plano no reconocido. Ejemplo: H-959238-1991 (provincia, número y año).');return [{s:{ov:['P','F']},v:'P',espera:true},{s:SEL_PROV,v:p.provincia},{t:{i:0},v:p.numero},{t:{i:1},v:p.anio}]},principal:1}),
 // Personas jurídicas
 L('sociedades','pj-cedula','Sociedad por cédula jurídica','Consulta por Cédula Jurídica',{url:'paramConsultaJuridicaCedula.jspx',desc:'Nombre exacto y estado actual de la entidad.',campos:[C.cedJur],plan:v=>{const c=leerCedJur(v.cedula);return [{t:{ne:':tipo'},v:c.tipo},{t:{ne:':clase'},v:c.clase},{t:{ne:':consecutivo'},v:c.consecutivo}]},principal:1}),
 L('sociedades','pj-nombre','Sociedad por nombre','Consulta por Nombre Social',{desc:'Busca sociedades por su nombre o parte de él.',campos:[C.nombre],plan:v=>[{t:{i:0},v:v.nombre}],principal:1}),
 L('sociedades','pj-movimientos','Movimientos históricos','Consulta de Movimientos Históricos de Sociedades',{url:'paramConsultaHistoriaMovimientos.jspx',desc:'Historia de inscripciones de la sociedad.',campos:[C.cedJur],plan:v=>{const c=leerCedJur(v.cedula);return [{t:{ne:':tipo'},v:c.tipo},{t:{ne:':clase'},v:c.clase},{t:{ne:':consecutivo'},v:c.consecutivo}]}}),
 L('sociedades','pj-impuesto','Impuesto a personas jurídicas','Consulta al Impuesto de Personas Jurídicas',{url:'consultaMorosidadPJInterna.jspx',desc:'Morosidad del impuesto (Leyes 9024 y 9428).',campos:[C.cedJur],plan:v=>{const c=leerCedJur(v.cedula);return [{t:{ne:':tipo'},v:c.tipo},{t:{ne:':clase'},v:c.clase},{t:{ne:':consecutivo'},v:c.consecutivo}]}}),
 L('sociedades','pj-citas','Documento por citas','Consulta de Documentos por Citas de Presentación',{url:'paramConsultaJuridicaDocumento.jspx',desc:'Trámite, estado y defectos de un documento.',campos:[C.tomo,C.asiento,C.consec],citas:1,plan:v=>citas(v,['tomo','asiento','consecutivo'])}),
 L('sociedades','pj-primeras','Libro de primeras presentaciones','Consulta Libro de Primeras Presentaciones',{nth:1,desc:'Documentos presentados a nombre de una persona.',campos:[{t:'sel',k:'tipoNombre',l:'Tipo',req:1,ops:[['1','Nombre jurídico'],['2','Nombre físico']]},C.nombre],plan:v=>[{s:{ov:['1','2'],max:2},v:v.tipoNombre},{t:{i:0},v:v.nombre}]}),
 // Propiedad industrial
 L('industrial','pi-marcas','Marcas y signos distintivos','Consulta de Marcas',{desc:'Por denominación del signo o por titular.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['MAR','Denominación del signo'],['TIT','Nombre del titular']]},{t:'txt',k:'valor',l:'Texto a buscar',req:1,max:60}],plan:v=>[{s:{ov:['MAR','TIT']},v:v.por},{t:{i:0},v:v.valor}],principal:1}),
 L('industrial','pi-crono','Cronología de una marca','Consulta de Cronología',{desc:'Movimientos de un expediente de marca.',campos:[{t:'txt',k:'serie',l:'Serie del expediente',req:1,max:4,dig:1,ph:'2024'},{t:'txt',k:'numero',l:'Número de expediente',req:1,max:10,dig:1}],plan:v=>[{t:{ne:':tomo'},v:v.serie},{t:{ne:':asiento'},v:v.numero}]}),
 L('industrial','pi-crono-pat','Cronología de patentes','Consulta de Cronología de Patentes',{desc:'Movimientos de una solicitud de patente.',campos:[{t:'txt',k:'serie',l:'Serie de la solicitud',req:1,max:4,dig:1},{t:'txt',k:'numero',l:'Número de la solicitud',req:1,max:10,dig:1}],plan:v=>[{t:{i:0},v:v.serie},{t:{i:1},v:v.numero}]}),
 L('industrial','pi-patentes','Patentes por titular','Consulta de Patentes por Nombre del Titular',{desc:'Patentes, modelos industriales y de utilidad.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['NOM','Nombre del titular'],['TIT','Título de la solicitud']]},{t:'txt',k:'valor',l:'Texto a buscar',req:1,max:60}],plan:v=>[{s:{ov:['NOM','TIT']},v:v.por},{t:{i:0},v:v.valor}]}),
];
const SECCIONES=[['inmuebles','Propiedades','Bienes Inmuebles'],['muebles','Vehículos y muebles','Bienes Muebles'],['catastro','Planos','Catastro'],['sociedades','Sociedades','Personas Jurídicas'],['industrial','Marcas y patentes','Propiedad Industrial']];
const porId=Object.fromEntries(CONSULTAS.map(c=>[c.id,c]));

const visible=(c,v)=>!c.solo||Object.entries(c.solo).every(([k,x])=>[].concat(x).includes(v[k]));
/** Valida y normaliza los datos del formulario. Devuelve {valores, pasos, resumen} o lanza ErrorDato. */
function preparar(id,datos){
 const c=porId[id];if(!c)err('','Consulta desconocida.');
 const v={};for(const f of c.campos)v[f.k]=solo(datos[f.k]);
 for(const f of c.campos){if(!visible(f,v)){v[f.k]='';continue}
  if(f.req&&!v[f.k])err(f.k,'Falta: '+f.l.toLowerCase()+'.');
  if(f.dig&&v[f.k]&&!/^\d+$/.test(v[f.k]))err(f.k,f.l+': solo números.');
  if(f.max&&v[f.k].length>f.max)err(f.k,f.l+': máximo '+f.max+' caracteres.');
  if(f.t==='sel'&&v[f.k]&&!f.ops.some(o=>o[0]===v[f.k]))err(f.k,f.l+': opción no válida.');
  if(f.fmt==='cedJur'&&v[f.k]&&!leerCedJur(v[f.k]))err(f.k,'La cédula jurídica debe tener 10 dígitos, por ejemplo 3-101-123456.');
  if(f.fmt==='placa'&&v[f.k]&&!leerPlaca(v[f.k]))err(f.k,'Placa no reconocida. Ejemplos: BKN-216, 123456, CL-123456.');
  if(f.fmt==='plano'&&v[f.k]&&!leerPlano(v[f.k]))err(f.k,'Plano no reconocido. Ejemplo: H-959238-1991.');}
 if(v.derecho)v.derecho=pad(v.derecho,3);
 const pasos=c.plan(v);
 return {consulta:c.id,valores:v,pasos,resumen:resumir(c,v)};
}
function resumir(c,v){
 const f=v.numero&&v.provincia&&c.campos.some(x=>x.k==='provincia')&&(v.por!=='P')?[v.provincia,v.numero,v.duplicado,v.horizontal,v.derecho].filter(Boolean).join('-'):'';
 const partes=[f,v.placa&&v.placa.toUpperCase(),v.plano&&v.plano.toUpperCase(),v.cedula,v.id,v.valor,[v.nombre,v.apellido1,v.apellido2].filter(Boolean).join(' '),v.tomo&&('citas '+[v.tomo,v.asiento,v.consecutivo,v.secuencia,v.subsecuencia].filter(Boolean).join('-')),v.serie&&(v.serie+'-'+v.numero)].filter(Boolean);
 return c.nombre+(partes.length?': '+partes[0]:'');
}
/** Reconoce lo que alguien pega en el buscador rápido y propone la consulta que corresponde. */
function reconocer(txt){
 const t=solo(txt);if(!t)return null;const u=t.toUpperCase();
 const pl=leerPlano(u);if(pl&&/^(SJ|[ACHGPL])-/.test(u.replace(/\s/g,'-')))return {consulta:'cat-plano',datos:{por:'P',plano:u}};
 const cj=dig(t);if(/^[2-5]\D?\d{3}\D?\d{6}$/.test(t.replace(/\s/g,''))&&cj.length===10)return {consulta:'pj-cedula',datos:{cedula:t}};
 if(/^\d\D\d{1,4}\D\d{1,4}$/.test(t)||(/^\d{9}$/.test(t)&&/^[1-9]/.test(t)))return {consulta:'bi-persona-id',datos:{tipoId:'1',id:t}};
 const fi=leerFinca(u);if(fi&&/[- ]/.test(t)&&fi.numero.length>=3)return {consulta:'bi-finca',datos:fi};
 if(pl)return {consulta:'cat-plano',datos:{por:'P',plano:u}};
 const pa=leerPlaca(u);if(pa&&/[A-Z]/.test(u)&&/\d/.test(u)&&u.replace(/[^A-Z0-9]/g,'').length<=9)return {consulta:'bm-vehiculo',datos:{por:'PLA',placa:u}};
 if(/^[A-ZÁÉÍÓÚÑ&.,\s]{3,}$/i.test(t)&&/\b(S\.?\s?A\.?|SOCIEDAD|LIMITADA|S\.?R\.?L|ASOCIACI[OÓ]N|FUNDACI[OÓ]N)\b/i.test(t))return {consulta:'pj-nombre',datos:{nombre:t}};
 return null;
}
const api={PROV,CLASES,CONSULTAS,SECCIONES,porId,preparar,resumir,reconocer,visible,leerFinca,leerCedJur,leerCedFis,leerPlaca,leerPlano,leerCitas,ErrorDato,
 LIMITE:{maximo:8,ventanaMs:120000,delRegistro:10},
 BASE:'https://www.rnpdigital.com/shopping/',INDICE:'consultaDocumentos/indiceDocumentos.jspx',LOGIN:'login.jspx'};
globalThis.RegistroCatalogo=api;
})();
