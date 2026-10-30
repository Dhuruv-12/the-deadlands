/* ================= player ================= */
const P={x:0,z:0,y:0,vy:0,grounded:true,yaw:0,pitch:0,recoilP:0,recoilY:0,hp:100,stam:100,vx:0,vz:0,bob:0,shake:0,crouch:0,crouchOn:false,landDip:0,aim:0,breath:false,tired:0,winded:false,stepT:0,inSpore:0,sporeDmg:0};
const W={
  knife:{name:'Knife',slot:1,melee:true,dmg:45,range:2.15,cd:0.34},
  // pistol: hard-hitting, slow and precise; rifle: lighter rounds, much faster fire, more sustained damage
  pistol:{name:'Pistol',slot:2,dmg:48,cd:0.3,mag:12,reload:1.35,reloadEmpty:1.55,spread:0.008,adsSpread:0.0018,auto:false},
  rifle:{name:'Assault Rifle',slot:3,dmg:24,cd:0.085,mag:30,reload:2.0,reloadEmpty:2.5,spread:0.03,adsSpread:0.0015,auto:true},
  stick:{name:'Stick',slot:4,melee:true,dmg:75,range:2.6,cd:0.8,dur:8},
  rock:{name:'Rocks',slot:5,thrown:true,dmg:50,cd:0.62},
  molotov:{name:'Molotov',slot:6,thrown:true,cd:0.8},
  urundai:{name:'Urundai Bomb',slot:7,thrown:true,cd:0.9},
  // aruval: heavy Tamil billhook, waves 4-5 only, 2 strikes per blade; half damage to bosses
  aruval:{name:'Aruval',slot:8,melee:true,dmg:160,range:2.7,cd:0.95,dur:2},
};
const ORDER=['knife','pistol','rifle','stick','rock','molotov','urundai','aruval'];
const THROW_KEY={rock:'rocks',molotov:'molotov',urundai:'urundai'};
const THROW_MAX={rocks:12,molotov:5,urundai:3};
let SCOPE_FOV=2*Math.atan(Math.tan(BASE_FOV*Math.PI/360)/2)*180/Math.PI; // true 2x magnification
function recalcScope(){SCOPE_FOV=2*Math.atan(Math.tan(BASE_FOV*Math.PI/360)/2)*180/Math.PI;}
let inv,cur='pistol',fireCd=0,triggerDown=false,triggerFresh=false,rightDown=false;
let act=null; // current viewmodel action {type,t,dur,events,...}
let equipT=0,kickZ=0,kickR=0,slideT=0,swaySX=0,swaySY=0,swayTX=0,swayTY=0,mouseDX=0,mouseDY=0,sprintK=0,lastOut=0,slashSign=1;
function freshInv(){return {pistol:{mag:12,res:36},rifle:{mag:30,res:60},stick:0,rocks:3,molotov:0,urundai:0,aruval:0};}
function cloneInv(i){return JSON.parse(JSON.stringify(i));}
function has(w){if(w==='stick')return inv.stick>0;if(w==='aruval')return (inv.aruval||0)>0;if(THROW_KEY[w])return (inv[THROW_KEY[w]]||0)>0;return true;}
function reloading(){return act&&(act.type==='reloadP'||act.type==='reloadR');}
function equip(w,silent){if(!has(w)||w===cur)return;cur=w;act=null;equipT=0.35;fireCd=Math.max(fireCd,0.2);vmShow();if(!silent)(w==='pistol'||w==='rifle'?SFX.equipGun:SFX.equipSoft)();}
function cycle(dir){const n=ORDER.length;let i=ORDER.indexOf(cur);for(let k=0;k<n;k++){i=(i+dir+n)%n;if(has(ORDER[i])){equip(ORDER[i]);return;}}}
function startReload(){
  const w=W[cur];if(!w.mag||act||equipT>0)return;const a=inv[cur];if(a.mag>=w.mag||a.res<=0)return;
  const empty=a.mag===0;
  if(cur==='pistol')act={type:'reloadP',t:0,dur:empty?w.reloadEmpty:w.reload,empty,ev:[[0.15,()=>SFX.pMagOut()],[0.8,()=>SFX.pMagIn()],[empty?1.05:9,()=>SFX.pSlide()]]};
  else act={type:'reloadR',t:0,dur:empty?w.reloadEmpty:w.reload,empty,ev:[[0.28,()=>SFX.rMagOut()],[1.2,()=>{SFX.rMagIn();kickR+=0.05;}],[empty?1.75:9,()=>SFX.rCharge()]]};
}
function finishReload(){const w=W[cur],a=inv[cur];const n=Math.min(w.mag-a.mag,a.res);a.mag+=n;a.res-=n;}
const _dir=new THREE.Vector3(),_eul=new THREE.Euler(0,0,0,'YXZ');
function viewDir(spread){_eul.set(P.pitch+P.recoilP+rand(-spread,spread),P.yaw+P.recoilY+rand(-spread,spread),0);return new THREE.Vector3(0,0,-1).applyEuler(_eul);}
function camRight(){return new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw));}
function tryFire(){
  if(fireCd>0||equipT>0||state!=='playing'||qm)return;
  const w=W[cur];
  if(w.melee){if(act)return;if(cur==='aruval'&&!has('aruval'))return;fireCd=w.cd;   // a broken aruval can't be swung while it is being put away
    if(cur==='knife'){slashSign=-slashSign;act={type:'slash',t:0,dur:0.32,sign:slashSign,ev:[[0.09,()=>meleeHit('knife')]]};SFX.knifeSwish();}
    else if(cur==='aruval'){act={type:'chop',t:0,dur:0.85,ev:[[0.27,()=>SFX.aruvalWhoosh()],[0.37,()=>meleeHit('aruval')]]};}
    else{act={type:'swing',t:0,dur:0.78,ev:[[0.27,()=>SFX.stickWhoosh()],[0.36,()=>meleeHit('stick')]]};}
    if(P.aim>0)P.aim=0;return;}
  if(w.thrown){const key=THROW_KEY[cur];if(inv[key]<=0||act)return;fireCd=w.cd;const kind=cur;act={type:'throw',t:0,dur:0.6,ev:[[0.24,()=>throwItem(kind)]]};if(kind==='urundai')SFX.fuse();return;}
  if(reloading()||act)return;
  const a=inv[cur];
  if(a.mag<=0){if(a.res>0)startReload();else{SFX.empty();fireCd=0.25;if(performance.now()-lastOut>2500){toast('Out of ammo. Switch to the knife, rocks or a stick');lastOut=performance.now();}}return;}
  a.mag--;fireCd=w.cd;stats.shots++;
  const scoped=P.aim>0.7;
  // recoil is applied after the bullet leaves (below), so the shot goes where the crosshair was
  const recP=cur==='pistol'?(scoped?0.022:0.032):(scoped?0.0085:0.011);
  if(cur==='pistol'){SFX.pistol();kickZ+=0.05;kickR+=0.16;slideT=0.09;}else{SFX.rifle();kickZ+=0.032;kickR+=0.05;}
  P.shake=Math.max(P.shake,cur==='rifle'?0.12:0.15);
  const moveSpread=Math.min(1,Math.hypot(P.vx,P.vz)/6)*0.02*(1-P.aim)+(P.grounded?0:0.03);
  const preKick=Math.max(0,kickR-(cur==='pistol'?0.16:0.05));
  const spread=lerp(w.spread*(0.5+Math.min(1,preKick*3)*0.5),w.adsSpread,P.aim)+moveSpread;
  const d=viewDir(spread);const o=camera.position.clone();
  const tWall=rayWorld(o.x,o.y,o.z,d.x,d.y,d.z,180);
  let best=null;
  for(const z of zombies){if(z.dead)continue;const h=rayZombie(o,d,z);if(h&&h.t<tWall&&(!best||h.t<best.t))best={z,t:h.t,y:h.y};}
  const end=o.clone().addScaledVector(d,best?best.t:tWall);
  P.recoilP+=recP;P.recoilY+=rand(-0.006,0.006);
  const R=camRight();const muzzle=o.clone().addScaledVector(d,0.7).addScaledVector(R,scoped?0:0.13).add(new THREE.Vector3(0,scoped?-0.05:-0.12,0));
  tracer(muzzle,end);
  flashLight.position.copy(muzzle);flashLight.intensity=cur==='rifle'?2.6:2.0;vmFlash.intensity=3;muzzleT=0.05;muzzleFlash.visible=!scoped;muzzleFlash.scale.setScalar(cur==='rifle'?rand(0.2,0.28):rand(0.13,0.17));muzzleFlash.material.rotation=rand(0,6.28);
  // shell casing out of the ejection port
  const sp=o.clone().addScaledVector(d,0.35).addScaledVector(R,0.16).add(new THREE.Vector3(0,-0.08,0));
  ejectShell(sp,R.clone().multiplyScalar(rand(1.6,2.6)).add(new THREE.Vector3(P.vx*0.8,rand(1.8,2.6),P.vz*0.8)).addScaledVector(d,-0.4),cur==='rifle');
  makeNoise(P.x,P.z,cur==='rifle'?48:38,'shot');
  if(best){const z=best.z;if(z.type==='kaalan')z.gunHit=true;   // shot once: blades work on this Kaalan from now on
    const head=best.y>z.h*(z.boss?0.82:0.8);const killed=hurtZombie(z,w.dmg*(head?(z.boss?1:2.5):1),{head,dir:d,kx:d.x*1.6,kz:d.z*1.6,heavy:head&&!z.boss&&z.type!=='thadiyan'&&Math.random()<0.5,stun:0.35});stats.hits++;if(head)stats.heads++;flashHit(head,killed);
    burst(end.x,end.y,end.z,0x7a0a0a,4,2.5,0.05,0.4,{dir:d,spread:0.6});}
  else{burst(end.x,end.y,end.z,0xb8a080,5,2.5,0.04,0.4);burst(end.x,end.y,end.z,0xffd080,3,4,0.02,0.15,{add:true});puff(end.x,end.y,end.z,0x8a8070,0.4,0.6,0.3,0.3);}
  if(a.mag<=0&&a.res>0)setTimeout(()=>{if(state==='playing'&&!act)startReload();},200);
}
let resistTipT=-99;
function meleeResisted(z,fx,fz){
  const hx=z.x-fx*z.r,hz=z.z-fz*z.r,hy=z.h*0.65;
  burst(hx,hy,hz,0xd8c9a3,8,3,0.07,0.6,{dir:new THREE.Vector3(-fx,0.5,-fz),spread:0.8});burst(hx,hy,hz,0xfff0c0,5,4,0.025,0.25,{add:true,grav:6});
  SFX.meleeResist();P.shake=Math.max(P.shake,0.12);
  if(T-resistTipT>4){resistTipT=T;toast('The Kaalan shrugs off melee. Shoot it first');}
}
function meleeHit(which){
  if(state!=='playing')return;
  const w=W[which];const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);const wide=which==='stick'||which==='aruval';
  const targets=zombies.filter(z=>!z.dead&&!(z.boss&&z.bs==='emerge')).map(z=>{const dx=z.x-P.x,dz=z.z-P.z,d=Math.hypot(dx,dz);return {z,d,dot:(dx*fx+dz*fz)/(d||1)};}).filter(o=>o.d-o.z.r<=w.range&&o.dot>(wide?0.35:0.5)).sort((a,b)=>a.d-b.d);
  const n=wide?2:1;let hitAny=false,resisted=false;
  for(const o of targets.slice(0,n)){const z=o.z;
    // Kaalan: melee does nothing until it has taken at least one bullet
    if(z.type==='kaalan'&&!z.gunHit){resisted=true;meleeResisted(z,fx,fz);continue;}
    const head=P.pitch>0.08;const k=which==='stick'?7:which==='aruval'?9:3;
    const dmg=w.dmg*(head?1.4:1)*(which==='aruval'&&z.boss?0.5:1);
    const killed=hurtZombie(z,dmg,{head:false,dir:new THREE.Vector3(fx,0,fz),kx:fx*k*(z.boss?0.1:1),kz:fz*k*(z.boss?0.1:1),heavy:which!=='knife',stun:which==='stick'?0.8:which==='aruval'?1.0:0.3});
    hitAny=true;flashHit(false,killed);
    const hx=z.x-fx*z.r,hz=z.z-fz*z.r;burst(hx,z.h*0.65,hz,0x7a0a0a,which==='aruval'?16:which==='stick'?10:7,which==='aruval'?5:which==='stick'?4:3,0.06,0.5,{dir:new THREE.Vector3(fx,0.3,fz),spread:0.7});
    if(which==='aruval')burst(hx,z.h*0.72,hz,0x5a0505,10,6,0.05,0.6,{dir:new THREE.Vector3(-fz*0.6+fx*0.5,0.45,fx*0.6+fz*0.5),spread:0.4,stretch:1.6});}
  if(hitAny)stats.hits++;
  if(hitAny){if(which==='stick'){SFX.stickHit();P.shake=Math.max(P.shake,0.35);kickR+=0.12;inv.stick--;if(inv.stick<=0){SFX.snap?SFX.snap():0;toast('Your stick broke');setTimeout(()=>{if(cur==='stick')equip('knife');},300);}}
    else if(which==='aruval'){SFX.aruvalHit();P.shake=Math.max(P.shake,0.5);kickR+=0.16;inv.aruval--;
      if(inv.aruval<=0){SFX.aruvalBreak();toast('The aruval snapped');setTimeout(()=>{if(cur==='aruval')equip('knife');},350);}else toast(`Aruval: ${inv.aruval} strike left`);}
    else{SFX.knifeHit();P.shake=Math.max(P.shake,0.18);}makeNoise(P.x,P.z,6,'melee');}
  else if(resisted)makeNoise(P.x,P.z,6,'melee');
  stats.shots++;
}
SFX.snap=()=>{sNoise(0.18,'highpass',1800,0.4);sTone('square',300,120,0.08,0.15);};
let rocksInAir=[];
function throwRock(){
  if(inv.rocks<=0)return;inv.rocks--;SFX.throwRock();stats.shots++;
  const d=viewDir(0);const p=camera.position.clone().addScaledVector(d,0.6).addScaledVector(camRight(),0.15);p.y-=0.05;
  const m=new THREE.Mesh(G.rubble,M(0x8d8a84));m.scale.setScalar(0.2);m.castShadow=true;scene.add(m);
  rocksInAir.push({p,v:d.multiplyScalar(24).add(new THREE.Vector3(P.vx*0.5,3.2,P.vz*0.5)),m,t:0});
  if(inv.rocks<=0)setTimeout(()=>{if(cur==='rock'&&inv.rocks<=0)cycle(-1);},450);
}
function updateRocks(dt){
  for(const r of rocksInAir){
    r.t+=dt;r.v.y-=16*dt;r.p.addScaledVector(r.v,dt);r.m.position.copy(r.p);r.m.rotation.x+=dt*12;r.m.rotation.y+=dt*7;
    if(Math.random()<dt*30)burst(r.p.x,r.p.y,r.p.z,0xc8b898,1,0.2,0.025,0.35,{grav:0});
    let hit=false;
    for(const z of zombies){if(z.dead)continue;const y0=z.boss?z.mesh.position.y:0;if(Math.hypot(r.p.x-z.x,r.p.z-z.z)<z.r*(z.boss?1.6:1)+0.25&&r.p.y>y0&&r.p.y<y0+z.h){const head=r.p.y-y0>z.h*0.82;
      const killed=hurtZombie(z,W.rock.dmg*(head?2:1),{head,kx:r.v.x*0.3,kz:r.v.z*0.3,heavy:true,stun:1.0});SFX.rockHit(r.p);stats.hits++;flashHit(head,killed);hit=true;break;}}
    if(!hit){for(const s of solids){if(r.p.x>s.x0&&r.p.x<s.x1&&r.p.z>s.z0&&r.p.z<s.z1&&r.p.y>s.y0&&r.p.y<s.y1){hit=true;break;}}}
    if(hit||r.p.y<=0.06||r.t>4){r.done=true;scene.remove(r.m);const inside=!(r.p.x<arena.x0||r.p.x>arena.x1||r.p.z<arena.z0||r.p.z>arena.z1);
      if(inside)dropPickup('rock',r.p.x-r.v.x*0.02,r.p.z-r.v.z*0.02,1);burst(r.p.x,Math.max(0.1,r.p.y),r.p.z,0x8d8a84,5,2.5,0.05,0.4);puff(r.p.x,0.3,r.p.z,0x9a8a70,0.6,0.8,0.3,0.35);
      SFX.rockGround(r.p);makeNoise(r.p.x,r.p.z,13,'rock');}
  }
  rocksInAir=rocksInAir.filter(r=>!r.done);
}
/* ================= Molotov & Urundai bomb ================= */
const glassMat=new THREE.MeshStandardMaterial({color:0x4a7a3a,roughness:0.1,metalness:0.1,transparent:true,opacity:0.75});
const ragMat=new THREE.MeshStandardMaterial({color:0xd8ccb0,roughness:1});
const bombMat=new THREE.MeshStandardMaterial({color:0x5a4028,roughness:0.95});
const twineMat=new THREE.MeshStandardMaterial({color:0xc8b080,roughness:1});
const G_TORUS=new THREE.TorusGeometry(0.5,0.06,5,16);
function flameSprite(s,add){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:add?muzzleTex:flameTex,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.scale.set(s,s*1.3,1);return sp;}
function makeThrowMesh(kind){
  const g=new THREE.Group();
  if(kind==='molotov'){const b=new THREE.Mesh(G.cyl,glassMat);b.scale.set(0.11,0.22,0.11);g.add(b);const n=new THREE.Mesh(G.cyl,glassMat);n.scale.set(0.045,0.1,0.045);n.position.y=0.15;g.add(n);
    const r=new THREE.Mesh(G.box,ragMat);r.scale.set(0.05,0.1,0.05);r.position.y=0.22;r.rotation.z=0.3;g.add(r);const f=flameSprite(0.22);f.position.y=0.3;g.add(f);g.userData.flame=f;}
  else{const b=new THREE.Mesh(G.canopy,bombMat);b.scale.setScalar(0.2);g.add(b);for(let i=0;i<3;i++){const t=new THREE.Mesh(G_TORUS,twineMat);t.scale.setScalar(0.205);t.rotation.set(i===0?Math.PI/2:0,i*1.05,0);g.add(t);}
    const fz=new THREE.Mesh(G.cyl,twineMat);fz.scale.set(0.012,0.08,0.012);fz.position.y=0.12;g.add(fz);const sp=flameSprite(0.12,true);sp.position.y=0.17;g.add(sp);g.userData.spark=sp;}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;
}
let bombs=[];
function throwItem(kind){
  if(kind==='rock'){throwRock();return;}
  const key=THROW_KEY[kind];if(inv[key]<=0)return;inv[key]--;SFX.throwRock();stats.shots++;
  const d=viewDir(0);const p=camera.position.clone().addScaledVector(d,0.6).addScaledVector(camRight(),0.15);p.y-=0.05;
  const m=makeThrowMesh(kind);m.position.copy(p);scene.add(m);
  bombs.push({kind,p,v:d.multiplyScalar(kind==='urundai'?21:20).add(new THREE.Vector3(P.vx*0.5,3.6,P.vz*0.5)),m,t:0,done:false});
  if(inv[key]<=0)setTimeout(()=>{if(cur===kind&&inv[key]<=0)cycle(-1);},450);
}
function updateBombs(dt){
  for(const b of bombs){if(b.done)continue;
    b.t+=dt;b.v.y-=16*dt;b.p.addScaledVector(b.v,dt);b.m.position.copy(b.p);b.m.rotation.x+=dt*9;b.m.rotation.z+=dt*5;
    if(b.kind==='molotov'){b.m.userData.flame.scale.set(0.2+Math.random()*0.08,0.28+Math.random()*0.1,1);if(Math.random()<dt*25)burst(b.p.x,b.p.y+0.15,b.p.z,0xffa040,1,0.4,0.03,0.3,{add:true,grav:-2});}
    else{const s=0.1+Math.random()*0.08;b.m.userData.spark.scale.set(s,s,1);if(Math.random()<dt*40)burst(b.p.x,b.p.y+0.15,b.p.z,0xffe080,1,1.5,0.02,0.25,{add:true,grav:4});}
    let hitZ=null;
    for(const z of zombies){if(z.dead)continue;const y0=z.boss?z.mesh.position.y:0;if(Math.hypot(b.p.x-z.x,b.p.z-z.z)<z.r*(z.boss?1.6:1)+0.25&&b.p.y>y0&&b.p.y<y0+z.h){hitZ=z;break;}}
    let hit=!!hitZ;if(!hit){for(const s of solids){if(b.p.x>s.x0&&b.p.x<s.x1&&b.p.z>s.z0&&b.p.z<s.z1&&b.p.y>s.y0&&b.p.y<s.y1){hit=true;break;}}}
    if(hit||b.p.y<=0.08||b.t>5){b.done=true;scene.remove(b.m);const x=b.p.x-b.v.x*0.02,z=b.p.z-b.v.z*0.02;
      if(b.kind==='molotov')igniteFire(x,z,hitZ);else explode(x,Math.max(0.3,b.p.y),z);}
  }
  bombs=bombs.filter(b=>!b.done);
}
const FLAMES=[];for(let i=0;i<64;i++){const s=flameSprite(1);s.visible=false;scene.add(s);FLAMES.push({s,used:false,ph:0,ox:0,oz:0});}
function takeFlame(){const f=FLAMES.find(f=>!f.used);if(f){f.used=true;f.s.visible=true;f.ph=rand(0,6);}return f;}
function freeFlame(f){if(!f)return;f.used=false;f.s.visible=false;}
let fireZones=[];
function igniteFire(x,z,hitZ){
  const t={x,z};collide(t,0.2,0);x=t.x;z=t.z;
  SFX.glass({x,z});SFX.whoosh({x,z});
  burst(x,0.5,z,0x9ac080,12,4,0.035,0.7);burst(x,0.6,z,0xffb040,16,5,0.05,0.6,{add:true,grav:3});
  const fz={x,z,r:3.3,t:7.5,max:7.5,flames:[],tick:0};
  for(let k=0;k<10;k++){const f=takeFlame();if(!f)break;const a=rand(0,6.28),r=Math.sqrt(Math.random())*fz.r*0.8;f.ox=x+Math.cos(a)*r;f.oz=z+Math.sin(a)*r;fz.flames.push(f);}
  fireZones.push(fz);if(hitZ&&!hitZ.boss)hitZ.burn=4;makeNoise(x,z,18,'shot');
  bloodDecal(x,z,fz.r*2,{life:30});const dd=DECALS[(decalI-1)%DECALS.length];dd.m.material.color.set(0x151210);
}
function updateFires(dt){
  let near=1e9,best=null;
  for(const fz of fireZones){fz.t-=dt;const age=fz.max-fz.t,amp=Math.min(1,age/0.3)*Math.min(1,fz.t/1.5);
    for(const f of fz.flames){f.ph+=dt*rand(5,9);const h=(0.9+Math.sin(f.ph)*0.25)*amp*1.6;f.s.scale.set(h*0.9,h*1.5,1);f.s.position.set(f.ox+Math.sin(f.ph*0.7)*0.08,h*0.62,f.oz);f.s.material.opacity=0.85*amp;}
    if(Math.random()<dt*6*amp)puff(fz.x+rand(-2,2),1.8,fz.z+rand(-2,2),0x2a2420,2,rand(2.5,4),1.4,0.45);
    if(Math.random()<dt*10*amp)burst(fz.x+rand(-2,2),0.4,fz.z+rand(-2,2),0xffa040,1,1.5,0.03,0.8,{add:true,grav:-2.5});
    fz.tick-=dt;if(fz.tick<=0){fz.tick=0.25;
      for(const z of zombies){if(z.dead)continue;if(Math.hypot(z.x-fz.x,z.z-fz.z)<fz.r+z.r*0.5){if(z.boss)hurtZombie(z,4,{burn:true});else{z.burn=Math.max(z.burn||0,3);hurtZombie(z,6,{burn:true});z.flinch=Math.max(z.flinch,0.25);}}}
      if(Math.hypot(P.x-fz.x,P.z-fz.z)<fz.r&&P.y<0.5&&state==='playing'){hurtPlayer(2.5,null,0,true);if(!P.fireWarn||T-P.fireWarn>3){P.fireWarn=T;toast("You're standing in fire");}}}
    const d=Math.hypot(P.x-fz.x,P.z-fz.z);if(d<near){near=d;best=fz;}
    if(fz.t<=0){fz.flames.forEach(freeFlame);fz.flames=[];}
  }
  fireZones=fireZones.filter(f=>f.t>0);
  // burning infected
  for(const z of zombies){if(z.burn>0&&!z.dead&&!z.boss){z.burn-=dt;z.burnTick=(z.burnTick||0)-dt;if(!z.flame)z.flame=takeFlame();
      if(z.flame){const s=0.9+Math.random()*0.3;z.flame.s.scale.set(s*z.s,s*1.6*z.s,1);z.flame.s.position.set(z.x,z.h*0.55,z.z);z.flame.s.material.opacity=0.8;}
      if(z.burnTick<=0){z.burnTick=0.3;hurtZombie(z,2.4,{burn:true});}if(Math.random()<dt*4)puff(z.x,z.h,z.z,0x2a2420,0.8,1.5,1.2,0.4);}
    if((z.burn<=0||z.dead)&&z.flame){if(!z.dead||z.deadT>2.5){freeFlame(z.flame);z.flame=null;}else z.flame.s.position.set(z.x,0.5,z.z);}}
  if(best){molotovLight.position.set(best.x,1.2,best.z);molotovLight.intensity=(2.4+Math.random()*0.8)*Math.min(1,best.t/1.5);}else molotovLight.intensity=0;
  if(crackleGain)crackleGain.gain.value=muted?0:Math.max(0,1-near/26)*0.35;
}
let blasts=[];
const blastRing=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({map:softTex,color:0xffc070,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));blastRing.rotation.x=-Math.PI/2;blastRing.visible=false;scene.add(blastRing);
function explode(x,y,z){
  SFX.boom({x,z});flashLight.position.set(x,y+1.2,z);flashLight.intensity=14;muzzleT=0;
  const fl=[];for(let i=0;i<6;i++){const f=takeFlame();if(!f)break;f.ox=x+rand(-0.8,0.8);f.oz=z+rand(-0.8,0.8);f.s.material.map=muzzleTex;fl.push(f);}
  blasts.push({x,y,z,t:0,fl});blastRing.visible=true;blastRing.position.set(x,0.1,z);
  for(let i=0;i<16;i++)puff(x+rand(-1.5,1.5),rand(0.5,2.5),z+rand(-1.5,1.5),pick([0x2a2420,0x3a3530,0x4a4038]),rand(2,3.5),rand(3,5),rand(1,2.2),0.6);
  for(let i=0;i<12;i++){const a=i/12*6.28;puff(x+Math.cos(a)*2.4,0.4,z+Math.sin(a)*2.4,0x9a8a70,1.8,1.6,0.3,0.5);}
  burst(x,y,z,0x3a342c,26,10,0.09,1.4);burst(x,y,z,0xffd080,20,9,0.04,0.5,{add:true,grav:6});burst(x,y,z,0xff8030,12,6,0.08,0.4,{add:true,grav:-1});
  bloodDecal(x,z,5,{life:60});DECALS[(decalI-1)%DECALS.length].m.material.color.set(0x0e0c0a);
  const R=7.5;
  for(const zb of zombies){if(zb.dead)continue;const d=Math.hypot(zb.x-x,zb.z-z);if(d>R+zb.r)continue;const f=clamp(1-d/R,0,1);if(f<=0)continue;
    const ux=(zb.x-x)/(d||1),uz=(zb.z-z)/(d||1);
    hurtZombie(zb,(zb.boss?135:180)*f+10,{heavy:true,blast:true,stun:1.4,kx:zb.boss?0:ux*13*f,kz:zb.boss?0:uz*13*f,dir:new THREE.Vector3(ux,0.4,uz),head:!zb.boss&&f>0.7&&Math.random()<0.4});
    if(!zb.boss&&!zb.dead&&f>0.4&&Math.random()<0.5)loseArm(zb);}
  const dp=Math.hypot(P.x-x,P.z-z);if(dp<5&&state==='playing')hurtPlayer(Math.round(50*(1-dp/5)),{x,z},10*(1-dp/5));
  P.shake=Math.max(P.shake,clamp(1.3-dp/22,0.15,1.3));makeNoise(x,z,60,'shot');
}
function updateBlasts(dt){
  for(const b of blasts){b.t+=dt;const k=b.t/0.6;
    b.fl.forEach((f,i)=>{const s=(1.5+i*0.4)*easeOut(Math.min(1,b.t/0.25))*(1-ease(seg(b.t,0.25,0.6)))*2.2;f.s.scale.set(s,s,1);f.s.position.set(f.ox,b.y+0.8+i*0.25+b.t*1.5,f.oz);f.s.material.opacity=1-ease(seg(b.t,0.3,0.6));});
    if(b.t<0.4){const r=8*easeOut(b.t/0.4);blastRing.scale.set(r*2,r*2,1);blastRing.material.opacity=0.9*(1-b.t/0.4);}else blastRing.visible=false;
    if(b.t>0.6){b.fl.forEach(f=>{f.s.material.map=flameTex;f.s.material.opacity=1;freeFlame(f);});b.fl=[];}}
  blasts=blasts.filter(b=>b.t<=0.6);
}
function clearThrowables(){bombs.forEach(b=>scene.remove(b.m));bombs=[];fireZones.forEach(f=>f.flames.forEach(freeFlame));fireZones=[];blasts.forEach(b=>b.fl.forEach(f=>{f.s.material.map=flameTex;freeFlame(f);}));blasts=[];FLAMES.forEach(f=>{f.used=false;f.s.visible=false;f.s.material.map=flameTex;});blastRing.visible=false;molotovLight.intensity=0;if(crackleGain)crackleGain.gain.value=0;}

