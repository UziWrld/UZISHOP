/**
 * Product Model
 * Encapsulates the logic and data validation for a Product entity.
 */
export class Product {
    constructor(data = {}) {
        const sanitize = (val) => typeof val === 'string' ? val.trim().replace(/<[^>]*>?/gm, '') : val;

        this.id = data.id || null;
        this.name = sanitize(data.name) || 'Unnamed Product';
        this.description = sanitize(data.description) || '';
        this.price = Number(data.price) || 0;
        this.images = data.images || []; // Array of image URLs
        this.mainImage = data.mainImage || (this.images.length > 0 ? this.images[0] : '');
        this.category = data.category || '';
        this.gender = data.gender || 'unisex'; // 'hombre', 'mujer', 'unisex'
        this.stock = Number(data.stock) || 0;
        this.status = data.status === 'activo' ? 'active' : (data.status || 'active'); // Normalize 'activo' to 'active', default to active
        this.collectionId = data.collectionId || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.image = data.image || ''; // Fallback for single image field
        this.sizes = data.sizes || []; // e.g., ['S', 'M', 'L']
        this.colors = data.colors || []; // e.g., ['#000', '#fff']
        this.variants = data.variants || []; // Array of {size, color, stock}

        // Ensure this.stock is consistently the sum of variants if they exist
        if (this.variants.length > 0) {
            this.stock = this.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
        } else {
            this.stock = Number(data.stock) || 0;
        }
    }

    /**
     * Factory method to create an array of Product instances from raw data
     */
    static fromFirestore(docs) {
        return docs.map(doc => new Product({ id: doc.id, ...doc }));
    }

    /**
     * Format the price to local currency (COP or similar)
     */
    getFormattedPrice() {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(this.price);
    }

    /**
     * Check if product is in stock
     */
    isInStock() {
        return this.stock > 0;
    }

    /**
     * Get a display status label
     */
    getStatusLabel() {
        switch (this.status) {
            case 'active': return 'Activo';
            case 'draft': return 'Borrador';
            case 'archived': return 'Archivado';
            default: return 'Desconocido';
        }
    }

    /**
     * Validates that the product has the minimum required data
     */
    isValid() {
        return (
            this.name &&
            this.name !== 'Unnamed Product' &&
            this.price >= 0 &&
            (this.mainImage || this.image || (this.images && this.images.length > 0))
        );
    }

    /**
     * Convert instance to a plain object for Firestore
     */
    toFirestore() {
        return {
            name: this.name,
            description: this.description,
            price: this.price,
            images: this.images,
            mainImage: this.mainImage,
            image: this.image,
            category: this.category,
            gender: this.gender,
            stock: this.stock,
            status: this.status,
            collectionId: this.collectionId,
            createdAt: this.createdAt,
            sizes: this.sizes,
            colors: this.colors,
            variants: this.variants
        };
    }
}
