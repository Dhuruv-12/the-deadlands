/* ================= HUD ================= */
const ICONS={
  knife:'<svg viewBox="0 0 24 24"><path d="M3 21l7-7 2 2-7 7zM11 13L20 3c1 3 0 7-6 12z"/></svg>',
  pistol:'<svg viewBox="0 0 24 24"><path d="M2 7h18v4H11l-1 2H8l-1 7H3l2-9H2z"/></svg>',
  rifle:'<svg viewBox="0 0 24 24"><path d="M1 10h4l1-2h11v-2h2v2h4v2h-9v2h-3l-1 5H8l1-5H5l-1 2H1z"/></svg>',
  stick:'<svg viewBox="0 0 24 24"><path d="M4 21l-1-1L18 4l3-1-1 3z"/></svg>',
  rock:'<svg viewBox="0 0 24 24"><path d="M6 9l5-4 7 2 3 6-3 6-8 1-6-4z"/></svg>',
  molotov:'<svg viewBox="0 0 24 24"><path d="M10 9h4v2l2 3v8H8v-8l2-3zM11 4h2v4h-2z"/><path d="M12 0c2 2 2 3 0 4-2-1-2-2 0-4z" fill="#ff9a30"/></svg>',
  urundai:'<svg viewBox="0 0 24 24"><circle cx="11" cy="14" r="7"/><path d="M13 7l3-4h2l-3 5z"/><circle cx="19" cy="3" r="2" fill="#ffd060"/></svg>',
  aruval:'<svg viewBox="0 0 24 24"><path d="M3 21l-1-1 4.5-4.5 1.5 1.5zM8 16.5L9.5 18C14 16 19 11 20.5 6c.8-2.6-.4-4.5-2.2-4.5.6 2.4-.6 5.6-3 8.6z"/></svg>',
};
const slotsEl=$('slots');
ORDER.forEach(k=>{const d=document.createElement('div');d.className='slot';d.id='slot-'+k;slotsEl.appendChild(d);});
let toastT=0,bannerT=0,heartT=0;
function toast(msg){const t=$('toast');t.textContent=msg;t.style.opacity=1;toastT=2.2;}
function banner(e,t,s,dur){$('bnE').textContent=e;$('bnT').textContent=t;$('bnS').textContent=s;$('banner').style.opacity=1;bannerT=dur||3.5;}
const crossEls=$('cross').children;
function updateHUD(dt){
  $('hWave').textContent=`Wave ${level+1} / 5`;
  const left=spawnQueue.length+zombies.filter(z=>!z.dead).length;
  $('hLeft').textContent=`${left} infected left`;
  $('hStance').hidden=P.crouch<0.5;
  $('hHp').textContent=Math.ceil(P.hp);$('hpFill').style.width=P.hp+'%';$('stFill').style.width=P.stam+'%';
  const w=W[cur];$('hWeap').textContent=w.name;
  const am=$('hAmmo');let html;
  if(w.mag){const a=inv[cur];html=`${a.mag} <small>/ ${a.res}</small>`;am.classList.toggle('low',a.mag<=Math.ceil(w.mag*0.25));}
  else if(THROW_KEY[cur]){const n=inv[THROW_KEY[cur]];html=`${n} <small>left</small>`;am.classList.toggle('low',n<=1);}
  else if(cur==='stick'){html=`${inv.stick} <small>hits left</small>`;am.classList.toggle('low',inv.stick<=2);}
  else if(cur==='aruval'){html=`${inv.aruval} <small>${inv.aruval===1?'strike':'strikes'} left</small>`;am.classList.toggle('low',inv.aruval<=1);}
  else{html='∞';am.classList.remove('low');}
  if(am._h!==html){am.innerHTML=html;am._h=html;}
  for(const k of ORDER){const e=$('slot-'+k);let sub='';if(k==='pistol'||k==='rifle')sub=inv[k].mag+inv[k].res;else if(k==='stick')sub=inv.stick?inv.stick+' hits':'none';else if(k==='aruval')sub=inv.aruval?inv.aruval+' left':'none';else if(THROW_KEY[k])sub='×'+inv[THROW_KEY[k]];else sub='∞';
    const h=`<span class="ic">${ICONS[k]}</span><b>${W[k].slot}</b>${k==='rifle'?'Rifle':k==='urundai'?'Urundai':W[k].name}<b>${sub}</b>`;if(e._h!==h){e.innerHTML=h;e._h=h;}
    e.classList.toggle('on',k===cur);e.classList.toggle('off',!has(k)||((k==='pistol'||k==='rifle')&&inv[k].mag+inv[k].res===0));}
  $('reloadHint').hidden=!reloading();
  if(hitT>0){hitT-=dt;if(hitT<=0)$('hitmark').style.opacity=0;}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0;}
  if(bannerT>0){bannerT-=dt;if(bannerT<=0)$('banner').style.opacity=0;}
  if(tipT>0){tipT-=dt;if(tipT<=0)$('tip').style.opacity=0;}
  if(vignetteT>0)vignetteT-=dt;$('vignette').style.opacity=Math.max(0,vignetteT*1.6);
  $('lowhp').style.opacity=P.hp<35?(0.5+Math.sin(performance.now()/180)*0.3):0;
  if(P.hp<35){heartT-=dt;if(heartT<=0){heartT=P.hp<18?0.7:1.0;SFX.heart();}}
  $('sporefx').style.opacity=P.inSpore;
  // crosshair: hip spread, tiny dot for pistol ADS, hidden in the rifle scope
  const scopeK=cur==='rifle'?clamp((P.aim-0.78)/0.2,0,1):0;$('scope').style.opacity=scopeK;
  if(scopeK>0){const j=kickR*30;$('scope').style.transform=`translate(${rand(-j,j)}px,${j}px)`;}
  const cr=$('cross');cr.style.opacity=cur==='rifle'?Math.max(0,1-P.aim*2):1;
  const sp=(10+Math.min(16,Math.hypot(P.vx,P.vz)*1.5+kickR*40+(P.grounded?0:8)))*(1-P.aim*0.75);
  crossEls[0].style.left=(sp-4)+'px';crossEls[1].style.left=(-sp-4)+'px';crossEls[2].style.top=(sp-4)+'px';crossEls[3].style.top=(-sp-4)+'px';
  const ads=cur==='pistol'&&P.aim>0.6;for(let i=0;i<4;i++)crossEls[i].hidden=ads||W[cur].melee&&false;crossEls[4].hidden=!ads;
  updateDmgArcs(dt);
}

