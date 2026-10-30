/* ================= sky & atmosphere ================= */
let ATM=null;
function skyDome(top,horizon,bottom){
  const geo=new THREE.SphereGeometry(450,32,16);levelDispose.push(geo);
  const cols=[],pos=geo.attributes.position,ct=new THREE.Color(top),ch=new THREE.Color(horizon),cb=new THREE.Color(bottom),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/450;if(y>0)c.copy(ch).lerp(ct,Math.pow(y,0.55));else c.copy(ch).lerp(cb,Math.min(1,-y*4));cols.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const mat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false});levelDispose.push(mat);
  const m=new THREE.Mesh(geo,mat);m.renderOrder=-10;world.add(m);return m;
}
let skyObjs=[];
function sunDisc(dir,color,size){
  const geo=new THREE.CircleGeometry(size,32);levelDispose.push(geo);
  const mat=new THREE.MeshBasicMaterial({color,fog:false,transparent:true,opacity:0.95,depthWrite:false,toneMapped:false});levelDispose.push(mat);
  const m=new THREE.Mesh(geo,mat);const v=new THREE.Vector3(...dir).normalize().multiplyScalar(420);m.position.copy(v);m.lookAt(0,0,0);m.renderOrder=-9;world.add(m);
  const hm=new THREE.SpriteMaterial({map:softTex,color,transparent:true,opacity:0.35,fog:false,depthWrite:false,toneMapped:false});levelDispose.push(hm);
  const halo=new THREE.Sprite(hm);halo.position.copy(v);halo.scale.set(size*7,size*7,1);halo.renderOrder=-9;world.add(halo);
  skyObjs.push(m,halo);
}
// night grade used behind the title screen
const NIGHT={fog:0x241614,near:8,far:80,exposure:1.3,skyTop:0x050407,skyHorizon:0x4a1c12,hemiSky:0x6a7a9a,hemiGround:0x22160f,hemiI:0.55,sun:0x8aa0c8,sunI:0.55,sunDir:[0.45,0.55,-0.6],sunDisc:0xc8d4e8,sunSize:5,ash:0x8a807a,groundFog:0x2a2026,groundFogAmt:0.3};
function atmosphere(o){
  if(titleMode)o=Object.assign({},o,NIGHT);
  ATM=o;skyObjs=[];
  scene.fog=new THREE.Fog(o.fog,o.near,o.far);
  renderer.setClearColor(o.fog);renderer.toneMappingExposure=o.exposure||1.25;
  hemi.color.set(o.hemiSky);hemi.groundColor.set(o.hemiGround);hemi.intensity=o.hemiI;
  sun.color.set(o.sun);sun.intensity=o.sunI;sunDir.set(...o.sunDir).normalize();
  vmHemi.color.set(o.hemiSky);vmHemi.groundColor.set(o.hemiGround);vmHemi.intensity=Math.max(1,o.hemiI*1.4);vmDir.color.set(o.sun);vmDir.intensity=Math.min(1.1,o.sunI*0.7);
  const sky=skyDome(o.skyTop,o.skyHorizon,o.fog);skyObjs.push(sky);
  sunDisc(o.sunDir,o.sunDisc,o.sunSize||14);
  ash.material.color.set(o.ash);ashWind=o.wind||0;
  fogSprites.forEach(f=>{f.s.material.color.set(o.groundFog||o.fog);f.s.material.opacity=0;});groundFogAmt=o.groundFogAmt??0.16;
}

/* ================= particles & effects (pooled, global) ================= */
const PARTS=[];
const partMats={};
function partMat(color,add){const k=color+(add?'a':'');if(!partMats[k])partMats[k]=new THREE.MeshBasicMaterial({color,transparent:!!add,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:!add,toneMapped:!add});return partMats[k];}
for(let i=0;i<520;i++){const m=new THREE.Mesh(G.box,partMat(0xffffff));m.visible=false;scene.add(m);PARTS.push({m,v:new THREE.Vector3(),life:0,max:1,g:12,spin:0,sz:1,shrink:true});}
function burst(x,y,z,color,n,spd,size,life,o){
  o=o||{};
  for(let k=0;k<n;k++){const p=PARTS.find(p=>p.life<=0);if(!p)return;p.m.material=partMat(color,o.add);p.m.visible=true;p.m.position.set(x,y,z);const s=size*rand(0.6,1.2);p.sz=s;p.m.scale.set(s,s*(o.stretch||1),s);
    if(o.dir){p.v.copy(o.dir).multiplyScalar(spd*rand(0.4,1)).add(_v.set(rand(-1,1),rand(-0.3,1),rand(-1,1)).multiplyScalar(spd*(o.spread??0.5)));}
    else p.v.set(rand(-1,1),rand(-0.2,1.2),rand(-1,1)).normalize().multiplyScalar(spd*rand(0.3,1));
    p.life=p.max=life*rand(0.6,1.1);p.g=o.grav??12;p.spin=rand(-12,12);p.shrink=o.shrink!==false;p.m.rotation.set(rand(0,3),rand(0,3),0);}
}
function updateParts(dt){for(const p of PARTS){if(p.life<=0)continue;p.life-=dt;p.v.y-=p.g*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=p.spin*dt;
  if(p.m.position.y<0.02){p.m.position.y=0.02;p.v.multiplyScalar(0.3);p.v.y=0;}
  if(p.shrink){const k=Math.max(0.05,p.life/p.max);p.m.scale.setScalar(p.sz*k);}
  if(p.life<=0)p.m.visible=false;}}

// bullet tracers
const TRACERS=[];
const tracerMat=new THREE.LineBasicMaterial({color:0xffe0a0,transparent:true,opacity:0.8,toneMapped:false});
for(let i=0;i<16;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,1],3));const l=new THREE.Line(g,tracerMat);l.visible=false;l.frustumCulled=false;scene.add(l);TRACERS.push({l,life:0});}
function tracer(a,b){const t=TRACERS.find(t=>t.life<=0)||TRACERS[0];const p=t.l.geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;t.l.visible=true;t.life=0.045;}

