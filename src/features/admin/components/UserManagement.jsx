import React, { useState, useEffect } from 'react';
import { db } from '@core/config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const nombre = user.nombre?.toLowerCase() || '';
        const apellidos = user.apellidos?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const fullName = `${nombre} ${apellidos}`;

        return nombre.includes(searchTerm.toLowerCase()) ||
            apellidos.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase()) ||
            fullName.includes(searchTerm.toLowerCase());
    });

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`¿Cambiar el rol de este usuario a ${newRole}?`)) return;

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert("Error al actualizar rol");
        }
    };

    if (loading) return <div className="admin-card">Cargando base de datos de usuarios...</div>;

    return (
        <div className="admin-section">
            <div className="admin-control-bar" style={{ marginBottom: '30px' }}>
                <div className="admin-search-wrapper" style={{ flex: 1 }}>
                    <i className='bx bx-search'></i>
                    <input
                        type="text"
                        placeholder="Buscar por Nombre, Apellido o Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Usuario</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Rol Actual</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Fecha de Nac.</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: user.role === 'admin' ? '#000' : '#eee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '900',
                                            color: user.role === 'admin' ? '#fff' : '#888'
                                        }}>
                                            {(user.nombre?.[0] || user.email?.[0] || '?').toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user.nombre} {user.apellidos}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: '900',
                                        background: user.role === 'admin' ? '#000' : '#f0f0f0',
                                        color: user.role === 'admin' ? '#fff' : '#666',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {user.role || 'USER'}
                                    </span>
                                </td>
                                <td style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                    {user.fechaNacimiento || 'No registrada'}
                                </td>
                                <td style={{ padding: '20px', textAlign: 'right' }}>
                                    <button
                                        className="admin-btn-premium admin-btn-secondary"
                                        style={{ padding: '8px 15px', fontSize: '9px' }}
                                        onClick={() => toggleRole(user.id, user.role)}
                                    >
                                        CAMBIAR ROL
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ padding: '50px', textAlign: 'center', color: '#888', fontWeight: '700' }}>
                        No se encontraron usuarios que coincidan con la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
