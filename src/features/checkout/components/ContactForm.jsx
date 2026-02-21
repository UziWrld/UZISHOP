import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/Checkout.module.css';

const ContactForm = ({ formData, handleChange, isAuthenticated }) => {
    return (
        <section className={styles.checkoutSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className={styles.checkoutSectionTitle}>Contacto</h3>
                {!isAuthenticated && (
                    <span style={{ fontSize: '0.8rem' }}>
                        ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#000' }}>Inicia sesión</Link>
                    </span>
                )}
            </div>
            <div className={styles.checkoutInputGroup}>
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    className={styles.checkoutField}
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <label className={styles.newsletterCheck}>
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
    );
};

export default ContactForm;
