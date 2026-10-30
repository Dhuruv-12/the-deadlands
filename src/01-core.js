'use strict';
const $=id=>document.getElementById(id);
const rand=(a,b)=>a+Math.random()*(b-a);
const irand=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const pick=a=>a[(Math.random()*a.length)|0];
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
const easeOut=t=>1-Math.pow(1-clamp(t,0,1),3);
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);

if(!window.THREE){document.querySelector('.lede').textContent='The 3D engine failed to load. Check your connection and reload the page.';throw new Error('THREE missing');}

/* ================= renderer & lights ================= */
const canvas=$('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
renderer.autoClear=false;
const MAX_ANISO=Math.min(8,renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():1);

const scene=new THREE.Scene();
let BASE_FOV=74;
const camera=new THREE.PerspectiveCamera(BASE_FOV,innerWidth/innerHeight,0.05,700);
camera.rotation.order='YXZ';
scene.add(camera);
const hemi=new THREE.HemisphereLight(0xffffff,0x444444,0.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,1);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-44,right:44,top:44,bottom:-44,near:1,far:280});
sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;
scene.add(sun);scene.add(sun.target);
const sunDir=new THREE.Vector3(0,1,0);
const flashLight=new THREE.PointLight(0xffc070,0,16,2);scene.add(flashLight);
const fireLights=[0,1].map(()=>{const l=new THREE.PointLight(0xff7a2a,0,22,2);scene.add(l);return l;});
const sparkLight=new THREE.PointLight(0xa8d8ff,0,14,2);scene.add(sparkLight);
const bossLight=new THREE.PointLight(0xffa040,0,12,2);scene.add(bossLight);
const molotovLight=new THREE.PointLight(0xff7a2a,0,16,2);scene.add(molotovLight);

// viewmodel scene (drawn on top of the world)
const vmScene=new THREE.Scene();
const vmCam=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,0.01,10);
const vmHemi=new THREE.HemisphereLight(0xffffff,0x666666,1.2);vmScene.add(vmHemi);
const vmDir=new THREE.DirectionalLight(0xffffff,1.0);vmDir.position.set(1,2,1.2);const vmFill=new THREE.DirectionalLight(0xffffff,0.35);vmFill.position.set(-1.5,0.5,1);vmScene.add(vmFill);vmScene.add(vmDir);
const vmFlash=new THREE.PointLight(0xffb060,0,2,2);vmFlash.position.set(0.15,-0.05,-0.6);vmScene.add(vmFlash);

addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=vmCam.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();vmCam.updateProjectionMatrix();});

/* ================= shared geometry / materials ================= */
function lumpy(geo,amt,seed){
  const p=geo.attributes.position,v=new THREE.Vector3(),s=seed||1;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const h=Math.sin(v.x*12.9898*s+v.y*78.233+v.z*37.719*s)*43758.5453;const n=(h-Math.floor(h))-0.5;v.multiplyScalar(1+n*amt);p.setXYZ(i,v.x,v.y,v.z);}
  geo.computeVertexNormals();return geo;
}
const G={
  box:new THREE.BoxGeometry(1,1,1),
  cyl:new THREE.CylinderGeometry(0.5,0.5,1,12),
  cyl6:new THREE.CylinderGeometry(0.5,0.5,1,6),
  taper:new THREE.CylinderGeometry(0.35,0.5,1,8),
  cone4:new THREE.ConeGeometry(0.71,1,4),
  cone:new THREE.ConeGeometry(0.5,1,10),
  sphere:new THREE.SphereGeometry(0.5,14,10),
  sphereLo:new THREE.SphereGeometry(0.5,8,6),
  rock:new THREE.DodecahedronGeometry(0.5,0),
  rubble:lumpy(new THREE.IcosahedronGeometry(0.5,1),0.55,1),
  canopy:lumpy(new THREE.IcosahedronGeometry(0.5,1),0.35,2.3),
  fungus:lumpy(new THREE.IcosahedronGeometry(0.5,1),0.8,3.7),
  plane:new THREE.PlaneGeometry(1,1),
  halfCyl:new THREE.CylinderGeometry(0.5,0.5,1,14,1,true,-Math.PI/2,Math.PI),
  ring:new THREE.RingGeometry(0.86,1,48),
};
G.cone4.rotateY(Math.PI/4);
G.cross=(()=>{const a=new THREE.PlaneGeometry(1,1);a.translate(0,0.5,0);const b=a.clone();b.rotateY(Math.PI/2);const pos=[...a.attributes.position.array,...b.attributes.position.array],uv=[...a.attributes.uv.array,...b.attributes.uv.array],nor=[...a.attributes.normal.array,...b.attributes.normal.array];const idx=[...a.index.array,...Array.from(b.index.array).map(i=>i+4)];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);return g;})();

