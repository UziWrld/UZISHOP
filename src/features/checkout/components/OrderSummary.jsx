import React from 'react';
import { formatCOP } from '@utils/formatters';
import styles from '../assets/Checkout.module.css';

const OrderSummary = ({
    cart,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    discount,
    subtotal,
    shippingCost,
    total,
    processing,
    handleSubmit
}) => {
    return (
        <aside className={styles.checkoutSummarySidebar}>
            <div className="summary-items-list">
                {cart.map(item => (
                    <div key={`${item.id}-${item.selectedSize}`} className={styles.summaryItemCard}>
                        <div className={styles.summaryImgWrapper}>
                            <img src={item.image || item.images?.[0]} alt={item.name} />
                            <span className={styles.itemQtyBadge}>{item.quantity}</span>
                        </div>
                        <div className={styles.itemDetails}>
                            <h4 className={styles.itemTitle}>{item.name}</h4>
                            <p className={styles.itemVariant}>{item.selectedSize}</p>
                        </div>
                        <span className={styles.itemPrice}>
                            {formatCOP(item.price * item.quantity)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="coupon-area" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <input
                    type="text"
                    placeholder="Código de descuento"
                    className={styles.checkoutField}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                    onClick={handleApplyCoupon}
                    style={{
                        padding: '0 20px',
                        backgroundColor: '#e1e1e1',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Aplicar
                </button>
            </div>

            <div className={styles.summaryTotalsBox}>
                <div className={styles.totalLine}>
                    <span>Subtotal</span>
                    <span>{formatCOP(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className={styles.totalLine} style={{ color: '#008000' }}>
                        <span>Descuento</span>
                        <span>- {formatCOP(discount)}</span>
                    </div>
                )}
                <div className={styles.totalLine}>
                    <span>Envío</span>
                    <span>{shippingCost === 0 ? 'Gratis' : formatCOP(shippingCost)}</span>
                </div>
                <div className={`${styles.totalLine} ${styles.grandTotal}`}>
                    <span>Total</span>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: '400', marginRight: '8px' }}>COP</span>
                        {formatCOP(total)}
                    </div>
                </div>
                <p className={styles.taxHint}>Incluye $ 0 en impuestos</p>
            </div>

            <button
                className={styles.checkoutSubmitBtn}
                onClick={handleSubmit}
                disabled={processing || cart.length === 0}
            >
                {processing ? 'PROCESANDO...' : 'PAGAR AHORA'}
            </button>

            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#777', textAlign: 'center' }}>
                <p>Al completar tu compra, aceptas nuestros Términos y Condiciones.</p>
            </div>
        </aside>
    );
};

export default OrderSummary;
