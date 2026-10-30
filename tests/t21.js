// v7 mouse-look test in a REAL (headed) Chromium window on a virtual X display, with real OS-level relative mouse motion (XTest).
// run: xvfb-run -s "-screen 0 1280x800x24" node t21.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const { execFileSync } = require('child_process');
const dir = __dirname; const X = (...a) => execFileSync('python3', [path.join(dir, 'xinput.py'), ...a.map(String)]);
(async () => {
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.join(dir, process.env.GAME || 'chennai-dead.html'), 'utf8') + '</body></html>';
  const three = fs.readFileSync(path.join(dir, 'node_modules/three/build/three.min.js'), 'utf8');
  const browser = await chromium.launch({ headless: false, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-position=0,0', '--window-size=800,520'] });
  const page = await browser.newPage({ viewport: null }); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u.includes('three.min.js')) return r.fulfill({ body: three, contentType: 'application/javascript' }); if (u.startsWith('http://test.local')) return r.fulfill({ body: html, contentType: 'text/html' }); return r.abort(); });
  await page.goto('http://test.local/'); await page.waitForFunction(() => window.__cd && __cd.renderer.info.render.frame > 2, null, { timeout: 240000 }); page.setDefaultTimeout(240000);
  await page.bringToFront();
  // real click on START CAMPAIGN through the X server
  const bb = await page.locator('#startBtn').boundingBox(); const off = await page.evaluate(() => [window.screenX + (window.outerWidth - window.innerWidth) / 2, window.screenY + window.outerHeight - window.innerHeight]);
  X('abs', Math.round(off[0] + bb.x + bb.width / 2), Math.round(off[1] + bb.y + bb.height / 2)); await page.waitForTimeout(200); X('click');
  await page.waitForFunction(() => __cd.state === 'playing', null, { timeout: 120000 }); await page.waitForTimeout(1500);
  const lockInfo = await page.evaluate(() => ({ locked: document.pointerLockElement === document.querySelector('canvas'), fallback: __cd.fallbackLook, raw: __cd.rawMouse }));
  console.log('after START:', JSON.stringify(lockInfo));
  await page.evaluate(() => { __cd.hold(); __cd.spawnQueue.length = 0; for (const z of __cd.zombies) z.dead = true; setInterval(() => { __cd.P.hp = 100; }, 50);
    window.__rec = { ev: [], fr: [] }; addEventListener('mousemove', e => { if (document.pointerLockElement) __rec.ev.push([performance.now(), e.movementX, e.movementY]); }, true);
    const up = new THREE.Vector3(); const rf = () => { const c = __cd.camera; up.set(0, 1, 0).applyQuaternion(c.quaternion); __rec.fr.push([performance.now(), __cd.P.yaw, __cd.P.pitch, up.y, __cd.state]); requestAnimationFrame(rf); }; rf(); });
  const res = [];
  const seg = async (name, dx, dy, n, ms, setup, teardown) => {
    if (setup) await page.evaluate(setup);
    const s0 = await page.evaluate(() => ({ e: __rec.ev.length, f: __rec.fr.length, yaw: __cd.P.yaw, pitch: __cd.P.pitch }));
    X('rel', dx, dy, n, ms); await page.waitForTimeout(3000);
    if (teardown) await page.evaluate(teardown);
    const r = await page.evaluate(([s0, dx]) => { const ev = __rec.ev.slice(s0.e), fr = __rec.fr.slice(s0.f);
      const sum = ev.reduce((a, e) => a + e[1], 0), maxAbs = Math.max(0, ...ev.map(e => Math.abs(e[1]))), wrongSign = ev.filter(e => dx && Math.sign(e[1]) === -Math.sign(dx)).length, wrongVals = ev.filter(e => dx && Math.sign(e[1]) === -Math.sign(dx)).map(e => e[1]).slice(0, 4);
      let back = 0, stall = 0; for (let i = 1; i < fr.length; i++) { const d = fr[i][1] - fr[i - 1][1]; const evIn = ev.filter(e => e[0] > fr[i - 1][0] && e[0] <= fr[i][0]).length;
        if (dx && d * Math.sign(-dx) < -1e-9) back++; if (evIn > 0 && dx && Math.abs(d) < 1e-9) stall++; }
      const minUp = Math.min(...fr.map(f => f[3])), maxPitch = Math.max(...fr.map(f => Math.abs(f[2])));
      return { events: ev.length, sentPx: null, gotPx: sum, maxEventPx: maxAbs, wrongSignEvents: wrongSign, wrongVals, yawTurns: +((__cd.P.yaw - s0.yaw) / (2 * Math.PI)).toFixed(2), framesBackwards: back, framesStalled: stall, frames: fr.length, minCameraUpY: +minUp.toFixed(3), maxPitch: +maxPitch.toFixed(3), state: __cd.state, locked: !!document.pointerLockElement }; }, [s0, dx]);
    r.sentPx = dx * n; r.name = name; res.push(r); console.log(JSON.stringify(r));
  };
  await seg('slow right', 3, 0, 500, 4);
  await seg('fast right (x4 turns)', 45, 0, 260, 4);
  await seg('fast left', -45, 0, 260, 4);
  await seg('slow left', -3, 0, 500, 4);
  await seg('sprint diagonal + turn', 30, 0, 300, 4, () => { Object.assign(__cd.keys, { KeyW: true, KeyD: true, ShiftLeft: true }); }, () => { for (const k in __cd.keys) __cd.keys[k] = false; });
  await seg('pistol firing + turn', 25, 0, 300, 4, () => { __cd.equip('pistol'); __cd.inv.pistol.res = 999; __cd.fire(true); }, () => __cd.fire(false));
  await seg('rifle auto-fire + turn', -25, 0, 300, 4, () => { __cd.equip('rifle'); __cd.inv.rifle.res = 999; __cd.fire(true); }, () => __cd.fire(false));
  await seg('rifle ADS + turn', 20, 0, 300, 4, () => { __cd.aim(true); }, () => __cd.aim(false));
  await seg('look up past the limit', 0, -40, 200, 4);
  await seg('look down past the limit', 0, 40, 400, 4);
  // pointer lock exit (real Esc) and reacquire (real click on Resume)
  X('key', 'Escape'); await page.waitForTimeout(1500);
  let p1 = await page.evaluate(() => ({ state: __cd.state, locked: !!document.pointerLockElement }));
  if (p1.state !== 'paused') { console.log('real Esc did not release the lock here:', JSON.stringify(p1), '- releasing via exitPointerLock()'); await page.evaluate(() => document.exitPointerLock()); await page.waitForTimeout(1500); p1 = await page.evaluate(() => ({ state: __cd.state, locked: !!document.pointerLockElement })); }
  const rb = await page.locator('#resumeBtn').boundingBox(); X('abs', Math.round(off[0] + rb.x + rb.width / 2), Math.round(off[1] + rb.y + rb.height / 2)); await page.waitForTimeout(200); X('click'); await page.waitForTimeout(1500);
  const p2 = await page.evaluate(() => ({ state: __cd.state, locked: !!document.pointerLockElement, raw: __cd.rawMouse }));
  console.log('Esc ->', JSON.stringify(p1), ' Resume ->', JSON.stringify(p2));
  await seg('after re-lock: fast right', 45, 0, 200, 4);
  console.log('errors', errors.length, errors.slice(0, 3));
  await browser.close();
})();
