(()=>{'use strict';
const preference=matchMedia('(prefers-reduced-motion: reduce)');let userPaused=false;
try{userPaused=sessionStorage.getItem('legal-motion-paused')==='1';}catch{}
const control=document.createElement('button');control.type='button';control.className='motion-control';
(document.querySelector('.header-actions')||document.querySelector('header')).append(control);
function paused(){return userPaused||preference.matches;}
function sync(){document.body.classList.toggle('effects-paused',paused());control.textContent=preference.matches?'Movimiento reducido':userPaused?'Activar efectos':'Pausar efectos';control.disabled=preference.matches;control.setAttribute('aria-pressed',String(paused()));}
control.onclick=()=>{userPaused=!userPaused;try{sessionStorage.setItem('legal-motion-paused',userPaused?'1':'0');}catch{}sync();};
preference.addEventListener('change',sync);sync();
document.addEventListener('pointerdown',event=>{if(paused()||event.button!==0)return;const target=event.target.closest('button,.pill');if(!target||target.disabled||target===control)return;const bounds=target.getBoundingClientRect();const wave=document.createElement('span');wave.className='tap-wave';wave.setAttribute('aria-hidden','true');wave.style.left=(event.clientX-bounds.left)+'px';wave.style.top=(event.clientY-bounds.top)+'px';target.append(wave);setTimeout(()=>wave.remove(),600);},{passive:true});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');observer.unobserve(e.target);}});},{threshold:.08});document.querySelectorAll('.below,.device-card,.cards>.card,.work-section').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight&&!el.hidden){el.classList.add('will-reveal');observer.observe(el);}});}
document.querySelectorAll('.hero,.workspace-hero').forEach(hero=>{let frame=0;hero.addEventListener('pointermove',event=>{if(paused()||event.pointerType!=='mouse'||frame)return;const x=event.clientX,y=event.clientY;frame=requestAnimationFrame(()=>{frame=0;const b=hero.getBoundingClientRect();hero.style.setProperty('--image-x',((x-b.left)/b.width-.5)*8+'px');hero.style.setProperty('--image-y',((y-b.top)/b.height-.5)*6+'px');});},{passive:true});hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--image-x','0px');hero.style.setProperty('--image-y','0px');});});
})();
