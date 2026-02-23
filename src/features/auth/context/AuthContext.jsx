import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '@core/config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    sendPasswordResetEmail,
    confirmPasswordReset,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoadingScreen from '@components/common/LoadingScreen';
import { createLogger } from '@core/utils/Logger';

const logger = createLogger('AuthContext');
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    auth.languageCode = 'es';

    // Registro con datos adicionales
    const signup = async (email, password, additionalData) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            const newProfile = {
                uid: user.uid,
                email: user.email,
                role: 'user',
                createdAt: new Date(),
                ...additionalData
            };

            await setDoc(doc(db, "users", user.uid), newProfile);
            setUserProfile(newProfile);
            return user;
        } catch (error) {
            logger.error('Error en registro', error);
            throw error;
        }
    };

    /**
     * Login simplificado: solo autentica.
     * onAuthStateChanged se encarga de cargar el perfil.
     * Eliminado double-fetch que generaba 2 lecturas innecesarias a Firestore.
     */
    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            logger.info('Login exitoso');
            return result.user;
        } catch (error) {
            logger.error('Error en login', error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                const names = user.displayName?.split(' ') || [];
                const newProfile = {
                    uid: user.uid,
                    email: user.email,
                    nombre: names[0] || 'Usuario',
                    apellidos: names.slice(1).join(' ') || '',
                    role: 'user',
                    createdAt: new Date(),
                    authType: 'google'
                };
                await setDoc(docRef, newProfile);
                setUserProfile(newProfile);
            } else {
                setUserProfile(docSnap.data());
            }

            return user;
        } catch (error) {
            logger.error('Error en login con Google', error);
            throw error;
        }
    };

    const logout = () => {
        setUserProfile(null);
        return signOut(auth);
    };

    const updateProfile = async (data) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, data, { merge: true });
            setUserProfile(prev => ({
                ...(prev || {}),
                ...data
            }));
        } catch (error) {
            logger.error('Error actualizando perfil', error);
            throw error;
        }
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const confirmPassword = (oobCode, newPassword) => {
        return confirmPasswordReset(auth, oobCode, newPassword);
    };

    const reauthenticate = async (password) => {
        if (!auth.currentUser || !auth.currentUser.email) return;
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        try {
            await reauthenticateWithCredential(auth.currentUser, credential);
            logger.info('Re-autenticación exitosa');
        } catch (error) {
            logger.error('Error en re-autenticación', error);
            throw error;
        }
    };

    const deleteUserAccount = async () => {
        if (!auth.currentUser) return;
        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                deletedAt: new Date(),
                email: 'DELETED'
            }, { merge: true });
            await auth.currentUser.delete();
            logger.info('Cuenta de usuario eliminada');
        } catch (error) {
            logger.error('Error eliminando cuenta', error);
            throw error;
        }
    };

    // Punto único de carga de perfil: onAuthStateChanged
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setCurrentUser(user);

                if (user) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        logger.warn(`Sin documento de perfil para UID: ${user.uid}`);
                        setUserProfile(null);
                    }
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                logger.error('Error cargando perfil de usuario', error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        loginWithGoogle,
        updateProfile,
        resetPassword,
        confirmPassword,
        reauthenticate,
        deleteUserAccount,
        logout,
        loading
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