// shell casings
const SHELLS=[];const shellMat=new THREE.MeshStandardMaterial({color:0xd8b050,metalness:0.4,roughness:0.3});
for(let i=0;i<44;i++){const m=new THREE.Mesh(G.cyl,shellMat);m.scale.set(0.012,0.04,0.012);m.visible=false;scene.add(m);SHELLS.push({m,v:new THREE.Vector3(),life:0,b:0,spin:new THREE.Vector3()});}
function ejectShell(pos,vel,big){const s=SHELLS.find(s=>s.life<=0)||SHELLS[0];s.m.visible=true;s.m.position.copy(pos);s.v.copy(vel);s.life=2.5;s.b=0;s.m.scale.set(big?0.013:0.011,big?0.05:0.032,big?0.013:0.011);s.spin.set(rand(-20,20),rand(-20,20),rand(-20,20));}
function updateShells(dt){for(const s of SHELLS){if(s.life<=0)continue;s.life-=dt;s.v.y-=14*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.spin.x*dt;s.m.rotation.z+=s.spin.z*dt;
  if(s.m.position.y<0.015){s.m.position.y=0.015;if(s.v.y<-0.6&&s.b<2){s.v.y*=-0.35;s.v.x*=0.5;s.v.z*=0.5;s.spin.multiplyScalar(0.5);s.b++;if(s.b===1)SFX.shell(s.m.position);}else{s.v.set(0,0,0);s.spin.set(0,0,0);s.m.rotation.x=Math.PI/2;}}
  if(s.life<=0)s.m.visible=false;}}

// blood decals on the ground
const DECALS=[];
for(let i=0;i<110;i++){const m=new THREE.Mesh(G.plane,new THREE.MeshStandardMaterial({map:bloodTex,transparent:true,depthWrite:false,roughness:0.35,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);DECALS.push({m,life:0,grow:0,t:0,target:1});}
let decalI=0;
// temporary blood: splats appear instantly, pools spread out under bodies; both fade after a while
function bloodDecal(x,z,s,o){o=o||{};const d=DECALS[decalI++%DECALS.length],m=d.m;m.visible=true;m.position.set(x,0.015+(decalI%12)*0.0007,z);m.rotation.z=rand(0,6.28);
  const k=s*rand(0.75,1.25);d.target=k;d.t=0;d.grow=o.pool?2.6:0;d.life=o.life||40;m.scale.set(o.pool?0.2:k,o.pool?0.2:k,1);m.material.opacity=o.pool?0.95:0.85;m.material.color.set(o.pool?0x9a2a2a:0xd8c8c8);}
function updateDecals(dt){for(const d of DECALS){if(d.life<=0)continue;d.life-=dt;d.t+=dt;if(d.grow>0&&d.t<d.grow){const s=0.2+(d.target-0.2)*easeOut(d.t/d.grow);d.m.scale.set(s,s,1);}
  if(d.life<6)d.m.material.opacity=Math.max(0,d.life/6)*0.85;if(d.life<=0)d.m.visible=false;}}
function clearDecals(){DECALS.forEach(d=>{d.m.visible=false;d.life=0;});}

// smoke, fire and sparks
const SMOKE=[];
for(let i=0;i<90;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0x555555,transparent:true,opacity:0,depthWrite:false}));s.visible=false;scene.add(s);SMOKE.push({s,life:0,max:1,v:new THREE.Vector3(),g:1,base:0.5});}
function puff(x,y,z,col,size,life,vy,op){const p=SMOKE.find(p=>p.life<=0);if(!p)return;p.s.visible=true;p.s.position.set(x,y,z);p.s.material.color.set(col);p.s.material.rotation=rand(0,6.28);p.base=op??0.45;p.life=p.max=life;p.g=size;p.v.set(rand(-0.3,0.3)+ashWind*0.4,vy??1.4,rand(-0.3,0.3));p.s.scale.set(size,size,1);}
function updateSmoke(dt){for(const p of SMOKE){if(p.life<=0)continue;p.life-=dt;const k=1-p.life/p.max;p.s.position.addScaledVector(p.v,dt);const sc=p.g*(1+k*2.2);p.s.scale.set(sc,sc,1);p.s.material.opacity=p.base*Math.sin(Math.min(1,k*1.2)*Math.PI)*(1-k*0.3);p.s.material.rotation+=dt*0.2;if(p.life<=0){p.s.visible=false;p.s.material.opacity=0;}}}
let emitters=[];
function fireAt(x,y,z,size){
  const flames=[];for(let i=0;i<5;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flameTex,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));s.position.set(x+rand(-0.4,0.4)*size,y,z+rand(-0.4,0.4)*size);world.add(s);levelDispose.push(s.material);flames.push({s,ph:rand(0,6),ox:s.position.x,oz:s.position.z});}
  emitters.push({type:'fire',x,y,z,size,flames,t:0,light:fireLights[emitters.filter(e=>e.type==='fire').length]||null});
}
function smokeAt(x,y,z,rate,size,col){emitters.push({type:'smoke',x,y,z,rate,size,col:col||0x3a3530,t:0});}
function sparksAt(x,y,z){emitters.push({type:'spark',x,y,z,t:rand(2,6)});}
function updateEmitters(dt){
  for(const e of emitters){
    if(e.type==='fire'){e.t+=dt;const fl=0.75+Math.sin(e.t*13)*0.12+Math.sin(e.t*29)*0.08+Math.random()*0.08;
      for(const f of e.flames){f.ph+=dt*rand(4,8);const h=e.size*(1.1+Math.sin(f.ph)*0.3);f.s.scale.set(e.size*0.9,h*1.4,1);f.s.position.y=e.y+h*0.55;f.s.position.x=f.ox+Math.sin(f.ph*0.7)*0.08;f.s.material.opacity=0.75+Math.sin(f.ph*1.3)*0.2;}
      if(e.light){e.light.position.set(e.x,e.y+1.2,e.z);e.light.intensity=2.2*fl*e.size;}
      if(Math.random()<dt*5)puff(e.x+rand(-.3,.3),e.y+e.size*1.4,e.z+rand(-.3,.3),0x2a2522,e.size*1.2,rand(3,5),1.6,0.5);
      if(Math.random()<dt*3)burst(e.x,e.y+e.size,e.z,0xffa040,1,1.5,0.03,0.8,{add:true,grav:-1.5});
    }else if(e.type==='smoke'){e.t-=dt;if(e.t<=0){e.t=1/e.rate;puff(e.x+rand(-.5,.5),e.y,e.z+rand(-.5,.5),e.col,e.size,rand(4,7),rand(0.8,1.4),0.35);}}
    else if(e.type==='spark'){e.t-=dt;if(e.t<=0){e.t=rand(3,9);const d=Math.hypot(e.x-P.x,e.z-P.z);
      burst(e.x,e.y,e.z,0xbfe4ff,irand(10,18),4,0.035,0.7,{add:true,grav:14,stretch:3});burst(e.x,e.y,e.z,0xffd080,6,3,0.03,0.6,{add:true,grav:14});
      sparkLight.position.set(e.x,e.y,e.z);sparkLight.intensity=4;if(d<30)SFX.spark(e.x,e.z);}}
  }
  sparkLight.intensity=Math.max(0,sparkLight.intensity-dt*30);
}
function clearEmitters(){emitters=[];fireLights.forEach(l=>l.intensity=0);}

