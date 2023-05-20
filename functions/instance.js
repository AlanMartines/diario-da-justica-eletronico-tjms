//
const browserObject = require('../browser');
const { logger } = require("../utils/logger");
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
module.exports = class Instance {
	//
	static async searchAdvanced(dtInicio, dtFim, cdCaderno, pesquisaLivre) {
		let browser;
		try {
			//Start the browser and create a browser instance
			browser = await browserObject.startBrowser();;
			let page = await browser.newPage();
			logger?.info(`- Navigating...`);
			// Navigate to the selected page
			await page.goto(`https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=${dtInicio}&dadosConsulta.dtFim=${dtFim}&dadosConsulta.cdCaderno=${cdCaderno}&dadosConsulta.pesquisaLivre=${pesquisaLivre}`);
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
			logger?.info(`- Paginas: ${valorPaginas}`);
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
						logger?.info(`- Clique na função trocaDePg ${i} realizado com sucesso`);
						//
						// Acionar o evento de clique no elemento
						await linkElement.click();
						//
					} else {
						logger?.error('- Elemento não encontrado.');
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
					logger?.error(`- Erro. ${error.message}`);
				});
			}
			//
			// Feche o navegador Puppeteer
			await browser.close();
			//
			return {
				"erro": false,
				"status": 200,
				"message": 'Pesquisa efetuada com sucesso.',
				"search": resultados
			};
			//
		} catch (error) {
			logger?.error(`- Erro, ${error.message}`);
			return {
				"erro": true,
				"status": 401,
				"message": 'Erro, não foi possivel efetuar a pesquisa.',
				"search": error?.message
			};
			//
		}
	} //Status
	//
	// ------------------------------------------------------------------------------------------------------- //
	//
}