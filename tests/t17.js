// v5 traversal/collision probe: jump reach, jump while sneaking, vehicle collision vs visible shape, wave-5 obstacles, walls still solid.
const { open } = require('./t2.js');
(async () => {
  const { browser, page, errors } = await open();
  const R = await page.evaluate(() => {
    const out = {}; const P = __cd.P, K = __cd.keys;
    const clear = () => { for (const k in K) K[k] = false; P.vx = P.vz = P.vy = 0; P.y = 0; P.grounded = true; P.crouchOn = false; P.crouch = 0; P.stam = 100; P.winded = false; };
    const face = (dx, dz) => { P.yaw = Math.atan2(-dx, -dz); P.pitch = 0; };
    const run = (sec, fn) => { for (let t = 0; t < sec; t += 1 / 60) { if (fn) fn(t); __cd.stepOnce(1 / 60); } };
    const setup = (lvl) => { __cd.startLevel(lvl, false); __cd.setPlaying(); __cd.hold(); for (const z of __cd.zombies) z.dead = true; };

    // A. jump reach: test wall across an open patch of the desert, several take-off distances
    setup(4);
    const S = __cd.solids; const saved = S.splice(0); const reach = {};
    for (const h of [0.6, 0.95, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]) {
      let ok = 0, tries = 0;
      for (const d of [0.5, 0.8, 1.1, 1.4, 1.7, 2.0]) {
        tries++; S.push({ x0: -30, x1: 30, z0: -20.3, z1: -19.7, y0: 0, y1: h, test: 1 });
        clear(); P.x = 0; P.z = -19.7 + 6; face(0, -1); run(0.1);
        let jumped = false; K.KeyW = true;
        run(2.0, () => { if (!jumped && P.z <= -19.7 + 0.4 + d) { K.Space = true; jumped = true; } else K.Space = false; });
        if (P.z < -20.8) ok++; S.splice(S.findIndex(s => s.test), 1);
      }
      reach[h + ' m'] = ok + '/' + tries;
    }
    out.jumpReach = reach;

    // B. jump while sneaking (C) over a jersey-height wall, single Space press
    S.push({ x0: -30, x1: 30, z0: -20.3, z1: -19.7, y0: 0, y1: 0.95, test: 1 });
    clear(); P.x = 0; P.z = -14; face(0, -1); P.crouchOn = true; run(0.6);
    const crouchedBefore = P.crouch > 0.9; K.KeyW = true; let pressed = false;
    run(3.0, () => { if (!pressed && P.z <= -19.7 + 0.4 + 1.1) { K.Space = true; pressed = true; } else K.Space = false; });
    out.sneakJump = { crouchedBefore, cleared: P.z < -20.8, endZ: +P.z.toFixed(2) };
    S.splice(S.findIndex(s => s.test), 1); S.push(...saved);

    // C. vehicles in wave 1: walk into each long side at 5 points, measure gap to the visible side; then try to jump over
    setup(0);
    const veh = [['bus', -3.5, -24, 0.06, 1.35, 5.55], ['burnt bus', 4, 30, -0.05, 1.35, 5.55], ['tanker', -3, 12, 0.04, 1.2, 4.1], ['tipped bus', 17, -4.5, Math.PI / 2 + 0.05, 1.6, 5.5], ['burnt car', 2, -4, 0.9, 0.95, 2.2]];
    out.vehicles = {};
    for (const [name, x, z, ry, hw, hd] of veh) {
      const c = Math.cos(ry), s = Math.sin(ry); const W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c]; const Lc = (wx, wz) => { const dx = wx - x, dz = wz - z; return [dx * c - dz * s, dx * s + dz * c]; };
      let maxGap = -1, minGap = 9, pass = 0, n = 0;
      for (const side of [-1, 1]) for (const f of [-0.8, -0.4, 0, 0.4, 0.8]) {
        const st = W(side * (hw + 3), f * hd); clear(); P.x = st[0]; P.z = st[1];
        const dir = W(0, f * hd); face(dir[0] - st[0], dir[1] - st[1]); K.KeyW = true; run(1.4); K.KeyW = false; run(0.1);
        const l = Lc(P.x, P.z); const gap = Math.abs(l[0]) - hw - 0.4; maxGap = Math.max(maxGap, gap); minGap = Math.min(minGap, gap);
        // keep walking and spam jump: must not get through or on top
        K.KeyW = true; run(2.0, (t) => { K.Space = (Math.floor(t * 4) % 2) === 0; }); K.KeyW = false; K.Space = false; run(0.5);
        const l2 = Lc(P.x, P.z); n++; if ((Math.abs(l2[0]) < hw && Math.abs(l2[1]) < hd) || P.y > 0.5) pass++;
      }
      out.vehicles[name] = { gapToVisibleSide_m: `${minGap.toFixed(3)}..${maxGap.toFixed(3)}`, insideOrOnTop: pass + '/' + n };
    }

    // D. buildings/walls still block (wave 1 shop facade line at x~-9.6 / west lane, and a straight run + jumps)
    out.walls = {};
    clear(); P.x = 0; P.z = 20; face(1, 0); K.KeyW = true; run(4, (t) => { K.Space = (Math.floor(t * 4) % 2) === 0; }); K.KeyW = false; K.Space = false;
    out.walls.w1_eastShops_x = +P.x.toFixed(2);

    // E. wave 5: fallen pillars (0.6 m) must be jumpable and not have invisible collision; Shore Temple wall (1.6 m) must block
    setup(4);
    out.w5 = {};
    const pillars = [[20, -4, 0.4], [6, -12, 1.2], [-20, 4, 0.2], [30, 8, 1.8], [-30, 46, 0.7]];
    for (const [x, z, ry] of pillars) {
      const c = Math.cos(ry), s = Math.sin(ry); const nx = -s, nz = -c; // pillar's long axis is local x -> world (c,-s); normal is local z
      const ax = s, az = c; // local z axis in world
      // invisible-collision check: stand 0.75 m from the pillar's centre line (0.3 half-width + 0.4 radius + 5 cm) on each side
      let blockedOpen = 0, maxPush = 0;
      for (const sd of [-1, 1]) for (const f of [-1.2, 0, 1.2]) {
        clear(); P.x = x + c * f + ax * sd * 0.75; P.z = z - s * f + az * sd * 0.75; const bx = P.x, bz = P.z; __cd.stepOnce(1 / 60);
        const pd = Math.hypot(P.x - bx, P.z - bz); if (pd > 0.01 || P.y > 0.05) blockedOpen++; maxPush = Math.max(maxPush, pd);
      }
      // jump over it perpendicular
      clear(); P.x = x + ax * 4; P.z = z + az * 4; face(-ax, -az); K.KeyW = true; let j = false;
      run(2.0, () => { const d = (P.x - x) * ax + (P.z - z) * az; if (!j && d < 1.4) { K.Space = true; j = true; } else K.Space = false; });
      const dEnd = (P.x - x) * ax + (P.z - z) * az;
      out.w5[`pillar ${x},${z}`] = { pushedInOpenSand: blockedOpen + '/6', maxPush_m: +maxPush.toFixed(3), jumpedOver: dEnd < -0.8 };
    }
    // shore temple north wall: wall(x-10,x+10,z-7.6,z-7) with x=36,z=-28 -> z -35.6..-35, height 1.6
    clear(); P.x = 36; P.z = -40; face(0, 1); K.KeyW = true; run(3, (t) => { K.Space = (Math.floor(t * 4) % 2) === 0; }); K.KeyW = false; K.Space = false;
    out.w5.shoreTempleWall1p6_blocked = P.z < -35.6 + 0.01 ? true : +P.z.toFixed(2);
    // yard walls: list heights generated this run
    out.w5.yardWallHeights = __cd.solids.filter(s => Math.abs(s.y1 - s.y0) > 0.5 && ((s.x1 - s.x0 > 5.9 && s.x1 - s.x0 < 6.1 && s.z1 - s.z0 < 0.8) || (s.x1 - s.x0 < 0.8 && s.z1 - s.z0 > 5))).filter(s => (s.x0 > 0 && s.x1 < 30 && s.z0 > 15 && s.z1 < 40) || (s.x0 > -50 && s.x1 < -25 && s.z0 > 18 && s.z1 < 42)).map(s => +s.y1.toFixed(2));
    clear();
    return out;
  });
  console.log(JSON.stringify(R, null, 1));
  console.log('errors', errors.length, errors.slice(0, 3));
  await browser.close();
})();
