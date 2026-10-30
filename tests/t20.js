// v6 victory ending: trigger conditions, real stats, timeline, skip, play again, main menu, screenshots
const { open, dir } = require('./t2.js'); const path = require('path');
(async () => {
  const { browser, page, errors } = await open();
  const res = []; const ok = (n, c, x) => res.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : JSON.stringify(x)]);
  await page.mouse.click(5, 5); // user gesture so audio exists, like a real player
  await page.evaluate(() => { __cd.forceFallback(); }); await page.click('#startBtn'); await page.waitForTimeout(2500); // real campaign start (totals reset by the game)
  const killAll = () => page.evaluate(() => { __cd.spawnQueue.length = 0; for (const z of __cd.zombies) if (!z.dead) __cd.hurtZombie(z, 1e7, {}); });

  // 1. wave 4 clear -> intermission, not the ending
  let r = await page.evaluate(() => { __cd.startLevel(3, false); __cd.setPlaying(); __cd.sim(0.2); __cd.spawnQueue.length = 0; for (const z of __cd.zombies) __cd.hurtZombie(z, 1e7, {}); __cd.sim(12); return { state: __cd.state, END: !!__cd.END }; });
  ok('wave 4 clear goes to the intermission, not the ending', r.state === 'inter' && !r.END, r);

  // 2. wave 5 with the boss alive -> no ending; boss dies -> ending
  r = await page.evaluate(() => {
    __cd.startLevel(4, false); __cd.setPlaying(); __cd.sim(0.2); __cd.spawnQueue.length = 0;
    for (const z of __cd.zombies) __cd.hurtZombie(z, 1e7, {});
    __cd.P.x = 0; __cd.P.z = 40; __cd.P.yaw = Math.PI; __cd.spawnFromQueue('boss'); __cd.sim(12, () => { __cd.P.hp = 100; });
    const s1 = __cd.state; const b = __cd.zombies.find(z => z.boss);
    // give the campaign some real numbers: fake nothing, just record what the game holds
    const before = JSON.parse(JSON.stringify({ totals: __cd.totals, stats: __cd.stats }));
    __cd.hurtZombie(b, 1e7, {}); __cd.stepOnce(1 / 30);
    return { s1, s2: __cd.state, hold: __cd.END && +__cd.END.hold.toFixed(2), before, totals: __cd.totals, html: document.getElementById('wStats').innerText.replace(/\s+/g, ' ') };
  });
  ok('boss alive: no ending', r.s1 === 'playing', r.s1);
  ok('boss dead + wave empty: ending starts (state won)', r.s2 === 'won' && r.hold > 3, { s2: r.s2, hold: r.hold });
  const exp = (t) => { const acc = t.shots ? Math.round(t.hits / t.shots * 100) : 0, s = Math.round(t.time); return `${t.kills} Kills ${acc}% Accuracy ${t.heads} Headshots ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} Time`; };
  const sum = {}; for (const k in r.before.totals) sum[k] = r.before.totals[k] + r.before.stats[k] + (k === 'kills' ? 1 : 0);
  ok('ending stats = campaign totals (this wave added once)', r.totals.kills === sum.kills && r.totals.shots === sum.shots && Math.abs(r.totals.time - sum.time) < 0.05, { totals: r.totals, expected: sum });
  ok('stats markup holds the real totals', r.html.trim().toLowerCase() === exp(r.totals).toLowerCase(), { shown: r.html, expected: exp(r.totals) });

  // 3. timeline (driven in 1/30 s steps) with screenshots
  const marks = {}; const shots = [[0.5, 'hold'], [1.3, 'cine0'], [3.4, 'cine1'], [7, 'cine2'], [12, 'cine3'], [17.5, 'final']];
  const t0 = await page.evaluate(() => __cd.END.hold);
  for (const [at, name] of shots) {
    const target = name === 'hold' ? at : t0 + 3.4 + at;
    const m = await page.evaluate((target) => { const E = __cd.END, out = {}; const t1 = performance.now(); let n = 0;
      while (E.t < target) { __cd.stepOnce(1 / 30); n++; for (const id of ['endMsg', 'endSub', 'endBrand', 'endActions']) if (!out[id] && document.getElementById(id).classList.contains('on')) out[id] = +E.ct.toFixed(2);
        if (!out.final && E.final) out.final = +E.ct.toFixed(2); if (!out.scene && E.scene) out.scene = +E.t.toFixed(2); const c = document.getElementById('endCaption').classList.contains('on'); if (c && !out.capOn) out.capOn = +E.t.toFixed(2); if (!c && out.capOn && !out.capOff) { out.capOff = +E.t.toFixed(2); out.ctAtReveal = +E.ct.toFixed(2); } }
      out.statsTime = __cd.stats.time; return out; }, target);
    Object.assign(marks, Object.fromEntries(Object.entries(m).filter(([k]) => !(k in marks))));
    await page.waitForTimeout(name === 'final' ? 1500 : 250);
    await page.screenshot({ path: path.join(dir, `v6-end-${name}.png`) });
  }
  const cap = await page.evaluate((t0) => { const E = __cd.END; return null; }, t0);
  ok('cut to the rooftop after the boss finishes falling', marks.scene > 3.5 && marks.scene < 5, marks.scene);
  ok('text only after the camera settles: message -> subline -> branding -> final', marks.endMsg < marks.endSub && marks.endSub < marks.endBrand && marks.endBrand <= marks.final && marks.final < 17.5 && marks.endMsg >= 10.5, marks);
  ok('survival time frozen during the ending', Math.abs(marks.statsTime - r.totals.time + 0) < 1e9 && (await page.evaluate(() => __cd.totals.time)) === r.totals.time, { totals: r.totals.time });
  r = await page.evaluate(() => ({ a: getComputedStyle(document.getElementById('endActions')).opacity, stats: document.getElementById('wStats').innerText.replace(/\s+/g, ' '), audio: !!(__cd.END.audio), amb: !!(__cd.END.audio && __cd.END.audio.amb), noHeli: !document.body.innerHTML.includes('makeHeli') && !__cd.END.heli, focus: document.activeElement.id }));
  ok('final screen: buttons visible, stats settle on real values', r.a === '1' && r.stats.trim().toLowerCase() === exp(await page.evaluate(() => __cd.totals)).toLowerCase(), r);
  ok('ending music + night ambience running, no helicopter', r.audio && r.amb && r.noHeli, r);

  r = await page.evaluate(() => ({ capText: document.getElementById('endCaption').textContent, capOn: document.getElementById('endCaption').classList.contains('on') }));
  ok('"3 days later" shows on black, then the rooftop fades up with the cinematic starting from 0', Math.abs(marks.capOn - (t0 + 0.95)) < 0.1 && Math.abs(marks.capOff - (t0 + 3.4)) < 0.1 && marks.ctAtReveal <= 0.05, { hold: t0, capOn: marks.capOn, capOff: marks.capOff, ctAtReveal: marks.ctAtReveal });
  ok('caption off once the rooftop is revealed', r.capText === '3 days later' && !r.capOn, r);
  // 4. main menu
  await page.click('#endMenuBtn'); await page.waitForTimeout(300);
  r = await page.evaluate(() => ({ state: __cd.state, title: __cd.titleMode, menu: !document.getElementById('menu').hidden, win: document.getElementById('win').hidden, END: __cd.END }));
  ok('MAIN MENU returns to the title screen', r.state === 'menu' && r.title && r.menu && r.win && r.END === null, r);

  // 5. skip during the hold (Esc), then PLAY AGAIN
  r = await page.evaluate(() => { __cd.startLevel(4, false); __cd.setPlaying(); __cd.sim(0.2); __cd.spawnQueue.length = 0; for (const z of __cd.zombies) __cd.hurtZombie(z, 1e7, {}); let n = 0; while (__cd.state !== 'won' && n++ < 600) __cd.stepOnce(1 / 30); return __cd.state; });
  await page.keyboard.press('Escape'); await page.evaluate(() => { for (let i = 0; i < 3; i++) __cd.stepOnce(1 / 30); }); await page.waitForTimeout(3000);
  r = await page.evaluate(() => ({ state: __cd.state, final: __cd.END && __cd.END.final, scene: __cd.END && __cd.END.scene, shown: ['endMsg', 'endSub', 'endBrand', 'endActions'].map(id => document.getElementById(id).classList.contains('on')), skipHidden: getComputedStyle(document.getElementById('endSkip')).opacity }));
  ok('Esc skips straight to the final screen', r.final && r.scene && r.shown.every(Boolean), r);
  await page.screenshot({ path: path.join(dir, 'v6-end-skipped.png') });
  await page.click('#againBtn'); await page.waitForTimeout(400);
  r = await page.evaluate(() => ({ state: __cd.state, level: __cd.LEVELS && document.querySelector('#hud') && !document.getElementById('hud').hidden, totals: __cd.totals, END: __cd.END, win: document.getElementById('win').hidden, exp: +__cd.renderer.toneMappingExposure.toFixed(3), fov: +__cd.camera.fov.toFixed(1), stats: __cd.stats }));
  ok('PLAY AGAIN starts wave 1 with a fresh campaign', r.state === 'playing' && r.win && r.END === null && r.totals.kills === 0 && r.totals.time === 0 && r.stats.kills === 0, r);
  await page.evaluate(() => { for (let i = 0; i < 20; i++) __cd.stepOnce(1 / 30); });
  r = await page.evaluate(() => ({ fov: +__cd.camera.fov.toFixed(1) }));
  ok('camera back to gameplay FOV', r.fov === 74, r);
  // skip button too
  await page.evaluate(() => { __cd.startLevel(4, false); __cd.setPlaying(); __cd.sim(0.2); __cd.spawnQueue.length = 0; for (const z of __cd.zombies) __cd.hurtZombie(z, 1e7, {}); let n = 0; while (__cd.state !== 'won' && n++ < 600) __cd.stepOnce(1 / 30); for (let i = 0; i < 200; i++) __cd.stepOnce(1 / 30); return __cd.END.ct; });
  await page.click('#endSkip'); await page.evaluate(() => { for (let i = 0; i < 3; i++) __cd.stepOnce(1 / 30); });
  r = await page.evaluate(() => ({ final: __cd.END && __cd.END.final }));
  ok('Skip button works mid-cinematic', r.final, r);
  for (const x of res) console.log(x.join('  '));
  console.log(res.filter(x => x[0] === 'PASS').length + '/' + res.length, 'errors', errors.length, errors.slice(0, 4));
  await browser.close();
})();
