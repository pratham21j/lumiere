/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3789/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // let load animations finish
  await page.screenshot({ path: 'shots/landing-hero.png' });
  await page.evaluate(() => document.getElementById('features')?.scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/landing-features.png' });
  await page.evaluate(() => document.getElementById('how')?.scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/landing-how.png' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/landing-footer.png' });

  // Mobile
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto('http://localhost:3789/', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(2500);
  await mobile.screenshot({ path: 'shots/landing-mobile.png' });

  await browser.close();
  console.log('done');
})();