const matCache=new Map();
function M(color,opts){const k=color+'|'+(opts?JSON.stringify(opts):'');let m=matCache.get(k);if(!m){m=new THREE.MeshStandardMaterial(Object.assign({color,roughness:0.88,metalness:0},opts||{}));matCache.set(k,m);}return m;}
function MB(color,opts){const k='b'+color+'|'+(opts?JSON.stringify(opts):'');let m=matCache.get(k);if(!m){m=new THREE.MeshBasicMaterial(Object.assign({color},opts||{}));matCache.set(k,m);}return m;}
function TM(key,make){let m=matCache.get(key);if(!m){m=make();matCache.set(key,m);}return m;}

/* ================= geometry merger (one mesh per body segment) ================= */
const NI=new Map();
function nonIndexed(geo){let g=NI.get(geo);if(!g){g=geo.index?geo.toNonIndexed():geo;NI.set(geo,g);}return g;}
const _m4=new THREE.Matrix4(),_m3=new THREE.Matrix3(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3(),_v2=new THREE.Vector3(),_s=new THREE.Vector3(),_c=new THREE.Color();
class Builder{
  constructor(){this.p=[];this.n=[];this.c=[];}
  add(geo,color,x,y,z,sx,sy,sz,rx,ry,rz,shade){
    const g=nonIndexed(geo);_m4.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(rx||0,ry||0,rz||0)),_s.set(sx,sy,sz));_m3.getNormalMatrix(_m4);
    const P=g.attributes.position,N=g.attributes.normal;_c.set(color);const sh=shade||1;
    for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(_m4);this.p.push(_v.x,_v.y,_v.z);_v2.fromBufferAttribute(N,i).applyMatrix3(_m3).normalize();this.n.push(_v2.x,_v2.y,_v2.z);const k=sh*(0.94+0.12*((i/3|0)%3)/2);this.c.push(_c.r*k,_c.g*k,_c.b*k);}
    return this;
  }
  box(color,x,y,z,sx,sy,sz,rx,ry,rz){return this.add(G.box,color,x,y,z,sx,sy,sz,rx,ry,rz);}
  build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeBoundingSphere();return g;}
}
const zMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.78,metalness:0});
const eyeMat=new THREE.MeshBasicMaterial({color:0xffd23f});
const eyeMatRed=new THREE.MeshBasicMaterial({color:0xff3a1a});

