import React from 'react';
import styles from '../assets/Checkout.module.css';

const PaymentMethods = ({ paymentMethod, setPaymentMethod }) => {
    return (
        <section className={styles.checkoutSection} style={{ marginTop: '40px' }}>
            <h3 className={styles.checkoutSectionTitle}>Pago</h3>
            <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: '15px' }}>
                Todas las transacciones son seguras y encriptadas.
            </p>

            <div className={styles.paymentMethodsBox}>
                {/* Mercado Pago */}
                <div
                    className={`${styles.paymentOptionRow} ${paymentMethod === 'mercadopago' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('mercadopago')}
                >
                    <div className={styles.paymentInfoLeft}>
                        <input type="radio" checked={paymentMethod === 'mercadopago'} readOnly />
                        <span>Mercado Pago (Tarjetas, PSE, Efecty)</span>
                    </div>
                    <div className={styles.paymentLogos}>
                        <img src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9ad0-11ec-babc-115f11b2c86b.svg" alt="Visa" />
                        <img src="https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-9ad0-11ec-babc-115f11b2c86b.svg" alt="Mastercard" />
                        <img src="https://http2.mlstatic.com/storage/logos-api-admin/b2c93a40-9ad0-11ec-babc-115f11b2c86b.svg" alt="PSE" />
                    </div>
                </div>

                {/* Addi */}
                <div
                    className={`${styles.paymentOptionRow} ${paymentMethod === 'addi' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('addi')}
                >
                    <div className={styles.paymentInfoLeft}>
                        <input type="radio" checked={paymentMethod === 'addi'} readOnly />
                        <span>Addi: Compra ahora, paga después</span>
                    </div>
                    <div className={styles.paymentLogos}>
                        <img src="https://s3.amazonaws.com/cosmic-addi/addi-logo.png" alt="Addi" style={{ height: '15px' }} />
                    </div>
                </div>

                {/* Contraentrega */}
                <div
                    className={`${styles.paymentOptionRow} ${paymentMethod === 'cod' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                >
                    <div className={styles.paymentInfoLeft}>
                        <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                        <span>Pago Contraentrega</span>
                    </div>
                </div>
            </div>

            {/* Payment Method Details */}
            <div style={{
                marginTop: '1px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #d9d9d9',
                borderRadius: '0 0 5px 5px',
                fontSize: '0.85rem',
                color: '#555',
                lineHeight: '1.5'
            }}>
                {paymentMethod === 'mercadopago' && "Luego de hacer clic en \"Pagar ahora\", serás redirigido a Mercado Pago para completar tu compra de forma segura."}
                {paymentMethod === 'addi' && "Luego de hacer clic en \"Pagar ahora\", serás redirigido a Addi para completar tu solicitud de crédito."}
                {paymentMethod === 'cod' && "Paga en efectivo al recibir tu pedido en la puerta de tu casa."}
            </div>
        </section>
    );
};

export default PaymentMethods;
