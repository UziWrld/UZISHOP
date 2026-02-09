import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';

const FeaturedCollections = () => {
    const navigate = useNavigate();
    const { collections, loading } = useCollections();

    // Take top 3 collections for the grid
    const displayedCollections = collections.slice(0, 3).map((col, index) => ({
        ...col,
        subtitle: 'COLLECTION ' + String(index + 1).padStart(2, '0')
    }));

    if (loading) return null;

    if (displayedCollections.length === 0) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>No collections found.</div>;
    }

    return (
        <section className="featured-collections" style={{ padding: '80px 5%', background: '#fff' }}>
            <div className="section-header" style={{ marginBottom: '60px', textAlign: 'center' }}>
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
