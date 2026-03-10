const axios = require('axios');
const fs = require('fs-extra');
const pdf = require('pdf-parse');
const path = require('path');
const browserObject = require('../browser');
const { logger } = require("../utils/logger");
const cache = require("../utils/cache");
const config = require("../config.global");

let browserInstance;
let lockBrowser = false;
let tabCount = 0;

async function getBrowser() {
    while (lockBrowser) { await new Promise(r => setTimeout(r, 100)); }
    if (browserInstance && tabCount >= config.BROWSER_REQUEST_LIMIT) {
        logger?.info(`- Reiniciando navegador (Limite de ${config.BROWSER_REQUEST_LIMIT} abas).`);
        try { await browserInstance.close(); } catch (e) {}
        browserInstance = null;
        tabCount = 0;
    }
    if (!browserInstance || !browserInstance.isConnected()) {
        lockBrowser = true;
        try {
            if (browserInstance) { try { await browserInstance.close(); } catch (e) {} }
            browserInstance = await browserObject.startBrowser();
            tabCount = 0;
        } finally { lockBrowser = false; }
    }
    return browserInstance;
}

async function safelyClosePage(page) {
    if (!page) return;
    try { await page.close(); } catch (err) {}
}

async function extractTextFromPdfBuffer(buffer, searchTerm) {
    try {
        const data = await pdf(buffer);
        const fullText = data.text;
        if (!searchTerm) return fullText.substring(0, 1000);
        const cleanTerm = searchTerm.replace(/"/g, '').toLowerCase();
        const index = fullText.toLowerCase().indexOf(cleanTerm);
        if (index !== -1) {
            const start = Math.max(0, index - 300);
            const end = Math.min(fullText.length, index + 700);
            return `[...] ${fullText.substring(start, end).trim()} [...]`;
        }
        return "Termo não encontrado no PDF.";
    } catch (error) { throw error; }
}

async function downloadPdfAndConvertToBase64(url, searchTerm = null) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
        const buffer = Buffer.from(response.data, 'binary');
        let extractedText = null;
        if (config.EXTRACT_PDF_TEXT) {
            try { extractedText = await extractTextFromPdfBuffer(buffer, searchTerm); } catch (e) {}
        }
        return {
            "erro": false, "status": 200, "message": 'Sucesso',
            "result": { data: buffer.toString('base64'), mimetype: 'application/pdf', extractedText: extractedText }
        };
    } catch (error) { return { "erro": true, "status": 500, "message": 'Erro no download.' }; }
}

async function obterValorDaTabela(page, dtDiario = '') {
    if (!page) return [];
    try {
        return await page.evaluate((dt) => {
            const el = document.querySelector('input[name="recaptcha_response_token"]') || 
                       document.querySelector('input[name*="recaptcha"]') || 
                       document.querySelector('input[id*="recaptcha"]');
            const token = el ? el.value : '';
            const res = [];
            const linhas = document.querySelectorAll('tr.fundocinza1, table.fundocinza1 tr');
            linhas.forEach((linha) => {
                const titleElement = linha.querySelector('.ementaClass td') || linha.querySelector('td b');
                const descElement = linha.querySelector('.ementaClass2 td') || linha.nextElementSibling?.querySelector('td');
                const linkElement = linha.querySelector('a.layout') || linha.querySelector('a[onclick*="consultaSimples"]');
                if (titleElement && linkElement) {
                    const title = titleElement.innerText.trim();
                    const description = descElement ? descElement.innerText.trim() : "";
                    const onclick = linkElement.getAttribute('onclick');
                    const match = onclick ? onclick.match(/'([^']+)'/) : null;
                    if (match) {
                        const linkParams = match[1];
                        const pgMatch = description.match(/Página:\s*(\d+)/i) || title.match(/Página:\s*(\d+)/i);
                        res.push({
                            title: title, description: description,
                            pagina: pgMatch ? parseInt(pgMatch[1]) : null,
                            link: `https://esaj.tjms.jus.br/cdje/consultaSimples.do?${linkParams}&dtDiario=${dt}&recaptcha_response_token=${token}`
                        });
                    }
                }
            });
            return res;
        }, dtDiario);
    } catch (e) { return []; }
}

module.exports = class Instance {
    static async getMetadata() {
        let page;
        try {
            const browser = await getBrowser();
            page = await browser.newPage();
            tabCount++;
            await page.goto('https://esaj.tjms.jus.br/cdje/consultaAvancada.do', { waitUntil: 'load', timeout: 60000 });
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
        const cacheKey = `search:${dtInicio}:${dtFim}:${cdCaderno}:${pesquisaLivre}:${nuDiario}:${cdForo}:${cdTipoPublicacao}`;
        const cachedResult = await cache.get(cacheKey);
        if (cachedResult) return cachedResult;

        let page;
        try {
            const browser = await getBrowser();
            page = await browser.newPage();
            tabCount++;
            
            const url = `https://esaj.tjms.jus.br/cdje/consultaAvancada.do?dadosConsulta.dtInicio=${dtInicio}&dadosConsulta.dtFim=${dtFim}&dadosConsulta.cdCaderno=${cdCaderno}&dadosConsulta.nuDiario=${nuDiario}&dadosConsulta.cdForo=${cdForo}&dadosConsulta.cdTipoPublicacao=${cdTipoPublicacao}&dadosConsulta.pesquisaLivre=${encodeURIComponent(pesquisaLivre)}`;
            
            logger?.info(`- Iniciando navegação resiliente...`);
            
            // Navegação desacoplada para evitar detached frame
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
            
            // Espera o seletor usando o contexto atualizado da página
            let mainFrame = page.mainFrame();
            await mainFrame.waitForSelector(".spwBotaoDefault, .ementaClass, #divResultadosSuperior", { timeout: 60000 });

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
                                    page.waitForNavigation({ waitUntil: 'load', timeout: 45000 }).catch(() => {})
                                ]);
                                await new Promise(r => setTimeout(r, 2000));
                                success = true;
                            } else { retryPage++; await new Promise(r => setTimeout(r, 1000)); }
                        } catch (e) { retryPage++; await new Promise(r => setTimeout(r, 1500)); }
                    }
                    if (!success) break;
                }
                const itens = await obterValorDaTabela(page, dtFim);
                resultados = resultados.concat(itens);
                if (resultados.length >= 500) break;
            }

            await safelyClosePage(page);
            const finalResult = { "erro": false, "status": 200, "message": 'Sucesso.', "search": resultados };
            await cache.set(cacheKey, finalResult);
            return finalResult;
        } catch (error) {
            logger?.error(`- Erro Final: ${error.message}`);
            await safelyClosePage(page);
            return { "erro": true, "status": 500, "message": 'Erro na pesquisa.', "search": error.message };
        }
    }

    static async searchAsync(webhookUrl, ...params) {
        const taskId = require('uuid').v4();
        this.searchAdvanced(...params).then(async (result) => {
            try { await axios.post(webhookUrl, { taskId, result }, { timeout: 30000 }); } catch (e) {}
        });
        return { "erro": false, "status": 202, "message": "Busca iniciada.", "taskId": taskId };
    }
}
