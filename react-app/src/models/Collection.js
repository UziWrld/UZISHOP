/**
 * Collection Model
 * Encapsulates the logic and data validation for a Collection entity.
 */
export class Collection {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || 'Unnamed Collection';
        this.description = data.description || '';
        this.image = data.image || data.imageUrl || data.img || '';
        this.status = data.status || 'active';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.order = data.order || 0;
    }

    /**
     * Factory method to create an array of Collection instances from raw data
     */
    static fromFirestore(docs) {
        return docs.map(doc => new Collection({ id: doc.id, ...doc }));
    }

    /**
     * Check if the collection is valid to be displayed
     */
    isValid() {
        return this.name && (this.status === 'active' || this.status === 'activo');
    }

    /**
     * Convert instance to a plain object for Firestore
     */
    toFirestore() {
        return {
            name: this.name,
            description: this.description,
            image: this.image,
            status: this.status,
            createdAt: this.createdAt,
            order: this.order
        };
    }
}
