/* ================= procedural textures ================= */
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function speckle(g,w,h,n,lo,hi,smin,smax,alpha){for(let i=0;i<n;i++){const v=lo+Math.random()*(hi-lo)|0;g.fillStyle=`rgba(${v},${v},${v},${alpha||1})`;const s=rand(smin,smax);g.fillRect(Math.random()*w,Math.random()*h,s,s);}}
function crackLines(g,w,h,n,col,wmin,wmax){
  for(let i=0;i<n;i++){g.strokeStyle=col;g.lineWidth=rand(wmin,wmax);g.beginPath();let x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);
    const steps=irand(4,9);for(let k=0;k<steps;k++){x+=rand(-26,26);y+=rand(-26,26);g.lineTo(x,y);if(Math.random()<0.25){g.moveTo(x,y);g.lineTo(x+rand(-14,14),y+rand(-14,14));g.moveTo(x,y);}}g.stroke();}
}
function stainBlobs(g,w,h,n,rgb,amax){for(let i=0;i<n;i++){const x=Math.random()*w,y=Math.random()*h,r=rand(10,60);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${rgb},${rand(0.08,amax)})`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}}
const CAN={};
CAN.asphalt=(()=>{const c=mkCanvas(512,512),g=c.getContext('2d');g.fillStyle='#bdbdbd';g.fillRect(0,0,512,512);
  speckle(g,512,512,16000,120,220,1,2.5);
  for(let i=0;i<10;i++){g.fillStyle=`rgba(${Math.random()<.5?'60,60,60':'230,230,230'},.12)`;g.fillRect(rand(0,480),rand(0,480),rand(40,140),rand(30,110));}
  stainBlobs(g,512,512,14,'20,18,16',0.35);crackLines(g,512,512,30,'rgba(30,30,30,.65)',0.8,2.2);
  for(let i=0;i<4;i++){const x=rand(40,470),y=rand(40,470),r=rand(10,22);g.fillStyle='rgba(25,22,20,.7)';g.beginPath();g.ellipse(x,y,r,r*rand(.6,1),rand(0,3),0,7);g.fill();}
  return c;})();
CAN.concrete=(()=>{const c=mkCanvas(512,512),g=c.getContext('2d');g.fillStyle='#d2cdc4';g.fillRect(0,0,512,512);
  speckle(g,512,512,9000,160,235,1,2.5);stainBlobs(g,512,512,18,'60,50,40',0.25);
  g.strokeStyle='rgba(40,35,30,.45)';g.lineWidth=2;for(let i=0;i<=512;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,512);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(512,i);g.stroke();}
  crackLines(g,512,512,16,'rgba(40,35,30,.5)',0.6,1.6);return c;})();
CAN.sand=(()=>{const c=mkCanvas(512,512),g=c.getContext('2d');g.fillStyle='#e6dccb';g.fillRect(0,0,512,512);
  for(let y=0;y<512;y+=5){g.strokeStyle=`rgba(${Math.random()<.5?'120,95,60':'255,250,235'},${rand(.05,.16)})`;g.lineWidth=rand(1,2.5);g.beginPath();g.moveTo(0,y);for(let x=0;x<=512;x+=16)g.lineTo(x,y+Math.sin(x*0.03+y*0.11)*4+rand(-1,1));g.stroke();}
  speckle(g,512,512,7000,150,250,1,2);stainBlobs(g,512,512,10,'140,110,70',0.15);return c;})();
CAN.dirt=(()=>{const c=mkCanvas(512,512),g=c.getContext('2d');g.fillStyle='#c7b8a2';g.fillRect(0,0,512,512);speckle(g,512,512,12000,110,220,1,3);stainBlobs(g,512,512,22,'70,55,40',0.3);
  for(let i=0;i<500;i++){g.fillStyle=`rgba(${irand(70,110)},${irand(90,130)},${irand(40,60)},.35)`;g.fillRect(rand(0,512),rand(0,512),1.5,rand(3,7));}return c;})();
CAN.grass=(()=>{const c=mkCanvas(256,256),g=c.getContext('2d');g.fillStyle='#b8c49a';g.fillRect(0,0,256,256);for(let i=0;i<4000;i++){g.fillStyle=`rgba(${irand(60,140)},${irand(100,170)},${irand(40,80)},.6)`;g.fillRect(rand(0,256),rand(0,256),1.5,rand(2,6));}stainBlobs(g,256,256,10,'110,90,60',0.35);return c;})();
CAN.blob=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');g.filter='blur(14px)';g.fillStyle='rgba(0,0,0,.9)';g.fillRect(26,26,76,76);g.filter='none';return c;})();
CAN.soft=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.45,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c;})();
CAN.smoke=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');for(let i=0;i<14;i++){const x=rand(34,94),y=rand(34,94),r=rand(18,36);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}return c;})();
CAN.flame=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');const gr=g.createRadialGradient(64,80,4,64,70,60);gr.addColorStop(0,'rgba(255,250,200,1)');gr.addColorStop(0.3,'rgba(255,170,60,.9)');gr.addColorStop(0.7,'rgba(220,60,10,.35)');gr.addColorStop(1,'rgba(120,20,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(64,4);g.quadraticCurveTo(120,70,96,112);g.quadraticCurveTo(64,128,32,112);g.quadraticCurveTo(8,70,64,4);g.fill();return c;})();
CAN.muzzle=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');g.translate(64,64);for(let i=0;i<7;i++){g.rotate(Math.PI*2/7+rand(-.2,.2));const gr=g.createLinearGradient(0,0,0,-60);gr.addColorStop(0,'rgba(255,240,190,1)');gr.addColorStop(1,'rgba(255,140,40,0)');g.fillStyle=gr;g.beginPath();g.moveTo(-7,0);g.lineTo(0,-rand(40,62));g.lineTo(7,0);g.fill();}
  const rg=g.createRadialGradient(0,0,0,0,0,30);rg.addColorStop(0,'rgba(255,255,230,1)');rg.addColorStop(1,'rgba(255,170,60,0)');g.fillStyle=rg;g.fillRect(-32,-32,64,64);return c;})();
CAN.blood=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');g.fillStyle='rgba(90,6,6,.9)';g.beginPath();g.arc(64,64,26,0,7);g.fill();
  for(let i=0;i<16;i++){const a=rand(0,6.28),d=rand(20,52),r=rand(3,10);g.beginPath();g.arc(64+Math.cos(a)*d,64+Math.sin(a)*d,r,0,7);g.fill();}g.fillStyle='rgba(40,0,0,.5)';g.beginPath();g.arc(60,60,14,0,7);g.fill();return c;})();
CAN.grassTuft=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');for(let i=0;i<34;i++){const x=rand(20,108);g.strokeStyle=`rgb(${irand(70,130)},${irand(95,150)},${irand(35,60)})`;g.lineWidth=rand(1.5,3);g.beginPath();g.moveTo(x,128);g.quadraticCurveTo(x+rand(-14,14),rand(50,90),x+rand(-26,26),rand(8,50));g.stroke();}return c;})();
CAN.shutter=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');for(let y=0;y<128;y+=6){g.fillStyle=y%12?'#9a9a96':'#bdbdb8';g.fillRect(0,y,128,6);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y+5,128,1);}
  stainBlobs(g,128,128,8,'140,70,20',0.5);for(let i=0;i<3;i++){g.strokeStyle=pick(['#c0392b','#2a6fb0','#f1c40f','#1a1a1a']);g.lineWidth=3;g.beginPath();g.moveTo(rand(10,60),rand(30,100));for(let k=0;k<4;k++)g.lineTo(rand(10,118),rand(20,110));g.stroke();}
  g.fillStyle='rgba(20,20,20,.5)';g.fillRect(0,118,128,10);return c;})();
CAN.thatch=(()=>{const c=mkCanvas(128,128),g=c.getContext('2d');g.fillStyle='#8a7048';g.fillRect(0,0,128,128);for(let i=0;i<900;i++){g.strokeStyle=`rgba(${irand(60,170)},${irand(50,130)},${irand(20,70)},.7)`;g.lineWidth=1;const x=rand(0,128),y=rand(0,128);g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-3,3),y+rand(6,14));g.stroke();}return c;})();
CAN.ring=(()=>{const c=mkCanvas(256,256),g=c.getContext('2d');const gr=g.createRadialGradient(128,128,40,128,128,128);gr.addColorStop(0,'rgba(255,40,20,0)');gr.addColorStop(0.7,'rgba(255,60,20,.25)');gr.addColorStop(0.93,'rgba(255,80,30,.95)');gr.addColorStop(1,'rgba(255,60,20,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return c;})();
CAN.lane=(()=>{const c=mkCanvas(64,256),g=c.getContext('2d');for(let y=0;y<256;y+=32){g.fillStyle='rgba(255,60,20,.55)';g.beginPath();g.moveTo(8,y+28);g.lineTo(32,y+6);g.lineTo(56,y+28);g.lineTo(46,y+28);g.lineTo(32,y+16);g.lineTo(18,y+28);g.fill();}const gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(255,40,20,.5)');gr.addColorStop(0.15,'rgba(255,40,20,0)');gr.addColorStop(0.85,'rgba(255,40,20,0)');gr.addColorStop(1,'rgba(255,40,20,.5)');g.fillStyle=gr;g.fillRect(0,0,64,256);return c;})();

// Facade tiles: 2 bays x 2 floors per canvas
function facadeCanvas(kind){
  const c=mkCanvas(256,256),g=c.getContext('2d');
  if(kind==='glass'){
    g.fillStyle='#a9bcc6';g.fillRect(0,0,256,256);
    for(let f=0;f<2;f++){const y=f*128;g.fillStyle='#d0d6d8';g.fillRect(0,y+104,256,24);
      for(let b=0;b<8;b++){const x=b*32;const r=Math.random();g.fillStyle=r<0.12?'#0b0f12':r<0.2?'#55707e':'#33505e';g.fillRect(x+2,y+4,28,98);
        const gr=g.createLinearGradient(x,y,x+32,y+100);gr.addColorStop(0,'rgba(220,240,255,.35)');gr.addColorStop(.5,'rgba(220,240,255,0)');g.fillStyle=gr;g.fillRect(x+2,y+4,28,98);
        if(r<0.12){g.strokeStyle='rgba(200,220,230,.6)';g.beginPath();g.moveTo(x+4,y+10);g.lineTo(x+18,y+40);g.lineTo(x+10,y+70);g.stroke();}}}
    stainBlobs(g,256,256,6,'40,30,20',0.25);return c;
  }
  if(kind==='brick'){
    g.fillStyle='#d9a08a';g.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=8)for(let x=(y/8%2)*8;x<256;x+=16){g.fillStyle=`rgb(${irand(170,215)},${irand(85,115)},${irand(65,85)})`;g.fillRect(x,y,15,7);}
    for(let f=0;f<2;f++)for(let b=0;b<2;b++){const x=b*128+34,y=f*128+22;g.fillStyle='#efe6d6';g.fillRect(x-6,y-6,72,92);g.beginPath();g.arc(x+30,y+18,36,Math.PI,0);g.fill();
      g.fillStyle=Math.random()<0.25?'#0a0a0a':'#273038';g.fillRect(x,y+16,60,64);g.beginPath();g.arc(x+30,y+18,30,Math.PI,0);g.fill();g.fillStyle='#efe6d6';g.fillRect(x+28,y-10,4,90);}
    stainBlobs(g,256,256,10,'30,20,10',0.3);return c;
  }
  // residential plaster with grilled windows and sunshade shadows
  g.fillStyle='#f4f1ea';g.fillRect(0,0,256,256);speckle(g,256,256,3500,200,255,1,3);
  for(let i=0;i<22;i++){const x=rand(0,256),w=rand(3,14),y=rand(0,200),h=rand(30,120);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,`rgba(70,58,45,${rand(.12,.3)})`);gr.addColorStop(1,'rgba(70,58,45,0)');g.fillStyle=gr;g.fillRect(x,y,w,h);}
  for(let f=0;f<2;f++)for(let b=0;b<2;b++){
    const x=b*128+28,y=f*128+30,ww=72,wh=62,r=Math.random();
    g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x-10,y-12,ww+20,10);
    g.fillStyle='#5a4c3e';g.fillRect(x-4,y-4,ww+8,wh+8);
    if(r<0.18){g.fillStyle='#070707';g.fillRect(x,y,ww,wh);g.fillStyle='#2b3036';g.beginPath();g.moveTo(x,y);g.lineTo(x+ww*0.4,y);g.lineTo(x,y+wh*0.5);g.fill();}
    else if(r<0.28){g.fillStyle='#8a6a40';g.fillRect(x,y,ww,wh);g.strokeStyle='#5a4428';for(let k=8;k<wh;k+=12){g.beginPath();g.moveTo(x,y+k);g.lineTo(x+ww,y+k+rand(-3,3));g.stroke();}}
    else{g.fillStyle=r<0.6?'#262b30':'#3a4248';g.fillRect(x,y,ww,wh);g.fillStyle='rgba(180,200,210,.15)';g.fillRect(x+4,y+4,ww/2-6,wh-8);
      g.fillStyle='#4b4b48';for(let k=6;k<ww;k+=9)g.fillRect(x+k,y,2,wh);g.fillRect(x,y+wh/2-1,ww,3);}
    g.fillStyle='#d8d2c6';g.fillRect(x-8,y+wh+4,ww+16,5);
    g.fillStyle='rgba(0,0,0,.12)';g.fillRect(b*128,f*128+124,128,4);
  }
  crackLines(g,256,256,6,'rgba(60,50,40,.45)',0.6,1.4);
  if(Math.random()<0.5){const x=rand(40,200),y=rand(40,200),r=rand(40,80);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(15,10,5,.6)');gr.addColorStop(1,'rgba(15,10,5,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}
  return c;
}
const FACADE_CAN={res:[facadeCanvas('res'),facadeCanvas('res'),facadeCanvas('res')],brick:[facadeCanvas('brick')],glass:[facadeCanvas('glass'),facadeCanvas('glass')]};
const texCache=new Map();
function tex(canvasEl,rx,ry,key){
  const k=(key||canvasEl.__id||(canvasEl.__id=Math.random().toString(36).slice(2)))+'|'+rx+'|'+ry;let t=texCache.get(k);
  if(!t){t=new THREE.CanvasTexture(canvasEl);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=MAX_ANISO;texCache.set(k,t);}
  return t;
}
function facadeMat(kind,color,rx,ry){
  const list=FACADE_CAN[kind]||FACADE_CAN.res;const vi=irand(0,list.length-1);
  const key=`fac|${kind}|${vi}|${color}|${rx}|${ry}`;
  return TM(key,()=>{const t=tex(list[vi],rx,ry);return new THREE.MeshStandardMaterial({color,map:t,bumpMap:t,bumpScale:0.02,roughness:kind==='glass'?0.35:0.9,metalness:kind==='glass'?0.25:0});});
}
function groundMat(name,color,rep){
  return TM(`gnd|${name}|${color}|${rep}`,()=>{const t=tex(CAN[name],rep,rep);return new THREE.MeshStandardMaterial({color,map:t,bumpMap:t,bumpScale:0.03,roughness:0.95});});
}
const aoMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(CAN.blob),transparent:true,depthWrite:false,opacity:0.75,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const bloodTex=new THREE.CanvasTexture(CAN.blood);
const softTex=new THREE.CanvasTexture(CAN.soft);
const smokeTex=new THREE.CanvasTexture(CAN.smoke);
const flameTex=new THREE.CanvasTexture(CAN.flame);
const muzzleTex=new THREE.CanvasTexture(CAN.muzzle);
const grassMat=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(CAN.grassTuft),alphaTest:0.45,side:THREE.DoubleSide,roughness:1,color:0xd8e0c0});
const shutterMat=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(CAN.shutter),roughness:0.7,metalness:0.35,color:0xdddddd});
const thatchMat=new THREE.MeshStandardMaterial({map:tex(CAN.thatch,2,2),roughness:1,color:0xd8c8a8});
function signTex(text,bg,fg,w,h,font){
  w=w||512;h=h||128;const c=mkCanvas(w,h),g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);
  g.fillStyle=fg;g.font=font||`bold ${Math.round(h*0.5)}px Impact, "Arial Black", sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+2,w*0.92);
  for(let i=0;i<55;i++){g.fillStyle=`rgba(20,10,0,${Math.random()*0.35})`;g.fillRect(Math.random()*w,Math.random()*h,Math.random()*70,Math.random()*24);}
  g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6);
  const t=new THREE.CanvasTexture(c);t.anisotropy=MAX_ANISO;levelDispose.push(t);return t;
}
function sign(x,y,z,w,h,text,bg,fg,rotY,o){
  o=o||{};const mat=new THREE.MeshStandardMaterial({map:signTex(text,bg,fg,o.cw,o.ch,o.font),side:THREE.DoubleSide,roughness:0.8,emissive:o.glow?0xffffff:0x000000,emissiveIntensity:o.glow?0.35:0,emissiveMap:o.glow?null:null});levelDispose.push(mat);
  if(o.glow)mat.emissiveMap=mat.map;
  const m=new THREE.Mesh(G.plane,mat);m.scale.set(w,h,1);m.position.set(x,y,z);m.rotation.set(0,rotY||0,o.tilt||0);world.add(m);return m;
}
// grain overlay for the cinematic layer
(function(){const c=mkCanvas(180,180),g=c.getContext('2d'),d=g.createImageData(180,180);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);$('grain').style.backgroundImage=`url(${c.toDataURL()})`;})();
