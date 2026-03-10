//
const axios = require('axios');
const fs = require('fs-extra');
const fileType = require('file-type');
const browserObject = require('../browser');
const { logger } = require("../utils/logger");

let browserInstance;

async function getBrowser() {
	if (!browserInstance || !browserInstance.isConnected()) {
		browserInstance = await browserObject.startBrowser();
	}
	return browserInstance;
}

async function downloadPdfAndConvertToBase64(url) {
	try {
		const response = await axios.get(url, { 
			responseType: 'arraybuffer',
			timeout: 30000 // 30 segundos de timeout
		});
		const buffer = Buffer.from(response.data, 'binary');
		const base64Data = buffer.toString('base64');
		const fileInfo = await fileType(buffer);
		const mimeType = fileInfo?.mime || 'application/pdf';

		logger?.info(`- PDF baixado e convertido para base64 com sucesso`);

		return {
			"erro": false,
			"status": 200,
			"message": 'PDF baixado e convertido para base64 com sucesso',
			"result": { data: base64Data, mimetype: mimeType }
		};
	} catch (error) {
		logger?.error(`- Ocorreu um erro ao baixar o PDF: ${error.message}`);
		return {
			"erro": true,
			"status": error.response?.status === 404 ? 404 : 500,
			"message": 'Ocorreu um erro ao baixar o PDF',
			"search": error?.message
		};
	}
}

async function obterValorDaTabela(page) {
	if (page) {
		return await page.evaluate(() => {
			const tokenElement = document.querySelector('input[name="recaptcha_response_token"]');
			const token = tokenElement ? tokenElement.innerText.trim() : '';
			const tabela = document.querySelectorAll('tbody tr.fundocinza1');
			const res = [];
			tabela.forEach((linha) => {
				const titleElement = linha.querySelector('tr.ementaClass td');
				const descElement = linha.querySelector('tr.ementaClass2 td');
				const linkElement = linha.querySelector('a.layout');

				if (titleElement && descElement && linkElement) {
					const title = titleElement.innerText.trim();
					const description = descElement.innerText.trim();
					const onclick = linkElement.getAttribute('onclick');
					const padrao = /'([^']+)'/;
					const match = onclick.match(padrao);
					const linkRes = match && match[1];

					res.push({
						title: title,
						description: description,
						link: `https://esaj.tjms.jus.br/cdje/consultaSimples.do?${linkRes}&recaptcha_response_token=${token}`,
						token: token,
					});
				}
			});
			return res;
		});
	} else {
		return [];
	}
}

