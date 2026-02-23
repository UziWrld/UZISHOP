import { useState, useMemo } from 'react';
import { useCart } from '@cart/context/CartContext';
import { useAuthController } from '@auth/hooks/useAuthController';
import { orderService } from '@checkout/services/orderService';
import { emailService } from '@checkout/services/emailService';
import { abandonedCartService } from '@checkout/services/abandonedCartService';
import { Order } from '@checkout/models/Order';
import { createLogger } from '@core/utils/Logger';
import { useOrderForm } from './useOrderForm';
import { useShipping } from './useShipping';
import { useCoupon } from './useCoupon';
import { useAbandonedCart } from './useAbandonedCart';

const logger = createLogger('useCheckoutController');

/**
 * useCheckoutController
 * Orchestrator: delega cada responsabilidad a hooks especializados.
 * Mantiene solo la lógica de orquestación y el flujo de submitOrder.
 */
export const useCheckoutController = () => {
    const { cart, totalAmount, clearCart } = useCart();
    const { user, updateProfile, isAuthenticated } = useAuthController();
    const [loading, setLoading] = useState(false);

    // --- Hooks especializados ---
    const { formData, handleChange } = useOrderForm(user);

    const {
        shippingMethod, setShippingMethod,
        paymentMethod, setPaymentMethod,
        shippingCost, isAMB
    } = useShipping(formData.city, totalAmount);

    const finalTotal = useMemo(
        () => totalAmount + shippingCost - (discountAmount || 0),
        [totalAmount, shippingCost]
    );

    const {
        couponCode, setCouponCode,
        couponData, discountAmount,
        applyCoupon
    } = useCoupon(totalAmount, user?.uid);

    // Sincronizar carrito abandonado (debounced)
    useAbandonedCart({
        user,
        cart,
        email: formData.email,
        finalTotal: totalAmount + shippingCost - (discountAmount || 0)
    });

    // --- Orquestador principal del pedido ---
    const submitOrder = async () => {
        // Validación de autenticación ANTES de intentar escribir en Firestore
        if (!isAuthenticated) {
            return {
                success: false,
                message: 'Debes iniciar sesión para completar tu pedido.'
            };
        }

        setLoading(true);
        try {
            const computedTotal = totalAmount + shippingCost - (discountAmount || 0);

            const orderModel = new Order({
                userId: user.uid,
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
                discount: discountAmount || 0,
                couponCode: couponData?.code || '',
                total: computedTotal,
                paymentMethod,
                newsletter: formData.newsletter
            });

            if (!orderModel.isValidForCheckout()) {
                throw new Error('Por favor completa todos los campos requeridos.');
            }

            const result = await orderService.createOrder(orderModel);
            logger.info(`Pedido creado: ${result.orderNumber}`);

            // Side effects: fire and forget (no bloquean el flujo principal)
            emailService
                .sendOrderConfirmation({ ...orderModel, orderNumber: result.orderNumber }, formData.email)
                .catch(e => logger.warn('Error enviando email de confirmación', e));

            // Actualizar perfil con datos del formulario
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

            // Cleanup
            abandonedCartService.markCartAsRecovered(user.uid)
                .catch(e => logger.warn('Error marcando carrito recuperado', e));
            clearCart();

            return { success: true, orderNumber: result.orderNumber };
        } catch (error) {
            logger.error('Error en submitOrder', error);
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
        discountAmount: discountAmount || 0,
        shippingCost,
        finalTotal: totalAmount + shippingCost - (discountAmount || 0),
        couponCode,
        setCouponCode,
        applyCoupon,
        submitOrder,
        isAMB
    };
};