/* ================= F: quick melee ================= */
let qm=null,qmCd=0;
function quickMelee(){
  if(state!=='playing'||qmCd>0||qm||equipT>0)return;
  if(cur==='knife'||cur==='stick'){if(!act&&fireCd<=0){tryFire();qmCd=0.3;}return;}
  qm={t:0,dur:0.42,done:false};qmCd=0.75;SFX.knifeSwish();
}

let hitT=0;
function flashHit(head,kill){const h=$('hitmark');h.classList.toggle('head',!!head);h.classList.toggle('kill',!!kill);h.style.opacity=1;hitT=kill?0.2:0.12;}
let vignetteT=0;
const dmgArcs=[];for(let i=0;i<4;i++){const d=document.createElement('div');d.className='dmgarc';$('dmgdir').appendChild(d);dmgArcs.push({el:d,t:0,x:0,z:0});}
function hurtPlayer(dmg,z,knock,silent){
  if(state!=='playing')return;
  P.hp-=dmg;if(!silent)SFX.hurt();P.shake=Math.max(P.shake,silent?0.1:Math.min(1,0.4+dmg/60));vignetteT=silent?0.2:0.5;
  if(z){const dx=P.x-z.x,dz=P.z-z.z,d=Math.hypot(dx,dz)||1;const k=knock||3;P.vx+=dx/d*k;P.vz+=dz/d*k;if(knock>8){P.vy=Math.max(P.vy,3.5);P.grounded=false;}
    const a=dmgArcs.find(a=>a.t<=0)||dmgArcs[0];a.t=1.2;a.x=z.x;a.z=z.z;}
  if(P.hp<=0){P.hp=0;die();}
}
function updateDmgArcs(dt){for(const a of dmgArcs){if(a.t<=0){a.el.style.opacity=0;continue;}a.t-=dt;const ang=Math.atan2(a.x-P.x,a.z-P.z);const rel=-(ang-(P.yaw+Math.PI));a.el.style.transform=`rotate(${rel}rad)`;a.el.style.opacity=Math.min(1,a.t*1.5);}}

