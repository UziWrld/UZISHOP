/**
 * CartItem Model
 * Represents an item in the shopping cart.
 */
export class CartItem {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || 'Unnamed Product';
        this.price = Number(data.price) || 0;
        this.quantity = Math.max(1, Number(data.quantity) || 1);
        this.selectedSize = data.selectedSize || '';
        this.image = data.image || '';
        this.color = data.color || '';
    }

    /**
     * Get total price for this item (price * quantity)
     */
    getSubtotal() {
        return this.price * this.quantity;
    }

    /**
     * Validate if the item is complete and correct
     */
    isValid() {
        return this.id && this.name && this.price >= 0 && this.selectedSize;
    }

    /**
     * Convert instance to a plain object for Firestore
     */
    toFirestore() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            quantity: this.quantity,
            selectedSize: this.selectedSize,
            image: this.image,
            color: this.color
        };
    }

    /**
     * Map raw data to a CartItem instance
     */
    static fromRaw(data) {
        return new CartItem(data);
    }
}
