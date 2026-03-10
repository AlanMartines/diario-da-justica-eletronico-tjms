const axios = require('axios');
const fs = require('fs-extra');
const browserObject = require('../browser');
const { logger } = require("../utils/logger");

let browserInstance;

async function getBrowser() {
	// Verifica se o browser existe e se a conexão ainda está ativa
	if (!browserInstance || !browserInstance.isConnected()) {
		logger?.info("- Instância do navegador não encontrada ou desconectada. Iniciando novo browser...");
		browserInstance = await browserObject.startBrowser();
	}
	return browserInstance;
}

// Função auxiliar para fechar a página com segurança
async function safelyClosePage(page) {
	if (page) {
		try {
			if (!page.isClosed()) {
				await page.close();
			}
		} catch (err) {
			logger?.warn(`- Aviso ao fechar página: ${err.message}`);
		}
	}
}

async function downloadPdfAndConvertToBase64(url) {
	try {
		const response = await axios.get(url, { 
			responseType: 'arraybuffer',
			timeout: 60000 
		});
		const buffer = Buffer.from(response.data, 'binary');
		const base64Data = buffer.toString('base64');
		const mimeType = 'application/pdf';
		
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
		try {
			return await page.evaluate(() => {
				const tokenElement = document.querySelector('input[name="recaptcha_response_token"]');
				const token = tokenElement ? tokenElement.innerText.trim() : '';
				const resultados = document.querySelectorAll('table.fundocinza1, tr.fundocinza1');
				const res = [];
				
				resultados.forEach((item) => {
					const titleElement = item.querySelector('.ementaClass td, tr.ementaClass td');
					const descElement = item.querySelector('.ementaClass2 td, tr.ementaClass2 td');
					const linkElement = item.querySelector('a.layout');
					
					if (titleElement && descElement && linkElement) {
						const title = titleElement.innerText.trim();
						const description = descElement.innerText.trim();
						const onclick = linkElement.getAttribute('onclick');
						const padrao = /'([^']+)'/;
						const match = onclick.match(padrao);
						const linkRes = match && match[1];
						
						const pgMatch = description.match(/Página:\s*(\d+)/i) || title.match(/Página:\s*(\d+)/i);
						const pagina = pgMatch ? parseInt(pgMatch[1]) : null;

						res.push({
							title: title,
							description: description,
							pagina: pagina,
							link: `https://esaj.tjms.jus.br/cdje/consultaSimples.do?${linkRes}&recaptcha_response_token=${token}`,
							token: token,
						});
					}
				});
				return res;
			});
		} catch (e) {
			logger?.error(`- Erro no evaluate da tabela: ${e.message}`);
			return [];
		}
	}
	return [];
}

