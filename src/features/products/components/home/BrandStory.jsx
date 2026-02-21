import React from 'react';

const BrandStory = () => {
    return (
        <section className="brand-story" style={{
            padding: '120px 5%',
            background: '#000',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background Text */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '20vw',
                fontWeight: '900',
                color: 'rgba(255,255,255,0.03)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 0
            }}>
                UZI SHOP
            </div>

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <span style={{
                    color: '#ff4444',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '20px'
                }}>The Movement</span>

                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    fontWeight: '900',
                    lineHeight: '1.1',
                    marginBottom: '40px',
                    textTransform: 'uppercase'
                }}>
                    Redefining Street Culture<br />One Drop At A Time.
                </h2>

                <p style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    color: '#ccc',
                    marginBottom: '50px'
                }}>
                    Born from the concrete jungle, UZI SHOP represents the raw energy of urban life.
                    We don't follow trends; we forge them. Our collections are limited, our quality is non-negotiable,
                    and our vision is global. Wear the future.
                </p>

                <button style={{
                    padding: '18px 45px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s'
                }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    Read Our Story
                </button>
            </div>
        </section>
    );
};

export default BrandStory;
