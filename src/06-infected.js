/* ================= infected: models ================= */
const shade=(c,k)=>{_c.set(c).multiplyScalar(k);return _c.getHex();};
const SKINS=[0x8a9a7a,0x9a9884,0x7f8c6a,0xa09078,0x8a8070,0x76806a,0x6f6656];
const SHIRTS=[0x6b7a5a,0x8a6f5a,0x4f5f6f,0x7a4a4a,0x9a9070,0x3a5a7a,0xa0a0a0,0x5a3a5a,0xc0a070];
const LUNGI=[0x2f4f8a,0x3a6a4a,0x6a2a3a,0xd8d0b8,0x4a3a7a,0x8a5a2a];
function outfit(type){
  const s={skin:pick(SKINS),top:pick(SHIRTS),bottom:0x2a3a5a,leg:null,shin:null,foot:0x2a2016,skirt:null,sash:null,bun:false,jasmine:false,hair:Math.random()<0.75,hairCol:pick([0x111111,0x1a1410,0x2a2420,0x555048]),
    lanyard:false,banian:false,towel:false,belly:0,wounds:irand(1,3),missing:Math.random()<0.14?irand(0,1):-1,eye:0,hunch:0,chestW:0.44,fungal:false,ribs:Math.random()<0.15};
  if(type==='kaalan'){Object.assign(s,{skin:0xa49a80,top:0x3a3228,bottom:0x2a2620,hair:false,fungal:true,hunch:0.55,wounds:2,missing:-1,eye:-1});return s;}
  if(type==='thadiyan'){Object.assign(s,{top:0xd0ccc0,banian:true,skirt:{color:pick(LUNGI),len:0.72,check:true},belly:1,chestW:0.56,hair:Math.random()<0.5});s.leg=s.skin;s.shin=s.skin;return s;}
  const o=type==='odi'?pick(['casual','it','khaki','worker']):pick(['lungi','lungi','veshti','khaki','it','saree','saree','worker','casual','casual']);
  if(o==='lungi'){s.skirt={color:pick(LUNGI),len:0.72,check:true};s.leg=s.skin;s.shin=s.skin;}
  else if(o==='veshti'){s.skirt={color:0xeee8d8,len:0.86,border:0xc0a030};s.top=Math.random()<0.5?0xe8e2d0:0xd0ccc0;s.banian=s.top===0xd0ccc0;s.shin=s.skin;}
  else if(o==='khaki'){s.top=0xa08a5a;s.bottom=0x8a7a50;}
  else if(o==='it'){s.top=pick([0xa8c0d8,0xe8e8e8,0xd8b8c0,0xb8d0b0]);s.bottom=0x2a2e36;s.lanyard=true;s.foot=0x111111;}
  else if(o==='saree'){const c=pick([0xb0182a,0x1a7a5a,0x8a1a8a,0xd87a1a,0x1a3a8a,0xc8a020]);s.skirt={color:c,len:0.92,border:0xd8b040};s.top=Math.random()<0.5?c:pick([0xd8b040,0x2a2a2a,0x7a1a2a]);s.sash=c;s.bun=true;s.jasmine=Math.random()<0.7;s.hair=true;s.hairCol=0x0d0b0a;s.shin=s.skin;}
  else if(o==='worker'){s.top=0xd0ccc0;s.banian=true;s.bottom=0x3a4a5a;s.shin=s.skin;s.towel=Math.random()<0.6;}
  else {s.top=pick([0x8a2b2b,0x2a5a3a,0xd8a020,0x3a3a3a,0xe0e0e0,0x6a4a7a]);s.bottom=pick([0x2a3a5a,0x3a3a3a,0x4a4038]);}
  const dirt=rand(0.68,0.92);s.top=shade(s.top,dirt);if(s.skirt)s.skirt.color=shade(s.skirt.color,dirt);s.bottom=shade(s.bottom,dirt);
  if(type==='odi'){s.eye=1;s.hair=true;s.hairCol=0x111111;}
  return s;
}
function makeRig(type,sp){
  const g=new THREE.Group();g.rotation.order='YXZ';const meshes=[];
  const mk=(b,parent,cast,mat)=>{const m=new THREE.Mesh(b.build(),mat||zMat);m.castShadow=cast!==false;parent.add(m);meshes.push(m);return m;};
  const hips=new THREE.Group();hips.position.y=0.95;g.add(hips);
  const pb=new Builder().box(sp.bottom,0,0,0,0.36,0.2,0.22);
  if(sp.skirt){const L2=sp.skirt.len;pb.box(sp.skirt.color,0,-L2/2+0.06,0,0.47,L2,0.33);if(sp.skirt.check){for(let i=0;i<4;i++)pb.box(shade(sp.skirt.color,0.7),0,-0.05-i*0.16,0,0.475,0.03,0.335);pb.box(shade(sp.skirt.color,0.75),0.12,-L2/2+0.06,0,0.03,L2,0.336);}
    if(sp.skirt.border)pb.box(sp.skirt.border,0,-L2+0.1,0,0.475,0.05,0.335);pb.box(0x3a2a1a,0,0.08,0,0.38,0.04,0.24);}
  else pb.box(0x2a2018,0,0.08,0,0.37,0.04,0.23);
  mk(pb,hips);
  const legs=[];
  for(const s of[-1,1]){const hip=new THREE.Group();hip.position.set(s*0.11,-0.04,0);hips.add(hip);
    const legC=sp.leg||sp.bottom;mk(new Builder().box(legC,0,-0.23,0,0.17,0.46,0.19),hip);
    const knee=new THREE.Group();knee.position.y=-0.46;hip.add(knee);
    const sb=new Builder().box(sp.shin||legC,0,-0.22,0,0.15,0.44,0.16).box(sp.foot,0,-0.46,0.05,0.15,0.08,0.27);if(Math.random()<0.3)sb.box(0x4a0808,0,-0.12,0.08,0.1,0.12,0.02);
    mk(sb,knee,false);legs.push({hip,knee});}
  const torso=new THREE.Group();torso.position.y=0.06;hips.add(torso);
  const cw=sp.chestW;const tb=new Builder();
  tb.box(sp.top,0,0.33,0,cw,0.5,0.25).box(sp.top,0,0.08,0,cw-0.04,0.22,0.23).box(sp.skin,0,0.61,0,0.12,0.1,0.12);
  if(sp.banian){tb.box(sp.skin,0,0.52,0.0,cw-0.12,0.12,0.255);}
  if(sp.belly)tb.add(G.sphere,sp.skin,0,0.12,0.06,0.52,0.48,0.4);
  if(sp.lanyard){tb.box(0x1a4a9a,0.06,0.42,0.128,0.02,0.32,0.01,0,0,0.25).box(0x1a4a9a,-0.06,0.42,0.128,0.02,0.32,0.01,0,0,-0.25).box(0xf0f0f0,0,0.22,0.13,0.08,0.11,0.01);}
  if(sp.sash)tb.box(sp.sash,0.04,0.33,0.0,0.16,0.68,0.27,0,0,-0.6);
  if(sp.ribs)for(let i=0;i<4;i++)tb.box(0xd8ccb0,0.05,0.25+i*0.07,0.128,0.16,0.025,0.01);
  for(let i=0;i<sp.wounds;i++)tb.box(pick([0x4a0808,0x6a1010,0x3a1a10]),rand(-0.15,0.15),rand(0.1,0.5),0.128,rand(0.06,0.16),rand(0.05,0.14),0.012);
  if(sp.fungal)for(let i=0;i<5;i++)tb.add(G.fungus,pick([0xd8c9a3,0xb79d6e,0x8f6b45]),rand(-0.2,0.2)*(i<3?1:0)+(i>=3?(i===3?0.22:-0.22):0),rand(0.4,0.6),rand(-0.1,0.05),rand(0.1,0.18),rand(0.07,0.12),rand(0.1,0.18),rand(0,3),rand(0,3),0);
  const torsoMesh=mk(tb,torso);
  const head=new THREE.Group();head.position.set(0,0.64,0);torso.add(head);
  const hb=new Builder();
  if(sp.fungal){
    hb.box(sp.skin,0,0.1,0,0.22,0.2,0.22);
    const fc=[0xe6dcc3,0xd8c9a3,0xb79d6e,0x8f6b45,0xc8a878];
    for(let i=0;i<14;i++){const a=rand(-1.6,1.6),e=rand(-0.4,1.2),r=rand(0.12,0.22);hb.add(G.fungus,pick(fc),Math.sin(a)*r,0.2+Math.sin(e)*0.13,Math.cos(a)*r*0.9+0.04,rand(0.12,0.26),rand(0.06,0.14),rand(0.12,0.24),rand(-.6,.6),a,rand(-.5,.5));}
    for(let i=0;i<4;i++)hb.add(G.cyl,0xe8dcc0,rand(-0.15,0.15),rand(0.3,0.42),rand(-0.05,0.1),rand(0.14,0.24),0.025,rand(0.14,0.24),rand(-.4,.4),0,rand(-.4,.4));
    hb.box(0x1a0a05,0,0.14,0.2,0.035,0.24,0.04).box(0x2a0a05,0,0.04,0.14,0.14,0.04,0.06);
  }else{
    hb.box(sp.skin,0,0.15,0,0.25,0.28,0.26).box(shade(sp.skin,0.85),0,0.12,0.135,0.05,0.07,0.03);
    hb.box(0x1a0606,0,0.06,0.131,0.14,0.035,0.01);
    if(sp.hair)hb.box(sp.hairCol,0,0.3,-0.01,0.27,0.07,0.28).box(sp.hairCol,0,0.2,-0.12,0.27,0.22,0.05);
    if(sp.bun)hb.add(G.sphere,sp.hairCol,0,0.2,-0.17,0.16,0.14,0.12);
    if(sp.jasmine)for(let i=0;i<5;i++)hb.box(0xf8f6ee,-0.1+i*0.05,0.25,-0.16,0.035,0.035,0.035);
    if(sp.towel)hb.box(pick([0xe8e2d0,0xc04030]),0,0.31,0,0.29,0.08,0.3);
    if(Math.random()<0.4)hb.box(0x4a0808,rand(-0.08,0.08),rand(0.1,0.25),0.131,0.08,0.06,0.01);
  }
  mk(hb,head);
  let jaw=null;
  if(!sp.fungal){jaw=mk(new Builder().box(shade(sp.skin,0.9),0,-0.01,0.05,0.2,0.06,0.17).box(0xd8d0b0,0,0.02,0.13,0.14,0.02,0.01),head,false);jaw.position.set(0,0.03,0);}
  if(sp.eye>=0){const eb=new Builder().box(0xffffff,-0.065,0.17,0.133,0.055,0.035,0.01).box(0xffffff,0.065,0.17,0.133,0.055,0.035,0.01);const e=new THREE.Mesh(eb.build(),sp.eye?eyeMatRed:eyeMat);head.add(e);meshes.push(e);}
  const arms=[];
  for(const s of[-1,1]){const sh=new THREE.Group();sh.position.set(s*(cw/2+0.06),0.52,0);torso.add(sh);
    const sleeve=sp.banian?sp.skin:sp.top;const ub=new Builder().box(sleeve,0,-0.15,0,0.12,0.32,0.13);if(sp.fungal&&s>0)ub.add(G.fungus,0xd8c9a3,0.04,-0.1,0,0.14,0.12,0.14);mk(ub,sh,false);
    const el=new THREE.Group();el.position.y=-0.3;sh.add(el);
    const missing=sp.missing===(s>0?1:0);
    if(missing)mk(new Builder().box(0x5a0a0a,0,-0.04,0,0.11,0.08,0.12),el,false);
    else{const fl=sp.fungal?0.36:0.28;mk(new Builder().box(sp.banian||sp.top===sp.skin?sp.skin:shade(sp.skin,0.95),0,-fl/2,0,0.1,fl,0.11).box(shade(sp.skin,0.9),0,-fl-0.05,0.0,0.1,sp.fungal?0.16:0.11,0.07),el,false);}
    arms.push({sh,el});}
  return {g,hips,torso,head,jaw,legs,arms,meshes,torsoMesh};
}
function makeBossRig(tier){
  const g=new THREE.Group();g.rotation.order='YXZ';const meshes=[];
  const mk=(b,parent,cast,mat)=>{const m=new THREE.Mesh(b.build(),mat||zMat);m.castShadow=cast!==false;parent.add(m);meshes.push(m);return m;};
  const skin=0x6f6852,flesh=0x7f6a52,fc=[0xe6dcc3,0xd8c9a3,0xb79d6e,0x8f6b45,0xc8a878,0x7a5a3a];
  const hips=new THREE.Group();hips.position.y=0.95;g.add(hips);
  const pb=new Builder().box(0x2a2420,0,0,0,0.62,0.26,0.4);for(let i=0;i<6;i++)pb.box(0x221c18,rand(-0.28,0.28),-0.25,rand(-0.18,0.18),rand(0.08,0.16),rand(0.25,0.45),0.04,rand(-.2,.2),0,rand(-.2,.2));mk(pb,hips);
  const legs=[];
  for(const s of[-1,1]){const hip=new THREE.Group();hip.position.set(s*0.2,-0.04,0);hips.add(hip);mk(new Builder().box(0x2a2420,0,-0.24,0,0.3,0.5,0.32).add(G.fungus,pick(fc),s*0.1,-0.2,0.12,0.18,0.14,0.14),hip);
    const knee=new THREE.Group();knee.position.y=-0.46;hip.add(knee);mk(new Builder().box(skin,0,-0.22,0,0.26,0.46,0.28).box(0x3a3028,0,-0.47,0.07,0.3,0.1,0.42),knee);legs.push({hip,knee});}
  const torso=new THREE.Group();torso.position.y=0.08;hips.add(torso);
  const tb=new Builder().box(skin,0,0.36,-0.02,0.86,0.62,0.5).add(G.sphere,flesh,0,0.16,0.1,0.82,0.62,0.6).box(0x2a2420,-0.2,0.45,0.2,0.32,0.4,0.16,0,0,0.2).box(0x2a2420,0.3,0.15,0.24,0.2,0.3,0.12,0,0,-0.3);
  for(let i=0;i<8;i++){const a=rand(-0.9,0.9);tb.add(G.fungus,pick(fc),Math.sin(a)*0.3,rand(0.0,0.35),0.38+rand(-0.05,0.05),rand(0.14,0.26),rand(0.12,0.2),rand(0.1,0.16),rand(0,3),rand(0,3),rand(0,3));}
  for(let i=0;i<26;i++){const a=rand(Math.PI*0.4,Math.PI*1.6),r=rand(0.28,0.42);tb.add(G.fungus,pick(fc),Math.sin(a)*r,rand(0.25,0.75),Math.cos(a)*r*0.8-0.05,rand(0.18,0.34),rand(0.12,0.22),rand(0.18,0.34),rand(0,3),rand(0,3),rand(0,3));}
  for(let i=0;i<10;i++)tb.add(G.cyl,0xe8dcc0,rand(-0.45,0.45),rand(0.55,0.8),rand(-0.3,0.1),rand(0.2,0.38),0.04,rand(0.2,0.38),rand(-.5,.5),0,rand(-.5,.5));
  mk(tb,torso);
  // detachable armour plates
  const plates=[];
  for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;const pm=mk(new Builder().add(G.fungus,pick(fc),0,0,0,0.34,0.16,0.3,rand(0,3),rand(0,3),0),torso);pm.position.set(Math.sin(a)*0.42,rand(0.3,0.7),Math.cos(a)*0.32);pm.rotation.set(rand(-.5,.5),a,rand(-.5,.5));plates.push(pm);}
  // spore sacs (glow pulses during wind-ups)
  const sacMat=new THREE.MeshStandardMaterial({color:0xd8a040,emissive:0xff8a20,emissiveIntensity:0.5,roughness:0.4});
  const sacs=[];for(let i=0;i<10;i++){const s=new THREE.Mesh(G.sphereLo,sacMat);const a=rand(Math.PI*0.6,Math.PI*1.4);s.position.set(Math.sin(a)*0.4,rand(0.35,0.75),Math.cos(a)*0.32);s.scale.setScalar(rand(0.13,0.22));if(i>6)s.position.set(rand(-0.3,0.3),rand(0.05,0.35),0.36);torso.add(s);sacs.push(s);}
  const head=new THREE.Group();head.position.set(0,0.66,0.12);torso.add(head);
  const hb=new Builder().box(skin,0,0.08,0,0.3,0.26,0.3);for(let i=0;i<12;i++){const a=rand(-1.8,1.8);hb.add(G.fungus,pick(fc),Math.sin(a)*0.2,rand(0.12,0.32),Math.cos(a)*0.15,rand(0.16,0.3),rand(0.1,0.2),rand(0.16,0.3),rand(0,3),a,0);}
  hb.box(0x1a0605,0,0.02,0.16,0.22,0.06,0.04);mk(hb,head);
  const jaw=mk(new Builder().box(shade(skin,0.85),0,-0.02,0.1,0.24,0.08,0.18).box(0xd8d0b0,-0.06,0.03,0.19,0.02,0.04,0.01).box(0xd8d0b0,0.02,0.03,0.19,0.02,0.05,0.01).box(0xd8d0b0,0.08,0.03,0.19,0.02,0.04,0.01),head,false);jaw.position.set(0,-0.02,0);
  const arms=[];
  for(const s of[-1,1]){const big=s<0;const sh=new THREE.Group();sh.position.set(s*0.52,0.58,0);torso.add(sh);
    const ub=new Builder().box(skin,0,-0.2,0,big?0.3:0.2,0.48,big?0.32:0.22);for(let i=0;i<(big?5:2);i++)ub.add(G.fungus,pick(fc),rand(-0.1,0.1),rand(-0.4,0),rand(-0.1,0.1),rand(0.16,0.26),rand(0.12,0.2),rand(0.16,0.26),rand(0,3),rand(0,3),0);mk(ub,sh);
    const el=new THREE.Group();el.position.y=-0.44;sh.add(el);
    const fb=new Builder().box(skin,0,-0.22,0,big?0.32:0.18,0.48,big?0.34:0.2);if(big){for(let i=0;i<8;i++)fb.add(G.fungus,pick(fc),rand(-0.18,0.18),rand(-0.62,-0.42),rand(-0.18,0.18),rand(0.2,0.34),rand(0.18,0.3),rand(0.2,0.34),rand(0,3),rand(0,3),0);}else fb.box(shade(skin,0.9),0,-0.5,0,0.16,0.14,0.1);
    mk(fb,el);arms.push({sh,el});}
  const s=tier==='full'?2.45:2.05;g.scale.setScalar(s);
  return {g,hips,torso,head,jaw,legs,arms,meshes,plates,sacs,sacMat,scale:s};
}

