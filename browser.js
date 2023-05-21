const puppeteer = require('puppeteer');
const { logger } = require("./utils/logger");
//
async function startBrowser() {
	let browser;
	try {
		logger?.info(`- Opening the browser...`);
		// Inicie o navegador Puppeteer
		browser = await puppeteer.launch({
			headless: 'new',
			// `headless: true` (default) enables old Headless;
			// `headless: 'new'` enables new Headless;
			// `headless: false` enables “headful” mode.
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
	} catch (err) {
		console.log("Could not create a browser instance => : ", err);
	}
	return browser;
}
//
module.exports = { startBrowser };