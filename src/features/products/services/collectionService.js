import { db } from "@core/config/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { CacheService } from "@core/services/CacheService";
import { createLogger } from "@core/utils/Logger";
import { AppError } from "@core/utils/AppError";

const logger = createLogger('collectionService');
const COLLECTION_NAME = "collections";
const CACHE_KEY = "all_collections";
const CACHE_TTL = 600; // 10 minutos (cambian menos que productos)

const sortCollections = (data) =>
    data.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999;
        const orderB = b.order !== undefined ? b.order : 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
    });

export const collectionService = {
    // Get all collections (con caché)
    getAllCollections: async () => {
        const cached = CacheService.get(CACHE_KEY);
        if (cached) {
            logger.info('Returning collections from cache');
            return cached;
        }

        try {
            logger.info('Fetching collections from Firestore...');
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sorted = sortCollections(data);
            CacheService.set(CACHE_KEY, sorted, CACHE_TTL);
            logger.info(`Loaded ${sorted.length} collections from Firestore`);
            return sorted;
        } catch (error) {
            logger.error('Error getting collections', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Subscribe to real-time changes (invalida caché)
    subscribeToCollections: (callback) => {
        return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sorted = sortCollections(data);
            CacheService.set(CACHE_KEY, sorted, CACHE_TTL);
            callback(sorted);
        });
    },

    // Create a new collection (invalida caché)
    createCollection: async (collectionData) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...collectionData,
                createdAt: new Date().toISOString()
            });
            CacheService.remove(CACHE_KEY);
            logger.info(`Collection created: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            logger.error('Error creating collection', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Update a collection (invalida caché)
    updateCollection: async (id, data) => {
        try {
            await updateDoc(doc(db, COLLECTION_NAME, id), data);
            CacheService.remove(CACHE_KEY);
            logger.info(`Collection updated: ${id}`);
        } catch (error) {
            logger.error('Error updating collection', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Delete a collection (invalida caché)
    deleteCollection: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            CacheService.remove(CACHE_KEY);
            logger.info(`Collection deleted: ${id}`);
        } catch (error) {
            logger.error('Error deleting collection', error);
            throw AppError.fromFirebase(error);
        }
    }
};
