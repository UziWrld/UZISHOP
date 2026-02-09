import { db, storage } from "../firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const COLLECTION_NAME = "products";

export const productService = {
    // Obtener todos los productos
    getAllProducts: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`[productService] Error getting products from COLLECTION ${COLLECTION_NAME}:`, error);
            throw error;
        }
    },

    // Suscribirse a cambios en tiempo real
    subscribeToProducts: (callback) => {
        const q = collection(db, COLLECTION_NAME);
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(data);
        });
    },

    // Crear un nuevo producto
    createProduct: async (product) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), product);
            return docRef.id;
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    },

    // Actualizar un producto existente
    updateProduct: async (id, data) => {
        try {
            const productRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(productRef, data);
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },

    // Eliminar un producto
    deleteProduct: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    },

    // Subir imagen a Firebase Storage (Reutilizado)
    uploadImage: async (file) => {
        try {
            console.log("Starting upload for:", file.name);
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            console.log("Upload successful, getting URL...");
            const url = await getDownloadURL(snapshot.ref);
            console.log("URL obtained:", url);
            return url;
        } catch (error) {
            console.error("Error in uploadImage:", error);
            throw error;
        }
    }
};
