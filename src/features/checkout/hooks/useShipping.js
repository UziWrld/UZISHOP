import { useState, useEffect, useMemo } from 'react';

const AMB_CITIES = ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"];

const FREE_SHIPPING_THRESHOLD = 200000;
const COD_SHIPPING_COST = 5000;
const STANDARD_SHIPPING_COST = 15000;

/**
 * useShipping
 * Encapsula el método de envío, el cálculo de costo y la lógica de sincronización
 * entre ciudad, método de envío y método de pago.
 */
export const useShipping = (city, totalAmount) => {
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('mercadopago');

    const isAMB = useMemo(() => AMB_CITIES.includes(city), [city]);

    // Sincronizar método de pago en función de ciudad y envío
    useEffect(() => {
        if (!isAMB && shippingMethod === 'cod') {
            setShippingMethod('standard');
            setPaymentMethod('mercadopago');
        } else if (shippingMethod === 'cod') {
            setPaymentMethod('cod');
        } else if (shippingMethod === 'standard' && paymentMethod === 'cod') {
            setPaymentMethod('mercadopago');
        }
    }, [city, isAMB, shippingMethod]);

    const shippingCost = useMemo(() => {
        if (totalAmount >= FREE_SHIPPING_THRESHOLD) return 0;
        return shippingMethod === 'cod' ? COD_SHIPPING_COST : STANDARD_SHIPPING_COST;
    }, [shippingMethod, totalAmount]);

    return {
        shippingMethod,
        setShippingMethod,
        paymentMethod,
        setPaymentMethod,
        shippingCost,
        isAMB
    };
};