/* ================= game flow ================= */
let titleMode=true,levelReady=true,playQueued=false;
let state='menu',level=0,spawnQueue=[],spawnT=0,graceT=0,invAtStart=null,stats=null,totals=null,fallbackLook=false,everLocked=false,pendingPlay=false;
let packAng=0,campAnchor=null,campT=0;
function flank(){
  toast('They are flanking you. Keep moving!');const base=rand(0,6.28);let n=0;
  for(let k=0;k<3;k++){let type=null;const i=spawnQueue.indexOf('odi');if(i>=0)type=spawnQueue.splice(i,1)[0];else if(spawnQueue.length&&spawnQueue[0]!=='boss')type=spawnQueue.shift();else if(k<2)type='odi';
    if(!type)continue;const p=spawnPoint(13,22,base+k*2.09);const z=newZombie(type,p.x,p.z);alert(z);n++;}
}
function newStats(){return {kills:0,shots:0,hits:0,heads:0,time:0};}
function buildLevel(i){
  level=i;
  for(const z of zombies){if(z.rig)z.rig.meshes.forEach(m=>m.geometry.dispose());}
  clearThrowables();shockwaves=[];zombies.forEach(z=>{if(z.flame)freeFlame(z.flame);});
  clearWorld();clearEmitters();clearDecals();zombies=[];pickups=[];rocksInAir.forEach(r=>scene.remove(r.m));rocksInAir=[];water=null;foam=null;
  sporeBombs.forEach(b=>scene.remove(b.m));sporeBombs=[];sporeClouds=[];hideTele();teleTarget.visible=false;bossLight.intensity=0;
  SMOKE.forEach(p=>{p.life=0;p.s.visible=false;});PARTS.forEach(p=>{p.life=0;p.m.visible=false;});SHELLS.forEach(s=>{s.life=0;s.m.visible=false;});
  const L2=LEVELS[i];const st=L2.build();flushInst();buildNav();
  P.x=st.start[0];P.z=st.start[1];P.y=0;P.vy=0;P.grounded=true;P.yaw=st.yaw;P.pitch=0;P.vx=P.vz=0;P.recoilP=P.recoilY=0;P.aim=0;P.crouchOn=false;P.crouch=0;P.inSpore=0;
  updateNav();
  const S=L2.supplies;
  for(const [type,n] of[['rock',S.rock],['stick',S.stick],['ammo',S.ammo],['med',S.med],['molotov',S.molotov||0],['urundai',S.urundai||0]])for(let k=0;k<n;k++){const p=freeSpot(type==='rock'?3:type==='molotov'||type==='urundai'?14:6);dropPickup(type,p.x,p.z,type==='rock'?2+(Math.random()*2|0):1);}
  dropPickup('rock',P.x+2,P.z-3,2);dropPickup('stick',P.x-2,P.z-4);
  // aruvals (waves 4-5): fixed, tucked-away spots; nudged to the nearest reachable ground
  for(const [ax,az] of (L2.aruval||[])){let q=null;for(let r=0;r<6&&!q;r+=0.5)for(let a=0;a<6.28&&!q;a+=0.5){const x=ax+Math.cos(a)*r,z=az+Math.sin(a)*r;if(reachable(x,z))q={x,z};}if(q)dropPickup('aruval',q.x,q.z);}
  for(let k=0;k<10;k++){const p=freeSpot(8);bloodDecal(p.x,p.z,rand(0.8,1.8));}
  const Wv=L2.wave,q=[];
  for(const t of['pinam','odi','thadiyan','kaalan'])for(let k=0;k<Wv[t];k++)q.push(t);
  for(let k=q.length-1;k>0;k--){const j=Math.random()*(k+1)|0;[q[k],q[j]]=[q[j],q[k]];}
  // ramp: first few are always pinam, specials come later
  const firstSpecial=Math.min(5,q.length);for(let k=0;k<firstSpecial;k++){const wi=q.indexOf('pinam',k);if(wi>k){[q[k],q[wi]]=[q[wi],q[k]];}}
  if(Wv.boss)q.splice(Math.floor(q.length*0.5),0,'boss');
  spawnQueue=q;spawnT=0;graceT=4;
  // a few wanderers already in the streets
  const pre=Math.min(4,q.filter(t=>t==='pinam').length);for(let k=0;k<pre;k++){const idx=spawnQueue.indexOf('pinam');spawnQueue.splice(idx,1);const p=spawnPoint(26,60);newZombie('pinam',p.x,p.z,{wander:true});}
  $('hLoc').textContent=L2.name;$('hSub').textContent=L2.sub;$('boss').hidden=true;
  camera.position.set(P.x,1.65,P.z);camera.rotation.set(0,P.yaw,0);camera.fov=BASE_FOV;camera.updateProjectionMatrix();
}
function startLevel(i,keepInv){
  titleMode=false;buildLevel(i);
  if(!keepInv){inv=freshInv();cur='pistol';}
  const SI=LEVELS[i].start;if(SI)for(const k in SI)inv[k]=Math.max(inv[k]||0,SI[k]);
  if(inv.molotov===undefined)inv.molotov=0;if(inv.urundai===undefined)inv.urundai=0;if(inv.aruval===undefined)inv.aruval=0;
  invAtStart=cloneInv(inv);stats=newStats();act=null;qm=null;fireCd=0;equipT=0.35;campAnchor=null;campT=0;
  if(!has(cur))cur='knife';vmShow();
  const L2=LEVELS[i];banner(`Wave ${i+1} of 5`,L2.name,L2.blurb,4.5);SFX.wave();
  if(windGain)windGain.gain.value=i===4?0.12:i===3?0.08:0.05;
}
function showScreen(id){for(const s of['menu','pause','inter','dead','win'])$(s).hidden=(s!==id);$('hud').hidden=!(id===null||id==='pause');}
function setPlaying(){if(!levelReady){playQueued=true;return;}playQueued=false;state='playing';showScreen(null);clock.getDelta();$('fade').classList.remove('on');}
function levelBuilt(){levelReady=true;if(playQueued)setPlaying();}
// Pointer lock asks for raw ("unadjusted") mouse movement. With the default adjusted lock the browser keeps re-centring a
// hidden cursor; fast moves get clipped at the screen edge and the jump back arrives as motion the wrong way, which is what
// made turning stall, jitter or kick backwards. Browsers without raw support fall back to a normal lock.
let rawMouse=false,lockPromises=false,testNoLock=false;
function lockPointer(){
  if(testNoLock)return;                          // automated tests run in drag-to-look mode only
  let r;
  try{r=canvas.requestPointerLock({unadjustedMovement:true});}
  catch(e){try{r=canvas.requestPointerLock();}catch(e2){onLockError();return;}}
  if(!(r&&r.then))return;                        // older browsers: no promise, the pointerlockchange/error events report back
  lockPromises=true;                             // results come from the promise; the browser's error event can arrive late and is ignored
  r.then(()=>{rawMouse=true;}).catch(err=>{
    if(!(err&&err.name==='NotSupportedError'))return onLockError();
    rawMouse=false;let r2;try{r2=canvas.requestPointerLock();}catch(e){return onLockError();}
    if(r2&&r2.catch)r2.catch(()=>onLockError());});
}
function requestPlay(){
  initAudio();
  if(document.pointerLockElement===canvas){setPlaying();return;}
  // in drag-to-look fallback, play now but keep trying for a real lock (it used to never try again)
  if(fallbackLook){setPlaying();lockPointer();return;}
  pendingPlay=true;
  lockPointer();
  setTimeout(()=>{if(pendingPlay&&!everLocked){onLockError();}},700);
}
function onLockError(){
  if(!pendingPlay||document.pointerLockElement===canvas)return;
  if(!everLocked){fallbackLook=true;pendingPlay=false;setPlaying();toast('Mouse lock unavailable. Hold left mouse and drag to look, or use the arrow keys');}
  else{pendingPlay=false;$('pauseNote').hidden=false;}
}
document.addEventListener('pointerlockchange',()=>{
  const locked=document.pointerLockElement===canvas;
  if(locked){everLocked=true;fallbackLook=false;if(pendingPlay){pendingPlay=false;setPlaying();}}
  else if(state==='playing'&&!fallbackLook)pause();
});
document.addEventListener('pointerlockerror',()=>{if(!lockPromises)onLockError();});
function releaseMouse(){if(document.pointerLockElement)document.exitPointerLock();}
function pause(){if(state!=='playing')return;state='paused';triggerDown=false;rightDown=false;$('pauseNote').hidden=true;showScreen('pause');}
function statsHTML(s){const acc=s.shots?Math.round(s.hits/s.shots*100):0;const t=Math.round(s.time);return `<div><b>${s.kills}</b><span>Kills</span></div><div><b>${acc}%</b><span>Accuracy</span></div><div><b>${s.heads}</b><span>Headshots</span></div><div><b>${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}</b><span>Time</span></div>`;}
function addTotals(){for(const k in stats)totals[k]+=stats[k];}
function waveCleared(){
  state='inter';releaseMouse();triggerDown=false;rightDown=false;SFX.clear();addTotals();
  if(level===4){beginEnding();return;}
  const L2=LEVELS[level],N=LEVELS[level+1];
  $('iEyebrow').textContent=`Wave ${level+1} cleared`;$('iTitle').textContent=`${L2.name} is quiet`;$('iStats').innerHTML=statsHTML(stats);
  $('iNext').textContent=N.name;$('iNextDesc').textContent=N.blurb;showScreen('inter');
}
function die(){
  state='dead';releaseMouse();triggerDown=false;rightDown=false;
  $('dEyebrow').textContent=`Wave ${level+1} · ${LEVELS[level].name}`;$('dTitle').textContent=P.inSpore>0.3?'The spores got you':'You got bitten';$('dStats').innerHTML=statsHTML(stats);showScreen('dead');
}
// START CAMPAIGN: fade to black, lock the mouse inside the click (browsers require it), build wave 1 behind the fade, then fade in
$('startBtn').onclick=()=>{initAudio();stopMenuAmbience();totals=newStats();P.hp=100;levelReady=false;$('fade').classList.add('on');requestPlay();
  setTimeout(()=>{titleMode=false;startLevel(0,false);levelBuilt();},460);};