// floating ash / dust motes
const ASHN=900,ashGeo=new THREE.BufferGeometry(),ashPos=new Float32Array(ASHN*3);
for(let i=0;i<ASHN;i++){ashPos[i*3]=rand(-25,25);ashPos[i*3+1]=rand(0,14);ashPos[i*3+2]=rand(-25,25);}
ashGeo.setAttribute('position',new THREE.BufferAttribute(ashPos,3));
const ash=new THREE.Points(ashGeo,new THREE.PointsMaterial({color:0x999999,size:0.06,transparent:true,opacity:0.8,map:softTex,depthWrite:false}));ash.frustumCulled=false;scene.add(ash);
let ashWind=0;
function updateAsh(dt,t){
  for(let i=0;i<ASHN;i++){let x=ashPos[i*3],y=ashPos[i*3+1],z=ashPos[i*3+2];
    y-=dt*(0.3+((i%7)*0.05))*(ashWind>2?0.2:1);x+=dt*(ashWind*(1+(i%5)*0.25)+Math.sin(t*0.5+i)*0.2);z+=dt*Math.cos(t*0.4+i)*0.15;
    if(y<0)y+=14;const dx=x-P.x,dz=z-P.z;if(dx>25)x-=50;if(dx<-25)x+=50;if(dz>25)z-=50;if(dz<-25)z+=50;
    ashPos[i*3]=x;ashPos[i*3+1]=y;ashPos[i*3+2]=z;}
  ashGeo.attributes.position.needsUpdate=true;
}
// low drifting ground fog
const fogSprites=[];let groundFogAmt=0.16;
for(let i=0;i<16;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0x888888,transparent:true,opacity:0,depthWrite:false}));scene.add(s);fogSprites.push({s,a:rand(0,6.28),r:rand(8,34),sp:rand(0.01,0.03),ph:rand(0,6)});}
function updateFog(dt,t){for(const f of fogSprites){f.a+=f.sp*dt;const x=P.x+Math.cos(f.a)*f.r,z=P.z+Math.sin(f.a)*f.r;f.s.position.set(x,0.9+Math.sin(t*0.2+f.ph)*0.2,z);f.s.scale.set(16,5,1);f.s.material.opacity=groundFogAmt*(0.7+0.3*Math.sin(t*0.3+f.ph));}}

