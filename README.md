# THE DEADLANDS (v9)
Post-apocalyptic Chennai survival-horror FPS in the browser. HTML + CSS + JavaScript + Three.js r128, no other assets.

## Play
- **The-Deadlands.html**: double-click to play offline (Three.js inlined). Chrome or Edge with keyboard and mouse.
- **the-deadlands-web.html**: lighter copy that loads Three.js from cdnjs.

## Controls
WASD move · Shift sprint · Mouse aim · Click fire · Right-click aim / rifle 2× scope (Shift = hold breath) · F quick melee · Space jump · C sneak · 1–7 / wheel weapons (knife, pistol, rifle, stick, rocks, Molotov, Urundai) · R reload · Esc pause · M mute. Settings: title screen or pause menu.

## Build and test
- `python3 build.py` rebuilds the HTML from `src/`.
- To make the offline copy, inline three.min.js r128.
- Tests use Playwright (`npm i playwright three@0.128.0`).
- Full details are in THE-DEADLANDS-HANDOFF.md.