$('howBtn').onclick=()=>openModal('how');
$('settingsBtn').onclick=()=>openModal('settings');
$('pauseSetBtn').onclick=()=>openModal('settings');
$('howBack').onclick=()=>closeModal();$('setBack').onclick=()=>closeModal();
let modalOpen=null;
function openModal(id){modalOpen=id;$(id).hidden=false;const f=$(id).querySelector('button.back');if(f)f.focus();}
function closeModal(){if(!modalOpen)return;$(modalOpen).hidden=true;const back=state==='paused'?'resumeBtn':modalOpen==='how'?'howBtn':'settingsBtn';modalOpen=null;const b=$(back);if(b)b.focus();}
$('resumeBtn').onclick=()=>requestPlay();
$('restartWaveBtn').onclick=()=>{inv=cloneInv(invAtStart);P.hp=Math.max(P.hp,60);startLevel(level,true);requestPlay();};
$('quitBtn').onclick=()=>{state='menu';titleMode=true;buildLevel(0);setupTitleScene();showScreen('menu');setMenuSel(0,false);startMenuAmbience();};
// title menu keyboard navigation: Up/Down move (wrapping), Enter activates, Esc closes How to play / Settings.
// Mouse hover moves the same selection, so only one option is ever highlighted.
const MENU_IDS=['startBtn','howBtn','settingsBtn'];let menuSel=0;
function setMenuSel(i,focus){menuSel=(i+MENU_IDS.length)%MENU_IDS.length;MENU_IDS.forEach((id,k)=>$(id).classList.toggle('sel',k===menuSel));if(focus)$(MENU_IDS[menuSel]).focus({preventScroll:true});}
MENU_IDS.forEach((id,k)=>{$(id).addEventListener('mouseenter',()=>setMenuSel(k,false));$(id).addEventListener('focus',()=>setMenuSel(k,false));});
setMenuSel(0,false);
function menuKeys(e){
  if(state!=='menu'||modalOpen||$('menu').hidden||$('fade').classList.contains('on'))return false;
  if(e.code==='ArrowDown'||e.code==='ArrowUp'){e.preventDefault();setMenuSel(menuSel+(e.code==='ArrowDown'?1:-1),true);return true;}
  if(e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();if(!e.repeat)$(MENU_IDS[menuSel]).click();return true;}
  return false;
}
$('nextBtn').onclick=()=>{P.hp=Math.min(100,P.hp+35);inv.pistol.res+=12;inv.rifle.res+=30;inv.rocks=Math.max(inv.rocks,2);startLevel(level+1,true);requestPlay();};
$('retryBtn').onclick=()=>{inv=cloneInv(invAtStart);P.hp=100;startLevel(level,true);requestPlay();};
$('restartAllBtn').onclick=()=>{totals=newStats();P.hp=100;startLevel(0,false);requestPlay();};
$('againBtn').onclick=()=>{exitEnding();totals=newStats();P.hp=100;startLevel(0,false);requestPlay();};
$('route').innerHTML=LEVELS.map((L2,i)=>`<li><span class="n">${i+1}</span><span class="place"><b>${L2.name}</b><small>${L2.sub}</small></span><span class="cover" aria-label="Cover ${L2.cover} of 5">${[1,2,3,4,5].map(k=>`<i class="${k<=L2.cover?'on':''}" style="height:${6+k*2}px"></i>`).join('')}</span></li>`).join('');
if(matchMedia('(pointer: coarse)').matches&&!matchMedia('(pointer: fine)').matches)$('touchNote').hidden=false;

