import React from 'react';
import styles from '../assets/Checkout.module.css';

const ShippingMethods = ({ shippingMethod, setShippingMethod, totalAmount, isAMB, city }) => {
    return (
        <section className={styles.checkoutSection} style={{ marginTop: '40px' }}>
            <h3 className={styles.checkoutSectionTitle}>Métodos de envío</h3>
            <div className={styles.paymentMethodsBox}>
                <div className={`${styles.paymentOptionRow} ${shippingMethod === 'standard' ? styles.active : ''}`} onClick={() => setShippingMethod('standard')}>
                    <div className={styles.paymentInfoLeft}>
                        <input type="radio" checked={shippingMethod === 'standard'} readOnly />
                        <span>Envío Normal</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                        {totalAmount >= 200000 ? 'GRATIS' : '$ 15.000'}
                    </span>
                </div>

                {isAMB && (
                    <div className={`${styles.paymentOptionRow} ${shippingMethod === 'cod' ? styles.active : ''}`} onClick={() => setShippingMethod('cod')}>
                        <div className={styles.paymentInfoLeft}>
                            <input type="radio" checked={shippingMethod === 'cod'} readOnly />
                            <span>Envío Contraentrega (Local)</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                            {totalAmount >= 200000 ? 'GRATIS' : '$ 5.000'}
                        </span>
                    </div>
                )}
            </div>
            {!city && (
                <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '10px' }}>
                    Ingresa tu dirección de envío para ver los métodos disponibles.
                </p>
            )}
        </section>
    );
};

export default ShippingMethods;
