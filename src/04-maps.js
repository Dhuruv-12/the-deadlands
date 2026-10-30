/* ================= levels ================= */
const LEVELS=[
 {key:'tnagar',name:'T. Nagar',sub:'Ranganathan Street',cover:5,blurb:'Packed market lanes, a temple courtyard, a park and a parking lot. Plenty of cover, plenty of corners.',
  wave:{pinam:18,odi:0,thadiyan:0,kaalan:0,boss:0,interval:1.5,cap:10,speed:1.0},supplies:{rock:12,stick:5,ammo:4,med:3},build:buildTNagar},
 {key:'central',name:'Chennai Central',sub:'Platform yard',cover:4,blurb:'Pillars, derailed coaches and a dark goods shed. Runners join the horde, and the first Kaalan clicks somewhere in the yard.',
  wave:{pinam:18,odi:7,thadiyan:0,kaalan:2,boss:0,interval:1.25,cap:14,speed:1.05},supplies:{rock:12,stick:5,ammo:4,med:3},build:buildCentral},
 {key:'omr',name:'OMR',sub:'IT Corridor, Sholinganallur',cover:3,blurb:'A huge open junction, tech-park campuses and a construction site. Cover is spread out. Thadiyans appear.',
  wave:{pinam:22,odi:10,thadiyan:2,kaalan:3,boss:0,interval:1.05,cap:17,speed:1.1},supplies:{rock:12,stick:4,ammo:5,med:3},build:buildOMR},
 {key:'marina',name:'Marina Beach',sub:'Open sand',cover:2,blurb:'Open sand, a fishing hamlet and a row of dead kiosks. Bigger packs from every side, more Kaalans, and something large is buried in the beach.',
  wave:{pinam:30,odi:18,thadiyan:6,kaalan:7,boss:1,bossTier:'mini',interval:0.75,cap:25,speed:1.2,pack:2,wander:0.2,camp:true},supplies:{rock:12,stick:3,ammo:4,med:2,urundai:1},aruval:[[-6.2,23.6],[-20,-57]],build:buildMarina},
 {key:'mamallapuram',name:'Mamallapuram Ruins',sub:'Shore Temple coast',cover:1,blurb:'Ancient stone, sand and sea. The biggest horde yet hunts you through the ruins, and the Raatchasan waits by the Shore Temple. Molotovs and Urundai bombs are your best friends here.',
  wave:{pinam:34,odi:24,thadiyan:8,kaalan:10,boss:1,bossTier:'full',interval:0.6,cap:30,speed:1.28,pack:3,wander:0.1,camp:true},supplies:{rock:10,stick:3,ammo:4,med:2,molotov:3,urundai:1},start:{molotov:2,urundai:1},aruval:[[44,-23],[-21.5,-35.5]],build:buildMamallapuram},
];

