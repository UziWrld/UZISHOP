import { useAuth } from '@auth/context/AuthContext';
import { User } from '@auth/models/User';

/**
 * useAuthController Hook
 * Serves as the Controller for Authentication and User Profile management.
 */
export const useAuthController = () => {
    const {
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
    } = useAuth();

    // Transform raw profile data into a User model instance
    const user = userProfile ? User.fromFirestore(userProfile) : null;

    const handleSignup = async (email, password, additionalData) => {
        // Here we could add validation logic before calling the internal context
        return await signup(email, password, additionalData);
    };

    const handleLogin = async (email, password) => {
        return await login(email, password);
    };

    const handleUpdateProfile = async (data) => {
        // Enforce the model structure before updating
        return await updateProfile(data);
    };

    return {
        user,
        isAuthenticated: !!currentUser,
        isAdmin: user?.isAdmin() || false,
        loading: loading,
        login: handleLogin,
        loginWithGoogle,
        signup: handleSignup,
        logout,
        resetPassword,
        confirmPassword,
        reauthenticate,
        deleteUserAccount,
        updateProfile: handleUpdateProfile
    };
};
