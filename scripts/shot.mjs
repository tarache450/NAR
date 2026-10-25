import { chromium } from 'playwright';

const [, , url = 'http://localhost:3000', out = 'shot.png', selector = '', wait = '2500'] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(Number(wait));

if (selector) {
  const el = page.locator(selector).first();
  await el.evaluate((node) => node.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(900);
  await el.screenshot({ path: out, animations: 'disabled' });
} else {
  await page.screenshot({ path: out, animations: 'disabled' });
}

await browser.close();
console.log('saved', out);
