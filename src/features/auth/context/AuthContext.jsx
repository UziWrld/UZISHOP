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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import LoadingScreen from '@components/common/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configurar idioma español para correos automáticos
    auth.languageCode = 'es';

    // Registro con datos adicionales
    const signup = async (email, password, additionalData) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Crear perfil en Firestore
            const newProfile = {
                uid: user.uid,
                email: user.email,
                role: 'user', // Rol por defecto
                createdAt: new Date(),
                ...additionalData // nombre, apellidos, fechaNacimiento
            };

            await setDoc(doc(db, "users", user.uid), newProfile);
            setUserProfile(newProfile); // Actualización inmediata del estado

            return user;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        console.log("AuthContext: Starting login for", email);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;
            console.log("AuthContext: Login success, UID:", user.uid);

            // Fetch profile immediately to sync state
            const docRef = doc(db, "users", user.uid);
            console.log("AuthContext: Fetching profile from Firestore...");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("AuthContext: Profile found:", docSnap.data());
                setUserProfile(docSnap.data());
            } else {
                console.log("AuthContext: No profile document found.");
                setUserProfile(null);
            }

            return user;
        } catch (error) {
            console.error("AuthContext: Login error:", error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Verificar si ya tiene perfil
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Crear perfil base si es nuevo
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
                // Si existe, cargar perfil inmediatamente al estado
                setUserProfile(docSnap.data());
            }

            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUserProfile(null); // Limpiar perfil al salir
        return signOut(auth);
    };

    const updateProfile = async (data) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            // setDoc con merge:true crea el doc si no existe o lo actualiza si sí
            await setDoc(userRef, data, { merge: true });

            // Actualizar estado local inmediatamente
            setUserProfile(prev => ({
                ...(prev || {}),
                ...data
            }));
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const confirmPassword = (oobCode, newPassword) => {
        return confirmPasswordReset(auth, oobCode, newPassword);
    };

    /**
     * Re-authenticates the user with their current password.
     * Required for sensitive actions like account deletion or email change.
     */
    const reauthenticate = async (password) => {
        if (!auth.currentUser || !auth.currentUser.email) return;
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        try {
            await reauthenticateWithCredential(auth.currentUser, credential);
            console.log("[AuthContext] Re-authentication successful");
        } catch (error) {
            console.error("[AuthContext] Re-authentication failed", error);
            throw error;
        }
    };

    const deleteUserAccount = async () => {
        if (!auth.currentUser) return;
        try {
            // 1. Delete Firestore profile
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                deletedAt: new Date(),
                email: 'DELETED'
            }, { merge: true });

            // 2. Delete Auth account
            await auth.currentUser.delete();
            console.log("[AuthContext] User account deleted");
        } catch (error) {
            console.error("[AuthContext] Error deleting user account", error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setCurrentUser(user);

                if (user) {
                    console.log(`[AuthContext] User logged in: ${user.uid}. Fetching profile...`);
                    // Cargar perfil completo (incluyendo rol) desde Firestore
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        console.log("[AuthContext] Profile fetched successfully:", docSnap.data().role);
                        setUserProfile(docSnap.data());
                    } else {
                        console.warn("[AuthContext] No profile document found for user:", user.uid);
                        setUserProfile(null);
                    }
                } else {
                    console.log("[AuthContext] No user logged in (Guest).");
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
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