function buildTNagar(){
  atmosphere({fog:0x4a3022,near:12,far:95,exposure:1.3,skyTop:0x1b100c,skyHorizon:0xb0582a,hemiSky:0xffc8a0,hemiGround:0x3a281e,hemiI:0.75,sun:0xffa060,sunI:1.6,sunDir:[-0.6,0.5,-0.55],sunDisc:0xff7a3a,sunSize:10,ash:0xb0a69c,groundFog:0x7a5a48,groundFogAmt:0.14});
  arena={x0:-30,x1:42,z0:-48,z1:48};
  ground(240,240,'asphalt',0x6a6662,0,0,30);
  texStrip(0,0,16,130,'asphalt',0x55524f);texStrip(9,0,2,130,'concrete',0xa8a094);texStrip(-9,0,2,130,'concrete',0xa8a094);
  texStrip(6,-4,72,12,'asphalt',0x55524f,0.009);texStrip(-27,0,6,110,'concrete',0x8a8478);
  roadMarks(0,-60,60,[0],'z');zebra(0,-11.6,14,'x');zebra(0,3.6,14,'x');
  for(let i=0;i<10;i++)pothole(rand(-6,6),rand(-44,44),rand(0.6,1.4));
  // west side
  cityBlock(-24,-10,-60,-31,{face:'x+'});cityBlock(-24,-10,-27,-10,{face:'x+'});cityBlock(-24,-10,29,60,{face:'x+'});
  cityBlock(-42,-30,-60,60,{face:'x+',h:[8,15]});
  // east side
  cityBlock(10,22,-60,-24,{face:'x-'});cityBlock(10,22,-24,-10,{face:'x-'});cityBlock(22,54,-60,-36,{face:'z+',h:[10,16]});
  cityBlock(10,16,2,24,{face:'x-',lot:[5.5,8]});cityBlock(10,54,29,60,{face:'z-'});cityBlock(42,56,-36,29,{face:'x-',h:[9,14]});
  cityBlock(-10,10,-62,-50,{face:'z+'});cityBlock(-10,10,50,62,{face:'z-'});
  // park (Panagal-style) with broken railings
  texStrip(-17,13,14,22,'grass',0x8a9a6a,0.011);
  for(const [x,z] of[[-20,6],[-13,8],[-21,19],[-12,20],[-17,13.5]])tree(x,z,rand(0.9,1.15));
  box(-16.5,13,2.2,2.2,1.4,0xbcb2a0);deco(-16.5,2.3,13,0.7,1.8,0.6,0x6f6a62,{cast:true});deco(-16.5,3.4,13,0.45,0.45,0.45,0x6f6a62,{geo:G.sphere,cast:true});
  bench(-20,13,'z');bench(-13,13,'z');bench(-17,4,'x');
  for(const [a,b] of[[2.3,6],[10,15],[19,23.7]]){box(-10.3,(a+b)/2,0.15,b-a,0.9,0x2a2a2a);}
  for(const [a,b] of[[-24,-20],[-15,-11]]){box((a+b)/2,2.3,b-a,0.15,0.9,0x2a2a2a);box((a+b)/2,23.7,b-a,0.15,0.9,0x2a2a2a);}
  grass(-23,-11,3,23,90);for(let i=0;i<6;i++)bush(rand(-23,-11),rand(3,23),rand(0.7,1.2));
  // temple courtyard
  texStrip(29,13,26,22,'concrete',0xc8bca8,0.011);
  gopuram(35,12.5,0.9);mandapam(23.5,13,3,4,2.6);
  for(const [a,b] of[[16,24],[30,42]])box((a+b)/2,2.2,b-a,0.4,2.4,0xd8cfbf);
  for(const [a,b] of[[16,26],[32,42]])box((a+b)/2,23.8,b-a,0.4,2.4,0xd8cfbf);
  for(let i=0;i<5;i++)deco(17.5+i*0.9,0.05,10,0.35,0.1,0.35,pick([0xe0b030,0xe67e22]),{geo:G.sphereLo});
  // parking lot
  texStrip(32,-23,20,26,'asphalt',0x5a5754,0.011);
  for(let i=0;i<6;i++)deco(25+i*3,0.02,-24,0.12,0.01,4,0xd8d0b0);
  car(25,-31,0,0x7a2e2a);car(28,-30.6,0.1,0x4a5a6a);car(37.5,-31,-0.05,0xd9d4c8);car(25,-16.5,Math.PI,0x2f2f2f);car(31,-16,Math.PI+0.15,0x6f7a3a);car(38,-17,Math.PI,0x8a6a2a);
  car(33,-30.5,0.2,0,{burnt:true});fireAt(33,1.3,-30.5,1.2);
  drum(40.5,-12,0x2a4a7a);drum(41,-13,0x7a2a1a,true);tires(23.5,-12,3);
  // main street clutter
  for(const s of[-1,1])for(let z=-46;z<47;z+=4.2){if(z>-14&&z<6)continue;if(Math.random()<0.72)stall(s*8.6,z+rand(-0.4,0.4),0);}
  bus(-3.5,-24,0.06);bus(4,30,-0.05,{burnt:true});tanker(-3,12,0.04);
  auto(4,-38,0.4);auto(-4.5,-41,0.2);auto(-5,24,0.3);auto(-2,40,1.2);auto(4.5,-14,-0.2,{green:true});
  car(2,-4,0.9,0,{burnt:true});fireAt(2,1.2,-4,1.0);car(-16,-7,Math.PI/2,0x3d4f63);busTipped(17,-4.5,Math.PI/2+0.05);
  for(const [x,z] of[[5.5,18],[-6,-32],[6,-46],[-6.5,34],[3,8]])scooter(x,z,rand(0,3),Math.random()<0.5);
  for(let i=0;i<8;i++){const x=rand(-6.5,6.5),z=rand(-44,44);if(Math.abs(z+24)<7||Math.abs(z-30)<7||Math.abs(z-12)<6||(z>-12&&z<4))continue;crate(x,z,rand(0.8,1.05));if(Math.random()<0.5)crate(x+1,z+rand(-0.3,0.3),0.8);}
  barricade(-6,4.5,'x');barricade(6.5,-11.8,'x');jersey(-20,-4,4,'x');jersey(-8,-6.5,3,'z');sandbags(10.5,-1,3,'z');
  // west lane & alleys
  for(const [x,z] of[[-27,-40],[-28,-20],[-26,8],[-28.5,30],[-27,42]])drum(x,z);crate(-28,-8,1);crate(-28,-6.9,0.9);scooter(-26.5,18,0.1,true);
  for(let z=-44;z<46;z+=9)deco(-27,4.5,z,6,0.02,0.02,0x222222);for(let i=0;i<20;i++)deco(-27+rand(-2.6,2.6),4.1,rand(-44,44),0.3,0.7,0.03,pick([0xc0392b,0x2980b9,0xf1c40f,0xecf0f1,0x8e44ad]));
  box(-17,-29,2,1.4,1.4,0x2f5a3a);rubble(-12,-29,8,1.2);rubble(-21,-28,6,1);
  jersey(28,26.5,4,'x');crate(36,26,1);crate(37,26.8,0.9);
  // wires, poles, bunting, lamps
  const pw=[],pe=[];for(let z=-44;z<=46;z+=12){pw.push(ebPole(-9.6,z,z===-20));pe.push(ebPole(9.6,z,z===16));}wires(pw);wires(pe);
  const flagCols=[0xe63946,0xf4a261,0x2a9d8f,0xe9c46a,0xffffff];
  for(const z of[-30,-16,18,36]){for(let x=-9;x<=9;x+=0.85)deco(x,6.4-Math.cos(x/9*1.3)*0.6,z,0.38,0.42,0.02,pick(flagCols),{rz:Math.PI/4});}
  sign(0,4.8,-47.9,10,1.6,'RANGANATHAN ST','#1f5b34','#ffffff',0);
  litter(-9,9,-46,46,160);litter(16,42,2,24,40);rubble(-9.5,-36,6,0.8);rubble(9.5,22,6,0.8);
  smokeAt(-36,18,20,1.2,9,0x2a2522);smokeAt(48,22,-40,1,8,0x2a2522);
  return {start:[0,42],yaw:0};
}

