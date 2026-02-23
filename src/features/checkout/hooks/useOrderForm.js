import { useState } from 'react';

/**
 * useOrderForm
 * Maneja el estado del formulario del checkout y sincroniza los datos
 * iniciales desde el perfil del usuario si está autenticado.
 */
export const useOrderForm = (user) => {
    const [formData, setFormData] = useState({
        email: user?.email || '',
        newsletter: true,
        firstName: user?.nombre || '',
        lastName: user?.apellidos || '',
        cedula: user?.cedula || '',
        address: user?.address || '',
        details: user?.details || '',
        city: user?.city || '',
        postalCode: user?.postalCode || '',
        phone: user?.phone || '',
        billingSame: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return { formData, handleChange };
};
