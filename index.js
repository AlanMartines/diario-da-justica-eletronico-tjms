const puppeteer = require('puppeteer');
//
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', 'disable-setuid-sandbox', '--use-gl=egl']
  });
  //
  const page = await browser.newPage();
  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });
  //
  await page.goto('https://esaj.tjms.jus.br/cdje/consultaAvancada.do');
  await page.screenshot({
    path: 'example.png'
  });
  await browser.close();
})();