/* ================= title scene ================= */
// T. Nagar at night: fires and smoke from the existing wrecks, a flickering street lamp, and infected shuffling through the fog
let titleZ=[];
function setupTitleScene(){
  zombies.forEach(z=>{world.remove(z.mesh);z.rig.meshes.forEach(m=>m.geometry.dispose());});zombies=[];titleZ=[];spawnQueue=[];
  for(let i=0;i<8;i++){const z=newZombie('pinam',rand(-6.5,6.5),rand(-26,22),{wander:true});z.speed=rand(0.6,1.0);z.face=0;titleZ.push(z);}
  bossLight.color.set(0xffb070);bossLight.distance=18;pickups.forEach(p=>p.mesh.visible=false);
  // burning wreckage close to the camera path, lit by the two fire lights
  car(-4.6,20,0.35,0,{burnt:true});drum(5.6,27,0x5a3a20);flushInst();
  fireAt(-4.6,1.3,20,1.4);fireAt(5.6,1.0,27,0.7);smokeAt(-4.6,3,20,1.6,3,0x1a1614);
  const fires=emitters.filter(e=>e.type==='fire');fireLights.forEach(l=>l.intensity=0);fires.forEach(e=>e.light=null);fires.slice(-2).forEach((e,i)=>e.light=fireLights[i]);
}
let lampFlick=0;
function updateTitleScene(dt){
  // slow dolly down Ranganathan Street with a little handheld drift
  const k=0.5-0.5*Math.cos(T*0.05);
  camera.position.set(Math.sin(T*0.07)*1.1,1.8+Math.sin(T*0.6)*0.02,44-k*7);
  camera.rotation.set(-0.015+Math.sin(T*0.17)*0.008,Math.sin(T*0.045)*0.1,Math.sin(T*0.11)*0.006);
  if(camera.fov!==BASE_FOV){camera.fov=BASE_FOV;camera.updateProjectionMatrix();}
  P.x=camera.position.x;P.z=camera.position.z;P.yaw=camera.rotation.y;
  // flickering sodium lamp over the street
  lampFlick-=dt;if(lampFlick<=0)lampFlick=Math.random()<0.12?rand(0.04,0.18):rand(0.3,1.6);
  bossLight.position.set(-9.6+1.3,6.1,31.5);bossLight.intensity=lampFlick<0.2&&Math.random()<0.7?rand(0,0.4):rand(2.2,2.6);
  for(const z of titleZ){z.z+=z.speed*dt;if(z.z>34){z.z=rand(-30,-18);z.x=rand(-6.5,6.5);}
    z.mesh.position.set(z.x,0,z.z);z.mesh.rotation.y=0;z.curSpeed=z.speed;animRig(z,dt,true,-1);
    z.groan-=dt;if(z.groan<=0){z.groan=rand(6,14);if(AC&&menuAmb)SFX.groan({x:z.x,z:z.z},1);}}
}
function startMenuAmbience(){
  if(!AC||menuAmb||muted)return;
  const t=AC.currentTime,g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.07*SETTINGS.vol,t+2.5);
  const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=220;const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=0.07;lg.gain.value=90;lfo.connect(lg);lg.connect(f.frequency);
  const oscs=[55,55.6,82.4].map(fr=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(f);o.start(t);return o;});
  f.connect(g);g.connect(master);lfo.start(t);
  const timer=setInterval(()=>{if(state!=='menu'||!titleMode)return;const r=Math.random(),p={x:P.x+rand(-60,60),z:P.z-rand(30,70)};
    if(r<0.35)sTone('sawtooth',rand(420,520),rand(700,820),0.7,0.08,{pos:p,range:120,bp:1400,q:2,echo:true});
    else if(r<0.7)sNoise(0.5,'bandpass',rand(300,600),0.12,6,0,{pos:p,range:120,echo:true});
    else SFX.groan(p,0.8);},rand(5000,8000));
  menuAmb={g,oscs,lfo,timer};if(windGain)windGain.gain.value=0.08;
}
function stopMenuAmbience(){if(!menuAmb||!AC)return;const t=AC.currentTime;menuAmb.g.gain.cancelScheduledValues(t);menuAmb.g.gain.setValueAtTime(menuAmb.g.gain.value,t);menuAmb.g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);
  const m=menuAmb;setTimeout(()=>{m.oscs.forEach(o=>o.stop());m.lfo.stop();},800);clearInterval(m.timer);menuAmb=null;}
