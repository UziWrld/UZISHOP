import { createLogger } from './Logger';
import { AppError } from './AppError';

const logger = createLogger('ErrorHandler');

/**
 * Manejador central de errores.
 * centraliza la lógica de reporte y notificación.
 */
export const ErrorHandler = {
    /**
     * Procesa un error capturado.
     * @param {Error|AppError} error - El error original.
     * @param {string} context - Dónde ocurrió el error.
     * @param {boolean} notifyUser - Si se debe mostrar un mensaje visual (futuro Toast).
     */
    handle: (error, context = 'Global', notifyUser = false) => {
        const appError = error instanceof AppError
            ? error
            : new AppError(error.message, 'UNEXPECTED_ERROR', 'INTERNAL');

        // Log estructurado
        logger.error(`Error in ${context}: ${appError.message}`, appError);

        // Aquí se integraría el sistema de Toasts una vez unificado
        if (notifyUser) {
            // window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: appError.message, type: 'error' } }));
        }

        return appError;
    },

    /**
     * Helper para envolver funciones asíncronas
     */
    wrap: (fn, context) => async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            ErrorHandler.handle(error, context);
            throw error;
        }
    }
};
