const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { logger } = require("./utils/logger");
const config = require("./config.global");

async function startBrowser() {
	let browser;
	try {
		const launchArgs = [
			'--log-level=3',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--single-process',
			'--disable-gpu',
			'--lang=pt-BR,pt',
			'--window-size=1920,1080',
			'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
			'--ignore-certificate-errors',
			'--proxy-bypass-list=<-loopback>',
			'--disable-web-security'
		];

		// Configuração de Proxy se habilitado
		if (config.USE_PROXY && config.PROXY_LIST.length > 0) {
			const randomProxy = config.PROXY_LIST[Math.floor(Math.random() * config.PROXY_LIST.length)];
			// Suporte a proxy com ou sem autenticação (ip:porta ou user:pass@ip:porta)
			let proxyServer = randomProxy;
			if (randomProxy.includes('@')) {
				proxyServer = randomProxy.split('@')[1];
			}
			launchArgs.push(`--proxy-server=${proxyServer}`);
			logger?.info(`- Usando proxy: ${proxyServer}`);
		}

		logger?.info(`- Opening the browser with Stealth Plugin...`);
		browser = await puppeteer.launch({
			headless: 'new',
			args: launchArgs,
			ignoreHTTPSErrors: true,
			timeout: 0,
			executablePath: config?.CHROME_BIN ? `${config?.CHROME_BIN}` : undefined,
			browserWSEndpoint: config?.WSENDPOINT ? `${config?.WSENDPOINT}` : undefined
		});

		// Autenticação de proxy se necessário
		if (config.USE_PROXY && config.PROXY_LIST.length > 0) {
			const currentProxy = config.PROXY_LIST.find(p => p.includes(launchArgs.find(arg => arg.startsWith('--proxy-server')).split('=')[1]));
			if (currentProxy && currentProxy.includes('@')) {
				const [auth, _] = currentProxy.split('@');
				const [username, password] = auth.split(':');
				browser.on('targetcreated', async (target) => {
					if (target.type() === 'page') {
						const page = await target.page();
						await page.authenticate({ username, password });
					}
				});
			}
		}

	} catch (error) {
		logger?.error(`- Could not create a browser instance: ${error?.message}`);
	}
	return browser;
}

module.exports = { startBrowser };