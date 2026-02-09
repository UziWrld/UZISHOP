import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, Timestamp } from "firebase/firestore";

const ABANDONED_CARTS_COLLECTION = "abandonedCarts";

export const abandonedCartService = {
    /**
     * Guardar carrito abandonado
     * @param {string} userId - ID del usuario
     * @param {Array} cartItems - Items del carrito
     * @param {string} userEmail - Email del usuario
     * @param {number} total - Total del carrito
     */
    saveAbandonedCart: async (userId, cartItems, userEmail, total) => {
        try {
            // Verificar si ya existe un carrito abandonado para este usuario
            const existingQuery = query(
                collection(db, ABANDONED_CARTS_COLLECTION),
                where("userId", "==", userId),
                where("recovered", "==", false)
            );
            const existingCarts = await getDocs(existingQuery);

            // Si existe, actualizar
            if (!existingCarts.empty) {
                const cartDoc = existingCarts.docs[0];
                await updateDoc(doc(db, ABANDONED_CARTS_COLLECTION, cartDoc.id), {
                    items: cartItems,
                    total: total,
                    updatedAt: Timestamp.now()
                });
                return { success: true, cartId: cartDoc.id };
            }

            // Si no existe, crear nuevo
            const cartData = {
                userId: userId,
                userEmail: userEmail,
                items: cartItems,
                total: total,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                recovered: false,
                emailSent: false
            };

            const docRef = await addDoc(collection(db, ABANDONED_CARTS_COLLECTION), cartData);
            return { success: true, cartId: docRef.id };
        } catch (error) {
            console.error(`[abandonedCartService] Error saving/checking cart for user ${userId} in COLLECTION ${ABANDONED_CARTS_COLLECTION}:`, error);
            throw error;
        }
    },

    /**
     * Obtener carritos abandonados
     * @param {number} hoursOld - Carritos más antiguos que X horas
     * @returns {Array} - Lista de carritos abandonados
     */
    getAbandonedCarts: async (hoursOld = 1) => {
        try {
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

            const q = query(
                collection(db, ABANDONED_CARTS_COLLECTION),
                where("recovered", "==", false),
                where("createdAt", "<=", Timestamp.fromDate(cutoffTime))
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting abandoned carts:", error);
            return [];
        }
    },

    /**
     * Marcar carrito como recuperado
     * @param {string} userId - ID del usuario
     */
    markCartAsRecovered: async (userId) => {
        try {
            const q = query(
                collection(db, ABANDONED_CARTS_COLLECTION),
                where("userId", "==", userId),
                where("recovered", "==", false)
            );

            const snapshot = await getDocs(q);

            const updatePromises = snapshot.docs.map(doc =>
                updateDoc(doc.ref, {
                    recovered: true,
                    recoveredAt: Timestamp.now()
                })
            );

            await Promise.all(updatePromises);
            return { success: true };
        } catch (error) {
            console.error("Error marking cart as recovered:", error);
            throw error;
        }
    },

    /**
     * Marcar que se envió email de recuperación
     * @param {string} cartId - ID del carrito
     */
    markEmailSent: async (cartId) => {
        try {
            await updateDoc(doc(db, ABANDONED_CARTS_COLLECTION, cartId), {
                emailSent: true,
                emailSentAt: Timestamp.now()
            });
            return { success: true };
        } catch (error) {
            console.error("Error marking email sent:", error);
            throw error;
        }
    },

    /**
     * Eliminar carrito abandonado
     * @param {string} cartId - ID del carrito
     */
    deleteAbandonedCart: async (cartId) => {
        try {
            await deleteDoc(doc(db, ABANDONED_CARTS_COLLECTION, cartId));
            return { success: true };
        } catch (error) {
            console.error("Error deleting abandoned cart:", error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas de recuperación
     * @returns {Object} - Estadísticas
     */
    getRecoveryStats: async () => {
        try {
            const allCartsSnapshot = await getDocs(collection(db, ABANDONED_CARTS_COLLECTION));
            const allCarts = allCartsSnapshot.docs.map(doc => doc.data());

            const totalAbandoned = allCarts.length;
            const recovered = allCarts.filter(cart => cart.recovered).length;
            const pending = allCarts.filter(cart => !cart.recovered).length;
            const emailsSent = allCarts.filter(cart => cart.emailSent).length;

            const totalValue = allCarts.reduce((sum, cart) => sum + (cart.total || 0), 0);
            const recoveredValue = allCarts
                .filter(cart => cart.recovered)
                .reduce((sum, cart) => sum + (cart.total || 0), 0);

            return {
                totalAbandoned,
                recovered,
                pending,
                emailsSent,
                recoveryRate: totalAbandoned > 0 ? (recovered / totalAbandoned * 100).toFixed(1) : 0,
                totalValue,
                recoveredValue
            };
        } catch (error) {
            console.error("Error getting recovery stats:", error);
            return {
                totalAbandoned: 0,
                recovered: 0,
                pending: 0,
                emailsSent: 0,
                recoveryRate: 0,
                totalValue: 0,
                recoveredValue: 0
            };
        }
    }
};
