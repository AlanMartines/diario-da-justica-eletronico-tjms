const puppeteer = require('puppeteer');
//
let scrape = async () => {
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

  await page.setRequestInterception(true);
  page.once('request', request => {
    var data = {
      'method': 'POST',
      'postData': querystring.stringify(postData),
      'headers': {
        ...request.headers(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    };

    request.continue(data);

    // Immediately disable setRequestInterception, or all other requests will hang
    page.setRequestInterception(false);
  });
  //
  await page.goto('https://esaj.tjms.jus.br/cdje/consultaAvancada.do');
  const result = await page.evaluate(() => {
    /*
    const books = [];
    document.querySelectorAll('section > div > ol > li img');
      .forEach((book) => books.push(book.getAttribute('alt')));
    return books;
		*/
  });
  browser.close();
  return result;
};
//
scrape().then((value) => {
  console.log(value);
});