/**
 * Clase personalizada para el manejo de errores en UZISHOP.
 * Permite clasificar errores por tipo para facilitar el manejo en la UI.
 */
export class AppError extends Error {
    constructor(message, code = 'APP_ERROR', type = 'INTERNAL') {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.type = type; // 'AUTH', 'NETWORK', 'FIRESTORE', 'VALIDATION', 'INTERNAL'
        this.timestamp = new Date().toISOString();

        // El stack trace es automático en JS moderno
    }

    static fromFirebase(error) {
        // Mapea códigos de Firebase a errores de la aplicación
        const message = error.message || 'Error en el servicio de datos';
        return new AppError(message, error.code, 'FIRESTORE');
    }

    static fromAuth(error) {
        const message = error.message || 'Error de autenticación';
        return new AppError(message, error.code, 'AUTH');
    }
}
