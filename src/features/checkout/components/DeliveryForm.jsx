import React from 'react';
import styles from '../assets/Checkout.module.css';

const COLOMBIAN_CITIES = [
    "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta",
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
    "Cúcuta", "Ibagué", "Pereira", "Santa Marta", "Villavicencio"
].sort();

const DeliveryForm = ({ formData, handleChange }) => {
    return (
        <section className={styles.checkoutSection} style={{ marginTop: '40px' }}>
            <h3 className={styles.checkoutSectionTitle}>Entrega</h3>
            <div className={styles.checkoutInputGroup}>
                <select className={styles.checkoutField} defaultValue="CO">
                    <option value="CO">Colombia</option>
                </select>

                <div className={styles.checkoutInputRow}>
                    <input type="text" name="firstName" placeholder="Nombre" className={styles.checkoutField} value={formData.firstName} onChange={handleChange} required />
                    <input type="text" name="lastName" placeholder="Apellidos" className={styles.checkoutField} value={formData.lastName} onChange={handleChange} required />
                </div>

                <input type="text" name="cedula" placeholder="Cédula" className={styles.checkoutField} value={formData.cedula} onChange={handleChange} required />

                <input type="text" name="address" placeholder="Dirección" className={styles.checkoutField} value={formData.address} onChange={handleChange} required />

                <input type="text" name="details" placeholder="Casa, apartamento, etc. (opcional)" className={styles.checkoutField} value={formData.details} onChange={handleChange} />

                <div className={styles.checkoutInputRow}>
                    <select name="city" className={styles.checkoutField} value={formData.city} onChange={handleChange} required>
                        <option value="" disabled>Seleccionar Ciudad</option>
                        {COLOMBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" name="postalCode" placeholder="Código postal (opcional)" className={styles.checkoutField} value={formData.postalCode} onChange={handleChange} />
                </div>

                <input type="text" name="phone" placeholder="Teléfono" className={styles.checkoutField} value={formData.phone} onChange={handleChange} required />
            </div>
        </section>
    );
};

export default DeliveryForm;
