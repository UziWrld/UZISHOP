import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';

const CollectionCard = ({ collection, index }) => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                marginBottom: '4px',
                background: '#111'
            }}
            className="collection-card"
        >
            {/* Background Image with Hover Zoom */}
            <div
                className="card-bg"
                style={{
                    position: 'absolute',
                    inset: 0,
                    transition: 'transform 1.2s cubic-bezier(0.19, 1, 0.22, 1)',
                    transform: 'scale(1.05)'
                }}
            >
                <img
                    src={collection.image}
                    alt={collection.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.7) contrast(1.1)'
                    }}
                />
            </div>

            {/* Content Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
                padding: '40px'
            }}>
                <span style={{
                    color: '#fff',
                    fontSize: '0.75rem',
                    letterSpacing: '8px',
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                    opacity: 0.8
                }}>
                    Collection {String(index + 1).padStart(2, '0')}
                </span>

                <h2 style={{
                    color: '#fff',
                    fontSize: 'clamp(3rem, 10vw, 8rem)',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    margin: 0,
                    letterSpacing: '-2px',
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    textAlign: 'center'
                }}>
                    {collection.name}
                </h2>

                <div
                    className="view-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ shop ? collection = ${collection.id} `);
                    }}
                    style={{
                        marginTop: '40px',
                        padding: '15px 40px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        transition: 'all 0.4s ease',
                        backdropFilter: 'blur(5px)',
                        cursor: 'pointer'
                    }}
                >
                    Ver Colección
                </div>
            </div>
        </div>
    );
};

const CollectionsPage = () => {
    const { collections, loading } = useCollections();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '40px', height: '40px', border: '2px solid rgba(255,255,255,0.05)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className="collections-immersive-container" style={{ background: '#000', color: '#fff' }}>
            {/* List of Collections */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {collections.map((col, index) => (
                    <CollectionCard key={col.id} collection={col} index={index} />
                ))}
            </div>

            {/* Explore All Hero Section */}
            <div
                onClick={() => navigate('/shop')}
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: '#000',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}
                className="explore-all-hero"
            >
                <span style={{ fontSize: '0.8rem', letterSpacing: '12px', textTransform: 'uppercase', marginBottom: '30px', fontWeight: '400', opacity: 0.6 }}>
                    The Full Experience
                </span>
                <h2 style={{
                    fontSize: 'clamp(4rem, 15vw, 12rem)',
                    fontWeight: '900',
                    margin: 0,
                    lineHeight: 0.85,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: '-8px'
                }}>
                    SHOP<br />ALL
                </h2>
                <div style={{
                    marginTop: '60px',
                    padding: '22px 80px',
                    background: '#fff',
                    color: '#000',
                    fontSize: '0.8rem',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    fontWeight: '900',
                    transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                }} className="explore-btn">
                    GO SHOP
                </div>
            </div>

            <style>{`
    .collection - card: hover.card - bg {
    transform: scale(1)!important;
}
                .collection - card: hover.view - btn {
    background: #fff!important;
    color: #000!important;
    letter - spacing: 8px;
    border - color: #fff!important;
}
                .explore - all - hero: hover.explore - btn {
    letter - spacing: 12px;
    transform: scale(1.1);
}
@keyframes spin { to { transform: rotate(360deg); } }
                body { background: #000; margin: 0; }
`}</style>
        </div>
    );
};

export default CollectionsPage;
