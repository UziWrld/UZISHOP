import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@cart/context/CartContext';
import { formatCOP } from '@utils/formatters';
import { productService } from '@products/services/productService';
import { gsap } from 'gsap';

const FREE_SHIPPING_THRESHOLD = 200000;

const Cart = ({ isVisible, toggleVisible, onCheckout }) => {
    const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
    const [upsellProducts, setUpsellProducts] = useState([]);

    const sidebarRef = useRef(null);
    const backdropRef = useRef(null);
    const itemsRef = useRef([]); // Ref for cart items
    const upsellItemsRef = useRef([]); // Ref for upsell items

    const progress = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFree = FREE_SHIPPING_THRESHOLD - totalAmount;
    const navigate = useNavigate();

    useEffect(() => {
        if (isVisible) {
            const tl = gsap.timeline({ defaults: { duration: 0.3, ease: 'power2.out' } });

            // Initial state for GSAP
            gsap.set(backdropRef.current, { opacity: 0 });
            gsap.set(sidebarRef.current, { x: '100%' });

            // Animation
            tl.to(backdropRef.current, { opacity: 1, duration: 0.4 })
                .to(sidebarRef.current, { x: 0, duration: 0.6, ease: 'power3.out' }, '<0.1');

            if (cart.length > 0) {
                tl.fromTo(itemsRef.current.filter(Boolean),
                    { opacity: 0, x: 30 },
                    { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, clearProps: 'all' },
                    '-=0.3'
                );
            }

            const unsubscribe = productService.subscribeToProducts((data) => {
                const cartIds = new Set(cart.map(item => item.id));
                const filtered = data.filter(p => !cartIds.has(p.id))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                setUpsellProducts(filtered);
            });
            return () => {
                unsubscribe();
            };
        }
    }, [isVisible, cart.length]);

    // Handle exit animation with a more direct approach
    useEffect(() => {
        if (!isVisible && sidebarRef.current) {
            gsap.to(sidebarRef.current, { x: '100%', duration: 0.4, ease: 'power2.in' });
            gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
        }
    }, [isVisible]);

    // Effect for upsell products animation when they load
    useEffect(() => {
        if (isVisible && upsellProducts.length > 0) {
            gsap.fromTo(upsellItemsRef.current.filter(Boolean),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }, [isVisible, upsellProducts]);

    const handleUpsellClick = (product) => {
        toggleVisible();
        navigate(`/product/${product.id}`);
    };

    // Clean up refs
    useEffect(() => {
        itemsRef.current = itemsRef.current.slice(0, cart.length);
    }, [cart]);

    useEffect(() => {
        upsellItemsRef.current = upsellItemsRef.current.slice(0, upsellProducts.length);
    }, [upsellProducts]);

    return (
        <div className={`cart-sidebar-container ${isVisible ? 'visible' : ''}`}>
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className={`cart-backdrop ${isVisible ? 'active' : ''}`}
                onClick={toggleVisible}
            />

            {/* Sidebar */}
            <div ref={sidebarRef} className={`cart-premium-sidebar ${isVisible ? 'open' : ''}`} style={{ right: 0, transform: 'translateX(100%)' }}>
                <div className="cart-premium-header">
                    <div className="header-top">
                        <button className="close-cart-btn" onClick={toggleVisible}>
                            <i className='bx bx-x'></i>
                        </button>
                        <h2>TU CARRITO</h2>
                        <div style={{ width: '24px' }}></div> {/* Spacer */}
                    </div>

                    <div className="shipping-promo">
                        <p>
                            {remainingForFree > 0
                                ? `TE FALTAN ${formatCOP(remainingForFree)} PARA ENVÍO GRATIS`
                                : '¡TIENES ENVÍO GRATIS!'}
                        </p>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="cart-premium-body">
                    {cart.length === 0 ? (
                        <div className="empty-cart-view">
                            <p>Tu carrito está vacío</p>
                            <button onClick={toggleVisible} className="continue-shopping">VOLVER A LA TIENDA</button>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {cart.map((item, index) => (
                                <div
                                    key={`${item.id}-${item.selectedSize}`}
                                    className="cart-premium-item"
                                    ref={el => itemsRef.current[index] = el}
                                >
                                    <div className="item-img-box">
                                        <img
                                            src={item.image.startsWith('img/') ? `/${item.image}` : item.image}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="item-content">
                                        <div className="item-header-row">
                                            <span className="item-name-text">{item.name}</span>
                                            <span className="item-price-text">{formatCOP(item.price * (item.quantity || 1))}</span>
                                        </div>
                                        <span className="item-variant-text">Talla {item.selectedSize}</span>

                                        <div className="item-actions-row">
                                            <div className="qty-control">
                                                <button onClick={() => updateQuantity(index, -1)}>-</button>
                                                <span>{item.quantity || 1}</span>
                                                <button onClick={() => updateQuantity(index, 1)}>+</button>
                                            </div>
                                            <button className="quitar-link" onClick={() => removeFromCart(index)}>Quitar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upsell Section */}
                    {upsellProducts.length > 0 && (
                        <div className="upsell-section">
                            <h4>COMPLETA TU OUTFIT</h4>
                            <div className="upsell-grid">
                                {upsellProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="upsell-item"
                                        onClick={() => handleUpsellClick(product)}
                                        ref={el => upsellItemsRef.current[index] = el}
                                    >
                                        <img src={product.image.startsWith('img/') ? `/${product.image}` : product.image} alt={product.name} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="cart-premium-footer">
                    <div className="total-row">
                        <span>Subtotal:</span>
                        <span className="subtotal-val">{formatCOP(totalAmount)}</span>
                    </div>

                    <button className="finalizar-btn" onClick={onCheckout}>
                        COMPRAR AHORA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