/* ================= infected: types & spawning ================= */
const ZT={
  pinam:{hp:85,speed:1.7,dmg:11,cd:1.1,wind:0.45,scale:1,pitch:1,r:0.34},
  odi:{hp:55,speed:4.2,dmg:8,cd:0.7,wind:0.28,scale:0.95,pitch:1.25,r:0.32},
  thadiyan:{hp:280,speed:1.35,dmg:24,cd:1.3,wind:0.62,scale:1.32,pitch:0.72,r:0.36},
  kaalan:{hp:170,speed:4.4,dmg:42,cd:1.6,wind:0.45,scale:1.02,pitch:1,r:0.34},
  boss:{hp:2200,speed:2.1,dmg:34,cd:1.4,wind:0.85,scale:2.45,pitch:0.5,r:0.34},
};
const TIPS={
  odi:['Odi','Runners. Fast and loud, but fragile. Headshots drop them quickly.'],
  thadiyan:['Thadiyan','Slow, heavy hitter that soaks bullets. Keep your distance and aim for the head.'],
  kaalan:['Kaalan','Blind. Hunts by sound. Press C to sneak past, or throw a rock (5) to send it elsewhere. Its grab hits very hard.'],
  boss:['Raatchasan','Watch the wind-ups. Red ring means a ground slam, red lane means a charge, a marked circle means a spore bomb. Dodge sideways or jump.'],
};
let seenTypes=new Set();
let zombies=[];
function spawnPoint(minD,maxD,ang){
  minD=minD||20;maxD=maxD||48;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);let fallback=null;
  for(let k=0;k<400;k++){
    const a=ang!==undefined&&k<250?ang+rand(-0.5,0.5):rand(0,6.283),d=rand(minD,maxD),x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;
    if(x<arena.x0+1||x>arena.x1-1||z<arena.z0+1||z>arena.z1-1)continue;if(!reachable(x,z))continue;
    const dot=((x-P.x)*fx+(z-P.z)*fz)/d;if(!fallback)fallback={x,z};
    if(ang===undefined&&dot>0.35&&k<300)continue;return {x,z};
  }
  if(fallback)return fallback;
  return freeSpot(12);
}
function newZombie(type,x,z,o){
  o=o||{};const T=ZT[type],W=LEVELS[level].wave;
  const sp=outfit(type);const rig=makeRig(type,sp);const s=T.scale*rand(0.95,1.06);rig.g.scale.setScalar(s);rig.g.position.set(x,0,z);world.add(rig.g);
  const gait=type==='odi'?'run':type==='kaalan'?'twitch':type==='thadiyan'?'heavy':pick(['shamble','walk','walk','limp']);
  const gaitMul={shamble:0.75,walk:1.05,limp:0.68,run:1,twitch:1,heavy:1}[gait];
  const zb={type,rig,mesh:rig.g,x,z,face:Math.atan2(P.x-x,P.z-z),hp:T.hp,maxHp:T.hp,speed:T.speed*gaitMul*W.speed*rand(0.9,1.1),dmg:T.dmg,cd:T.cd,wind:T.wind,s,r:T.r*s,h:1.92*s,
    gait,state:'chase',st:0,atk:-1,atkCd:0.5,flinch:0,stagger:0,kx:0,kz:0,phase:rand(0,6),los:false,losT:0,groan:rand(1,6),dead:false,deadT:0,removed:false,
    headTilt:rand(-0.25,0.25),wander:null,idle:0,lost:0,click:rand(0.3,1.2),twitch:0,noisePt:null,leanBase:type==='odi'?0.42:type==='kaalan'?0.55:type==='thadiyan'?0.1:rand(0.05,0.2)};
  if(type==='kaalan')zb.state='listen';
  else if(o.wander)zb.state='wander';
  zombies.push(zb);
  if(TIPS[type]&&!seenTypes.has(type)){seenTypes.add(type);setTimeout(()=>{if(state==='playing')showTip(TIPS[type][0],TIPS[type][1]);},1600);}
  return zb;
}
function spawnFromQueue(type,ang){
  if(type==='boss'){spawnBoss(LEVELS[level].wave.bossTier||'full');return;}
  const wander=type==='pinam'&&Math.random()<(LEVELS[level].wave.wander??0.38);
  const p=wander?spawnPoint(24,60):type==='kaalan'?spawnPoint(26,50,ang):spawnPoint(ang!==undefined?18:20,ang!==undefined?36:46,ang);
  newZombie(type,p.x,p.z,{wander});
}
function alert(z){
  if(z.dead||z.boss||z.state==='chase')return;z.state='chase';z.lost=0;
  const pos={x:z.x,z:z.z};
  if(z.type==='odi')SFX.scream(pos);else if(z.type==='kaalan'){SFX.kaalan('alert',pos);z.twitch=0.4;z.click=0.7;}else SFX.groan(pos,ZT[z.type].pitch);
}
function makeNoise(x,z,r,kind){
  for(const zb of zombies){if(zb.dead||zb.boss)continue;const d=Math.hypot(zb.x-x,zb.z-z);if(d>r)continue;
    if(zb.type==='kaalan'){if(kind==='rock'){if(zb.state!=='chase'){zb.state='investigate';zb.noisePt={x,z};zb.st=0;SFX.kaalan('search',{x:zb.x,z:zb.z});}}else if(zb.state!=='chase')alert(zb);else zb.lost=0;}
    else if(zb.state==='wander'){if(kind==='rock'){zb.wander={x,z};zb.idle=0;}else alert(zb);}
  }
}
function showTip(t,s){$('tipT').textContent=t;$('tipS').textContent=s;$('tip').style.opacity=1;tipT=7;}
let tipT=0;

