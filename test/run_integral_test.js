const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const puppeteer = require('puppeteer');

  const projectRoot = path.resolve(__dirname, '..');
  const htmlPath = path.resolve(projectRoot, 'demo_integral_rule_test.html');
  if (!fs.existsSync(htmlPath)) {
    console.error('Test page not found:', htmlPath);
    process.exit(2);
  }

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const fileUrl = pathToFileURL(htmlPath).toString();
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 });

    // Ensure MathJax and our normalizer are loaded
    await page.waitForSelector('#run', { timeout: 60000 });
    await page.waitForFunction(() => window.MathJax && typeof MathJax.tex2mml === 'function', { timeout: 60000 });

    // Click Run
    await page.click('#run');

    // Wait for result to be filled
    await page.waitForFunction(() => {
      const el = document.querySelector('#result');
      return el && el.textContent && el.textContent.trim().length > 0;
    }, { timeout: 60000 });

    const result = await page.$eval('#result', el => el.textContent.trim());
    const raw = await page.$eval('#raw', el => el.textContent);
    const norm = await page.$eval('#norm', el => el.textContent);

    console.log('Result:', result);
    if (result !== 'PASS') {
      console.log('--- Raw MathML ---');
      console.log(raw);
      console.log('--- Normalized MathML ---');
      console.log(norm);
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (e) {
    console.error('Test error:', e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();


