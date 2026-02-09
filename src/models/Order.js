/**
 * Order Model
 * Represents a complete purchase order and its validation logic.
 */
import { CartItem } from './CartItem';

export class Order {
    constructor(data = {}) {
        this.id = data.id || null;
        this.orderNumber = data.orderNumber || null;
        this.userId = data.userId || 'guest';
        this.customerEmail = data.customerEmail || '';
        this.customerName = data.customerName || '';
        this.cedula = data.cedula || '';

        this.shippingInfo = {
            address: data.shippingInfo?.address || '',
            details: data.shippingInfo?.details || '',
            city: data.shippingInfo?.city || '',
            postalCode: data.shippingInfo?.postalCode || '',
            phone: data.shippingInfo?.phone || '',
            method: data.shippingInfo?.method || 'standard',
            cost: Number(data.shippingInfo?.cost) || 0
        };

        this.items = (data.items || []).map(item => new CartItem(item));
        this.subtotal = Number(data.subtotal) || 0;
        this.discount = Number(data.discount) || 0;
        this.couponCode = data.couponCode || '';
        this.total = Number(data.total) || 0;
        this.paymentMethod = data.paymentMethod || 'mercadopago';
        this.status = data.status || 'pending'; // 'pending', 'paid', 'shipped', 'cancelled'
        this.createdAt = data.createdAt || new Date().toISOString();
        this.newsletter = !!data.newsletter;

        // Data Integrity: Re-calculate total to prevent client-side manipulation
        this.recalculateTotal();
    }

    /**
     * Internal method to ensure the total matches items and discounts
     */
    recalculateTotal() {
        const calculatedSubtotal = this.items.reduce((acc, item) => acc + item.getSubtotal(), 0);
        this.subtotal = calculatedSubtotal;
        this.total = Math.max(0, calculatedSubtotal + this.shippingInfo.cost - this.discount);
    }

    /**
     * Validates if the order has all required fields for processing
     */
    isValidForCheckout() {
        return (
            this.customerEmail &&
            this.customerName &&
            this.cedula &&
            this.shippingInfo.address &&
            this.shippingInfo.city &&
            this.shippingInfo.phone &&
            this.items.length > 0 &&
            this.total > 0
        );
    }

    /**
     * Calculate summary for display
     */
    getSummary() {
        return {
            itemCount: this.items.length,
            totalItems: this.items.reduce((acc, item) => acc + item.quantity, 0),
            formattedTotal: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(this.total)
        };
    }

    /**
     * Convert instance to a plain object for Firestore
     */
    toFirestore() {
        return {
            userId: this.userId,
            customerEmail: this.customerEmail,
            customerName: this.customerName,
            cedula: this.cedula,
            shippingInfo: { ...this.shippingInfo },
            items: this.items.map(item => item.toFirestore()),
            subtotal: this.subtotal,
            discount: this.discount,
            couponCode: this.couponCode,
            total: this.total,
            paymentMethod: this.paymentMethod,
            status: this.status,
            createdAt: this.createdAt,
            newsletter: this.newsletter,
            orderNumber: this.orderNumber
        };
    }
}
