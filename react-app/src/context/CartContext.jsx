import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../models/CartItem';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    // Cargar carrito desde localStorage al iniciar (Lazy Initialization)
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('uzishop_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error("Error parsing cart from localStorage", e);
            return [];
        }
    });

    // Guardar carrito en localStorage cuando cambie
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
                const newCart = [...currentCart];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: (newCart[existingIndex].quantity || 1) + product.quantity
                };
                return newCart;
            } else {
                return [...currentCart, product];
            }
        });
    };

    const removeFromCart = (index) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart.splice(index, 1);
            return newCart;
        });
    };

    const updateQuantity = (index, delta) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            const item = newCart[index];
            const newQty = (item.quantity || 1) + delta;

            if (newQty > 0) {
                item.quantity = newQty;
            } else {
                newCart.splice(index, 1);
            }
            return newCart;
        });
    };

    const clearCart = () => setCart([]);

    const totalAmount = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

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