/* ================= props ================= */
function blob(x,z,w,d,ry){inst(G.plane,0,x,0.012,z,w,d,1,{rx:-Math.PI/2,rz:ry||0,cast:false,mat:aoMat});}
function strip(x,z,w,d,color,y,mat){const m=new THREE.Mesh(G.plane,mat||M(color,{roughness:0.95}));m.rotation.x=-Math.PI/2;m.scale.set(w,d,1);m.position.set(x,y||0.01,z);m.receiveShadow=true;world.add(m);return m;}
function ground(w,d,name,color,cx,cz,rep){
  const m=new THREE.Mesh(G.plane,groundMat(name,color,rep||Math.round(w/8)));m.rotation.x=-Math.PI/2;m.scale.set(w,d,1);m.position.set(cx||0,0,cz||0);m.receiveShadow=true;world.add(m);return m;
}
function texStrip(x,z,w,d,name,color,y,rep){const r=rep||Math.max(1,Math.round(Math.max(w,d)/8));const t=tex(CAN[name],w>d?r:Math.max(1,Math.round(w/8)),w>d?Math.max(1,Math.round(d/8)):r,name+'s');
  const mat=TM(`strip|${name}|${color}|${t.repeat.x}|${t.repeat.y}`,()=>new THREE.MeshStandardMaterial({color,map:t,bumpMap:t,bumpScale:0.03,roughness:0.95,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));return strip(x,z,w,d,color,y||0.008,mat);}
function roadMarks(x,z0,z1,lanes,along){for(let z=z0;z<z1;z+=7)for(const lx of lanes){if(along==='x')deco(z,0.02,x+lx,3,0.01,0.18,0xd8d0b0,{});else deco(x+lx,0.02,z,0.18,0.01,3,0xd8d0b0,{});}}
function zebra(x,z,w,along){for(let i=-w/2;i<w/2;i+=1.1){if(along==='x')deco(x+i,0.021,z,0.55,0.01,3.4,0xe0dccf);else deco(x,0.021,z+i,3.4,0.01,0.55,0xe0dccf);}}
function pothole(x,z,s){inst(G.plane,0,x,0.022,z,s,s*rand(.6,1),1,{rx:-Math.PI/2,rz:rand(0,3),cast:false,mat:TM('pothole',()=>new THREE.MeshStandardMaterial({color:0x111111,map:softTex,transparent:true,opacity:0.85,depthWrite:false,roughness:0.6}))});}
function litter(x0,x1,z0,z1,n){const cols=[0xd8d2c0,0xb8b0a0,0x7a6a4a,0x3a4a6a,0xc0392b,0xe6e6e6];for(let i=0;i<n;i++)deco(rand(x0,x1),0.025,rand(z0,z1),rand(0.15,0.4),0.01,rand(0.1,0.3),pick(cols),{ry:rand(0,3)});}
function rubble(x,z,n,spread,col){for(let i=0;i<n;i++){const s=rand(0.15,0.55);deco(x+rand(-spread,spread),s*0.3,z+rand(-spread,spread),s,s*0.7,s,col||pick([0x8a8478,0x9a9286,0x6f6a62,0xa89a86]),{geo:G.rubble,ry:rand(0,3),rx:rand(0,3),cast:s>0.35});}}
function grass(x0,x1,z0,z1,n){for(let i=0;i<n;i++){const s=rand(0.35,0.8);inst(G.cross,0,rand(x0,x1),0,rand(z0,z1),s,s*rand(.7,1.2),s,{ry:rand(0,3),cast:false,mat:grassMat});}}
function bush(x,z,s,col){for(let i=0;i<3;i++)deco(x+rand(-.4,.4)*s,s*0.4,z+rand(-.4,.4)*s,s*rand(.8,1.2),s*rand(.6,.9),s*rand(.8,1.2),col||pick([0x4a5f2c,0x55682f,0x3f5226]),{geo:G.canopy,ry:rand(0,3),cast:true});}

function car(x,z,ry,color,o){
  o=o||{};const burnt=o.burnt,col=burnt?0x2b2622:color,glass=burnt?0x0c0c0c:0x1f272c,trim=burnt?0x1a1714:0x2a2a2a;
  const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rz:ex&&ex.rz||0,rx:ex&&ex.rx||0,cast:!(ex&&ex.nocast),mat:ex&&ex.mat});};
  const paint=burnt?M(col,{roughness:1}):M(col,{roughness:0.45,metalness:0.15});
  P2(0,0.62,0,1.8,0.55,4.3,col,{mat:paint});
  P2(0,0.98,0.95,1.76,0.18,1.5,col,{mat:paint});
  P2(0,1.15,-0.15,1.62,0.55,2.1,glass,{mat:M(glass,{roughness:0.15,metalness:0.6})});
  P2(0,1.44,-0.2,1.66,0.06,1.8,col,{mat:paint});
  P2(0,0.5,2.17,1.84,0.24,0.1,trim);P2(0,0.5,-2.17,1.84,0.24,0.1,trim);
  if(!burnt){P2(0.62,0.72,2.16,0.3,0.12,0.04,0xe8e2c8);P2(-0.62,0.72,2.16,0.3,0.12,0.04,0xe8e2c8);P2(0.62,0.72,-2.16,0.3,0.1,0.04,0x9a1a12);P2(-0.62,0.72,-2.16,0.3,0.1,0.04,0x9a1a12);}
  for(const sx of[-0.82,0.82])for(const sz of[-1.35,1.35]){P2(sx,0.34,sz,0.68,0.24,0.68,0x141414,{geo:G.cyl,rz:Math.PI/2});P2(sx*1.02,0.34,sz,0.36,0.25,0.36,burnt?0x3a2a20:0x8a8a8a,{geo:G.cyl,rz:Math.PI/2,nocast:true});}
  if(burnt){for(let i=0;i<4;i++)P2(rand(-.7,.7),rand(0.7,1.3),rand(-1.8,1.8),rand(.2,.5),0.02,rand(.2,.5),0x7a3a18,{nocast:true});}
  addSolidRot(x,z,ry,0.95,2.2,0.15,1.47);
  blob(x,z,2.8,5.2,ry);
}
function auto(x,z,ry,o){
  o=o||{};const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rz:ex&&ex.rz||0,rx:ex&&ex.rx||0,cast:!(ex&&ex.nocast),mat:ex&&ex.mat});};
  const yel=o.green?0x3f8a4a:0xe2b01e;const paint=M(yel,{roughness:0.5,metalness:0.2});
  P2(0,0.6,-0.3,1.3,0.7,1.8,yel,{mat:paint});P2(0,0.62,1.0,0.9,0.75,0.6,yel,{mat:paint});
  P2(0,1.62,-0.15,1.36,0.1,2.25,0x151515);P2(0,1.25,-0.25,1.36,0.8,0.08,0x151515);
  for(const s of[-0.62,0.62])P2(s,1.3,0.62,0.05,0.75,0.05,0x151515);
  P2(0,1.32,0.95,0.95,0.55,0.04,0x2a3236,{mat:M(0x2a3236,{roughness:0.15,metalness:0.5})});
  P2(0,0.28,1.3,0.2,0.52,0.52,0x111111,{geo:G.cyl,rz:Math.PI/2});
  for(const s of[-0.6,0.6])P2(s,0.28,-0.8,0.18,0.52,0.52,0x111111,{geo:G.cyl,rz:Math.PI/2});
  P2(0,0.78,-0.6,1.2,0.12,0.5,0x3a2a1a);
  addSolidRot(x,z,ry,0.72,1.35,0.1,1.7);
  blob(x,z,1.9,3.2,ry);
}
function bus(x,z,ry,o){
  o=o||{};const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rz:ex&&ex.rz||0,rx:ex&&ex.rx||0,cast:!(ex&&ex.nocast),mat:ex&&ex.mat});};
  const low=o.burnt?0x2b2622:(o.low||0x8f2a22),up=o.burnt?0x34302c:(o.up||0xd8cdaa);
  P2(0,1.05,0,2.6,1.3,11,low,{mat:M(low,{roughness:0.6,metalness:0.25})});
  P2(0,2.25,0,2.58,1.1,10.9,0x1a1f22,{mat:M(0x1a1f22,{roughness:0.2,metalness:0.4})});
  for(let i=-5;i<=5;i++)P2(0,2.25,i*1.0,2.62,1.1,0.12,up);
  P2(0,3.0,0,2.62,0.45,11.02,up);P2(0,3.27,0,2.4,0.1,10.6,o.burnt?0x2a2a2a:0x8a8a84);
  P2(0,0.62,0,2.62,0.18,11.02,0x2a2a2a);
  for(const s of[-1.15,1.15])for(const zz of[-3.6,3.4])P2(s,0.5,zz,0.3,1.0,1.0,0x121212,{geo:G.cyl,rz:Math.PI/2});
  const p=L(x,z,ry,0,5.52);
  if(!o.burnt){const sg=sign(p[0],2.95,p[1],1.9,0.32,o.route||'21G  BROADWAY','#0b0b0b','#ffae1a',ry,{cw:512,ch:96,glow:true,font:'bold 64px "Courier New", monospace'});}
  if(o.burnt){for(let i=0;i<6;i++)P2(rand(-1.2,1.2),rand(1,3),rand(-5,5),rand(.3,.8),0.03,rand(.3,.8),0x7a3a18,{nocast:true});}
  addSolidRot(x,z,ry,1.35,5.55,0.35,3.35);
  blob(x,z,3.6,12.5,ry);
}
function busTipped(x,z,ry){
  const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(G.box,c,p[0],ly,p[1],w,h,d,{ry,cast:true,mat:ex});};
  P2(0,1.3,0,3.2,2.6,11,0x8f2a22);P2(0.3,2.62,0,2.2,0.04,10.8,0x1a1f22);P2(-1.2,1.3,0,0.8,2.62,11.02,0xd8cdaa);
  addSolidRot(x,z,ry,1.6,5.5,0,2.6);blob(x,z,4,12.5,ry);
}
function tanker(x,z,ry){
  const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rz:ex&&ex.rz||0,rx:ex&&ex.rx||0,cast:true,mat:ex&&ex.mat});};
  P2(0,1.5,3.1,2.3,1.7,1.9,0x2860a8,{mat:M(0x2860a8,{roughness:0.5,metalness:0.3})});P2(0,1.85,4.06,2.1,0.7,0.04,0x1c2328);
  P2(0,0.8,0,2.2,0.3,8,0x222222);P2(0,1.95,-0.9,2.1,5.4,2.1,0xe0b21c,{geo:G.cyl,rx:Math.PI/2,mat:M(0xe0b21c,{roughness:0.5,metalness:0.3})});
  for(const s of[-1,1])for(const zz of[-2.8,-1.4,3.1])P2(s*1.05,0.48,zz,0.32,0.95,0.95,0x121212,{geo:G.cyl,rz:Math.PI/2});
  const p=L(x,z,ry,1.08,-0.9);sign(p[0],1.95,p[1],3.6,0.6,'DRINKING WATER','#e0b21c','#1a2a6a',ry+Math.PI/2,{cw:512,ch:96});
  addSolidRot(x,z,ry,1.2,4.1,0.3,3.0);blob(x,z,3,9,ry);
}
function scooter(x,z,ry,fallen){
  const p=(lx,ly,lz,w,h,d,c,ex)=>{const q=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,q[0],ly,q[1],w,h,d,{ry,rz:(fallen?1.35:0)+(ex&&ex.rz||0),cast:true});};
  const col=pick([0x8a1a1a,0x1a3a7a,0x222222,0xdddddd]);const yy=fallen?0.25:0;
  p(0,0.55-yy,0,0.42,0.42,1.2,col);p(0,0.85-yy,-0.2,0.32,0.12,0.6,0x1a1a1a);p(0,0.9-yy,0.55,0.08,0.7,0.08,0x333333);
  p(0,0.28-(fallen?0.1:0),0.62,0.1,0.48,0.48,0x111111,{geo:G.cyl,rz:Math.PI/2});p(0,0.28-(fallen?0.1:0),-0.55,0.1,0.48,0.48,0x111111,{geo:G.cyl,rz:Math.PI/2});
  const hw=Math.abs(Math.cos(ry))*0.35+Math.abs(Math.sin(ry))*0.85,hd=Math.abs(Math.sin(ry))*0.35+Math.abs(Math.cos(ry))*0.85;addSolid(x-hw,x+hw,z-hd,z+hd,0,fallen?0.45:1.1);
}
function stall(x,z,ry,kind){
  const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rz:ex&&ex.rz||0,rx:ex&&ex.rx||0,cast:!(ex&&ex.nocast)});};
  const tarp=pick([0x2f6fb0,0xc0392b,0xe6a12e,0x3f8f4a,0x8e44ad,0xd35400]);
  P2(0,0.47,0,1.25,0.94,2.3,0x6b4a2b);P2(0,0.95,0,1.35,0.06,2.4,0x8a6a40);
  kind=kind||pick(['flower','fruit','cloth','junk']);
  if(kind==='flower'){for(let i=0;i<8;i++)P2(rand(-.45,.45),1.02,rand(-1,1),0.12,0.06,0.5,pick([0xf2efe0,0xf39c12,0xe67e22,0xf7f7f0]),{nocast:true});for(let i=-2;i<=2;i++)P2(0.55,1.7,i*0.42,0.05,0.9,0.05,pick([0xf2efe0,0xf39c12]),{nocast:true});}
  else if(kind==='fruit'){for(let i=0;i<10;i++)P2(rand(-.45,.45),1.06,rand(-1,1),0.18,0.14,0.18,pick([0xe8c33a,0x6a9a2a,0xd04a2a,0xe8a03a]),{geo:G.sphereLo,nocast:true});}
  else if(kind==='cloth'){for(let i=0;i<5;i++)P2(0.55,1.6,-0.9+i*0.45,0.03,1.1,0.38,pick([0xc0392b,0x8e44ad,0x16a085,0xf1c40f,0xd35400,0x2c3e50]),{nocast:true});}
  else {for(let i=0;i<6;i++)P2(rand(-.45,.45),1.08,rand(-1,1),rand(.15,.35),rand(.1,.25),rand(.15,.35),pick([0x555555,0x8a6a40,0x2a6fb0,0xaaaaaa]),{nocast:true});}
  for(const s of[-1,1])for(const t of[-1,1])P2(s*0.72,1.2,t*1.25,0.05,2.4,0.05,0x3a2a1a);
  P2(0.12,2.42,0,2.0,0.05,2.9,tarp,{rz:0.18});
  const hw=Math.abs(Math.cos(ry))*0.65+Math.abs(Math.sin(ry))*1.2,hd=Math.abs(Math.sin(ry))*0.65+Math.abs(Math.cos(ry))*1.2;addSolid(x-hw,x+hw,z-hd,z+hd,0,1.0);blob(x,z,2,3,ry);
}
function crate(x,z,s,ry){box(x,z,s,s,s,pick([0x7e5f39,0x6b4f30,0x8a6a3e]),{rot:ry||0});deco(x,s+0.002,z,s*0.9,0.01,0.08,0x4a3520,{ry:ry||0});blob(x,z,s*1.6,s*1.6);}
function drum(x,z,col,fallen){if(fallen){deco(x,0.3,z,0.6,0.9,0.6,col||0x2a4a7a,{geo:G.cyl,rz:Math.PI/2,ry:rand(0,3),cast:true});addSolid(x-0.45,x+0.45,z-0.45,z+0.45,0,0.6);}else{cyl(x,z,0.3,0.9,col||pick([0x2a4a7a,0x7a2a1a,0x4a5a2a,0x6a6a6a]));deco(x,0.3,z,0.62,0.04,0.62,0x222222,{geo:G.cyl});deco(x,0.62,z,0.62,0.04,0.62,0x222222,{geo:G.cyl});}}
function tires(x,z,n){for(let i=0;i<n;i++)deco(x+rand(-.05,.05),0.12+i*0.24,z+rand(-.05,.05),0.8,0.24,0.8,0x161616,{geo:G.cyl,cast:true});addSolid(x-0.4,x+0.4,z-0.4,z+0.4,0,n*0.24);}
function jersey(x,z,len,along){const w=along==='x'?len:0.6,d=along==='x'?0.6:len;box(x,z,w,d,0.5,0xb8b2a6);deco(x,0.72,z,along==='x'?len:0.32,0.45,along==='x'?0.32:len,0xb8b2a6,{cast:true});for(let i=-len/2+0.6;i<len/2;i+=1.4)deco(along==='x'?x+i:x,0.6,along==='x'?z:z+i,along==='x'?0.6:0.62,0.18,along==='x'?0.62:0.6,0xc0392b);addSolid(x-w/2+0.14,x+w/2-0.14,z-d/2+0.14,z+d/2-0.14,0.5,0.95);}
function barricade(x,z,along){const w=along==='x'?2.4:0.25,d=along==='x'?0.25:2.4;for(let i=0;i<6;i++){const off=-1.0+i*0.4;deco(along==='x'?x+off:x,0.75,along==='x'?z:z+off,along==='x'?0.4:0.06,0.42,along==='x'?0.06:0.4,i%2?0x111111:0xe8c21a);}deco(x,0.5,z,w,0.06,d,0x555555);for(const s of[-1,1])deco(along==='x'?x+s*1.15:x,0.5,along==='x'?z:z+s*1.15,0.08,1.0,0.08,0x555555,{cast:true});addSolid(x-w/2,x+w/2,z-d/2,z+d/2,0,1.0);}
function sandbags(x,z,len,along){const n=Math.round(len/0.6);for(let r=0;r<3;r++)for(let i=0;i<n;i++){const o=-len/2+0.3+i*0.6+(r%2)*0.3;if(o>len/2)continue;deco(along==='x'?x+o:x,0.17+r*0.3,along==='x'?z:z+o,along==='x'?0.6:0.45,0.3,along==='x'?0.45:0.6,0x9a8a62,{geo:G.sphereLo,cast:true});}const w=along==='x'?len:0.5,d=along==='x'?0.5:len;addSolid(x-w/2,x+w/2,z-d/2,z+d/2,0,0.9);}
function lamp(x,z,armDir,broken){cyl(x,z,0.09,6.5,0x3a3a3a);const ad=armDir||1;deco(x+ad*0.7,6.4,z,1.4,0.08,0.08,0x3a3a3a,{cast:true});deco(x+ad*1.3,6.3,z,0.45,0.12,0.25,broken?0x222222:0x666666,{cast:true});if(broken)sparksAt(x+ad*1.3,6.2,z);}
function ebPole(x,z,transformer){
  box(x,z,0.22,0.22,8.5,0x8a867c,{geo:G.box});deco(x,8.0,z,1.6,0.1,0.1,0x5a5a5a,{cast:true});deco(x,7.3,z,1.2,0.1,0.1,0x5a5a5a,{cast:true});
  if(transformer){deco(x+0.45,5.2,z,0.7,1.1,0.6,0x6a6e66,{cast:true});deco(x+0.45,5.9,z,0.12,0.4,0.12,0xb0a890);sparksAt(x+0.45,5.8,z);}
  return [x,8.0,z];
}
function wires(polesArr,sag){for(let i=0;i<polesArr.length-1;i++){const a=polesArr[i],b=polesArr[i+1];for(const off of[-0.7,0,0.7]){const A=new THREE.Vector3(a[0]+off,a[1],a[2]),B=new THREE.Vector3(b[0]+off,b[1],b[2]),Mid=A.clone().add(B).multiplyScalar(0.5);Mid.y-=sag||0.8;rod(A,Mid,0.025,0x111111,{cast:false});rod(Mid,B,0.025,0x111111,{cast:false});}}}
function tree(x,z,s,o){
  o=o||{};s=s||1;cyl(x,z,0.22*s,3.0*s,0x5a4430,{geo:G.taper});
  if(o.dead){for(let i=0;i<4;i++){const a=rand(0,6.28);rod(new THREE.Vector3(x,2.6*s,z),new THREE.Vector3(x+Math.cos(a)*1.4*s,rand(3.5,4.6)*s,z+Math.sin(a)*1.4*s),0.12*s,0x4a3a2a,{cast:true});}return;}
  for(let i=0;i<3;i++){const a=rand(0,6.28);rod(new THREE.Vector3(x,2.5*s,z),new THREE.Vector3(x+Math.cos(a)*1.2*s,3.6*s,z+Math.sin(a)*1.2*s),0.14*s,0x5a4430,{cast:true});}
  const greens=o.greens||[0x4a6a2c,0x3f5e26,0x58733a,0x6a7a3a];
  for(let i=0;i<6;i++)deco(x+rand(-1.4,1.4)*s,rand(3.6,5.2)*s,z+rand(-1.4,1.4)*s,rand(2,3.2)*s,rand(1.6,2.4)*s,rand(2,3.2)*s,pick(greens),{geo:G.canopy,ry:rand(0,3),cast:true});
  blob(x,z,4*s,4*s);
}
function palm(x,z,dead,h){
  h=h||7;const lean=rand(-0.25,0.25),lz=rand(-0.25,0.25);let px=x,pz=z;
  for(let i=0;i<5;i++){const y=i*h/5;deco(px,y+h/10,pz,0.34-i*0.02,h/5+0.05,0.34-i*0.02,dead?0x6d5a44:0x7a6248,{geo:G.cyl,cast:true});px+=lean*0.3;pz+=lz*0.3;}
  addSolid(x-0.25,x+0.25,z-0.25,z+0.25,0,h);
  const tx=px,tz=pz;for(let i=0;i<9;i++){const a=i/9*Math.PI*2+rand(-.2,.2);const A=new THREE.Vector3(tx,h,tz),B=new THREE.Vector3(tx+Math.cos(a)*1.6,h+0.35,tz+Math.sin(a)*1.6),C=new THREE.Vector3(tx+Math.cos(a)*3.0,h-(dead?1.6:0.9),tz+Math.sin(a)*3.0);
    const col=dead?0x8a6d3e:pick([0x4a7a2a,0x557f2e,0x3f6b26]);rod(A,B,0.18,col,{cast:true});rod(B,C,0.14,col,{cast:true});}
  if(!dead)for(let i=0;i<4;i++)deco(tx+rand(-.3,.3),h-0.3,tz+rand(-.3,.3),0.3,0.32,0.3,0x6a5a2a,{geo:G.sphereLo});
}
function boulder(x,z,s,color){deco(x,s*0.25,z,s,s*0.7,s*0.9,color||0x9a7650,{geo:G.rubble,ry:rand(0,3),cast:true});addSolid(x-s*0.4,x+s*0.4,z-s*0.38,z+s*0.38,0,s*0.6);}
function bench(x,z,along){const w=along==='x'?1.8:0.5,d=along==='x'?0.5:1.8;box(x,z,w,d,0.45,0x6a5a4a);deco(x+(along==='x'?0:-0.22),0.75,z+(along==='x'?-0.22:0),along==='x'?1.8:0.06,0.5,along==='x'?0.06:1.8,0x6a5a4a);}

