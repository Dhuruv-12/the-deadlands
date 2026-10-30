/* ================= victory ending (after wave 5 is genuinely cleared) =================
   hold on gameplay while the boss finishes falling -> fade -> night, a rooftop over a dead Chennai:
   the blood-soaked survivor from behind, rifle hanging in one hand, a cigarette in the other.
   Medium rear shot, slow pull-back to a wide shot of the burning skyline; once it settles the text,
   branding and real campaign totals fade in. Skippable at any point (Esc / Enter / Space / Skip). */
var END=null;
const END_LEN=10.5;        // camera pull-back, seconds after the fade-in
const END_T={msg:10.8,sub:13,brand:14.8,fin:16.8};
function beginEnding(){
  state='won';
  $('wStats').innerHTML=statsHTML(totals);
  const W=$('win');W.classList.remove('final','quick');W.classList.add('cine');
  ['endMsg','endSub','endBrand','endActions'].forEach(id=>$(id).classList.remove('on'));$('wStats').classList.add('end-stats');$('wStats').classList.remove('on');
  const gt=$('dlTitle').style.getPropertyValue('--grunge');if(gt){$('endBrand').style.setProperty('--grunge',gt);$('endBrand').classList.add('grunge');}
  showScreen('win');
  // let a boss that just died finish its fall before cutting away
  const b=zombies.find(z=>z.boss&&z.bs==='dying');
  END={t:0,ct:0,hold:b?Math.max(1.2,3.6-b.st):1.2,scene:false,fading:false,shown:{},final:false,audio:startEndingAudio()};
}
function endingKey(e){
  if(state!=='won'||!END||END.final)return false;
  if(e.code==='Escape'||e.code==='Enter'||e.code==='NumpadEnter'||e.code==='Space'){e.preventDefault();skipEnding();return true;}
  return false;
}
function skipEnding(){
  if(!END||END.final)return;
  $('win').classList.add('quick');
  if(!END.scene)buildEndingScene();
  $('fade').classList.remove('on','slow');$('endCaption').classList.remove('on');END.revealed=true;
  END.ct=Math.max(END.ct,END_T.fin);
}
function exitEnding(){
  stopEndingAudio();
  if(END&&END.saved){const s=END.saved;bossLight.color.copy(s.blc);bossLight.distance=s.bld;bossLight.intensity=0;}
  END=null;
  const W=$('win');W.classList.remove('cine','final','quick');$('fade').classList.remove('on','slow');$('endCaption').classList.remove('on');
}
$('endSkip').onclick=()=>skipEnding();
// final-screen buttons share one highlight, like the title menu (hover or keyboard focus moves it)
['againBtn','endMenuBtn'].forEach(id=>{const f=()=>['againBtn','endMenuBtn'].forEach(o=>$(o).classList.toggle('sel',o===id));$(id).addEventListener('mouseenter',f);$(id).addEventListener('focus',f);});
$('endMenuBtn').onclick=()=>{exitEnding();$('quitBtn').onclick();};

