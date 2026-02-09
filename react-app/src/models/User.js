/**
 * User Model
 * Represents a user profile and encapsulates role-based logic.
 */
export class User {
    constructor(data = {}) {
        const sanitize = (val) => typeof val === 'string' ? val.trim().replace(/<[^>]*>?/gm, '') : val;

        this.uid = data.uid || null;
        this.email = data.email || '';
        this.nombre = sanitize(data.nombre) || '';
        this.apellidos = sanitize(data.apellidos) || '';
        this.role = data.role || 'user'; // 'user', 'admin'
        this.createdAt = data.createdAt || null;
        this.authType = data.authType || 'email'; // 'email', 'google'
        this.fechaNacimiento = data.fechaNacimiento || null;
    }

    /**
     * Get the full name of the user
     */
    getFullName() {
        return `${this.nombre} ${this.apellidos}`.trim();
    }

    /**
     * Check if the user has administrative privileges
     */
    isAdmin() {
        return this.role === 'admin';
    }

    /**
     * Map raw Firestore data to a User instance
     */
    static fromFirestore(data) {
        if (!data) return null;
        return new User(data);
    }

    /**
     * Validates that the user has a valid email
     */
    isValid() {
        return !!this.email && this.email.includes('@');
    }

    /**
     * Convert instance to a plain object for Firestore
     */
    toFirestore() {
        return {
            uid: this.uid,
            email: this.email,
            nombre: this.nombre,
            apellidos: this.apellidos,
            role: this.role,
            createdAt: this.createdAt,
            authType: this.authType,
            fechaNacimiento: this.fechaNacimiento
        };
    }
}
