import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroVideo = () => {
    const navigate = useNavigate();

    const scrollToCollection = () => {
        const element = document.getElementById('Camisetas'); // Or the first section
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="hero-video-container" style={{
            position: 'relative',
            height: '100vh',
            minHeight: '600px',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: '1', // Changed from 0.6 to 1 to remove darkening
                    filter: 'saturate(1.2) contrast(1.1)', // Added to boost colors
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <source src="/video/hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Gradient - Made lighter for better visibility while keeping text readable */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
                zIndex: 1
            }}></div>

            {/* Content */}
            <div className="hero-content" style={{
                position: 'relative',
                zIndex: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                <h2 className="hero-subtitle" style={{
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    fontWeight: '600'
                }}>New Collection</h2>

                <h1 className="hero-title" style={{
                    fontSize: 'clamp(3rem, 10vw, 6rem)',
                    fontWeight: '800',
                    letterSpacing: '-2px',
                    margin: '0 0 2rem 0',
                    lineHeight: '0.9',
                    fontFamily: 'Inter, sans-serif'
                }}>EDGE CULTURE</h1>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        className="hero-btn"
                        onClick={scrollToCollection}
                        style={{
                            padding: 'clamp(10px, 2vw, 15px) clamp(20px, 5vw, 40px)',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroVideo;