function coach(x,z,len,ry,o){
  o=o||{};const P2=(lx,ly,lz,w,h,d,c,ex)=>{const p=L(x,z,ry,lx,lz);inst(ex&&ex.geo||G.box,c,p[0],ly,p[1],w,h,d,{ry:ry+(ex&&ex.ry||0),rx:ex&&ex.rx||0,rz:ex&&ex.rz||0,cast:!(ex&&ex.nocast),mat:ex&&ex.mat});};
  const blue=o.loco?0xb5281e:0x2d5b94;
  if(o.tipped){P2(0,1.5,0,3.4,3.0,len,blue);P2(1.71,1.5,0,0.02,2.6,len*0.94,0x182027,{nocast:true});P2(-0.6,3.02,0,1.4,0.03,len*0.96,0xd8cfae,{nocast:true});
    const hw=Math.abs(Math.cos(ry))*1.7+Math.abs(Math.sin(ry))*len/2,hd=Math.abs(Math.sin(ry))*1.7+Math.abs(Math.cos(ry))*len/2;addSolid(x-hw,x+hw,z-hd,z+hd,0,3);blob(x,z,4.5,len+1.5,ry);fireAt(x+0.4,3,z,1.3);return;}
  P2(0,2.2,0,3,2.8,len,blue,{mat:M(blue,{roughness:0.55,metalness:0.3})});P2(0,3.7,0,2.96,0.5,len,0x6d757a,{geo:G.halfCyl,rz:Math.PI/2,rx:Math.PI/2});
  P2(0,2.6,0,3.02,0.75,len*0.94,0x182027,{nocast:true});for(let i=-len/2+1;i<len/2;i+=1.3)P2(0,2.6,i,3.04,0.78,0.14,blue,{nocast:true});
  P2(0,1.6,0,3.03,0.22,len+0.02,o.loco?0xf2f2f2:0xd8cfae,{nocast:true});
  for(const s of[-1,1]){P2(0,0.45,s*len*0.33,2.4,0.7,2.4,0x1a1a1a);P2(0,0.6,s*(len/2-0.1),2,1.4,0.2,0x222222,{nocast:true});}
  const hw=Math.abs(Math.cos(ry))*1.5+Math.abs(Math.sin(ry))*len/2,hd=Math.abs(Math.sin(ry))*1.5+Math.abs(Math.cos(ry))*len/2;addSolid(x-hw,x+hw,z-hd,z+hd,0.2,4.0);blob(x,z,4,len+1,ry);
}
function buildCentral(){
  atmosphere({fog:0x3e3530,near:12,far:100,exposure:1.12,skyTop:0x16141a,skyHorizon:0x9a5e3a,hemiSky:0xe8c8a8,hemiGround:0x37302a,hemiI:0.7,sun:0xffb080,sunI:1.5,sunDir:[0.5,0.55,-0.6],sunDisc:0xff8a4a,sunSize:9,ash:0xa09a94,groundFog:0x6a5a50,groundFogAmt:0.18});
  arena={x0:-45,x1:45,z0:-31,z1:54};
  ground(260,260,'concrete',0x6e6860,0,0,40);
  // station facade + clock tower
  const brick=0xc06a50;
  building(0,-37,94,10,12.8,brick,{kind:'brick'});
  for(const y of[4,8.2])deco(0,y,-31.8,94,0.35,0.3,0xeadfcb,{cast:true});
  for(let x=-44;x<=44;x+=4)deco(x,6.4,-31.85,0.5,12.8,0.3,0xeadfcb);
  box(0,-35,8,8,30,brick,{mat:facadeMat('brick',brick,1,5)});deco(0,32,-35,9,4,9,0xeadfcb,{geo:G.cone4,cast:true});
  for(const s of[-1,1]){box(s*26,-35,6,6,17,brick,{mat:facadeMat('brick',brick,1,3)});deco(s*26,18.5,-35,6.6,3,6.6,0xeadfcb,{geo:G.cone4,cast:true});}
  const clk=mkCanvas(256,256),g=clk.getContext('2d');g.fillStyle='#f3ead6';g.beginPath();g.arc(128,128,120,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=8;g.stroke();
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.fillStyle='#222';g.fillRect(128+Math.cos(a)*100-4,128+Math.sin(a)*100-4,8,8);}
  g.lineWidth=10;g.beginPath();g.moveTo(128,128);g.lineTo(128,48);g.stroke();g.lineWidth=7;g.beginPath();g.moveTo(128,128);g.lineTo(188,150);g.stroke();
  const ct=new THREE.CanvasTexture(clk);levelDispose.push(ct);const cm=new THREE.MeshBasicMaterial({map:ct,transparent:true});levelDispose.push(cm);
  const cmesh=new THREE.Mesh(G.plane,cm);cmesh.scale.set(5.5,5.5,1);cmesh.position.set(0,24,-30.95);world.add(cmesh);
  sign(0,10.2,-31.6,20,2.2,'CHENNAI CENTRAL','#f3ead6','#7a1f14',0);
  // platforms and tracks
  const platX=[-36,-20,-4,12,28];
  platX.forEach((px,i)=>{texStrip(px,-7,6,48,'concrete',0xa09888,0.012);deco(px+2.9,0.03,-7,0.12,0.02,48,0xe0c020);deco(px-2.9,0.03,-7,0.12,0.02,48,0xe0c020);
    for(let z=-27;z<=13;z+=8){box(px,z,0.6,0.6,6.2,0x6b6560);deco(px,6.1,z,5.6,0.3,0.4,0x4a4e52,{cast:true});}
    deco(px,6.45,-7,7,0.3,46,0x3a3f44,{cast:true});sign(px,5.3,-15,3.2,0.7,'PF '+(i+1),'#13213a','#ffd23f',0,{cw:256,ch:64});
    bench(px-1.5,-19,'z');bench(px+1.5,1,'z');});
  for(const tx of[-28,-12,4,20,36])for(const off of[-2.2,2.2]){const x=tx+off;texStrip(x,-7,3,52,'dirt',0x4a4038,0.01);for(const r of[-0.72,0.72])deco(x+r,0.07,-7,0.1,0.12,52,0x8a8a8a,{mat:M(0x8a8a8a,{metalness:0.8,roughness:0.4})});for(let z=-32;z<19;z+=0.9)deco(x,0.04,z,2.3,0.06,0.24,0x4a3a2a);}
  sign(-4,4.9,5,6.4,1,'12601 CHENNAI MAIL  CANCELLED','#0b0b0b','#ffb000',0,{cw:768,ch:128,glow:true,font:'bold 54px "Courier New", monospace'});
  coach(-30.2,-19,14,0);coach(-30.2,1,14,0);coach(-14.2,-16,14,0);coach(-9.8,7,13,0,{tipped:true});coach(17.8,-22,14,0);coach(17.8,-4,14,0);coach(38.2,0,16,0,{loco:true});
  // footbridge
  deco(0,6.9,-10,90,0.4,3,0x7a746a,{cast:true});deco(0,7.6,-11.4,90,1.0,0.1,0x5a5a5a);deco(0,7.6,-8.6,90,1.0,0.1,0x5a5a5a);
  // luggage & carts on platforms
  for(const [x,z] of[[-36,-8],[-20,8],[-4,-22],[12,10],[28,-12],[-4,12]]){box(x+1.4,z,1.0,1.8,0.95,0x35506b);deco(x+1.4,1.2,z,0.8,0.5,1.4,pick([0x5b2a2a,0x2a3b5b,0x3b3b3b]),{cast:true});}
  for(let i=0;i<14;i++)deco(rand(-40,40),0.25,rand(-28,14),rand(0.5,0.7),0.5,rand(0.3,0.4),pick([0x5b2a2a,0x2a3b5b,0x3b3b3b,0x6a4a2a]),{cast:true,ry:rand(0,3)});
  // forecourt
  texStrip(0,35,90,38,'concrete',0x7a746a,0.009);texStrip(0,50,110,8,'asphalt',0x55524f,0.011);roadMarks(50,-50,50,[0],'x');
  for(let x=-34;x<=-12;x+=3.2)auto(x,22,Math.PI/2+rand(-.1,.1));
  bus(8,37,Math.PI/2+0.04);bus(26,43,Math.PI/2-0.05,{burnt:true,route:'27D  MARINA'});
  for(let i=0;i<5;i++)stall(-6+i*3,28,Math.PI/2);
  box(-20,40,4,6,1.2,0x7a746a);deco(-20,1.25,40,3.4,0.05,5.4,0x111111);sign(-20,2.6,43.05,3.6,0.7,'SUBWAY','#1a3a6a','#ffffff',0,{cw:256,ch:64});
  cityBlock(34,50,22,60,{face:'x-',kind:'brick',color:0xc87a60,h:[9,13]});cityBlock(-46,46,58,66,{face:'z-'});
  // goods shed maze
  const shed=0x6a6258;for(const [a,b] of[[-44,-38],[-34,-26]])box((a+b)/2,22,b-a,0.4,4.2,shed);for(const [a,b] of[[-44,-32],[-28,-26]])box((a+b)/2,47,b-a,0.4,4.2,shed);
  for(const [a,b] of[[22,30],[35,47]])box(-26.2,(a+b)/2,0.4,b-a,4.2,shed);
  deco(-35,4.5,34.5,18.4,0.3,25.4,0x3e3a36,{cast:true});
  for(const [x,z] of[[-41,26],[-41,28],[-36,26.5],[-31,30],[-40,36],[-35,38],[-30,42],[-38,44],[-32,35]]){crate(x,z,1.1);if(Math.random()<0.6)crate(x,z+1.15,1.1);if(Math.random()<0.4)box(x,z,1,1,0.9,0x7e5f39,{y:1.1});}
  // road
  car(-12,50,Math.PI/2,0,{burnt:true});fireAt(-12,1.2,50,1);car(14,51,Math.PI/2+0.2,0x4a5a6a);car(-30,49.5,-Math.PI/2,0xd9d4c8);
  jersey(-24,46.4,4,'x');jersey(4,46.4,4,'x');jersey(32,46.4,4,'x');
  const pl=[];for(let x=-42;x<=42;x+=14)pl.push(ebPole(x,45.6,x===0));wires(pl);
  for(const x of[-42,42])lamp(x,30,x<0?1:-1,true);
  litter(-44,44,16,54,140);litter(-44,44,-30,14,90);
  smokeAt(14,13,-40,1,9,0x2a2522);smokeAt(-60,10,10,0.8,9,0x2a2522);
  return {start:[0,40],yaw:0};
}

