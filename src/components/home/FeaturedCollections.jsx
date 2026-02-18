import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { scrollReveal, staggerReveal } from '../../utils/gsap-animations';

const FeaturedCollections = () => {
    const navigate = useNavigate();
    const { collections, loading } = useCollections();
    const sectionRef = useRef(null);
    const titleRef = useRef(null);

    // Take top 3 collections for the grid - Memoize to prevent loops
    const displayedCollections = React.useMemo(() => {
        return collections.slice(0, 3).map((col, index) => ({
            ...col,
            subtitle: 'COLLECTION ' + String(index + 1).padStart(2, '0')
        }));
    }, [collections]);

    useEffect(() => {
        if (!loading && sectionRef.current && displayedCollections.length > 0) {
            scrollReveal(titleRef.current);
            const cards = sectionRef.current.querySelectorAll('.collection-card');
            staggerReveal(cards, 0.4);
        }
    }, [loading, displayedCollections.length]);

    if (loading) return null;

    if (displayedCollections.length === 0) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>No collections found.</div>;
    }

    return (
        <section
            ref={sectionRef}
            className="featured-collections"
            style={{ padding: '80px 5%', background: '#fff' }}
        >
            <div ref={titleRef} className="section-header" style={{ marginBottom: '60px', textAlign: 'center', opacity: 0 }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>Collections</h2>
                <p style={{ color: '#888', letterSpacing: '2px', fontSize: '0.9rem', marginTop: '10px' }}>CURATED FOR THE STREETS</p>
            </div>

            <div className="featured-grid">
                {displayedCollections.map((cat, index) => (
                    <div
                        key={cat.id}
                        className={`collection-card item-${index}`}
                        onClick={(e) => {
                            navigate(`/shop?collection=${cat.id}`);
                        }}
                        style={{ opacity: 0 }} // Initialize for GSAP
                    >
                        {/* Placeholder Background */}
                        <div className="card-bg"></div>

                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="collection-img"
                        />

                        {/* Overlay */}
                        <div className="collection-overlay"></div>

                        {/* Text Content */}
                        <div className="card-content">
                            <span className="subtitle">{cat.subtitle}</span>
                            <h3>{cat.name}</h3>
                            <div className="separator"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <button
                    onClick={() => navigate('/collections')}
                    className="view-all-btn"
                >
                    View All Collections
                </button>
            </div>
        </section>
    );
};

export default FeaturedCollections;
