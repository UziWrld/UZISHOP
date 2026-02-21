import React, { useState, useEffect } from 'react';
import { couponService } from '@checkout/services/couponService';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount: '',
        minPurchase: '',
        expiryDate: '',
        usageLimit: '',
        oncePerPerson: false
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await couponService.getAllCoupons();
            setCoupons(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCoupon(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await couponService.createCoupon({
                ...newCoupon,
                discount: Number(newCoupon.discount),
                minPurchase: Number(newCoupon.minPurchase),
                usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null
            });
            setNewCoupon({ code: '', discount: '', minPurchase: '', expiryDate: '', usageLimit: '', oncePerPerson: false });
            fetchCoupons();
        } catch (error) {
            alert("Error al crear cupón");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este cupón?")) return;
        try {
            await couponService.deleteCoupon(id);
            fetchCoupons();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    if (loading) return <div className="admin-card">Cargando cupones...</div>;

    return (
        <div className="admin-section">
            <div className="admin-card" style={{ marginBottom: '40px' }}>
                <h3 style={{ marginTop: 0, fontSize: '1rem', fontWeight: '900', marginBottom: '25px', letterSpacing: '1px' }}>CREAR NUEVO CUPÓN</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label>CÓDIGO</label>
                        <input type="text" name="code" className="admin-input" value={newCoupon.code} onChange={handleChange} placeholder="Ej: UZIGANG10" required />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label>DESCUENTO (%)</label>
                        <input type="number" name="discount" className="admin-input" value={newCoupon.discount} onChange={handleChange} placeholder="10" required />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label>MÍNIMO COMPRA ($)</label>
                        <input type="number" name="minPurchase" className="admin-input" value={newCoupon.minPurchase} onChange={handleChange} placeholder="100000" />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label>LÍMITE TOTAL</label>
                        <input type="number" name="usageLimit" className="admin-input" value={newCoupon.usageLimit} onChange={handleChange} placeholder="Ej: 50" />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label>FECHA VENCIMIENTO</label>
                        <input type="date" name="expiryDate" className="admin-input" value={newCoupon.expiryDate} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', height: '50px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#888' }}>
                            <input
                                type="checkbox"
                                name="oncePerPerson"
                                checked={newCoupon.oncePerPerson}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, oncePerPerson: e.target.checked }))}
                                style={{ marginRight: '10px' }}
                            />
                            UNA VEZ POR PERSONA
                        </label>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" className="admin-btn-premium admin-btn-primary" style={{ width: '100%' }}>
                            ACTIVAR CUPÓN EN LA TIENDA
                        </button>
                    </div>
                </form>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Código</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Descuento</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Mínimo</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Usos</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Reglas</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Vence</th>
                            <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: '900', color: '#888', textTransform: 'uppercase', textAlign: 'right' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                                <td style={{ padding: '20px', fontWeight: '900', fontSize: '1rem', letterSpacing: '1px' }}>{coupon.code}</td>
                                <td style={{ padding: '20px', fontWeight: '800' }}>{coupon.discount}% OFF</td>
                                <td style={{ padding: '20px', color: '#666', fontSize: '0.85rem' }}>{coupon.minPurchase ? `$${coupon.minPurchase.toLocaleString()}` : '—'}</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ fontWeight: '900' }}>{coupon.usedCount || 0}</span>
                                    <span style={{ color: '#bbb' }}>{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}</span>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    {coupon.oncePerPerson && <span style={{ background: '#000', color: '#fff', fontSize: '8px', padding: '3px 8px', borderRadius: '10px', fontWeight: '900' }}>SILO-USE</span>}
                                </td>
                                <td style={{ padding: '20px', fontSize: '0.85rem', color: '#888' }}>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Nunca'}</td>
                                <td style={{ padding: '20px', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(coupon.id)} className="admin-btn-premium admin-btn-danger" style={{ padding: '8px', borderRadius: '8px' }}>
                                        <i className='bx bx-trash'></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#bbb', fontWeight: '700' }}>No hay cupones activos.</div>}
            </div>
        </div>
    );
};

export default CouponManagement;