function signalPole(x,z,dir){cyl(x,z,0.1,5.2,0x333333);deco(x+dir*1.6,5.0,z,3.2,0.1,0.1,0x333333,{cast:true});deco(x+dir*2.9,4.6,z,0.3,0.9,0.3,0x1a1a1a,{cast:true});for(let i=0;i<3;i++)deco(x+dir*2.9,4.9-i*0.28,z+0.16,0.16,0.16,0.02,[0x5a1010,0x5a4a10,0x104a10][i]);}
function buildOMR(){
  atmosphere({fog:0x363c46,near:16,far:120,exposure:1.25,skyTop:0x15141e,skyHorizon:0xa65e4e,hemiSky:0xd8c8cc,hemiGround:0x2d2f33,hemiI:0.75,sun:0xffaa80,sunI:1.6,sunDir:[0.7,0.42,0.2],sunDisc:0xff8c5a,sunSize:12,ash:0x9a9ca4,groundFog:0x5a6070,groundFogAmt:0.14});
  arena={x0:-54,x1:54,z0:-60,z1:60};
  ground(300,300,'dirt',0x8a8070,0,0,40);
  texStrip(0,0,26,180,'asphalt',0x4e4c4a);texStrip(0,0,180,22,'asphalt',0x4e4c4a,0.009);
  for(const lx of[-9,-4.5,4.5,9])for(let z=-80;z<80;z+=7){if(Math.abs(z)<13)continue;deco(lx,0.02,z,0.18,0.01,3,0xcfc8b0);}
  for(const lz of[-6,6])for(let x=-80;x<80;x+=7){if(Math.abs(x)<15)continue;deco(x,0.02,lz,3,0.01,0.18,0xcfc8b0);}
  zebra(0,-14,22,'x');zebra(0,14,22,'x');zebra(-16,0,18,'z');zebra(16,0,18,'z');
  texStrip(19,0,6,180,'concrete',0x9a948a,0.012);texStrip(-19,0,6,180,'concrete',0x9a948a,0.012);
  for(const z of[-80,-60,-40,-28,-16,16,28,40,60,80]){if(Math.abs(z)<70){deco(0,0.12,z,2.2,0.24,11.5,0x8a8478);}}
  for(const z of[-52,-40,-28,-16,16,28,40,52]){box(0,z,1.8,1.8,10,0xa39e95);deco(0,10.3,z,3.4,0.7,2.6,0xa39e95,{cast:true});}
  deco(0,11.3,0,4.2,1.5,170,0xaaa59c,{cast:true});deco(0,12.1,0,4.4,0.2,170,0x8a857c);
  for(const x of[-48,-36,-24,24,36,48])jersey(x,0,5,'x');
  signalPole(14,-12.5,-1);signalPole(-14,12.5,1);signalPole(14,12.5,-1);signalPole(-14,-12.5,1);
  box(17,15,2,2,2.6,0xe0d8c8);sign(17,2.2,16.02,1.8,0.45,'POLICE','#1a3a6a','#ffffff',0,{cw:256,ch:64});
  // NE campus
  for(const [a,b] of[[-60,-40],[-34,-14]])box(16,(a+b)/2,0.4,b-a,1.8,0xd8cfbf);for(const [a,b] of[[16,30],[36,54]])box((a+b)/2,-14,b-a,0.4,1.8,0xd8cfbf);
  building(44,-52,20,16,36,0x7fb2c4,{kind:'glass'});building(47,-28,14,16,28,0x6aa3a8,{kind:'glass'});
  sign(36.95,10,-28,10,1.6,'SEZ TECH PARK','#0e2233','#bfe3ff',-Math.PI/2);
  texStrip(25,-36,16,40,'asphalt',0x5a5754,0.011);
  [[20,-54,0,0x7a2e2a],[23,-53.5,0.1,0xd9d4c8],[29,-54,0,0x2f2f2f],[20,-42,Math.PI,0x4a5a6a],[26,-41,Math.PI+0.1,0x8a6a2a],[20,-24,0.05,0x3d4f63],[29,-25,0,0x9a9a9a]].forEach(c=>car(c[0],c[1],c[2],c[3]));
  for(const [x,z] of[[34,-40],[34,-20],[40,-18],[52,-40]])tree(x,z,1);grass(31,53,-44,-16,60);
  // NW petrol station
  texStrip(-28,-30,26,22,'concrete',0xa09a90,0.011);
  deco(-26,5.4,-26,15,0.5,9,0xe8e2d6,{cast:true});deco(-26,5.1,-26,15.2,0.25,9.2,0xc0392b);
  for(const [x,z] of[[-32,-29],[-20,-29],[-32,-23],[-20,-23]])box(x,z,0.5,0.5,5.2,0xd8d2c6);
  for(const x of[-29,-23]){box(x,-26,0.9,0.5,1.7,0xd8d2c6);deco(x,1.3,-25.73,0.6,0.4,0.02,0x1a1a1a);}
  building(-42,-26,10,8,3.2,0xe8e2d6,{kind:'res',face:'x+',signs:false});
  cyl(-16,-17,0.18,8,0x888888);sign(-16,8.6,-17,3,1.8,'PETROL','#c0392b','#ffffff',Math.PI/2,{cw:256,ch:128});
  building(-44,-52,20,16,30,0x8aa0c6,{kind:'glass'});
  for(const [a,b] of[[-54,-34],[-28,-16]])box((a+b)/2,-14,b-a,0.4,1.8,0xd8cfbf);
  tanker(-8,-30,0.15);
  // SW campus with tense corridor
  building(-42,28,16,16,22,0x8aa0c6,{kind:'glass'});building(-42,51,16,18,26,0x7fb2c4,{kind:'glass'});
  sign(-33.95,8,28,9,1.4,'CYBER TOWERS','#0e2233','#bfe3ff',Math.PI/2);
  for(const [a,b] of[[14,30],[36,60]])box(-16,(a+b)/2,0.4,b-a,1.8,0xd8cfbf);
  box(-15,36,0.3,4,2.4,0x55606a);deco(-15.8,2.5,36,2,0.12,4.4,0x3a6ea5,{cast:true});
  for(const [x,z] of[[-26,18],[-24,32],[-28,44],[-22,56]])tree(x,z,1);grass(-32,-18,16,58,70);
  for(const [x,z] of[[-38,39],[-44,38.5],[-48,40]])drum(x,z);crate(-35,40,1);
  sign(-17.4,5,6,9,2.6,'WALK-IN DRIVE TODAY · FRESHERS WELCOME','#f5f0e1','#b0161d',Math.PI/2,{cw:1024,ch:256,font:'bold 64px Impact, sans-serif'});cyl(-17.6,2.5,0.12,3.8,0x333333);cyl(-17.6,9.5,0.12,3.8,0x333333);
  // SE construction site
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=28.5+i*5,z=28.5+j*5;box(x,z,0.6,0.6,9.8,0x9a958c);for(let r=0;r<3;r++)deco(x+rand(-.2,.2),10.2,z+rand(-.2,.2),0.03,0.9,0.03,0x6a3a20);}
  for(const y of[3.2,6.4,9.6])deco(36,y,36,16.6,0.3,16.6,0xa8a298,{cast:true});
  for(let i=0;i<10;i++){const x=rand(27,45),z=rand(27,45);deco(x,1.6,z,0.08,3.2,0.08,0x8a6a40);}
  boulder(21,24,3.2,0xb89a6a);boulder(24,52,3.6,0xb89a6a);sandbags(46,22,4,'z');sandbags(27,48,3,'x');
  box(48,48,1.2,1.2,30,0xd8a020);deco(40,30.5,48,24,1,1,0xd8a020,{cast:true});deco(55,30,48,5,2,2,0x555555,{cast:true});
  for(const [a,b] of[[14,22],[28,60]]){for(let z=a;z<b;z+=2.4)deco(16,1.2,z+1.2,0.08,2.4,2.3,pick([0xc9c2b2,0xb8b0a0,0x2a6fb0]));addSolid(15.8,16.2,a,b,0,2.4);}
  for(const [a,b] of[[16,30],[36,54]]){for(let x=a;x<b;x+=2.4)deco(x+1.2,1.2,14,2.3,2.4,0.08,pick([0xc9c2b2,0xb8b0a0,0x2a6fb0]));addSolid(a,b,13.8,14.2,0,2.4);}
  smokeAt(36,10,36,1.2,8,0x3a3530);
  // wrecks on the roads
  car(-6,-34,0.3,0x8b2f2f);car(7,-22,Math.PI/2-0.2,0x3d4f63);car(-8,20,-0.1,0xd9d4c8);car(6,34,0.05,0x2f2f2f);car(-5,48,Math.PI/2+0.3,0x6f7a3a);car(9,54,0,0x9a6a2a);
  car(-4,3,0.8,0,{burnt:true});fireAt(-4,1.2,3,1.2);car(30,4,Math.PI/2,0xd9d4c8);car(-36,-4,Math.PI/2+0.1,0x2f2f2f);
  bus(-7,-50,0.04,{low:0x1d5ba3,up:0xd8d4c8,route:'519  KELAMBAKKAM'});bus(38,-6,Math.PI/2,{burnt:true});
  auto(7,-44,0.6);auto(-9,-12+28,1.0);auto(24,7,-0.4);scooter(5,10,1,true);scooter(-6,-18,0.4,true);
  for(let i=0;i<8;i++)deco(rand(-10,10),0.4,rand(-55,55),0.4,0.8,0.4,0xe0661f,{geo:G.cone,cast:true});
  for(let i=0;i<12;i++)pothole(rand(-11,11),rand(-58,58),rand(0.6,1.5));
  const pw=[];for(let z=-56;z<=56;z+=14){if(Math.abs(z)<14)continue;pw.push(ebPole(-14.2,z,z===-28));}wires(pw.slice(0,4));wires(pw.slice(4));
  // horizon towers
  for(const [x,z,h] of[[-75,-40,48],[-80,20,60],[78,-30,55],[74,40,44],[0,-85,50],[20,88,46],[-30,90,40]])building(x,z,18,18,h,pick([0x7fb2c4,0x6aa3a8,0x8aa0c6]),{kind:'glass'});
  litter(-12,12,-58,58,140);litter(-50,50,-10,10,80);
  return {start:[6,54],yaw:0};
}

