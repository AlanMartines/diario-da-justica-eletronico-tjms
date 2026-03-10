const axios = require('axios');
const fs = require('fs-extra');
const browserObject = require('../browser');
const { logger } = require("../utils/logger");

let browserInstance;
let lockBrowser = false;

async function getBrowser() {
	while (lockBrowser) { await new Promise(r => setTimeout(r, 100)); }
	if (!browserInstance || !browserInstance.isConnected()) {
		lockBrowser = true;
		try {
			if (browserInstance) { try { await browserInstance.close(); } catch (e) {} }
			logger?.info("- Iniciando nova instância do navegador...");
			browserInstance = await browserObject.startBrowser();
		} finally { lockBrowser = false; }
	}
	return browserInstance;
}

async function safelyClosePage(page) {
	if (!page) return;
	try { await page.close(); } catch (err) {}
}

async function downloadPdfAndConvertToBase64(url) {
	try {
		const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
		return {
			"erro": false, "status": 200, "message": 'Sucesso',
			"result": { data: Buffer.from(response.data, 'binary').toString('base64'), mimetype: 'application/pdf' }
		};
	} catch (error) {
		return { "erro": true, "status": 500, "message": 'Erro no download.' };
	}
}

async function obterValorDaTabela(page, dtDiario = '') {
	if (!page) return [];
	try {
		// Garante que o token está carregado antes de extrair
		await page.waitForFunction(() => {
			const el = document.querySelector('input[name="recaptcha_response_token"]');
			return el && el.value && el.value.length > 10;
		}, { timeout: 5000 }).catch(() => logger?.warn("- Timeout aguardando token ReCAPTCHA."));

		return await page.evaluate((dt) => {
			// Busca abrangente pelo token
			const getToken = () => {
				const selectors = [
					'input[name="recaptcha_response_token"]',
					'#recaptcha_response_token',
					'input[id*="recaptcha"]',
					'input[name*="recaptcha"]'
				];
				for (const s of selectors) {
					const el = document.querySelector(s);
					if (el && el.value) return el.value;
				}
				return '';
			};

			const token = getToken();
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
					const match = onclick.match(/'([^']+)'/);
					const linkParams = match && match[1];

					const pgMatch = description.match(/Página:\s*(\d+)/i) || title.match(/Página:\s*(\d+)/i);
					const finalLink = `https://esaj.tjms.jus.br/cdje/consultaSimples.do?${linkParams}&dtDiario=${dt}&recaptcha_response_token=${token}`;

					res.push({
						title: title,
						description: description,
						pagina: pgMatch ? parseInt(pgMatch[1]) : null,
						link: finalLink,
						token: token,
					});
				}
			});
			return res;
		}, dtDiario);
	} catch (e) {
		return [];
	}
}

