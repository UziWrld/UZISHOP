import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem } from '@cart/models/CartItem.js';
import { createLogger } from '@core/utils/Logger';

const logger = createLogger('CartContext');
const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    // Carga lazy desde localStorage al iniciar
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('uzishop_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            logger.warn('Error al leer carrito desde localStorage', e);
            return [];
        }
    });

    // Persistir carrito en localStorage al cambiar
    useEffect(() => {
        localStorage.setItem('uzishop_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (productData) => {
        const product = CartItem.fromRaw(productData);
        setCart(prevCart => {
            const currentCart = Array.isArray(prevCart) ? prevCart : [];
            const existingIndex = currentCart.findIndex(
                item => item.id === product.id && item.selectedSize === product.selectedSize
            );

            if (existingIndex !== -1) {
                return currentCart.map((item, idx) =>
                    idx === existingIndex
                        ? { ...item, quantity: (item.quantity || 1) + product.quantity }
                        : item
                );
            }
            return [...currentCart, product];
        });
    };

    const removeFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, idx) => idx !== index));
    };

    /**
     * CORREGIDO: Eliminada la mutación directa `item.quantity = newQty`.
     * Ahora se usa map() para producir un nuevo array inmutable.
     */
    const updateQuantity = (index, delta) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, item, idx) => {
                if (idx !== index) return [...acc, item];
                const newQty = (item.quantity || 1) + delta;
                if (newQty > 0) return [...acc, { ...item, quantity: newQty }];
                return acc; // Si qty <= 0, el item se elimina
            }, []);
        });
    };

    const clearCart = () => setCart([]);

    /**
     * CORREGIDO: useMemo para evitar recálculos en cada render.
     * Antes se calculaban en cada renderizado del Provider.
     */
    const totalAmount = useMemo(
        () => cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0),
        [cart]
    );

    const cartCount = useMemo(
        () => cart.reduce((acc, item) => acc + (item.quantity || 1), 0),
        [cart]
    );

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        cartCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