/* ================= pickups ================= */
let pickups=[];
const glowMats={ammo:new THREE.MeshBasicMaterial({map:softTex,color:0xffb040,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.55,toneMapped:false}),med:new THREE.MeshBasicMaterial({map:softTex,color:0xff4040,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.55,toneMapped:false}),rock:new THREE.MeshBasicMaterial({map:softTex,color:0xd8d0c0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.3,toneMapped:false}),stick:new THREE.MeshBasicMaterial({map:softTex,color:0xffd090,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.4,toneMapped:false}),molotov:new THREE.MeshBasicMaterial({map:softTex,color:0xff8a30,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.6,toneMapped:false}),urundai:new THREE.MeshBasicMaterial({map:softTex,color:0xff5020,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.6,toneMapped:false})};
glowMats.aruval=new THREE.MeshBasicMaterial({map:softTex,color:0xb8c8d8,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.22,toneMapped:false});
const PICK={
  molotov:()=>{const g=makeThrowMesh('molotov');g.position.y=0.18;g.rotation.z=0.25;g.userData.flame.visible=false;const w=new THREE.Group();w.add(g);return w;},
  urundai:()=>{const g=makeThrowMesh('urundai');g.position.y=0.22;g.userData.spark.visible=false;const w=new THREE.Group();w.add(g);return w;},
  rock:()=>{const g=new THREE.Group();for(let i=0;i<3;i++){const m=new THREE.Mesh(G.rubble,M(0x8d8a84));m.scale.setScalar(rand(0.2,0.28));m.position.set(rand(-0.2,0.2),0.12,rand(-0.2,0.2));m.rotation.set(rand(0,3),rand(0,3),0);m.castShadow=true;g.add(m);}return g;},
  stick:()=>{const g=new THREE.Group();const m=new THREE.Mesh(G.taper,M(0x7a5530));m.scale.set(0.09,1.1,0.09);m.rotation.z=Math.PI/2;m.position.y=0.06;m.castShadow=true;g.add(m);for(const x of[-0.2,0.25]){const t=new THREE.Mesh(G.cyl,M(0x222222));t.scale.set(0.1,0.06,0.1);t.rotation.z=Math.PI/2;t.position.set(x,0.06,0);g.add(t);}return g;},
  aruval:()=>{const g=new THREE.Group();const b=new THREE.Mesh(aruvalBladeGeo(),VMM.blade);b.rotation.set(-Math.PI/2,0,0.4);b.position.set(0,0.05,0.08);b.castShadow=true;g.add(b);
    const h=new THREE.Mesh(G.cyl6,VMM.wood);h.scale.set(0.034,0.17,0.034);h.rotation.set(Math.PI/2,0,0.4);h.position.set(0.035,0.05,0.16);g.add(h);g.scale.setScalar(1.5);return g;},
  ammo:()=>{const g=new THREE.Group();const m=new THREE.Mesh(G.box,M(0x3c5a2a,{roughness:0.6,metalness:0.3}));m.scale.set(0.55,0.32,0.36);m.position.y=0.22;m.castShadow=true;g.add(m);const s=new THREE.Mesh(G.box,M(0xf2c230));s.scale.set(0.56,0.06,0.37);s.position.y=0.3;g.add(s);return g;},
  med:()=>{const g=new THREE.Group();const m=new THREE.Mesh(G.box,M(0xf2efe8,{roughness:0.5}));m.scale.set(0.5,0.3,0.4);m.position.y=0.22;m.castShadow=true;g.add(m);const a=new THREE.Mesh(G.box,MB(0xc81e1e));a.scale.set(0.3,0.31,0.08);a.position.y=0.22;g.add(a);const b=a.clone();b.scale.set(0.08,0.31,0.3);g.add(b);return g;},
};
function dropPickup(type,x,z,amount){
  const p={type,x,z,amount:amount||(type==='rock'?(1+(Math.random()*2|0)):1),mesh:PICK[type](),t:rand(0,6)};
  const tmp={x,z};collide(tmp,0.3,0);p.x=tmp.x;p.z=tmp.z;p.mesh.position.set(p.x,0,p.z);
  const gl=new THREE.Mesh(G.plane,glowMats[type]);gl.rotation.x=-Math.PI/2;gl.position.y=0.03;gl.scale.set(1.6,1.6,1);p.mesh.add(gl);p.glow=gl;
  world.add(p.mesh);pickups.push(p);return p;
}
function freeSpot(minFromPlayer){
  for(let k=0;k<500;k++){const x=rand(arena.x0+1.5,arena.x1-1.5),z=rand(arena.z0+1.5,arena.z1-1.5);if(!reachable(x,z))continue;if(Math.hypot(x-P.x,z-P.z)<minFromPlayer)continue;return {x,z};}
  return {x:P.x+rand(-3,3),z:P.z+rand(-3,3)};
}
function updatePickups(dt){
  for(const p of pickups){p.t+=dt;p.mesh.rotation.y+=dt*(p.type==='rock'?0.3:1.2);const bob=p.type==='ammo'||p.type==='med'?Math.sin(p.t*3)*0.06+0.05:0;p.mesh.children.forEach(c=>{if(c!==p.glow)c.position.y=(c.userData.y0??(c.userData.y0=c.position.y))+bob;});p.glow.material.opacity;p.glow.scale.setScalar(1.4+Math.sin(p.t*3)*0.2);
    if(Math.hypot(p.x-P.x,p.z-P.z)<1.3&&P.y<1.2){if(takePickup(p)){p.gone=true;world.remove(p.mesh);}}}
  pickups=pickups.filter(p=>!p.gone);
}
function takePickup(p){
  if(p.type==='molotov'||p.type==='urundai'){const k=p.type;if(inv[k]>=THROW_MAX[k])return false;inv[k]++;toast(k==='molotov'?`+1 Molotov  [6]  (${inv[k]})`:`+1 Urundai bomb  [7]  (${inv[k]})`);SFX.pickup();return true;}
  if(p.type==='rock'){if(inv.rocks>=12)return false;inv.rocks=Math.min(12,inv.rocks+p.amount);toast(`+${p.amount} rock${p.amount>1?'s':''}`);}
  else if(p.type==='stick'){if(inv.stick>=4)return false;const had=inv.stick>0;inv.stick=W.stick.dur;toast(had?'Fresh stick':'Picked up a stick  [4]');}
  else if(p.type==='aruval'){if((inv.aruval||0)>0)return false;inv.aruval=W.aruval.dur;toast('Picked up an aruval  [8]  2 strikes');}
  else if(p.type==='ammo'){if(Math.random()<0.5){inv.pistol.res+=24;toast('+24 pistol ammo');}else{inv.rifle.res+=30;toast('+30 rifle ammo');}}
  else if(p.type==='med'){if(P.hp>=100)return false;P.hp=Math.min(100,P.hp+35);toast('+35 health');}
  SFX.pickup();return true;
}

