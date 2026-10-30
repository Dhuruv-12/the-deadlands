// v7 fallback check (headless): if pointer lock is unavailable the game drops to drag-to-look, and now keeps retrying the lock
const { open } = require('./t2.js');
(async () => { const { browser, page, errors } = await open();
  await page.evaluate(() => { const c = document.querySelector('canvas'); window.__req = 0; c.requestPointerLock = () => { __req++; return Promise.reject(Object.assign(new Error('blocked'), { name: 'SecurityError' })); }; });
  await page.click('#startBtn'); await page.waitForFunction(() => __cd.state === 'playing', null, { timeout: 60000 }); await page.waitForTimeout(800);
  const a = await page.evaluate(() => ({ fallback: __cd.fallbackLook, req: __req, state: __cd.state }));
  await page.mouse.click(400, 300); await page.waitForTimeout(200);
  const b = await page.evaluate(() => ({ req: __req }));
  await page.evaluate(() => __cd.pause()); await page.click('#resumeBtn'); await page.waitForTimeout(300);
  const c = await page.evaluate(() => ({ req: __req, state: __cd.state }));
  const ok1 = a.fallback && a.state === 'playing', ok2 = b.req > a.req, ok3 = c.req > b.req && c.state === 'playing';
  console.log(ok1 ? 'PASS' : 'FAIL', 'lock blocked -> plays in drag-to-look', JSON.stringify(a));
  console.log(ok2 ? 'PASS' : 'FAIL', 'clicking in game retries the lock', JSON.stringify(b));
  console.log(ok3 ? 'PASS' : 'FAIL', 'Resume retries the lock (old code never did)', JSON.stringify(c));
  console.log('errors', errors.length, errors.slice(0, 3)); await browser.close(); })();
