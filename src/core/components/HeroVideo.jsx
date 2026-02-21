import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const HeroVideo = () => {
    const navigate = useNavigate();
    const heroTitleRef = useRef(null);
    const heroSubtitleRef = useRef(null);
    const heroBtnRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(heroSubtitleRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, delay: 0.5 }
        )
            .fromTo(heroTitleRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1 },
                '-=0.7'
            )
            .fromTo(heroBtnRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.8 },
                '-=0.5'
            );
    }, []);

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
                    opacity: '1',
                    filter: 'saturate(1.2) contrast(1.1)',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <source src="/video/hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Gradient */}
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
                <h2
                    ref={heroSubtitleRef}
                    className="hero-subtitle"
                    style={{
                        fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                        letterSpacing: '5px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        fontWeight: '600',
                        opacity: 0 // Initialize for GSAP
                    }}
                >
                    New Collection
                </h2>

                <h1
                    ref={heroTitleRef}
                    className="hero-title"
                    style={{
                        fontSize: 'clamp(3rem, 10vw, 6rem)',
                        fontWeight: '800',
                        letterSpacing: '-2px',
                        margin: '0 0 2rem 0',
                        lineHeight: '0.9',
                        fontFamily: 'Inter, sans-serif',
                        opacity: 0 // Initialize for GSAP
                    }}
                >
                    EDGE CULTURE
                </h1>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        ref={heroBtnRef}
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
                            transition: 'all 0.3s ease',
                            opacity: 0 // Initialize for GSAP
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