module.exports = class Instance {
	static async getMetadata() {
		let browser;
		let page;
		try {
			browser = await getBrowser();
			page = await browser.newPage();
			logger?.info(`- Coletando metadados do TJMS (Aguardando carregamento)...`);
			
			await page.goto('https://esaj.tjms.jus.br/cdje/consultaAvancada.do', { 
				waitUntil: 'networkidle2',
				timeout: 60000 
			});
			
			await page.waitForSelector('select[name="dadosConsulta.cdCaderno"], #cdCaderno', { timeout: 30000 }).catch(() => {});

			const metadata = await page.evaluate(() => {
				const extractOptions = (nameOrId) => {
					const select = document.getElementById(nameOrId) || 
								   document.querySelector(`select[name="${nameOrId}"]`) ||
								   document.querySelector(`select[name="dadosConsulta.${nameOrId}"]`);
					
					if (!select) return [];
					return Array.from(select.options)
						.filter(opt => opt.value && opt.value !== "" && opt.value !== "-1")
						.map(opt => ({
							valor: opt.value,
							descricao: opt.text.trim()
						}));
				};

				return {
					cadernos: extractOptions('cdCaderno'),
					foros: extractOptions('cdForo'),
					tiposPublicacao: extractOptions('cdTipoPublicacao')
				};
			});

			await safelyClosePage(page);
			return { "erro": false, "status": 200, "message": "Metadados coletados com sucesso.", "result": metadata };
		} catch (error) {
			logger?.error(`- Erro ao coletar metadados: ${error.message}`);
			await safelyClosePage(page);
			return { "erro": true, "status": 500, "message": "Erro ao coletar metadados do TJMS.", "search": error.message };
		}
	}

	static async cadUnificado(dtInicio, nuDiarioCadUnificado) {
		const url = `https://esaj.tjms.jus.br//cdje/downloadCaderno.do?dtDiario=${dtInicio}&nuEdicao=${nuDiarioCadUnificado}&cdCaderno=-1&tpDownload=V`;
		try {
			return await downloadPdfAndConvertToBase64(url);
		} catch (error) {
			logger?.error(`- Erro, ${error.message}`);
			return { "erro": true, "status": 500, "message": 'Erro no download.', "search": error?.message };
		}
	}

	static async downloadCad(dtInicio, cdCaderno) {
		const url = `https://esaj.tjms.jus.br/cdje/downloadCaderno.do?dtDiario=${dtInicio}&cdCaderno=${cdCaderno}&tpDownload=V`;
		try {
			return await downloadPdfAndConvertToBase64(url);
		} catch (error) {
			logger?.error(`- Erro, ${error.message}`);
			return { "erro": true, "status": 500, "message": 'Erro no download.', "search": error?.message };
		}
	}

	static async searchAdvanced(dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario = '', cdForo = '-1', cdTipoPublicacao = '-1') {
		let browser;
		let page;
		try {
			browser = await getBrowser();
			page = await browser.newPage();
			page.setDefaultNavigationTimeout(120000);
			
			const url = `https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=${dtInicio}&dadosConsulta.dtFim=${dtFim}&dadosConsulta.cdCaderno=${cdCaderno}&dadosConsulta.nuDiario=${nuDiario}&dadosConsulta.cdForo=${cdForo}&dadosConsulta.cdTipoPublicacao=${cdTipoPublicacao}&dadosConsulta.pesquisaLivre=${encodeURIComponent(pesquisaLivre)}`;
			
			logger?.info(`- Buscando no TJMS: ${pesquisaLivre}`);
			await page.goto(url, { waitUntil: 'domcontentloaded' });
			
			await page.waitForSelector(".spwBotaoDefault, .ementaClass", { timeout: 60000 }).catch(() => {});
			
			const divResultadosSuperiorHandle = await page.$('#divResultadosSuperior');
			
			if (!divResultadosSuperiorHandle) {
				const text = await page.evaluate(() => {
					const tabela = document.querySelector('div.ementaClass');
					const strong = tabela ? tabela.querySelector('strong') : null;
					return strong ? strong.innerText.trim() : "Nenhum resultado encontrado.";
				});
				await safelyClosePage(page);
				return { "erro": true, "status": 404, "message": text, "search": null };
			}

			const valorPaginas = await page.evaluate(() => {
				const tabela = document.querySelector('#divResultadosSuperior table');
				const celula = tabela ? tabela.querySelector('td').innerText.trim() : "";
				if (!celula) return null;
				const resPg = celula.split(' ');
				return { resTotal: parseInt(resPg[5]), tPag: Math.ceil(resPg[5] / 10) };
			});

			if (!valorPaginas) {
				await safelyClosePage(page);
				return { "erro": true, "status": 404, "message": "Resultados não encontrados.", "search": null };
			}

			logger?.info(`- Total de resultados: ${valorPaginas.resTotal}`);
			
			let resultados = [];
			for (let i = 1; i <= valorPaginas.tPag; i++) {
				if (i > 1) {
					const linkElement = await page.$(`a[onclick="trocaDePg(${i});"]`);
					if (linkElement) {
						await Promise.all([
							linkElement.click(),
							page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
						]);
						await new Promise(resolve => setTimeout(resolve, 2000));
					} else {
						break;
					}
				}
				const resTable = await obterValorDaTabela(page);
				resultados = resultados.concat(resTable);
				if (resultados.length >= 500) break;
			}

			await safelyClosePage(page);
			return { "erro": false, "status": 200, "message": 'Pesquisa efetuada com sucesso.', "search": resultados };
		} catch (error) {
			logger?.error(`- Erro na pesquisa: ${error.message}`);
			await safelyClosePage(page);
			return { "erro": true, "status": 500, "message": 'Erro interno na pesquisa.', "search": error?.message };
		}
	}
}