/* ================= infected: damage & death ================= */
function stainClothes(z,n){const m=z.rig.torsoMesh;if(!m)return;const col=m.geometry.attributes.color;const tris=(col.count/3)|0;
  for(let k=0;k<n;k++){const t=(Math.random()*(tris-2))|0;const base=t*3-((t*3)%6);_c.set(pick([0x5a0606,0x7a0a0a,0x4a0404,0x620808]));for(let i=base;i<Math.min(col.count,base+6);i++)col.setXYZ(i,_c.r,_c.g,_c.b);}col.needsUpdate=true;}
function loseArm(z){const a=pick(z.rig.arms);if(a.lost)return;a.lost=true;a.el.visible=false;const wp=new THREE.Vector3();a.el.getWorldPosition(wp);
  burst(wp.x,wp.y,wp.z,0x7a0808,16,4,0.07,0.8);burst(wp.x,wp.y,wp.z,0x9a8a70,3,3,0.1,1.0);z.spurtArm=1.4;z.spurtEl=a.el;bloodDecal(wp.x,wp.z,1.2);}
function hurtZombie(z,dmg,o){
  o=o||{};if(z.dead)return false;
  if(z.boss)return hurtBoss(z,dmg,o);
  z.hp-=dmg;z.kx+=o.kx||0;z.kz+=o.kz||0;
  z.flinch=Math.max(z.flinch,o.heavy?0.5:0.28);z.hitT=0.25;z.twistDir=Math.random()<0.5?-1:1;
  if(o.heavy&&z.type!=='thadiyan'){z.stagger=Math.max(z.stagger,o.stun||0.6);z.atk=-1;}
  else if(o.heavy){z.stagger=Math.max(z.stagger,0.3);}
  const by=o.head?z.h*0.9:z.h*rand(0.45,0.7),d=o.dir;
  if(o.burn){if(Math.random()<0.3)burst(z.x,by,z.z,0xffa040,2,1.5,0.03,0.5,{add:true,grav:-2});if(z.state!=='chase')alert(z);if(z.hp<=0){killZombie(z,o);return true;}return false;}
  burst(z.x,by,z.z,0x7a0808,o.head?16:9,3.5,0.06,0.7);
  if(d)burst(z.x+d.x*z.r,by,z.z+d.z*z.r,0x5a0505,o.head?12:7,5.5,0.05,0.6,{dir:d,spread:0.3});
  puff(z.x,by,z.z,0x5a0606,o.head?0.9:0.5,0.6,0.15,0.45);
  if(Math.random()<0.6)bloodDecal(z.x+(d?d.x*rand(0.8,2.2):rand(-.6,.6)),z.z+(d?d.z*rand(0.8,2.2):rand(-.6,.6)),rand(0.5,1.1));
  stainClothes(z,o.head?1:2);
  if(o.heavy&&!o.head&&Math.random()<0.25&&z.type!=='thadiyan')loseArm(z);
  SFX.zHit({x:z.x,z:z.z});
  if(z.state!=='chase')alert(z);
  if(z.hp<=0){killZombie(z,o);return true;}
  return false;
}
function killZombie(z,o){
  z.dead=true;z.deadT=0;stats.kills++;if(z.type==='kaalan')SFX.kaalan('death',{x:z.x,z:z.z});
  z.deathType=o.blast?pick(['back','spin']):o.heavy?pick(['back','spin','stumble']):o.head?(z.type!=='kaalan'&&Math.random()<0.6?'headless':pick(['crumple','back'])):pick(['back','forward','crumple','spin','kneel','stumble']);
  z.deathDir=Math.sign(rand(-1,1))||1;
  if(o.head&&z.rig.head&&z.type!=='kaalan'){z.rig.head.visible=false;burst(z.x,z.h*0.92,z.z,0x5a0808,22,4.5,0.07,0.9);burst(z.x,z.h*0.92,z.z,shade(SKINS[0],0.9),6,3.5,0.09,1.1);puff(z.x,z.h*0.92,z.z,0x5a0606,1.2,0.8,0.2,0.55);z.spurt=2.2;}
  if(o.head&&z.type==='kaalan')burst(z.x,z.h*0.9,z.z,0xd8c9a3,14,3.5,0.08,0.8);
  bloodDecal(z.x,z.z,rand(1.2,1.9));bloodDecal(z.x+rand(-.4,.4),z.z+rand(-.4,.4),rand(1.4,2.0),{pool:true,life:45});
  const r=Math.random()/(level>=3?0.6:1),bonus=z.type==='thadiyan'||z.type==='kaalan';
  if(r<(bonus?0.45:0.14))dropPickup('ammo',z.x,z.z);
  else if(r<(bonus?0.6:0.19))dropPickup('med',z.x,z.z);
  else if(r<(bonus?0.75:0.31))dropPickup('rock',z.x,z.z);
}
function updateDeath(z,dt){
  z.deadT+=dt;let t=z.deadT;const R=z.rig,g=z.mesh;
  if(z.spurt>0){z.spurt-=dt;if(Math.random()<dt*25){R.torso.updateMatrixWorld();const wp=new THREE.Vector3(0,0.62,0);R.torso.localToWorld(wp);burst(wp.x,wp.y,wp.z,0x8a0a0a,1,2.6*Math.min(1,z.spurt),0.04,0.5,{dir:new THREE.Vector3(rand(-.3,.3),1,rand(-.3,.3)),spread:0.25});}}
  if(z.spurtArm>0){z.spurtArm-=dt;if(z.spurtEl&&Math.random()<dt*15){const wp=new THREE.Vector3();z.spurtEl.getWorldPosition(wp);burst(wp.x,wp.y,wp.z,0x8a0a0a,1,1.8,0.035,0.4);}}
  let type=z.deathType;
  if(type==='headless'){if(t<0.7){R.arms[0].sh.rotation.x=-1.2+Math.sin(t*30)*0.3;R.arms[1].sh.rotation.x=-1.0-Math.sin(t*27)*0.3;g.rotation.z=Math.sin(t*8)*0.08;return;}type='crumple';t-=0.7;}
  if(type==='stumble'){if(t<0.7){const back=-1.6*dt;z.x+=Math.sin(z.face)*back;z.z+=Math.cos(z.face)*back;g.position.x=z.x;g.position.z=z.z;g.rotation.z=Math.sin(t*12)*0.15;R.torso.rotation.x=-0.3;R.arms[0].sh.rotation.x=-2;R.arms[1].sh.rotation.x=-1.4;return;}type='back';t-=0.7;}
  const k=easeOut(t/0.6);
  if(type==='back'){g.rotation.x=-k*1.5;R.arms[0].sh.rotation.x=-2.6*k;R.arms[1].sh.rotation.x=-2.2*k;R.legs[0].hip.rotation.x=0.3*k;}
  else if(type==='forward'){const k1=easeOut(t/0.35),k2=easeOut((t-0.25)/0.5);R.hips.position.y=0.95-0.45*k1;R.legs[0].knee.rotation.x=1.6*k1;R.legs[1].knee.rotation.x=1.6*k1;R.legs[0].hip.rotation.x=-1.2*k1;R.legs[1].hip.rotation.x=-1.2*k1;g.rotation.x=1.2*k2;R.arms[0].sh.rotation.x=-0.5;R.arms[1].sh.rotation.x=-0.6;}
  else if(type==='kneel'){const k1=easeOut(t/0.45),k2=easeOut((t-0.9)/0.5);R.hips.position.y=0.95-0.5*k1;R.legs[0].knee.rotation.x=1.7*k1;R.legs[1].knee.rotation.x=1.7*k1;R.legs[0].hip.rotation.x=-0.2*k1;R.legs[1].hip.rotation.x=-0.2*k1;R.torso.rotation.x=0.2*k1+0.4*k2;R.arms[0].sh.rotation.x=-0.2;R.arms[1].sh.rotation.x=-0.3;R.head.rotation.x=0.6*k1;g.rotation.x=1.3*k2;}
  else if(type==='crumple'){const k1=easeOut(t/0.5);R.hips.position.y=0.95-0.62*k1;R.torso.rotation.x=0.9*k1;R.legs[0].knee.rotation.x=2.0*k1;R.legs[1].knee.rotation.x=1.7*k1;R.legs[0].hip.rotation.x=-1.4*k1;R.legs[1].hip.rotation.x=-1.1*k1;g.rotation.z=z.deathDir*0.9*easeOut((t-0.4)/0.5);}
  else{g.rotation.y=z.face+z.deathDir*1.6*k;g.rotation.z=z.deathDir*1.45*easeOut((t-0.15)/0.6);R.arms[0].sh.rotation.x=-1.2;}
  if(R.jaw)R.jaw.rotation.x=0.4*k;
  if(z.deadT>5)g.position.y-=dt*0.3;
  if(z.deadT>7.5&&!z.removed){z.removed=true;world.remove(g);R.meshes.forEach(m=>m.geometry.dispose());}
}

