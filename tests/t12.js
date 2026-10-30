// v4 checks: title screen, branding, menus, settings, campaign start, weapons DPS, audio cues
const { open, dir } = require('./t2.js');
const path = require('path');
const results = [];
function check(n, ok, info) { results.push((ok ? 'PASS ' : 'FAIL ') + n + (info ? '  ' + info : '')); }
(async () => {
  const { browser, page, errors } = await open();
  const ev = (fn, a) => page.evaluate(fn, a);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(dir, 'v4-title.png') });
  let r = await ev(() => ({ title: document.title, h1: document.getElementById('dlTitle').textContent, grunge: document.getElementById('dlTitle').classList.contains('grunge'), body: document.body.innerText,
    btns: [...document.querySelectorAll('#menu .mbtn')].map(b => b.textContent.trim()), state: __cd.state, tm: __cd.titleMode, zs: __cd.zombies.length, fog: __cd.camera.parent.fog.color.getHex() }));
  check('branding: page title + title screen say THE DEADLANDS', r.title === 'THE DEADLANDS' && /DEADLANDS/.test(r.h1) && !/Chennai Dead/i.test(r.body), JSON.stringify({ t: r.title, h1: r.h1 }));
  check('title menu has the three entries', JSON.stringify(r.btns) === JSON.stringify(['Start campaign', 'How to play', 'Settings']), JSON.stringify(r.btns));
  check('title scene: night grade + infected silhouettes', r.tm && r.fog === 0x241614 && r.zs >= 6, JSON.stringify({ fog: r.fog.toString(16), zs: r.zs }));
  check('distressed lettering applied (or safe fallback)', r.grunge === true);
  // how to play
  await page.click('#howBtn'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(dir, 'v4-how.png') });
  r = await ev(() => ({ open: !document.getElementById('how').hidden, route: document.getElementById('route').children.length }));
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const closed = await ev(() => document.getElementById('how').hidden);
  check('How to Play opens (route + controls) and closes with Esc', r.open && r.route === 5 && closed);
  // settings
  await page.click('#settingsBtn'); await page.waitForTimeout(300); await page.screenshot({ path: path.join(dir, 'v4-settings.png') });
  r = await ev(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); };
    set('sFov', 85); set('sSens', 1.6); set('sVol', 40); const inv = document.getElementById('sInv'); inv.checked = true; inv.dispatchEvent(new Event('change'));
    let stored = null; try { stored = JSON.parse(localStorage.getItem('deadlands.settings')); } catch (e) {}
    return { fov: __cd.camera.fov, S: Object.assign({}, __cd.SETTINGS), stored }; });
  check('settings apply live (FOV, sensitivity, volume, invert)', r.fov === 85 && r.S.sens === 1.6 && r.S.vol === 40 && r.S.invertY === true, JSON.stringify(r.S));
  check('settings persist (or are skipped safely if storage is blocked)', r.stored === null || r.stored.fov === 85, JSON.stringify(r.stored));
  r = await ev(() => { const P = __cd.P; __cd.setPlaying; const y0 = P.pitch; window.dispatchEvent(new MouseEvent('mousemove', { movementY: 0 })); return 1; });
  await ev(() => { document.getElementById('setReset').click(); document.getElementById('setBack').click(); });
  r = await ev(() => ({ fov: __cd.camera.fov, inv: __cd.SETTINGS.invertY, closed: document.getElementById('settings').hidden }));
  check('reset to defaults + back', r.fov === 74 && r.inv === false && r.closed, JSON.stringify(r));
  // start campaign
  await ev(() => __cd.forceFallback());
  await page.click('#startBtn');
  await page.waitForTimeout(250);
  const mid = await ev(() => ({ fade: document.getElementById('fade').classList.contains('on'), state: __cd.state }));
  await page.waitForTimeout(2500);
  r = await ev(() => ({ state: __cd.state, level: document.getElementById('hLoc').textContent, fade: document.getElementById('fade').classList.contains('on'), tm: __cd.titleMode, fog: __cd.camera.parent.fog.color.getHex(), queue: __cd.spawnQueue.length }));
  check('START CAMPAIGN fades out and launches wave 1', mid.fade && r.state === 'playing' && r.level === 'T. Nagar' && !r.fade && !r.tm && r.fog !== 0x241614 && r.queue > 0, JSON.stringify({ mid, r }));
  await page.waitForTimeout(800); await page.screenshot({ path: path.join(dir, 'v4-wave1.png') });
  // pause -> settings -> back -> main menu -> title again
  r = await ev(() => { __cd.pause(); document.getElementById('pauseSetBtn').click(); const o = { setOpen: !document.getElementById('settings').hidden }; document.getElementById('setBack').click(); document.getElementById('quitBtn').click(); o.state = __cd.state; o.tm = __cd.titleMode; o.menu = !document.getElementById('menu').hidden; return o; });
  check('pause -> settings -> main menu returns to the title scene', r.setOpen && r.state === 'menu' && r.tm && r.menu, JSON.stringify(r));
  // weapon differentiation: same target, comparable conditions
  r = await ev(() => { const P = __cd.P, W = __cd.W; const out = {};
    for (const w of ['pistol', 'rifle']) {
      __cd.startLevel(2, false); __cd.setPlaying(); __cd.hold(); __cd.sim(0.2); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; __cd.inv[w].mag = W[w].mag; __cd.inv[w].res = 999;
      __cd.equip(w, true); __cd.sim(0.5); P.yaw = 0; P.pitch = 0;
      const z = __cd.newZombie('thadiyan', P.x, P.z - 9); z.stagger = 9999; z.speed = 0; const hp0 = z.hp, mag0 = __cd.inv[w].mag;
      let t = 0; const bodyAim = () => { P.pitch = Math.atan2(z.h * 0.5 - 1.65, Math.hypot(z.x - P.x, z.z - P.z)) - P.recoilP; P.yaw = Math.atan2(-(z.x - P.x), -(z.z - P.z)); P.hp = 100; };
      // pistol is semi-auto: re-press the trigger every frame it's ready
      while (!z.dead && t < 12) { bodyAim(); __cd.fire(true); __cd.sim(0.033, bodyAim); if (w === 'pistol') { __cd.fire(false); } t += 0.033; if (__cd.inv[w].mag === 0) { __cd.fire(false); break; } }
      __cd.fire(false);
      out[w] = { perShot: W[w].dmg, cd: W[w].cd, timeToKill280: +t.toFixed(2), shots: mag0 - __cd.inv[w].mag, dead: z.dead, dps: +(W[w].dmg / W[w].cd).toFixed(0) };
    }
    return out; });
  check('pistol hits harder per shot', r.pistol.perShot > r.rifle.perShot, JSON.stringify(r));
  check('rifle fires faster and has higher DPS', r.rifle.cd < r.pistol.cd && r.rifle.dps > r.pistol.dps * 1.4);
  check('rifle kills a Thadiyan faster, pistol uses fewer rounds', r.rifle.dead && r.pistol.dead && r.rifle.timeToKill280 < r.pistol.timeToKill280 && r.pistol.shots < r.rifle.shots, JSON.stringify({ p: r.pistol, rf: r.rifle }));
  r = await ev(() => { const P = __cd.P; const z = __cd.newZombie('pinam', P.x, P.z - 6); z.stagger = 99; z.speed = 0; const hp0 = z.hp; __cd.equip('pistol', true); __cd.sim(0.5);
    P.pitch = Math.atan2(z.h * 0.93 - 1.65, 6); P.yaw = 0; __cd.fire(true); __cd.sim(0.05); __cd.fire(false); return { dead: z.dead, hp: z.hp }; });
  check('pistol headshot one-shots a Pinam (48 x 2.5)', r.dead, JSON.stringify(r));
  // audio cues: spy on SFX calls
  r = await ev(() => { const P = __cd.P, S = __cd.SFX, calls = []; const wrap = (n) => { const o = S[n]; S[n] = function (...a) { calls.push(n + (typeof a[0] === 'string' ? ':' + a[0] : '')); return o.apply(this, a); }; };
    ['kaalan', 'bossIntro', 'bossGrowl', 'bossCue', 'bossPain', 'bossPhase', 'bossDie', 'groan', 'roar', 'clicks', 'shriek'].forEach(wrap);
    __cd.startLevel(4, false); __cd.setPlaying(); __cd.hold(); __cd.sim(0.2); __cd.zombies.length = 0; __cd.spawnQueue.length = 0; __cd.spawnQueue.push('pinam', 'pinam', 'pinam', 'pinam', 'pinam');
    const k = __cd.newZombie('kaalan', P.x + 3, P.z - 14); k.state = 'listen'; __cd.sim(4, () => { P.hp = 100; }); const idle = calls.slice();
    __cd.equip('pistol', true); __cd.sim(0.4); __cd.fire(true); __cd.sim(0.05); __cd.fire(false); __cd.sim(3, () => { P.hp = 100; });
    let n = 0; while (!k.dead && n++ < 30) __cd.hurtZombie(k, 40, {}); const before = calls.length; __cd.sim(3, () => { P.hp = 100; }); const afterDeath = calls.slice(before).filter(c => c.startsWith('kaalan')).length;
    const kc = calls.filter(c => c.startsWith('kaalan')); const kinds = [...new Set(kc)];
    calls.length = 0; __cd.spawnFromQueue('boss'); const b = __cd.zombies.find(z => z.boss); __cd.sim(4, () => { P.hp = 100; });
    b.bs = 'walk'; b.st = 0; b.slamCd = 0; b.chargeCd = 99; b.throwCd = 99; P.x = b.x + 2.5; P.z = b.z; __cd.sim(2, () => { P.hp = 100; }); b.bs = 'walk'; b.slamCd = 99; b.growl = 0.1; P.x = b.x + 12; __cd.sim(1, () => { P.hp = 100; }); b.chargeCd = 0; P.x = b.x + 16; __cd.sim(3, () => { P.hp = 100; });
    __cd.hurtZombie(b, 20, {}); __cd.hurtZombie(b, b.maxHp * 0.36, {}); __cd.sim(1, () => { P.hp = 100; }); __cd.hurtZombie(b, b.maxHp * 0.32, {}); __cd.sim(1, () => { P.hp = 100; });
    let m = 0; while (!b.dead && m++ < 300) __cd.hurtZombie(b, 50, {}); const bcBefore = calls.length; __cd.sim(12, () => { P.hp = 100; });
    const growlAfterDeath = calls.slice(bcBefore).filter(c => c === 'bossGrowl' || c.startsWith('bossCue')).length;
    return { kinds, idleCalls: idle.filter(c => c.startsWith('kaalan')).length, kaalanAfterDeath: afterDeath, boss: [...new Set(calls)], growlAfterDeath }; });
  check('Kaalan: idle / alert / hunt / death voices fire', ['kaalan:idle', 'kaalan:alert', 'kaalan:hunt', 'kaalan:death'].every(k => r.kinds.includes(k)), JSON.stringify(r.kinds));
  check('Kaalan idle is not spammy (<= 4 voices in 4 s)', r.idleCalls >= 1 && r.idleCalls <= 4, String(r.idleCalls));
  check('Kaalan silent after death (except death sound)', r.kaalanAfterDeath === 0, String(r.kaalanAfterDeath));
  check('boss audio: intro, growl, attack cues, pain, phases, death', ['bossIntro', 'bossGrowl', 'bossCue:slam', 'bossCue:charge', 'bossPain', 'bossPhase', 'bossDie'].every(k => r.boss.includes(k)), JSON.stringify(r.boss));
  check('boss silent after death', r.growlAfterDeath === 0, String(r.growlAfterDeath));
  console.log(results.join('\n'));
  console.log('ERRORS:\n' + (errors.slice(0, 20).join('\n') || 'none'));
  await browser.close();
})();
