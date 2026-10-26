/* Legal Martínez & Cortés · "Imagen viva"
   Da movimiento real a la Dama de la Justicia con WebGL, sin videos pesados:
   · la niebla turquesa fluye detrás de la escultura
   · la balanza se mece sobre su eje
   · el manto ondea levemente y los dorados destellan
   · una luz recorre el mármol y suben partículas doradas
   · la imagen responde al movimiento del ratón o a la inclinación del teléfono
   Respeta "reducir movimiento", se detiene fuera de pantalla y con la app en segundo plano.
   Si el equipo no soporta WebGL, queda la imagen original (no se rompe nada). */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const VERT='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
const FRAG=`precision mediump float;
varying vec2 v;uniform sampler2D img;uniform float t;uniform vec2 res;uniform vec2 imgSize;uniform vec2 focus;uniform vec2 tilt;uniform float intensity;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
vec2 rot(vec2 q,float a){float c=cos(a),s=sin(a);return vec2(c*q.x-s*q.y,s*q.x+c*q.y);}
void main(){
 /* object-fit:cover con punto focal, más un 6 % de margen para el paralaje */
 float ra=res.x/res.y,ia=imgSize.x/imgSize.y;vec2 sc=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);sc/=1.06;
 vec2 uv=(v-.5)*sc+.5;uv+=(focus-.5)*(1.-sc);uv+=tilt*.018;
 vec4 base=texture2D(img,uv);float lum=dot(base.rgb,vec3(.299,.587,.114));
 float marble=smoothstep(.30,.52,lum)*(1.-smoothstep(.18,.32,base.r-base.b));
 float bg=1.-smoothstep(.22,.42,lum);
 /* balanza: rotación pendular alrededor del puño */
 vec2 px=uv*imgSize/imgSize.y;vec2 pivot=vec2(.852,.06)*imgSize/imgSize.y;
 vec2 ell=(uv-vec2(.865,.29))/vec2(.13,.23);float wS=1.-smoothstep(.7,1.,length(ell));
 float ang=(.011*sin(t*.85)+.004*sin(t*1.9+1.3))*wS*intensity;
 vec2 sw=(rot(px-pivot,-ang)+pivot)*imgSize.y/imgSize;
 /* manto: ondulación suave en la cola del vestido */
 float wC=smoothstep(.62,.78,uv.x)*smoothstep(.55,.75,uv.y)*marble;
 vec2 cloth=vec2(n(uv*9.+t*.35)-.5,n(uv*7.-t*.3)-.5)*.0045*wC*intensity;
 /* niebla: el fondo fluye (solo donde no hay escultura) */
 vec2 flow=vec2(fbm(uv*3.+vec2(t*.035,0.))-.5,fbm(uv*3.+vec2(0.,t*.025)+7.)-.5)*.014*bg*intensity;
 vec2 suv=mix(uv,sw,wS)+cloth+flow;
 vec3 c=texture2D(img,suv).rgb;
 /* velo de niebla turquesa en movimiento */
 float mist=fbm(vec2(uv.x*2.2-t*.045,uv.y*3.1+sin(t*.07)*.4));mist=smoothstep(.45,.85,mist);
 c+=vec3(.10,.30,.33)*mist*bg*.55*intensity;
 /* destellos de oro (bokeh y metal) */
 float gold=smoothstep(.12,.30,c.r-c.b)*smoothstep(.38,.62,dot(c,vec3(.33)));
 float tw=pow(n(uv*48.+vec2(t*.9,-t*.6)),6.)*2.4+.25*sin(t*2.+uv.x*40.);
 c+=c*gold*max(tw,0.)*.55*intensity;
 /* barrido de luz sobre el mármol */
 float band=exp(-pow((uv.x*.85+uv.y*.45-mod(t*.045,2.4)+.5)/.07,2.));
 c+=vec3(1.,.93,.80)*band*marble*.10*intensity;
 /* respiración de la luz ambiente */
 c*=1.+.035*sin(t*.5)*intensity;
 gl_FragColor=vec4(c,1.);}`;

function makeGL(canvas){const gl=canvas.getContext('webgl',{premultipliedAlpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return null;
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VERT));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error('link');gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const u={};for(const k of ['img','t','res','imgSize','focus','tilt','intensity'])u[k]=gl.getUniformLocation(pr,k);return{gl,u}}

