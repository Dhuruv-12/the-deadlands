// usage: node t2.js <scenario> ; harness for the upgraded build
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = __dirname;
async function open() {
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(path.join(dir, 'chennai-dead.html'), 'utf8') + '</body></html>';
  const three = fs.readFileSync(path.join(dir, 'node_modules/three/build/three.min.js'), 'utf8');
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERR ' + e.message + ' @ ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('Failed to load resource')) errors.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ body: three, contentType: 'application/javascript' });
    if (u.startsWith('http://test.local')) return r.fulfill({ body: html, contentType: 'text/html' });
    return r.abort();
  });
  await page.goto('http://test.local/');
  await page.waitForFunction(()=>window.__cd&&__cd.renderer.info.render.frame>2,null,{timeout:180000});
  page.setDefaultTimeout(180000);
  return { browser, page, errors };
}
module.exports = { open, dir };
if (require.main === module) {
  (async () => {
    const { browser, page, errors } = await open();
    const sc = process.argv[2] || 'menu';
    if (sc === 'menu') {
      await page.screenshot({ path: path.join(dir, 'v2-menu.png') });
    } else if (sc === 'maps') {
      await page.evaluate(() => { __cd.forceFallback(); document.getElementById('startBtn').click(); });
      for (let i = 0; i < 5; i++) {
        const t0 = Date.now();
        const info = await page.evaluate((i) => { __cd.startLevel(i, i > 0); __cd.setPlaying(); __cd.sim(0.5); return { solids: __cd.solids.length, calls: 0 }; }, i);
        await page.waitForTimeout(1200);
        const r = await page.evaluate(() => { const i = __cd.renderer.info; return { calls: i.render.calls, tris: i.render.triangles, geos: i.memory.geometries, tex: i.memory.textures }; });
        console.log('map', i, JSON.stringify(info), JSON.stringify(r), 'build+render ms', Date.now() - t0);
        await page.screenshot({ path: path.join(dir, `v2-map${i}.png`) });
      }
    }
    console.log(errors.slice(0, 20).join('\n') || 'no errors');
    await browser.close();
  })();
}
