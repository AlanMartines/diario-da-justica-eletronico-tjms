require('dotenv').config();
const config = module.exports = {};
//
config.NODE_ENV = process.env.NODE_ENV || 'development';
config.HOST = process.env.HOST || 'localhost';
config.PORT = process.env.PORT || 8009;
config.DOMAIN_SSL = process.env.DOMAIN_SSL || '';
config.SECRET_KEY = process.env.SECRET_KEY || null;
config.CHROME_BIN = process.env.CHROME_BIN || undefined;
config.WSENDPOINT = process.env.WSENDPOINT || undefined;
//
