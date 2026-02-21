import { db } from "@core/config/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";

const COLLECTION_NAME = "collections";

export const collectionService = {
    // Get all collections and sort in memory to handle missing 'order' fields
    getAllCollections: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by 'order' asc, fallback to 'name'
            return data.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                if (orderA !== orderB) return orderA - orderB;
                return (a.name || "").localeCompare(b.name || "");
            });
        } catch (error) {
            console.error(`[collectionService] Error getting collections from COLLECTION ${COLLECTION_NAME}:`, error);
            throw error;
        }
    },

    // Subscribe to changes
    subscribeToCollections: (callback) => {
        return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by 'order' asc, fallback to 'name'
            const sortedData = data.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                if (orderA !== orderB) return orderA - orderB;
                return (a.name || "").localeCompare(b.name || "");
            });

            callback(sortedData);
        });
    },

    // Create a new collection
    createCollection: async (collectionData) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...collectionData,
                createdAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating collection:", error);
            throw error;
        }
    },

    // Update a collection
    updateCollection: async (id, data) => {
        try {
            const collectionRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(collectionRef, data);
        } catch (error) {
            console.error("Error updating collection:", error);
            throw error;
        }
    },

    // Delete a collection
    deleteCollection: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting collection:", error);
            throw error;
        }
    }
};
