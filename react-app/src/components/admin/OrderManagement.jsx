import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { emailService } from '../../services/emailService';
import { formatCOP } from '../../utils/formatters';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // For detailed view
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [assigningTrackingFor, setAssigningTrackingFor] = useState(null);
    const [trackingData, setTrackingData] = useState({ number: '', carrier: 'Coordinadora' });

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });

    useEffect(() => {
        const unsubscribe = orderService.subscribeToOrders((data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(order => {
        const orderNum = order.orderNumber?.toString().toLowerCase() || '';
        const name = order.customerName?.toLowerCase() || '';
        const email = order.customerEmail?.toLowerCase() || '';
        const matchesSearch = orderNum.includes(searchTerm.toLowerCase()) ||
            name.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const updateStatus = async (orderId, newStatus) => {
        const order = orders.find(o => o.id === orderId);

        if (newStatus === 'enviado' && !order.trackingNumber) {
            alert("No puedes marcar como Enviado sin asignar una guía. Usa el botón 'DESPACHAR'.");
            return;
        }

        const executeUpdate = async () => {
            try {
                await orderService.updateOrderStatus(orderId, newStatus);
                setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
            } catch (error) {
                alert("Error al actualizar estado");
            }
        };

        if (order.status === 'entregado') {
            setConfirmModal({
                show: true,
                title: '¿CAMBIAR ESTADO DE ENTREGA?',
                message: 'Este pedido ya figura como ENTREGADO. ¿Seguro que deseas revertir o cambiar su estado?',
                onConfirm: executeUpdate
            });
            return;
        }

        if (newStatus === 'devuelto') {
            setConfirmModal({
                show: true,
                title: 'PROCESAR DEVOLUCIÓN',
                message: '¿Marcar este pedido como DEVUELTO? Los productos se sumarán automáticamente al inventario.',
                onConfirm: executeUpdate
            });
            return;
        }

        executeUpdate();
    };

    const handleAssignTracking = async (orderId) => {
        if (!trackingData.number.trim()) return alert("Ingresa el número de guía");

        try {
            const order = orders.find(o => o.id === orderId);
            await orderService.addTrackingInfo(orderId, trackingData.number.trim(), trackingData.carrier);

            if (order) {
                try {
                    await emailService.sendShippingNotification(
                        { ...order, carrier: trackingData.carrier },
                        order.customerEmail,
                        trackingData.number.trim()
                    );
                } catch (emailError) {
                    console.error('Error sending shipping email:', emailError);
                }
            }

            setAssigningTrackingFor(null);
            setTrackingData({ number: '', carrier: 'Coordinadora' });
        } catch (error) {
            alert("Error al actualizar información de envío");
        }
    };

    const getStatusClass = (status) => {
        return `status-${status.replace(/\s+/g, '')}`;
    };

    const getPaymentLabel = (method) => {
        switch (method) {
            case 'mercadopago': return 'MP / PSE';
            case 'addi': return 'Addi';
            case 'cod': return 'Contraentrega';
            default: return method;
        }
    };

    if (loading) return <div className="admin-card">Cargando pedidos...</div>;

    return (
        <div className="admin-section">
            <div className="admin-control-bar" style={{ marginBottom: '30px' }}>
                <div className="admin-search-wrapper" style={{ flex: 2 }}>
                    <i className='bx bx-search'></i>
                    <input
                        type="text"
                        placeholder="Buscar por # Pedido, Cliente o Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="admin-btn-premium admin-btn-secondary"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ flex: 1, minWidth: '180px' }}
                >
                    <option value="all">TODOS LOS ESTADOS</option>
                    <option value="en preparacion">EN PREPARACIÓN</option>
                    <option value="enviado">ENVIADO</option>
                    <option value="entregado">ENTREGADO</option>
                    <option value="cancelado">CANCELADO</option>
                    <option value="devuelto">DEVUELTO</option>
                </select>
            </div>

            <div className="admin-orders-grid">
                {filteredOrders.map(order => {
                    return (
                        <div key={order.id} className="admin-order-card">
                            <div className="order-card-header">
                                <div className="order-id-group">
                                    <span className="order-number">#{order.orderNumber}</span>
                                    <span className="order-date">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                                <div className={`order-status-badge ${getStatusClass(order.status)}`}>
                                    <span className="status-dot"></span>
                                    {order.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="order-card-body">
                                <div className="customer-info">
                                    <p className="customer-name">{order.customerName}</p>
                                    <p className="customer-location"><i className='bx bx-map-pin'></i> {order.shippingInfo?.city}</p>
                                </div>

                                <div className="order-items-preview">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="mini-item-thumb">
                                            <img src={item.image} alt="" />
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <div className="mini-item-more">+{order.items.length - 3}</div>
                                    )}
                                </div>

                                <div className="order-summary-row">
                                    <div className="summary-col">
                                        <span className="label">PAGO</span>
                                        <span className="value">{getPaymentLabel(order.paymentMethod)}</span>
                                    </div>
                                    <div className="summary-col">
                                        <span className="label">TOTAL</span>
                                        <span className="value-total">{formatCOP(order.total)}</span>
                                    </div>
                                </div>

                                {order.trackingNumber && (
                                    <div className="order-logistics-info">
                                        <div className="logistics-tag">
                                            <i className='bx bx-package'></i>
                                            <span>{order.carrier}: <strong>{order.trackingNumber}</strong></span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="order-card-actions">
                                <select
                                    className="admin-input-card"
                                    value={order.status}
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                >
                                    <option value="en preparacion">ESTADO: PREPARACIÓN</option>
                                    <option value="enviado" disabled={!order.trackingNumber}>ESTADO: ENVIADO</option>
                                    <option value="entregado">ESTADO: ENTREGADO</option>
                                    <option value="cancelado">ESTADO: CANCELADO</option>
                                    <option value="devuelto">ESTADO: DEVUELTO</option>
                                </select>

                                <div className="card-buttons">
                                    <button
                                        className="btn-card-primary"
                                        onClick={() => {
                                            setAssigningTrackingFor(order.id);
                                            setTrackingData({ number: order.trackingNumber || '', carrier: order.carrier || 'Coordinadora' });
                                        }}
                                    >
                                        <i className='bx bx-paper-plane'></i> {order.trackingNumber ? 'RE-LOGÍSTICA' : 'DESPACHAR'}
                                    </button>
                                    <button
                                        className="btn-card-secondary"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        VER TODO
                                    </button>
                                </div>

                                {assigningTrackingFor === order.id && (
                                    <div className="inline-card-modal">
                                        <p className="card-modal-title">GESTIONAR TRANSPORTE</p>
                                        <select
                                            className="admin-input"
                                            value={trackingData.carrier}
                                            onChange={e => setTrackingData(prev => ({ ...prev, carrier: e.target.value }))}
                                        >
                                            <option value="Coordinadora">COORDINADORA</option>
                                            <option value="Servientrega">SERVIENTREGA</option>
                                            <option value="Envia">ENVÍA</option>
                                            <option value="Interrapidisimo">INTERRAPIDISIMO</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            placeholder="Nº Guía"
                                            value={trackingData.number}
                                            onChange={e => setTrackingData(prev => ({ ...prev, number: e.target.value }))}
                                        />
                                        <div className="modal-actions">
                                            <button className="btn-confirm" onClick={() => handleAssignTracking(order.id)}>LISTO</button>
                                            <button className="btn-cancel" onClick={() => setAssigningTrackingFor(null)}>CERRAR</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredOrders.length === 0 && (
                <div className="admin-empty-state">
                    <i className='bx bx-search-alt'></i>
                    <p>No se encontraron pedidos que coincidan con la búsqueda.</p>
                </div>
            )}

            {/* Detailed Order Modal */}
            {selectedOrder && (
                <div className="admin-full-modal-overlay">
                    <div className="admin-full-modal">
                        <div className="modal-header">
                            <div>
                                <h2>DETALLES DEL PEDIDO</h2>
                                <p>Orden: {selectedOrder.orderNumber}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}><i className='bx bx-x'></i></button>
                        </div>
                        <div className="modal-content">
                            <div className="details-grid">
                                <div className="details-section">
                                    <h3>LOGÍSTICA Y CLIENTE</h3>
                                    <div className="info-box">
                                        <p><strong>CLIENTE:</strong> {selectedOrder.customerName}</p>
                                        <p><strong>EMAIL:</strong> {selectedOrder.customerEmail}</p>
                                        <p><strong>CÉDULA:</strong> {selectedOrder.cedula || 'N/A'}</p>
                                        <p><strong>TELÉFONO:</strong> {selectedOrder.shippingInfo?.phone}</p>
                                        <hr />
                                        <p><strong>CIUDAD:</strong> {selectedOrder.shippingInfo?.city}</p>
                                        <p><strong>DIRECCIÓN:</strong> {selectedOrder.shippingInfo?.address}</p>
                                        <p><strong>DETALLES:</strong> {selectedOrder.shippingInfo?.details || '--'}</p>
                                    </div>
                                </div>
                                <div className="details-section">
                                    <h3>PRODUCTOS</h3>
                                    <div className="items-list">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="modal-item">
                                                <img src={item.image} alt="" />
                                                <div className="item-meta">
                                                    <p className="name">{item.name}</p>
                                                    <p className="spec">TALLA {item.selectedSize} • CANT {item.quantity}</p>
                                                </div>
                                                <p className="price">{formatCOP(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="modal-total">
                                        <span>TOTAL PAGADO:</span>
                                        <strong>{formatCOP(selectedOrder.total)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="admin-confirm-overlay">
                    <div className="admin-confirm-modal">
                        <div className="modal-warning-icon">⚠️</div>
                        <h3>{confirmModal.title}</h3>
                        <p>{confirmModal.message}</p>
                        <div className="modal-buttons">
                            <button className="btn-modal-confirm" onClick={confirmModal.onConfirm}>CONFIRMAR</button>
                            <button className="btn-modal-cancel" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