/* ================= world containers & instancing ================= */
let world=null,solids=[],levelDispose=[],batches=new Map();
const _o=new THREE.Object3D();
function inst(geo,color,x,y,z,sx,sy,sz,o){
  o=o||{};const mat=o.mat||M(color);const cast=o.cast!==false;
  const key=mat.uuid+'|'+geo.uuid+'|'+(cast?1:0);let b=batches.get(key);
  if(!b){b={geo,mat,cast,list:[]};batches.set(key,b);}
  _o.position.set(x,y,z);_o.rotation.set(o.rx||0,o.ry||0,o.rz||0);_o.scale.set(sx,sy,sz);_o.updateMatrix();b.list.push(_o.matrix.clone());
}
function instMatrix(geo,color,matrix,o){o=o||{};const mat=o.mat||M(color);const cast=o.cast!==false;const key=mat.uuid+'|'+geo.uuid+'|'+(cast?1:0);let b=batches.get(key);if(!b){b={geo,mat,cast,list:[]};batches.set(key,b);}b.list.push(matrix.clone());}
function rod(a,b,thick,color,o){const len=a.distanceTo(b);_o.position.copy(a).add(b).multiplyScalar(0.5);_o.scale.set(1,1,1);_o.rotation.set(0,0,0);_o.lookAt(b);_o.scale.set(thick,thick,len);_o.updateMatrix();instMatrix(G.box,color,_o.matrix,o);}
function flushInst(){
  for(const b of batches.values()){
    const m=new THREE.InstancedMesh(b.geo,b.mat,b.list.length);
    b.list.forEach((mx,i)=>m.setMatrixAt(i,mx));m.instanceMatrix.needsUpdate=true;
    m.castShadow=b.cast;m.receiveShadow=true;m.frustumCulled=false;world.add(m);levelDispose.push(m);
  }
  batches=new Map();
}
function clearWorld(){
  if(world)scene.remove(world);
  levelDispose.forEach(o=>{if(o&&o.dispose)o.dispose();});levelDispose=[];
  world=new THREE.Group();scene.add(world);solids=[];batches=new Map();
}
function addSolid(x0,x1,z0,z1,y0,y1){solids.push({x0,x1,z0,z1,y0,y1});}
// a rotated box (half sizes hw x hd in its own frame) as a row of thin AABB slices along its long side, so the
// collision hugs the visible shape instead of the padded bounding box of the whole rotated prop
function addSolidRot(x,z,ry,hw,hd,y0,y1){
  const ac=Math.abs(Math.cos(ry)),as=Math.abs(Math.sin(ry)),alongZ=hd>=hw,Lh=alongZ?hd:hw;
  const n=Math.min(ac,as)<0.02?1:Math.min(24,Math.ceil(Lh*2/0.5)),sh=Lh/n;
  for(let i=0;i<n;i++){const l=-Lh+(i+0.5)*2*sh,p=L(x,z,ry,alongZ?0:l,alongZ?l:0),ex=alongZ?hw:sh,ez=alongZ?sh:hd;
    const a=ac*ex+as*ez,b=as*ex+ac*ez;addSolid(p[0]-a,p[0]+a,p[1]-b,p[1]+b,y0,y1);}
}
// solid or decorative box. Small props go through instancing; textured or unique pieces become meshes.
function box(x,z,w,d,h,color,o){
  o=o||{};const y=o.y||0;let m=null;
  if(o.mesh||(o.mat&&!o.inst)){
    m=new THREE.Mesh(o.geo||G.box,o.mat||M(color));m.scale.set(w,h,d);m.position.set(x,y+h/2,z);if(o.rot)m.rotation.y=o.rot;
    m.castShadow=o.cast!==false;m.receiveShadow=true;world.add(m);
  }else inst(o.geo||G.box,color,x,y+h/2,z,w,h,d,{ry:o.rot||0,cast:o.cast,mat:o.mat});
  if(o.solid!==false){let hw=w/2,hd=d/2;if(o.rot){const c=Math.abs(Math.cos(o.rot)),s=Math.abs(Math.sin(o.rot));const a=hw*c+hd*s,b=hw*s+hd*c;hw=a;hd=b;}addSolid(x-hw,x+hw,z-hd,z+hd,y,y+h);}
  return m;
}
function cyl(x,z,r,h,color,o){return box(x,z,r*2,r*2,h,color,Object.assign({geo:G.cyl},o||{}));}
function deco(x,y,z,w,h,d,color,o){o=o||{};inst(o.geo||G.box,color,x,y,z,w,h,d,{rx:o.rx,ry:o.ry,rz:o.rz,cast:!!o.cast,mat:o.mat});}
// local->world for props rotated about Y
function L(x,z,ry,lx,lz){const c=Math.cos(ry),s=Math.sin(ry);return [x+lx*c+lz*s,z-lx*s+lz*c];}

