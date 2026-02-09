import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCOP } from '../utils/formatters';
import { productService } from '../services/productService';

const FREE_SHIPPING_THRESHOLD = 200000;

const Cart = ({ isVisible, toggleVisible, onCheckout, currentUser }) => {
    const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
    const [upsellProducts, setUpsellProducts] = useState([]);

    const progress = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFree = FREE_SHIPPING_THRESHOLD - totalAmount;
    const navigate = useNavigate();

    useEffect(() => {
        if (isVisible) {
            const unsubscribe = productService.subscribeToProducts((data) => {
                // Get 3 random products for upsell that are not in cart
                const cartIds = new Set(cart.map(item => item.id));
                const filtered = data.filter(p => !cartIds.has(p.id))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                setUpsellProducts(filtered);
            });
            return () => unsubscribe();
        }
    }, [isVisible, cart]);

    const handleUpsellClick = (product) => {
        toggleVisible();
        navigate(`/product/${product.id}`);
    };

    return (
        <div className={`cart-sidebar-container ${isVisible ? 'visible' : ''}`}>
            {/* Backdrop */}
            <div
                className={`cart-backdrop ${isVisible ? 'active' : ''}`}
                onClick={toggleVisible}
            />

            {/* Sidebar */}
            <div className={`cart-premium-sidebar ${isVisible ? 'open' : ''}`}>
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
                                <div key={`${item.id}-${item.selectedSize}`} className="cart-premium-item">
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
                                {upsellProducts.map(product => (
                                    <div key={product.id} className="upsell-item" onClick={() => handleUpsellClick(product)}>
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
