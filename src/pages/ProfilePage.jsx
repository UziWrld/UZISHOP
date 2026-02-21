import React, { useState, useEffect } from 'react';
import { useAuthController } from '@auth/hooks/useAuthController';
import { orderService } from '@checkout/services/orderService';
import { formatCOP } from '@utils/formatters';
import Footer from '@core/components/layout/Footer';
import '@assets/css/profile.css';

const ProfilePage = () => {
    const { user, updateProfile } = useAuthController();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAddress, setEditingAddress] = useState(false);
    const [editFormData, setEditFormData] = useState({
        cedula: '',
        address: '',
        details: '',
        city: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                try {
                    const userOrders = await orderService.getUserOrders(user.uid);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("ProfilePage: Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && !editingAddress) {
            setEditFormData({
                cedula: user.cedula || '',
                address: user.address || '',
                details: user.details || '',
                city: user.city || '',
                phone: user.phone || ''
            });
        }
    }, [user, editingAddress]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async () => {
        try {
            await updateProfile(editFormData);
            setEditingAddress(false);
        } catch (error) {
            alert("Error al actualizar la dirección: " + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'en preparacion': return '#f39c12';
            case 'en camino':
            case 'enviado': return '#3498db';
            case 'entregado': return '#27ae60';
            default: return '#777';
        }
    };

    if (!user) {
        return (
            <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '100vh' }}>
                <h2>Debes iniciar sesión para ver tu perfil.</h2>
            </div>
        );
    }

    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">

                <header className="profile-header">
                    <h1 className="profile-title">HOLA, {user?.nombre?.toUpperCase() || 'USUARIO'}</h1>
                    <p className="profile-subtitle">Gestiona tus pedidos y detalles de cuenta.</p>
                </header>

                <div className="profile-content-grid">

                    <div className="profile-sidebar">
                        {/* Detalles de Cuenta */}
                        <div className="profile-info-card">
                            <h3 className="card-title">DETALLES</h3>
                            <div className="info-group">
                                <div>
                                    <p className="info-label">Email</p>
                                    <p className="info-value">{user.email}</p>
                                </div>
                                <div>
                                    <p className="info-label">Nombre</p>
                                    <p className="info-value">{user?.nombre} {user?.apellidos}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dirección de Envío Guardada */}
                        <div className="profile-info-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <h3 className="card-title" style={{ border: 'none', margin: 0, padding: 0 }}>DIRECCIÓN DE ENVÍO</h3>
                                {!editingAddress ? (
                                    <button
                                        onClick={() => setEditingAddress(true)}
                                        className="edit-btn-premium"
                                    >
                                        EDITAR
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => setEditingAddress(false)} className="edit-btn-premium" style={{ background: '#777' }}>CANCELAR</button>
                                        <button onClick={handleSaveAddress} className="edit-btn-premium">GUARDAR</button>
                                    </div>
                                )}
                            </div>

                            {editingAddress ? (
                                <div className="address-edit-form">
                                    <div className="form-field-group">
                                        <label>CÉDULA</label>
                                        <input type="text" name="cedula" value={editFormData.cedula} onChange={handleEditChange} />
                                    </div>
                                    <div className="form-field-group">
                                        <label>DIRECCIÓN</label>
                                        <input type="text" name="address" value={editFormData.address} onChange={handleEditChange} />
                                    </div>
                                    <div className="form-field-group">
                                        <label>APTO / CASA / DETALLES</label>
                                        <input type="text" name="details" value={editFormData.details} onChange={handleEditChange} />
                                    </div>
                                    <div className="form-field-group">
                                        <label>CIUDAD</label>
                                        <input type="text" name="city" value={editFormData.city} onChange={handleEditChange} />
                                    </div>
                                    <div className="form-field-group">
                                        <label>TELÉFONO</label>
                                        <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} />
                                    </div>
                                </div>
                            ) : (
                                <div className="address-card-content">
                                    <div className="address-row">
                                        <i className='bx bx-id-card address-icon'></i>
                                        <div>
                                            <p className="info-label">Cédula</p>
                                            <p className="info-value">{user?.cedula || 'No registrada'}</p>
                                        </div>
                                    </div>
                                    <div className="address-row">
                                        <i className='bx bx-map address-icon'></i>
                                        <div>
                                            <p className="info-label">Dirección</p>
                                            <p className="info-value">{user?.address || 'Sin dirección'}</p>
                                            {user?.details && <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{user?.details}</p>}
                                        </div>
                                    </div>
                                    <div className="address-row">
                                        <i className='bx bx-buildings address-icon'></i>
                                        <div>
                                            <p className="info-label">Ciudad</p>
                                            <p className="info-value">{user?.city}</p>
                                        </div>
                                    </div>
                                    <div className="address-row">
                                        <i className='bx bx-phone address-icon'></i>
                                        <div>
                                            <p className="info-label">Teléfono</p>
                                            <p className="info-value">{user?.phone || 'No registrado'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Historial de Pedidos */}
                    <div className="orders-history-section">
                        <h3 className="section-title">TUS PEDIDOS ({orders.length})</h3>

                        {loading ? (
                            <p>Cargando pedidos...</p>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px' }}>
                                <i className='bx bx-shopping-bag' style={{ fontSize: '3rem', color: '#eee' }}></i>
                                <p style={{ color: '#999', marginTop: '10px' }}>Aún no has realizado ningún pedido.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {orders.map(order => (
                                    <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                        <div className="order-header">
                                            <div>
                                                <h4 className="order-number">Pedido #{order.orderNumber}</h4>
                                                <p className="order-date">Realizado el {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                            </div>
                                            <div className="order-status-badge" style={{
                                                color: getStatusColor(order.status)
                                            }}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="order-items-scroll">
                                            {order.items?.map((item, idx) => (
                                                <img
                                                    key={idx}
                                                    src={item.image.startsWith('img/') ? `/${item.image}` : item.image}
                                                    alt=""
                                                    className="order-item-thumb"
                                                />
                                            ))}
                                        </div>

                                        <div className="order-footer">
                                            <div>
                                                <p className="info-label">Total</p>
                                                <p className="info-value" style={{ fontWeight: '800' }}>{formatCOP(order.total)}</p>
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#000', fontWeight: '800' }}>VER DETALLE <i className='bx bx-chevron-right'></i></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Order Modal */}
            {selectedOrder && (
                <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-modal-card" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}>
                            <i className='bx bx-x'></i>
                        </button>

                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>PEDIDO #{selectedOrder.orderNumber}</h2>
                            <p className="modal-subtitle">Realizado el {new Date(selectedOrder.createdAt?.seconds * 1000).toLocaleString()}</p>
                        </div>

                        {/* Animated Status Bar */}
                        <div className="order-tracking-viz">
                            <div className="tracking-line">
                                <div className="tracking-progress" style={{ width: selectedOrder.status === 'entregado' ? '100%' : (selectedOrder.status === 'en camino' || selectedOrder.status === 'enviado') ? '66%' : '33%' }}></div>
                            </div>
                            <div className="tracking-steps">
                                <div className={`step ${['confirmado', 'en preparacion', 'en camino', 'enviado', 'entregado'].includes(selectedOrder.status) ? 'active' : ''}`}>
                                    <div className="step-dot"></div>
                                    <span>CONFIRMADO</span>
                                </div>
                                <div className={`step ${['en preparacion', 'en camino', 'enviado', 'entregado'].includes(selectedOrder.status) ? 'active' : ''}`}>
                                    <div className="step-dot"></div>
                                    <span>PREPARACIÓN</span>
                                </div>
                                <div className={`step ${['en camino', 'enviado', 'entregado'].includes(selectedOrder.status) ? 'active' : ''}`}>
                                    <div className="step-dot"></div>
                                    <span>EN CAMINO</span>
                                </div>
                                <div className={`step ${selectedOrder.status === 'entregado' ? 'active' : ''}`}>
                                    <div className="step-dot"></div>
                                    <span>ENTREGADO</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="modal-sections-grid">
                                <div className="modal-items-list">
                                    <h3 className="section-title">PRODUCTOS</h3>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="modal-item-row">
                                            <img src={item.image.startsWith('img/') ? `/${item.image}` : item.image} alt={item.name} className="modal-item-img" />
                                            <div className="modal-item-info">
                                                <p className="modal-item-name">{item.name}</p>
                                                <p className="modal-item-meta">Talla: {item.selectedSize} | Cant: {item.quantity}</p>
                                                <p className="modal-item-price">{formatCOP(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-info-sidebar">
                                    <div className="modal-section">
                                        <h3 className="section-title">ENVÍO</h3>
                                        <p className="modal-text">{selectedOrder.customerName}</p>
                                        <p className="modal-text">{selectedOrder.shippingInfo?.address}</p>
                                        <p className="modal-text">{selectedOrder.shippingInfo?.city}</p>
                                        {selectedOrder.carrier && (
                                            <p className="modal-text" style={{ marginTop: '10px', color: '#666' }}>
                                                Transportadora: <strong style={{ color: '#000' }}>{selectedOrder.carrier}</strong>
                                            </p>
                                        )}
                                        {selectedOrder.trackingNumber && (
                                            <div className="tracking-badge-premium">
                                                GUÍA: {selectedOrder.trackingNumber}
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-section">
                                        <h3 className="section-title">RESUMEN</h3>
                                        <div className="modal-total-row">
                                            <span>Subtotal</span>
                                            <span>{formatCOP(selectedOrder.subtotal)}</span>
                                        </div>
                                        <div className="modal-total-row">
                                            <span>Envío</span>
                                            <span>{selectedOrder.shippingInfo?.cost === 0 ? 'Gratis' : formatCOP(selectedOrder.shippingInfo?.cost)}</span>
                                        </div>
                                        {selectedOrder.discount > 0 && (
                                            <div className="modal-total-row discount">
                                                <span>Descuento</span>
                                                <span>-{formatCOP(selectedOrder.discount)}</span>
                                            </div>
                                        )}
                                        <div className="modal-total-row grand-total">
                                            <span>TOTAL</span>
                                            <span>{formatCOP(selectedOrder.total)}</span>
                                        </div>
                                        <p className="modal-payment-line">Pagado con {selectedOrder.paymentMethod?.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
