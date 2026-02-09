import React from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAuthController } from '../hooks/useAuthController';
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
