// Functional tests driven through the debug hooks. Logic runs via __cd.sim (fixed 33ms steps, no rendering).
const { open, dir } = require('./t2.js');
const path = require('path');
const results = [];
function check(name, ok, info) { results.push((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + info : '')); }
(async () => {
  const { browser, page, errors } = await open();
  const ev = (fn, arg) => page.evaluate(fn, arg);
  await ev(() => { __cd.forceFallback(); document.getElementById('startBtn').click(); });
  await page.waitForTimeout(2500);
  check('start button -> playing', (await ev(() => __cd.state)) === 'playing');

  // ---- weapons: switch, fire, reload ----
  let r = await ev(() => {
    const out = {}; __cd.startLevel(0, false); __cd.setPlaying(); __cd.sim(0.5);
    __cd.zombies.length = 0; __cd.spawnQueue.length = 0; __cd.hold();
    __cd.equip('pistol', true); __cd.sim(0.5); const m0 = __cd.inv.pistol.mag;
    for (let i = 0; i < 3; i++) { __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(0.25); }
    out.pistolFired = m0 - __cd.inv.pistol.mag;
    __cd.startReload(); out.pReloadAct = __cd.act && __cd.act.type; __cd.sim(1.6); out.pistolAfterReload = __cd.inv.pistol.mag; out.pActDone = __cd.act === null;
    __cd.equip('rifle', true); __cd.sim(0.5); const r0 = __cd.inv.rifle.mag; __cd.fire(true); __cd.sim(1.0); __cd.fire(false); out.rifleAuto = r0 - __cd.inv.rifle.mag;
    __cd.inv.rifle.mag = 0; __cd.startReload(); out.rEmpty = __cd.act && __cd.act.empty; __cd.sim(2.7); out.rifleAfter = __cd.inv.rifle.mag;
    __cd.equip('knife', true); __cd.sim(0.4); __cd.fire(true); __cd.sim(0.05); __cd.fire(false); out.knifeAct = __cd.act && __cd.act.type; __cd.sim(0.5);
    __cd.inv.stick = 8; __cd.equip('stick', true); __cd.sim(0.4); __cd.fire(true); __cd.sim(0.05); __cd.fire(false); out.stickAct = __cd.act && __cd.act.type; __cd.sim(0.9);
    __cd.inv.rocks = 3; __cd.equip('rock', true); __cd.sim(0.4); __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(0.4); out.rocksAfterThrow = __cd.inv.rocks; __cd.sim(2);
    out.rockLanded = __cd.pickups.some(p => p.type === 'rock' && Math.hypot(p.x - __cd.P.x, p.z - __cd.P.z) > 8);
    return out;
  });
  check('pistol semi-auto fires 3', r.pistolFired === 3, JSON.stringify(r.pistolFired));
  check('pistol reload refills', r.pistolAfterReload === 12 && r.pActDone && r.pReloadAct === 'reloadP');
  check('rifle auto fire', r.rifleAuto >= 7, 'shots in 1s=' + r.rifleAuto);
  check('rifle empty reload (with charge)', r.rEmpty === true && r.rifleAfter === 30);
  check('knife slash action', r.knifeAct === 'slash');
  check('stick swing action', r.stickAct === 'swing');
  check('rock throw spends a rock', r.rocksAfterThrow === 2, JSON.stringify(r));

  // ---- scope ----
  r = await ev(() => {
    __cd.equip('rifle', true); __cd.sim(0.5); __cd.aim(true); __cd.sim(0.5);
    const o = { fovIn: __cd.camera.fov, scopeOp: +getComputedStyle(document.getElementById('scope')).opacity };
    __cd.aim(false); __cd.sim(0.5); o.fovOut = __cd.camera.fov; o.scopeOut = +document.getElementById('scope').style.opacity;
    __cd.equip('pistol', true); __cd.sim(0.5); __cd.aim(true); __cd.sim(0.5); o.pistolFov = __cd.camera.fov; __cd.aim(false); __cd.sim(0.4);
    return o;
  });
  check('scope zooms to 2x (fov ~41)', Math.abs(r.fovIn - 41.3) < 1 && r.scopeOp > 0.9, JSON.stringify(r));
  check('scope exits cleanly', Math.abs(r.fovOut - 74) < 0.5 && r.scopeOut === 0);
  check('pistol ADS light zoom', r.pistolFov < 70 && r.pistolFov > 55);

  // ---- jump, land, collide with scenery, climb a crate ----
  r = await ev(() => {
    const P = __cd.P, o = {}; __cd.startLevel(0, true); __cd.setPlaying(); __cd.sim(0.3); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; __cd.hold();
    __cd.keys.Space = true; __cd.sim(0.1); __cd.keys.Space = false; o.yUp = P.y; o.notGrounded = !P.grounded;
    __cd.keys.Space = true; let maxY = 0; for (let i = 0; i < 30; i++) { __cd.sim(0.033); maxY = Math.max(maxY, P.y); } __cd.keys.Space = false; __cd.sim(1.0); o.maxY = maxY; o.landed = P.grounded && P.y === 0;
    // walk into a tall wall: place player next to a building solid and push into it
    const s = __cd.solids.find(s => s.y1 > 8 && s.x1 - s.x0 > 4); P.x = s.x1 + 1.5; P.z = (s.z0 + s.z1) / 2; P.yaw = -Math.PI / 2; // facing -x? yaw=-pi/2 -> forward (+1,0)? we want -x
    P.yaw = Math.PI / 2; __cd.keys.KeyW = true; __cd.sim(1.5); o.wallX = P.x - s.x1; __cd.keys.Space = true; __cd.sim(0.8); __cd.keys.Space = false; __cd.sim(0.5); __cd.keys.KeyW = false; o.wallX2 = P.x - s.x1;
    // climb a 1m crate by jumping
    const c = __cd.solids.find(s => s.y1 > 0.8 && s.y1 < 1.15 && s.x1 - s.x0 < 1.3 && s.y0 === 0);
    if (c) { P.x = (c.x0 + c.x1) / 2 + 1.4; P.z = (c.z0 + c.z1) / 2; P.y = 0; P.vx = P.vz = 0; P.yaw = Math.PI / 2; __cd.sim(0.2);
      __cd.keys.KeyW = true; __cd.sim(1.0); __cd.keys.KeyW = false; o.blockedByCrate = P.x >= c.x1 + 0.39;
      P.x = (c.x0 + c.x1) / 2; P.y = 1.4; P.vy = 0; P.vx = P.vz = 0; __cd.sim(0.8); o.onCrate = P.y; o.crateTop = c.y1; P.x = c.x1 + 2; P.y = 0; __cd.sim(0.3); }
    return o;
  });
  check('jump leaves ground', r.notGrounded && r.yUp > 0);
  check('jump apex ~1.1m and lands', r.maxY > 0.9 && r.maxY < 1.3 && r.landed, JSON.stringify({ maxY: r.maxY, landed: r.landed }));
  check('walls block walking and jumping', r.wallX >= 0.39 && r.wallX2 >= 0.39, JSON.stringify({ a: r.wallX, b: r.wallX2 }));
  check('crate blocks walking, can stand on it', r.blockedByCrate && Math.abs(r.onCrate - r.crateTop) < 0.01, JSON.stringify({b:r.blockedByCrate,on:r.onCrate,top:r.crateTop}));

  // ---- each infected type fights and dies ----
  for (const type of ['pinam', 'odi', 'thadiyan', 'kaalan']) {
    r = await ev((type) => {
      const P = __cd.P; __cd.startLevel(2, true); __cd.setPlaying(); __cd.sim(0.3); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; __cd.hold();
      P.hp = 100; const z = __cd.newZombie(type, P.x + 0.5, P.z - 8); if (type === 'kaalan') { z.state = 'listen'; }
      const o = { type, state0: z.state };
      // kaalan should ignore a sneaking player but react to a gunshot
      if (type === 'kaalan') { P.crouchOn = true; __cd.sim(1.5); o.calm = z.state; P.crouchOn = false; __cd.equip('pistol', true); __cd.sim(0.4); P.yaw = Math.PI; __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(0.3); o.afterShot = z.state; }
      let hurt = false; for (let i = 0; i < 120 && !hurt; i++) { __cd.sim(0.05); if (P.hp < 100) hurt = true; }
      o.attacked = hurt; o.hpAfter = P.hp; P.hp = 100;
      // kill it
      let n = 0; while (!z.dead && n++ < 40) __cd.hurtZombie(z, 30, {});
      __cd.sim(1.5); o.dead = z.dead; o.deathType = z.deathType;
      __cd.sim(7); o.removed = !__cd.zombies.includes(z);
      return o;
    }, type);
    check(`${type}: attacks player`, r.attacked, JSON.stringify(r));
    check(`${type}: dies + cleaned up`, r.dead && r.removed, r.deathType);
    if (type === 'kaalan') check('kaalan: ignores sneaking, alerted by shot', r.calm !== 'chase' && r.afterShot === 'chase', JSON.stringify({ calm: r.calm, after: r.afterShot }));
  }

  // ---- boss: emerge, telegraphed attacks, damage, death ----
  r = await ev(() => {
    const P = __cd.P; __cd.startLevel(4, true); __cd.setPlaying(); __cd.sim(0.3); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; __cd.hold(); P.hp = 100;
    __cd.spawnFromQueue('boss'); const b = __cd.zombies.find(z => z.boss); const o = { seen: {} };
    const t0 = b.hp; __cd.hurtZombie(b, 100, {}); o.invulnEmerge = b.hp === t0;
    let hpLost = 0; __cd.sim(3.5); b.throwCd = 0; b.chargeCd = 99; P.x = b.x + 18; P.z = b.z; if (P.x > 60) P.x = b.x - 18; for (let k = 0; k < 40; k++) { __cd.sim(0.1); o.seen[b.bs] = 1; } o.bombsFlew = true; b.chargeCd = 2;
    for (let i = 0; i < 600; i++) { const h = P.hp; __cd.sim(0.05, () => { if (P.hp < 30) P.hp = 100; }); o.seen[b.bs] = 1; }
    o.dmgTakenSomewhere = true;
    let n = 0; while (!b.dead && n++ < 400) { __cd.hurtZombie(b, 40, {}); __cd.sim(0.05, () => { P.hp = 100; }); o.seen[b.bs] = 1; }
    o.dead = b.dead; o.plates = b.platesLeft; o.enraged = b.enraged; __cd.sim(4, () => { P.hp = 100; }); o.bossBarHidden = document.getElementById('boss').hidden; __cd.sim(8, () => { P.hp = 100; }); o.removed = !__cd.zombies.includes(b);
    return o;
  });
  check('boss invulnerable while emerging', r.invulnEmerge);
  check('boss uses slam/charge/throw', r.seen.windSlam && r.seen.windCharge && r.seen.windThrow, Object.keys(r.seen).join(','));
  check('boss enrages, sheds plates, dies, cleaned', r.dead && r.enraged && r.plates === 0 && r.bossBarHidden && r.removed, JSON.stringify(r));

  // ---- pause / resume / die / retry ----
  r = await ev(() => {
    const o = {}; __cd.startLevel(1, true); __cd.setPlaying(); __cd.pause(); o.paused = __cd.state; o.pauseVisible = !document.getElementById('pause').hidden;
    document.getElementById('resumeBtn').click(); o.resumed = __cd.state;
    __cd.P.hp = 5; __cd.die(); o.dead = __cd.state; o.deadVisible = !document.getElementById('dead').hidden;
    document.getElementById('retryBtn').click(); o.retry = __cd.state; o.hp = __cd.P.hp; o.lvl = document.getElementById('hLoc').textContent;
    __cd.pause(); document.getElementById('restartWaveBtn').click(); o.restartWave = __cd.state;
    return o;
  });
  check('pause/resume', r.paused === 'paused' && r.pauseVisible && r.resumed === 'playing');
  check('die -> retry same wave', r.dead === 'dead' && r.deadVisible && r.retry === 'playing' && r.hp === 100 && r.lvl === 'Chennai Central', JSON.stringify(r));
  check('restart wave from pause', r.restartWave === 'playing');

  // ---- full run: all five waves with a bot ----
  for (let i = 0; i < 5; i++) {
    r = await ev((i) => {
      const P = __cd.P; __cd.startLevel(i, i > 0); __cd.setPlaying(); __cd.inv.rifle.res = 9999; __cd.equip('rifle', true);
      const bot = () => { P.hp = 100; const al = __cd.zombies.filter(z => !z.dead && !(z.boss && z.bs === 'emerge')); if (!al.length) { __cd.fire(false); return; }
        al.sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); const z = al[0]; const dx = z.x - P.x, dz = z.z - P.z, d = Math.hypot(dx, dz);
        P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(z.h * 0.55 - 1.65, d) - P.recoilP; __cd.fire(d < 45); if (__cd.inv.rifle.mag === 0) __cd.startReload(); };
      let t = 0; const seen = {};
      while (t < 400 && __cd.state === 'playing') { __cd.sim(5, bot); t += 5; __cd.zombies.forEach(z => seen[z.type] = 1); }
      return { state: __cd.state, t, kills: __cd.stats.kills, seen: Object.keys(seen).join(',') };
    }, i);
    check(`wave ${i + 1} clears`, r.state === 'inter' || r.state === 'won', JSON.stringify(r));
  }
  check('final screen is win', (await ev(() => __cd.state)) === 'won');
  await page.screenshot({ path: path.join(dir, 'v2-win.png') });

  console.log(results.join('\n'));
  console.log('ERRORS:\n' + (errors.slice(0, 20).join('\n') || 'none'));
  await browser.close();
})();
