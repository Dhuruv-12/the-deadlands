// Visual checks: infected line-up, scope, boss telegraphs, weapon poses
const { open, dir } = require('./t2.js');
const path = require('path');
(async () => {
  const { browser, page, errors } = await open();
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const shot = async (n) => { await ev(() => { __cd.P.hp = 100; document.getElementById('tip').style.opacity = 0; }); await page.waitForTimeout(400); await page.screenshot({ path: path.join(dir, n) }); };
  await ev(() => { __cd.forceFallback(); document.getElementById('startBtn').click(); });
  // line-up of infected in OMR junction
  await ev(() => {
    const P = __cd.P; __cd.startLevel(2, false); __cd.setPlaying(); __cd.hold(); __cd.sim(0.2); __cd.zombies.length = 0; __cd.spawnQueue.length = 0;
    P.x = 4; P.z = 8; P.yaw = 0; P.pitch = -0.05;
    const types = ['pinam', 'pinam', 'odi', 'thadiyan', 'kaalan', 'pinam'];
    types.forEach((t, i) => { const z = __cd.newZombie(t, P.x - 5 + i * 2, P.z - 6.5 - (i % 2) * 1.2); z.state = 'wander'; z.idle = 99; z.stagger = 999; z.face = Math.PI; });
    __cd.sim(0.3, () => { P.hp = 100; });
    __cd.zombies.forEach(z => { z.mesh.rotation.y = 0; z.face = 0; z.x = z.mesh.position.x; });
    document.getElementById('banner').style.opacity = 0; document.getElementById('tip').style.opacity = 0;
  });
  await shot('v2-lineup.png');
  // knife slash mid-swing & stick wind-up
  await ev(() => { __cd.zombies.forEach(z => { z.removed = true; z.mesh.visible = false; }); __cd.sim(0.1); __cd.P.hp = 100; __cd.P.yaw = 0.4; __cd.equip('knife', true); __cd.sim(0.5); __cd.fire(true); __cd.sim(0.12); __cd.fire(false); });
  await shot('v2-knife.png');
  await ev(() => { __cd.sim(0.5); __cd.inv.stick = 8; __cd.equip('stick', true); __cd.sim(0.5); __cd.fire(true); __cd.sim(0.2); __cd.fire(false); });
  await shot('v2-stick.png');
  // rifle reload mid-animation, then scope
  await ev(() => { __cd.sim(1); __cd.equip('rifle', true); __cd.sim(0.5); __cd.inv.rifle.mag = 0; __cd.startReload(); __cd.sim(0.5); });
  await shot('v2-reload.png');
  await ev(() => { __cd.sim(2.5); __cd.P.yaw = 0.05; __cd.aim(true); __cd.sim(0.6); });
  await shot('v2-scope.png');
  await ev(() => { __cd.aim(false); __cd.sim(0.4); });
  await shot('v2-rifle-hip.png');
  // boss telegraphs in the desert
  await ev(() => {
    const P = __cd.P; __cd.aim(false); __cd.startLevel(4, true); __cd.setPlaying(); __cd.hold(); __cd.sim(0.2); __cd.zombies.length = 0; __cd.spawnQueue.length = 0;
    __cd.spawnFromQueue('boss'); __cd.sim(1.6, () => { P.hp = 100; });
    document.getElementById('tip').style.opacity = 0;
  });
  await shot('v2-boss-emerge.png');
  await ev(() => { const P = __cd.P; const b = __cd.zombies.find(z => z.boss); __cd.sim(2.2, () => { P.hp = 100; }); b.chargeCd = 0; b.bs = 'walk'; P.x = b.x + Math.sin(b.face) * 14; P.z = b.z + Math.cos(b.face) * 14; P.yaw = Math.atan2(P.x - b.x, P.z - b.z); P.pitch = 0.1; __cd.sim(0.7, () => { P.hp = 100; }); document.getElementById('banner').style.opacity = 0; });
  await shot('v2-boss-charge.png');
  await ev(() => { const P = __cd.P; const b = __cd.zombies.find(z => z.boss); __cd.sim(3, () => { P.hp = 100; }); b.bs = 'walk'; b.slamCd = 0; b.chargeCd = 99; b.throwCd = 99; P.x = b.x + Math.sin(b.face) * 4; P.z = b.z + Math.cos(b.face) * 4; P.yaw = Math.atan2(P.x - b.x, P.z - b.z); P.pitch = 0.25; __cd.sim(0.6, () => { P.hp = 100; }); });
  await shot('v2-boss-slam.png');
  await ev(() => { const P = __cd.P; const b = __cd.zombies.find(z => z.boss); __cd.sim(2, () => { P.hp = 100; }); b.bs = 'walk'; b.throwCd = 0; b.slamCd = 99; P.x = b.x + Math.sin(b.face) * 16; P.z = b.z + Math.cos(b.face) * 16; P.yaw = Math.atan2(P.x - b.x, P.z - b.z); P.pitch = -0.05; __cd.sim(0.7, () => { P.hp = 100; }); });
  await shot('v2-boss-throw.png');
  console.log('ERRORS:\n' + (errors.slice(0, 20).join('\n') || 'none'));
  await browser.close();
})();