/* ================= infected: per-frame AI ================= */
function animRig(z,dt,moving,atkPhase){
  const R=z.rig;let amp=0,rate=0;
  switch(z.gait){case 'run':amp=0.95;rate=11;break;case 'twitch':amp=0.6;rate=z.state==='chase'?12:5;break;case 'heavy':amp=0.45;rate=4.2;break;case 'shamble':amp=0.38;rate=4.5;break;case 'limp':amp=0.5;rate=4.2;break;default:amp=0.55;rate=5.6;}
  if(moving)z.phase+=dt*rate*Math.min(1.5,Math.max(0.4,z.curSpeed/(z.speed||1)));
  const m=moving?1:0;z.mv=damp(z.mv||0,m,8,dt);const mv=z.mv;
  const sw=Math.sin(z.phase),cw=Math.cos(z.phase);
  const skirt=z.type==='pinam'&&R.legs&&0;
  let aL=amp,aR=amp;if(z.gait==='limp'){aR=amp*0.25;}
  R.legs[0].hip.rotation.x=sw*aL*mv-(z.gait==='twitch'?0.35:0);R.legs[1].hip.rotation.x=-sw*aR*mv-(z.gait==='twitch'?0.35:0);
  R.legs[0].knee.rotation.x=(0.15+Math.max(0,-sw)*aL*1.3)*mv+(z.gait==='twitch'?0.5:0);R.legs[1].knee.rotation.x=(0.15+Math.max(0,sw)*aR*1.3)*mv+(z.gait==='twitch'?0.5:0);
  R.hips.position.y=0.95+Math.abs(cw)*0.045*amp*mv-(z.gait==='twitch'?0.12:0);
  R.hips.rotation.z=z.gait==='limp'?Math.sin(z.phase)*0.12*mv:0;
  let lean=z.leanBase+(z.gait==='run'?0.15*mv:0)-z.flinch*1.2-(z.stagger>0?0.3:0);
  let armX=-1.3,elX=-0.15,headX=0,jaw=0.08+Math.max(0,Math.sin(T*2+z.phase))*0.1;
  if(z.type==='odi'){armX=-sw*1.0*mv-0.3;elX=-1.3;}
  else if(z.type==='thadiyan'){armX=sw*0.35*mv-0.15;elX=-0.4;}
  else if(z.type==='kaalan'){armX=-0.25+Math.sin(T*9+z.phase)*0.15;elX=-0.6;headX=-0.2;if(Math.random()<dt*3)z.twitch=0.15;}
  else{armX=-1.25+Math.sin(z.phase*0.5)*0.12;}
  if(z.twitch>0){z.twitch-=dt;R.head.rotation.y=Math.sin(T*60)*0.4;R.head.rotation.z=Math.sin(T*47)*0.3;}else{R.head.rotation.y=damp(R.head.rotation.y,0,8,dt);R.head.rotation.z=z.headTilt;}
  if(atkPhase>=0){const w=0.6;if(atkPhase<w){const k=atkPhase/w;armX=lerp(armX,-2.5,easeOut(k));lean-=0.25*k;jaw=0.5*k;}else{const k=(atkPhase-w)/(1-w);armX=lerp(-2.5,-0.7,easeOut(k*1.5));lean+=0.55*Math.sin(k*Math.PI);headX=0.4*Math.sin(k*Math.PI);jaw=0.6;}}
  R.torso.rotation.x=damp(R.torso.rotation.x,lean,12,dt);R.torso.rotation.z=Math.sin(z.phase)*0.06*mv;R.torso.rotation.y=z.hitT>0?z.twistDir*0.45*(z.hitT/0.25):damp(R.torso.rotation.y,0,10,dt);
  R.arms[0].sh.rotation.x=damp(R.arms[0].sh.rotation.x,armX+(z.type==='odi'?0:Math.sin(T*1.3+z.phase)*0.05),14,dt);R.arms[1].sh.rotation.x=damp(R.arms[1].sh.rotation.x,(z.type==='odi'?sw*1.0*mv-0.3:armX-0.06),14,dt);
  R.arms[0].el.rotation.x=elX;R.arms[1].el.rotation.x=elX;R.arms[0].sh.rotation.z=-0.08;R.arms[1].sh.rotation.z=0.08;
  R.head.rotation.x=damp(R.head.rotation.x,headX+(z.flinch>0?-0.5:0),14,dt);
  if(R.jaw)R.jaw.rotation.x=jaw;
  z.mesh.position.y=0;
}
let fewLeft=false;
function updateInfected(dt){
  const alive=zombies.filter(z=>!z.dead).length;fewLeft=spawnQueue.length===0&&alive<=4;
  for(const z of zombies){
    if(z.boss){updateBoss(z,dt);continue;}
    if(z.dead){updateDeath(z,dt);continue;}
    if(z.flinch>0)z.flinch-=dt;if(z.stagger>0)z.stagger-=dt;if(z.atkCd>0)z.atkCd-=dt;if(z.hitT>0)z.hitT-=dt;
    const dx=P.x-z.x,dz=P.z-z.z,dist=Math.hypot(dx,dz);const pos={x:z.x,z:z.z};
    z.losT-=dt;if(z.losT<=0){z.losT=0.2+Math.random()*0.15;z.los=dist<2.5||clearLine(z.x,z.z,P.x,P.z);}
    // perception
    if(z.state==='wander'){z.st+=dt;if((dist<17&&z.los)||dist<4.5||z.st>28||fewLeft)alert(z);}
    else if(z.type==='kaalan'&&z.state!=='chase'){z.st+=dt;if(dist<2.4)alert(z);else if(z.st>(level>=4?22:40)||fewLeft){z.state='stalk';}}
    else if(z.type==='kaalan'&&z.state==='chase'){const quiet=P.crouch>0.5&&Math.hypot(P.vx,P.vz)<3&&dist>5;if(quiet)z.lost+=dt;else z.lost=Math.max(0,z.lost-dt*2);if(z.lost>5&&!fewLeft){z.state='listen';z.st=0;z.lost=0;}}
    // choose target
    let tx=P.x,tz=P.z,spd=z.speed,want=true,toPlayer=true;
    if(z.state==='wander'||z.state==='listen'){toPlayer=false;spd*=z.type==='kaalan'?0.32:0.4;
      if(z.idle>0){z.idle-=dt;want=false;}
      else{if(!z.wander||Math.hypot(z.wander.x-z.x,z.wander.z-z.z)<0.8){if(z.wander){z.idle=rand(1,4);z.wander=null;want=false;}else{for(let k=0;k<20;k++){const wx=z.x+rand(-7,7),wz=z.z+rand(-7,7);if(reachable(wx,wz)){z.wander={x:wx,z:wz};break;}}if(!z.wander){z.idle=1;want=false;}}}
        if(z.wander){tx=z.wander.x;tz=z.wander.z;}}}
    else if(z.state==='investigate'){toPlayer=false;spd*=0.75;tx=z.noisePt.x;tz=z.noisePt.z;if(Math.hypot(tx-z.x,tz-z.z)<1.2){want=false;z.st+=dt;if(z.st>3){z.state='listen';z.st=0;}}}
    else if(z.state==='stalk'){spd*=0.5;}
    if(z.type==='kaalan'&&z.state==='chase'){spd*=(Math.sin(T*5+z.phase)>-0.3?1:0.35);}
    if(z.flinch>0)spd*=0.45;
    // attack
    const reach=z.r+0.5+0.3*z.s;
    if(z.atk>=0){z.atk+=dt;want=false;const dur=z.wind+0.35;const hitT=z.wind;
      if(!z.hitDone&&z.atk>=hitT){z.hitDone=true;if(dist<reach+0.55&&P.y<1.7)hurtPlayer(z.dmg,z);}
      if(z.atk>=dur){z.atk=-1;z.atkCd=z.cd;}}
    else if((z.state==='chase'||z.state==='stalk')&&dist<reach&&z.atkCd<=0&&z.stagger<=0){z.atk=0;z.hitDone=false;if(z.type==='kaalan')SFX.kaalan('attack',pos);else SFX.zAttack(pos,ZT[z.type].pitch);}
    if(z.stagger>0)want=false;
    // move
    let moving=false;z.curSpeed=0;
    if(want){
      if(toPlayer&&!z.los){const n=navTarget(z.x,z.z);if(n){tx=n.x;tz=n.z;}}
      else if(!toPlayer&&!clearLine(z.x,z.z,tx,tz)){/* simple wander: skip pathing, pick a new point */const n=navTarget(z.x,z.z);if(z.state==='investigate'&&n){}}
      let mx=tx-z.x,mz=tz-z.z;const ml=Math.hypot(mx,mz);
      if(ml>0.05&&!(toPlayer&&dist<reach*0.85)){mx/=ml;mz/=ml;z.x+=mx*spd*dt;z.z+=mz*spd*dt;moving=true;z.curSpeed=spd;
        z.face+=angDiff(Math.atan2(mx,mz),z.face)*Math.min(1,dt*(z.type==='odi'?10:6));}
    }
    if(toPlayer&&(dist<reach*1.4||z.atk>=0))z.face+=angDiff(Math.atan2(dx,dz),z.face)*Math.min(1,dt*10);
    z.x+=z.kx*dt;z.z+=z.kz*dt;const dmp=Math.pow(0.004,dt);z.kx*=dmp;z.kz*=dmp;
    collide(z,z.r,0);
    const px=z.x-P.x,pz=z.z-P.z,pd=Math.hypot(px,pz),minD=z.r+0.4;if(pd<minD&&pd>0.001&&P.y<1){z.x=P.x+px/pd*minD;z.z=P.z+pz/pd*minD;}
    // anti-stuck
    if(moving&&toPlayer){z.chkT=(z.chkT||0)+dt;if(z.chkT>3){const mvd=Math.hypot(z.x-(z.cx??z.x),z.z-(z.cz??z.z));if(z.cx!==undefined&&mvd<0.6&&dist>reach+1)z.stuckN=(z.stuckN||0)+1;else z.stuckN=0;z.cx=z.x;z.cz=z.z;z.chkT=0;
      if(z.stuckN>=2&&dist>14){const p=spawnPoint(16,40);z.x=p.x;z.z=p.z;z.stuckN=0;z.cx=undefined;}}}
    z.mesh.position.set(z.x,0,z.z);z.mesh.rotation.y=z.face;
    animRig(z,dt,moving,z.atk>=0?Math.min(1,z.atk/(z.wind+0.35)):-1);
    // voices
    z.groan-=dt;
    if(z.type==='kaalan'){z.click-=dt;if(z.click<=0&&dist<40){const k=z.state==='chase'?'hunt':(z.state==='investigate'||z.state==='stalk')?'search':'idle';z.click=k==='hunt'?rand(0.45,0.8):k==='search'?rand(0.8,1.4):rand(1.6,3.0);SFX.kaalan(k,pos);}}
    else if(z.groan<=0){z.groan=rand(4,9);if(dist<30){if(z.type==='odi'&&z.state==='chase')SFX.scream(pos);else if(z.type==='thadiyan')SFX.grunt(pos);else SFX.groan(pos,ZT[z.type].pitch);}}
  }
  // separation
  for(let i=0;i<zombies.length;i++){const a=zombies[i];if(a.dead||a.boss)continue;for(let j=i+1;j<zombies.length;j++){const b=zombies[j];if(b.dead)continue;const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),m=a.r+b.r;if(d<m&&d>0.001){const p=(m-d)/2,ux=dx/d,uz=dz/d;const wa=b.boss?2:1,wb=b.boss?0:1;a.x-=ux*p*wa;a.z-=uz*p*wa;b.x+=ux*p*wb;b.z+=uz*p*wb;}}}
  for(const z of zombies)if(!z.dead&&!z.boss){collide(z,z.r,0);z.mesh.position.x=z.x;z.mesh.position.z=z.z;}
  // corpse cap
  const corpses=zombies.filter(z=>z.dead&&!z.removed&&!z.boss);if(corpses.length>16)corpses[0].deadT=Math.max(corpses[0].deadT,6.5);
  zombies=zombies.filter(z=>!z.removed);
}
function rayZombie(o,d,z){
  const ox=o.x-z.x,oz=o.z-z.z,a=d.x*d.x+d.z*d.z;if(a<1e-8)return null;
  const r=z.r*(z.boss?1.6:1.2),b=2*(ox*d.x+oz*d.z),c=ox*ox+oz*oz-r*r,disc=b*b-4*a*c;if(disc<0)return null;
  const sq=Math.sqrt(disc);const y0=z.boss?z.mesh.position.y:0;
  for(const t of[(-b-sq)/(2*a),(-b+sq)/(2*a)]){if(t<0)continue;const y=o.y+d.y*t;if(y>=y0&&y<=y0+z.h)return {t,y:y-y0};}
  return null;
}

