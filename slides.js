// Each scene uses its own line illustration, drawn locally at display resolution.
function paint(canvas, scene) {
  const size = canvas.clientWidth;
  if (!size) return;
  canvas.width = canvas.height = Math.ceil(size * Math.min(devicePixelRatio, 2));
  const g = canvas.getContext('2d');
  g.scale(canvas.width / 400, canvas.height / 400);
  const glow = g.createRadialGradient(195,190,3,200,200,195);
  glow.addColorStop(0,'#ca85893b'); glow.addColorStop(1,'#ca858900');
  g.fillStyle=glow; g.fillRect(0,0,400,400);
  function trace(points,alpha=.6,width=1) {
    g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
    g.strokeStyle='rgba(255,201,180,'+alpha+')';g.lineWidth=width;g.stroke();
  }
  const curve=(fn,count=220)=>Array.from({length:count+1},(_,j)=>fn(j/count));
  if ([0,2,5].includes(scene)) {
    const groups=scene===2?5:1;
    for(let k=0;k<groups;k++)for(let j=0;j<(groups===1?75:13);j++){
      let phase=j/(groups===1?75:13);
      trace(curve(t=>{let envelope=Math.sin(Math.PI*t)**1.45;
        let swing=scene===5?Math.abs(2*t-1)*1.8:1;
        return [15+370*t,200+(k-(groups-1)/2)*44+envelope*(groups===1?110:26)*swing*Math.sin(t*7+phase*4+k)+14*envelope*phase];}),.24+.23*phase);
    }
  } else if(scene===1){
    for(let side of [-1,1])for(let j=0;j<40;j++){
      trace(curve(t=>[200+side*(145*t),140+j*2.6-30*Math.sin(t*Math.PI*.85)-10*t]),j%5===0?.8:.32);
    }
    trace([[200,144],[200,251]],.85,2);
  } else if(scene===3){
    for(let side of [-1,1])for(let j=0;j<38;j++){
      trace(curve(t=>[192+(j-17)*.65+side*(132*t*t)+10*Math.sin(t*5),345-t*275+(j-17)*t*.8]),.4);
    }
  } else if(scene===4 ||scene===7){
    for(let j=0;j<27;j++) {
      const r=5+j*6.7;
      trace(curve(t=>[200+r*Math.cos(t*2*Math.PI), (scene===4?225:275)+r*.35*Math.sin(t*2*Math.PI)]),.78-j*.023);
    }
    if(scene===7) for(let j=0;j<50;j++){
      const y=215-j*1.65,w=Math.sqrt(Math.max(0,85*85-(y-215)**2));
      trace([[200-w,y],[200+w,y]],.55);
    }
  } else {
    trace(curve(t=>[145+100*t,344-279*t]),.85,2);
    for(let n=0;n<8;n++){
      const t=n/9,side=n%2?1:-1,x=145+100*t,y=344-279*t;
      for(let j=0;j<18;j++)trace(curve(s=>[x+side*(53*s+Math.sin(s*Math.PI)*j*.8),y-62*s+Math.sin(s*Math.PI)*(j-9)*1.5]),.45);
    }
  }
}
const slides=Array.from(document.querySelectorAll('.slide'));
const dots=document.querySelector('.dots');
let active=0;
slides.forEach((slide,index)=>{
  const dot=document.createElement('button');
  dot.setAttribute('aria-label','Slide '+(index+1)+', '+slide.querySelector('h1').textContent);
  dot.addEventListener('click',()=>show(index));dots.append(dot);
});
function show(index){
  active=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>{
    slide.hidden=i!==active;
    dots.children[i].setAttribute('aria-current',String(i===active));
  });
  document.querySelector('#count').textContent='Slide '+(active+1)+' of '+slides.length;
  document.querySelector('.progress i').style.width=((active+1)/slides.length)*100+'%';
  document.querySelector('#prev').disabled=active===0;
  document.querySelector('#next').textContent=active===slides.length-1?'Restart':'Next';
  paint(slides[active].querySelector('canvas'),active);
  window.scrollTo(0,0);
}
document.querySelector('#prev').onclick=()=>show(active-1);
document.querySelector('#next').onclick=()=>show(active===slides.length-1?0:active+1);
document.addEventListener('keydown',e=>{
  if(e.altKey||e.metaKey||e.ctrlKey)return;
  const steps={ArrowRight:active+1,ArrowLeft:active-1,Home:0,End:slides.length-1};
  if(Object.hasOwn(steps,e.key)){e.preventDefault();show(steps[e.key]);}
});
const full=document.querySelector('#full');
if(!document.fullscreenEnabled) full.hidden=true;
full.onclick=async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch{document.querySelector('#count').textContent='Full screen unavailable in this window.';}
};
document.addEventListener('fullscreenchange',()=>full.textContent=document.fullscreenElement?'Exit full screen':'Full screen');
new ResizeObserver(()=>paint(slides[active].querySelector('canvas'),active)).observe(document.querySelector('main'));
show(0);