module.exports = class Instance {
	static async getMetadata() {
		let page;
		try {
			const browser = await getBrowser();
			page = await browser.newPage();
			await page.goto('https://esaj.tjms.jus.br/cdje/consultaAvancada.do', { waitUntil: 'networkidle2', timeout: 60000 });
			const metadata = await page.evaluate(() => {
				const extractOptions = (name) => {
					const select = document.querySelector(`select[name="${name}"], select[name="dadosConsulta.${name}"]`);
					if (!select) return [];
					return Array.from(select.options).filter(opt => opt.value && opt.value !== "-1").map(opt => ({ valor: opt.value, descricao: opt.text.trim() }));
				};
				return { cadernos: extractOptions('cdCaderno'), foros: extractOptions('cdForo'), tiposPublicacao: extractOptions('cdTipoPublicacao') };
			});
			await safelyClosePage(page);
			return { "erro": false, "status": 200, "message": "Sucesso", "result": metadata };
		} catch (error) {
			await safelyClosePage(page);
			return { "erro": true, "status": 500, "message": "Erro nos metadados." };
		}
	}

	static async cadUnificado(dtInicio, nuDiarioCadUnificado) {
		const url = `https://esaj.tjms.jus.br//cdje/downloadCaderno.do?dtDiario=${dtInicio}&nuEdicao=${nuDiarioCadUnificado}&cdCaderno=-1&tpDownload=V`;
		return await downloadPdfAndConvertToBase64(url);
	}

	static async downloadCad(dtInicio, cdCaderno) {
		const url = `https://esaj.tjms.jus.br/cdje/downloadCaderno.do?dtDiario=${dtInicio}&cdCaderno=${cdCaderno}&tpDownload=V`;
		return await downloadPdfAndConvertToBase64(url);
	}

	static async searchAdvanced(dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario = '', cdForo = '-1', cdTipoPublicacao = '-1') {
		let page;
		try {
			const browser = await getBrowser();
			page = await browser.newPage();
			page.setDefaultNavigationTimeout(120000);
			
			const url = `https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=${dtInicio}&dadosConsulta.dtFim=${dtFim}&dadosConsulta.cdCaderno=${cdCaderno}&dadosConsulta.nuDiario=${nuDiario}&dadosConsulta.cdForo=${cdForo}&dadosConsulta.cdTipoPublicacao=${cdTipoPublicacao}&dadosConsulta.pesquisaLivre=${encodeURIComponent(pesquisaLivre)}`;
			
			logger?.info(`- Navegando para consulta...`);
			
			try {
				await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
			} catch (e) {
				if (!e.message.includes('detached')) throw e;
				logger?.warn("- Frame detached durante o goto, aguardando estabilização...");
			}

			let retrySelector = 0;
			while(retrySelector < 3) {
				try {
					await page.waitForSelector(".spwBotaoDefault, .ementaClass", { timeout: 30000 });
					break;
				} catch (e) {
					if (e.message.includes('detached')) {
						retrySelector++;
						await new Promise(r => setTimeout(r, 1000));
						continue;
					}
					throw e;
				}
			}
			
			const divResultadosSuperiorHandle = await page.$('#divResultadosSuperior');
			if (!divResultadosSuperiorHandle) {
				const text = await page.evaluate(() => {
					const el = document.querySelector('div.ementaClass strong');
					return el ? el.innerText.trim() : "Nenhum resultado encontrado.";
				});
				await safelyClosePage(page);
				return { "erro": true, "status": 404, "message": text, "search": null };
			}

			const valorPaginas = await page.evaluate(() => {
				const tabela = document.querySelector('#divResultadosSuperior table td');
				if (!tabela) return null;
				const resPg = tabela.innerText.trim().split(/\s+/);
				const totalIdx = resPg.indexOf('de') + 1;
				const total = parseInt(resPg[totalIdx]);
				return { resTotal: total, tPag: Math.ceil(total / 10) };
			});

			if (!valorPaginas) {
				await safelyClosePage(page);
				return { "erro": true, "status": 404, "message": "Resultados não processados.", "search": null };
			}

			logger?.info(`- Total: ${valorPaginas.resTotal} resultados em ${valorPaginas.tPag} páginas.`);
			
			let resultados = [];
			for (let i = 1; i <= valorPaginas.tPag; i++) {
				if (i > 1) {
					let retryPage = 0;
					let success = false;
					while (retryPage < 3 && !success) {
						try {
							const link = await page.$(`a[onclick="trocaDePg(${i});"]`);
							if (link) {
								await Promise.all([
									link.click(),
									page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
								]);
								await new Promise(r => setTimeout(r, 2500));
								success = true;
							} else {
								retryPage++;
								await new Promise(r => setTimeout(r, 1000));
							}
						} catch (e) {
							if (e.message.includes('detached')) {
								retryPage++;
								await new Promise(r => setTimeout(r, 1500));
								continue;
							}
							break;
						}
					}
					if (!success) break;
				}
				
				const itens = await obterValorDaTabela(page, dtFim);
				resultados = resultados.concat(itens);
				if (resultados.length >= 500) break;
			}

			await safelyClosePage(page);
			return { "erro": false, "status": 200, "message": 'Sucesso.', "search": resultados };
		} catch (error) {
			logger?.error(`- Falha Crítica: ${error.message}`);
			await safelyClosePage(page);
			return { "erro": true, "status": 500, "message": 'Erro na pesquisa.', "search": error.message };
		}
	}
}