/* ================= buildings ================= */
const FACADES=[0xb7d3b8,0xe3a3a6,0xe9d27c,0x9ec4d9,0xd9b48f,0xc9c1e0,0xe6c3a0,0xa6c49a,0xd8d0c0,0xc8b8a0];
const SHOPS=[['SILK HOUSE','#8c1c2b','#f6d78a'],['JEWELLERY','#16323f','#e9c46a'],['TIFFIN CENTRE','#e0b22c','#3b1608'],['MOBILES','#1e5aa8','#ffffff'],['TEA KADAI','#2f6b3a','#f2e8c8'],['TEXTILES','#5a1f6b','#f4d35e'],['FANCY STORE','#c8442a','#fff3d6'],['SWEETS & SNACKS','#f0e3c0','#9a2416'],['FOOTWEAR','#262626','#f2a447'],['PHOTO STUDIO','#5c7d8a','#ffffff'],['LODGE','#7a5230','#f6e7c1'],['MEDICALS','#e8e8e8','#1d7a3b'],['BAKERY','#f6e7c1','#7a3a1a'],['XEROX','#1a1a1a','#f1c40f'],['HOTEL','#b0161d','#ffffff'],['PAWN BROKER','#2c3e50','#f1c40f'],['RICE MANDI','#d8c8a0','#3a2a1a'],['TAILOR','#16a085','#ffffff']];
let shopI=0;
function building(x,z,w,d,h,color,o){
  o=o||{};const kind=o.kind||'res';const floors=Math.max(1,Math.round(h/3.2));h=floors*3.2;
  const rx=Math.max(1,Math.round(Math.max(w,d)/6.4)),ry=Math.max(1,Math.round(floors/2));
  const mat=facadeMat(kind,color,rx,ry);
  box(x,z,w,d,h,color,{mat,solid:o.solid!==false});
  // parapet & roof clutter
  const roofC=0x5a554e;deco(x,h+0.3,z+d/2-0.1,w,0.6,0.2,roofC,{cast:true});deco(x,h+0.3,z-d/2+0.1,w,0.6,0.2,roofC,{cast:true});deco(x+w/2-0.1,h+0.3,z,0.2,0.6,d,roofC,{cast:true});deco(x-w/2+0.1,h+0.3,z,0.2,0.6,d,roofC,{cast:true});
  if(kind!=='glass'&&Math.random()<0.75){const tx=x+rand(-w/2+1.2,w/2-1.2),tz=z+rand(-d/2+1.2,d/2-1.2);deco(tx,h+0.75,tz,1.2,1.5,1.2,0x1a1a1a,{geo:G.cyl,cast:true});deco(tx,h+1.55,tz,0.9,0.15,0.9,0x1a1a1a,{geo:G.cone});}
  if(kind!=='glass'&&Math.random()<0.4){deco(x+rand(-w/3,w/3),h+0.9,z+rand(-d/3,d/3),0.05,1.8,0.05,0x777777);deco(x+rand(-w/3,w/3),h+0.4,z+rand(-d/3,d/3),0.7,0.08,0.7,0xdddddd,{rx:0.6});}
  // sunshades (chajja) on every floor & side, AC units on the faces
  if(kind==='res'||kind==='brick'){
    for(let f=1;f<floors;f++){const y=f*3.2+0.0;
      deco(x,y-0.55,z+d/2+0.25,w*0.94,0.1,0.5,0xcfc8bb,{cast:true});deco(x,y-0.55,z-d/2-0.25,w*0.94,0.1,0.5,0xcfc8bb,{cast:true});
      deco(x+w/2+0.25,y-0.55,z,0.5,0.1,d*0.94,0xcfc8bb,{cast:true});deco(x-w/2-0.25,y-0.55,z,0.5,0.1,d*0.94,0xcfc8bb,{cast:true});
      if(Math.random()<0.5){const side=irand(0,3),off=rand(-0.35,0.35);const px=side<2?x+off*w:x+(side===2?1:-1)*(w/2+0.22),pz=side<2?z+(side===0?1:-1)*(d/2+0.22):z+off*d;deco(px,y+0.6,pz,side<2?0.85:0.42,0.55,side<2?0.42:0.85,0xd9d6cc,{cast:true});}
    }
  }
  // street-facing ground floor: shutters + shop sign
  if(o.face){const f=o.face,ax=f[0],sg=f[1]==='+'?1:-1;const span=ax==='x'?d:w;const n=Math.max(1,Math.floor(span/3.4));
    for(let i=0;i<n;i++){const off=-span/2+span*(i+0.5)/n;const fx=ax==='x'?x+sg*(w/2+0.02):x+off,fz=ax==='x'?z+off:z+sg*(d/2+0.02);
      const open=Math.random()<0.25;inst(G.box,0,fx,1.3,fz,ax==='x'?0.04:span/n-0.3,2.6,ax==='x'?span/n-0.3:0.04,{cast:false,mat:open?M(0x0d0d0d):shutterMat});}
    if(o.signs!==false&&kind!=='glass'){const sh=SHOPS[shopI++%SHOPS.length];const sx=ax==='x'?x+sg*(w/2+0.06):x,sz=ax==='x'?z:z+sg*(d/2+0.06);
      const tilt=Math.random()<0.2?rand(-0.15,0.15):0;sign(sx,3.3,sz,Math.min(span*0.85,9),1.15,sh[0],sh[1],sh[2],ax==='x'?(sg>0?Math.PI/2:-Math.PI/2):(sg>0?0:Math.PI),{tilt});}
    // awning
    if(kind==='res'&&Math.random()<0.5){const ax2=ax;deco(ax2==='x'?x+sg*(w/2+0.6):x,2.75,ax2==='x'?z:z+sg*(d/2+0.6),ax2==='x'?1.2:w*0.9,0.06,ax2==='x'?d*0.9:1.2,pick([0x6a3b2a,0x2f4f5a,0x7a6a3a,0x8a2a22]),{cast:true,rz:ax2==='x'?-sg*0.2:0,rx:ax2==='z'?sg*0.2:0});}
  }
  if(o.damaged){const sx=x+rand(-w/3,w/3),sz=z+rand(-d/3,d/3);deco(sx,h+0.4,sz,rand(1.5,3),0.8,rand(1.5,3),0x2a2522,{geo:G.rubble,cast:true});if(o.face){const f=o.face,sg=f[1]==='+'?1:-1;rubble(f[0]==='x'?x+sg*(w/2+0.8):x+rand(-w/3,w/3),f[0]==='x'?z+rand(-d/3,d/3):z+sg*(d/2+0.8),7,0.9);}}
  blob(x,z,w+2.4,d+2.4);
  return h;
}
// fill a rectangular city block with lots of buildings
function cityBlock(x0,x1,z0,z1,o){
  o=o||{};const face=o.face||'x+';const along=face[0]==='x'?'z':'x';
  const a0=along==='z'?z0:x0,a1=along==='z'?z1:x1;let a=a0,maxH=0;
  while(a<a1-0.5){let w=Math.min(a1-a,rand(o.lot?o.lot[0]:6.5,o.lot?o.lot[1]:10));if(a1-(a+w)<4)w=a1-a;const c=a+w/2;
    let bx,bz,bw,bd;if(along==='z'){bx=(x0+x1)/2;bz=c;bw=x1-x0;bd=w-0.2;}else{bx=c;bz=(z0+z1)/2;bw=w-0.2;bd=z1-z0;}
    const hh=building(bx,bz,bw,bd,rand(o.h?o.h[0]:9,o.h?o.h[1]:19),o.color||pick(o.palette||FACADES),{kind:o.kind||'res',face,signs:o.signs,damaged:Math.random()<(o.dmg??0.25)});maxH=Math.max(maxH,hh);a+=w;}
  // one solid for the whole block: no 0.2 m notches between buildings for the player to catch on
  addSolid(x0,x1,z0,z1,0,Math.min(4,maxH));
}
function gopuram(x,z,s){
  const stone=0xc8b48a,cols=[0xd88a8a,0x8ac4b8,0xe0c070,0xb89ad0,0xe0a070];
  box(x,z,10*s,7*s,5*s,stone);deco(x,2*s,z+3.52*s,2.4*s,4*s,0.05,0x0e0c0a);
  let w=9.4*s,d=6.4*s,y=5*s;for(let i=0;i<7;i++){const hh=1.7*s;deco(x,y+hh/2,z,w,hh,d,cols[i%cols.length],{cast:true});deco(x,y+hh-0.1,z,w+0.3,0.2,d+0.3,0xe8dcc0,{cast:true});
    for(let k=-2;k<=2;k++)deco(x+k*w/5.5,y+hh*0.5,z+d/2+0.08,0.35*s,hh*0.6,0.15,0xf0e4c8);y+=hh;w*=0.84;d*=0.82;}
  deco(x,y+0.8*s,z,w*1.1,1.6*s,d*1.4,0xd8a870,{geo:G.halfCyl,rz:Math.PI/2,ry:Math.PI/2,cast:true});
  for(let k=-2;k<=2;k++){deco(x+k*w/5,y+1.9*s,z,0.25*s,0.6*s,0.25*s,0xe0b030,{geo:G.cone});}
  addSolid(x-5*s,x+5*s,z-3.5*s,z+3.5*s,0,y+2);blob(x,z,13*s,10*s);
}
function mandapam(x,z,nx,nz,sp){for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const px=x+(i-(nx-1)/2)*sp,pz=z+(j-(nz-1)/2)*sp;box(px,pz,0.55,0.55,3.6,0xb8a47a);deco(px,3.5,pz,0.8,0.25,0.8,0xa8946a,{cast:true});}
  deco(x,3.85,z,nx*sp+0.6,0.35,nz*sp+0.6,0xa89466,{cast:true});deco(x,0.15,z,nx*sp+1,0.3,nz*sp+1,0xb8a47a);}