/* ---------- the set: a rooftop over the ruined city, at night ---------- */
function buildEndingScene(){
  END.scene=true;
  // clear the wave-5 world (same clean-up buildLevel does before building a map)
  for(const z of zombies){if(z.rig)z.rig.meshes.forEach(m=>m.geometry.dispose());}
  clearThrowables();shockwaves=[];zombies.forEach(z=>{if(z.flame)freeFlame(z.flame);});
  clearWorld();clearEmitters();clearDecals();zombies=[];pickups=[];rocksInAir.forEach(r=>scene.remove(r.m));rocksInAir=[];water=null;foam=null;
  sporeBombs.forEach(b=>scene.remove(b.m));sporeBombs=[];sporeClouds=[];hideTele();teleTarget.visible=false;bossLight.intensity=0;
  SMOKE.forEach(p=>{p.life=0;p.s.visible=false;});PARTS.forEach(p=>{p.life=0;p.m.visible=false;});SHELLS.forEach(s=>{s.life=0;s.m.visible=false;});
  atmosphere({fog:0x1a1315,near:28,far:300,exposure:1.4,skyTop:0x040406,skyHorizon:0x3b1a12,hemiSky:0x5a6680,hemiGround:0x1e140f,hemiI:0.55,
    sun:0x8c9cb8,sunI:0.5,sunDir:[0.32,0.4,-0.86],sunDisc:0x8e97a8,sunSize:6,ash:0x8a7f78,wind:0.5,groundFog:0x2a1e20,groundFogAmt:0.28});
  ground(900,900,'asphalt',0x2e2d2c,0,-220,70);
  // the survivor's roof
  const H=32;END.H=H;   // his roof: built by hand so no random antenna or tank lands next to him
  box(0,0,16,16,H,0x8a8478,{mat:facadeMat('res',0x8a8478,3,5),solid:false});
  for(const [x,z,w,d] of[[0,7.9,16,0.2],[0,-7.9,16,0.2],[7.9,0,0.2,16],[-7.9,0,0.2,16]])deco(x,H+0.3,z,w,0.6,d,0x5a554e,{cast:true});
  deco(5.2,H+0.75,4.6,1.2,1.5,1.2,0x1a1a1a,{geo:G.cyl,cast:true});deco(5.2,H+1.55,4.6,0.9,0.15,0.9,0x1a1a1a,{geo:G.cone});
  building(-13,-16,10,10,H-9.6,0x7a7268,{kind:'res',solid:false});   // the lower roof next door that is burning
  deco(0,H+0.05,0,15.6,0.1,15.6,0x403c37);
  for(const [x,z,s] of[[4.5,-2,0.8],[5.3,-1.6,0.6],[-5,3,0.9]])deco(x,H+0.1+s/2,z,s,s,s,pick([0x5e4630,0x4a3826]),{cast:true,ry:rand(0,1)});
  for(let i=0;i<9;i++){const s=rand(0.2,0.6);deco(rand(-6,6),H+0.1+s*0.3,rand(-6.5,4),s,s*0.7,s,pick([0x55504a,0x3e3a35,0x6a645c]),{geo:G.rubble,ry:rand(0,3),cast:true});}
  deco(-4.2,H+0.9,-4.6,1.3,0.04,1.3,0x8a8a86,{geo:G.cyl,rx:1.0,rz:0.3,cast:true});deco(-4.2,H+0.45,-4.4,0.06,0.9,0.06,0x555555);  // bent dish
  const bm=new THREE.MeshStandardMaterial({map:bloodTex,transparent:true,depthWrite:false,roughness:0.35,color:0x8a6a6a,polygonOffset:true,polygonOffsetFactor:-3});levelDispose.push(bm);
  for(const [x,z,s2] of[[0.5,-4.6,0.7],[0.8,-3.1,0.5],[1.3,-1.7,0.6],[1.5,-0.2,0.35],[-0.1,-6.5,1.1],[0.6,-6.0,0.5]]){const m=new THREE.Mesh(G.plane,bm);m.rotation.set(-Math.PI/2,0,rand(0,6.28));m.scale.set(s2,s2*rand(0.8,1.4),1);m.position.set(x,H+0.111,z);world.add(m);}   // his blood trail
  // the city: lifeless blocks, taller towards the horizon
  const tops=[];
  for(let z=-30;z>-290;z-=rand(17,26)){
    const far=Math.min(1,(-z-30)/220),span=60+(-z)*1.05;
    for(let x=-span;x<span;x+=rand(11,22)){
      if(Math.random()<0.18)continue;                                     // gaps: streets, collapsed lots
      const near=-z<60;if(near&&Math.abs(x)<14&&Math.random()<0.6)continue;
      const tower=!near&&Math.random()<0.1,w=rand(8,15),d=rand(8,14),h=tower?rand(34,58):near?rand(8,20):rand(12+far*8,22+far*18);
      const top=building(x+rand(-2,2),z+rand(-3,3),w,d,h,pick([0x8a8276,0x7a7268,0x948a7c,0x6e6a64,0x857a6a]),{kind:Math.random()<0.18&&!near?'glass':'res',solid:false,damaged:Math.random()<0.5});
      tops.push({x,z,h:top,w,d});
    }
  }
  // gutted towers: bare columns and slabs
  for(const [x,z,fl] of[[-46,-120,11],[38,-168,14],[-92,-205,9]]){
    for(let f=0;f<fl;f++){const y=f*3.4;const miss=f>fl-4?0.55:0.15;
      for(const cx of[-6,-2,2,6])for(const cz of[-5,0,5])if(Math.random()>miss)deco(x+cx,y+1.7,z+cz,0.5,3.4,0.5,0x34302c,{cast:false});
      if(Math.random()>miss)deco(x+rand(-1,1),y+3.4,z,13*rand(0.5,1),0.3,11,0x3a3632,{rz:f>fl-4?rand(-0.15,0.15):0});}
  }
  deco(64,9,-140,14,26,12,0x3a3530,{rz:0.42});                         // a tower that came down onto its neighbour
  // street below, burnt-out cars
  car(-6,-24,0.4,0,{burnt:true});car(5.5,-31,-0.3,0,{burnt:true});car(-1.5,-41,1.4,0,{burnt:true});auto(8,-22,2.2,{});
  flushInst();
  // fires: hand-animated flame sprites + glow (no smoke emitter per fire, so the smoke pool isn't drained)
  END.fires=[];
  const fire=(x,y,z,s)=>{const f={x,y,z,s,fl:[],ph:rand(0,6)};
    for(let i=0;i<4;i++){const m=new THREE.SpriteMaterial({map:flameTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});levelDispose.push(m);const sp=new THREE.Sprite(m);sp.position.set(x+rand(-0.5,0.5)*s,y,z+rand(-0.5,0.5)*s);world.add(sp);f.fl.push({sp,ph:rand(0,6),ox:sp.position.x});}
    const gm=new THREE.SpriteMaterial({map:softTex,color:0xff6a20,transparent:true,opacity:0.32,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});levelDispose.push(gm);
    const g=new THREE.Sprite(gm);g.position.set(x,y+s,z);g.scale.set(s*11,s*8,1);world.add(g);f.glow=g;END.fires.push(f);return f;};
  const pickTops=tops.filter(t=>t.z<-45&&t.h<H-2).sort(()=>Math.random()-0.5).slice(0,12);
  pickTops.forEach((t,i)=>{const f=fire(t.x,t.h+0.2,t.z,rand(3.2,5.5)*(t.z<-150?1.4:1));if(i<6)smokeAt(t.x,t.h+6,t.z,0.5,rand(14,20),0x4a3c34);});
  // burning floors: orange glow in the windows of a few buildings
  for(const t of tops.filter(t=>t.z<-50).slice(0,40))if(Math.random()<0.18){const y=rand(3,t.h-2),gm=new THREE.SpriteMaterial({map:softTex,color:0xff5a18,transparent:true,opacity:rand(0.25,0.45),blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});levelDispose.push(gm);
    const g=new THREE.Sprite(gm);g.position.set(t.x+rand(-t.w/3,t.w/3),y,t.z+t.d/2+0.5);g.scale.set(rand(3,6),rand(1.5,3),1);world.add(g);END.fires.push({glowOnly:g,ph:rand(0,6),base:gm.opacity});}
  const near1=fire(-13,H-9.6,-16,2.2),near2=fire(5.5,0.4,-31,1.3);       // a lower roof next door, and a car on the street
  fireLights.forEach(l=>l.intensity=0);END.fl=[[fireLights[0],near1],[fireLights[1],near2]];
  // overcast sky: heavy cloud banks, one thinning over the moon
  END.clouds=[];
  for(let i=0;i<16;i++){const a=rand(-1.4,1.4),el=rand(0.05,0.55),r=400;const near=el<0.18;
    const m=new THREE.SpriteMaterial({map:smokeTex,color:near?0x241410:0x0e0f14,transparent:true,opacity:near?0.75:rand(0.7,0.92),fog:false,depthWrite:false});levelDispose.push(m);
    const s=new THREE.Sprite(m);s.position.set(Math.sin(a)*r*Math.cos(el),Math.sin(el)*r+20,-Math.cos(a)*r*Math.cos(el));s.scale.set(rand(160,280),rand(50,90),1);s.renderOrder=-8;world.add(s);END.clouds.push({s,v:rand(0.4,1.2)});}
  { const v=new THREE.Vector3(0.32,0.4,-0.86).normalize().multiplyScalar(395);const m=new THREE.SpriteMaterial({map:smokeTex,color:0x12131a,transparent:true,opacity:0.55,fog:false,depthWrite:false});levelDispose.push(m);
    const s=new THREE.Sprite(m);s.position.copy(v).add(new THREE.Vector3(-14,4,0));s.scale.set(110,34,1);s.renderOrder=-8;world.add(s);END.clouds.push({s,v:0.6}); }
  // ash for this height (the global ash lives at street level)
  const AN=500,ag=new THREE.BufferGeometry(),ap=new Float32Array(AN*3);levelDispose.push(ag);
  for(let i=0;i<AN;i++){ap[i*3]=rand(-30,30);ap[i*3+1]=H+rand(-4,14);ap[i*3+2]=rand(-40,15);}
  ag.setAttribute('position',new THREE.BufferAttribute(ap,3));const am=new THREE.PointsMaterial({color:0x9a8e86,size:0.07,transparent:true,opacity:0.75,map:softTex,depthWrite:false});levelDispose.push(am);
  END.ash=new THREE.Points(ag,am);END.ash.frustumCulled=false;world.add(END.ash);
  // the survivor, at the front edge of the roof, facing the city (-z)
  const S={x:0.3,z:-6.2};END.S=S;P.x=S.x;P.z=S.z;P.y=H;P.vx=P.vz=0;P.shake=0;
  const sv=makeSurvivor();sv.g.position.set(S.x,H+0.1,S.z);sv.g.rotation.y=Math.PI;world.add(sv.g);END.sv=sv;
  // a cool, dim fill from behind so the blood on his back reads (reuses the boss light: no new light, nothing recompiles)
  END.saved={blc:bossLight.color.clone(),bld:bossLight.distance};bossLight.color.set(0x7c8cb0);bossLight.distance=14;bossLight.intensity=1.1;bossLight.position.set(S.x+1.5,H+3.2,S.z+4.5);
  // cigarette smoke: its own little sprite pool
  END.wisps=[];for(let i=0;i<22;i++){const m=new THREE.SpriteMaterial({map:smokeTex,color:0xa8a4a0,transparent:true,opacity:0,depthWrite:false});levelDispose.push(m);const s=new THREE.Sprite(m);s.visible=false;world.add(s);END.wisps.push({s,life:0});}
  END.wispT=0;END.drag={next:0.15,t:-1,lit:false};
  if(camera.fov!==50){camera.fov=50;camera.updateProjectionMatrix();}
  if(crackleGain&&AC)crackleGain.gain.setTargetAtTime(muted?0:0.05,AC.currentTime,1);
  startNightAmbience();
}
function makeSurvivor(){
  const g=new THREE.Group();const meshes=[];
  const boots=0x15110e,pants=0x2c2a25,shirt=0x3b3f30,strap=0x1c1814,skin=0x6e4630,hair=0x100e0d,rag=0x5a1410,gun=0x18181a,gun2=0x2a2a2a;
  const B1=0x300404,B2=0x3c0605,B3=0x220302,dirt=0x2a241c;
  const mesh=(b,parent)=>{const m=new THREE.Mesh(b.build(),zMat);m.castShadow=true;parent.add(m);meshes.push(m);return m;};
  // legs: weight on the right leg, left knee loose
  const lb=new Builder();
  lb.box(pants,0.11,0.46,0,0.15,0.82,0.17).box(pants,-0.115,0.45,0.03,0.15,0.8,0.17,0.06,0,0.04);
  lb.box(boots,0.12,0.06,0.04,0.16,0.12,0.27).box(boots,-0.125,0.06,0.07,0.16,0.12,0.27,0,0.15,0);
  lb.box(pants,0,0.89,0,0.37,0.17,0.21).box(strap,0,0.97,0,0.39,0.05,0.23);
  lb.box(B3,0.11,0.55,-0.088,0.13,0.3,0.01).box(B1,-0.11,0.32,-0.083,0.12,0.18,0.01).box(dirt,0.12,0.22,0.088,0.14,0.2,0.01).box(B2,-0.1,0.68,0.12,0.1,0.14,0.01);  // blood and dirt
  lb.box(skin,-0.115,0.5,-0.087,0.06,0.07,0.012);                       // torn trouser, skin showing
  mesh(lb,g);
  // torso pivots at the waist: slumped forward
  const torso=new THREE.Group();torso.position.y=0.95;g.add(torso);
  const tb=new Builder();
  tb.box(shirt,0,0.24,0,0.41,0.49,0.22);
  for(const [x,y,w,h,r,c] of[[0.05,0.28,0.3,0.3,0.2,B1],[-0.1,0.12,0.2,0.22,-0.3,B2],[0.12,0.4,0.14,0.12,0.5,B3],[-0.04,0.42,0.22,0.08,0,B1],[0.14,0.05,0.12,0.16,0.1,B3]])tb.box(c,x,y,-0.113,w,h,0.01,0,0,r);   // back
  for(const [x,y,w,h,c] of[[-0.06,0.3,0.24,0.26,B2],[0.1,0.1,0.16,0.18,B1]])tb.box(c,x,y,0.113,w,h,0.01);   // front
  tb.box(B3,0.208,0.24,0,0.01,0.3,0.16).box(dirt,-0.208,0.18,0.02,0.01,0.22,0.14);
  for(const x of[-0.15,-0.05,0.07,0.16])tb.box(shirt,x,-0.02,rand(-0.08,0.08),0.07,rand(0.05,0.1),0.2,rand(-0.3,0.3),0,rand(-0.3,0.3));   // ragged hem
  tb.box(strap,0.02,0.26,-0.118,0.05,0.62,0.012,0,0,0.75).box(strap,0.02,0.26,0.118,0.05,0.62,0.012,0,0,-0.75);   // rifle sling
  tb.box(skin,0,0.52,0,0.1,0.08,0.1).box(rag,0,0.5,0,0.18,0.07,0.17);
  // right arm, sleeve torn off at the elbow, rifle hanging from the hand
  tb.box(shirt,0.26,0.36,0,0.12,0.18,0.13,0,0,0.06).box(B1,0.265,0.36,-0.067,0.1,0.14,0.01).box(skin,0.275,0.13,0.02,0.1,0.32,0.1,-0.12,0,0.05).box(0xa89c84,0.276,0.2,0.022,0.105,0.07,0.105).box(B2,0.276,0.1,-0.031,0.08,0.12,0.01,-0.12,0,0.05);
  tb.box(skin,0.29,-0.06,0.05,0.09,0.1,0.1).box(B3,0.29,-0.06,-0.002,0.08,0.06,0.01);
  mesh(tb,torso);
  const rifle=new THREE.Group();rifle.position.set(0.29,-0.07,0.06);rifle.rotation.set(1.12,0.05,0);torso.add(rifle);
  const rb=new Builder().box(gun,0,0,-0.24,0.05,0.11,0.26).box(gun,0,0.02,0.02,0.06,0.09,0.32).box(gun2,0,0.035,0.31,0.06,0.07,0.28).box(gun,0,0.03,0.58,0.025,0.025,0.3)
    .box(gun,0,-0.1,0.08,0.05,0.16,0.07,0.25,0,0).box(gun,0,-0.06,-0.04,0.04,0.1,0.05,-0.3,0,0).box(gun,0,0.09,0.04,0.02,0.04,0.2).box(B3,0.031,0.02,0.1,0.002,0.05,0.12);
  mesh(rb,rifle);
  // left arm: shoulder -> elbow -> hand with the cigarette (animated)
  const sh=new THREE.Group();sh.position.set(-0.26,0.44,0);torso.add(sh);
  mesh(new Builder().box(shirt,0,-0.14,0,0.12,0.3,0.13).box(B2,0,-0.12,-0.066,0.1,0.2,0.01).box(shirt,0.03,-0.28,0,0.06,0.06,0.12,0,0,0.4),sh);
  const el=new THREE.Group();el.position.y=-0.29;sh.add(el);
  mesh(new Builder().box(skin,0,-0.13,0,0.095,0.27,0.095).box(B3,0,-0.08,-0.049,0.07,0.12,0.01).box(skin,0,-0.31,0.015,0.085,0.09,0.09),el);
  const cig=new THREE.Group();cig.position.set(0,-0.32,0.05);el.add(cig);
  const cm=new THREE.Mesh(G.box,M(0xe8e2d4));cm.scale.set(0.011,0.011,0.08);cm.position.z=0.035;cig.add(cm);
  const emM=new THREE.MeshBasicMaterial({color:0xff5a14,toneMapped:false});levelDispose.push(emM);
  const em=new THREE.Mesh(G.sphereLo,emM);em.scale.setScalar(0.016);em.position.z=0.078;cig.add(em);
  const egM=new THREE.SpriteMaterial({map:softTex,color:0xff7a30,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});levelDispose.push(egM);
  const eg=new THREE.Sprite(egM);eg.scale.setScalar(0.12);eg.position.z=0.078;cig.add(eg);
  const lfM=new THREE.SpriteMaterial({map:flameTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,opacity:0.9});levelDispose.push(lfM);
  const lighter=new THREE.Sprite(lfM);lighter.scale.set(0.05,0.09,1);lighter.position.set(0,-0.02,0.1);lighter.visible=false;cig.add(lighter);
  // head, bowed a little, with a rag tied round it; rag tails move in the wind
  const head=new THREE.Group();head.position.y=0.55;torso.add(head);
  mesh(new Builder().box(skin,0,0.12,0.01,0.2,0.24,0.22).box(hair,0,0.235,-0.01,0.21,0.035,0.23).box(hair,0,0.13,-0.1,0.21,0.2,0.035).box(rag,0,0.19,0,0.214,0.035,0.232).box(B3,0.07,0.17,0.112,0.06,0.05,0.01),head);
  const tails=new THREE.Group();tails.position.set(0.02,0.19,-0.12);head.add(tails);
  mesh(new Builder().box(rag,0.02,-0.08,0,0.035,0.16,0.01,0,0,0.15).box(rag,-0.025,-0.06,0,0.03,0.12,0.01,0,0,-0.2),tails);
  const flap=new THREE.Group();flap.position.set(0.08,-0.02,-0.11);torso.add(flap);
  mesh(new Builder().box(shirt,0,-0.07,0,0.12,0.15,0.012).box(B1,0,-0.09,-0.007,0.08,0.08,0.002),flap);
  meshes.forEach(m=>levelDispose.push(m.geometry));
  return {g,torso,head,sh,el,cig,em,eg,lighter,tails,flap};
}

