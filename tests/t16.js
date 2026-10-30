// v5 jitter probe: sprint (straight + diagonal) while turning with uneven mouse delivery, pistol & rifle.
// Metric: mean |2nd difference| of the gun pose per frame (high-frequency shake), plus sprint on/off flips.
const { open } = require('./t2.js');
(async () => {
  const { browser, page, errors } = await open();
  await page.evaluate(() => { __cd.forceFallback(); __cd.startLevel(4, false); __cd.setPlaying(); __cd.hold(); });
  const res = await page.evaluate(() => {
    const out = {};
    const pattern = [1, 2, 1, 2, 0, 3, 1, 1, 2, 0]; // mouse events landing per frame (uneven, as real browsers deliver them)
    for (const gun of ['pistol', 'rifle']) for (const diag of [false, true]) for (const turn of [false, true]) for (const secs of [3, 7]) {
      __cd.equip(gun); __cd.P.x = 0; __cd.P.z = 0; __cd.P.stam = 100; __cd.P.vx = __cd.P.vz = 0;
      for (const k in __cd.keys) __cd.keys[k] = false;
      __cd.sim(0.6); // finish equip
      __cd.keys.KeyW = true; __cd.keys.ShiftLeft = true; if (diag) __cd.keys.KeyD = true;
      const poses = []; let flips = 0, last = null; const n = Math.round(secs * 60);
      for (let f = 0; f < n; f++) {
        if (turn) for (let e = 0; e < pattern[f % pattern.length]; e++) __cd.applyLook(9, (f % 40 < 20 ? 1 : -1));
        __cd.P.x = Math.max(-30, Math.min(30, __cd.P.x)); // stay in the open
        __cd.stepOnce(1 / 60);
        const sp = __cd.P.stam; const s = __cd.sprintNow; if (last !== null && s !== last) flips++; last = s;
        if (f > n - 120) poses.push(__cd.vmPose());
      }
      let j = 0; for (let i = 2; i < poses.length; i++) for (let c = 0; c < 6; c++) j += Math.abs(poses[i][c] - 2 * poses[i - 1][c] + poses[i - 2][c]) * (c < 3 ? 10 : 1);
      out[`${gun} ${diag ? 'diag' : 'fwd '} ${turn ? 'turn' : 'still'} ${secs}s`] = { jerk: +(j / (poses.length - 2) * 1000).toFixed(2), sprintFlips: flips, stam: +__cd.P.stam.toFixed(1) };
    }
    for (const k in __cd.keys) __cd.keys[k] = false;
    return out;
  });
  console.table(res);
  console.log('errors', errors.length, errors.slice(0, 3));
  await browser.close();
})();