// distressed title lettering: worn texture clipped to the text; plain colour if background-clip:text is unsupported
(function(){try{if(!(CSS.supports('-webkit-background-clip','text')||CSS.supports('background-clip','text')))return;
  const c=mkCanvas(512,256),g=c.getContext('2d');g.fillStyle='#e7d9bf';g.fillRect(0,0,512,256);
  for(let i=0;i<4000;i++){const v=200+Math.random()*55|0;g.fillStyle=`rgba(${v},${v-8},${v-24},.6)`;g.fillRect(Math.random()*512,Math.random()*256,2,2);}
  const gr=g.createLinearGradient(0,150,0,256);gr.addColorStop(0,'rgba(120,20,16,0)');gr.addColorStop(1,'rgba(120,20,16,.55)');g.fillStyle=gr;g.fillRect(0,0,512,256);
  g.globalCompositeOperation='destination-out';
  for(let i=0;i<260;i++){g.globalAlpha=rand(0.4,1);g.beginPath();g.ellipse(Math.random()*512,Math.random()*256,rand(0.6,3.5),rand(0.4,2),rand(0,3),0,7);g.fill();}
  for(let i=0;i<26;i++){g.globalAlpha=rand(0.3,0.8);g.lineWidth=rand(0.6,1.8);g.beginPath();let x=Math.random()*512,y=Math.random()*256;g.moveTo(x,y);for(let k=0;k<4;k++){x+=rand(-30,30);y+=rand(-8,8);g.lineTo(x,y);}g.stroke();}
  const el=$('dlTitle');el.style.setProperty('--grunge',`url(${c.toDataURL()})`);el.classList.add('grunge');}catch(e){}})();

