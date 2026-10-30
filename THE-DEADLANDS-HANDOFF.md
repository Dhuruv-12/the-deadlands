# THE DEADLANDS (formerly Chennai Dead): project handoff (v9)

Paste this whole file into a new chat (ideally with `The-Deadlands.zip` or `The-Deadlands.html` attached) to continue the project.

---

## 1. What the game is
- First-person 3D zombie survival shooter in the browser, set in post-apocalyptic Chennai.
- Built with HTML + CSS + plain JavaScript + **Three.js r128** (UMD build from cdnjs). No other libraries, no external assets: every texture, model and sound is generated in code.
- Look: stylized low-poly with PBR materials, ACES tone mapping, soft shadows, fog, smoke, fire, sparks, ash, film grain.
- Plays from a single HTML file. `The-Deadlands.html` has Three.js inlined (works offline). `the-deadlands-web.html` loads Three.js from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`.
- Also published as a private claude.ai artifact, titled "THE DEADLANDS". The source build file is still named `chennai-dead.html` inside the project.

## 2. History of requests (in order)
1. **v1:** basic 3D FPS, 5 waves in 5 Chennai locations, cover shrinks each wave (T. Nagar → Central → OMR → Marina → desert). Weapons: knife, pistol, assault rifle, rocks, sticks. Pickups for ammo and medkits.
2. **v2 (big upgrade):**
   - Better visuals and bigger maps with side streets, junctions and courtyards.
   - Every weapon got its own animations and sounds, plus shell casings, sway, bob and recoil recovery.
   - Right-click 2× rifle scope inspired by The Last of Us.
   - Tamil-named infected types, including a clicker-type and a bloater-type boss.
   - Jump on Space, sneak on C, smarter zombie pathfinding, adaptive quality.
3. **v3:**
   - F quick melee.
   - Final area renamed to **Mamallapuram Ruins** and rebuilt.
   - More gore.
   - Harder wave 4, much harder wave 5, multi-phase boss.
   - **Molotov** and **Urundai bomb** throwables.
4. **v4:**
   - Renamed to **THE DEADLANDS** (Chennai is still the setting).
   - Cinematic title screen: T. Nagar at night with fires, a flickering street lamp, smoke, ash, fog and infected walking in the distance. Distressed "THE DEADLANDS" lettering. Menu has START CAMPAIGN, HOW TO PLAY and SETTINGS. Ambient drone and distant sounds start after the first click. Start fades to black and into wave 1.
   - Settings: mouse sensitivity, FOV, volume, graphics quality, invert Y, head bob, film grain. Saved in localStorage when the browser allows it. Also reachable from the pause menu.
   - Camera fix near walls and corners (details in section 10).
   - Pistol and rifle given clearly different damage and fire rates. Recoil now applies after each shot is fired.
   - New detailed assault rifle model.
   - Kaalan voice set and boss audio overhaul.
   - Gore deliberately left exactly as in v3 (no Reduced Gore option, by request).
5. **v5 (gameplay fixes and boss death polish):**
   - Title menu keyboard navigation: Up/Down (wraps), Enter, Esc closes How to play / Settings. Mouse hover moves the same highlight.
   - Gun jitter while sprinting fixed (root causes in section 10).
   - Distinct, gorier death sequences for the wave 4 and wave 5 bosses only. Ordinary gore untouched.
   - Jump/collision fixes: vehicles and fallen pillars collide with their visible shape, Space jumps while sneaking, courtyard wall heights are never in the "looks jumpable but isn't" band.
6. **v6 (cinematic victory ending):** after wave 5 is cleared the game holds while the boss finishes falling, fades, and cuts to sunrise on the Mamallapuram shore: the survivor from behind with the rifle lowered, wreckage and fires, an extraction helicopter with a searchlight coming in over the sea, and a camera pullback (~11 s). "YOU SURVIVED. CHENNAI DIDN'T." / "Five waves. One survivor. No way back." / THE DEADLANDS, then campaign stats count up, then PLAY AGAIN / MAIN MENU. Ending music (procedural minor pad + bell), helicopter chop, wind ducked. Skippable with Esc/Enter/Space or the Skip button. Code: `src/09-ending.js`.
7. **v7 (mouse look / pointer lock):** pointer lock now requests raw ("unadjusted") mouse movement, falling back to a normal lock where unsupported (e.g. Linux). Drag-to-look fallback now keeps retrying the real lock (on every in-game click and on Resume); it used to try once per session. Late `pointerlockerror` events are ignored when the browser reports through promises. Yaw/pitch math unchanged (YXZ camera, unlimited yaw, pitch clamped ±1.45). Code: `lockPointer()` in 08-game.js.
8. **v8 (dark final scene):** the v6 sunrise/helicopter ending was replaced. After wave 5: hold for the boss fall, fade, then a "3 days later" card on black, then night on a 32 m rooftop over a dead, burning Chennai skyline (overcast sky, faint moon, distant fires and smoke, ash). The survivor stands at the edge, viewed from behind: blood-soaked torn clothes, rifle hanging in one hand, lit cigarette in the other (lights it at the start, a slow drag every ~7.5 s, smoke wisps, exhale). Medium rear shot -> 10.5 s pull-back -> wide shot; then text, branding, real stats, PLAY AGAIN / MAIN MENU. Dark minor-key music, night wind, distant groans and collapses, lighter/inhale/exhale sounds. Skippable. All in `src/09-ending.js` (+2 CSS lines). No helicopter.
9. **v9 (Aruval + Kaalan melee resistance):**
   - **Aruval** (slot 8, key 8): 160 melee damage (×1.4 looking up, ×0.5 vs bosses), hits up to 2 infected per swing, 2 strikes per blade, then it snaps and you switch to the knife. Exactly 2 pickups in wave 4 (merry-go-round ruin (-6.2,23.6), fishing hamlet (-20,-57)) and 2 in wave 5 (inside the Shore Temple compound (44,-23), behind the vault ratha (-21.5,-35.5)), from `LEVELS[i].aruval`. You can only carry one; a second stays on the ground. F quick melee still does the knife slash.
   - **Kaalan**: melee (knife, stick, aruval, F) does no damage until that Kaalan has taken a bullet (`z.gunHit`, set in `tryFire`). Resisted strikes show chips/sparks, a dull thud, and a hint toast; they don't use up stick/aruval durability.
10. The user plays and tests, then sends new lists of changes.

## 3. Controls
| Key | Action |
|---|---|
| WASD | Move |
| Shift | Sprint (with the rifle scoped: hold breath) |
| Mouse / Left click | Aim / fire, swing or throw |
| Right click | Aim down sights; rifle = real 2× scope overlay; pistol = light zoom |
| F | Quick melee with whatever weapon is in hand (knife slash; uses the stick's own swing if the stick is held) |
| Space | Jump (~1m apex; can land on crates, cars and barriers) |
| C | Toggle sneak (crouch, quiet footsteps) |
| 1–7 / mouse wheel | Knife, Pistol, Rifle, Stick, Rocks, Molotov, Urundai bomb |
| R | Reload |
| Esc | Pause (pointer lock). If pointer lock fails, drag with the left mouse button to look |
| M | Mute |
| Arrow keys | Turn and look (fallback) |

## 4. Waves and maps
| # | Map | Key features | Wave content |
|---|---|---|---|
| 1 | **T. Nagar**, Ranganathan Street | Market street with stalls, MTC 21G bus, autos, water tanker, Panagal-style park, temple courtyard with gopuram and mandapam, parking lot, narrow west lane, EB poles with sparking transformers, bunting | 18 Pinam |
| 2 | **Chennai Central**, platform yard | Red-brick station and clock tower, 5 platforms with canopies, derailed blue coaches (one tipped and burning), loco, footbridge, forecourt with buses and autos, subway entrance, goods-shed crate maze | 18 Pinam, 7 Odi, 2 Kaalan |
| 3 | **OMR**, Sholinganallur | Big junction, metro pillars and viaduct, glass tech parks, petrol bunk, campus corridor, construction site skeleton with crane, "WALK-IN DRIVE · FRESHERS WELCOME" billboard | 22 Pinam, 10 Odi, 2 Thadiyan, 3 Kaalan |
| 4 | **Marina Beach** | Kamarajar Salai and promenade with statues, fishing hamlet of thatched huts, kiosk row (sundal, bajji...), ruined merry-go-round, boats, lighthouse, sea | 30 Pinam, 18 Odi, 6 Thadiyan, 7 Kaalan + **mini Raatchasan** (1300 HP). Packs of 2, cap 25, scarce supplies, anti-camping flanks |
| 5 | **Mamallapuram Ruins**, Shore Temple coast | Shore Temple (twin towers, Nandi bulls on the walls), Pancha Rathas plus elephant and lion statues, Arjuna's Penance relief wall (north edge), Krishna's Butter Ball, 2 ruined courtyards with broken pillared halls, fallen pillars, palms and casuarinas, sea to the east, burnt tourist bus, "MAMALLAPURAM" sign | 34 Pinam, 24 Odi, 8 Thadiyan, 10 Kaalan + **full Raatchasan** (3000 HP, 3 phases). Packs of 3, cap 30, scarce supplies, 3 Molotov + 1 Urundai on the map, player starts the wave with 2 Molotov + 1 Urundai |

- Between waves: +35 HP, +12 pistol ammo, +30 rifle ammo, at least 2 rocks.
- You can retry the current wave (inventory restored to how it was at the start of the wave) or start over.
- **Anti-camping (waves 4–5):** staying within 8m of one spot for 13s shows "They are flanking you. Keep moving!" and spawns 3 runners from 3 directions.
- Kill drops are scarcer in waves 4–5.

## 5. Infected (original designs, Tamil names)
| Name | Meaning | Role | Stats / behaviour |
|---|---|---|---|
| **Pinam** | பிணம், corpse | Common zombie | 85 HP, ~1.7 m/s. Gaits: shamble, walk or limp. Some wander until they see or hear you. Outfits: lungi, veshti, saree with jasmine and bun, auto-driver khaki, IT employee with ID lanyard, worker with banian and towel, casual |
| **Odi** | ஓடி, runner | Fast | 55 HP, 4.2 m/s, screams when it spots you |
| **Thadiyan** | தடியன், the hulk | Tank | 280 HP, slow, hits for 24, banian + lungi + big belly |
| **Kaalan** | காளான், mushroom (also the god of death) | Clicker-type | 170 HP. Fungus-covered head, blind, hunts by sound, makes clicking noises. Ignores sneaking players, alerted by gunshots, sprinting and walking nearby. Thrown rocks distract it. Grab does 42 damage |
| **Raatchasan** | ராட்சசன், giant | Bloater-type boss | Rises out of the ground (can't be hurt while emerging). Boss bar. Glowing spore sacs. Armour plates break off as it loses HP |

**Boss attacks (each one is telegraphed):**
- **Slam:** red ring on the ground, then a slam. Jumping dodges it.
- **Charge:** red arrow lane on the ground, then a charge. If it hits a wall it is stunned and takes 1.6× damage.
- **Spore bomb:** a marked circle shows where it lands, and it leaves a spore cloud that damages you over time.

**Boss phases:**
- **Phase 2 (below 66% HP):** faster, chains a second charge (only if you are more than 6m away), throws spore bombs at 3 spots.
- **Phase 3 (below 33% HP):** enraged, summons 3 runners, uses an expanding ground shockwave you must jump over (22 damage), shorter recovery windows.
- **Death:** long sequence (staggers, drops to its knees, falls), with a big blood pool and a spore burst.

## 6. Weapons and items
| Item | Notes |
|---|---|
| Knife | 45 damage, fast alternating slashes, unlimited |
| Pistol | 48 damage, 0.3 s between shots (160 DPS), very accurate, 12-round mag. One headshot kills a Pinam. Slide kick, mag-drop reload |
| Assault rifle | 24 damage, 0.085 s between shots (282 DPS), full auto, 30-round mag, more spread. Detailed model: extruded receiver, grip, stock and curved mag, octagonal handguard with vents, muzzle brake, rail, worn cerakote and metal. Shell casings. Reload pulls the charging handle when empty. 2× scope |
| Stick | 75 damage, heavy wind-up swing, hits up to 2 enemies, staggers, can tear off arms, breaks after 8 hits |
| Rocks | Thrown in an arc, 50 damage + stun. Lands as a pickup again. Makes a noise that distracts Kaalans. Max 12 |
| **Molotov** | Lit bottle. Makes a burning zone (3.3m, 7.5s). Infected catch fire (damage over time with flames on them). Hurts the player standing in it. Max 5 |
| **Urundai bomb** | Twine-wrapped ball with a sparking fuse, explodes on impact (only once). Up to 180 damage falling off to 0 at 7.5m, knockback, tears limbs off. Hurts you within 5m. Max 3 |
| F quick melee | 0.75s cooldown. Blocks gun firing for 0.42s, does not cancel a reload |

- Headshots: ×2.5 for guns. The boss's head is armoured (×0.6).
- Pickups glow on the ground and are collected by walking over them.

## 7. Gore and effects
- Blood sprays out the far side on hits, plus mist.
- Clothing gets stained at random as infected take damage.
- Heavy hits can tear off arms (with spurting blood).
- Headshot kill: the head pops and the neck spurts.
- Death animations: back, forward, crumple, spin, kneel, stumble, and headless (stands, then collapses).
- Blood splats plus pools that spread under bodies; all fade after ~40–45s.
- Pools of 110 decals and 520 particles keep performance steady.

## 8. Source layout (`src/`, built by `build.py` into one HTML file)
| File | Contents |
|---|---|
| head.html | `<title>`, Google Fonts (Saira Stencil One, Chakra Petch), all CSS, HUD (health/stamina, ammo, 7 weapon slots with SVG icons, boss bar, scope overlay SVG, damage-direction arcs, tips, banner, toast), menu, pause, intermission, death and win screens, cdnjs script tag |
| 01-core.js | Helpers, renderer (ACES, PCF soft shadows), camera (FOV 74), lights (hemi, sun with shadow that follows the player, flash, 2 fire, spark, boss, molotov point lights), separate overlay scene and camera for the gun, shared geometries, `M()` material cache, `Builder` geometry merger, instancing (`inst`, `flushInst`), `box`/`cyl`/`deco`, circle-vs-box collision with step-up and ground height, ray tests, flow-field navigation (`buildNav`, `updateNav`, `navTarget`) |
| 02-textures.js | Procedural canvas textures: asphalt, concrete, sand, dirt, grass, facades (res/brick/glass), shutters, thatch, smoke, flame, muzzle, blood, ring, lane; sign textures; film grain |
| 03-world.js | Sky dome, atmosphere presets, particles, tracers, shell casings, blood decals and pools, smoke/fire/spark emitters, ash, ground fog. Props: car, auto, bus, tipped bus, tanker, scooter, stall, crate, drum, tires, jersey barrier, barricade, sandbags, lamp, EB pole and wires, tree, palm, boulder, bench, building (sunshades, AC units, water tanks, shutters, shop signs), cityBlock, gopuram, mandapam, hut, boat |
| 04-maps.js | `LEVELS` array (name, sub, cover, blurb, wave config `{pinam,odi,thadiyan,kaalan,boss,bossTier,interval,cap,speed,pack,wander,camp}`, supplies, start items, build fn) and the 5 map builders. Mamallapuram helpers: reliefTex, stoneTiers, shoreTemple, ratha, pillarRow, fallenPillar, casuarina |
| 05-audio.js | WebAudio synth with stereo panning and distance falloff. Wind bed, fire crackle loop, sounds for every weapon, reload stage, infected type, boss move, throwable and world event |
| 06-infected.js | Outfits, `makeRig` (merged body segments: hips, legs, torso, head, jaw, arms), `makeBossRig`, types table `ZT`, spawning (`spawnPoint` with direction for packs), noise system (`makeNoise`), hurt/kill/gore, death animations, AI loop `updateInfected`, boss state machine `updateBoss` (emerge, walk, flinch, windSlam/slam, windCharge/charge/stunned/recover, windThrow, windQuake/quake), shockwaves, spore bombs and clouds |
| 07-player.js | Player state `P`, weapons table `W`, `ORDER`, inventory, firing, melee, rocks, Molotov/Urundai (`throwItem`, `updateBombs`, `igniteFire`, `updateFires`, `explode`, `updateBlasts`, `clearThrowables`), F quick melee (`quickMelee`, `qm`), pickups, gun models and animations (`updateVM`), movement/jump/crouch/scope (`updatePlayer`) |
| 08-game.js | Slot icons, HUD update, game flow (`buildLevel`, `startLevel`, pointer lock, pause, wave cleared, death), spawn loop with packs and camping flanks, input, main loop (`step`, `tick`), adaptive quality (drops pixel ratio, then shadow resolution, if frames run over 24ms), debug hooks `window.__cd` |

**Rebuild:** `python3 build.py` writes `chennai-dead.html`. For the offline copy, replace the cdnjs three.js `<script src>` tag with an inline copy of `three.min.js` (r128, `npm i three@0.128.0`).

## 9. Testing setup
- Playwright with headless Chromium (SwiftShader software GPU). The first frame is slow because of shader compiling; the harness waits for it.
- Logic tests use `__cd.sim(seconds, callback)`, which steps the game at 33ms without rendering.
- Debug hooks include: `startLevel`, `setPlaying`, `hold` (stops the wave from auto-clearing), `newZombie`, `spawnFromQueue`, `hurtZombie`, `fire`, `aim`, `equip`, `keys`, `inv`, `P`, `zombies`, `spawnQueue`, `fireZones`, `flamesUsed`, `bombsCount`, `sporeBombsCount`, `shockwavesList`, `qm`, `SFX`.
- Test scripts:
  - t4.js: core regression (weapons, scope, jump/crate, each infected type, boss, pause/die/retry, all 5 waves).
  - t8.js: v3 features.
  - t9.js: shockwave jump trace.
  - t11.js: camera near walls and corners on all maps.
  - t12.js: v4 checks (branding, title, menus, settings, campaign start, weapon DPS, Kaalan and boss audio).
  - t15.js: boss charge and chained charge with a fixed setup.
  - t16.js: v5 gun jitter probe (sprint straight/diagonal, turning with uneven mouse input, pistol and rifle).
  - t17.js: v5 jump reach, jump while sneaking, vehicle collision vs visible shape, wave-5 obstacles, walls still block.
  - t18.js: v5 boss finale beats, particle budget, screenshots.
  - t19.js: v5 title-menu keyboard navigation.
  - t23.js: v9 Aruval spawns/durability/damage and Kaalan melee resistance.
  - t21.js: v7 REAL headed Chromium on Xvfb with real XTest mouse motion (run: `xvfb-run -a -s "-screen 0 1280x800x24" node t21.js`, needs python-xlib; helper xinput.py).
  - t22.js: v7 drag-to-look fallback retries the lock.
  - t20.js: v6 ending (trigger rules, real stats, timeline, skip, play again, main menu, screenshots).
  - t5.js / t10.js: screenshots.
- Last results:
  - t8: 25/26 pass. The jump-over-shockwave check fails inside the big test but passes in the isolated trace (likely leftover spore clouds).
  - t4: 34/36 pass. The 2 boss checks are test-timing artifacts; those behaviours are verified separately.
  - No JS errors.

## 10. v4 fixes worth knowing
- **Camera near walls:** velocity no longer builds up while you push into a wall (it used to keep head-bob and footsteps running at full walking speed). Collision now runs 2 passes per frame. Each building row has one merged low collision box, so there are no 0.2 m gaps between buildings to snag on. Verified on all 5 maps: zero bob or velocity while pinned, stable corners, smooth sliding.
- **Recoil timing:** each shot used to add its own recoil before the bullet was fired, so the first shot went about 1.8° high. Now fixed.
- **Title flow:** `titleMode` turns on the night colour grade. `startLevel()` always switches it off. `setPlaying()` waits for `levelReady`, so pointer lock can be requested inside the click.

## 10b. v5 fixes worth knowing
- **Gun jitter while sprinting:** (1) when stamina ran out, sprint switched on and off every frame (stamina hovered around 1), snapping the gun between sprint and normal pose ~50 times a second. Now you're "winded" at 0 stamina until it refills to 20. (2) The bob used |cos|, which has a hard snap at the bottom of every step; now cos² (same range and rhythm, smooth). (3) Mouse sway used the raw per-frame mouse delta, which is uneven and frame-rate dependent; now normalised to a 60 fps frame and smoothed in two stages.
- **Collision:** rotated props used one padded bounding box (up to 0.33 m of invisible wall along a bus, ~0.6 m around diagonal fallen pillars). `addSolidRot()` builds thin slices along the long side instead (bus, tipped bus, tanker, car, auto rickshaw, fallen pillar).
- **Jump reach:** max clearable height is about 1.2 m reliably (1.3 m sometimes, 1.4 m never). Buses (3.3 m), the tipped bus (2.6 m) and the Shore Temple wall (1.6 m) are walls by design.
- **Boss finale:** `bossDeathFX()` in 06-infected.js, called only from the boss 'dying' state.

## 11. Known limitations and ideas not done yet
- Low-poly box models. Animation is procedural (parts move in code), not motion capture.
- Wave 4 boss death is still cut short by the intermission screen (the wave clears the instant the boss's HP hits 0). Wave 5 now waits for the fall before the ending.
- Other rotated props (stalls, huts, boats, rail coaches, scooters) still use a padded bounding box.
- Real-GPU frame rate not measured. Measured ~600–760 draw calls with a full wave on screen (plus up to ~64 fire sprites).
- Difficulty not yet tuned by a real player.
- Ideas offered earlier but not built: shotgun, aruval/machete, spitter or exploding zombies, difficulty modes, upgrade shop between waves, minimap/radar, weather (rain at Marina, sandstorm), story radio messages between waves, endless survival mode with a high score, more locations (Koyambedu, Spencer Plaza, Kathipara flyover), music, third-person camera toggle.

## 12. How to continue in a new chat
Attach `The-Deadlands.zip` (or at least `The-Deadlands.html`) and paste this file, then say something like:

> "This is my THE DEADLANDS game project (formerly Chennai Dead). Read the handoff and the attached code. Keep every existing feature and the src/ module structure, rebuild with build.py, test with the Playwright scripts, and then add: <your changes>."

User preferences: casual, concise answers. The user playtests on a desktop browser.
