// QA automatizado del propio flow-report: errores de consola, Play story,
// capitulos, temas y export. Uso: node scripts/qa-flow.js
const { chromium } = require('@playwright/test');

(async () => {
  const out = { errors: [], checks: {} };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('console', (m) => {
    if (m.type() === 'error') out.errors.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => out.errors.push(String(e).slice(0, 200)));
  await page.goto('file:///C:/Users/USUARIO/greenbox/flow-report/index.html');
  await page.waitForTimeout(800);
  out.checks.chapters = await page.locator('.chap').count();
  out.checks.beats = await page.evaluate(() => document.querySelectorAll('.node').count ?? document.querySelectorAll('.node').length);
  // Play story: avanza 2 beats
  await page.click('#playBtn');
  await page.waitForTimeout(3600);
  out.checks.beatText = await page.locator('#beat').textContent();
  out.checks.gcount = await page.locator('#gcount').textContent();
  out.checks.hot = await page.locator('.node.hot').count();
  await page.screenshot({ path: 'flow-qa-play.png' });
  // Capitulo: clic al 3ro
  await page.locator('.chap').nth(2).click();
  await page.waitForTimeout(600);
  out.checks.chapTitle = await page.locator('#chapTitle').textContent();
  // Tema dark->light
  await page.click('#themeBtn');
  await page.waitForTimeout(300);
  out.checks.theme = await page.evaluate(() => document.documentElement.dataset.theme);
  // Menu Flow: project planes
  await page.click('#flowBtn');
  await page.click('#flowMenu button[data-m="proj"]');
  await page.waitForTimeout(400);
  out.checks.planes = await page.evaluate(() => (document.querySelector('#ovwrap').innerHTML.match(/PLANE/g) || []).length);
  await page.screenshot({ path: 'flow-qa-proj.png' });
  // Export menu abre
  await page.click('#exportBtn');
  out.checks.exportOpen = await page.locator('#exportMenu.open').count();
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => {
  console.log(JSON.stringify({ fatal: String(e).slice(0, 300) }));
  process.exit(1);
});