class Particles{constructor(canvas,count){this.c=canvas;this.x=canvas.getContext('2d');this.p=Array.from({length:count},()=>this.spawn(true))}
 spawn(any){return{x:Math.random(),y:any?Math.random():1.05,r:.6+Math.random()*1.8,s:.006+Math.random()*.018,ph:Math.random()*6.28,d:.4+Math.random()*1.2}}
 draw(t,dt,tilt,w,h){const x=this.x;x.clearRect(0,0,w,h);x.globalCompositeOperation='lighter';
  for(const q of this.p){q.y-=q.s*dt;q.x+=Math.sin(t*.6+q.ph)*.0004*dt*60/60;if(q.y<-.05)Object.assign(q,this.spawn(false));
   const px=(q.x+tilt[0]*.03*q.d)*w,py=(q.y+tilt[1]*.03*q.d)*h,a=(.35+.45*Math.sin(t*1.7+q.ph))*Math.min(1,(1.05-q.y)*3);if(a<=0)continue;
   const rr=q.r*(w>900?1.4:1)*devicePixelRatio;const g=x.createRadialGradient(px,py,0,px,py,rr*5);g.addColorStop(0,`rgba(255,226,160,${a})`);g.addColorStop(.25,`rgba(233,200,136,${a*.5})`);g.addColorStop(1,'rgba(233,200,136,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rr*5,0,6.283);x.fill()}
  x.globalCompositeOperation='source-over'}}

const pointer=[0,0],target=[0,0];let gyroAsked=false;
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;target[0]=(e.clientX/innerWidth-.5)*2;target[1]=(e.clientY/innerHeight-.5)*2},{passive:true});
function onOrient(e){if(e.gamma==null)return;target[0]=Math.max(-1,Math.min(1,e.gamma/25));target[1]=Math.max(-1,Math.min(1,((e.beta||45)-45)/25))}
function askGyro(){if(gyroAsked)return;gyroAsked=true;const D=window.DeviceOrientationEvent;if(D&&typeof D.requestPermission==='function'){D.requestPermission().then(s=>{if(s==='granted')addEventListener('deviceorientation',onOrient)}).catch(()=>{})}else if(D)addEventListener('deviceorientation',onOrient)}
if(!(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'))askGyro();

const scenes=[];
function paused(){return reduce.matches||document.body.classList.contains('effects-paused')||document.body.classList.contains('work-paused')}
function attach(img){if(img.dataset.living)return;img.dataset.living='1';const host=img.parentElement;
 const cv=document.createElement('canvas'),pc=document.createElement('canvas');cv.className='living-art';pc.className='living-dust';cv.setAttribute('aria-hidden','true');pc.setAttribute('aria-hidden','true');
 let ctx;try{ctx=makeGL(cv)}catch(e){console.warn('Imagen viva no disponible:',e.message);ctx=null}
 if(!ctx){img.dataset.living='off';return}
 const {gl,u}=ctx;const tex=gl.createTexture();
 const start=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  img.insertAdjacentElement('afterend',cv);cv.insertAdjacentElement('afterend',pc);host.classList.add('is-living');
  const s={img,cv,pc,gl,u,visible:true,parts:new Particles(pc,innerWidth<700?26:46),w:0,h:0};scenes.push(s);
  new IntersectionObserver(es=>es.forEach(e=>s.visible=e.isIntersecting),{rootMargin:'80px'}).observe(host);
  host.addEventListener('pointerdown',askGyro,{passive:true});
  if(!running){running=true;requestAnimationFrame(loop)}};
 if(img.complete&&img.naturalWidth)start();else img.addEventListener('load',start,{once:true})}

function focusOf(img){const pos=getComputedStyle(img).objectPosition.split(' ');const f=x=>x==='left'||x==='top'?0:x==='right'||x==='bottom'?1:x==='center'?.5:x.endsWith('%')?parseFloat(x)/100:.5;return[f(pos[0]||'50%'),f(pos[1]||'50%')]}
let running=false,last=0,acc=0;const t0=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.1,(now-last)/1000||0);last=now;
 if(document.hidden)return;
 const mobile=innerWidth<800;acc+=dt;if(mobile&&acc<1/30)return;const step=acc;acc=0;
 pointer[0]+=(target[0]-pointer[0])*Math.min(1,step*3);pointer[1]+=(target[1]-pointer[1])*Math.min(1,step*3);
 const still=paused(),t=(now-t0)/1000;
 for(const s of scenes){if(!s.visible)continue;const r=s.cv.getBoundingClientRect();if(!r.width)continue;
  const dpr=Math.min(devicePixelRatio||1,mobile?1.25:1.5),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
  if(w!==s.w||h!==s.h){s.w=w;s.h=h;s.cv.width=w;s.cv.height=h;s.pc.width=w;s.pc.height=h;s.gl.viewport(0,0,w,h);s.drawn=false}
  if(still&&s.drawn)continue;
  const {gl,u}=s;const f=focusOf(s.img);gl.uniform1i(u.img,0);gl.uniform1f(u.t,still?0:t);gl.uniform2f(u.res,w,h);gl.uniform2f(u.imgSize,s.img.naturalWidth,s.img.naturalHeight);gl.uniform2f(u.focus,f[0],f[1]);gl.uniform2f(u.tilt,still?0:pointer[0],still?0:pointer[1]);gl.uniform1f(u.intensity,still?0:1);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);s.drawn=true;
  if(still)s.pc.getContext('2d').clearRect(0,0,w,h);else s.parts.draw(t,step,pointer,w,h)}}

function scan(){document.querySelectorAll('img[data-living-art]').forEach(attach)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
window.LivingArt={scan,scenes};
})();
