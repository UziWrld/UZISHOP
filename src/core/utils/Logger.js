/**
 * Logger estructurado para UZISHOP (Undergold Style).
 * centraliza los logs para facilitar la integración futura con Sentry o similares.
 */

const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
};

const COLORS = {
    INFO: '#00D1FF', // Cyan
    WARN: '#FFB800', // Yellow
    ERROR: '#FF3D00', // Red
    DEBUG: '#7B61FF'  // Purple
};

class Logger {
    constructor(context) {
        this.context = context;
    }

    #log(level, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level}] [${this.context}]`;
        const style = `color: ${COLORS[level]}; font-weight: bold;`;

        if (data) {
            console.groupCollapsed(`%c${prefix} ${message}`, style);
            console.log('Data:', data);
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${message}`, style);
        }
    }

    info(message, data) {
        this.#log(LOG_LEVELS.INFO, message, data);
    }

    warn(message, data) {
        this.#log(LOG_LEVELS.WARN, message, data);
    }

    error(message, error) {
        this.#log(LOG_LEVELS.ERROR, message, {
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
            original: error
        });
    }

    debug(message, data) {
        if (import.meta.env.DEV) {
            this.#log(LOG_LEVELS.DEBUG, message, data);
        }
    }
}

/**
 * Factory para crear loggers por contexto.
 * @param {string} context - Nombre del módulo o componente.
 * @returns {Logger}
 */
export const createLogger = (context) => new Logger(context);

// Logger por defecto para uso general
export const logger = createLogger('APP');