/* ================= viewmodels ================= */
const VMM={
  metal:new THREE.MeshStandardMaterial({color:0x5a5e62,metalness:0.35,roughness:0.38}),
  dark:new THREE.MeshStandardMaterial({color:0x2e3033,metalness:0.25,roughness:0.5}),
  poly:new THREE.MeshStandardMaterial({color:0x3a3b3e,metalness:0.05,roughness:0.7}),
  tan:new THREE.MeshStandardMaterial({color:0x6a5f48,metalness:0.05,roughness:0.8}),
  wood:new THREE.MeshStandardMaterial({color:0x6e4a2a,roughness:0.85}),
  tape:new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.95}),
  blade:new THREE.MeshStandardMaterial({color:0xd8dce0,metalness:0.45,roughness:0.2}),
  skin:new THREE.MeshStandardMaterial({color:0xa8744f,roughness:0.7}),
  glove:new THREE.MeshStandardMaterial({color:0x2a2622,roughness:0.9}),
  sleeve:new THREE.MeshStandardMaterial({color:0x3e4838,roughness:0.95}),
  glass:new THREE.MeshStandardMaterial({color:0x1a3040,metalness:0.4,roughness:0.05,emissive:0x0a1820,emissiveIntensity:0.6}),
  rock:new THREE.MeshStandardMaterial({color:0x8d8a84,roughness:0.95}),
  brass:new THREE.MeshStandardMaterial({color:0xc8a040,metalness:0.4,roughness:0.3}),
};
const vmRoot=new THREE.Group();vmScene.add(vmRoot);
function vp(parent,mat,x,y,z,sx,sy,sz,rx,ry,rz,geo){const m=new THREE.Mesh(geo||G.box,mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);parent.add(m);return m;}
function sleeveSeg(parent,a,b,w,mat){const v=new THREE.Vector3().subVectors(b,a);const len=v.length();const m=new THREE.Mesh(G.box,mat);m.scale.set(w,w*1.05,len);m.position.copy(a).add(b).multiplyScalar(0.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.normalize());parent.add(m);return m;}
// glove + forearm sleeve running from the hand to an elbow point (both in the weapon's space), then the upper arm out of view
function hand(parent,x,y,z,rx,ry,rz,elbow){const h=new THREE.Group();h.position.set(x,y,z);h.rotation.set(rx||0,ry||0,rz||0);parent.add(h);
  vp(h,VMM.glove,0,0,0,0.07,0.08,0.085);vp(h,VMM.skin,0,-0.012,-0.05,0.066,0.055,0.035);vp(h,VMM.glove,0.034,0.02,-0.02,0.022,0.028,0.06,0,0,0.3);
  const a=new THREE.Vector3(x,y-0.01,z+0.03),e=new THREE.Vector3(...(elbow||[x+0.08,y-0.22,z+0.26]));
  sleeveSeg(parent,a,e,0.085,VMM.sleeve);vp(parent,VMM.sleeve,a.x,a.y,a.z,0.095,0.095,0.04);
  const sh=e.clone().add(new THREE.Vector3(Math.sign(e.x-x||1)*0.06,-0.25,0.32));sleeveSeg(parent,e,sh,0.11,VMM.sleeve);
  return h;}
