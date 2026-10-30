// v5 title menu keyboard navigation (keyboard only), mouse still works, no interference in gameplay
const { open, dir } = require('./t2.js'); const path = require('path');
(async () => {
  const { browser, page, errors } = await open();
  const res = []; const ok = (name, cond, extra) => { res.push([cond ? 'PASS' : 'FAIL', name, extra === undefined ? '' : JSON.stringify(extra)]); };
  const sel = () => page.evaluate(() => ({ i: __cd.menuSel, id: [...document.querySelectorAll('#menu .mbtn.sel')].map(b => b.id), modal: __cd.modalOpen, state: __cd.state }));
  const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(80); return sel(); };
  let s = await sel(); ok('starts on START CAMPAIGN, one highlighted', s.i === 0 && s.id.join() === 'startBtn', s);
  s = await key('ArrowDown'); ok('Down -> How to play', s.id.join() === 'howBtn', s);
  await page.screenshot({ path: path.join(dir, 'v5-menu-how.png') });
  s = await key('ArrowDown'); ok('Down -> Settings', s.id.join() === 'settingsBtn', s);
  s = await key('ArrowDown'); ok('Down wraps -> Start', s.id.join() === 'startBtn', s);
  s = await key('ArrowUp'); ok('Up wraps -> Settings', s.id.join() === 'settingsBtn', s);
  s = await key('Enter'); ok('Enter opens Settings', s.modal === 'settings' && !(await page.evaluate(() => document.getElementById('settings').hidden)), s);
  const before = await page.evaluate(() => __cd.SETTINGS.sens);
  s = await key('ArrowDown'); ok('arrows inside Settings do not move the title menu', s.id.join() === 'settingsBtn' && s.modal === 'settings', s);
  s = await key('Escape'); ok('Esc closes Settings, selection kept', s.modal === null && s.id.join() === 'settingsBtn' && await page.evaluate(() => document.getElementById('settings').hidden), s);
  s = await key('ArrowUp'); s = await key('Enter'); ok('Up + Enter opens How to play', s.modal === 'how', s);
  s = await key('Escape'); ok('Esc closes How to play', s.modal === null && s.id.join() === 'howBtn', s);
  // mouse
  const bb = await page.locator('#settingsBtn').boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(100);
  s = await sel(); ok('mouse hover moves the highlight (only one)', s.id.join() === 'settingsBtn', s);
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(100); s = await sel(); ok('mouse click opens Settings', s.modal === 'settings', s);
  await page.click('#setBack'); await page.waitForTimeout(100); s = await sel(); ok('Back button closes', s.modal === null, s);
  await page.mouse.move(5, 5);
  s = await key('ArrowDown'); ok('keyboard continues from hovered item (wraps to Start)', s.id.join() === 'startBtn', s);
  // start with Enter (single press should start exactly once)
  await page.evaluate(() => { __cd.forceFallback(); window._starts = 0; const o = __cd.startLevel; });
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  s = await sel(); ok('Enter on Start launches the campaign', s.state === 'playing', s);
  const g = await page.evaluate(async () => { const p0 = __cd.P.pitch, m0 = __cd.menuSel; return { p0, m0 }; });
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowUp');
  const g2 = await page.evaluate(() => ({ p: __cd.P.pitch, m: __cd.menuSel, state: __cd.state, modal: __cd.modalOpen }));
  ok('in-game ArrowUp still looks up and does not touch the menu', g2.p > g.p0 && g2.m === g.m0 && g2.state === 'playing', { before: g, after: g2 });
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  const g3 = await page.evaluate(() => ({ state: __cd.state, level: __cd.LEVELS && 0 }));
  ok('in-game Enter does nothing', g3.state === 'playing', g3);
  for (const r of res) console.log(r.join('  '));
  console.log(res.filter(r => r[0] === 'PASS').length + '/' + res.length, 'errors', errors.length, errors.slice(0, 3));
  await browser.close();
})();
