/* ================= audio (synthesised, spatial) ================= */
let AC=null,master=null,noiseBuf=null,muted=false,windNode=null,windGain=null,crackleGain=null,echoIn=null,menuAmb=null;
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=0.55*(typeof SETTINGS!=='undefined'?SETTINGS.vol/100:0.8);
    const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master.connect(comp);comp.connect(AC.destination);
    noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    // ambient wind bed
    windNode=AC.createBufferSource();windNode.buffer=noiseBuf;windNode.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=380;windGain=AC.createGain();windGain.gain.value=0.05;windNode.connect(f);f.connect(windGain);windGain.connect(master);windNode.start();
    const cr=AC.createBufferSource();cr.buffer=noiseBuf;cr.loop=true;cr.playbackRate.value=0.7;const cf=AC.createBiquadFilter();cf.type='bandpass';cf.frequency.value=1400;cf.Q.value=0.6;const lfo=AC.createOscillator(),lg=AC.createGain();lfo.type='square';lfo.frequency.value=13;lg.gain.value=0.5;crackleGain=AC.createGain();crackleGain.gain.value=0;const trem=AC.createGain();trem.gain.value=0.5;lfo.connect(lg);lg.connect(trem.gain);cr.connect(cf);cf.connect(trem);trem.connect(crackleGain);crackleGain.connect(master);cr.start();lfo.start();
    // shared echo send (boss roars, distant screams): short slapback off the buildings
    echoIn=AC.createGain();echoIn.gain.value=0.5;const dl=AC.createDelay(1.0);dl.delayTime.value=0.27;const fb=AC.createGain();fb.gain.value=0.38;const ef=AC.createBiquadFilter();ef.type='lowpass';ef.frequency.value=1100;echoIn.connect(dl);dl.connect(ef);ef.connect(fb);fb.connect(dl);ef.connect(master);
  }catch(e){AC=null;}
}
// out: {gain,pan} node chain for spatial sounds
function outNode(t,vol,pos,echo){
  const g=AC.createGain();g.gain.value=vol;let last=g;
  if(pos&&AC.createStereoPanner){const p=AC.createStereoPanner();const dx=pos.x-P.x,dz=pos.z-P.z,dl=Math.hypot(dx,dz)||1;p.pan.value=clamp((dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw))/dl*0.85,-0.85,0.85);g.connect(p);last=p;}
  last.connect(master);if(echo&&echoIn)last.connect(echoIn);return g;
}
function distVol(pos,range){if(!pos)return 1;const d=Math.hypot(pos.x-P.x,pos.z-P.z);return Math.max(0,1-d/range)**1.4;}
function sNoise(dur,type,f0,vol,q,f1,o){
  if(!AC||muted)return;o=o||{};const v=vol*(o.pos?distVol(o.pos,o.range||40):1);if(v<0.004)return;
  const t=AC.currentTime+(o.delay||0);const s=AC.createBufferSource();s.buffer=noiseBuf;s.playbackRate.value=o.rate||1;
  const f=AC.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q||1;
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.attack||0.004));g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
  s.connect(f);f.connect(g);g.connect(outNode(t,1,o.pos,o.echo));s.start(t,Math.random()*1.5);s.stop(t+dur+0.05);
}
function sTone(type,f0,f1,dur,vol,o){
  if(!AC||muted)return;o=o||{};const v=vol*(o.pos?distVol(o.pos,o.range||40):1);if(v<0.004)return;
  const t=AC.currentTime+(o.delay||0);const osc=AC.createOscillator();osc.type=type;osc.frequency.setValueAtTime(f0,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.attack||0.01));g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
  let node=osc;if(o.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;osc.connect(f);node=f;}
  if(o.bp){const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=o.bp;f.Q.value=o.q||4;node.connect(f);node=f;}
  if(o.trem){const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=o.trem;lg.gain.value=v*0.6;lfo.connect(lg);lg.connect(g.gain);lfo.start(t);lfo.stop(t+dur+0.05);}
  node.connect(g);g.connect(outNode(t,1,o.pos,o.echo));osc.start(t);osc.stop(t+dur+0.05);
}
let kBudget=0,kBudgetT=0;
const SFX={
  // firearms: pistol = sharp crack, rifle = deep boom with tail
  pistol(){sNoise(0.07,'highpass',1800,0.9,0.7);sNoise(0.24,'lowpass',2200,0.8,0.8,300);sTone('square',2400,700,0.025,0.25);sTone('sine',160,45,0.12,0.45);},
  rifle(){const r=rand(0.92,1.08);sNoise(0.05,'bandpass',2800*r,0.7,1.2);sNoise(0.32,'lowpass',1400*r,0.9,0.7,180);sTone('sine',85*r,30,0.22,0.6);sNoise(0.6,'lowpass',500,0.12,0.5,120,{delay:0.06});},
  empty(){sTone('square',1700,1500,0.025,0.12);sNoise(0.02,'highpass',3000,0.12);},
  // melee
  knifeSwish(){sNoise(0.13,'bandpass',3600,0.4,2.5,1300);},
  knifeHit(){sNoise(0.12,'lowpass',900,0.55,1,300);sTone('sine',320,110,0.1,0.35);sNoise(0.05,'highpass',4000,0.15,1,0,{delay:0.01});},
  stickWhoosh(){sNoise(0.28,'bandpass',700,0.45,1.8,260);},
  aruvalWhoosh(){sNoise(0.34,'bandpass',950,0.55,2.2,320);sNoise(0.18,'highpass',3200,0.12,1,0,{delay:0.06});},
  aruvalHit(){sNoise(0.05,'highpass',2600,0.5,1);sTone('sine',95,38,0.32,0.85);sNoise(0.2,'bandpass',620,0.6,3);sTone('triangle',1850,1620,0.32,0.06,{delay:0.01});},
  aruvalBreak(){sTone('square',2400,900,0.12,0.12);sNoise(0.16,'highpass',4200,0.32,1);sTone('triangle',1300,700,0.3,0.08,{delay:0.03});},
  meleeResist(){sTone('sine',150,70,0.16,0.5);sNoise(0.12,'lowpass',520,0.5,1);sNoise(0.06,'bandpass',2400,0.18,3,0,{delay:0.02});},
  stickHit(){sTone('sine',115,48,0.22,0.75);sNoise(0.09,'bandpass',1150,0.6,8);sTone('triangle',420,240,0.08,0.3);},
  throwRock(){sNoise(0.18,'bandpass',900,0.3,2.5,300);sTone('sawtooth',190,130,0.12,0.12,{lp:500});},
  rockHit(pos){sNoise(0.05,'highpass',2600,0.5,1,0,{pos});sTone('sine',150,60,0.16,0.5,{pos});},
  rockGround(pos){sNoise(0.06,'bandpass',1800,0.35,3,0,{pos,range:30});sTone('triangle',600,350,0.05,0.15,{pos,range:30});},
  // reloads & handling
  pMagOut(){sTone('square',1900,1400,0.02,0.12);sNoise(0.04,'bandpass',2500,0.15,4);},
  pMagIn(){sTone('square',1200,900,0.03,0.16);sNoise(0.05,'bandpass',1800,0.25,4);},
  pSlide(){sNoise(0.09,'bandpass',2800,0.3,3,1600);sTone('square',2200,1800,0.02,0.12,{delay:0.08});},
  rMagOut(){sNoise(0.08,'bandpass',1100,0.3,3);sTone('square',800,600,0.03,0.12);},
  rMagIn(){sNoise(0.06,'bandpass',1500,0.4,4);sTone('square',1000,700,0.04,0.2);sNoise(0.08,'lowpass',500,0.3,1,0,{delay:0.03});},
  rCharge(){sNoise(0.12,'bandpass',2400,0.3,3,1200);sTone('square',1800,1500,0.03,0.14,{delay:0.11});},
  equipGun(){sNoise(0.08,'bandpass',1200,0.18,2);sTone('square',1500,1200,0.02,0.08,{delay:0.06});},
  equipSoft(){sNoise(0.12,'bandpass',600,0.15,1.5);},
  scopeIn(){sNoise(0.1,'bandpass',1800,0.1,4,900);},
  shell(pos){sTone('sine',rand(3800,4600),3200,0.06,0.05,{pos,range:12});},
  // player
  hurt(){sTone('sawtooth',110,55,0.25,0.3,{lp:700});sNoise(0.2,'lowpass',500,0.35);},
  step(soft){sNoise(soft?0.05:0.08,'lowpass',soft?220:level===4?500:340,soft?0.06:0.12,0.7);},
  land(){sNoise(0.14,'lowpass',300,0.35);sTone('sine',90,45,0.12,0.25);},
  jump(){sNoise(0.08,'lowpass',400,0.12);},
  pickup(){sTone('sine',660,990,0.12,0.22);},
  heart(){sTone('sine',62,40,0.18,0.35);sTone('sine',58,38,0.16,0.25,{delay:0.22});},
  cough(){sNoise(0.18,'bandpass',700,0.35,2);sNoise(0.14,'bandpass',600,0.3,2,0,{delay:0.25});},
  // infected
  groan(pos,pitch){const p=(pitch||1)*rand(0.85,1.15);sTone('sawtooth',(95+Math.random()*30)*p,58*p,rand(0.8,1.3),0.3,{pos,range:30,lp:520,bp:600*p,q:3});},
  scream(pos){sTone('sawtooth',420,780,0.6,0.35,{pos,range:45,bp:1400,q:2});sNoise(0.5,'bandpass',1600,0.25,2,0,{pos,range:45});},
  grunt(pos){sTone('sawtooth',70,45,0.5,0.35,{pos,range:30,lp:300});},
  zHit(pos){sNoise(0.08,'lowpass',800,0.25,1,0,{pos,range:25});},
  zAttack(pos,p){sTone('sawtooth',160*(p||1),90*(p||1),0.35,0.3,{pos,range:20,lp:900});},
  clicks(pos){if(!AC)return;const n=irand(4,9);let t=0;for(let i=0;i<n;i++){t+=rand(0.035,0.07);sNoise(0.018,'bandpass',rand(2600,3600),0.55,12,0,{pos,range:28,delay:t});}
    sTone('square',rand(160,220),140,0.25,0.06,{pos,range:28,delay:t*0.5,trem:28,lp:900});},
  shriek(pos){sTone('sawtooth',900,1600,0.5,0.35,{pos,range:50,bp:2200,q:3});sNoise(0.45,'highpass',2500,0.25,1,0,{pos,range:50});for(let i=0;i<6;i++)sNoise(0.02,'bandpass',3200,0.5,10,0,{pos,range:50,delay:0.5+i*0.04});},
  // Kaalan voice set: tongue clicks, throat gurgle, chatter, screech. Capped so a group never spams.
  kClick(pos,delay,pitch){const p=pitch||1;sNoise(0.012,'bandpass',rand(2700,3900)*p,0.6,15,0,{pos,range:34,delay});sTone('sine',560*p,170,0.014,0.2,{pos,range:34,delay});},
  kaalan(kind,pos){
    if(!AC||muted)return;const now=AC.currentTime;if(now-kBudgetT>0.5){kBudgetT=now;kBudget=0;}if(++kBudget>4&&kind!=='alert'&&kind!=='death')return;
    if(kind==='idle'){let t=0;const n=irand(3,6);for(let i=0;i<n;i++){t+=rand(0.07,0.16);SFX.kClick(pos,t,rand(0.9,1.05));}if(Math.random()<0.5)sTone('sawtooth',rand(62,78),50,0.6,0.09,{pos,range:24,lp:280,trem:23,delay:t*0.4});}
    else if(kind==='search'){let t=0;const n=irand(6,10);for(let i=0;i<n;i++){t+=rand(0.035,0.06);SFX.kClick(pos,t,0.9+i*0.03);}sTone('square',rand(170,210),260,0.35,0.06,{pos,range:30,trem:31,lp:1100});sNoise(0.18,'bandpass',1300,0.15,3,0,{pos,range:20,delay:t});}
    else if(kind==='hunt'){let t=0;const n=irand(8,12);for(let i=0;i<n;i++){t+=rand(0.024,0.045);SFX.kClick(pos,t,rand(1.0,1.2));}sTone('sawtooth',115,82,0.45,0.16,{pos,range:36,lp:650,trem:18});}
    else if(kind==='alert'){sTone('sawtooth',880,1500,0.55,0.3,{pos,range:55,bp:2100,q:3,echo:true});sTone('sawtooth',935,1620,0.55,0.22,{pos,range:55,bp:2300,q:3});sNoise(0.45,'highpass',2600,0.22,1,0,{pos,range:55});let t=0.5;for(let i=0;i<8;i++){t+=0.03;SFX.kClick(pos,t,1.25);}}
    else if(kind==='attack'){sTone('sawtooth',1300,560,0.32,0.34,{pos,range:30,bp:1800,q:2.5});sNoise(0.16,'lowpass',750,0.45,1,0,{pos,range:30,delay:0.22});for(let i=0;i<4;i++)SFX.kClick(pos,0.02+i*0.025,1.3);}
    else if(kind==='death'){sTone('sawtooth',170,38,1.3,0.22,{pos,range:30,lp:420,trem:12});for(let i=0;i<3;i++)SFX.kClick(pos,0.5+i*0.35,1-i*0.15);}
  },
  // raatchasan
  bossIntro(pos){sTone('sine',95,24,3.2,0.9,{pos,range:200});sTone('sawtooth',58,36,3.0,0.55,{pos,range:200,lp:380,trem:6,echo:true});sTone('sawtooth',88,52,2.6,0.4,{pos,range:200,lp:520,trem:9,echo:true});
    sTone('sawtooth',480,340,1.4,0.12,{pos,range:200,bp:900,q:6,delay:0.4});sNoise(2.6,'lowpass',260,0.55,1,70,{pos,range:200});sNoise(1.2,'lowpass',900,0.4,1,120,{pos,range:200,delay:1.8});},
  bossGrowl(pos){const k=rand(0.85,1.1);sTone('sawtooth',52*k,40*k,rand(0.9,1.4),0.3,{pos,range:60,lp:260,trem:rand(14,22)});sNoise(0.8,'lowpass',180,0.25,1,0,{pos,range:50});},
  bossCue(kind,pos){
    if(kind==='slam'){sTone('sawtooth',48,92,0.85,0.5,{pos,range:80,lp:340,trem:14});sNoise(0.85,'lowpass',140,0.6,1,260,{pos,range:80});}
    else if(kind==='charge'){sTone('sawtooth',70,120,1.0,0.55,{pos,range:100,lp:520,trem:8,echo:true});sNoise(0.6,'bandpass',600,0.45,1.5,200,{pos,range:80,delay:0.3});sNoise(0.3,'highpass',1800,0.2,1,0,{pos,range:60,delay:0.75});}
    else if(kind==='throw'){sNoise(0.7,'bandpass',420,0.5,3,180,{pos,range:70});sTone('sine',260,90,0.5,0.3,{pos,range:70,delay:0.2});sNoise(0.15,'lowpass',500,0.4,1,0,{pos,range:70,delay:0.85});}
    else if(kind==='quake'){sTone('sine',40,70,1.1,0.8,{pos,range:120});sTone('sawtooth',55,110,1.1,0.4,{pos,range:120,lp:420,trem:20,echo:true});sNoise(1.1,'lowpass',120,0.7,1,320,{pos,range:120});}
  },
  bossPhase(pos,ph){if(ph===2){sTone('sawtooth',80,50,2.0,0.55,{pos,range:150,lp:600,trem:10,echo:true});sTone('sawtooth',160,95,1.6,0.25,{pos,range:150,bp:500,q:3});}
    else{sTone('sawtooth',95,40,2.6,0.65,{pos,range:180,lp:700,trem:16,echo:true});sTone('sawtooth',620,300,1.4,0.18,{pos,range:180,bp:1400,q:4,echo:true});sNoise(2,'lowpass',400,0.5,1,90,{pos,range:180});}},
  roar(pos,big){const k=big?1:0.8;sTone('sawtooth',62*k,38*k,2.4,0.55,{pos,range:120,lp:420,trem:7});sTone('sawtooth',95*k,55*k,2.2,0.35,{pos,range:120,lp:600,trem:9});sNoise(2.0,'lowpass',380,0.45,1,110,{pos,range:120});},
  bossStep(pos){sTone('sine',58,26,0.35,0.9,{pos,range:60});sNoise(0.25,'lowpass',160,0.5,1,0,{pos,range:60});},
  slam(pos){sTone('sine',50,22,0.7,1,{pos,range:80});sNoise(0.6,'lowpass',500,0.9,1,90,{pos,range:80});},
  windup(pos){sTone('sawtooth',55,80,0.9,0.4,{pos,range:70,lp:300,trem:12});},
  sporeThrow(pos){sNoise(0.3,'bandpass',500,0.4,2,200,{pos,range:60});sTone('sine',220,90,0.25,0.25,{pos,range:60});},
  sporeBurst(pos){sNoise(1.2,'lowpass',900,0.55,1,200,{pos,range:50});sNoise(0.3,'bandpass',300,0.4,2,0,{pos,range:50});},
  crash(pos){sNoise(0.5,'lowpass',1200,0.9,1,150,{pos,range:80});sTone('sine',70,30,0.4,0.8,{pos,range:80});sNoise(0.2,'highpass',2500,0.4,1,0,{pos,range:80,delay:0.05});},
  bossPain(pos){const k=rand(0.85,1.2);sTone('sawtooth',95*k,58*k,0.7,0.45,{pos,range:80,lp:520,trem:14});sNoise(0.3,'bandpass',300,0.3,2,0,{pos,range:60});},
  bossDie(pos){sTone('sawtooth',80,25,4,0.6,{pos,range:150,lp:450,trem:5,echo:true});sTone('sawtooth',140,40,3.2,0.25,{pos,range:150,bp:420,q:3});sNoise(3,'lowpass',300,0.4,1,60,{pos,range:150});sNoise(1.6,'bandpass',260,0.3,4,0,{pos,range:80,delay:3.2});},
  // throwables
  glass(pos){for(let i=0;i<6;i++)sNoise(0.06,'highpass',rand(3500,6000),0.35,1,0,{pos,range:50,delay:i*0.025});sTone('triangle',2600,1800,0.15,0.15,{pos,range:50});},
  whoosh(pos){sNoise(0.8,'lowpass',300,0.6,1,2400,{pos,range:50,attack:0.08});sNoise(0.5,'bandpass',900,0.3,1,0,{pos,range:50,delay:0.1});},
  boom(pos){sTone('sine',70,22,1.2,1,{pos,range:140});sNoise(1.4,'lowpass',900,1,1,80,{pos,range:140});sNoise(0.12,'highpass',1500,0.7,1,0,{pos,range:140});sNoise(0.6,'bandpass',300,0.5,1,0,{pos,range:140,delay:0.15});},
  fuse(){sNoise(0.45,'highpass',4000,0.18,1);},
  fuseTick(){sNoise(0.03,'highpass',5000,0.06,1);},
  // world
  spark(x,z){const pos={x,z};sNoise(0.25,'highpass',3000,0.35,1,0,{pos,range:30});for(let i=0;i<5;i++)sNoise(0.02,'highpass',4500,0.3,1,0,{pos,range:30,delay:i*0.05+rand(0,0.04)});},
  wave(){sTone('sawtooth',55,52,1.6,0.22,{lp:300});sTone('sawtooth',82,78,1.6,0.14,{delay:0.05,lp:300});},
  clear(){sTone('triangle',440,440,0.25,0.2);sTone('triangle',660,660,0.4,0.2,{delay:0.18});},
};