const _endLook=new THREE.Vector3(),_endW=new THREE.Vector3(),_endW2=new THREE.Vector3();
const smooth5=(x)=>{x=Math.min(1,Math.max(0,x));return x*x*x*(x*(x*6-15)+10);};
function updateEnding(dt){
  if(!END)return;
  END.t+=dt;
  if(!END.scene){
    // gameplay holds while the boss finishes its fall
    updateInfected(dt);updateDecals(dt);
    if(!END.fading&&END.t>=END.hold){END.fading=true;$('fade').classList.add('slow','on');}
    if(END.fading&&END.t>=END.hold+0.95){buildEndingScene();$('endCaption').classList.add('on');}   // build behind the black, show "3 days later"
    return;
  }
  if(!END.revealed){                                   // hold on black with the caption, then fade up on the rooftop
    if(END.t<END.hold+3.4)return;
    END.revealed=true;$('endCaption').classList.remove('on');$('fade').classList.remove('on');
  }
  END.ct+=dt;const ct=END.ct,S=END.S,H=END.H,sv=END.sv;
  // camera: medium rear shot -> slow pull-back and rise -> wide shot of the skyline, he stays in the middle
  const k=smooth5(ct/END_LEN),drift=Math.max(0,ct-END_LEN);
  const cx=S.x+lerp(0.38,1.2,k)+Math.sin(ct*0.21)*0.03,cy=H+lerp(1.5,3.6,k)+Math.sin(ct*0.33)*0.02,cz=S.z+lerp(2.7,11.5,k)+drift*0.05;
  camera.position.set(cx,cy,cz);
  _endLook.set(S.x+lerp(-0.05,0,k),H+lerp(1.05,-1.5,k),S.z+lerp(-5,-70,k));camera.lookAt(_endLook);
  // survivor: heavy breathing, a slow weight shift, the wind in the rags
  const br=Math.sin(ct*1.65);sv.torso.rotation.set(0.15+br*0.014,0,0.03+Math.sin(ct*0.28)*0.01);sv.torso.position.y=0.95+br*0.004;
  sv.g.rotation.z=Math.sin(ct*0.28)*0.008;
  sv.tails.rotation.set(Math.sin(ct*3.1)*0.25,0,Math.sin(ct*2.3)*0.2);sv.flap.rotation.x=-0.1+Math.sin(ct*2.7)*0.12;
  // cigarette: lit at the start, then a slow drag every ~7.5 s
  const D=END.drag;
  if(D.t<0&&ct>=D.next){D.t=0;D.first=!D.lit;}
  let up=0;
  if(D.t>=0){D.t+=dt;const tt=D.t,hold=D.first?1.15:1.3;
    up=tt<0.9?smooth5(tt/0.9):tt<0.9+hold?1:1-smooth5((tt-0.9-hold)/1.0);
    if(D.first){sv.lighter.visible=tt>0.75&&tt<1.55;if(tt>0.78&&!D.click){D.click=true;cigSound('lighter');}if(tt>1.2)D.lit=true;}
    else if(tt>0.9&&!D.inh){D.inh=true;cigSound('inhale');}
    if(tt>2.6+hold&&!D.ex){D.ex=true;exhale();cigSound('exhale');}
    if(tt>3.4+hold){D.t=-1;D.next=ct+rand(6.5,8.5);D.click=D.inh=D.ex=false;D.first=false;}}
  sv.sh.rotation.set(lerp(-0.12,-1.05,up),lerp(0,0.35,up),lerp(-0.07,0.62,up));sv.el.rotation.set(lerp(-0.45,-2.25,up),0,0);
  sv.head.rotation.set(lerp(0.2,0.05,up)+Math.sin(ct*0.4)*0.015,Math.sin(ct*0.17)*0.04,0);
  const inhale=D.t>0.9&&up>0.95&&!D.first?1:0;
  END.glowK=lerp(END.glowK||0,D.lit?(inhale?1:0.35):0,Math.min(1,dt*(inhale?3:1.5)));
  sv.em.visible=D.lit;sv.eg.visible=D.lit;sv.eg.material.opacity=0.25+END.glowK*0.6;sv.eg.scale.setScalar(0.08+END.glowK*0.08);
  sv.em.material.color.setRGB(1,0.25+END.glowK*0.3,0.06);
  // smoke curling off the ember
  END.wispT-=dt;if(D.lit&&END.wispT<=0){END.wispT=0.14;sv.em.getWorldPosition(_endW);wisp(_endW,0.03,rand(1.8,2.6),0.22);}
  for(const w of END.wisps){if(w.life<=0)continue;w.life-=dt;const u=1-w.life/w.max;w.s.position.x+=dt*(0.06+w.wind);w.s.position.y+=dt*w.vy;w.s.position.z+=dt*0.02;
    w.s.material.rotation+=dt*0.3;const sz=w.s0+u*w.grow;w.s.scale.set(sz,sz*1.3,1);w.s.material.opacity=w.op*Math.sin(Math.PI*Math.min(1,u*1.2))*(1-u*0.4);if(w.life<=0)w.s.visible=false;}
  // fires flicker; the two nearest light the scene
  for(const f of END.fires){f.ph+=dt;
    if(f.glowOnly){f.glowOnly.material.opacity=f.base*(0.75+Math.sin(f.ph*3)*0.15+Math.random()*0.1);continue;}
    for(const p of f.fl){p.ph+=dt*rand(4,7);const h=f.s*(1.1+Math.sin(p.ph)*0.3);p.sp.scale.set(f.s*0.9,h*1.4,1);p.sp.position.y=f.y+h*0.55;p.sp.position.x=p.ox+Math.sin(p.ph*0.7)*0.1;p.sp.material.opacity=0.75+Math.sin(p.ph*1.3)*0.2;}
    f.glow.material.opacity=0.26+Math.sin(f.ph*7)*0.04+Math.random()*0.05;}
  for(const [l,f] of END.fl){const fl=0.75+Math.sin(ct*13+f.ph)*0.12+Math.random()*0.1;l.position.set(f.x,f.y+1.4,f.z);l.intensity=2.4*fl*f.s;}
  for(const c of END.clouds)c.s.position.x+=dt*c.v;
  // ash in the wind around the roof
  const ap=END.ash.geometry.attributes.position.array;
  for(let i=0;i<ap.length;i+=3){ap[i]+=dt*(0.6+(i%5)*0.12);ap[i+1]-=dt*(0.25+(i%7)*0.04);ap[i+2]+=dt*Math.sin(ct*0.4+i)*0.12;
    if(ap[i]>S.x+30)ap[i]-=60;if(ap[i+1]<H-4)ap[i+1]+=18;}
  END.ash.geometry.attributes.position.needsUpdate=true;
  // text beats, once the camera has settled
  const show=(id,at,fn)=>{if(!END.shown[id]&&ct>=at){END.shown[id]=true;$(id).classList.add('on');if(fn)fn();}};
  show('endMsg',END_T.msg,()=>endNote([110,164.81]));show('endSub',END_T.sub);show('endBrand',END_T.brand,()=>endNote([82.41]));
  if(!END.final&&ct>=END_T.fin){END.final=true;const W=$('win');W.classList.remove('cine');W.classList.add('final');
    $('wStats').classList.add('on');countUpStats();setTimeout(()=>{if(END&&END.final){$('endActions').classList.add('on');$('againBtn').focus({preventScroll:true});}},$('win').classList.contains('quick')?50:900);}
}
function wisp(pos,s0,life,op,big){const w=END.wisps.find(w=>w.life<=0);if(!w)return;w.s.visible=true;w.s.position.copy(pos);w.life=w.max=life;w.s0=s0;w.grow=big?0.55:0.3;w.op=op;w.vy=big?0.18:0.28;w.wind=big?0.12:rand(0.02,0.08);w.s.material.rotation=rand(0,6.28);w.s.scale.setScalar(s0);w.s.material.opacity=0;}
function exhale(){const sv=END.sv;sv.head.updateMatrixWorld(true);_endW2.set(0,0.1,0.16).applyMatrix4(sv.head.matrixWorld);for(let i=0;i<5;i++){const p=_endW2.clone();p.x+=rand(-0.03,0.03);p.y+=i*0.02;wisp(p,0.08,rand(2.4,3.2),0.3,true);}}
// stats count up to their real values (the numbers come straight from the campaign totals)
function countUpStats(){
  const els=[...$('wStats').querySelectorAll('b')];
  els.forEach((el,i)=>{const txt=el.textContent,m=txt.match(/^(\d+):(\d+)$/),target=m?(+m[1]*60+ +m[2]):parseInt(txt,10),suf=txt.endsWith('%')?'%':'';
    if(!isFinite(target)||target===0)return;const t0=performance.now()+i*180,dur=1100;
    const fmt=v=>m?`${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`:v+suf;
    const tick=()=>{if(!END)return el.textContent=txt;const u=Math.min(1,Math.max(0,(performance.now()-t0)/dur));el.textContent=fmt(Math.round(target*(1-Math.pow(1-u,3))));if(u<1)requestAnimationFrame(tick);else el.textContent=txt;};
    el.textContent=fmt(0);tick();});
}