module.exports = class Instance {
	static async checkIP() {
		let browser;
		let page;
		try {
			browser = await getBrowser();
			page = await browser.newPage();
			logger?.info(`- Verificando IP do navegador...`);
			await page.goto('https://api.ipify.org?format=json', { waitUntil: 'networkidle2', timeout: 30000 });
			const content = await page.evaluate(() => document.body.innerText);
			await page.close();
			return {
				"erro": false,
				"status": 200,
				"message": "IP verificado com sucesso.",
				"result": JSON.parse(content)
			};
		} catch (error) {
			logger?.error(`- Erro ao verificar IP: ${error.message}`);
			if (page) await page.close();
			return {
				"erro": true,
				"status": 500,
				"message": "Não foi possível verificar o IP. O proxy pode estar offline.",
				"search": error.message
			};
		}
	}

	static async cadUnificado(dtInicio, nuDiarioCadUnificado) {
		const url = `https://esaj.tjms.jus.br//cdje/downloadCaderno.do?dtDiario=${dtInicio}&nuEdicao=${nuDiarioCadUnificado}&cdCaderno=-1&tpDownload=V`;
		try {
			return await downloadPdfAndConvertToBase64(url);
		} catch (error) {
			logger?.error(`- Erro, ${error.message}`);
			return {
				"erro": true,
				"status": 500,
				"message": 'Erro, não foi possivel efetuar o download.',
				"search": error?.message
			};
		}
	}

	static async downloadCad(dtInicio, cdCaderno) {
		const url = `https://esaj.tjms.jus.br/cdje/downloadCaderno.do?dtDiario=${dtInicio}&cdCaderno=${cdCaderno}&tpDownload=V`;
		try {
			return await downloadPdfAndConvertToBase64(url);
		} catch (error) {
			logger?.error(`- Erro, ${error.message}`);
			return {
				"erro": true,
				"status": 500,
				"message": 'Erro, não foi possivel efetuar o download.',
				"search": error?.message
			};
		}
	}

	static async searchAdvanced(dtInicio, dtFim, cdCaderno, pesquisaLivre) {
		let browser;
		let page;
		try {
			browser = await getBrowser();
			page = await browser.newPage();
			
			// Aumentar para 90 segundos devido à latência internacional do seu VPS
			page.setDefaultNavigationTimeout(90000);
			
			logger?.info(`- Navigating to TJMS (Latência alta detectada)...`);
			// Mudar para domcontentloaded para não esperar carregar imagens/estilos externos pesados
			await page.goto(`https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=${dtInicio}&dadosConsulta.dtFim=${dtFim}&dadosConsulta.cdCaderno=${cdCaderno}&dadosConsulta.pesquisaLivre=${encodeURIComponent(pesquisaLivre)}`, {
				waitUntil: 'domcontentloaded',
				timeout: 90000
			});
			
			// Aguarda o seletor principal ou um dos indicativos de erro/resultado
			await page.waitForSelector(".spwBotaoDefault, .ementaClass", { timeout: 45000 }).catch(() => {
				logger?.warn("- Seletor inicial demorou, mas continuando...");
			});

			const divResultadosSuperiorHandle = await page.$('#divResultadosSuperior');

			if (!divResultadosSuperiorHandle) {
				const text = await page.evaluate(() => {
					const tabela = document.querySelector('div.ementaClass');
					const strong = tabela ? tabela.querySelector('strong') : null;
					return strong ? strong.innerText.trim() : "Nenhum resultado encontrado ou erro na página.";
				});

				logger?.info(`- ${text}`);
				await page.close();
				return {
					"erro": true,
					"status": 404,
					"message": text,
					"search": null
				};
			}

			const valorPaginas = await page.evaluate(() => {
				const tabela = document.querySelector('#divResultadosSuperior table');
				const celula = tabela.querySelector('td').innerText.trim();
				const resPg = celula.split(' ');

				return {
					innerText: celula,
					pgInicial: parseInt(resPg[1]),
					pgFinal: parseInt(resPg[3]),
					resTotal: parseInt(resPg[5]),
					tPag: Math.ceil(resPg[5] / 10)
				};
			});

			logger?.info(`- ${valorPaginas.innerText}`);

			let resultados = [];

			if (valorPaginas.resTotal >= 11) {
				for (let i = 2; i <= valorPaginas.tPag; i++) {
					const resTable = await obterValorDaTabela(page);
					resultados = resultados.concat(resTable);

					const linkElement = await page.$(`a[onclick="trocaDePg(${i});"]`);
					if (linkElement) {
						logger?.info(`- Clique na função trocaDePg ${i} realizado com sucesso`);
						await Promise.all([
							linkElement.click(),
							page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}) // Aguarda navegação se ocorrer
						]);
						// Pequena espera para garantir que o conteúdo mudou se a navegação não disparar
						await new Promise(resolve => setTimeout(resolve, 1000));
					} else {
						logger?.error(`- Elemento da página ${i} não encontrado.`);
						break;
					}
				}
				// Adiciona os resultados da última página visitada
				const lastPageResults = await obterValorDaTabela(page);
				resultados = resultados.concat(lastPageResults);
			} else {
				resultados = await obterValorDaTabela(page);
			}

			await page.close();

			return {
				"erro": false,
				"status": 200,
				"message": 'Pesquisa efetuada com sucesso.',
				"search": resultados
			};
		} catch (error) {
			logger?.error(`- Erro, ${error.message}`);
			if (page) await page.close();
			return {
				"erro": true,
				"status": 500,
				"message": 'Erro, não foi possivel efetuar a pesquisa.',
				"search": error?.message
			};
		}
	}
}