let water=null,foam=null;
function buildMarina(){
  atmosphere({fog:0x5e3a2e,near:18,far:130,exposure:1.25,skyTop:0x241225,skyHorizon:0xd8683a,hemiSky:0xffc8a8,hemiGround:0x5a4030,hemiI:0.7,sun:0xff9a66,sunI:1.7,sunDir:[1,0.22,-0.2],sunDisc:0xff5a2a,sunSize:20,ash:0xc8b49a,wind:0.6,groundFog:0x8a6050,groundFogAmt:0.12});
  arena={x0:-53,x1:19,z0:-72,z1:72};
  ground(320,320,'sand',0xd8b585,0,0,46);
  texStrip(17,0,10,240,'sand',0xa08060,0.01);
  const wm=new THREE.MeshStandardMaterial({color:0x2a4a58,roughness:0.15,metalness:0.4,transparent:true,opacity:0.94});levelDispose.push(wm);
  water=new THREE.Mesh(G.plane,wm);water.rotation.x=-Math.PI/2;water.scale.set(240,320,1);water.position.set(142,0.05,0);world.add(water);
  foam=new THREE.Mesh(G.plane,MB(0xe8e2d0,{transparent:true,opacity:0.7}));foam.rotation.x=-Math.PI/2;foam.scale.set(1.4,320,1);foam.position.set(22.5,0.07,0);world.add(foam);
  // Kamarajar Salai + promenade
  texStrip(-48,0,12,240,'asphalt',0x4e4c4a);for(let z=-110;z<110;z+=8)deco(-48,0.02,z,0.18,0.01,3,0xcfc8b0);
  for(let z=-70;z<=70;z+=10){if(Math.random()<0.6)box(-48,z,0.8,4,0.5,0x8a8478);bush(-48,z,0.7);}
  texStrip(-39,0,6,240,'concrete',0xb8b0a2,0.011);
  for(const z of[-40,0,40]){box(-39,z,2.6,2.6,2.2,0xd8cfbf);deco(-39,3.2,z,0.8,2,0.6,0x5f5a52,{cast:true});deco(-39,4.4,z,0.5,0.5,0.5,0x5f5a52,{geo:G.sphere,cast:true});deco(-39,3.4,z+0.4,0.2,0.9,0.2,0x5f5a52,{rx:-0.8,cast:true});}
  for(let z=-66;z<=66;z+=12){lamp(-36.4,z,-1,z===-6);bench(-40.5,z+4,'z');palm(-43,z+6,false,rand(6,8));}
  bus(-50,-12,0.03,{burnt:true});fireAt(-50,3,-12,1.4);car(-46,22,0.05,0x7a2e2a);car(-50,40,Math.PI,0x2f2f2f);car(-46,-40,-0.1,0,{burnt:true});
  for(let z=-120;z<120;z+=26)building(-74,z,22,20,rand(10,18),pick([0xc06a50,0xd8cbb0,0xb0705a]),{kind:z%52?'brick':'res'});
  for(const z of[-60,10,70]){deco(-64,20,z,6,6,6,0xe8e2d6,{geo:G.sphere,cast:true});deco(-64,17,z,5,3,5,0xe8e2d6,{geo:G.cyl});}
  // fishing hamlet (north)
  for(const x of[-31,-24,-17,-10,-3])for(const z of[-68,-61,-54,-47]){if(Math.random()<0.22)continue;hut(x+rand(-.6,.6),z+rand(-.6,.6),rand(-0.15,0.15));}
  for(let i=0;i<6;i++){const x=rand(-32,-2),z=rand(-70,-44);deco(x,1.1,z,0.04,2.2,0.04,0x5a4030);deco(x+1.2,1.1,z,0.04,2.2,0.04,0x5a4030);deco(x+0.6,1.4,z,1.2,1.2,0.02,0x5a7a6a,{mat:M(0x5a7a6a,{transparent:true,opacity:0.7})});}
  for(const [x,z] of[[6,-62],[10,-54],[5,-46]])boat(x,z,rand(-0.3,0.3));
  // kiosk row
  const kiosks=['SUNDAL','BAJJI','ICE CREAM','CORN','BALLOON','SODA','MURUKKU'];let ki=0;
  for(let z=-32;z<=14;z+=4.6){if(Math.random()<0.28)continue;stall(-26,z,0,pick(['fruit','junk','cloth']));if(Math.random()<0.6)sign(-25.3,2.0,z,0.02+1.8,0.45,kiosks[ki++%kiosks.length],pick(['#e9c46a','#c0392b','#7fc8d9','#f2f2f2']),'#13213a',Math.PI/2,{cw:256,ch:64});}
  // merry-go-round ruin
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;cyl(-8+Math.cos(a)*4,26+Math.sin(a)*4,0.08,3.4,0xd8c070);}cyl(-8,26,0.5,4,0x8a2a22);deco(-8,4.6,26,9.6,1.6,9.6,0xc0392b,{geo:G.cone,cast:true,rz:0.15});
  for(let i=0;i<5;i++)deco(-8+rand(-4,4),0.5,26+rand(-4,4),0.5,0.9,1.0,pick([0xe8e2d6,0xd8a020]),{rz:1.4,ry:rand(0,3),cast:true});
  // boats & catamarans
  for(const z of[-30,-14,0,14,32,48])boat(rand(7,14),z+rand(-3,3),rand(-0.4,0.4));
  fireAt(11,1.1,0.5,1);
  for(const [x,z] of[[2,-22],[0,40],[4,58]])deco(x,0.18,z,0.45,5,0.45,0x6b4a2b,{geo:G.cyl,rx:Math.PI/2,ry:rand(0,3),cast:true});
  // lighthouse (south)
  for(let i=0;i<8;i++){const h=5;deco(-30,i*h+h/2,60,4.4-i*0.18,h,4.4-i*0.18,i%2?0xb3261e:0xece4d2,{geo:G.cyl,cast:true});}
  addSolid(-32.2,-27.8,57.8,62.2,0,40);deco(-30,41,60,2.4,2,2.4,0x222222,{geo:G.cyl,cast:true});deco(-30,42.6,60,2.6,1.4,2.6,0x333333,{geo:G.cone4,cast:true});
  // watchtower
  for(const [dx,dz] of[[-1,-1],[1,-1],[-1,1],[1,1]])box(4+dx*1.1,-30+dz*1.1,0.2,0.2,4,0x8a6a40);deco(4,4.1,-30,3,0.2,3,0x6b4a2b,{cast:true});deco(4,5.4,-30,3.4,0.15,3.4,0x2f6fb0,{cast:true,rz:0.1});
  for(let i=0;i<14;i++)deco(rand(-34,16),0.1,rand(-70,70),rand(4,9),0.4,rand(3,6),0xcfab78,{geo:G.sphere,ry:rand(0,3)});
  litter(-34,16,-70,70,160);rubble(-30,-20,6,1);
  smokeAt(-90,20,-20,1,12,0x2a2522);smokeAt(-85,18,40,0.8,10,0x2a2522);
  return {start:[-20,64],yaw:0};
}

