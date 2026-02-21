import { db } from "@core/config/firebase";
import { collection, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";

const COLLECTION_NAME = "categories";

export const categoryService = {
    // Get all categories
    getAllCategories: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`[categoryService] Error getting categories from COLLECTION ${COLLECTION_NAME}:`, error);
            throw error;
        }
    },

    // Subscribe to categories
    subscribeToCategories: (callback) => {
        const q = collection(db, COLLECTION_NAME);
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(data);
        });
    },

    subscribeToMenuSettings: (callback) => {
        const settingsRef = doc(db, 'settings', 'megaMenu');
        return onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data());
            } else {
                callback(null);
            }
        }, (error) => {
            console.error(`[categoryService] Error in menu settings subscription for settings/megaMenu:`, error);
        });
    },

    updateMenuSettings: async (data) => {
        try {
            const settingsRef = doc(db, 'settings', 'megaMenu');
            await setDoc(settingsRef, data, { merge: true });
        } catch (error) {
            console.error("Error updating menu settings:", error);
            throw error;
        }
    },

    // Upsert a category (create or update)
    upsertCategory: async (categoryData) => {
        try {
            const categoryRef = doc(db, 'categories', categoryData.id);
            await setDoc(categoryRef, categoryData, { merge: true });
        } catch (error) {
            console.error("Error upserting category:", error);
            throw error;
        }
    }
};