/* ================= Raatchasan (boss) ================= */
const teleRing=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(CAN.ring),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));teleRing.rotation.x=-Math.PI/2;teleRing.visible=false;scene.add(teleRing);
const teleTarget=teleRing.clone();teleTarget.material=teleRing.material.clone();teleTarget.visible=false;scene.add(teleTarget);
const teleTargets=[teleTarget];for(let i=0;i<2;i++){const t=teleRing.clone();t.material=teleTarget.material;t.visible=false;scene.add(t);teleTargets.push(t);}
// expanding ground shockwave (phase 3 area attack)
const quakeRings=[0,1].map(()=>{const m=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(CAN.ring),color:0xffa060,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return m;});
let shockwaves=[];
function updateShockwaves(dt){
  shockwaves.forEach((s,i)=>{s.r+=13*dt;const m=quakeRings[i%2];m.visible=true;m.position.set(s.x,0.08,s.z);m.scale.set(s.r*2,s.r*2,1);m.material.opacity=Math.max(0,1-s.r/19);
    if(Math.random()<dt*30){const a=rand(0,6.28);puff(s.x+Math.cos(a)*s.r,0.3,s.z+Math.sin(a)*s.r,0x9a8a70,1.4,0.9,0.3,0.5);}
    const d=Math.hypot(P.x-s.x,P.z-s.z);if(!s.hit&&Math.abs(d-s.r)<0.9&&P.y<0.35&&state==='playing'){s.hit=true;hurtPlayer(22,{x:s.x,z:s.z},7);}});
  shockwaves=shockwaves.filter(s=>s.r<19);quakeRings.forEach((m,i)=>{if(i>=shockwaves.length)m.visible=false;});
}
function summonOdi(z,n){for(let i=0;i<n;i++){const a=z.face+Math.PI*0.5+i*(Math.PI*2/n);let x=z.x+Math.cos(a)*5,zz=z.z+Math.sin(a)*5;if(!reachable(x,zz)){const p=spawnPoint(10,22);x=p.x;zz=p.z;}
  const o=newZombie('odi',x,zz);alert(o);for(let k=0;k<5;k++)puff(x+rand(-1,1),0.4,zz+rand(-1,1),0x9a8a70,1.6,1.4,0.5,0.55);burst(x,0.3,zz,0x8a7050,8,4,0.1,0.8);}}
