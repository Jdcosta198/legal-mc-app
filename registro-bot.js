/* Generado por scripts/build-bot.mjs a partir de registro-catalogo.js, registro-pdf.js, registro/bot.js. No editar a mano. */
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
 L('inmuebles','bi-catastral','Zona catastrada (antes del certificado catastral)','Certificado Catastral',{url:'paramConsultaCertificadoInmobiliario.jspx',desc:'Confirma si la finca está en zona catastrada y se le puede emitir el certificado catastral. Gratis.',campos:fincaCampos(false),plan:v=>pasosFinca(v,false)}),
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
 L('muebles','bm-titulo-verif','Verificar título de propiedad digital','Título de Propiedad',{desc:'Comprueba un título de propiedad de bien mueble emitido digitalmente (desde julio de 2023) con su número de verificación.',campos:[{t:'txt',k:'codigo',l:'Número de verificación',req:1,max:40}],plan:v=>[{t:{ne:'codigoV'},v:solo(v.codigo)}]}),
 L('muebles','bm-salidas','Salida del país de un vehículo','Consulta Salidas del País',{desc:'Verifica una tarjeta de circulación para salida del país.',campos:[{t:'txt',k:'anio',l:'Año del certificado',req:1,max:4,dig:1,ph:'2026'},{t:'txt',k:'consecutivo',l:'Consecutivo',req:1,max:10,dig:1}].concat(placaCampos),plan:v=>{const p=leerPlaca(v.placa);if(!p)err('placa','Placa no reconocida. Ejemplos: BKN-216, CL-123456.');return [{t:{i:0},v:v.anio},{t:{i:1},v:v.consecutivo},{s:{n:'class'},v:p.clase,espera:true},{t:{i:2},v:p.numero}]}}),
 L('sociedades','pj-ley9428','Exoneración Transitorio III Ley 9428','Transitorio III Ley 9428',{url:'consultaLey9428.jspx',desc:'Si la sociedad está exonerada del impuesto a las personas jurídicas.',campos:[C.cedJur],plan:v=>{const c=leerCedJur(v.cedula);if(!c)err('cedula','La cédula jurídica debe tener 10 dígitos, por ejemplo 3-101-123456.');return [{t:{ne:':tipo'},v:c.tipo},{t:{ne:':clase'},v:c.clase},{t:{ne:':consecutivo'},v:c.consecutivo}]}}),
 L('personas','idx-fisica','Índice de personas físicas (búsqueda)','Índice Personas Físicas',{desc:'Busca a una persona en el índice de propiedades, muebles, planos o sociedades. Gratis; la certificación se compra aparte.',campos:[{t:'sel',k:'registro',l:'Registro',req:1,ops:[['2','Bienes inmuebles'],['3','Bienes muebles'],['4','Catastro'],['1','Personas jurídicas']]},{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['000001','Cédula de identidad'],['N','Nombre']]},{t:'txt',k:'id',l:'Cédula',ph:'4-0201-0838',req:1,solo:{por:'000001'}},{t:'txt',k:'nombre',l:'Nombre',req:1,max:40,solo:{por:'N'}},{t:'txt',k:'apellido1',l:'Primer apellido',max:21,solo:{por:'N'}},{t:'txt',k:'apellido2',l:'Segundo apellido',max:21,solo:{por:'N'}}],plan:v=>{const p=[{s:{ov:['2','3','4','1'],max:4},v:v.registro},{s:{ov:['N','000001']},v:v.por,espera:true}];if(v.por==='N')return p.concat([{t:{i:0},v:v.nombre}],v.apellido1?[{t:{i:1},v:v.apellido1}]:[],v.apellido2?[{t:{i:2},v:v.apellido2}]:[]);const c=leerCedFis(v.id);if(!c)err('id','La cédula de identidad debe tener 9 dígitos, por ejemplo 4-0201-0838.');return p.concat([{t:{ne:'cedula1'},v:c.p1},{t:{ne:'cedula2'},v:c.p2},{t:{ne:'cedula3'},v:c.p3}])}}),
 L('personas','idx-juridica','Índice de personas jurídicas (búsqueda)','Índice de Personas Jurídicas',{desc:'Busca una sociedad por nombre o cédula en el índice del registro elegido. Gratis.',campos:[{t:'sel',k:'registro',l:'Registro',req:1,ops:[['2','Bienes inmuebles'],['3','Bienes muebles'],['4','Catastro'],['1','Personas jurídicas']]},{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['N','Razón social'],['I','Cédula jurídica']]},{t:'txt',k:'valor',l:'Razón social o cédula',req:1,max:60}],plan:v=>{const p=[{s:{ov:['2','3','4','1'],max:4},v:v.registro},{s:{ov:['N','I'],max:2},v:v.por,espera:true}];if(v.por==='I'){const c=leerCedJur(v.valor);if(!c)err('valor','La cédula jurídica debe tener 10 dígitos.');return p.concat([{t:{i:0},v:c.tipo},{t:{i:1},v:c.clase},{t:{i:2},v:c.consecutivo}])}return p.concat([{t:{i:0},v:v.valor}])}}),
 // Propiedad industrial
 L('industrial','pi-marcas','Marcas y signos distintivos','Consulta de Marcas',{desc:'Por denominación del signo o por titular.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['MAR','Denominación del signo'],['TIT','Nombre del titular']]},{t:'txt',k:'valor',l:'Texto a buscar',req:1,max:60}],plan:v=>[{s:{ov:['MAR','TIT']},v:v.por},{t:{i:0},v:v.valor}],principal:1}),
 L('industrial','pi-crono','Cronología de una marca','Consulta de Cronología',{desc:'Movimientos de un expediente de marca.',campos:[{t:'txt',k:'serie',l:'Serie del expediente',req:1,max:4,dig:1,ph:'2024'},{t:'txt',k:'numero',l:'Número de expediente',req:1,max:10,dig:1}],plan:v=>[{t:{ne:':tomo'},v:v.serie},{t:{ne:':asiento'},v:v.numero}]}),
 L('industrial','pi-crono-pat','Cronología de patentes','Consulta de Cronología de Patentes',{desc:'Movimientos de una solicitud de patente.',campos:[{t:'txt',k:'serie',l:'Serie de la solicitud',req:1,max:4,dig:1},{t:'txt',k:'numero',l:'Número de la solicitud',req:1,max:10,dig:1}],plan:v=>[{t:{i:0},v:v.serie},{t:{i:1},v:v.numero}]}),
 L('industrial','pi-patentes','Patentes por titular','Consulta de Patentes por Nombre del Titular',{desc:'Patentes, modelos industriales y de utilidad.',campos:[{t:'sel',k:'por',l:'Buscar por',req:1,ops:[['NOM','Nombre del titular'],['TIT','Título de la solicitud']]},{t:'txt',k:'valor',l:'Texto a buscar',req:1,max:60}],plan:v=>[{s:{ov:['NOM','TIT']},v:v.por},{t:{i:0},v:v.valor}]}),
];
const SECCIONES=[['inmuebles','Propiedades','Bienes Inmuebles'],['muebles','Vehículos y muebles','Bienes Muebles'],['catastro','Planos','Catastro'],['sociedades','Sociedades','Personas Jurídicas'],['personas','Índices de personas','Índices'],['industrial','Marcas y patentes','Propiedad Industrial']];
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

;
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

;
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
 for(const c of cands){const t=norm(c.alt||c.value||c.innerText);if(t==='consultar'||t==='buscar'){const el=c.tagName==='IMG'?(c.closest('a')||c):c;if(el.closest('#lmc-barra-host'))continue;return el}}return null}
const formulario=()=>{const b=botonConsultar();return b&&b.closest('form')};
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
   for(let k=0;k<40&&!botonConsultar();k++)await sleep(200);
   const primero=trabajo.pasos&&trabajo.pasos[0],hay=primero&&hallar(primero.s||primero.t,primero.s?'s':'t');
   if(!botonConsultar()||(primero&&!hay&&!primero.espera&&!primero.s)){
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