/* ================= collision / rays ================= */
const STEP=0.32,HEAD=1.75;
function collide(p,r,feet){
  feet=feet||0;
  for(let k=0;k<solids.length;k++){const s=solids[k];if(s.y1<=feet+STEP||s.y0>=feet+HEAD)continue;
    if(p.x+r<s.x0||p.x-r>s.x1||p.z+r<s.z0||p.z-r>s.z1)continue;
    const cx=clamp(p.x,s.x0,s.x1),cz=clamp(p.z,s.z0,s.z1);let dx=p.x-cx,dz=p.z-cz;const d2=dx*dx+dz*dz;
    if(d2>=r*r)continue;
    if(d2>1e-8){const d=Math.sqrt(d2);p.x+=dx/d*(r-d);p.z+=dz/d*(r-d);}
    else{const l=p.x-s.x0,rr=s.x1-p.x,b=p.z-s.z0,t=s.z1-p.z,m=Math.min(l,rr,b,t);if(m===l)p.x=s.x0-r;else if(m===rr)p.x=s.x1+r;else if(m===b)p.z=s.z0-r;else p.z=s.z1+r;}
  }
  p.x=clamp(p.x,arena.x0+r,arena.x1-r);p.z=clamp(p.z,arena.z0+r,arena.z1-r);
}
function groundHeight(x,z,r,feet){
  let g=0;
  for(let k=0;k<solids.length;k++){const s=solids[k];if(s.y1>feet+STEP||s.y1<=g)continue;if(x+r*0.7<s.x0||x-r*0.7>s.x1||z+r*0.7<s.z0||z-r*0.7>s.z1)continue;g=s.y1;}
  return g;
}
function rayBox(ox,oy,oz,dx,dy,dz,s){
  let tmin=0,tmax=1e9,t1,t2,tt;
  if(Math.abs(dx)<1e-9){if(ox<s.x0||ox>s.x1)return Infinity;}else{t1=(s.x0-ox)/dx;t2=(s.x1-ox)/dx;if(t1>t2){tt=t1;t1=t2;t2=tt;}if(t1>tmin)tmin=t1;if(t2<tmax)tmax=t2;if(tmin>tmax)return Infinity;}
  if(Math.abs(dy)<1e-9){if(oy<s.y0||oy>s.y1)return Infinity;}else{t1=(s.y0-oy)/dy;t2=(s.y1-oy)/dy;if(t1>t2){tt=t1;t1=t2;t2=tt;}if(t1>tmin)tmin=t1;if(t2<tmax)tmax=t2;if(tmin>tmax)return Infinity;}
  if(Math.abs(dz)<1e-9){if(oz<s.z0||oz>s.z1)return Infinity;}else{t1=(s.z0-oz)/dz;t2=(s.z1-oz)/dz;if(t1>t2){tt=t1;t1=t2;t2=tt;}if(t1>tmin)tmin=t1;if(t2<tmax)tmax=t2;if(tmin>tmax)return Infinity;}
  return tmin;
}
function rayWorld(ox,oy,oz,dx,dy,dz,maxT){
  let best=maxT;
  for(const s of solids){if(s.y1-s.y0<0.05)continue;const t=rayBox(ox,oy,oz,dx,dy,dz,s);if(t<best)best=t;}
  if(dy<-1e-6){const tg=-oy/dy;if(tg<best)best=tg;}
  return best;
}
const _lb={x0:0,x1:0,y0:0,y1:0,z0:0,z1:0};
function clearLine(x1,z1,x2,z2){
  const dx=x2-x1,dz=z2-z1,Ln=Math.hypot(dx,dz);if(Ln<0.01)return true;const ux=dx/Ln,uz=dz/Ln;
  for(const s of solids){if(s.y1<=STEP||s.y0>1.2)continue;
    _lb.x0=s.x0-0.3;_lb.x1=s.x1+0.3;_lb.z0=s.z0-0.3;_lb.z1=s.z1+0.3;_lb.y0=-1;_lb.y1=9;
    const t=rayBox(x1,1,z1,ux,0,uz,_lb);if(t<Ln)return false;}
  return true;
}

