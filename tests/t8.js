// v3 feature tests: F quick melee, Molotov, Urundai bomb, boss phases, wave 4/5 pressure, rename
const { open, dir } = require('./t2.js');
const path = require('path');
const results = [];
function check(name, ok, info) { results.push((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + info : '')); }
(async () => {
  const { browser, page, errors } = await open();
  const ev = (fn, arg) => page.evaluate(fn, arg);
  await ev(() => { __cd.forceFallback(); document.getElementById('startBtn').click(); });
  await page.waitForTimeout(2500);
  const setup = (lvl) => ev((lvl) => { const P = __cd.P; __cd.startLevel(lvl, false); __cd.setPlaying(); __cd.hold(); __cd.sim(0.3); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; P.hp = 100; P.yaw = 0; P.pitch = 0; }, lvl);
  const key = (code) => page.evaluate((code) => window.dispatchEvent(new KeyboardEvent('keydown', { code })), code);
  const keyup = (code) => page.evaluate((code) => window.dispatchEvent(new KeyboardEvent('keyup', { code })), code);

  // ---- rename ----
  let r = await ev(() => ({ name: __cd.LEVELS[4].name, route: document.getElementById('route').textContent, lede: document.querySelector('.lede').textContent }));
  check('final area renamed', r.name === 'Mamallapuram Ruins' && r.route.includes('Mamallapuram Ruins') && !r.route.includes('ECR') && r.lede.includes('Mamallapuram'), r.name);

  // ---- F quick melee from the rifle ----
  await setup(2);
  r = await ev(() => { const P = __cd.P; __cd.equip('rifle', true); __cd.sim(0.5); const z = __cd.newZombie('pinam', P.x, P.z - 1.6); z.stagger = 99; const hp0 = z.hp; const mag0 = __cd.inv.rifle.mag;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyF' })); const started = !!__cd.qm; __cd.sim(0.2); const hp1 = z.hp;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); __cd.sim(0.3); const hp2 = z.hp; // inside cooldown: no second hit
    __cd.sim(0.6); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); __cd.sim(0.3);
    return { started, dmg1: hp0 - hp1, spam: hp1 - hp2, hp3: z.hp, dead: z.dead, cur: __cd.cur, mag: __cd.inv.rifle.mag === mag0, qmDone: !__cd.qm }; });
  check('F melee strikes while holding rifle', r.started && r.dmg1 >= 40 && r.cur === 'rifle' && r.mag, JSON.stringify(r));
  check('F melee has a cooldown', r.spam === 0 && (r.dead || r.hp3 < 85 - 45), JSON.stringify(r));
  r = await ev(() => { const P = __cd.P; __cd.zombies.length = 0; __cd.inv.rifle.mag = 0; __cd.startReload(); __cd.sim(0.3); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); __cd.sim(2.5); return { mag: __cd.inv.rifle.mag }; });
  check('F during reload does not break the reload', r.mag === 30, JSON.stringify(r));
  r = await ev(() => { const P = __cd.P; const b = (()=>{ __cd.spawnFromQueue('boss'); return __cd.zombies.find(z => z.boss); })(); __cd.sim(3.6, () => { P.hp = 100; }); b.x = P.x; b.z = P.z - 2.2; b.bs = 'stunned'; b.st = 0; const h0 = b.hp; __cd.sim(0.1); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); __cd.sim(0.3, () => { P.hp = 100; b.bs = 'stunned'; b.st = 0; }); return { dmg: h0 - b.hp }; });
  check('F melee damages the boss', r.dmg > 0, JSON.stringify(r));

  // ---- Molotov ----
  await setup(4);
  r = await ev(() => { const P = __cd.P; __cd.zombies.length = 0; const o = {}; o.start = __cd.inv.molotov; __cd.equip('molotov', true); __cd.sim(0.5);
    const zs = [0, 1, 2].map(i => { const z = __cd.newZombie('pinam', P.x - 1 + i, P.z - 10); z.stagger = 99; return z; });
    P.pitch = -0.05; __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(1.4, () => { P.hp = 100; });
    o.after = __cd.inv.molotov; o.fires = __cd.fireZones.length; o.burning = zs.filter(z => z.burn > 0 || z.dead).length; o.hp = zs.map(z => Math.round(z.hp));
    __cd.sim(9, () => { P.hp = 100; zs.forEach(z => z.stagger = 99); }); o.firesLater = __cd.fireZones.length; o.dead = zs.filter(z => z.dead).length; o.flamesUsed = __cd.flamesUsed();
    __cd.inv.molotov = 0; __cd.sim(1); __cd.equip('molotov', true); o.equipEmpty = __cd.cur; return o; });
  check('Molotov thrown, counter drops', r.start >= 2 && r.after === r.start - 1, JSON.stringify(r));
  check('Molotov fire burns infected', r.fires === 1 && r.burning >= 2, JSON.stringify({ burning: r.burning, hp: r.hp }));
  check('Molotov fire burns out and cleans up', r.firesLater === 0 && r.flamesUsed === 0, JSON.stringify({ firesLater: r.firesLater, flames: r.flamesUsed, dead: r.dead }));
  check('cannot select a throwable with none left', r.equipEmpty !== 'molotov', r.equipEmpty);

  // ---- Urundai bomb ----
  await setup(4);
  r = await ev(() => { const P = __cd.P; __cd.zombies.length = 0; const o = {}; o.start = __cd.inv.urundai;
    const near = __cd.newZombie('thadiyan', P.x, P.z - 12); const mid = __cd.newZombie('thadiyan', P.x + 4, P.z - 12); const far = __cd.newZombie('thadiyan', P.x + 14, P.z - 12); [near, mid, far].forEach(z => z.stagger = 99);
    const hp = [near.hp, mid.hp, far.hp]; const pos0 = { x: mid.x, z: mid.z };
    __cd.equip('urundai', true); __cd.sim(0.5); P.pitch = -0.02; __cd.fire(true); __cd.sim(0.05); __cd.fire(false);
    let booms = 0; const orig = __cd.SFX.boom; __cd.SFX.boom = (p) => { booms++; orig(p); };
    __cd.sim(2.5, () => { P.hp = 100; }); __cd.SFX.boom = orig;
    o.after = __cd.inv.urundai; o.booms = booms; o.dmg = [hp[0] - near.hp, hp[1] - mid.hp, hp[2] - far.hp].map(Math.round); o.knock = Math.hypot(mid.x - pos0.x, mid.z - pos0.z).toFixed(2);
    __cd.sim(1); o.bombsLeft = __cd.bombsCount(); o.flamesUsed = __cd.flamesUsed(); return o; });
  check('Urundai explodes exactly once', r.booms === 1 && r.after === r.start - 1, JSON.stringify(r));
  check('Urundai damage falls off with distance', r.dmg[0] > r.dmg[1] && r.dmg[1] > 0 && r.dmg[2] === 0, JSON.stringify(r.dmg));
  check('Urundai knocks back and cleans up', +r.knock > 0.5 && r.bombsLeft === 0 && r.flamesUsed === 0, JSON.stringify(r));
  r = await ev(() => { const P = __cd.P; __cd.inv.urundai = 1; __cd.equip('urundai', true); __cd.sim(0.5); P.pitch = -1.3; const hp0 = P.hp; __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(1.5); return { selfDmg: hp0 - P.hp }; });
  check('Urundai at your feet hurts you', r.selfDmg > 15, JSON.stringify(r));

  // ---- boss phases ----
  await setup(4);
  r = await ev(() => { const P = __cd.P; __cd.spawnFromQueue('boss'); const b = __cd.zombies.find(z => z.boss); const o = { hp: b.hp, seen: {}, phases: [] };
    __cd.sim(3.5, () => { P.hp = 100; });
    __cd.hurtZombie(b, b.maxHp * 0.36, {}); __cd.sim(0.1); o.phases.push(b.phaseN);
    b.throwCd = 0; b.chargeCd = 99; b.bs = 'walk'; P.x = b.x + 16; P.z = b.z; if (P.x > 54) P.x = b.x - 16; let maxBombs = 0;
    for (let k = 0; k < 30; k++) { __cd.sim(0.1, () => { P.hp = 100; }); maxBombs = Math.max(maxBombs, __cd.sporeBombsCount()); o.seen[b.bs] = 1; }
    o.tripleSpores = maxBombs;
    const odiBefore = __cd.zombies.filter(z => z.type === 'odi' && !z.dead).length;
    __cd.hurtZombie(b, b.maxHp * 0.32, {}); __cd.sim(0.1); o.phases.push(b.phaseN); o.summoned = __cd.zombies.filter(z => z.type === 'odi' && !z.dead).length - odiBefore;
    __cd.zombies.filter(z => z.type === 'odi').forEach(z => { z.dead = true; z.removed = true; z.mesh.visible = false; });
    b.quakeCd = 0; b.bs = 'walk'; P.x = b.x + 8; P.z = b.z; let sw = 0, hpBefore = 100, hitByWave = false; P.hp = 100;
    for (let k = 0; k < 40; k++) { __cd.sim(0.05); o.seen[b.bs] = 1; sw = Math.max(sw, __cd.shockwavesCount()); if (P.hp < 100) hitByWave = true; P.hp = 100; }
    o.shockwave = sw; o.hitByWave = hitByWave;
    // jumping over the shockwave avoids it
    for (let k = 0; k < 60 && __cd.shockwavesCount(); k++) __cd.sim(0.05, () => { P.hp = 100; });
    b.quakeCd = 0; b.bs = 'walk'; P.x = b.x + 8; P.z = b.z; let jumped = false, hurt = false; P.hp = 100;
    for (let k = 0; k < 60; k++) { const L = __cd.shockwavesList(), s = L[L.length - 1]; if (s && !jumped && s.r > 8 - 3.2) { __cd.keys.Space = true; jumped = true; } __cd.sim(0.033); __cd.keys.Space = false; if (P.hp < 100) hurt = true; }
    o.jumpAvoids = jumped && !hurt;
    b.chargeCd = 0; b.quakeCd = 99; b.throwCd = 99; b.slamCd = 99; b.bs = 'walk'; P.x = b.x + 18; P.z = b.z; if (P.x > 54) P.x = b.x - 18; let charges = 0, prev = '';
    for (let k = 0; k < 90; k++) { __cd.sim(0.05, () => { P.hp = 100; }); if (b.bs === 'charge' && prev !== 'charge') { charges++; P.x += Math.cos(b.face) * 6; P.z -= Math.sin(b.face) * 6; } prev = b.bs; o.seen[b.bs] = 1; }
    o.chargesIn45 = charges;
    let n = 0; while (!b.dead && n++ < 500) { __cd.hurtZombie(b, 40, {}); __cd.sim(0.05, () => { P.hp = 100; }); }
    o.dead = b.dead; return o; });
  check('boss has 3000 hp in the final wave', r.hp === 3000, String(r.hp));
  check('boss phase 2 -> triple spore bombs', r.phases[0] === 2 && r.tripleSpores === 3, JSON.stringify({ ph: r.phases, bombs: r.tripleSpores }));
  check('boss phase 3 -> summons runners', r.phases[1] === 3 && r.summoned >= 2, JSON.stringify({ ph: r.phases, summoned: r.summoned }));
  check('phase 3 shockwave hits grounded player', r.shockwave >= 1 && r.hitByWave, JSON.stringify({ sw: r.shockwave, hit: r.hitByWave }));
  check('jumping clears the shockwave', r.jumpAvoids, String(r.jumpAvoids));
  check('phase 2+ chains a second charge', r.chargesIn45 >= 2, 'charges=' + r.chargesIn45 + ' states=' + Object.keys(r.seen).join(','));
  check('boss still dies', r.dead);

  // ---- wave 4/5 pressure ----
  r = await ev(() => { const P = __cd.P; __cd.startLevel(3, false); __cd.setPlaying(); const o = {}; let toasts = []; const tEl = document.getElementById('toast');
    const W = __cd.LEVELS[3].wave; o.w4 = W.pinam + W.odi + W.thadiyan + W.kaalan; o.w4k = W.kaalan; o.w4supplies = __cd.LEVELS[3].supplies.ammo + '/' + __cd.LEVELS[3].supplies.med;
    const W5 = __cd.LEVELS[4].wave; o.w5 = W5.pinam + W5.odi + W5.thadiyan + W5.kaalan; o.w5k = W5.kaalan;
    // stand still: flank must trigger
    __cd.sim(5, () => { P.hp = 100; }); const angles = []; let flanked = false;
    for (let k = 0; k < 25; k++) { __cd.sim(1, () => { P.hp = 100; P.vx = P.vz = 0; }); if (tEl.textContent.includes('flanking')) flanked = true; }
    o.flanked = flanked; __cd.zombies.forEach(z => angles.push(Math.round(Math.atan2(z.z - P.z, z.x - P.x) * 180 / Math.PI)));
    const q = [0, 0, 0, 0]; angles.forEach(a => q[((Math.floor((a + 180) / 90)) % 4 + 4) % 4]++); o.quadrants = q; return o; });
  check('wave 4 bigger with more Kaalans, scarcer supplies', r.w4 >= 60 && r.w4k >= 7 && r.w4supplies === '4/2', JSON.stringify(r));
  check('wave 5 is the biggest', r.w5 > r.w4 && r.w5k >= 10, `w4=${r.w4} w5=${r.w5}`);
  check('camping triggers a flank', r.flanked);
  check('infected come from several directions', r.quadrants.filter(n => n > 0).length >= 3, JSON.stringify(r.quadrants));

  // ---- full run of waves 4 and 5 with bot, throwables in play ----
  for (const i of [3, 4]) {
    r = await ev((i) => {
      const P = __cd.P; __cd.startLevel(i, true); __cd.setPlaying(); __cd.inv.rifle.res = 9999; __cd.equip('rifle', true);
      const bot = () => { P.hp = 100; const al = __cd.zombies.filter(z => !z.dead && !(z.boss && z.bs === 'emerge')); if (!al.length) { __cd.fire(false); return; }
        al.sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); const z = al[0]; const dx = z.x - P.x, dz = z.z - P.z, d = Math.hypot(dx, dz);
        P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(z.h * 0.55 - 1.65, d) - P.recoilP; if (__cd.cur !== 'rifle') __cd.equip('rifle', true); __cd.fire(d < 45); if (__cd.inv.rifle.mag === 0) __cd.startReload(); };
      let t = 0; while (t < 500 && __cd.state === 'playing') { __cd.sim(5, bot); t += 5; }
      return { state: __cd.state, t, kills: __cd.stats.kills };
    }, i);
    check(`wave ${i + 1} clearable`, r.state === 'inter' || r.state === 'won', JSON.stringify(r));
  }
  console.log(results.join('\n'));
  console.log('ERRORS:\n' + (errors.slice(0, 20).join('\n') || 'none'));
  await browser.close();
})();
