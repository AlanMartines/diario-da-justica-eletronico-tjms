require('dotenv').config();
const config = module.exports = {};

config.NODE_ENV = process.env.NODE_ENV || 'development';
config.HOST = process.env.HOST || 'localhost';
config.PORT = process.env.PORT || 8009;
config.DOMAIN_SSL = process.env.DOMAIN_SSL || '';
config.SECRET_KEY = process.env.SECRET_KEY || null;
config.CHROME_BIN = process.env.CHROME_BIN || undefined;
config.WSENDPOINT = process.env.WSENDPOINT || undefined;

// Configurações de Redis (Cache)
config.USE_REDIS = process.env.USE_REDIS === 'true';
config.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
config.CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600; // 1 hora padrão

// Configurações de Extração de PDF
config.EXTRACT_PDF_TEXT = process.env.EXTRACT_PDF_TEXT === 'true';

// Auto-Restart do Browser
config.BROWSER_REQUEST_LIMIT = parseInt(process.env.BROWSER_REQUEST_LIMIT) || 50;
