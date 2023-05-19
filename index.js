// https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=01/11/2019&dadosConsulta.dtFim=29/11/2019&dadosConsulta.cdCaderno=-11&dadosConsulta.pesquisaLivre="Alex+Aparecido+Pereira+Martines"
//
const puppeteer = require('puppeteer');
//
async function fazerWebScraping() {
	// Inicie o navegador Puppeteer
	const browser = await puppeteer.launch({
		headless: false,
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"],
		timeout: 0
	});
	//
	const page = await browser.newPage();
	// Set screen size
	await page.setViewport({
		width: 1366,
		height: 768,
		deviceScaleFactor: 1,
	});
	//
	// Navegue até a página desejada
	const url = 'https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=01/11/2019&dadosConsulta.dtFim=29/11/2019&dadosConsulta.cdCaderno=-11&dadosConsulta.pesquisaLivre="Alex+Aparecido+Pereira+Martines"';
	await page.goto(url);
	//
	await page.waitForSelector(".spwBotaoDefault");
	// Realize as operações de scraping aqui
	//
	// Aguarda o seletor que representa a tabela ficar visível
	await page.waitForSelector('tr.ementaClass');
	//
	/*
	// Obtenha os elementos <tr> com as classes "ementaClass" e "ementaClass2"
	const rows = await page.$$eval('tr.ementaClass, tr.ementaClass2, a.layout', (elements) =>
		elements.map((element) => element.innerText)
	);
	//
	// Crie um array de objetos contendo os dados das linhas da tabela
	const data = rows.map((row) => {
		const [title, description, link] = row.split('\n');
		return { title, description, link};
	});
*/
	const dados = await page.evaluate(() => {
		const token = document.querySelector('input[name="recaptcha_response_token"]').innerText.trim();
		const tabela = document.querySelectorAll('tbody tr.fundocinza1');
		const resultados = [];
		tabela.forEach((linha) => {
			const title = linha.querySelector('tr.ementaClass td').innerText.trim();
			const description = linha.querySelector('tr.ementaClass2 td').innerText.trim();
			const link = linha.querySelector('a.layout').getAttribute('onclick');
			const padrao = /'([^']+)'/;
			const match = link.match(padrao);
			const linkRes = match && match[1];
			resultados.push({
				title: title,
				description: description,
				link: `https://esaj.tjms.jus.br/cdje/consultaSimples.do?${linkRes}&recaptcha_response_token=${token}`,
				token: token,
			});
		});

		return resultados;
	});
	// Feche o navegador Puppeteer
	await browser.close();
	//
	return dados;
}
//
fazerWebScraping().then(async (data) => {
	console.log(JSON.parse(JSON.stringify(data)));
}).catch((error) => {
	console.error(error);
});