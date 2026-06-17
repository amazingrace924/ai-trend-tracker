import { chromium } from 'playwright';
const log = (...a) => console.log(...a);
const browser = await chromium.launch();
const page = await browser.newPage();

const resp = [];
page.on('response', async r => {
  const u = r.url();
  if (u.includes('allorigins') || u.includes('translate.googleapis')) {
    resp.push(r.status()+' '+(u.includes('translate')?'translate':'proxy')+' '+u.slice(0,70));
  }
});

await page.goto('http://localhost:3000/news/', { waitUntil: 'networkidle' });
const btn = page.getByRole('button', { name: /새로고침|불러오는/ });
const initialCount = await page.locator('ol > li').count();
log('Initial items:', initialCount);

const t0 = Date.now();
await btn.click();
log('clicked refresh');

// Wait until loading finishes: button text returns to 새로고침 (not disabled)
try {
  await page.getByRole('button', { name: '새로고침' }).and(page.locator(':not([disabled])')).waitFor({ timeout: 90000 });
} catch(e) { log('WARN: button did not re-enable within 90s'); }
const elapsed = ((Date.now()-t0)/1000).toFixed(1);
log('refresh finished in', elapsed, 's');

await page.waitForTimeout(800);
const barText = (await page.locator('div.space-y-4 > div').first().innerText()).replace(/\n/g,' | ');
log('RESULT bar:', JSON.stringify(barText));
const finalCount = await page.locator('ol > li').count();
log('Final items:', finalCount, 'delta', finalCount-initialCount);
log('NEW badges:', await page.getByText('New', { exact: true }).count());
await page.screenshot({ path: 'news-result.png' });

log('--- network responses ('+resp.length+') ---');
resp.forEach(r => log(' ', r));
await browser.close();
