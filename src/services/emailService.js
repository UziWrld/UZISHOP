import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";

/**
 * Servicio de Email usando Firebase Trigger Email Extension
 * Requiere instalar la extensión desde Firebase Console:
 * https://extensions.dev/extensions/firebase/firestore-send-email
 */

const MAIL_COLLECTION = "mail";

export const emailService = {
    /**
     * Enviar email de confirmación de pedido al cliente
     * @param {Object} orderData - Datos del pedido
     * @param {string} userEmail - Email del cliente
     */
    sendOrderConfirmation: async (orderData, userEmail) => {
        try {
            const emailDoc = {
                to: userEmail,
                message: {
                    subject: `✅ Pedido Confirmado - ${orderData.orderNumber}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: #000; color: #fff; padding: 30px; text-align: center; }
                                .content { padding: 30px; background: #f9f9f9; }
                                .order-item { display: flex; gap: 15px; padding: 15px; background: #fff; margin-bottom: 10px; border-radius: 8px; }
                                .total { font-size: 1.5rem; font-weight: bold; text-align: right; margin-top: 20px; }
                                .footer { text-align: center; padding: 20px; color: #888; font-size: 0.9rem; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>UZI SHOP</h1>
                                    <p>¡Gracias por tu compra!</p>
                                </div>
                                <div class="content">
                                    <h2>Pedido Confirmado</h2>
                                    <p>Hola <strong>${orderData.shippingInfo?.fullName || 'Cliente'}</strong>,</p>
                                    <p>Tu pedido ha sido confirmado y está siendo preparado.</p>
                                    
                                    <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <p><strong>Número de Pedido:</strong> ${orderData.orderNumber}</p>
                                        <p><strong>Estado:</strong> En Preparación</p>
                                        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
                                    </div>

                                    <h3>Productos:</h3>
                                    ${orderData.items?.map(item => `
                                        <div class="order-item">
                                            <div>
                                                <p style="margin: 0; font-weight: bold;">${item.name}</p>
                                                <p style="margin: 5px 0 0 0; color: #666;">Talla: ${item.selectedSize} | Cantidad: ${item.quantity}</p>
                                            </div>
                                            <p style="margin: 0; font-weight: bold;">$${(item.price * item.quantity).toLocaleString('es-CO')}</p>
                                        </div>
                                    `).join('')}

                                    <div class="total">
                                        Total: $${orderData.total.toLocaleString('es-CO')} COP
                                    </div>

                                    <h3>Dirección de Envío:</h3>
                                    <p>
                                        ${orderData.shippingInfo?.address}<br>
                                        ${orderData.shippingInfo?.city}, ${orderData.shippingInfo?.department}<br>
                                        Tel: ${orderData.shippingInfo?.phone}
                                    </p>
                                </div>
                                <div class="footer">
                                    <p>Te notificaremos cuando tu pedido sea enviado.</p>
                                    <p>UZI SHOP - La nueva ola del streetwear</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            };

            await addDoc(collection(db, MAIL_COLLECTION), emailDoc);
            console.log("Order confirmation email queued");
        } catch (error) {
            console.error("Error sending order confirmation email:", error);
            // No lanzamos error para no bloquear el flujo de compra
        }
    },

    /**
     * Enviar notificación de envío al cliente
     * @param {Object} orderData - Datos del pedido
     * @param {string} userEmail - Email del cliente
     * @param {string} trackingNumber - Número de guía
     */
    sendShippingNotification: async (orderData, userEmail, trackingNumber) => {
        try {
            const emailDoc = {
                to: userEmail,
                message: {
                    subject: `📦 Tu pedido ha sido enviado - ${orderData.orderNumber}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: #000; color: #fff; padding: 30px; text-align: center; }
                                .content { padding: 30px; background: #f9f9f9; }
                                .tracking { background: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                                .tracking-number { font-size: 1.5rem; font-weight: bold; color: #000; }
                                .footer { text-align: center; padding: 20px; color: #888; font-size: 0.9rem; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>UZI SHOP</h1>
                                    <p>¡Tu pedido está en camino!</p>
                                </div>
                                <div class="content">
                                    <h2>Pedido Enviado</h2>
                                    <p>Hola <strong>${orderData.shippingInfo?.fullName || 'Cliente'}</strong>,</p>
                                    <p>Tu pedido <strong>${orderData.orderNumber}</strong> ha sido enviado y está en camino a tu dirección.</p>
                                    
                                    <div class="tracking">
                                        <p style="margin: 0 0 10px 0; color: #888;">Número de Guía:</p>
                                        <p class="tracking-number">${trackingNumber}</p>
                                        <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #666;">
                                            Puedes rastrear tu envío con este número en la página de la transportadora.
                                        </p>
                                    </div>

                                    <p>Recibirás tu pedido en los próximos días hábiles.</p>
                                </div>
                                <div class="footer">
                                    <p>Gracias por comprar en UZI SHOP</p>
                                    <p>UZI SHOP - La nueva ola del streetwear</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            };

            await addDoc(collection(db, MAIL_COLLECTION), emailDoc);
            console.log("Shipping notification email queued");
        } catch (error) {
            console.error("Error sending shipping notification:", error);
        }
    },

    /**
     * Enviar alerta de nuevo pedido al admin
     * @param {Object} orderData - Datos del pedido
     */
    sendAdminNewOrderAlert: async (orderData) => {
        try {
            // Email del admin (puedes configurarlo en variables de entorno)
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@uzishop.com';

            const emailDoc = {
                to: adminEmail,
                message: {
                    subject: `🔔 Nuevo Pedido - ${orderData.orderNumber}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: #4caf50; color: #fff; padding: 30px; text-align: center; }
                                .content { padding: 30px; background: #f9f9f9; }
                                .info-box { background: #fff; padding: 15px; border-radius: 8px; margin: 10px 0; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Nuevo Pedido Recibido</h1>
                                </div>
                                <div class="content">
                                    <div class="info-box">
                                        <p><strong>Número de Pedido:</strong> ${orderData.orderNumber}</p>
                                        <p><strong>Cliente:</strong> ${orderData.shippingInfo?.fullName}</p>
                                        <p><strong>Email:</strong> ${orderData.shippingInfo?.email}</p>
                                        <p><strong>Teléfono:</strong> ${orderData.shippingInfo?.phone}</p>
                                        <p><strong>Total:</strong> $${orderData.total.toLocaleString('es-CO')} COP</p>
                                        <p><strong>Método de Pago:</strong> ${orderData.paymentMethod || 'N/A'}</p>
                                    </div>

                                    <h3>Productos:</h3>
                                    ${orderData.items?.map(item => `
                                        <div class="info-box">
                                            <p><strong>${item.name}</strong></p>
                                            <p>Talla: ${item.selectedSize} | Cantidad: ${item.quantity}</p>
                                        </div>
                                    `).join('')}

                                    <div class="info-box">
                                        <h4>Dirección de Envío:</h4>
                                        <p>
                                            ${orderData.shippingInfo?.address}<br>
                                            ${orderData.shippingInfo?.city}, ${orderData.shippingInfo?.department}
                                        </p>
                                    </div>

                                    <p style="text-align: center; margin-top: 30px;">
                                        <a href="${window.location.origin}/admin" 
                                           style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                            Ver en Panel Admin
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            };

            await addDoc(collection(db, MAIL_COLLECTION), emailDoc);
            console.log("Admin alert email queued");
        } catch (error) {
            console.error("Error sending admin alert:", error);
        }
    },

    /**
     * Enviar email de carrito abandonado
     * @param {Object} cartData - Datos del carrito abandonado
     * @param {string} userEmail - Email del cliente
     */
    sendAbandonedCartEmail: async (cartData, userEmail) => {
        try {
            const emailDoc = {
                to: userEmail,
                message: {
                    subject: `🛒 ¡No olvides tus productos en UZI SHOP!`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: #fff; padding: 30px; text-align: center; }
                                .content { padding: 30px; background: #f9f9f9; }
                                .cart-item { display: flex; gap: 15px; padding: 15px; background: #fff; margin-bottom: 10px; border-radius: 8px; align-items: center; }
                                .cart-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
                                .total { font-size: 1.5rem; font-weight: bold; text-align: right; margin-top: 20px; color: #000; }
                                .cta-button { display: inline-block; background: #000; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; margin: 20px 0; }
                                .urgency { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #888; font-size: 0.9rem; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>UZI SHOP</h1>
                                    <p>¡Tus productos te están esperando!</p>
                                </div>
                                <div class="content">
                                    <h2>Hola,</h2>
                                    <p>Notamos que dejaste algunos productos increíbles en tu carrito. ¡No los pierdas!</p>
                                    
                                    <div class="urgency">
                                        <strong>⚠️ Stock Limitado:</strong> Algunos de estos productos tienen pocas unidades disponibles. ¡Completa tu compra antes de que se agoten!
                                    </div>

                                    <h3>Tu Carrito:</h3>
                                    ${cartData.items?.map(item => `
                                        <div class="cart-item">
                                            <img src="${item.image?.startsWith('http') ? item.image : window.location.origin + '/' + item.image}" alt="${item.name}">
                                            <div style="flex: 1;">
                                                <p style="margin: 0; font-weight: bold; font-size: 1rem;">${item.name}</p>
                                                <p style="margin: 5px 0 0 0; color: #666;">Talla: ${item.selectedSize} | Cantidad: ${item.quantity}</p>
                                                <p style="margin: 5px 0 0 0; font-weight: bold; color: #000;">$${(item.price * item.quantity).toLocaleString('es-CO')}</p>
                                            </div>
                                        </div>
                                    `).join('')}

                                    <div class="total">
                                        Total: $${cartData.total.toLocaleString('es-CO')} COP
                                    </div>

                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${window.location.origin}/checkout" class="cta-button">
                                            COMPLETAR MI COMPRA
                                        </a>
                                    </div>

                                    <p style="text-align: center; color: #666; font-size: 0.9rem;">
                                        ¿Necesitas ayuda? Contáctanos y con gusto te asistiremos.
                                    </p>
                                </div>
                                <div class="footer">
                                    <p>UZI SHOP - La nueva ola del streetwear</p>
                                    <p style="font-size: 0.8rem; color: #aaa;">
                                        Este email fue enviado porque dejaste productos en tu carrito.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            };

            await addDoc(collection(db, MAIL_COLLECTION), emailDoc);
            console.log("Abandoned cart email queued");
        } catch (error) {
            console.error("Error sending abandoned cart email:", error);
        }
    }
};
