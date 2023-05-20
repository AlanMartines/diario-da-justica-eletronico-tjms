// https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=01/11/2019&dadosConsulta.dtFim=29/11/2022&dadosConsulta.cdCaderno=-11&dadosConsulta.pesquisaLivre="Alex+Aparecido+Pereira+Martines"
//
const puppeteer = require('puppeteer');
//
async function obterValorDaTabela(page) {
	//
	if (page) {
		//
		return await page.evaluate(() => {
			let token = document.querySelector('input[name="recaptcha_response_token"]').innerText.trim();
			let tabela = document.querySelectorAll('tbody tr.fundocinza1');
			let res = [];
			tabela.forEach(async (linha) => {
				let title = linha.querySelector('tr.ementaClass td').innerText.trim();
				let description = linha.querySelector('tr.ementaClass2 td').innerText.trim();
				let link = linha.querySelector('a.layout').getAttribute('onclick');
				let padrao = /'([^']+)'/;
				let match = link.match(padrao);
				let linkRes = match && match[1];
				res.push({
					title: title,
					description: description,
					link: `https://esaj.tjms.jus.br/cdje/consultaSimples.do?${linkRes}&recaptcha_response_token=${token}`,
					token: token,
				});
			});
			return res;
		});
		//
	} else {
		return [];
	}

}
//
async function fazerWebScraping() {
	// Inicie o navegador Puppeteer
	const browser = await puppeteer.launch({
		headless: false,
		args: [
			'--log-level=3',
			'--disable-extensions',
			'--disable-background-networking',
			'--disable-background-timer-throttling',
			'--disable-backgrounding-occluded-windows',
			'--disable-breakpad',
			'--disable-client-side-phishing-detection',
			'--disable-component-update',
			'--disable-default-apps',
			'--disable-dev-shm-usage',
			'--disable-domain-reliability',
			'--disable-features=site-per-process',
			'--disable-hang-monitor',
			'--disable-ipc-flooding-protection',
			'--disable-notifications',
			'--disable-offer-store-unmasked-wallet-cards',
			'--disable-popup-blocking',
			'--disable-print-preview',
			'--disable-prompt-on-repost',
			'--disable-renderer-backgrounding',
			'--disable-setuid-sandbox',
			'--disable-speech-api',
			'--disable-sync',
			'--hide-scrollbars',
			'--ignore-certificate-errors',
			'--ignore-certificate-errors-spki-list',
			'--metrics-recording-only',
			'--mute-audio',
			'--no-default-browser-check',
			'--no-first-run',
			'--no-pings',
			'--no-sandbox',
			'--no-zygote',
			'--password-store=basic',
			'--use-gl=swiftshader',
			'--use-mock-keychain',
			'--single-process',
			'--disable-gpu'
		],
		ignoreHTTPSErrors: true,
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
	const url = 'https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=01/11/2019&dadosConsulta.dtFim=29/11/2022&dadosConsulta.cdCaderno=-11&dadosConsulta.pesquisaLivre="Alex+Aparecido+Pereira+Martines"';
	await page.goto(url);
	//
	await page.waitForSelector(".spwBotaoDefault");
	// Realize as operações de scraping aqui
	//
	// Aguarda o seletor que representa a tabela ficar visível
	await page.waitForSelector('tr.ementaClass');
	//
	// Obtenha o valor desejado
	let valorPaginas = await page.evaluate(() => {
		let tabela = document.querySelector('#divResultadosSuperior table');
		let celula = tabela.querySelector('td');
		let resPg = celula.innerText.trim().split(' ');
		//
		return {
			pgInicial: parseInt(resPg[1]),
			pgFinal: parseInt(resPg[3]),
			resTotal: parseInt(resPg[5]),
			tPag: Math.ceil(resPg[5] / 10)
		};
	});
	//
	console.log('Paginas:', valorPaginas);
	//
	let resultados = [];
	//
	if (valorPaginas.tPag >= 2) {
		for (let i = 2; i <= valorPaginas.tPag; i++) {
			//
			let resTable = await obterValorDaTabela(page).then(async (data) => {
				return data;
			}).catch((error) => {
				console.error(error.message);
			});
			//
			//const formattedJson = JSON.stringify(resTable, null, 2).replace(/^\[|\]$/g, '');
			//console.log(resTable);
			//
			//resultados.push(resTable);
			resultados = resultados.concat(resTable);
			//
			// Localizar o elemento <a> com o atributo onclick="trocaDePg(2);"
			const linkElement = await page.$(`a[onclick="trocaDePg(${i});"]`);
			//
			// Localizar o elemento <a> com onclick="trocaDePg(2)"
			if (linkElement) {
				console.log(`Clique na função trocaDePg ${i} realizado com sucesso`);
				//
				// Acionar o evento de clique no elemento
				await linkElement.click();
				//
			} else {
				console.log('Elemento não encontrado.');
			}
			//
			// Aguardar algum tempo para que a página seja atualizada, se necessário
			await page.waitForTimeout(2000);
			//
		}
	} else {
		resultados = await obterValorDaTabela(page).then(async (data) => {
			return data;
		}).catch((error) => {
			console.error(error.message);
		});
	}
	//
	// Feche o navegador Puppeteer
	await browser.close();
	//
	return resultados;
}
//
(async () => {
	let resJson = await fazerWebScraping().then(async (data) => {
		return JSON.stringify(data, null, 2);
	}).catch(async (error) => {
		console.error(error);
	});
	//
	const jsonData = JSON.parse(resJson);
	console.log(jsonData);
	//
	/*
	jsonData.forEach((item) => {
		console.log(item.title)
		console.log(item.description)
		console.log(item.link)
	});
	*/
	//
})();