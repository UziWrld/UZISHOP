import { db } from "@core/config/firebase";
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, query, where } from "firebase/firestore";

const COLLECTION_NAME = "coupons";

export const couponService = {
    // Validar un cupón
    validateCoupon: async (code, cartTotal, userId) => {
        try {
            const q = query(collection(db, COLLECTION_NAME), where("code", "==", code.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("El cupón no existe.");
            }

            const couponDoc = querySnapshot.docs[0];
            const couponData = { id: couponDoc.id, ...couponDoc.data() };

            // 1. Verificar si está activo
            if (couponData.active === false) {
                throw new Error("Este cupón ya no está activo.");
            }

            // 2. Verificar fecha de vencimiento
            if (couponData.expiryDate) {
                const now = new Date();
                const expiry = new Date(couponData.expiryDate.seconds * 1000 || couponData.expiryDate);
                if (now > expiry) {
                    throw new Error("El cupón ha expirado.");
                }
            }

            // 3. Verificar monto mínimo
            if (couponData.minPurchase && cartTotal < couponData.minPurchase) {
                throw new Error(`El monto mínimo para usar este cupón es $${couponData.minPurchase.toLocaleString()}.`);
            }

            // 4. Verificar límite de usos globales
            if (couponData.usageLimit && (couponData.usedCount || 0) >= couponData.usageLimit) {
                throw new Error("Este cupón ha agotado su límite de usos.");
            }

            // 5. Verificar si es una vez por persona
            if (couponData.oncePerPerson && userId) {
                const usedBy = couponData.usedBy || [];
                if (usedBy.includes(userId)) {
                    throw new Error("Ya has utilizado este cupón anteriormente.");
                }
            }

            return couponData;
        } catch (error) {
            console.error("Error validating coupon:", error);
            throw error;
        }
    },

    // Obtener todos los cupones (Admin)
    getAllCoupons: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting coupons:", error);
            throw error;
        }
    },

    // Crear un cupón (Admin)
    createCoupon: async (couponData) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...couponData,
                code: couponData.code.toUpperCase(),
                active: true,
                usedCount: 0,
                usedBy: [],
                createdAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating coupon:", error);
            throw error;
        }
    },

    // Eliminar un cupón (Admin)
    deleteCoupon: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting coupon:", error);
            throw error;
        }
    }
};
