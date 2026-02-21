import { db } from "@core/config/firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";

const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_your_key_here';
const WOMPI_API_URL = 'https://production.wompi.co/v1';

export const paymentService = {
    /**
     * Crear intención de pago con Wompi
     * @param {Object} orderData - Datos del pedido
     * @returns {Object} - URL de pago y referencia
     */
    createPaymentIntent: async (orderData) => {
        try {
            const reference = `UZI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const paymentData = {
                public_key: WOMPI_PUBLIC_KEY,
                currency: 'COP',
                amount_in_cents: Math.round(orderData.total * 100), // Convertir a centavos
                reference: reference,
                redirect_url: `${window.location.origin}/payment-success?ref=${reference}`,
                customer_data: {
                    email: orderData.shippingInfo.email,
                    full_name: orderData.shippingInfo.fullName,
                    phone_number: orderData.shippingInfo.phone
                },
                shipping_address: {
                    address_line_1: orderData.shippingInfo.address,
                    city: orderData.shippingInfo.city,
                    phone_number: orderData.shippingInfo.phone
                }
            };

            // En producción, esto se haría desde el backend
            // Por ahora, retornamos la URL de Wompi con los parámetros
            const wompiCheckoutUrl = `https://checkout.wompi.co/p/?public-key=${WOMPI_PUBLIC_KEY}&currency=COP&amount-in-cents=${paymentData.amount_in_cents}&reference=${reference}&redirect-url=${encodeURIComponent(paymentData.redirect_url)}`;

            return {
                success: true,
                paymentUrl: wompiCheckoutUrl,
                reference: reference
            };
        } catch (error) {
            console.error("Error creating payment intent:", error);
            throw new Error("No se pudo crear la intención de pago");
        }
    },

    /**
     * Verificar estado de pago
     * @param {string} transactionId - ID de la transacción de Wompi
     * @returns {Object} - Estado del pago
     */
    verifyPaymentStatus: async (transactionId) => {
        try {
            const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al verificar el pago');
            }

            const data = await response.json();

            return {
                success: true,
                status: data.data.status, // APPROVED, DECLINED, PENDING, etc.
                transactionId: data.data.id,
                reference: data.data.reference,
                amount: data.data.amount_in_cents / 100
            };
        } catch (error) {
            console.error("Error verifying payment:", error);
            throw new Error("No se pudo verificar el estado del pago");
        }
    },

    /**
     * Procesar pago alternativo (transferencia, contraentrega)
     * @param {string} method - Método de pago
     * @param {Object} orderData - Datos del pedido
     * @returns {Object} - Resultado del procesamiento
     */
    processAlternativePayment: async (method, orderData) => {
        try {
            // Para métodos alternativos, simplemente retornamos éxito
            // El pago se verificará manualmente por el admin
            return {
                success: true,
                method: method,
                status: 'pending_verification',
                message: method === 'cod'
                    ? 'Pedido confirmado. Pagarás al recibir el producto.'
                    : 'Pedido confirmado. Te enviaremos los datos para transferencia por email.'
            };
        } catch (error) {
            console.error("Error processing alternative payment:", error);
            throw error;
        }
    },

    /**
     * Actualizar estado de pago en la orden
     * @param {string} orderId - ID del pedido
     * @param {string} status - Estado del pago
     * @param {string} transactionId - ID de transacción (opcional)
     */
    updateOrderPaymentStatus: async (orderId, status, transactionId = null) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const updateData = {
                paymentStatus: status,
                updatedAt: new Date()
            };

            if (transactionId) {
                updateData.transactionId = transactionId;
            }

            if (status === 'paid') {
                updateData.paidAt = new Date();
            }

            await updateDoc(orderRef, updateData);
            return { success: true };
        } catch (error) {
            console.error("Error updating payment status:", error);
            throw error;
        }
    }
};
