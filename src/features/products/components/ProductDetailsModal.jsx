import React, { useState, useEffect } from 'react';
import { formatCOP } from '@utils/formatters.js';

const ProductDetailsModal = ({ product, isOpen, onClose, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset selection when product changes
    useEffect(() => {
        if (isOpen) {
            setSelectedSize(null);
            setQuantity(1);
            setCurrentImageIndex(0);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const hasVariants = product.variants && product.variants.length > 0;
    const isAccessory = product.category === 'Accesorios' || product.category === 'Accessories';
    const imageList = product.images && product.images.length > 0 ? product.images : [product.image];

    // Helper: Handle Backdrop Click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleAddToCart = () => {
        if (!isAccessory && hasVariants && !selectedSize) {
            alert('Por favor selecciona una talla.');
            return;
        }

        const sizeToAdd = isAccessory ? 'Única' : selectedSize;

        // check stock limit
        const availableStock = getStockForSize(sizeToAdd);
        if (quantity > availableStock) {
            alert(`Solo hay ${availableStock} unidades disponibles.`);
            return;
        }

        onAddToCart({
            ...product,
            selectedSize: sizeToAdd,
            quantity: quantity,
            image: imageList[0]
        });
        onClose();
    };

    const getStockForSize = (size) => {
        if (!hasVariants) return product.stock || 0;
        const variant = product.variants.find(v => v.size === size);
        return variant ? variant.stock : 0;
    };

    const increaseQty = () => {
        const availableStock = selectedSize || isAccessory ? getStockForSize(selectedSize || 'Única') : 99;
        if (quantity < availableStock) setQuantity(q => q + 1);
    };

    const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));


    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(5px)', // Premium blur effect
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
                animation: 'fadeIn 0.3s ease'
            }}
        >
            <style>
                {`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `}
            </style>

            <div style={{
                background: 'white', padding: '40px', borderRadius: '0',
                maxWidth: '950px', width: '90%', maxHeight: '90vh', overflowY: 'auto',
                display: 'flex', flexDirection: 'row', gap: '40px', position: 'relative', flexWrap: 'wrap',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Close Button "X" */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: '#f0f0f0', border: 'none',
                        width: '40px', height: '40px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', cursor: 'pointer', zIndex: 10,
                        transition: 'all 0.2s ease', color: '#555'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e0e0e0'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                >
                    <i className='bx bx-x'></i>
                </button>

                {/* Left: Image Gallery */}
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ width: '100%', aspectRatio: '1/1', background: '#f9f9f9', borderRadius: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={imageList[currentImageIndex].startsWith('img/') ? `/${imageList[currentImageIndex]}` : imageList[currentImageIndex]}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                mixBlendMode: 'multiply',
                                filter: product.stock === 0 ? 'grayscale(80%) opacity(0.6)' : 'none',
                                transition: 'filter 0.4s ease'
                            }}
                        />
                    </div>

                    {imageList.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                            {imageList.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img.startsWith('img/') ? `/${img}` : img}
                                    alt={`Thumb ${idx}`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    style={{
                                        width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
                                        border: currentImageIndex === idx ? '2px solid #000' : '2px solid transparent',
                                        transition: 'border 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{product.category}</span>
                            {product.color && (
                                <>
                                    <span style={{ color: '#ddd' }}>|</span>
                                    <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{product.color}</span>
                                </>
                            )}
                        </div>
                        <h2 style={{ fontSize: '2.5rem', margin: '5px 0 10px 0', lineHeight: 1.1, fontFamily: 'Inter, sans-serif' }}>{product.name}</h2>
                        {product.stock === 0 ? (
                            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#ff4444', margin: 0, letterSpacing: '2px' }}>SOLD OUT</p>
                        ) : (
                            <p style={{ fontSize: '2rem', fontWeight: '500', color: '#000', margin: 0 }}>{formatCOP(product.price)}</p>
                        )}
                    </div>

                    {!isAccessory && hasVariants ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p style={{ fontWeight: '600', margin: 0, textTransform: 'uppercase', fontSize: '0.9rem' }}>Selecciona tu talla</p>
                                {selectedSize && (
                                    <span style={{ fontSize: '0.8rem', color: getStockForSize(selectedSize) < 5 ? '#e74c3c' : '#27ae60' }}>
                                        {getStockForSize(selectedSize)} disponibles
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {product.variants.map(variant => {
                                    const variantIsSoldOut = variant.stock <= 0;
                                    return (
                                        <div key={variant.size} style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setSelectedSize(variant.size)}
                                                disabled={variantIsSoldOut}
                                                style={{
                                                    padding: '12px 0',
                                                    width: '65px',
                                                    border: selectedSize === variant.size ? '2px solid #000' : '1px solid #e0e0e0',
                                                    background: selectedSize === variant.size ? '#000' : (variantIsSoldOut ? '#fafafa' : '#fff'),
                                                    color: selectedSize === variant.size ? '#fff' : (variantIsSoldOut ? '#bbb' : '#000'),
                                                    borderRadius: '8px',
                                                    cursor: variantIsSoldOut ? 'not-allowed' : 'pointer',
                                                    fontWeight: '700',
                                                    transition: 'all 0.2s ease',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {variant.size}
                                            </button>
                                            {variantIsSoldOut && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, width: '100%', height: '100%',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    pointerEvents: 'none', overflow: 'hidden', borderRadius: '8px'
                                                }}>
                                                    {/* Premium Diagonal Line */}
                                                    <div style={{
                                                        position: 'absolute', top: '50%', left: '-10%', width: '120%', height: '1px',
                                                        background: '#ff4444', transform: 'rotate(-45deg)', opacity: 0.8
                                                    }} />
                                                    <span style={{
                                                        color: '#ff4444', fontSize: '0.45rem', fontWeight: '950',
                                                        letterSpacing: '1px', textTransform: 'uppercase', marginTop: 'auto',
                                                        paddingBottom: '4px', background: 'white'
                                                    }}>SOLD OUT</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontWeight: '800', margin: 0, textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '10px' }}>Talla Única</p>
                            <span style={{
                                padding: '8px 15px',
                                border: product.stock > 0 ? '1px solid #000' : '1px solid #ff4444',
                                borderRadius: '4px',
                                background: product.stock > 0 ? '#f0f0f0' : '#fff',
                                fontWeight: '900',
                                color: product.stock > 0 ? '#000' : '#ff4444',
                                fontSize: '0.75rem',
                                letterSpacing: '1px'
                            }}>
                                {product.stock > 0 ? 'DISPONIBLE' : 'SOLD OUT'}
                            </span>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div style={{ opacity: (product.stock === 0 || (hasVariants && selectedSize && getStockForSize(selectedSize) === 0)) ? 0.5 : 1 }}>
                        <p style={{ fontWeight: '600', margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: '0.9rem' }}>Cantidad</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '5px' }}>
                            <button
                                onClick={decreaseQty}
                                disabled={product.stock === 0}
                                style={{ border: 'none', background: 'transparent', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', color: '#555' }}
                            >-</button>
                            <span style={{ padding: '0 15px', fontWeight: 'bold', fontSize: '1rem' }}>{quantity}</span>
                            <button
                                onClick={increaseQty}
                                disabled={product.stock === 0 || (selectedSize && quantity >= getStockForSize(selectedSize))}
                                style={{ border: 'none', background: 'transparent', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', color: '#555' }}
                            >+</button>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={(!isAccessory && !selectedSize) || product.stock === 0}
                            style={{
                                width: '100%', padding: '20px',
                                background: (product.stock === 0 || (!isAccessory && !selectedSize)) ? '#e0e0e0' : '#000',
                                color: (product.stock === 0 || (!isAccessory && !selectedSize)) ? '#999' : '#fff',
                                border: 'none', borderRadius: '12px',
                                fontSize: '1.1rem', cursor: (product.stock === 0 || (!isAccessory && !selectedSize)) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
                                transition: 'all 0.3s ease',
                                boxShadow: (product.stock === 0 || (!isAccessory && !selectedSize)) ? 'none' : '0 10px 20px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={e => { if (product.stock > 0 && (isAccessory || selectedSize)) e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { if (product.stock > 0 && (isAccessory || selectedSize)) e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            {product.stock === 0 ? 'SOLD OUT' :
                                (!selectedSize && !isAccessory) ? 'SELECCIONA UNA TALLA' :
                                    `AÑADIR AL CARRITO - ${formatCOP(product.price * quantity)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
