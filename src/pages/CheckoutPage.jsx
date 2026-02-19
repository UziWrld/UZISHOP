import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCheckoutController } from '../hooks/useCheckoutController';
import { useNavigate, Link } from 'react-router-dom';
import { formatCOP } from '../utils/formatters';
import Toast from '../components/Toast';
import { useAuthController } from '../hooks/useAuthController';

const COLOMBIAN_CITIES = [
    "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta",
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
    "Cúcuta", "Ibagué", "Pereira", "Santa Marta", "Villavicencio"
].sort();

const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const { isAuthenticated } = useAuthController();

    const {
        formData,
        handleChange,
        shippingMethod,
        setShippingMethod,
        paymentMethod,
        setPaymentMethod,
        loading,
        totalAmount,
        discountAmount,
        shippingCost,
        finalTotal,
        couponCode,
        setCouponCode,
        applyCoupon,
        submitOrder,
        isAMB
    } = useCheckoutController();

    const taxAmount = totalAmount * 0.16;

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/');
        }
    }, [cart, navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleApplyCoupon = async () => {
        const result = await applyCoupon(couponCode);
        showToast(result.message, result.success ? 'success' : 'error');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await submitOrder();
        if (result.success) {
            showToast(`¡Pedido ${result.orderNumber} realizado con éxito!`, 'success');
            setTimeout(() => {
                navigate('/order-success', { state: { orderNumber: result.orderNumber } });
            }, 1000);
        } else {
            showToast(result.message, 'error');
        }
    };

    return (
        <div className="checkout-page-wrapper">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* LEFT AREA: FORMS */}
            <div className="checkout-main-area">
                <form onSubmit={handleSubmit}>
                    {/* CONTACT SECTION */}
                    <section className="checkout-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="checkout-section-title">Contacto</h3>
                            {!isAuthenticated && <span style={{ fontSize: '0.8rem' }}>¿Ya tienes cuenta? <Link to="/login" style={{ color: '#000' }}>Inicia sesión</Link></span>}
                        </div>
                        <div className="checkout-input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo electrónico"
                                className="checkout-field"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label className="newsletter-check">
                                <input
                                    type="checkbox"
                                    name="newsletter"
                                    checked={formData.newsletter}
                                    onChange={handleChange}
                                />
                                Enviarme novedades y ofertas por correo electrónico
                            </label>
                        </div>
                    </section>

                    {/* DELIVERY SECTION */}
                    <section className="checkout-section" style={{ marginTop: '40px' }}>
                        <h3 className="checkout-section-title">Entrega</h3>
                        <div className="checkout-input-group">
                            <select className="checkout-field" defaultValue="CO">
                                <option value="CO">Colombia</option>
                            </select>

                            <div className="checkout-input-row">
                                <input type="text" name="firstName" placeholder="Nombre" className="checkout-field" value={formData.firstName} onChange={handleChange} required />
                                <input type="text" name="lastName" placeholder="Apellidos" className="checkout-field" value={formData.lastName} onChange={handleChange} required />
                            </div>

                            <input type="text" name="cedula" placeholder="Cédula" className="checkout-field" value={formData.cedula} onChange={handleChange} required />

                            <input type="text" name="address" placeholder="Dirección" className="checkout-field" value={formData.address} onChange={handleChange} required />

                            <input type="text" name="details" placeholder="Casa, apartamento, etc. (opcional)" className="checkout-field" value={formData.details} onChange={handleChange} />

                            <div className="checkout-input-row">
                                <select name="city" className="checkout-field" value={formData.city} onChange={handleChange} required>
                                    <option value="" disabled>Seleccionar Ciudad</option>
                                    {COLOMBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input type="text" name="postalCode" placeholder="Código postal (opcional)" className="checkout-field" value={formData.postalCode} onChange={handleChange} />
                            </div>

                            <input type="text" name="phone" placeholder="Teléfono" className="checkout-field" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </section>

                    {/* SHIPPING METHODS */}
                    <section className="checkout-section" style={{ marginTop: '40px' }}>
                        <h3 className="checkout-section-title">Métodos de envío</h3>
                        <div className="payment-methods-box">
                            <div className={`payment - option - row ${shippingMethod === 'standard' ? 'active' : ''} `} onClick={() => setShippingMethod('standard')}>
                                <div className="payment-info-left">
                                    <input type="radio" checked={shippingMethod === 'standard'} readOnly />
                                    <span>Envío Normal</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                    {totalAmount >= 200000 ? 'GRATIS' : '$ 15.000'}
                                </span>
                            </div>

                            {isAMB && (
                                <div className={`payment - option - row ${shippingMethod === 'cod' ? 'active' : ''} `} onClick={() => setShippingMethod('cod')}>
                                    <div className="payment-info-left">
                                        <input type="radio" checked={shippingMethod === 'cod'} readOnly />
                                        <span>Envío Contraentrega (Local)</span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                        {totalAmount >= 200000 ? 'GRATIS' : '$ 5.000'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {!formData.city && (
                            <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '10px' }}>
                                Ingresa tu dirección de envío para ver los métodos disponibles.
                            </p>
                        )}
                    </section>

                    {/* PAYMENT SECTION */}
                    <section className="checkout-section" style={{ marginTop: '40px' }}>
                        <h3 className="checkout-section-title">Pago</h3>
                        <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '15px' }}>Todas las transacciones son seguras y están encriptadas.</p>

                        <div className="payment-methods-box">
                            {shippingMethod === 'cod' ? (
                                <div
                                    className={`payment - option - row active`}
                                    style={{ border: '2px solid #000' }}
                                >
                                    <div className="payment-info-left">
                                        <input type="radio" checked={true} readOnly />
                                        <span>Pago Contraentrega (Efectivo)</span>
                                    </div>
                                    <div className="payment-logos">
                                        <i className='bx bx-money' style={{ fontSize: '1.5rem' }}></i>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={`payment - option - row ${paymentMethod === 'mercadopago' ? 'active' : ''} `}
                                        onClick={() => setPaymentMethod('mercadopago')}
                                    >
                                        <div className="payment-info-left">
                                            <input type="radio" checked={paymentMethod === 'mercadopago'} readOnly />
                                            <span>Mercado Pago / PSE</span>
                                        </div>
                                        <div className="payment-logos">
                                            <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" alt="Mercado Pago" style={{ height: '18px' }} />
                                            <img src="https://static.wixstatic.com/media/0a9394_89b2512f43ce44b89eb02084c8a5a544~mv2.png" alt="PSE" style={{ height: '18px' }} />
                                        </div>
                                    </div>

                                    <div
                                        className={`payment - option - row ${paymentMethod === 'addi' ? 'active' : ''} `}
                                        onClick={() => setPaymentMethod('addi')}
                                    >
                                        <div className="payment-info-left">
                                            <input type="radio" checked={paymentMethod === 'addi'} readOnly />
                                            <span>Paga a Crédito con Addi</span>
                                        </div>
                                        <div className="payment-logos">
                                            <img src="https://noticias.addi.com/hs-fs/hubfs/ADDI_Logo_Positivo_Prancheta%201.png?width=200&height=200&name=ADDI_Logo_Positivo_Prancheta%201.png" alt="Addi" style={{ height: '20px' }} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label className="newsletter-check">
                                <input
                                    type="checkbox"
                                    name="billingSame"
                                    checked={formData.billingSame}
                                    onChange={handleChange}
                                />
                                Usar la dirección de envío como dirección de facturación
                            </label>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '20px',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: '800',
                            fontSize: '1rem',
                            marginTop: '40px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'PROCESANDO...' : 'FINALIZAR PEDIDO'}
                    </button>
                </form>
            </div>

            {/* RIGHT AREA: SUMMARY */}
            <aside className="checkout-summary-sidebar">
                <div className="summary-items-list">
                    {cart.map(item => (
                        <div key={`${item.id} -${item.selectedSize} `} className="summary-item-card">
                            <div className="summary-img-wrapper">
                                <img src={item.image.startsWith('img/') ? `/${item.image}` : item.image} alt={item.name} />
                                <span className="item-qty-badge">{item.quantity}</span>
                            </div>
                            <div className="item-details">
                                <h4 className="item-title">{item.name}</h4>
                                <p className="item-variant">{item.selectedSize}</p>
                            </div>
                            <span className="item-price">{formatCOP(item.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Código de descuento"
                        className="checkout-field"
                        style={{ padding: '10px' }}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handleApplyCoupon}
                        style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: '800', cursor: 'pointer' }}
                    >
                        Aplicar
                    </button>
                </div>

                <div className="summary-totals-box">
                    <div className="total-line">
                        <span>Subtotal</span>
                        <span style={{ fontWeight: '600', color: '#000' }}>{formatCOP(totalAmount)}</span>
                    </div>

                    <div className="total-line" style={{ color: '#2e7d32' }}>
                        <span>Descuento Aplicado</span>
                        <span>-{formatCOP(discountAmount)}</span>
                    </div>

                    <div className="total-line">
                        <span>Envío</span>
                        <span>{shippingCost === 0 ? 'Gratis' : formatCOP(shippingCost)}</span>
                    </div>

                    <div className="total-line grand-total">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>Total</span>
                            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: '400' }}>Incluye {formatCOP(taxAmount)} de impuestos</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', marginRight: '5px' }}>COP</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{formatCOP(finalTotal)}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default CheckoutPage;
