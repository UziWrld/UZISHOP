import { db } from '@core/config/firebase';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    getDoc
} from 'firebase/firestore';

const COLLECTION = 'sizeGuides';

export const sizeGuideService = {
    getAllGuides: async () => {
        const snap = await getDocs(collection(db, COLLECTION));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    getGuide: async (gender, category) => {
        const id = `${gender}_${category}`;
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    saveGuide: async (gender, category, data) => {
        const id = `${gender}_${category}`;
        const docRef = doc(db, COLLECTION, id);
        await setDoc(docRef, {
            ...data,
            gender,
            category,
            updatedAt: new Date()
        });
    },

    deleteGuide: async (id) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
