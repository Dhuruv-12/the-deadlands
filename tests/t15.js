// deterministic boss charge + chained charge + audio cue check on open ground
const {open}=require('./t2.js');
(async()=>{const {browser,page,errors}=await open();
const r=await page.evaluate(()=>{__cd.forceFallback();const P=__cd.P;__cd.startLevel(4,false);__cd.setPlaying();__cd.hold();__cd.sim(0.2);__cd.zombies.length=0;__cd.spawnQueue.length=0;
 const S=__cd.SFX,calls=[];const o=S.bossCue;S.bossCue=function(k,p){calls.push(k);return o.call(this,k,p);};
 const out={};
 for(const ph of [1,2]){P.x=0;P.z=40;P.y=0;P.yaw=Math.PI;__cd.spawnFromQueue('boss');const b=__cd.zombies.find(z=>z.boss&&!z.dead);__cd.sim(3.6,()=>{P.hp=100;});
  b.x=0;b.z=20;b.phaseN=ph;b.bs='walk';b.st=0;b.chargeCd=0;b.slamCd=99;b.throwCd=99;b.quakeCd=99;P.x=0;P.z=40;
  let charges=0,prev='',clear=__cd.rayWorld(b.x,1,b.z,0,0,1,30);
  for(let k=0;k<120;k++){__cd.sim(0.05,()=>{P.hp=100;});if(b.bs==='charge'&&prev!=='charge'){charges++;P.x+=Math.cos(b.face)*6;P.z-=Math.sin(b.face)*6;}prev=b.bs;}
  out['phase'+ph]={charges,lineClear:clear};b.dead=true;b.removed=true;b.mesh.visible=false;__cd.sim(0.1);}
 out.cues=[...new Set(calls)];return out;});
console.log(JSON.stringify(r));console.log(errors.join('\n')||'no errors');await browser.close();})();