/* ---------- audio: a slow, low minor lament, night wind, distant sounds of a dead city, the cigarette ---------- */
function startEndingAudio(){
  if(!AC||muted)return null;
  const t=AC.currentTime,out=AC.createGain();out.gain.setValueAtTime(0.0001,t);out.gain.exponentialRampToValueAtTime(0.8,t+5);out.connect(master);
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=650;lp.connect(out);
  // A minor -> F -> D minor -> E, low and slow; each chord swells and dies away
  const chords=[[110,130.81,164.81,246.94],[87.31,130.81,174.61,220],[73.42,146.83,174.61,220],[82.41,123.47,164.81,207.65]];
  const line=[329.63,261.63,293.66,246.94];
  let ci=0,next=t+0.3;
  const chord=(w)=>{const i=ci++%4,ch=chords[i];
    for(const f of ch)for(const det of[-6,6]){const o=AC.createOscillator(),g=AC.createGain();o.type=det<0?'triangle':'sawtooth';o.frequency.value=f;o.detune.value=det;
      g.gain.setValueAtTime(0.0001,w);g.gain.linearRampToValueAtTime(det<0?0.05:0.011,w+2.6);g.gain.linearRampToValueAtTime(0.0001,w+7.4);o.connect(g);g.connect(lp);o.start(w);o.stop(w+7.6);}
    const s=AC.createOscillator(),sg=AC.createGain();s.type='sine';s.frequency.value=ch[0]/2;sg.gain.setValueAtTime(0.0001,w);sg.gain.linearRampToValueAtTime(0.075,w+2.2);sg.gain.linearRampToValueAtTime(0.0001,w+7.4);s.connect(sg);sg.connect(out);s.start(w);s.stop(w+7.6);
    // one soft, low note falling over each chord, like a far-off piano
    const n=AC.createOscillator(),ng=AC.createGain();n.type='sine';n.frequency.value=line[i];const nw=w+rand(1.5,2.5);ng.gain.setValueAtTime(0.0001,nw);ng.gain.exponentialRampToValueAtTime(0.028,nw+0.03);ng.gain.exponentialRampToValueAtTime(0.0001,nw+4);n.connect(ng);ng.connect(out);if(echoIn)ng.connect(echoIn);n.start(nw);n.stop(nw+4.1);};
  const A={out,timer:0,amb:0};
  const fill=()=>{if(!AC)return;while(next<AC.currentTime+1.5){chord(next);next+=6;}};fill();A.timer=setInterval(fill,500);
  return A;
}
function endNote(freqs){
  const A=END&&END.audio;if(!A||!AC)return;const t=AC.currentTime;
  freqs.forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;const w=t+i*0.6;
    g.gain.setValueAtTime(0.0001,w);g.gain.exponentialRampToValueAtTime(0.05,w+0.05);g.gain.exponentialRampToValueAtTime(0.0001,w+5);o.connect(g);g.connect(A.out);if(echoIn)g.connect(echoIn);o.start(w);o.stop(w+5.1);});
}
function startNightAmbience(){
  const A=END&&END.audio;if(windGain&&AC)windGain.gain.setTargetAtTime(muted?0:0.1,AC.currentTime,2);
  if(!A||!AC)return;
  // a dead city far away: a groan carried on the wind, something collapsing, a dog that stops barking
  A.amb=setInterval(()=>{if(!END||!END.scene||muted)return;const r=Math.random(),p={x:P.x+rand(-120,120),z:P.z-rand(60,160)};
    if(r<0.4)SFX.groan(p,rand(0.7,0.9));
    else if(r<0.75)sNoise(rand(2,3.5),'lowpass',rand(90,160),0.16,1,40,{pos:p,range:400,echo:true});
    else{for(let i=0;i<irand(2,4);i++)sTone('sawtooth',rand(520,620),rand(380,440),0.16,0.05,{pos:p,range:400,bp:900,q:3,delay:i*0.45,echo:true});}},rand(5200,7600));
}
function cigSound(kind){
  if(!AC||muted||!(END&&END.audio))return;
  if(kind==='lighter'){sNoise(0.03,'highpass',3500,0.18,1,0);sNoise(0.08,'bandpass',2200,0.1,2,0,{delay:0.06});sNoise(0.5,'bandpass',900,0.06,1,0,{delay:0.1});}
  else if(kind==='inhale')sNoise(1.1,'bandpass',2600,0.035,0.8,1800);
  else sNoise(1.3,'lowpass',900,0.05,1,400);
}
function stopEndingAudio(){
  const A=END&&END.audio;if(windGain&&AC)windGain.gain.setTargetAtTime(muted?0:0.06,AC.currentTime,0.4);
  if(!A||!AC)return;const t=AC.currentTime;clearInterval(A.timer);clearInterval(A.amb);
  A.out.gain.cancelScheduledValues(t);A.out.gain.setValueAtTime(Math.max(0.0001,A.out.gain.value),t);A.out.gain.exponentialRampToValueAtTime(0.0001,t+0.7);
}
Object.defineProperties(window.__cd,Object.getOwnPropertyDescriptors({get END(){return END;},skipEnding,get totals(){return totals;}}));