/* ================= navigation (flow field) ================= */
let arena={x0:-20,x1:20,z0:-20,z1:20},NAV=null;
function buildNav(){
  const x0=Math.floor(arena.x0),z0=Math.floor(arena.z0),nx=Math.ceil(arena.x1)-x0,nz=Math.ceil(arena.z1)-z0;
  const blocked=new Uint8Array(nx*nz),m=0.45;
  for(const s of solids){if(s.y1<=STEP||s.y0>=HEAD)continue;
    const i0=Math.max(0,Math.floor(s.x0-m-x0)),i1=Math.min(nx-1,Math.floor(s.x1+m-x0)),j0=Math.max(0,Math.floor(s.z0-m-z0)),j1=Math.min(nz-1,Math.floor(s.z1+m-z0));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=x0+i+0.5,cz=z0+j+0.5;if(cx>s.x0-m&&cx<s.x1+m&&cz>s.z0-m&&cz<s.z1+m)blocked[j*nx+i]=1;}}
  NAV={x0,z0,nx,nz,blocked,dist:new Float32Array(nx*nz).fill(1e9),q:new Int32Array(nx*nz)};
}
function cellIndex(x,z){const i=Math.floor(x-NAV.x0),j=Math.floor(z-NAV.z0);if(i<0||j<0||i>=NAV.nx||j>=NAV.nz)return -1;return j*NAV.nx+i;}
const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function updateNav(){
  const N=NAV,d=N.dist,b=N.blocked,nx=N.nx,nz=N.nz,q=N.q;d.fill(1e9);
  let s=cellIndex(P.x,P.z);if(s<0)return;
  if(b[s]){const si=s%nx,sj=(s/nx)|0;let found=-1;for(let r=1;r<5&&found<0;r++)for(let dj=-r;dj<=r&&found<0;dj++)for(let di=-r;di<=r;di++){const i=si+di,j=sj+dj;if(i>=0&&j>=0&&i<nx&&j<nz&&!b[j*nx+i]){found=j*nx+i;break;}}if(found<0)return;s=found;}
  let h=0,t=0;d[s]=0;q[t++]=s;
  while(h<t){const c=q[h++],ci=c%nx,cj=(c/nx)|0,cd=d[c]+1;
    for(let k=0;k<8;k++){const i=ci+DIRS[k][0],j=cj+DIRS[k][1];if(i<0||j<0||i>=nx||j>=nz)continue;const n=j*nx+i;if(b[n]||d[n]<1e9)continue;
      if(k>=4&&(b[cj*nx+i]||b[j*nx+ci]))continue;d[n]=cd;q[t++]=n;}}
}
function navStep(c){
  const N=NAV,ci=c%N.nx,cj=(c/N.nx)|0;let best=N.dist[c],bn=-1;
  for(let k=0;k<8;k++){const i=ci+DIRS[k][0],j=cj+DIRS[k][1];if(i<0||j<0||i>=N.nx||j>=N.nz)continue;const n=j*N.nx+i;if(N.blocked[n])continue;if(k>=4&&(N.blocked[cj*N.nx+i]||N.blocked[j*N.nx+ci]))continue;const v=N.dist[n]+(k>=4?0.01:0);if(v<best){best=v;bn=n;}}
  return bn;
}
// follow the flow field a few cells ahead and aim at the furthest one with a clear line (smooths corners)
function navTarget(x,z){
  let c=cellIndex(x,z);if(c<0)return null;const pts=[];
  for(let k=0;k<5;k++){const n=navStep(c);if(n<0)break;pts.push(n);c=n;}
  if(!pts.length)return null;
  for(let k=pts.length-1;k>0;k--){const n=pts[k],px=NAV.x0+(n%NAV.nx)+0.5,pz=NAV.z0+((n/NAV.nx)|0)+0.5;if(clearLine(x,z,px,pz))return {x:px,z:pz};}
  const n=pts[0];return {x:NAV.x0+(n%NAV.nx)+0.5,z:NAV.z0+((n/NAV.nx)|0)+0.5};
}
function reachable(x,z){const c=cellIndex(x,z);return c>=0&&!NAV.blocked[c]&&NAV.dist[c]<1e9;}
