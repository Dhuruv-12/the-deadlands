// camera near walls/corners: verification across all maps
const {open}=require('./t2.js');
(async()=>{const {browser,page,errors}=await open();
const r=await page.evaluate(()=>{__cd.forceFallback();document.getElementById('startBtn').click();const P=__cd.P,out={};
 for(let lvl=0;lvl<5;lvl++){__cd.startLevel(lvl,false);__cd.setPlaying();__cd.hold();__cd.sim(0.2);__cd.zombies.length=0;__cd.spawnQueue.length=0;
  const res={};
  // 1) push straight into a tall wall for 1.5s: velocity, bob and steps must stop
  const walls=__cd.solids.filter(s=>s.y1>3&&(s.z1-s.z0)>(lvl===4?2.5:6)&&(s.x1-s.x0)>1.5);
  let worstBob=0,worstV=0,worstSlide=0,worstLat=0,tested=0;
  for(const s of walls){const px=s.x1+0.45,pz=(s.z0+s.z1)/2;const blocked=__cd.solids.some(o=>o!==s&&px+0.6>o.x0&&px-0.6<o.x1&&pz+3>o.z0&&pz-3<o.z1&&o.y1>0.3);if(blocked)continue;
   const A=__cd.arena();if(px>A.x1-1||s.z0<A.z0+1||s.z1>A.z1-1)continue;tested++;
   P.x=px;P.z=pz;P.y=0;P.vx=P.vz=0;P.yaw=Math.PI/2;// forward = -x, into the wall
   __cd.keys.KeyW=true;__cd.sim(0.4);const ys=[];for(let i=0;i<30;i++){__cd.sim(0.033);ys.push(__cd.camera.position.y);}__cd.keys.KeyW=false;
   worstBob=Math.max(worstBob,Math.max(...ys)-Math.min(...ys));worstV=Math.max(worstV,Math.abs(P.vx));
   // 2) slide along it diagonally (W into wall + D along it): lateral camera jitter
   P.x=px;P.z=s.z0+0.6;P.vx=P.vz=0;P.yaw=Math.PI/2+0.6;__cd.keys.KeyW=true;__cd.sim(0.3);let prev=__cd.camera.position.x,lat=0,z0=P.z;for(let i=0;i<40;i++){__cd.sim(0.033);const cx=__cd.camera.position.x;lat=Math.max(lat,Math.abs(cx-prev));prev=cx;}__cd.keys.KeyW=false;
   worstLat=Math.max(worstLat,lat);worstSlide=Math.max(worstSlide,Math.abs(P.z-z0));if(tested>=6)break;}
  // 3) concave corner: arena corner, push diagonally into it
  const A=__cd.arena();P.x=A.x0+1.5;P.z=A.z0+1.5;P.vx=P.vz=0;P.yaw=Math.PI/4;__cd.keys.KeyW=true;__cd.sim(0.6);const cs=[];for(let i=0;i<30;i++){__cd.sim(0.033);cs.push(__cd.camera.position.clone());}__cd.keys.KeyW=false;
  let cj=0;for(let i=1;i<cs.length;i++)cj=Math.max(cj,cs[i].distanceTo(cs[i-1]));
  out['map'+(lvl+1)+'corner']={camMovePerFrame:+cj.toFixed(4)};
  out['map'+(lvl+1)]={walls:tested,bobWhilePinned:+worstBob.toFixed(4),velIntoWall:+worstV.toFixed(3),lateralJitter:+worstLat.toFixed(4),slidDist:+worstSlide.toFixed(2)};}
 return out;});
console.log(JSON.stringify(r,null,1));console.log(errors.join('\n')||'no errors');await browser.close();})();
