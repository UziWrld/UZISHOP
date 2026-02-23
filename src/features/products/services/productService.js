import { db, storage } from "@core/config/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CacheService } from "@core/services/CacheService";
import { createLogger } from "@core/utils/Logger";
import { AppError } from "@core/utils/AppError";

const logger = createLogger('productService');
const COLLECTION_NAME = "products";
const CACHE_KEY = "all_products";
const CACHE_TTL = 300; // 5 minutos

export const productService = {
    // Obtener todos los productos (con caché)
    getAllProducts: async () => {
        const cached = CacheService.get(CACHE_KEY);
        if (cached) {
            logger.info('Returning products from cache');
            return cached;
        }

        try {
            logger.info('Fetching products from Firestore...');
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            const products = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            CacheService.set(CACHE_KEY, products, CACHE_TTL);
            logger.info(`Loaded ${products.length} products from Firestore`);
            return products;
        } catch (error) {
            logger.error('Error getting products', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Suscribirse a cambios en tiempo real (invalida caché en cada cambio)
    subscribeToProducts: (callback) => {
        const q = collection(db, COLLECTION_NAME);
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            CacheService.set(CACHE_KEY, data, CACHE_TTL);
            callback(data);
        });
    },

    // Crear un nuevo producto (invalida caché)
    createProduct: async (product) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), product);
            CacheService.remove(CACHE_KEY);
            logger.info(`Product created: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            logger.error('Error creating product', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Actualizar un producto (invalida caché)
    updateProduct: async (id, data) => {
        try {
            const productRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(productRef, data);
            CacheService.remove(CACHE_KEY);
            logger.info(`Product updated: ${id}`);
        } catch (error) {
            logger.error('Error updating product', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Eliminar un producto (invalida caché)
    deleteProduct: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            CacheService.remove(CACHE_KEY);
            logger.info(`Product deleted: ${id}`);
        } catch (error) {
            logger.error('Error deleting product', error);
            throw AppError.fromFirebase(error);
        }
    },

    // Subir imagen a Firebase Storage
    uploadImage: async (file) => {
        try {
            logger.info(`Uploading image: ${file.name}`);
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            logger.info('Image uploaded successfully');
            return url;
        } catch (error) {
            logger.error('Error uploading image', error);
            throw AppError.fromFirebase(error);
        }
    }
};