// aruval blade outline: a long blade that curves forward and flares into a broad, hooked tip (shape x = forward, y = up)
function aruvalBladeGeo(){
  const sh=new THREE.Shape();sh.moveTo(-0.013,0);sh.quadraticCurveTo(-0.02,0.22,-0.004,0.38);sh.quadraticCurveTo(0.02,0.52,0.075,0.575);
  sh.quadraticCurveTo(0.125,0.6,0.15,0.565);sh.quadraticCurveTo(0.158,0.535,0.138,0.512);sh.quadraticCurveTo(0.11,0.49,0.088,0.43);
  sh.quadraticCurveTo(0.05,0.3,0.03,0.14);sh.lineTo(0.016,0.02);sh.lineTo(0.016,0);sh.lineTo(-0.013,0);
  const g=new THREE.ExtrudeGeometry(sh,{depth:0.006,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.0025,bevelSegments:1,curveSegments:8});g.translate(0,0,-0.003);return g;}
const VM={};
(function buildVM(){
  // knife: clip-point blade from an extruded outline
  {const r=new THREE.Group();const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(0.2,0);sh.quadraticCurveTo(0.235,0.006,0.245,0.022);sh.lineTo(0.2,0.03);sh.lineTo(0.04,0.032);sh.lineTo(0,0.03);sh.lineTo(0,0);
    const bg=new THREE.ExtrudeGeometry(sh,{depth:0.004,bevelEnabled:true,bevelThickness:0.0015,bevelSize:0.001,bevelSegments:1});bg.translate(0,-0.016,-0.002);
    const blade=new THREE.Mesh(bg,VMM.blade);blade.rotation.y=Math.PI/2;blade.position.set(0,0.0,-0.075);r.add(blade);
    vp(r,VMM.dark,0,0,-0.07,0.022,0.06,0.012);
    const grip=vp(r,VMM.poly,0,-0.002,0.0,0.03,0.03,0.12,Math.PI/2,0,0,G.cyl6);for(let i=0;i<4;i++)vp(r,VMM.tape,0,-0.002,-0.04+i*0.026,0.032,0.006,0.032,Math.PI/2,0,0,G.cyl6);
    hand(r,0.0,-0.01,0.01,0,0,0,[0.07,-0.2,0.24]);
    VM.knife={root:r,hip:new THREE.Vector3(0.2,-0.17,-0.4),ads:new THREE.Vector3(0.2,-0.17,-0.4),rot:new THREE.Euler(0.4,0.3,-0.35)};}
  // pistol
  {const r=new THREE.Group();vp(r,VMM.poly,0,0,-0.02,0.032,0.03,0.19);const slide=new THREE.Group();r.add(slide);
    vp(slide,VMM.metal,0,0.032,-0.025,0.034,0.034,0.205);for(let i=0;i<5;i++)vp(slide,VMM.dark,0,0.032,0.045+i*0.008,0.0345,0.03,0.003);
    vp(slide,VMM.dark,0,0.052,-0.12,0.005,0.008,0.01);vp(slide,VMM.dark,-0.009,0.052,0.07,0.005,0.008,0.01);vp(slide,VMM.dark,0.009,0.052,0.07,0.005,0.008,0.01);
    vp(slide,VMM.dark,0,0.032,-0.128,0.016,0.016,0.004,Math.PI/2,0,0,G.cyl);
    vp(r,VMM.poly,0,-0.06,0.045,0.03,0.11,0.048,0.28);vp(r,VMM.poly,0,-0.025,-0.01,0.008,0.03,0.05);
    const mag=vp(r,VMM.dark,0,-0.113,0.058,0.026,0.012,0.044,0.28);
    hand(r,0,-0.065,0.06,0.28,0,0,[0.07,-0.25,0.28]);const lh=hand(r,-0.032,-0.075,0.045,0.35,0.3,-0.35,[-0.15,-0.25,0.26]);
    VM.pistol={root:r,slide,mag,lh,hip:new THREE.Vector3(0.15,-0.16,-0.42),ads:new THREE.Vector3(0,-0.052,-0.36),rot:new THREE.Euler(0.02,0.05,0)};}
  // assault rifle: extruded side profiles for receiver, grip, stock and curved magazine; worn cerakote and metal; 2x scope on a rail
  {const r=new THREE.Group();
    const wear=(base,chip,n)=>{const c=mkCanvas(128,128),g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,128,128);speckle(g,128,128,900,90,200,1,2,0.12);
      for(let i=0;i<n;i++){g.strokeStyle=chip;g.globalAlpha=rand(0.25,0.7);g.lineWidth=rand(0.5,1.6);g.beginPath();const x=rand(0,128),y=rand(0,128);g.moveTo(x,y);g.lineTo(x+rand(-14,14),y+rand(-5,5));g.stroke();}
      g.globalAlpha=1;for(let i=0;i<n/3;i++){g.fillStyle=chip;g.globalAlpha=rand(0.2,0.5);g.beginPath();g.ellipse(rand(0,128),rand(0,128),rand(1,4),rand(1,3),rand(0,3),0,7);g.fill();}g.globalAlpha=1;
      const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return t;};
    const RM={
      tan:new THREE.MeshStandardMaterial({color:0xa48f6a,roughness:0.72,metalness:0.08,map:wear('#c8b48c','#3a3530',40)}),
      metal:new THREE.MeshStandardMaterial({color:0x6a6e72,roughness:0.42,metalness:0.55,map:wear('#5a5e62','#c8ccd0',50)}),
      dark:new THREE.MeshStandardMaterial({color:0x34373a,roughness:0.5,metalness:0.4,map:wear('#3a3d40','#8a8e92',30)}),
      poly:new THREE.MeshStandardMaterial({color:0x2c2d2f,roughness:0.82,metalness:0.05}),
      rubber:new THREE.MeshStandardMaterial({color:0x151515,roughness:0.95}),
      port:new THREE.MeshStandardMaterial({color:0x0c0c0c,roughness:0.9}),
    };
    // side profile in (forward, up) metres, extruded across the gun's width
    const side=(pts,w,mat,curves)=>{const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)sh.quadraticCurveTo(p[0],p[1],p[2],p[3]);else sh.lineTo(p[0],p[1]);}sh.closePath();
      const gm=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.002,bevelSegments:1,curveSegments:8});gm.rotateY(Math.PI/2);gm.translate(-w/2,0,0);const m=new THREE.Mesh(gm,mat);r.add(m);return m;};
    // upper receiver, rail, ejection port, forward assist
    vp(r,RM.tan,0,0.0,-0.02,0.05,0.052,0.30);vp(r,RM.tan,0,0.0,-0.02,0.054,0.03,0.29);
    vp(r,RM.port,0.0262,0.004,0.0,0.003,0.022,0.07);vp(r,RM.dark,0.0272,0.004,-0.01,0.002,0.02,0.04);
    vp(r,RM.dark,0.028,0.016,0.07,0.012,0.012,0.022,Math.PI/2,0,0,G.cyl);
    vp(r,RM.dark,0,0.031,-0.12,0.024,0.009,0.58);for(let i=0;i<26;i++)vp(r,RM.dark,0,0.037,0.12-i*0.022,0.026,0.005,0.009);
    // lower receiver + magwell
    side([[-0.13,-0.024],[0.14,-0.024],[0.14,-0.05],[0.085,-0.062],[0.075,-0.078],[0.0,-0.078],[-0.03,-0.058],[-0.13,-0.058]],0.044,RM.tan);
    vp(r,RM.dark,0.024,-0.05,0.045,0.006,0.012,0.012);vp(r,RM.dark,-0.024,-0.035,-0.02,0.006,0.012,0.012,0,0,0,G.cyl);
    // pistol grip, trigger guard, trigger
    side([[-0.05,-0.058],[-0.02,-0.058],[-0.06,-0.168],[-0.1,-0.168],[-0.095,-0.12]],0.032,RM.poly);
    for(let i=0;i<4;i++)vp(r,RM.rubber,0,-0.09-i*0.018,0.055+i*0.008,0.034,0.004,0.025,0.3);
    vp(r,RM.dark,0,-0.098,0.0,0.01,0.005,0.07);vp(r,RM.dark,0,-0.084,-0.035,0.01,0.03,0.005);
    vp(r,RM.dark,0,-0.078,0.005,0.006,0.026,0.006,-0.35);
    // buffer tube and stock with butt pad and cheek riser
    vp(r,RM.dark,0,0.002,0.22,0.03,0.18,0.03,Math.PI/2,0,0,G.cyl);
    side([[-0.17,0.026],[-0.34,0.03],[-0.365,0.022],[-0.365,-0.094],[-0.33,-0.1],[-0.27,-0.052],[-0.19,-0.026],[-0.17,-0.022]],0.042,RM.tan);
    vp(r,RM.rubber,0,-0.034,0.368,0.046,0.13,0.012);vp(r,RM.poly,0,0.034,0.26,0.03,0.012,0.12);
    vp(r,RM.dark,0.0,-0.075,0.3,0.02,0.01,0.03);
    // handguard (octagonal with vent slots), gas block, barrel, muzzle brake
    vp(r,RM.poly,0,0.002,-0.3,0.062,0.27,0.062,Math.PI/2,0,Math.PI/8,new THREE.CylinderGeometry(0.5,0.5,1,8));
    for(let i=0;i<5;i++)for(const sx of[-1,1])vp(r,RM.port,sx*0.031,0.002,-0.2-i*0.048,0.004,0.012,0.03);
    for(let i=0;i<5;i++)vp(r,RM.port,0,-0.029,-0.2-i*0.048,0.012,0.004,0.03);
    vp(r,RM.dark,0,0.004,-0.46,0.026,0.028,0.032);
    vp(r,RM.metal,0,0.004,-0.53,0.022,0.18,0.022,Math.PI/2,0,0,G.cyl);
    vp(r,RM.dark,0,0.004,-0.645,0.034,0.06,0.034,Math.PI/2,0,0,G.cyl6);for(const sx of[-1,1])for(let i=0;i<2;i++)vp(r,RM.port,sx*0.016,0.008,-0.633-i*0.022,0.004,0.01,0.01);
    vp(r,RM.dark,0,-0.03,-0.42,0.01,0.012,0.02);
    // curved magazine (animated during reloads)
    const mag=new THREE.Group();mag.position.set(0,-0.09,-0.07);r.add(mag);
    {const sh=new THREE.Shape();sh.moveTo(-0.026,0.022);sh.lineTo(0.03,0.022);sh.quadraticCurveTo(0.042,-0.07,0.078,-0.15);sh.lineTo(0.026,-0.172);sh.quadraticCurveTo(-0.008,-0.08,-0.026,0.022);
      const gm=new THREE.ExtrudeGeometry(sh,{depth:0.026,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.002,bevelSegments:1,curveSegments:10});gm.rotateY(Math.PI/2);gm.translate(-0.013,0,0);mag.add(new THREE.Mesh(gm,RM.dark));
      vp(mag,RM.poly,0,-0.168,-0.052,0.034,0.014,0.06,0.4);for(let i=0;i<4;i++)vp(mag,RM.metal,0.0145,-0.03-i*0.03,-0.012-i*0.008,0.002,0.004,0.04,0.25);}
    // charging handle (animated on empty reloads)
    const charge=new THREE.Group();charge.position.set(0,0.032,0.12);r.add(charge);vp(charge,RM.dark,0,0,0,0.05,0.01,0.018);vp(charge,RM.dark,0.018,0.0,0.004,0.012,0.012,0.012);
    // 2x optic: rings, tube, bells, turrets, lenses (centre line stays at y 0.07 for aim alignment)
    for(const z of[-0.08,0.02]){vp(r,RM.dark,0,0.044,z,0.022,0.018,0.016);const ring=new THREE.Mesh(G_TORUS,RM.dark);ring.scale.set(0.034,0.034,0.06);ring.position.set(0,0.07,z);r.add(ring);}
    vp(r,RM.dark,0,0.07,-0.03,0.03,0.17,0.03,Math.PI/2,0,0,G.cyl);
    vp(r,RM.dark,0,0.07,-0.135,1,1,1,Math.PI/2,0,0,new THREE.CylinderGeometry(0.017,0.024,0.05,16));
    vp(r,RM.dark,0,0.07,0.065,1,1,1,Math.PI/2,0,0,new THREE.CylinderGeometry(0.02,0.016,0.04,16));
    vp(r,RM.metal,0,0.093,-0.03,0.02,0.016,0.02,0,0,0,G.cyl6);vp(r,RM.metal,0.023,0.07,-0.03,0.02,0.016,0.02,0,0,Math.PI/2,G.cyl6);
    vp(r,VMM.glass,0,0.07,-0.161,0.044,0.002,0.044,Math.PI/2,0,0,G.cyl);vp(r,VMM.glass,0,0.07,0.086,0.036,0.002,0.036,Math.PI/2,0,0,G.cyl);
    vp(r,RM.dark,0.026,0.0,0.12,0.004,0.01,0.012);
    hand(r,0,-0.07,0.085,0.32,0,0,[0.08,-0.24,0.3]);const lh=hand(r,-0.04,-0.04,-0.3,0.1,0.5,-0.9,[-0.2,-0.22,-0.06]);
    r.traverse(o=>{if(o.isMesh){o.castShadow=false;}});
    VM.rifle={root:r,mag,charge,lh,hip:new THREE.Vector3(0.18,-0.19,-0.46),ads:new THREE.Vector3(0,-0.07,-0.28),rot:new THREE.Euler(0,0.04,0)};}
  // stick: taped club with a couple of nails
  {const r=new THREE.Group();const st=vp(r,VMM.wood,0,0.38,0,0.055,0.9,0.055,0,0,0,G.taper);st.rotation.x=0;
    for(let i=0;i<3;i++)vp(r,VMM.tape,0,0.0+i*0.05,0,0.06,0.03,0.06,0,0,0,G.cyl6);
    for(let i=0;i<3;i++)vp(r,VMM.metal,0.03,0.68+i*0.07,0.0,0.005,0.005,0.06,0,i,Math.PI/2);
    const h=hand(r,0,-0.0,0.02,-1.4,0,0,[0.08,-0.33,-0.02]);
    const g=new THREE.Group();g.add(r);r.rotation.x=-0.9;r.position.set(0,0,0);
    VM.stick={root:g,hip:new THREE.Vector3(0.24,-0.28,-0.4),ads:new THREE.Vector3(0.24,-0.28,-0.4),rot:new THREE.Euler(0.1,0.1,-0.35)};}
  // aruval: curved steel blade, iron ferrules, worn wooden grip with a cord wrap; held like the stick
  {const r=new THREE.Group();const steel=new THREE.MeshStandardMaterial({color:0xdadfe2,metalness:0.55,roughness:0.26});
    const blade=new THREE.Mesh(aruvalBladeGeo(),steel);blade.rotation.y=Math.PI/2;blade.position.y=0.02;r.add(blade);
    vp(r,new THREE.MeshStandardMaterial({color:0x4a2a1a,metalness:0.3,roughness:0.8}),0.0045,0.3,-0.03,0.002,0.12,0.035,0.08,0,0);   // rust/old blood on the flat
    vp(r,new THREE.MeshStandardMaterial({color:0x3a0806,roughness:0.5}),0.0045,0.5,-0.07,0.002,0.05,0.05,0.4,0,0);
    vp(r,VMM.metal,0,0.015,0,0.04,0.03,0.04,0,0,0,G.cyl6);vp(r,VMM.metal,0,-0.15,0,0.038,0.022,0.038,0,0,0,G.cyl6);
    vp(r,new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:0.95}),0,-0.07,0,0.034,0.15,0.034,0,0,0,G.cyl6);
    for(let i=0;i<4;i++)vp(r,VMM.tape,0,-0.11+i*0.022,0,0.037,0.007,0.037,0,0,0,G.cyl6);
    hand(r,0,-0.07,0.02,-1.4,0,0,[0.08,-0.4,-0.02]);
    const g=new THREE.Group();g.add(r);r.rotation.x=-0.9;
    VM.aruval={root:g,hip:new THREE.Vector3(0.28,-0.3,-0.42),ads:new THREE.Vector3(0.28,-0.3,-0.42),rot:new THREE.Euler(0.1,0.1,-0.46)};}
  // rock in hand
  {const r=new THREE.Group();const rk=vp(r,VMM.rock,0,0.05,-0.04,0.13,0.11,0.12,0.3,0.6,0,G.rubble);hand(r,0,-0.02,0.02,0.2,0,0,[0.08,-0.24,0.26]);
    VM.rock={root:r,rk,hip:new THREE.Vector3(0.24,-0.24,-0.4),ads:new THREE.Vector3(0.24,-0.24,-0.4),rot:new THREE.Euler(0.2,0.1,0)};}
  {const r=new THREE.Group();const item=new THREE.Group();item.position.set(0,0.08,-0.04);r.add(item);
    vp(item,glassMat,0,0,0,0.075,0.15,0.075,0,0,0,G.cyl);vp(item,glassMat,0,0.1,0,0.03,0.07,0.03,0,0,0,G.cyl);vp(item,ragMat,0.005,0.145,0,0.025,0.045,0.025,0,0,0.3);
    const fl=flameSprite(0.1);fl.position.set(0.01,0.2,0);item.add(fl);hand(r,0,-0.03,0.02,0.2,0,0,[0.08,-0.24,0.26]);
    item.scale.setScalar(0.72);VM.molotov={root:r,item,flame:fl,hip:new THREE.Vector3(0.21,-0.22,-0.46),ads:new THREE.Vector3(0.22,-0.24,-0.4),rot:new THREE.Euler(0.15,0.15,0.1)};}
  {const r=new THREE.Group();const item=new THREE.Group();item.position.set(0,0.06,-0.05);r.add(item);
    vp(item,bombMat,0,0,0,0.13,0.12,0.13,0,0,0,G.canopy);for(let i=0;i<3;i++){const t=new THREE.Mesh(G_TORUS,twineMat);t.scale.setScalar(0.067);t.rotation.set(i===0?Math.PI/2:0,i*1.05,0);item.add(t);}
    vp(item,twineMat,0,0.08,0,0.008,0.05,0.008,0,0,0,G.cyl);const sp=flameSprite(0.05,true);sp.position.set(0,0.11,0);item.add(sp);hand(r,0,-0.03,0.02,0.2,0,0,[0.08,-0.24,0.26]);
    item.scale.setScalar(0.62);VM.urundai={root:r,item,spark:sp,hip:new THREE.Vector3(0.21,-0.22,-0.46),ads:new THREE.Vector3(0.22,-0.23,-0.4),rot:new THREE.Euler(0.2,0.1,0)};}
  for(const k in VM){VM[k].root.visible=false;vmRoot.add(VM[k].root);}
})();
const muzzleFlash=new THREE.Sprite(new THREE.SpriteMaterial({map:muzzleTex,color:0xffd8a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));muzzleFlash.visible=false;vmScene.add(muzzleFlash);
let muzzleT=0;
function vmShow(){for(const k in VM)VM[k].root.visible=(k===cur);}
const _vp=new THREE.Vector3(),_vr=new THREE.Euler();
function updateVM(dt,mv,sprinting){
  const V=VM[cur];if(!V)return;
  kickZ=damp(kickZ,0,cur==='pistol'?16:12,dt);kickR=damp(kickR,0,cur==='pistol'?14:10,dt);
  if(slideT>0)slideT-=dt;if(equipT>0)equipT-=dt;
  sprintK=damp(sprintK,sprinting?1:0,8,dt);
  const f60=dt>0?1/(dt*60):1;swayTX=damp(swayTX,clamp(-mouseDX*f60*0.012,-1,1),22,dt);swayTY=damp(swayTY,clamp(-mouseDY*f60*0.012,-1,1),22,dt);mouseDX=0;mouseDY=0;
  swaySX=damp(swaySX,swayTX,10,dt);swaySY=damp(swaySY,swayTY,10,dt);
  const aimK=ease(P.aim);
  _vp.copy(V.hip).lerp(V.ads,aimK);_vr.copy(V.rot);_vr.x*=1-aimK;_vr.y*=1-aimK;_vr.z*=1-aimK;
  const bobAmt=(1-aimK*0.85)*mv*(SETTINGS.bob?1:0.25);
  _vp.x+=Math.sin(P.bob)*0.014*bobAmt+swaySX*0.018*(1-aimK*0.7);_vp.y+=Math.cos(P.bob)*Math.cos(P.bob)*0.016*bobAmt+swaySY*0.014*(1-aimK*0.7)-P.landDip*0.35;
  _vr.y+=swaySX*0.07*(1-aimK*0.7);_vr.x+=swaySY*0.05*(1-aimK*0.7);_vr.z+=Math.sin(P.bob)*0.02*bobAmt;
  // idle breathing
  _vp.y+=Math.sin(T*1.6)*0.003*(1-aimK);
  if(cur==='pistol'||cur==='rifle'){_vp.x-=0.05*sprintK;_vp.y-=0.05*sprintK;_vr.y+=0.65*sprintK;_vr.x-=0.3*sprintK;_vr.z+=0.25*sprintK;}
  else{_vp.y+=0.02*sprintK;_vr.x+=0.2*sprintK;}
  _vp.z+=kickZ;_vr.x+=kickR;_vr.z+=(cur==='rifle'?rand(-1,1)*kickR*0.1:0);
  if(cur==='pistol'){V.slide.position.z=slideT>0?0.035*Math.sin(slideT/0.09*Math.PI):0;}
  // actions
  if(act){act.t+=dt;const t=act.t;for(const e of act.ev){if(!e.done&&t>=e[0]){e.done=true;e[1]();}}
    if(act.type==='slash'){const s=act.sign,k1=seg(t,0,0.06),k2=easeOut(seg(t,0.06,0.18)),k3=ease(seg(t,0.2,0.32));
      const k=k2*(1-k3);_vp.x+=lerp(0.06*s*k1,-0.26*s,k)*(1-k3)+0.06*s*k1*k3*0;_vp.y+=0.06*k1*(1-k2)-0.08*k;_vp.z-=0.16*k;_vr.z+=(-0.5*s*k1*(1-k2))+1.0*s*k;_vr.y+=0.5*s*k1*(1-k2)-0.9*s*k;_vr.x-=0.4*k;}
    else if(act.type==='swing'){const k1=ease(seg(t,0,0.28)),k2=easeOut(seg(t,0.28,0.44)),k3=ease(seg(t,0.48,0.78));
      const wind=k1*(1-k2),sw=k2*(1-k3);_vp.x+=0.12*wind-0.38*sw;_vp.y+=0.16*wind-0.06*sw;_vp.z+=0.06*wind-0.2*sw;_vr.z+=-0.9*wind+1.3*sw;_vr.x+=0.6*wind-0.5*sw;_vr.y+=0.3*wind-0.9*sw;}
    else if(act.type==='chop'){const k1=ease(seg(t,0,0.27)),k2=easeOut(seg(t,0.27,0.39)),k3=ease(seg(t,0.48,0.85));
      const wind=k1*(1-k2),sw=k2*(1-k3);_vp.x+=0.16*wind-0.44*sw;_vp.y+=0.24*wind-0.13*sw;_vp.z+=0.08*wind-0.24*sw;_vr.z+=-1.15*wind+1.55*sw;_vr.x+=0.95*wind-0.75*sw;_vr.y+=0.35*wind-1.05*sw;}
    else if(act.type==='throw'){const k1=ease(seg(t,0,0.22)),k2=easeOut(seg(t,0.22,0.32)),k3=ease(seg(t,0.36,0.6));
      const back=k1*(1-k2),fwd=k2*(1-k3);_vp.z+=0.16*back-0.3*fwd;_vp.y+=0.16*back+0.04*fwd;_vp.x+=0.03*back-0.08*fwd;_vr.x+=-1.0*back+0.7*fwd;
      const itm=V.rk||V.item;itm.visible=t<0.25||(!(t<0.5)&&has(cur));if(t>0.5)_vp.y-=0.2*(1-ease(seg(t,0.5,0.6)));}
    else if(act.type==='reloadP'){const D=act.dur,tilt=ease(seg(t,0.05,0.25))*(1-ease(seg(t,D-0.2,D)));_vr.z+=0.55*tilt;_vr.x+=0.3*tilt;_vp.y-=0.04*tilt;_vp.x-=0.03*tilt;
      const out=seg(t,0.15,0.4),inn=seg(t,0.5,0.8);V.mag.visible=t<0.4||t>0.5;V.mag.position.y=-0.113-(t<0.45?out*0.2:(1-inn)*0.18);
      V.lh.position.y=-0.075-0.12*Math.sin(seg(t,0.4,0.85)*Math.PI);
      if(act.empty){const r=seg(t,1.0,1.2);V.slide.position.z=0.04*Math.sin(r*Math.PI);_vr.y+=0.2*Math.sin(r*Math.PI);}}
    else if(act.type==='reloadR'){const D=act.dur,tilt=ease(seg(t,0.05,0.3))*(1-ease(seg(t,D-0.25,D)));_vr.z+=0.6*tilt;_vr.x+=0.22*tilt;_vp.x-=0.05*tilt;_vp.y-=0.03*tilt;
      const out=seg(t,0.28,0.65),inn=seg(t,0.85,1.2);V.mag.visible=t<0.65||t>0.8;V.mag.position.y=-0.09-(t<0.75?easeOut(out)*0.3:(1-ease(inn))*0.3);V.mag.rotation.x=t<0.75?out*0.6:0;
      V.lh.position.y=-0.035-0.18*Math.sin(seg(t,0.55,1.25)*Math.PI);V.lh.position.z=-0.3+0.2*Math.sin(seg(t,0.55,1.25)*Math.PI);
      if(t>1.2&&t<1.3)_vp.y+=0.015;
      if(act.empty){const c=seg(t,1.55,1.95);V.charge.position.z=0.12+0.08*Math.sin(c*Math.PI);_vr.y-=0.25*Math.sin(c*Math.PI);V.lh.position.x=-0.045+0.05*Math.sin(c*Math.PI);}}
    if(act.t>=act.dur){if(act.type==='reloadP'||act.type==='reloadR'){finishReload();if(V.mag){V.mag.visible=true;V.mag.position.y=cur==='pistol'?-0.113:-0.09;V.mag.rotation.x=0;}}const itm2=V.rk||V.item;if(itm2)itm2.visible=has(cur);act=null;}
  }
  if(equipT>0){const k=equipT/0.35;_vp.y-=k*k*0.3;_vr.x-=k*0.9;_vr.z+=k*0.3;}
  // held throwables: lit rag flickers, fuse sparks, the bomb is tossed lightly in the palm
  if(cur==='molotov'){const lit=equipT>0?1-equipT/0.35:1;const s=(0.08+Math.random()*0.03)*lit;V.flame.scale.set(s,s*1.4,1);V.flame.visible=lit>0.05;}
  if(cur==='urundai'){const s=0.04+Math.random()*0.04;V.spark.scale.set(s,s,1);V.item.position.y=0.06+Math.abs(Math.sin(T*3.2))*0.025;if(Math.random()<dt*6)SFX.fuseTick();}
  // F quick melee: lower the current weapon and slash with the knife in front of it
  if(qmCd>0)qmCd-=dt;
  const K=VM.knife;
  if(qm){qm.t+=dt;const t=qm.t;if(!qm.done&&t>=0.11){qm.done=true;meleeHit('knife');}
    const kk=Math.sin(Math.min(1,t/qm.dur)*Math.PI);_vp.y-=0.24*kk;_vp.x+=0.08*kk;_vr.x-=0.6*kk;_vr.z-=0.4*kk;
    K.root.visible=true;const s=-1,k1=seg(t,0.02,0.08),k2=easeOut(seg(t,0.08,0.22)),k3=ease(seg(t,0.24,0.42)),k=k2*(1-k3);
    K.root.position.set(K.hip.x+lerp(0.06*s*k1,-0.26*s,k)*(1-k3),K.hip.y+0.06*k1*(1-k2)-0.08*k+0.04,K.hip.z-0.16*k);
    K.root.rotation.set(K.rot.x-0.4*k,K.rot.y+0.5*s*k1*(1-k2)-0.9*s*k,K.rot.z-0.5*s*k1*(1-k2)+1.0*s*k);
    if(t>=qm.dur){qm=null;K.root.visible=(cur==='knife');}}
  V.root.position.copy(_vp);V.root.rotation.copy(_vr);
  vmRoot.visible=!(cur==='rifle'&&P.aim>0.86);
  if(muzzleT>0){muzzleT-=dt;const mz=cur==='rifle'?-0.66:-0.15;muzzleFlash.position.set(_vp.x,_vp.y+(cur==='rifle'?0.004:0.032),_vp.z+mz);if(muzzleT<=0)muzzleFlash.visible=false;}
  if(muzzleT<=0){flashLight.intensity=Math.max(0,flashLight.intensity-dt*50);vmFlash.intensity=Math.max(0,vmFlash.intensity-dt*60);}
}

/* ================= movement, jump, crouch ================= */
function updatePlayer(dt){
  if(keys.ArrowLeft)P.yaw+=dt*2.2;if(keys.ArrowRight)P.yaw-=dt*2.2;if(keys.ArrowUp)P.pitch=clamp(P.pitch+dt*1.5,-1.45,1.45);if(keys.ArrowDown)P.pitch=clamp(P.pitch-dt*1.5,-1.45,1.45);
  let ix=0,iz=0;if(keys.KeyW)iz-=1;if(keys.KeyS)iz+=1;if(keys.KeyA)ix-=1;if(keys.KeyD)ix+=1;
  const il=Math.hypot(ix,iz);
  const shift=keys.ShiftLeft||keys.ShiftRight;
  const wantAim=rightDown&&(cur==='rifle'||cur==='pistol')&&!reloading()&&equipT<=0&&!qm;
  if(P.stam<=1)P.winded=true;else if(P.stam>=20)P.winded=false;
  const sprint=shift&&il>0&&iz<0&&!P.winded&&!wantAim&&P.crouch<0.5;
  // aiming / hold breath
  const aimTarget=wantAim&&!sprint?1:0;const prevAim=P.aim;P.aim=clamp(P.aim+(aimTarget?dt/0.2:-dt/0.15),0,1);if(prevAim<0.5&&P.aim>=0.5&&cur==='rifle')SFX.scopeIn();
  P.breath=shift&&P.aim>0.8&&P.stam>2&&cur==='rifle';
  if(sprint)P.stam=Math.max(0,P.stam-dt*22);else if(P.breath){P.stam=Math.max(0,P.stam-dt*28);if(P.stam<=2)P.tired=3;}else P.stam=Math.min(100,P.stam+dt*(P.grounded?16:6));
  if(P.tired>0)P.tired-=dt;
  // crouch (C toggles)
  P.crouch=damp(P.crouch,P.crouchOn?1:0,10,dt);
  let spd=sprint?8.2:5.2;spd*=lerp(1,0.48,P.crouch);spd*=lerp(1,cur==='rifle'?0.55:0.75,P.aim);
  let tx=0,tz=0;
  if(il>0){ix/=il;iz/=il;const s=Math.sin(P.yaw),c=Math.cos(P.yaw);tx=(ix*c+iz*s)*spd;tz=(-ix*s+iz*c)*spd;}
  const acc=1-Math.pow(P.grounded?0.0005:0.25,dt);P.vx+=(tx-P.vx)*acc;P.vz+=(tz-P.vz)*acc;
  // move, resolve collisions twice (corners where two boxes meet), then keep only the velocity that actually happened,
  // so pushing into a wall no longer builds speed, head-bob or footsteps while standing still
  const ox=P.x,oz=P.z;P.x+=P.vx*dt;P.z+=P.vz*dt;collide(P,0.4,P.y);collide(P,0.4,P.y);
  if(dt>0){const ax=(P.x-ox)/dt,az=(P.z-oz)/dt;if(Math.abs(ax)<Math.abs(P.vx))P.vx=ax;if(Math.abs(az)<Math.abs(P.vz))P.vz=az;}
  // vertical: jump, gravity, land on low props
  // Space while sneaking stands you up and jumps in the same press (it used to only stand up, so jumps over walls failed while sneaking)
  if(keys.Space&&!P.jumpHeld&&P.grounded){P.crouchOn=false;P.vy=7.0;P.grounded=false;P.stam=Math.max(0,P.stam-6);P.landDip=-0.04;SFX.jump();}
  P.jumpHeld=!!keys.Space;
  P.vy-=22*dt;P.y+=P.vy*dt;
  const gh=groundHeight(P.x,P.z,0.4,P.y);
  if(P.y<=gh){if(!P.grounded&&P.vy<-2.5){P.landDip=clamp(-P.vy*0.016,0.03,0.16);SFX.land();makeNoise(P.x,P.z,9,'land');}P.y=gh;P.vy=0;P.grounded=true;}
  else if(P.y>gh+0.05)P.grounded=false;
  P.landDip=damp(P.landDip,0,9,dt);
  const mv=Math.hypot(P.vx,P.vz);
  if(P.grounded)P.bob+=dt*mv*1.9;
  // footsteps & noise
  if(P.grounded&&mv>1.2){P.stepT-=dt*mv;if(P.stepT<=0){P.stepT=2.1;SFX.step(P.crouch>0.5);makeNoise(P.x,P.z,P.crouch>0.5?2.2:sprint?17:7.5,'step');}}
  // recoil recovery & sway
  P.recoilP=damp(P.recoilP,0,cur==='pistol'?7:5,dt);P.recoilY=damp(P.recoilY,0,6,dt);
  P.shake=Math.max(0,P.shake-dt*2.2);const sh=P.shake*P.shake*0.035;
  let swX=0,swY=0;if(P.aim>0.3){const amp=(P.breath?0.15:1)*(P.tired>0?2.2:1)*(cur==='rifle'?1:0.4)*P.aim;swX=(Math.sin(T*0.9)*0.0036+Math.sin(T*2.1)*0.0012)*amp;swY=(Math.sin(T*1.3)*0.003+Math.cos(T*0.7)*0.0015)*amp;}
  const eye=lerp(1.65,1.12,P.crouch);
  camera.position.set(P.x,P.y+eye+Math.sin(P.bob*2)*0.032*Math.min(1,mv/5)*(1-P.aim*0.8)*(SETTINGS.bob?1:0)-P.landDip,P.z);
  camera.rotation.set(P.pitch+P.recoilP+swY+rand(-sh,sh),P.yaw+P.recoilY+swX+rand(-sh,sh),Math.sin(P.bob)*0.004*Math.min(1,mv/5));
  // smooth zoom
  const tf=cur==='rifle'?SCOPE_FOV:cur==='pistol'?BASE_FOV*0.84:BASE_FOV;const fov=lerp(BASE_FOV,tf,ease(P.aim));if(Math.abs(camera.fov-fov)>0.01){camera.fov=fov;camera.updateProjectionMatrix();}
  return {mv:Math.min(1,mv/5),sprint};
}
