const {open}=require('./t2.js');
(async()=>{const {browser,page,errors}=await open();
const r=await page.evaluate(()=>{__cd.forceFallback();document.getElementById('startBtn').click();const P=__cd.P;__cd.startLevel(4,false);__cd.setPlaying();__cd.hold();__cd.sim(0.3);__cd.zombies.length=0;__cd.spawnQueue.length=0;
 __cd.spawnFromQueue('boss');const b=__cd.zombies.find(z=>z.boss);__cd.sim(3.5,()=>{P.hp=100});b.phaseN=3;b.quakeCd=0;b.bs='walk';b.slamCd=99;b.chargeCd=99;b.throwCd=99;P.x=b.x+8;P.z=b.z;P.hp=100;const log=[];let jumped=false;
 for(let k=0;k<80;k++){const L=__cd.shockwavesList(),s=L[L.length-1];if(s&&!jumped&&s.r>8-3.2){__cd.keys.Space=true;jumped=true;}__cd.sim(0.033);__cd.keys.Space=false;if(s||P.hp<100)log.push([k,b.bs,s?s.r.toFixed(2):'-',Math.hypot(P.x-b.x,P.z-b.z).toFixed(2),P.y.toFixed(2),P.hp]);}
 return log;});
console.log(r.map(x=>x.join(' ')).join('\n'));await browser.close();})();
