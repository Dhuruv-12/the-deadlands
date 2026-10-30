// v9: Aruval pickups/durability/damage, Kaalan melee resistance until shot
const { open, dir } = require('./t2.js'); const path = require('path');
(async () => {
  const { browser, page, errors } = await open();
  const res = []; const ok = (n, c, x) => res.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : JSON.stringify(x)]);
  await page.evaluate(() => { __cd.forceFallback(); }); await page.click('#startBtn'); await page.waitForTimeout(2500);
  // 1-2. spawn counts per wave
  const counts = await page.evaluate(() => { const o = {}; for (let i = 0; i < 5; i++) { __cd.startLevel(i, false); o['wave' + (i + 1)] = __cd.pickups.filter(p => p.type === 'aruval').map(p => [+p.x.toFixed(1), +p.z.toFixed(1)]); } return o; });
  ok('waves 1-3 have no aruval', ['wave1', 'wave2', 'wave3'].every(k => counts[k].length === 0), counts);
  ok('exactly 2 aruvals in wave 4', counts.wave4.length === 2, counts.wave4);
  ok('exactly 2 aruvals in wave 5', counts.wave5.length === 2, counts.wave5);
  // setup a quiet arena in wave 4
  const r1 = await page.evaluate(() => {
    const P = __cd.P, out = {};
    __cd.startLevel(3, false); __cd.setPlaying(); __cd.hold(); __cd.spawnQueue.length = 0; for (const z of __cd.zombies) z.dead = true; __cd.sim(0.1);
    const keepHp = () => { P.hp = 100; };
    // pick up: walk onto the first aruval
    const a = __cd.pickups.filter(p => p.type === 'aruval'); P.x = a[0].x; P.z = a[0].z; __cd.sim(0.2, keepHp);
    out.afterPickup = __cd.inv.aruval; out.left1 = __cd.pickups.filter(p => p.type === 'aruval').length;
    P.x = a[1].x; P.z = a[1].z; __cd.sim(0.2, keepHp); out.secondRefused = __cd.pickups.filter(p => p.type === 'aruval').length === 1 && __cd.inv.aruval === 2;
    // a clear test spot: zombies placed right in front, held in place
    P.x = a[1].x + 8; P.z = a[1].z; P.yaw = Math.PI / 2; P.pitch = 0; // facing -x
    const place = (z) => () => { z.x = P.x - 1.6; z.z = P.z; z.mesh.position.set(z.x, 0, z.z); keepHp(); };
    const swing = (w, z) => { __cd.equip(w, true); __cd.sim(0.5, place(z)); const h0 = z.hp; __cd.fire(true); __cd.sim(0.05, place(z)); __cd.fire(false); __cd.sim(1.0, place(z)); return { dmg: +(h0 - z.hp).toFixed(1), dead: z.dead }; };
    // damage per weapon on a tank (280 hp) so nothing dies early
    const dmg = {}; for (const w of ['knife', 'stick', 'aruval']) { if (w === 'stick') __cd.inv.stick = 8; const t = __cd.newZombie('thadiyan', P.x - 1.6, P.z); dmg[w] = swing(w, t); t.dead = true; t.mesh.visible = false; }
    out.dmg = dmg; out.usesAfter1 = __cd.inv.aruval;
    // one-hit kill on an ordinary infected
    const p1 = __cd.newZombie('pinam', P.x - 1.6, P.z); out.pinamKill = swing('aruval', p1); out.usesAfter2 = __cd.inv.aruval;
    out.hasAfter = __cd.inv.aruval > 0; const sw0 = __cd.stats.shots; __cd.fire(true); __cd.sim(0.1, keepHp); __cd.fire(false); out.swungBroken = __cd.stats.shots !== sw0; out.usesAfterExtra = __cd.inv.aruval;
    return out; });
  await page.waitForFunction(() => __cd.cur === 'knife', null, { timeout: 15000 }).catch(() => {}); // the 350 ms put-away timer runs on the page clock (slow software rendering here)
  const r2 = await page.evaluate(() => { const o = { curAfterBreak: __cd.cur }; __cd.equip('aruval', true); o.curAfterTryEquip = __cd.cur; return o; });
  const r = await page.evaluate((prev) => { const out = prev; const P = __cd.P; const keepHp = () => { P.hp = 100; };
    const place = (z) => () => { z.x = P.x - 1.6; z.z = P.z; z.mesh.position.set(z.x, 0, z.z); keepHp(); };
    const swing = (w, z) => { __cd.equip(w, true); __cd.sim(0.5, place(z)); const h0 = z.hp; __cd.fire(true); __cd.sim(0.05, place(z)); __cd.fire(false); __cd.sim(1.0, place(z)); return { dmg: +(h0 - z.hp).toFixed(1), dead: z.dead }; };
    // Kaalan resistance
    const k = __cd.newZombie('kaalan', P.x - 1.6, P.z); const kHp = k.hp; const before = {};
    __cd.inv.stick = 8; __cd.inv.aruval = 2; // a fresh blade to prove resisted strikes do not consume it
    out.knifeVsKaalan = swing('knife', k); out.stickVsKaalan = swing('stick', k); out.aruvalVsKaalan = swing('aruval', k);
    out.kaalanHpAfterMelee = k.hp; out.kaalanHp0 = kHp; out.aruvalUsesAfterResist = __cd.inv.aruval; out.stickAfterResist = __cd.inv.stick;
    // shoot it once with the pistol
    __cd.equip('pistol', true); __cd.sim(0.5, place(k)); P.pitch = Math.atan2(k.h * 0.5 - 1.65, 1.6); const g0 = k.hp; __cd.fire(true); __cd.sim(0.04, place(k)); __cd.fire(false); __cd.sim(0.3, place(k));
    out.shot = { gunHit: !!k.gunHit, dmg: +(g0 - k.hp).toFixed(1) }; P.pitch = 0;
    out.knifeAfterShot = swing('knife', k);
    // other infected: not affected by the mechanic (a pinam that was never shot still takes knife damage)
    const p2 = __cd.newZombie('odi', P.x - 1.6, P.z); p2.hp = 999; out.odiKnife = swing('knife', p2); p2.dead = true;
    // boss: aruval does half damage
    __cd.inv.aruval = 2; __cd.spawnFromQueue('boss'); const b = __cd.zombies.find(z => z.boss && !z.dead); __cd.sim(3.6, keepHp); b.bs = 'walk'; b.slamCd = b.chargeCd = b.throwCd = b.quakeCd = 99;
    const pb = () => { b.x = P.x - 2.2; b.z = P.z; b.mesh.position.set(b.x, 0, b.z); keepHp(); };
    __cd.equip('aruval', true); __cd.sim(0.5, pb); const b0 = b.hp; __cd.fire(true); __cd.sim(0.05, pb); __cd.fire(false); __cd.sim(1.0, pb); out.bossAruval = +(b0 - b.hp).toFixed(1);
    out.hud = document.getElementById('slot-aruval') ? document.getElementById('slot-aruval').innerText.replace(/\s+/g, ' ') : null;
    __cd.equip('aruval', true); __cd.sim(0.5, pb);
    out.ammoText = document.querySelector('#ammo, .ammo') ? document.querySelector('#ammo, .ammo').innerText.replace(/\s+/g, ' ') : null;
    return out;
  }, Object.assign(r1, r2));
  ok('pickup gives one aruval with 2 strikes', r.afterPickup === 2 && r.left1 === 1, r.afterPickup);
  ok('a second aruval is left on the ground while you carry one', r.secondRefused);
  ok('aruval hits harder than stick and knife', r.dmg.aruval.dmg > r.dmg.stick.dmg && r.dmg.stick.dmg > r.dmg.knife.dmg, r.dmg);
  ok('aruval kills an ordinary infected in one strike', r.pinamKill.dead, r.pinamKill);
  ok('2 strikes then it breaks: 0 left, back to knife, cannot re-equip', r.usesAfter1 === 1 && r.usesAfter2 === 0 && r.curAfterBreak === 'knife' && !r.hasAfter && r.curAfterTryEquip === 'knife' && !r.swungBroken && r.usesAfterExtra === 0, { u1: r.usesAfter1, u2: r.usesAfter2, cur: r.curAfterBreak, reEquip: r.curAfterTryEquip, swungBroken: r.swungBroken });
  ok('Kaalan takes no melee damage before being shot (knife, stick, aruval)', r.knifeVsKaalan.dmg === 0 && r.stickVsKaalan.dmg === 0 && r.aruvalVsKaalan.dmg === 0 && r.kaalanHpAfterMelee === r.kaalanHp0, { knife: r.knifeVsKaalan, stick: r.stickVsKaalan, aruval: r.aruvalVsKaalan });
  ok('resisted strikes do not use up aruval/stick durability', r.aruvalUsesAfterResist === 2 && r.stickAfterResist === 8, { aruval: r.aruvalUsesAfterResist, stick: r.stickAfterResist });
  ok('one firearm hit makes that Kaalan vulnerable', r.shot.gunHit && r.shot.dmg > 0, r.shot);
  ok('after the shot, melee damages the Kaalan', r.knifeAfterShot.dmg > 0, r.knifeAfterShot);
  ok('other infected unaffected (unshot Odi still takes full knife damage)', r.odiKnife.dmg === 45, r.odiKnife);
  ok('aruval does half damage to the boss', r.bossAruval > 70 && r.bossAruval <= 80.01, r.bossAruval);
  ok('HUD shows aruval strikes', /Aruval/.test(r.hud || '') && /left/.test(r.ammoText || ''), { slot: r.hud, ammo: r.ammoText });
  await page.screenshot({ path: path.join(dir, 'v9-aruval-hud.png') });
  for (const x of res) console.log(x.join('  '));
  console.log(res.filter(x => x[0] === 'PASS').length + '/' + res.length, 'errors', errors.length, errors.slice(0, 4));
  await browser.close();
})();
