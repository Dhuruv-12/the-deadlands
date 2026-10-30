// v3 visual checks
const { open, dir } = require('./t2.js');
const path = require('path');
(async () => {
  const { browser, page, errors } = await open();
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const shot = async (n) => { await ev(() => { __cd.P.hp = 100; document.getElementById('tip').style.opacity = 0; document.getElementById('banner').style.opacity = 0; }); await page.waitForTimeout(500); await page.screenshot({ path: path.join(dir, n) }); };
  await ev(() => { __cd.forceFallback(); document.getElementById('startBtn').click(); });
  await ev(() => { __cd.startLevel(4, false); __cd.setPlaying(); __cd.hold(); __cd.sim(0.3); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; });
  await shot('v3-mam-start.png');
  await ev(() => { const P = __cd.P; P.x = 14; P.z = 2; P.yaw = -0.9; P.pitch = 0.05; __cd.sim(0.1); });
  await shot('v3-mam-shore.png');
  await ev(() => { const P = __cd.P; P.x = -22; P.z = -8; P.yaw = 0.3; P.pitch = 0.08; __cd.sim(0.1); });
  await shot('v3-mam-rathas.png');
  await ev(() => { const P = __cd.P; P.x = -4; P.z = -38; P.yaw = 0; P.pitch = 0.2; __cd.sim(0.1); });
  await shot('v3-mam-relief.png');
  // throwable viewmodels
  await ev(() => { const P = __cd.P; P.x = 0; P.z = 30; P.yaw = 0; P.pitch = 0; __cd.equip('molotov', true); __cd.sim(0.6); });
  await shot('v3-vm-molotov.png');
  await ev(() => { __cd.equip('urundai', true); __cd.sim(0.6); });
  await shot('v3-vm-urundai.png');
  // molotov fire on a group
  await ev(() => { const P = __cd.P; __cd.equip('molotov', true); __cd.sim(0.5); for (let i = 0; i < 4; i++) { const z = __cd.newZombie('pinam', P.x - 1.5 + i, P.z - 10 - (i % 2)); z.stagger = 99; } P.pitch = -0.05; __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(1.2, () => { P.hp = 100; }); });
  await shot('v3-molotov-fire.png');
  // urundai explosion
  await ev(() => { const P = __cd.P; __cd.sim(8, () => { P.hp = 100; }); __cd.zombies.length = 0; for (let i = 0; i < 4; i++) { const z = __cd.newZombie(i % 2 ? 'pinam' : 'odi', P.x - 2 + i * 1.3, P.z - 12); z.stagger = 99; } __cd.equip('urundai', true); __cd.inv.urundai = 2; __cd.sim(0.5); P.pitch = -0.02; __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(0.62, () => { P.hp = 100; }); });
  await shot('v3-urundai-blast.png');
  await ev(() => { __cd.sim(1.4, () => { __cd.P.hp = 100; }); });
  await shot('v3-urundai-after.png');
  // gore: headshots with the rifle at close range
  await ev(() => { const P = __cd.P; __cd.sim(6, () => { P.hp = 100; }); __cd.zombies.length = 0; P.x = 0; P.z = 20; P.yaw = 0;
    const zs = [0, 1, 2].map(i => { const z = __cd.newZombie('pinam', P.x - 2 + i * 2, P.z - 6); z.stagger = 99; return z; });
    __cd.sim(0.2); zs.forEach((z, i) => { for (let k = 0; k < 2; k++) __cd.hurtZombie(z, 30, { dir: new THREE.Vector3(0, 0, -1), kx: 0, kz: -1 }); __cd.hurtZombie(z, 200, { head: i !== 1, dir: new THREE.Vector3(0, 0, -1) }); });
    __cd.sim(0.5, () => { P.hp = 100; }); __cd.equip('rifle', true); P.pitch = -0.2; __cd.sim(0.6); });
  await shot('v3-gore.png');
  await ev(() => { __cd.sim(2.2, () => { __cd.P.hp = 100; }); });
  await shot('v3-gore-pools.png');
  // boss phase 3 shockwave
  await ev(() => { const P = __cd.P; __cd.zombies.length = 0; __cd.spawnFromQueue('boss'); const b = __cd.zombies.find(z => z.boss); __cd.sim(3.5, () => { P.hp = 100; }); __cd.hurtZombie(b, b.maxHp * 0.7, {}); __cd.sim(0.8, () => { P.hp = 100; });
    __cd.zombies.filter(z => z.type === 'odi').forEach(z => { z.dead = true; z.removed = true; z.mesh.visible = false; });
    b.quakeCd = 0; b.slamCd = 99; b.chargeCd = 99; b.throwCd = 99; b.bs = 'walk'; P.x = b.x + Math.sin(b.face) * 12; P.z = b.z + Math.cos(b.face) * 12; P.yaw = Math.atan2(P.x - b.x, P.z - b.z); P.pitch = 0.05; __cd.sim(1.4, () => { P.hp = 100; }); });
  await shot('v3-boss-quake.png');
  console.log('ERRORS:\n' + (errors.slice(0, 20).join('\n') || 'none'));
  await browser.close();
})();
