import React, { useRef, useEffect, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { formatCOP } from '../../utils/formatters';

const NewArrivals = () => {
    const { allProducts } = useProducts();
    const navigate = useNavigate();

    // Sort by newest and take top 8
    const latestProducts = [...allProducts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

    const scrollContainer = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-scroll logic: 3 seconds interval
    useEffect(() => {
        if (isPaused || latestProducts.length === 0) return;

        const interval = setInterval(() => {
            if (scrollContainer.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;

                // Card width + gap (approx 280 + 20)
                const scrollAmount = 300;

                // Check if we are near the end
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    // Reset to start smoothly
                    scrollContainer.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Slide one card width
                    scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [latestProducts, isPaused]);

    const scroll = (direction) => {
        if (scrollContainer.current) {
            const scrollAmount = 300;
            scrollContainer.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (latestProducts.length === 0) return null;

    return (
        <section
            className="new-arrivals"
            style={{ padding: '80px 0', background: '#f9f9f9', overflow: 'hidden' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 5%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0, color: '#000' }}>New Arrivals</h2>
                        <p style={{ color: '#888', letterSpacing: '2px', fontSize: '0.9rem', marginTop: '10px' }}>FRESH FROM THE LAB</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => scroll('left')} className="carousel-btn">
                            <i className='bx bx-chevron-left' style={{ fontSize: '1.5rem' }}></i>
                        </button>
                        <button onClick={() => scroll('right')} className="carousel-btn">
                            <i className='bx bx-chevron-right' style={{ fontSize: '1.5rem' }}></i>
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollContainer}
                    className="products-scroll"
                    style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto',
                        paddingBottom: '20px',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE
                        scrollBehavior: 'smooth' // Enforce smooth scroll via CSS as well
                    }}
                >
                    <style>{`.products-scroll::-webkit-scrollbar { display: none; }`}</style>

                    {latestProducts.map(product => (
                        <div
                            key={product.id}
                            className="product-card-minimal"
                            onClick={() => navigate(`/product/${product.id}`)}
                            style={{
                                minWidth: '280px',
                                maxWidth: '280px', /* Fixed width */
                                cursor: 'pointer',
                                background: '#fff',
                                padding: '15px',
                                transition: 'transform 0.3s',
                                flexShrink: 0
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '100%',
                                aspectRatio: '3/4',
                                background: '#f0f0f0',
                                marginBottom: '15px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {product.stock === 0 && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: '#000', color: '#fff',
                                        fontSize: '0.6rem', padding: '5px 8px', fontWeight: '900'
                                    }}>SOLD OUT</div>
                                )}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 5px 0', textTransform: 'uppercase' }}>{product.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{formatCOP(product.price)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
