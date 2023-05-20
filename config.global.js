require('dotenv').config();
const config = module.exports = {};
//
config.NODE_ENV = process.env.NODE_ENV || 'production';
config.HOST = process.env.HOST || 'localhost';
config.PORT = process.env.PORT || '9001';
config.DOMAIN_SSL = process.env.DOMAIN_SSL || '';
config.SECRET_KEY = process.env.SECRET_KEY || '09f26e402586e2faa8da4c98a35f1b20d6b033c60';