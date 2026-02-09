import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuthController } from '../hooks/useAuthController';
import { orderService } from '../services/orderService';
import { couponService } from '../services/couponService';
import { emailService } from '../services/emailService';
import { abandonedCartService } from '../services/abandonedCartService';
import { Order } from '../models/Order';
import { Coupon } from '../models/Coupon';

/**
 * useCheckoutController Hook
 * Manages the complex state and operations of the Checkout process.
 */
export const useCheckoutController = () => {
    const { cart, totalAmount, clearCart } = useCart();
    const { user, updateProfile } = useAuthController();

    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const [formData, setFormData] = useState({
        email: user?.email || '',
        newsletter: true,
        firstName: user?.nombre || '',
        lastName: user?.apellidos || '',
        cedula: user?.cedula || '',
        address: user?.address || '',
        details: user?.details || '',
        city: user?.city || '',
        postalCode: user?.postalCode || '',
        phone: user?.phone || '',
        billingSame: true
    });

    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [loading, setLoading] = useState(false);

    const isAMB = ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"].includes(formData.city);

    // Shipping Calculation logic
    const shippingCost = shippingMethod === 'cod'
        ? (totalAmount >= 200000 ? 0 : 5000)
        : (totalAmount >= 200000 ? 0 : 15000);

    const finalTotal = totalAmount + shippingCost - discountAmount;

    // Handle form changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Apply Coupon
    const applyCoupon = async (code) => {
        try {
            const data = await couponService.validateCoupon(code, totalAmount, user?.uid);
            const model = new Coupon(data);
            setCouponData(model);
            setDiscountAmount(model.calculateDiscount(totalAmount));
            return { success: true, message: `Cupón ${model.code} aplicado` };
        } catch (error) {
            setCouponData(null);
            setDiscountAmount(0);
            return { success: false, message: error.message };
        }
    };

    // Sync shipping and payment based on city
    useEffect(() => {
        if (!isAMB && shippingMethod === 'cod') {
            setShippingMethod('standard');
            setPaymentMethod('mercadopago');
        } else if (shippingMethod === 'cod') {
            setPaymentMethod('cod');
        } else if (shippingMethod === 'standard' && paymentMethod === 'cod') {
            setPaymentMethod('mercadopago');
        }
    }, [formData.city, isAMB, shippingMethod]);

    // Abandoned Cart Sync (Debounced)
    useEffect(() => {
        if (!formData.email || cart.length === 0 || !user) return;

        const saveCart = async () => {
            try {
                await abandonedCartService.saveAbandonedCart(
                    user.uid,
                    cart,
                    formData.email,
                    finalTotal
                );
            } catch (error) {
                console.error('Error saving abandoned cart:', error);
            }
        };

        const timeoutId = setTimeout(saveCart, 2000);
        return () => clearTimeout(timeoutId);
    }, [formData.email, cart, user, finalTotal]);

    // Submit Order
    const submitOrder = async () => {
        setLoading(true);
        try {
            const orderModel = new Order({
                userId: user?.uid || 'guest',
                customerEmail: formData.email,
                customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                cedula: formData.cedula,
                shippingInfo: {
                    ...formData,
                    method: shippingMethod,
                    cost: shippingCost
                },
                items: cart,
                subtotal: totalAmount,
                discount: discountAmount,
                couponCode: couponData?.code || '',
                total: finalTotal,
                paymentMethod,
                newsletter: formData.newsletter
            });

            if (!orderModel.isValidForCheckout()) {
                throw new Error("Por favor completa todos los campos requeridos.");
            }

            const result = await orderService.createOrder(orderModel);

            // Side effects: Emails (fire and forget)
            try {
                await emailService.sendOrderConfirmation({ ...orderModel, orderNumber: result.orderNumber }, formData.email);
            } catch (e) { console.error("Email error:", e); }

            // Profile Update
            if (user) {
                await updateProfile({
                    nombre: formData.firstName,
                    apellidos: formData.lastName,
                    cedula: formData.cedula,
                    address: formData.address,
                    details: formData.details,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    phone: formData.phone
                });
            }

            // Cleanup
            if (user) await abandonedCartService.markCartAsRecovered(user.uid);
            clearCart();

            return { success: true, orderNumber: result.orderNumber };
        } catch (error) {
            console.error("Checkout error:", error);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        handleChange,
        shippingMethod,
        setShippingMethod,
        paymentMethod,
        setPaymentMethod,
        loading,
        totalAmount,
        discountAmount,
        shippingCost,
        finalTotal,
        couponCode,
        setCouponCode,
        applyCoupon,
        submitOrder,
        isAMB
    };
};