/* ================= settings ================= */
const DEFAULTS={sens:1,fov:74,vol:80,quality:'high',invertY:false,bob:true,grain:true};
const SETTINGS=Object.assign({},DEFAULTS);
try{const saved=JSON.parse(localStorage.getItem('deadlands.settings')||'null');if(saved)Object.assign(SETTINGS,saved);}catch(e){}
function saveSettings(){try{localStorage.setItem('deadlands.settings',JSON.stringify(SETTINGS));}catch(e){}}
function applySettings(){
  BASE_FOV=SETTINGS.fov;recalcScope();if(state!=='playing'||P.aim<0.01){camera.fov=BASE_FOV;camera.updateProjectionMatrix();}
  if(master)master.gain.value=0.55*SETTINGS.vol/100;
  const q=SETTINGS.quality,dpr=window.devicePixelRatio||1;
  renderer.setPixelRatio(q==='high'?Math.min(dpr,1.5):q==='medium'?1:0.8);
  const sm=q==='low'?1024:2048;if(sun.shadow.mapSize.x!==sm){sun.shadow.mapSize.set(sm,sm);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  renderer.setSize(innerWidth,innerHeight);
  $('grain').hidden=!SETTINGS.grain;
  $('oSens').textContent=SETTINGS.sens.toFixed(2)+'×';$('oFov').textContent=SETTINGS.fov+'°';$('oVol').textContent=SETTINGS.vol;
}
function syncSettingsUI(){$('sSens').value=SETTINGS.sens;$('sFov').value=SETTINGS.fov;$('sVol').value=SETTINGS.vol;$('sQual').value=SETTINGS.quality;$('sInv').checked=SETTINGS.invertY;$('sBob').checked=SETTINGS.bob;$('sGrain').checked=SETTINGS.grain;}
[['sSens','sens',v=>+v],['sFov','fov',v=>+v],['sVol','vol',v=>+v],['sQual','quality',v=>v]].forEach(([id,k,f])=>{$(id).addEventListener('input',e=>{SETTINGS[k]=f(e.target.value);applySettings();saveSettings();});});
[['sInv','invertY'],['sBob','bob'],['sGrain','grain']].forEach(([id,k])=>{$(id).addEventListener('change',e=>{SETTINGS[k]=e.target.checked;applySettings();saveSettings();});});
$('setReset').onclick=()=>{Object.assign(SETTINGS,DEFAULTS);syncSettingsUI();applySettings();saveSettings();};
syncSettingsUI();applySettings();

/* ================= input ================= */
const keys={};
addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(state!=='playing'){if(menuKeys(e))return;if(endingKey(e))return;if(e.code==='Escape'&&modalOpen){closeModal();return;}if(e.code==='Escape'&&state==='paused'&&fallbackLook)requestPlay();return;}
  if(e.code.startsWith('Digit')){const n=+e.code.slice(5);if(n>=1&&n<=ORDER.length){if(!has(ORDER[n-1])&&n>=5)toast(`No ${W[ORDER[n-1]].name} left`);equip(ORDER[n-1]);}}
  if(e.code==='KeyF')quickMelee();
  if(e.code==='KeyR')startReload();
  if(e.code==='KeyC'){P.crouchOn=!P.crouchOn;}
  if(e.code==='KeyM'){muted=!muted;toast(muted?'Sound off':'Sound on');if(windGain)windGain.gain.value=muted?0:0.06;}
  if(e.code==='KeyQ')cycle(-1);
  if(e.code==='Escape'&&fallbackLook)pause();
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;triggerDown=false;rightDown=false;});
let mouseHeld=false;
canvas.addEventListener('mousedown',e=>{if(state!=='playing')return;initAudio();mouseHeld=true;if(fallbackLook&&document.pointerLockElement!==canvas)lockPointer();if(e.button===0){triggerDown=true;triggerFresh=true;}if(e.button===2)rightDown=true;});
addEventListener('mouseup',e=>{mouseHeld=false;if(e.button===0)triggerDown=false;if(e.button===2)rightDown=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{
  if(state!=='playing')return;
  const locked=document.pointerLockElement===canvas;
  if(!locked&&!(fallbackLook&&mouseHeld))return;
  applyLook(e.movementX,e.movementY);
});
function applyLook(mx,my){
  const s=0.0022*SETTINGS.sens*(camera.fov/BASE_FOV);P.yaw-=mx*s;P.pitch=clamp(P.pitch-my*s*(SETTINGS.invertY?-1:1),-1.45,1.45);
  mouseDX+=mx;mouseDY+=my;
}
addEventListener('wheel',e=>{if(state==='playing')cycle(e.deltaY>0?1:-1);},{passive:true});

/* ================= main loop ================= */
const clock=new THREE.Clock();let T=0,navT=0,lastSprint=false;
function updateWeapons(dt){
  if(fireCd>0)fireCd-=dt;
  if(THROW_KEY[cur]&&!has(cur)&&!act&&equipT<=0)cycle(-1);
  const w=W[cur];
  if(triggerDown&&(w.auto||triggerFresh)){tryFire();triggerFresh=false;}
}
function updateShadowCam(){
  // keep the shadow frustum centred on the player, snapped to texels to avoid shimmer
  const snap=88/2048;const cx=Math.round(P.x/snap)*snap,cz=Math.round(P.z/snap)*snap;
  sun.target.position.set(cx,0,cz);sun.position.set(cx+sunDir.x*120,sunDir.y*120,cz+sunDir.z*120);sun.target.updateMatrixWorld();
  for(const o of skyObjs){o.position.x=o.userData.bx===undefined?(o.userData.bx=o.position.x,o.position.x):o.userData.bx+camera.position.x;o.position.z=o.userData.bz===undefined?(o.userData.bz=o.position.z,o.position.z):o.userData.bz+camera.position.z;}
}
function step(dt){
  T+=dt;
  if(state==='playing'){
    stats.time+=dt;
    const r=updatePlayer(dt);lastSprint=r.sprint;updateWeapons(dt);
    navT-=dt;if(navT<=0){navT=0.3;updateNav();}
    if(graceT>0)graceT-=dt;
    else if(spawnQueue.length){spawnT-=dt;const alive=zombies.filter(z=>!z.dead).length;const Wv=LEVELS[level].wave;
      if(spawnT<=0&&alive<Wv.cap){const n=Math.min(Wv.pack||1,spawnQueue.length,Wv.cap-alive);packAng+=rand(1.7,2.7);for(let k=0;k<n;k++)spawnFromQueue(spawnQueue.shift(),n>1?packAng:undefined);spawnT=Wv.interval*n*rand(0.7,1.3);}}
    // waves 4-5 punish camping: stay in one spot too long and runners flank you
    if(LEVELS[level].wave.camp&&graceT<=0){if(!campAnchor||Math.hypot(P.x-campAnchor.x,P.z-campAnchor.z)>8){campAnchor={x:P.x,z:P.z};campT=0;}else campT+=dt;
      if(campT>13){campT=-5;flank();}}
    updateInfected(dt);updateRocks(dt);updateBombs(dt);updateFires(dt);updateBlasts(dt);updateDecals(dt);updatePickups(dt);updateSpores(dt);updateVM(dt,r.mv,r.sprint);
    if(graceT<=0&&!spawnQueue.length&&!zombies.some(z=>!z.dead)){waveCleared();}
    updateHUD(dt);
  }else if(state==='menu'){
    updateTitleScene(dt);
  }else if(state==='won'){
    updateEnding(dt);
  }
  updateParts(dt);updateShells(dt);updateSmoke(dt);updateEmitters(dt);updateFog(dt,T);
  for(const t of TRACERS)if(t.life>0){t.life-=dt;if(t.life<=0)t.l.visible=false;}
  updateAsh(dt,T);
  if(water){water.position.y=0.05+Math.sin(T*0.8)*0.04;foam.position.x=(foam.userData.bx??22.5)+Math.sin(T*0.8)*0.9;foam.material.opacity=0.45+Math.sin(T*0.8+1)*0.25;}
  updateShadowCam();
}
// adaptive quality: if frames are slow for a few seconds, drop resolution, then shadow resolution
let perfAcc=0,perfN=0,perfLevel=0;
function adaptQuality(raw){
  if(state!=='playing')return;perfAcc+=raw;perfN++;
  if(perfAcc>3){const avg=perfAcc/perfN;perfAcc=0;perfN=0;
    if(avg>0.024&&perfLevel===0&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);perfLevel=1;}
    else if(avg>0.024&&perfLevel<=1){sun.shadow.mapSize.set(1024,1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}perfLevel=2;}}
}
function tick(){
  requestAnimationFrame(tick);
  const raw=clock.getDelta();const dt=Math.min(0.05,raw);adaptQuality(raw);
  step(dt);
  renderer.clear();
  renderer.render(scene,camera);
  if(state==='playing'||state==='paused'){renderer.clearDepth();renderer.render(vmScene,vmCam);}
}
window.__cd={get state(){return state},startLevel,LEVELS,get zombies(){return zombies},P,get inv(){return inv},spawnFromQueue,newZombie,setPlaying,get spawnQueue(){return spawnQueue},waveCleared,buildLevel,
  forceFallback(){fallbackLook=true;testNoLock=true;},sim(sec,fn){for(let t=0;t<sec;t+=0.033){if(fn)fn();step(0.033);}},keys,fire(on){triggerDown=on;triggerFresh=on;},aim(on){rightDown=on;},equip,get stats(){return stats},get cur(){return cur},get act(){return act},
  hold(){graceT=1e9;},rayWorld,rayZombie,get titleMode(){return titleMode},get SETTINGS(){return SETTINGS},get kills(){return stats&&stats.kills},W,arenaX1(){return arena.x1;},arena(){return arena;},get qm(){return qm},get fireZones(){return fireZones},flamesUsed(){return FLAMES.filter(f=>f.used).length},bombsCount(){return bombs.length},sporeBombsCount(){return sporeBombs.length},shockwavesCount(){return shockwaves.length},shockwavesList(){return shockwaves},SFX,pause,requestPlay,die,get solids(){return solids},renderer,camera,get pickups(){return pickups},hurtZombie,startReload,applyLook,stepOnce(dt){step(dt);},get sprintNow(){return lastSprint},get menuSel(){return menuSel},get fallbackLook(){return fallbackLook},get rawMouse(){return rawMouse},get modalOpen(){return modalOpen},partsLive(){return PARTS.filter(p=>p.life>0).length;},decalsLive(){return DECALS.filter(d=>d.m.visible).length;},vmPose(){const V=VM[cur];return V.root.position.toArray().concat([V.root.rotation.x,V.root.rotation.y,V.root.rotation.z]);}};
titleMode=true;buildLevel(0);setupTitleScene();
// the first click or key anywhere on the title screen starts the ambience (browsers block audio before that)
function firstGesture(){initAudio();if(state==='menu'&&titleMode)startMenuAmbience();$('audioHint').hidden=true;removeEventListener('pointerdown',firstGesture);removeEventListener('keydown',firstGesture);}
addEventListener('pointerdown',firstGesture);addEventListener('keydown',firstGesture);
tick();
