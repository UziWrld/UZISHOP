import { createLogger } from '../utils/Logger';

const logger = createLogger('CacheService');
const PREFIX = 'UZI_CACHE_';

/**
 * Servicio de caché con TTL para LocalStorage.
 */
export const CacheService = {
    /**
     * Guarda un item en el caché.
     * @param {string} key - Clave del caché.
     * @param {any} data - Datos a guardar.
     * @param {number} ttl - Tiempo de vida en segundos (default 1 hora).
     */
    set: (key, data, ttl = 3600) => {
        try {
            const entry = {
                data,
                expiry: Date.now() + (ttl * 1000)
            };
            localStorage.setItem(PREFIX + key, JSON.stringify(entry));
            logger.debug(`Cached [${key}] for ${ttl}s`);
        } catch (e) {
            logger.warn(`Failed to set cache for [${key}]`, e);
        }
    },

    /**
     * Recupera un item del caché si no ha expirado.
     * @param {string} key - Clave del caché.
     * @returns {any|null} - Los datos o null si expiró/no existe.
     */
    get: (key) => {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (!raw) return null;

            const entry = JSON.parse(raw);
            if (Date.now() > entry.expiry) {
                logger.debug(`Cache expired for [${key}]`);
                localStorage.removeItem(PREFIX + key);
                return null;
            }

            logger.debug(`Cache hit for [${key}]`);
            return entry.data;
        } catch (e) {
            logger.warn(`Failed to get cache for [${key}]`, e);
            return null;
        }
    },

    /**
     * Elimina un item específico.
     */
    remove: (key) => {
        localStorage.removeItem(PREFIX + key);
    },

    /**
     * Purga todo el caché de UZISHOP.
     */
    clear: () => {
        Object.keys(localStorage)
            .filter(k => k.startsWith(PREFIX))
            .forEach(k => localStorage.removeItem(k));
        logger.info('Cache purged manually');
    }
};
