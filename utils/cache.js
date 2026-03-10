const { createClient } = require('redis');
const config = require('../config.global');
const { logger } = require('./logger');

let redisClient;

if (config.USE_REDIS) {
    redisClient = createClient({ url: config.REDIS_URL });
    redisClient.on('error', err => logger?.error('Redis Client Error', err));
    redisClient.connect().catch(err => logger?.error('Redis Connection Error', err));
}

module.exports = {
    async get(key) {
        if (!config.USE_REDIS || !redisClient?.isOpen) return null;
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },
    async set(key, value, ttl = config.CACHE_TTL) {
        if (!config.USE_REDIS || !redisClient?.isOpen) return;
        try {
            await redisClient.set(key, JSON.stringify(value), { EX: ttl });
        } catch (e) {
            logger?.error('Erro ao salvar no Redis', e);
        }
    }
};
