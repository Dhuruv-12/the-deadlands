// v5 boss finale check: wave 4 (mini) and wave 5 (full) deaths - beats fire in order, particle budget, logic cost, screenshots
const { open, dir } = require('./t2.js');
const path = require('path');
(async () => {
  const { browser, page, errors } = await open();
  const all = {};
  for (const lvl of [3, 4]) {
    await page.evaluate((lvl) => {
      const P = __cd.P; __cd.forceFallback(); __cd.startLevel(lvl, false); __cd.setPlaying(); __cd.hold(); __cd.sim(0.2);
      __cd.zombies.length = 0; __cd.spawnQueue.length = 0;
      P.x = 0; P.z = 40; P.y = 0; P.yaw = Math.PI; __cd.spawnFromQueue('boss'); const b = __cd.zombies.find(z => z.boss && !z.dead);
      __cd.sim(3.6, () => { P.hp = 100; });
      b.x = 0; b.z = 24; b.mesh.position.set(0, 0, 24); b.bs = 'walk'; b.st = 0; b.slamCd = b.chargeCd = b.throwCd = b.quakeCd = 99;
      P.x = 0; P.z = 37; P.yaw = 0; P.pitch = 0.08; b.face = Math.PI;
      for (const k in __cd.keys) __cd.keys[k] = false;
      window._b = b; window._log = { beats: [], peakParts: 0, peakDecals: 0, maxStepMs: 0, tier: b.tier, hpAtDeath: b.maxHp, speed: b.speed };
      b.hp = 5; __cd.hurtZombie(b, 40, { dir: { x: 0, y: 0, z: -1 } });
      window._t = 0;
    }, lvl);
    const shots = [0.12, 0.95, 1.75, 3.1, 3.7];
    let si = 0;
    while (true) {
      const st = await page.evaluate((until) => {
        const b = window._b, L = window._log;
        while (b.st < until && !b.removed) {
          const before = new Set(Object.keys(b.dfx || {}).filter(k => (b.dfx || {})[k] === true));
          const t0 = performance.now(); __cd.stepOnce(1 / 30); const ms = performance.now() - t0; __cd.P.hp = 100;
          L.maxStepMs = Math.max(L.maxStepMs, ms);
          for (const k of Object.keys(b.dfx || {})) if (b.dfx[k] === true && !before.has(k)) L.beats.push(k + '@' + b.st.toFixed(2));
          L.peakParts = Math.max(L.peakParts, __cd.partsLive()); L.peakDecals = Math.max(L.peakDecals, __cd.decalsLive());
        }
        return { st: b.st, removed: b.removed };
      }, si < shots.length ? shots[si] : 10.6);
      if (si < shots.length) { await page.screenshot({ path: path.join(dir, `v5-boss${lvl + 1}-${si}.png`) }); si++; }
      else break;
    }
    all['wave' + (lvl + 1)] = await page.evaluate(() => { const b = window._b, L = window._log; L.beatsFired = Object.keys(b.dfx).filter(k => b.dfx[k] === true); L.sacsPopped = b.rig.sacs.filter(s => !s.visible).length; L.removed = b.removed; L.state = __cd.state; L.maxStepMs = +L.maxStepMs.toFixed(1); return L; });
  }
  console.log(JSON.stringify(all, null, 1));
  console.log('errors', errors.length, errors.slice(0, 3));
  await browser.close();
})();
