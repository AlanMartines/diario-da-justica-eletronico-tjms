const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { logger } = require("./utils/logger");
const config = require("./config.global");

async function startBrowser() {
	let browser;
	try {
		logger?.info(`- Opening the browser with Stealth Plugin...`);
		browser = await puppeteer.launch({
			headless: 'new',
			args: [
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
				'--ignore-certificate-errors'
			],
			ignoreHTTPSErrors: true,
			timeout: 0,
			executablePath: config?.CHROME_BIN ? `${config?.CHROME_BIN}` : undefined,
			browserWSEndpoint: config?.WSENDPOINT ? `${config?.WSENDPOINT}` : undefined
		});
	} catch (error) {
		logger?.error(`- Could not create a browser instance: ${error?.message}`);
	}
	return browser;
}

module.exports = { startBrowser };
