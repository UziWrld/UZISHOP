import { db } from "../firebase/config";
import { collection, query, where, getDocs, doc, runTransaction, onSnapshot, updateDoc } from "firebase/firestore";

const COLLECTION_NAME = "orders";
const PRODUCTS_COLLECTION = "products";

const generateOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `UZI-${date}-${random}`;
};

export const orderService = {
    // Crear un nuevo pedido con manejo de inventario atómico
    createOrder: async (orderData) => {
        const orderNumber = generateOrderNumber();
        const orderRef = doc(collection(db, COLLECTION_NAME));

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Verificar y descontar stock para cada producto
                for (const item of orderData.items) {
                    const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
                    const productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) {
                        throw new Error(`El producto ${item.name} no existe.`);
                    }

                    const productData = productDoc.data();
                    const variants = productData.variants || [];

                    // Buscar la variante específica (talla)
                    const variantIndex = variants.findIndex(v => v.size === item.selectedSize);

                    if (variantIndex === -1) {
                        throw new Error(`La talla ${item.selectedSize} para ${item.name} no está disponible.`);
                    }

                    if (variants[variantIndex].stock < item.quantity) {
                        throw new Error(`Lo sentimos, no hay suficiente stock de ${item.name} en talla ${item.selectedSize}.`);
                    }

                    // Actualizar stock de la variante
                    variants[variantIndex].stock -= item.quantity;

                    // Recalcular stock total del producto
                    const newTotalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);

                    // Aplicar cambios al producto
                    transaction.update(productRef, {
                        variants: variants,
                        stock: newTotalStock,
                        soldCount: (productData.soldCount || 0) + item.quantity
                    });
                }

                // 2. Manejar uso de cupón de forma atómica (si existe)
                if (orderData.couponCode) {
                    const q = query(collection(db, "coupons"), where("code", "==", orderData.couponCode.toUpperCase()));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const couponDoc = querySnapshot.docs[0];
                        const couponRef = doc(db, "coupons", couponDoc.id);
                        const couponData = couponDoc.data();

                        // Re-validar límites dentro de la transacción
                        if (couponData.usageLimit && (couponData.usedCount || 0) >= couponData.usageLimit) {
                            throw new Error("El cupón se ha agotado justo ahora.");
                        }

                        if (couponData.oncePerPerson && orderData.userId !== 'guest') {
                            const usedBy = couponData.usedBy || [];
                            if (usedBy.includes(orderData.userId)) {
                                throw new Error("Ya has usado este cupón anteriormente.");
                            }
                        }

                        // Actualizar registros de uso
                        const newUsedBy = [...(couponData.usedBy || [])];
                        if (orderData.userId !== 'guest') {
                            newUsedBy.push(orderData.userId);
                        }

                        transaction.update(couponRef, {
                            usedCount: (couponData.usedCount || 0) + 1,
                            usedBy: newUsedBy
                        });
                    }
                }

                // 3. Crear el documento del pedido
                transaction.set(orderRef, {
                    ...orderData.toFirestore(),
                    orderNumber,
                    status: 'en preparacion',
                    trackingNumber: '',
                    createdAt: new Date()
                });
            });

            return { id: orderRef.id, orderNumber };
        } catch (error) {
            console.error("Error in createOrder transaction:", error);
            throw error; // El componente CheckoutPage manejará este error y lo mostrará al usuario
        }
    },

    // Obtener pedidos por usuario
    getUserOrders: async (userId) => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const orders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Ordenar por fecha descending en el cliente para evitar requerir un índice compuesto en Firestore
            return orders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        } catch (error) {
            console.error(`[orderService] Error getting orders for user ${userId} from COLLECTION ${COLLECTION_NAME}:`, error);
            throw error;
        }
    },

    // ADMIN: Obtener todos los pedidos
    getAllOrders: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            const orders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return orders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        } catch (error) {
            console.error(`[orderService] Error getting ALL orders (ADMIN) from COLLECTION ${COLLECTION_NAME}:`, error);
            throw error;
        }
    },

    // ADMIN: Suscripción en tiempo real a todos los pedidos
    subscribeToOrders: (callback) => {
        const q = query(collection(db, COLLECTION_NAME));

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const sortedOrders = orders.sort((a, b) =>
                b.createdAt?.seconds - a.createdAt?.seconds
            );

            callback(sortedOrders);
        }, (error) => {
            console.error("Error in orders subscription:", error);
        });
    },

    // ADMIN: Actualizar estado del pedido con manejo de inventario para devoluciones
    updateOrderStatus: async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, COLLECTION_NAME, orderId);

            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw new Error("El pedido no existe");

                const orderData = orderDoc.data();
                const oldStatus = orderData.status;

                // Si cambia a 'devuelto' y no estaba previamente devuelto, restaurar stock
                if (newStatus === 'devuelto' && oldStatus !== 'devuelto') {
                    for (const item of orderData.items) {
                        const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
                        const productDoc = await transaction.get(productRef);

                        if (productDoc.exists()) {
                            const productData = productDoc.data();
                            const variants = productData.variants || [];
                            const variantIndex = variants.findIndex(v => v.size === item.selectedSize);

                            if (variantIndex !== -1) {
                                variants[variantIndex].stock += item.quantity;
                                const newTotalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);
                                transaction.update(productRef, {
                                    variants: variants,
                                    stock: newTotalStock
                                });
                            }
                        }
                    }
                }

                transaction.update(orderRef, {
                    status: newStatus,
                    updatedAt: new Date()
                });
            });

            return { success: true };
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error;
        }
    },

    // ADMIN: Agregar número de tracking y transportadora
    addTrackingInfo: async (orderId, trackingNumber, carrier) => {
        try {
            const orderRef = doc(db, COLLECTION_NAME, orderId);
            await updateDoc(orderRef, {
                trackingNumber,
                carrier,
                status: 'enviado',
                shippedAt: new Date(),
                updatedAt: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error("Error adding tracking info:", error);
            throw error;
        }
    }
};

