/**
 * Coupon Model
 * Represents a discount coupon and its business rules.
 */
export class Coupon {
    constructor(data = {}) {
        this.id = data.id || null;
        this.code = data.code || '';
        this.discount = Number(data.discount) || 0; // Percentage
        this.minAmount = Number(data.minAmount) || 0;
        this.isActive = data.isActive !== false;
        this.expiryDate = data.expiryDate || null;
    }

    /**
     * Check if the coupon is valid for a specific total
     */
    isValidForTotal(total) {
        if (!this.isActive) return false;
        if (total < this.minAmount) return false;
        if (this.expiryDate && new Date(this.expiryDate) < new Date()) return false;
        return true;
    }

    /**
     * Calculate discount amount
     */
    calculateDiscount(total) {
        if (!this.isValidForTotal(total)) return 0;
        return (total * this.discount) / 100;
    }

    /**
     * Validates the coupon basic structure
     */
    isValid() {
        return this.code && this.discount > 0 && this.discount <= 100;
    }

    /**
     * Convert instance to a plain object for Firestore
     */
    toFirestore() {
        return {
            code: this.code.toUpperCase(),
            discount: this.discount,
            minAmount: this.minAmount,
            isActive: this.isActive,
            expiryDate: this.expiryDate
        };
    }
}
