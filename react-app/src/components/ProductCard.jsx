import React, { useState } from 'react';
import { formatCOP } from '../utils/formatters';

const ProductCard = ({ product, onAddToCart, onCardClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Fallback logic for images
    const hasMultipleImages = product.images && product.images.length > 1;
    const firstImage = (product.images && product.images.length > 0) ? product.images[0] : product.image;
    const secondImage = hasMultipleImages ? product.images[1] : firstImage;

    // Current image to display based on hover state
    const displayImage = (isHovered && hasMultipleImages) ? secondImage : firstImage;

    const isSoldOut = product.stock === 0;

    return (
        <div
            className="product-card"
            style={{ position: 'relative', opacity: isSoldOut ? 0.7 : 1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    background: '#f4f4f4',
                    overflow: 'hidden'
                }}>
                    <img
                        src={displayImage.startsWith('img/') ? `/${displayImage}` : displayImage}
                        alt={product.name}
                        onClick={() => onCardClick(product)}
                        style={{
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            filter: isSoldOut ? 'grayscale(50%) opacity(0.6)' : 'none',
                            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                        }}
                    />
                </div>


                {!isSoldOut && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            fontSize: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        +
                    </button>
                )}
            </div>
            <h3 style={{ marginTop: '15px', fontSize: '0.9rem', fontWeight: '800' }}>{product.name}</h3>
            {isSoldOut ? (
                <p style={{
                    color: '#ff4444',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    letterSpacing: '1px',
                    marginTop: '5px'
                }}>SOLD OUT</p>
            ) : (
                <p className="price" style={{ marginTop: '5px' }}>{formatCOP(product.price)}</p>
            )}
        </div>
    );
};

export default ProductCard;