function reliefTex(){
  const c=mkCanvas(1024,512),g=c.getContext('2d');g.fillStyle='#c9a87c';g.fillRect(0,0,1024,512);speckle(g,1024,512,9000,140,220,1,3,0.35);
  const fig=(x,y,s,a)=>{g.save();g.translate(x,y);g.rotate(a||0);g.fillStyle='rgba(70,48,28,.55)';g.beginPath();g.ellipse(2,-30*s+2,7*s,8*s,0,0,7);g.fill();g.fillRect(-6*s+2,-22*s+2,12*s,24*s);g.fillRect(-9*s+2,2,6*s,18*s);g.fillRect(3*s+2,2,6*s,18*s);
    g.fillStyle='rgba(235,210,170,.55)';g.beginPath();g.ellipse(0,-30*s,7*s,8*s,0,0,7);g.fill();g.fillRect(-6*s,-22*s,12*s,24*s);g.fillRect(-9*s,0,6*s,18*s);g.fillRect(3*s,0,6*s,18*s);g.fillRect(-12*s,-20*s,4*s,16*s);g.fillRect(8*s,-24*s,4*s,10*s);g.restore();};
  for(let r=0;r<5;r++)for(let i=0;i<18;i++){const x=30+i*55+rand(-10,10),y=90+r*80+rand(-8,8);if(Math.abs(x-512)<40)continue;fig(x,y,rand(0.8,1.1),rand(-.15,.15));}
  const ele=(x,y,s)=>{g.fillStyle='rgba(60,40,24,.6)';g.beginPath();g.ellipse(x+4,y+4,90*s,55*s,0,0,7);g.fill();g.fillStyle='rgba(225,198,158,.6)';g.beginPath();g.ellipse(x,y,90*s,55*s,0,0,7);g.fill();g.fillRect(x-80*s,y+20*s,26*s,60*s);g.fillRect(x+40*s,y+20*s,26*s,60*s);g.beginPath();g.ellipse(x-95*s,y-10*s,32*s,38*s,0,0,7);g.fill();g.fillRect(x-125*s,y-5*s,14*s,80*s);};
  ele(300,420,0.9);ele(780,420,0.8);
  const gr=g.createLinearGradient(482,0,542,0);gr.addColorStop(0,'rgba(20,12,6,0)');gr.addColorStop(0.5,'rgba(20,12,6,.85)');gr.addColorStop(1,'rgba(20,12,6,0)');g.fillStyle=gr;g.fillRect(482,0,60,512);
  crackLines(g,1024,512,20,'rgba(50,35,20,.5)',1,2.5);stainBlobs(g,1024,512,30,'60,40,20',0.3);
  const t=new THREE.CanvasTexture(c);t.anisotropy=MAX_ANISO;levelDispose.push(t);return t;
}
function stoneTiers(x,z,w,d,tiers,th,col,o){
  o=o||{};let y=o.y||0,ww=w,dd=d;const tone=[col,shade(col,0.88),shade(col,1.06)];
  for(let i=0;i<tiers;i++){deco(x,y+th/2,z,ww,th,dd,tone[i%3],{cast:true});deco(x,y+th-0.12,z,ww+0.35,0.24,dd+0.35,shade(col,0.8),{cast:true});
    for(let k=-1;k<=1;k++){deco(x+k*ww*0.3,y+th*0.5,z+dd/2+0.06,ww*0.12,th*0.6,0.12,shade(col,0.75));}
    y+=th;ww*=o.shrink||0.78;dd*=o.shrink||0.78;}
  addSolid(x-w/2,x+w/2,z-d/2,z+d/2,o.y||0,y);return {y,ww,dd};
}
function shoreTemple(x,z){
  const st=0xa8957a;
  deco(x,0.15,z,20,0.3,14,0xb8a688);
  const big=stoneTiers(x+3,z-1,6,6,6,2.3,st,{shrink:0.8});deco(x+3,big.y+1.2,z-1,big.ww*1.3,2.4,big.dd*1.3,shade(st,0.9),{geo:G.cone4,cast:true});deco(x+3,big.y+2.6,z-1,0.6,0.9,0.6,0x8a7a60,{geo:G.sphereLo});
  const sm=stoneTiers(x-5,z+2,4.4,4.4,4,2.0,st,{shrink:0.8});deco(x-5,sm.y+0.9,z+2,sm.ww*1.3,1.8,sm.dd*1.3,shade(st,0.9),{geo:G.cone4,cast:true});
  deco(x+3,2,z+2.03,1.6,3.2,0.05,0x120c08);deco(x-5,1.6,z+4.23,1.2,2.6,0.05,0x120c08);
  // compound wall with nandi bulls, broken in places
  const wall=(x0,x1,z0,z1)=>{box((x0+x1)/2,(z0+z1)/2,Math.max(0.6,x1-x0),Math.max(0.6,z1-z0),1.6,shade(st,0.95));};
  wall(x-10,x-3,z+7,z+7.6);wall(x+2,x+10,z+7,z+7.6);wall(x-10,x+10,z-7.6,z-7);wall(x-10.6,x-10,z-7,z+1);wall(x+10,x+10.6,z-3,z+7.6);
  for(let i=-9;i<=9;i+=2.2){if(Math.abs(i+0.5)<3)continue;deco(x+i,1.95,z+7.3,0.8,0.5,0.45,0xc8b898,{cast:true});deco(x+i+0.45,2.15,z+7.3,0.3,0.35,0.3,0xc8b898);}
  rubble(x-1,z+8.5,10,1.5,st);rubble(x+10.5,z-5,8,1.2,st);
}
function ratha(x,z,kind){
  const c=pick([0xb89a72,0xa88a64,0xc0a27a]);
  if(kind==='hut'){box(x,z,3.2,3.2,3,c);deco(x,4.1,z,3.8,2.4,3.8,shade(c,0.9),{geo:G.cone4,cast:true});deco(x,1.4,z+1.62,1,2.2,0.05,0x120c08);}
  else if(kind==='vault'){box(x,z,7,3.6,3.2,c);deco(x,3.2+0.9,z,3.6,1.8,7,shade(c,0.92),{geo:G.halfCyl,rz:Math.PI/2,ry:Math.PI/2,cast:true});for(let i=-3;i<=3;i+=1.5)deco(x+i,1.4,z+1.85,0.45,2.8,0.2,shade(c,0.8));}
  else if(kind==='stepped'){const r=stoneTiers(x,z,4.6,4.6,4,1.9,c);deco(x,r.y+0.7,z,r.ww*1.2,1.4,r.dd*1.2,c,{geo:G.sphere,cast:true});}
  else if(kind==='elephant'){const e=0xa89070;box(x,z,1.5,3.2,2.2,e,{y:0.9});for(const dx of[-0.5,0.5])for(const dz of[-1.1,1.1])deco(x+dx,0.5,z+dz,0.5,1.0,0.5,e,{cast:true});deco(x,2.4,z+1.9,1.3,1.4,0.9,e,{cast:true});deco(x,1.4,z+2.4,0.35,1.6,0.35,e,{rx:0.3,cast:true});for(const dx of[-0.75,0.75])deco(x+dx,2.5,z+1.8,0.12,1.0,0.8,shade(e,0.9));addSolid(x-0.8,x+0.8,z-1.7,z+2.6,0,3.1);}
  else {const l=0xb09878;box(x,z,1.4,1.4,1.0,l);deco(x,1.6,z,0.9,1.2,1.3,l,{cast:true});deco(x,2.5,z+0.4,0.9,0.9,0.8,l,{cast:true});deco(x,2.6,z+0.2,1.1,1.0,0.6,shade(l,0.85),{geo:G.rubble});addSolid(x-0.7,x+0.7,z-0.7,z+0.7,0,3.0);}
  blob(x,z,6,6);
}
function pillarRow(x,z,n,sp,along,broken){for(let i=0;i<n;i++){const px=along==='x'?x+i*sp:x,pz=along==='x'?z:z+i*sp;const h=broken&&Math.random()<0.45?rand(0.8,2.4):3.4;box(px,pz,0.6,0.6,h,0xb8a47a);if(h>3)deco(px,h,pz,0.9,0.3,0.9,0xa8946a,{cast:true});else rubble(px+rand(-1,1),pz+rand(-1,1),3,0.6,0xb8a47a);}}
function fallenPillar(x,z,ry){deco(x,0.3,z,0.6,3.2,0.6,0xb0a07a,{rz:Math.PI/2,ry,cast:true});addSolidRot(x,z,ry,1.6,0.3,0,0.6);}
function casuarina(x,z,h){cyl(x,z,0.12,h*0.5,0x5a4430);for(let i=0;i<3;i++)deco(x,h*0.45+i*h*0.17,z,1.8-i*0.45,h*0.32,1.8-i*0.45,pick([0x2f4a28,0x38552c,0x2a4024]),{geo:G.cone,cast:true});}
function buildMamallapuram(){
  atmosphere({fog:0x9a7656,near:20,far:150,exposure:1.05,skyTop:0x5a4a5e,skyHorizon:0xe0a070,hemiSky:0xffe0c0,hemiGround:0x6a5038,hemiI:0.65,sun:0xffd8a8,sunI:1.5,sunDir:[0.7,0.35,0.15],sunDisc:0xffe8c8,sunSize:15,ash:0xd8c0a0,wind:1.6,groundFog:0xc09a78,groundFogAmt:0.14});
  arena={x0:-62,x1:56,z0:-52,z1:62};
  ground(360,360,'sand',0xb08a5a,0,0,50);
  // the sea to the east
  texStrip(60,0,14,300,'sand',0x8a6e4e,0.01);
  const wm=new THREE.MeshStandardMaterial({color:0x2c4a58,roughness:0.15,metalness:0.4,transparent:true,opacity:0.94});levelDispose.push(wm);
  water=new THREE.Mesh(G.plane,wm);water.rotation.x=-Math.PI/2;water.scale.set(240,320,1);water.position.set(182,0.05,0);world.add(water);
  foam=new THREE.Mesh(G.plane,MB(0xe8e2d0,{transparent:true,opacity:0.7}));foam.rotation.x=-Math.PI/2;foam.scale.set(1.4,320,1);foam.position.set(62.5,0.07,0);foam.userData.bx=62.5;world.add(foam);
  // sandy paths between the monuments
  texStrip(0,10,6,90,'dirt',0xc8ac84,0.011);texStrip(-14,-24,40,5,'dirt',0xc8ac84,0.011);texStrip(18,-26,30,5,'dirt',0xc8ac84,0.011);texStrip(-20,30,36,5,'dirt',0xc8ac84,0.011);
  // Arjuna's Penance: the great carved rock face closes the north side
  const rel=new THREE.MeshStandardMaterial({map:reliefTex(),roughness:0.95,color:0xffffff});levelDispose.push(rel);
  box(-6,-58,46,8,11,0xb89a72,{mat:rel});deco(-6,11.4,-58,47,1.2,8.6,0xa88a62,{geo:G.rubble,cast:true});
  for(const x of[-32,22]){deco(x,4,-58,10,8,9,0xa88a62,{geo:G.rubble,cast:true});addSolid(x-5,x+5,-62,-54,0,8);}
  // Shore Temple by the sea
  shoreTemple(36,-28);
  // Pancha Rathas
  ratha(-36,-30,'hut');ratha(-28,-31,'stepped');ratha(-18,-31,'vault');ratha(-27,-22,'elephant');ratha(-38,-21,'lion');
  // Krishna's butter ball balanced on a rock slope
  deco(-6,1.0,16,9,2.2,7,0xa08462,{geo:G.rubble,cast:true});addSolid(-10,-2,13,19,0,1.2);
  deco(-5.5,4.2,15.6,6,6,6,0x8a6a48,{geo:G.sphere,cast:true});addSolid(-8,-3,13.4,17.8,0,7);
  // ruined courtyards with broken pillared halls
  // wall sections snap out of the 1.25-1.8 m band: low enough to jump (<=1.2) or clearly a wall (>=1.8), never "looks jumpable but isn't"
  const wh=v=>v>1.22&&v<1.8?(v<1.5?1.2:1.8):v;
  const yard=(cx,cz,w,d)=>{const h=rand(1.4,2.6),c=0xc0aa84;box(cx-w/2+3,cz-d/2,6,0.7,wh(h),c);box(cx+w/2-3,cz-d/2,6,0.7,wh(h*0.6),c);box(cx-w/2,cz,0.7,d*0.4,wh(h),c);box(cx+w/2,cz+d/4,0.7,d*0.5,wh(h*0.8),c);box(cx,cz+d/2,w*0.35,0.7,wh(h),c);texStrip(cx,cz,w,d,'concrete',0xb8a888,0.012);};
  yard(14,26,22,16);pillarRow(8,22,4,4,'x',true);pillarRow(8,30,4,4,'x',true);
  yard(-38,30,20,16);pillarRow(-44,26,4,4,'x',true);pillarRow(-44,34,3,4,'x',true);
  mandapam(14,-8,3,3,2.8);fallenPillar(20,-4,0.4);fallenPillar(6,-12,1.2);fallenPillar(-20,4,0.2);fallenPillar(30,8,1.8);fallenPillar(-30,46,0.7);
  for(let i=0;i<5;i++){const x=rand(-50,46),z=rand(-40,50);if(Math.hypot(x,z-54)<10)continue;rubble(x,z,8,1.5,0xb0a07a);}
  // coastal vegetation
  for(const [x,z] of[[48,-10],[50,14],[44,30],[-50,-40],[-52,10],[24,44],[-14,40],[52,44],[-46,52],[30,-46]])palm(x,z,Math.random()<0.3,rand(6,8.5));
  for(const [x,z] of[[-56,-14],[-55,-2],[-57,22],[-56,36],[-24,52],[-8,50]])casuarina(x,z,rand(7,10));
  for(let i=0;i<14;i++)bush(rand(-58,52),rand(-46,58),rand(0.7,1.3),pick([0x55652f,0x4a5a2a,0x6a6a3a]));
  grass(-58,52,-46,60,180);
  // tourists never left: burnt bus and cars by the entrance
  bus(-48,46,Math.PI/2+0.05,{burnt:true});fireAt(-48,3.4,46,1.2);car(-36,52,0.3,0x7a2e2a);car(-30,48,-0.2,0,{burnt:true});car(-54,30,0.05,0x4a5a6a);auto(-22,54,0.8);
  cyl(-6,46,0.14,5,0x5a5a5a);cyl(4,46,0.14,5,0x5a5a5a);sign(-1,4.6,46,10,2.2,'MAMALLAPURAM','#1f6b3a','#ffffff',0,{cw:768,ch:170,font:'bold 92px Arial, sans-serif'});
  sign(28,2.6,-12,4,0.8,'SHORE TEMPLE  →','#7a3a1a','#f6e7c1',-Math.PI/2,{cw:512,ch:100});cyl(28,-12.5,0.08,2.2,0x5a4a3a);
  sandbags(4,34,4,'x');jersey(-10,28,4,'x');boulder(36,30,2.6,0xa08462);boulder(-46,0,2.2,0xa08462);
  for(let i=0;i<14;i++)deco(rand(-58,52),-0.08,rand(-46,58),rand(4,9),0.35,rand(3,6),0xa07e50,{geo:G.sphere,ry:rand(0,3)});
  for(let i=0;i<22;i++){const a=i/22*6.28,r=rand(80,120);if(Math.cos(a)>0.5)continue;deco(Math.cos(a)*r,-1.5,Math.sin(a)*r,rand(30,56),rand(8,16),rand(24,40),0x9a7448,{geo:G.sphere,ry:rand(0,3)});}
  litter(-58,52,-46,60,80);smokeAt(-70,14,-10,0.8,10,0x2a2522);
  return {start:[0,54],yaw:0};
}
