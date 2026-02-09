import React, { useState, useEffect } from 'react';

const UserManagement = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost/UZISHOP/api_users.php');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            const response = await fetch('http://localhost/UZISHOP/api_users.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: id })
            });
            const result = await response.json();
            if (result.success) {
                fetchUsers();
            }
        } catch (err) {
            alert('Error eliminando usuario');
        }
    };

    return (
        <div className="admin-container" style={{ padding: '20px', background: '#fff', borderRadius: '10px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Lista de Usuarios (Admin)</h2>
                <button onClick={onClose} style={{ padding: '5px 15px', cursor: 'pointer' }}>Cerrar</button>
            </div>
            {loading ? <p>Cargando...</p> : (
                <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Nombre</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{user.id}</td>
                                <td style={{ padding: '10px' }}>{user.nombre}</td>
                                <td style={{ padding: '10px' }}>{user.email}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserManagement;
