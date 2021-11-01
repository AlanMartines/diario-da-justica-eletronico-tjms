const puppeteer = require('puppeteer');
//
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });

  let postData = {
    'dadosConsulta.dtInicio': '02/11/2020',
    'dadosConsulta.dtFim': '03/11/2021',
    'dadosConsulta.cdCaderno': '-11',
    'dadosConsulta.pesquisaLivre': '"Alex Aparecido Pereira Martines"'
  };

  await page.goto('https://esaj.tjms.jus.br/cdje/consultaAvancada.do');
  await page.screenshot({
    path: 'example.png'
  });
  await browser.close();
})();