const laneTex=new THREE.CanvasTexture(CAN.lane);laneTex.wrapT=THREE.RepeatWrapping;
const teleLane=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({map:laneTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));teleLane.rotation.order='YXZ';teleLane.visible=false;scene.add(teleLane);
let sporeBombs=[],sporeClouds=[];
function spawnBoss(tier){
  const full=tier==='full';
  // emerge in front of the player, 22-30 m away
  let p=null;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  for(let k=0;k<200&&!p;k++){const a=Math.atan2(fz,fx)+rand(-0.6,0.6),d=rand(22,30);const x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(reachable(x,z)&&clearLine(P.x,P.z,x,z))p={x,z};}
  if(!p)p=spawnPoint(20,40);
  const rig=makeBossRig(tier);rig.g.position.set(p.x,-rig.scale*2,p.z);world.add(rig.g);
  const s=rig.scale;const hp=full?3000:1300;
  const zb={type:'boss',boss:true,tier,rig,mesh:rig.g,x:p.x,z:p.z,face:Math.atan2(P.x-p.x,P.z-p.z),hp,maxHp:hp,speed:full?2.1:2.0,s,r:0.34*s,h:1.95*s,dead:false,deadT:0,removed:false,
    bs:'emerge',st:0,phase:0,slamCd:1.5,chargeCd:4,throwCd:7,dmgWin:0,dmgWinT:0,platesLeft:8,enraged:false,phaseN:1,quakeCd:4,chained:false,quick:false,lastWasCharge:false,stepT:0,chk:0,cx:p.x,cz:p.z,growl:3,mv:0};
  zombies.push(zb);
  SFX.bossIntro(p);P.shake=Math.max(P.shake,0.9);
  $('bossName').textContent='Raatchasan';$('bossSub').textContent=full?'The Big One':'A young one';$('boss').hidden=false;updateBossBar();
  banner('Something is coming up out of the ground','RAATCHASAN',full?'The Big One. Watch the wind-ups.':'A young one. Watch the wind-ups.',4);
  if(!seenTypes.has('boss')){seenTypes.add('boss');setTimeout(()=>{if(state==='playing')showTip(TIPS.boss[0],TIPS.boss[1]);},3600);}
}
function updateBossBar(){const b=zombies.find(z=>z.boss&&!z.dead);if(!b){$('boss').hidden=true;return;}$('boss').hidden=false;$('bossFill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';}
function R0flash(z){z.hitFlash=0.12;}
function hurtBoss(z,dmg,o){
  if(z.bs==='emerge')return false;
  if(z.bs==='stunned')dmg*=1.6;if(o.head)dmg*=0.6;// growths soak head shots; body is the weak spot when it is open
  z.hp-=dmg;z.dmgWin+=dmg;z.dmgWinT=1.2;
  const hy=z.h*rand(0.4,0.8);if(!o.burn){burst(z.x,hy,z.z,0x6a0a0a,10,4,0.1,0.7);burst(z.x,hy,z.z,pick([0xd8c9a3,0xb79d6e,0x8f6b45]),5,4,0.12,0.9);if(o.dir)burst(z.x+o.dir.x*z.r,hy,z.z+o.dir.z*z.r,0x5a0505,8,6,0.08,0.6,{dir:o.dir,spread:0.35});if(Math.random()<0.4)puff(z.x,hy,z.z,0xa8b060,1.2,1.2,0.3,0.4);if(Math.random()<0.3)bloodDecal(z.x+rand(-2,2),z.z+rand(-2,2),rand(1,2));R0flash(z);}
  // armour plates break off at thresholds
  const frac=z.hp/z.maxHp,want=Math.ceil(frac*8);
  while(z.platesLeft>want&&z.platesLeft>0){z.platesLeft--;const pm=z.rig.plates[z.platesLeft];pm.updateMatrixWorld();const wp=new THREE.Vector3();pm.getWorldPosition(wp);pm.visible=false;burst(wp.x,wp.y,wp.z,0xd8c9a3,10,5,0.14,1.2);burst(wp.x,wp.y,wp.z,0x8f6b45,6,4,0.1,1);puff(wp.x,wp.y,wp.z,0xb8b070,1.5,1.5,0.6,0.4);}
  const ph=frac>0.66?1:frac>0.33?2:3;
  if(ph>z.phaseN&&z.hp>0){z.phaseN=ph;SFX.bossPhase({x:z.x,z:z.z},ph);P.shake=Math.max(P.shake,0.7);z.bs='flinch';z.st=0;
    if(ph===2){z.speed*=1.15;toast('Phase 2: faster charges and triple spore bombs');}
    else{z.enraged=true;z.speed*=1.2;z.rig.sacMat.emissiveIntensity=1.2;toast("It's enraged! Jump over the shockwave");summonOdi(z,z.tier==='full'?3:2);}}
  if(z.dmgWin>150&&(z.bs==='walk')){z.bs='flinch';z.st=0;z.dmgWin=0;SFX.bossPain({x:z.x,z:z.z});z.lastPain=T;}
  else if(!o.burn&&dmg>=15&&T-(z.lastPain||0)>1.1){z.lastPain=T;SFX.bossPain({x:z.x,z:z.z});}
  updateBossBar();
  if(z.hp<=0){z.dead=true;z.bs='dying';z.st=0;z.deadT=0;z.fallSide=Math.random()<0.5?-1:1;z.dfx=null;stats.kills++;hideTele();SFX.bossDie({x:z.x,z:z.z});dropPickup('ammo',z.x+2,z.z);dropPickup('med',z.x-2,z.z);dropPickup('ammo',z.x,z.z+2);$('boss').hidden=true;return true;}
  return false;
}
// Boss finale (waves 4 & 5 only: bosses are the only thing that reaches the 'dying' state).
// Extra blood/impact beats timed to the existing death animation: killing blow -> heartbeat spurts while it staggers ->
// knee impact -> head hits the ground -> death twitches. Uses the shared particle/decal pools with a modest budget.
const _dv=new THREE.Vector3(),_dw=new THREE.Vector3();
function bossDeathFX(z,t,dt,pos){
  const R=z.rig,full=z.tier==='full',S=z.s;
  const fx=z.dfx||(z.dfx={spurt:0.15,sac:0,gush:0,twitch:[3.6,4.35,5.15]});
  const once=(k,time)=>{if(!fx[k]&&t>=time){fx[k]=true;return true;}return false;};
  const wp=(o)=>{o.updateMatrixWorld(true);return o.getWorldPosition(_dw);};
  const fx0=Math.sin(z.face),fz0=Math.cos(z.face);
  // 1. killing blow: an exit wound blows out of its back, a spray comes toward you
  if(once('blow',0)){const c=wp(R.torso);const cx=c.x,cy=c.y+0.35*S,cz=c.z;
    burst(cx,cy,cz,0x6a0a0a,full?28:22,full?10:8,0.2,1.1,{dir:_dv.set(-fx0,0.45,-fz0),spread:0.4,stretch:1.6});
    burst(cx,cy,cz,0x8a0c0c,12,6,0.15,0.8,{dir:_dv.set(fx0,0.25,fz0),spread:0.5});
    for(let i=0;i<3;i++)bloodDecal(z.x-fx0*rand(2.5,5.5)+rand(-1,1),z.z-fz0*rand(2.5,5.5)+rand(-1,1),rand(1.6,2.8));
    SFX.zHit(pos);P.shake=Math.max(P.shake,0.55);}
  // 2. heartbeat spurts from the neck while it staggers and drops, weakening with every beat
  if(t<2.3&&t>=fx.spurt){const beat=fx.n=(fx.n||0)+1;fx.spurt+=0.3+beat*0.02;
    const h=wp(R.head);const side=beat%2?1:-1;const pw=Math.max(0.35,1-beat*0.1);
    _dv.set(fx0*0.6+Math.cos(z.face)*0.5*side,0.9,fz0*0.6-Math.sin(z.face)*0.5*side);
    burst(h.x,h.y-0.25*S,h.z,0x6a0a0a,Math.round(9*pw)+2,7*pw+2,0.15,0.9,{dir:_dv,spread:0.25,stretch:1.8});
    if(beat%2)bloodDecal(h.x+_dv.x*2.5*pw,h.z+_dv.z*2.5*pw,rand(0.9,1.6));}
  if(full){
    // Wave 5: the Big One's spore sacs rupture one after another as it roars, then a geyser of blood erupts from its back
    if(t>0.35&&fx.sac<R.sacs.length&&t>=0.35+fx.sac*0.09){const sc=R.sacs[fx.sac++];const p=wp(sc);sc.visible=false;
      burst(p.x,p.y,p.z,0xd8a040,6,5,0.1,0.8);burst(p.x,p.y,p.z,0x6a0a0a,3,4,0.08,0.7);if(fx.sac%3===1)puff(p.x,p.y,p.z,0xa8b060,1.4,1.2,0.4,0.45);
      if(fx.sac===1)SFX.sporeBurst(pos);}
    if(once('geyser',0.95)){const c=wp(R.torso);burst(c.x-fx0*0.3*S,c.y+0.6*S,c.z-fz0*0.3*S,0x6a0a0a,30,11,0.2,1.5,{dir:_dv.set(-fx0*0.25,1,-fz0*0.25),spread:0.35,stretch:1.7});
      SFX.crash(pos);P.shake=Math.max(P.shake,0.6);}
    if(once('rain',1.75))for(let i=0;i<6;i++){const a=rand(0,6.28),r=rand(1.5,5);bloodDecal(z.x+Math.cos(a)*r,z.z+Math.sin(a)*r,rand(1.2,2.4));}
  }else{
    // Wave 4: the young one clutches its gut and it bursts open as it drops to its knees
    if(once('gut',1.7)){const c=wp(R.torso);burst(c.x+fx0*0.35*S,c.y,c.z+fz0*0.35*S,0x6a0a0a,26,7,0.2,1.1,{dir:_dv.set(fx0,0.15,fz0),spread:0.45,stretch:1.4});
      burst(c.x+fx0*0.35*S,c.y,c.z+fz0*0.35*S,0x7f6a52,8,5,0.14,1.1,{dir:_dv.set(fx0,0.3,fz0),spread:0.5});
      bloodDecal(z.x+fx0*2.2,z.z+fz0*2.2,rand(3,4),{pool:true,life:80});SFX.crash(pos);P.shake=Math.max(P.shake,0.5);}
  }
  // 3. knees hit the ground
  if(once('knees',1.95)){SFX.bossStep(pos);P.shake=Math.max(P.shake,0.45);for(let i=0;i<5;i++)puff(z.x+rand(-1.5,1.5),0.3,z.z+rand(-1.5,1.5),0x9a8a70,2,1.4,0.4,0.5);}
  // blood pours from the jaw while it kneels
  if(t>1.4&&t<2.6&&t>=fx.gush+1.4){fx.gush+=0.08;const h=wp(R.jaw);burst(h.x,h.y,h.z,0x5a0505,3,2.5,0.13,0.7,{dir:_dv.set(fx0*0.3,-0.3,fz0*0.3),spread:0.4,stretch:1.5});}
  // 4. the head hits the ground: splash ring where it lands (the existing thud/pool still plays at 3.0)
  if(once('head',3.02)){const h=wp(R.head);burst(h.x,0.4,h.z,0x6a0a0a,full?24:18,7,0.18,1.1,{grav:16});
    for(let i=0;i<(full?7:5);i++){const a=i/(full?7:5)*6.28+rand(-0.3,0.3),r=rand(1.2,2.6)*(full?1.2:1);bloodDecal(h.x+Math.cos(a)*r,h.z+Math.sin(a)*r,rand(1,2));}}
  // 5. a few last death twitches, each with a weak spurt
  if(fx.twitch.length&&t>=fx.twitch[0]){fx.twitch.shift();const j=rand(0.5,0.9);R.arms[0].sh.rotation.x+=j;R.arms[1].sh.rotation.x-=j*0.8;
    const c=wp(R.torso);burst(c.x,c.y+0.2,c.z,0x6a0a0a,6,4,0.09,0.7,{dir:_dv.set(0,1,0),spread:0.6});SFX.zHit(pos);}
}
function hideTele(){teleRing.visible=false;teleLane.visible=false;}
function updateBoss(z,dt){
  const R=z.rig,g=z.mesh,pos={x:z.x,z:z.z};z.st+=dt;
  const dx=P.x-z.x,dz=P.z-z.z,dist=Math.hypot(dx,dz);
  if(z.dmgWinT>0){z.dmgWinT-=dt;if(z.dmgWinT<=0)z.dmgWin=0;}
  ['slamCd','chargeCd','throwCd','quakeCd'].forEach(k=>{if(z[k]>0)z[k]-=dt;});
  const pulse=(f)=>{R.sacMat.emissiveIntensity=(z.enraged?1.2:0.5)+Math.max(0,Math.sin(z.st*f))*2.2;};
  let moving=false,armL=-0.4,armR=-0.5,lean=0.25,jaw=0.15,legsAmp=0.45;
  const faceP=(k)=>{z.face+=angDiff(Math.atan2(dx,dz),z.face)*Math.min(1,dt*k);};
  const reach=z.r+2.2;
  if(z.bs==='dying'){
    const t=z.st;g.position.y=0;
    if(t<1.2){lean=-0.3-Math.sin(t*6)*0.1;armL=-2.6;armR=-2.4;jaw=0.7;if(Math.random()<dt*10)burst(z.x,z.h*0.6,z.z,0xd8c9a3,3,3,0.1,0.8);}
    else if(t<2.2){const k=easeOut((t-1.2)/0.8);R.hips.position.y=0.95-0.5*k;R.legs[0].knee.rotation.x=1.8*k;R.legs[1].knee.rotation.x=1.8*k;R.legs[0].hip.rotation.x=-1.3*k;R.legs[1].hip.rotation.x=-1.3*k;lean=0.3;armL=z.tier==='full'?-0.6:-1.25;armR=z.tier==='full'?-0.6:-1.1;jaw=0.5;}
    else{const k=easeOut((t-2.2)/0.9);if(z.tier==='full')g.rotation.x=1.35*k;else{g.rotation.x=0.3*k;g.rotation.z=(z.fallSide||1)*1.45*k;}lean=0.5;armL=-2.8;armR=-2.6;jaw=0.2;
      if(!z.thud&&t>3.0){z.thud=true;SFX.slam(pos);bloodDecal(z.x+Math.sin(z.face)*3,z.z+Math.cos(z.face)*3,7,{pool:true,life:90});for(let i=0;i<4;i++)bloodDecal(z.x+rand(-4,4),z.z+rand(-4,4),rand(2,3.5));burst(z.x,2,z.z,0x6a0a0a,30,7,0.12,1.4);sporeClouds.push({x:z.x,z:z.z,r:4,t:3,e:0});P.shake=Math.max(P.shake,1);for(let i=0;i<14;i++)puff(z.x+rand(-3,3),0.6,z.z+rand(-3,3),0xb89870,3,rand(2,3.5),0.6,0.5);for(let i=0;i<8;i++)puff(z.x+rand(-2,2),1.5,z.z+rand(-2,2),0xa8b060,2.5,3,0.8,0.4);burst(z.x,1,z.z,0xd8c9a3,20,6,0.15,1.4);}}
    bossDeathFX(z,t,dt,pos);
    R.sacMat.emissiveIntensity=Math.max(0,0.8-t*0.2);
    if(t>6)g.position.y=-(t-6)*0.4;
    if(t>10&&!z.removed){z.removed=true;world.remove(g);R.meshes.forEach(m=>m.geometry.dispose());}
    R.torso.rotation.x=damp(R.torso.rotation.x,lean,6,dt);R.arms[1].sh.rotation.x=damp(R.arms[1].sh.rotation.x,armL,6,dt);R.arms[0].sh.rotation.x=damp(R.arms[0].sh.rotation.x,armR,6,dt);R.jaw.rotation.x=jaw;
    bossLight.intensity=0;return;
  }
  switch(z.bs){
    case 'emerge':{const k=ease(z.st/3.2);g.position.y=-z.s*2*(1-k);P.shake=Math.max(P.shake,0.35);armL=-2.8;armR=-2.6;jaw=0.8;lean=-0.2;
      if(Math.random()<dt*14){puff(z.x+rand(-2.5,2.5),0.4,z.z+rand(-2.5,2.5),(level>=3?0xb89060:0x9a8a70),2.5,rand(2,3),0.7,0.55);burst(z.x+rand(-2,2),0.3,z.z+rand(-2,2),0x8a7050,3,5,0.12,1);}
      faceP(2);if(z.st>=3.2){z.bs='walk';z.st=0;g.position.y=0;}break;}
    case 'walk':{
      // decide attacks
      if(dist<reach&&z.slamCd<=0){z.bs='windSlam';z.st=0;SFX.bossCue('slam',pos);break;}
      if(z.phaseN>=3&&z.quakeCd<=0&&dist<17){z.bs='windQuake';z.st=0;SFX.bossCue('quake',pos);break;}
      if(dist>8&&dist<26&&z.chargeCd<=0&&clearLine(z.x,z.z,P.x,P.z)){z.bs='windCharge';z.st=0;SFX.bossCue('charge',pos);break;}
      if(z.tier==='full'&&dist>9&&dist<34&&z.throwCd<=0){z.bs='windThrow';z.st=0;SFX.bossCue('throw',pos);break;}
      let tx=P.x,tz=P.z;if(!clearLine(z.x,z.z,P.x,P.z)){const n=navTarget(z.x,z.z);if(n){tx=n.x;tz=n.z;}}
      let mx=tx-z.x,mz=tz-z.z;const ml=Math.hypot(mx,mz)||1;
      if(dist>reach*0.8){z.x+=mx/ml*z.speed*dt;z.z+=mz/ml*z.speed*dt;moving=true;z.face+=angDiff(Math.atan2(mx,mz),z.face)*Math.min(1,dt*3);}else faceP(4);
      z.growl-=dt;if(z.growl<=0){z.growl=rand(3.5,6.5);SFX.bossGrowl(pos);}
      // anti-stuck: if no progress while far, relocate
      z.chk+=dt;if(z.chk>4){const mvd=Math.hypot(z.x-z.cx,z.z-z.cz);if(mvd<1&&dist>20){const p=spawnPoint(18,30);z.x=p.x;z.z=p.z;}z.cx=z.x;z.cz=z.z;z.chk=0;}
      break;}
    case 'flinch':{lean=-0.45;armL=-1.8;armR=-1.6;jaw=0.6;if(z.st>0.6){z.bs='walk';z.st=0;}break;}
    case 'windSlam':{const W2=z.phaseN>=3?0.7:z.phaseN>=2?0.8:0.9;faceP(5);const k=z.st/W2;armL=lerp(-0.4,-3.0,easeOut(k));armR=lerp(-0.5,-2.9,easeOut(k));lean=-0.25*k;jaw=0.5*k;pulse(18);
      const cx=z.x+Math.sin(z.face)*2.0,cz=z.z+Math.cos(z.face)*2.0;teleRing.visible=true;teleRing.position.set(cx,0.06,cz);const rr=3.4;teleRing.scale.set(rr*2,rr*2,1);teleRing.material.opacity=0.35+0.6*k;
      if(z.st>=W2){z.bs='slam';z.st=0;z.slamC={x:cx,z:cz};}break;}
    case 'slam':{armL=-0.6;armR=-0.7;lean=0.6;jaw=0.7;
      if(!z.slammed){z.slammed=true;teleRing.visible=false;SFX.slam(pos);const d=Math.hypot(P.x-z.slamC.x,P.z-z.slamC.z);P.shake=Math.max(P.shake,d<10?0.9:0.4);
        if(d<3.4&&P.grounded){hurtPlayer(z.tier==='full'?34:26,z,8);}
        for(let i=0;i<14;i++){const a=i/14*6.28;puff(z.slamC.x+Math.cos(a)*2,0.4,z.slamC.z+Math.sin(a)*2,0x9a8a70,2,1.5,0.4,0.55);}burst(z.slamC.x,0.3,z.slamC.z,0x7a6a50,16,6,0.12,1);}
      if(z.st>0.7){z.bs='walk';z.st=0;z.slammed=false;z.slamCd=z.enraged?1.6:2.4;}break;}
    case 'windCharge':{const W2=z.quick?0.75:z.phaseN>=3?0.9:z.phaseN>=2?1.05:1.2;pulse(14);lean=0.5;armL=-0.2;armR=-0.3;jaw=0.6;
      if(z.st<W2-0.25){faceP(6);}
      z.chDir={x:Math.sin(z.face),z:Math.cos(z.face)};
      teleLane.visible=true;const len=24;teleLane.position.set(z.x+z.chDir.x*len/2,0.07,z.z+z.chDir.z*len/2);teleLane.rotation.set(-Math.PI/2,z.face+Math.PI,0);teleLane.scale.set(2.8,len,1);laneTex.repeat.set(1,len/4);laneTex.offset.y=-z.st*2;teleLane.material.opacity=0.5+0.5*(z.st/W2);
      if(Math.random()<dt*8)puff(z.x-z.chDir.x*1.5,0.4,z.z-z.chDir.z*1.5,0x9a8a70,1.5,1.2,0.3,0.5);
      if(z.st>=W2){z.bs='charge';z.st=0;teleLane.visible=false;z.chHit=false;z.chStart={x:z.x,z:z.z};SFX.roar(pos,false);}break;}
    case 'charge':{const sp=z.phaseN>=3?15.5:z.phaseN>=2?14:13;lean=0.7;armL=-1.0;armR=-1.1;jaw=0.7;moving=true;legsAmp=1.0;
      const ox=z.x,oz=z.z;z.x+=z.chDir.x*sp*dt;z.z+=z.chDir.z*sp*dt;collide(z,z.r,0);
      const moved=Math.hypot(z.x-ox,z.z-oz);if(Math.random()<dt*20)puff(z.x,0.4,z.z,0x9a8a70,1.5,1,0.3,0.45);
      if(!z.chHit&&Math.hypot(P.x-z.x,P.z-z.z)<z.r+0.9&&P.y<1.8){z.chHit=true;hurtPlayer(z.tier==='full'?38:28,z,15);}
      if(moved<sp*dt*0.4&&z.st>0.15){z.bs='stunned';z.st=0;SFX.crash(pos);P.shake=Math.max(P.shake,0.7);burst(z.x+z.chDir.x,1.5,z.z+z.chDir.z,0x8a8478,18,6,0.15,1.2);toast('It hit a wall. Open it up!');}
      else if(z.st>2.0||Math.hypot(z.x-z.chStart.x,z.z-z.chStart.z)>26||z.chHit){z.bs='recover';z.st=0;z.lastWasCharge=true;}
      break;}
    case 'stunned':{lean=0.9+Math.sin(z.st*3)*0.1;armL=-0.2;armR=-0.1;jaw=0.4;R.sacMat.emissiveIntensity=0.15;if(Math.random()<dt*3)burst(z.x,z.h*0.9,z.z,0xffe080,2,1.5,0.05,0.6,{add:true});
      if(z.st>(z.phaseN>=3?1.8:2.4)){z.bs='walk';z.st=0;z.chained=false;z.quick=false;z.lastWasCharge=false;z.chargeCd=z.phaseN>=3?3.5:z.phaseN>=2?5:6;}break;}
    case 'recover':{lean=0.35;const rec=z.phaseN>=3?0.45:z.phaseN>=2?0.6:0.8;
      if(z.st>rec){if(z.lastWasCharge&&z.phaseN>=2&&!z.chained&&dist>6){z.chained=true;z.quick=true;z.lastWasCharge=false;z.bs='windCharge';z.st=0;SFX.bossCue('charge',pos);}
        else{if(z.lastWasCharge)z.chargeCd=z.phaseN>=3?3.5:z.phaseN>=2?5:6;z.bs='walk';z.st=0;z.chained=false;z.quick=false;z.lastWasCharge=false;}}break;}
    case 'windQuake':{const W2=1.1;faceP(3);pulse(20);const k=z.st/W2;armL=lerp(-0.4,-3.1,easeOut(k));armR=armL;lean=-0.35*k;jaw=0.7;
      teleRing.visible=true;teleRing.position.set(z.x,0.06,z.z);const rr=1.5+z.st*2.2+Math.sin(z.st*22)*0.25;teleRing.scale.set(rr*2,rr*2,1);teleRing.material.opacity=0.5+0.5*k;
      if(Math.random()<dt*12)burst(z.x+rand(-2,2),0.2,z.z+rand(-2,2),0x8a7050,2,3,0.1,0.6);
      if(z.st>=W2){z.bs='quake';z.st=0;teleRing.visible=false;shockwaves.push({x:z.x,z:z.z,r:1.5,hit:false});SFX.slam(pos);P.shake=Math.max(P.shake,0.8);z.quakeCd=7;
        for(let i=0;i<16;i++){const a=i/16*6.28;puff(z.x+Math.cos(a)*2.5,0.4,z.z+Math.sin(a)*2.5,0x9a8a70,2,1.6,0.4,0.55);}}break;}
    case 'quake':{armL=-0.5;armR=-0.6;lean=0.65;jaw=0.6;if(z.st>0.55){z.bs='walk';z.st=0;}break;}
    case 'windThrow':{const W2=z.enraged?0.8:1.05;faceP(6);pulse(16);armL=lerp(-0.4,-3.0,easeOut(z.st/W2));lean=-0.15;
      if(!z.aim){const lead=1.1;z.aim={x:clamp(P.x+P.vx*lead*0.6,arena.x0+2,arena.x1-2),z:clamp(P.z+P.vz*lead*0.6,arena.z0+2,arena.z1-2)};}
      if(!z.aims){const ax=z.aim.x-z.x,az=z.aim.z-z.z,al=Math.hypot(ax,az)||1,px=-az/al,pz=ax/al;z.aims=[z.aim];if(z.phaseN>=2)for(const o of[-3.4,3.4])z.aims.push({x:clamp(z.aim.x+px*o,arena.x0+2,arena.x1-2),z:clamp(z.aim.z+pz*o,arena.z0+2,arena.z1-2)});}
      z.aims.forEach((a,i)=>{const t=teleTargets[i];t.visible=true;t.position.set(a.x,0.07,a.z);t.scale.set(6.8,6.8,1);});teleTarget.material.opacity=0.4+0.4*Math.sin(z.st*14);
      if(z.st>=W2){const hand=new THREE.Vector3();R.arms[1].el.getWorldPosition(hand);
        z.aims.forEach((a,i)=>{const m=new THREE.Mesh(G.fungus,new THREE.MeshStandardMaterial({color:0xc8b060,emissive:0x8a8a20,emissiveIntensity:0.8}));m.scale.setScalar(0.7);m.position.copy(hand);scene.add(m);
          sporeBombs.push({m,from:hand.clone(),to:new THREE.Vector3(a.x,0.2,a.z),t:-i*0.12,T:1.15});});
        SFX.sporeThrow(pos);z.aim=null;z.aims=null;z.bs='recover';z.st=0.2;z.throwCd=z.phaseN>=3?5:z.phaseN>=2?7:9;}break;}
  }
  if(z.bs!=='windSlam'&&z.bs!=='slam'&&z.bs!=='windQuake')teleRing.visible=false;
  if(z.bs!=='windCharge')teleLane.visible=false;
  if(z.bs!=='windThrow'&&!sporeBombs.length)teleTargets.forEach(t=>t.visible=false);
  if(['walk','recover','flinch','emerge'].includes(z.bs))R.sacMat.emissiveIntensity=damp(R.sacMat.emissiveIntensity,z.enraged?1.2:0.5,4,dt);
  // footsteps
  if(moving){z.phase+=dt*(z.bs==='charge'?9:3.6);const sw=Math.sin(z.phase);if(Math.sign(sw)!==z.lastSign){z.lastSign=Math.sign(sw);SFX.bossStep(pos);const d=Math.hypot(P.x-z.x,P.z-z.z);if(d<18)P.shake=Math.max(P.shake,0.3*(1-d/18)+0.05);puff(z.x+rand(-1,1),0.3,z.z+rand(-1,1),0x9a8a70,1.2,1,0.3,0.4);}}
  z.mv=damp(z.mv,moving?1:0,6,dt);const sw=Math.sin(z.phase);
  R.legs[0].hip.rotation.x=sw*legsAmp*z.mv;R.legs[1].hip.rotation.x=-sw*legsAmp*z.mv;R.legs[0].knee.rotation.x=(0.2+Math.max(0,-sw)*0.6)*z.mv;R.legs[1].knee.rotation.x=(0.2+Math.max(0,sw)*0.6)*z.mv;
  R.hips.position.y=0.95+Math.abs(Math.cos(z.phase))*0.05*z.mv;R.hips.rotation.z=Math.sin(z.phase)*0.08*z.mv;
  R.torso.rotation.x=damp(R.torso.rotation.x,lean,8,dt);R.torso.rotation.z=Math.sin(z.phase)*0.08*z.mv;
  R.arms[1].sh.rotation.x=damp(R.arms[1].sh.rotation.x,armL+(z.bs==='walk'?sw*0.3*z.mv:0),10,dt);R.arms[0].sh.rotation.x=damp(R.arms[0].sh.rotation.x,armR-(z.bs==='walk'?sw*0.3*z.mv:0),10,dt);
  R.arms[0].el.rotation.x=-0.4;R.arms[1].el.rotation.x=-0.3;R.jaw.rotation.x=jaw;
  if(z.bs!=='emerge')g.position.y=0;
  g.position.x=z.x;g.position.z=z.z;g.rotation.y=z.face;
  // keep the player out of its body
  const px=P.x-z.x,pz=P.z-z.z,pd=Math.hypot(px,pz),minD=z.r+0.5;if(pd<minD&&pd>0.001&&P.y<1.6){P.x=z.x+px/pd*minD;P.z=z.z+pz/pd*minD;}
  if(z.hitFlash>0){z.hitFlash-=dt;R.sacMat.emissiveIntensity=Math.max(R.sacMat.emissiveIntensity,2.2);}
  bossLight.position.set(z.x,z.h*0.55,z.z+0.5);bossLight.intensity=R.sacMat.emissiveIntensity*1.2;
}
function updateSpores(dt){
  updateShockwaves(dt);
  for(const b of sporeBombs){b.t+=dt;const u=clamp(b.t/b.T,0,1);b.m.position.lerpVectors(b.from,b.to,u);b.m.position.y+=Math.sin(u*Math.PI)*6;b.m.rotation.x+=dt*6;
    if(Math.random()<dt*20)puff(b.m.position.x,b.m.position.y,b.m.position.z,0xa8b060,0.6,0.8,0,0.5);
    if(u>=1){b.done=true;scene.remove(b.m);b.m.material.dispose();if(sporeBombs.filter(x=>!x.done).length===0)teleTargets.forEach(t=>t.visible=false);SFX.sporeBurst(b.to);sporeClouds.push({x:b.to.x,z:b.to.z,r:3.4,t:5.5,e:0});
      for(let i=0;i<12;i++)puff(b.to.x+rand(-2,2),rand(0.3,1.2),b.to.z+rand(-2,2),pick([0xa8b060,0xc8c070,0x8a9a50]),2.4,rand(2,3),0.2,0.55);burst(b.to.x,0.5,b.to.z,0xc8c070,14,4,0.08,0.8);}}
  sporeBombs=sporeBombs.filter(b=>!b.done);
  let inCloud=false;
  for(const c of sporeClouds){c.t-=dt;c.e-=dt;if(c.e<=0){c.e=0.25;puff(c.x+rand(-c.r,c.r)*0.7,rand(0.3,1.4),c.z+rand(-c.r,c.r)*0.7,pick([0xa8b060,0x8a9a50]),2.2,2,0.15,0.45);}
    if(Math.hypot(P.x-c.x,P.z-c.z)<c.r&&state==='playing'){inCloud=true;P.sporeDmg=(P.sporeDmg||0)+dt*9;if(P.sporeDmg>=3){hurtPlayer(3,null,0,true);P.sporeDmg=0;}}}
  sporeClouds=sporeClouds.filter(c=>c.t>0);
  P.inSpore=damp(P.inSpore||0,inCloud?1:0,4,dt);
  if(inCloud&&Math.random()<dt*0.8)SFX.cough();
}