function hut(x,z,ry){
  const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),cast:true,mat:ex&&ex.mat});};
  P2(0,1.0,0,3.2,2.0,3.6,pick([0x9a7a55,0xa88a62,0x8a6c4a]));P2(0,0.85,1.81,0.9,1.7,0.04,0x15100a);
  P2(0,2.75,0,4.0,1.6,4.4,0,{geo:G.cone4,mat:thatchMat});
  const hw=Math.abs(Math.cos(ry))*1.6+Math.abs(Math.sin(ry))*1.8,hd=Math.abs(Math.sin(ry))*1.6+Math.abs(Math.cos(ry))*1.8;addSolid(x-hw,x+hw,z-hd,z+hd,0,3.4);blob(x,z,4.5,5);
}
function boat(x,z,ry,cols){
  const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rx:ex&&ex.rx||0,rz:ex&&ex.rz||0,cast:true});};
  cols=cols||pick([[0x2a6fb0,0xe0b020],[0xc23b22,0xf2f2f2],[0x2f8a5a,0xf2d040],[0xe8e2d0,0x2a6fb0]]);
  P2(0,0.5,0,1.7,0.9,4.6,cols[0]);P2(0,0.45,2.6,1.2,0.8,1.0,cols[0],{ry:Math.PI/4,geo:G.box});P2(0,0.8,0,1.76,0.16,4.62,cols[1]);
  P2(0,0.97,0.6,1.5,0.06,0.3,0x6b4a2b);P2(0,0.97,-1,1.5,0.06,0.3,0x6b4a2b);P2(0,0.85,-2.4,0.25,0.8,0.25,0x222222);
  for(let i=0;i<3;i++)P2(rand(-.4,.4),1.0,rand(-1.5,1.5),rand(.4,.8),0.12,rand(.4,.8),0x6a8a6a,{geo:G.sphereLo});
  const hw=Math.abs(Math.cos(ry))*0.9+Math.abs(Math.sin(ry))*2.9,hd=Math.abs(Math.sin(ry))*0.9+Math.abs(Math.cos(ry))*2.9;addSolid(x-hw,x+hw,z-hd,z+hd,0,1.05);blob(x,z,2.4,6,ry);
}
