import React from 'react';
import AdminDashboard from '@admin/components/AdminDashboard';
import { useAuthController } from '@auth/hooks/useAuthController';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
    const { user, loading } = useAuthController();

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando...</div>;

    if (!user || !user.isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return <AdminDashboard />;
};

export default AdminPage;
