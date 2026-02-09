import React from 'react';

const Marquee = () => {
    return (
        <div className="marquee-container" style={{
            background: '#000',
            color: '#fff',
            overflow: 'hidden',
            padding: '15px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="marquee-content" style={{
                display: 'inline-block',
                animation: 'marquee 20s linear infinite',
                paddingLeft: '100%'
            }}>
                <span style={{
                    fontSize: '1rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    marginRight: '50px'
                }}>PREMIUM STREETWEAR • LIMITED DROPS • WORLDWIDE SHIPPING • EST. 2024 • UZI SHOP • THE NEW WAVE • </span>
                <span style={{
                    fontSize: '1rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    marginRight: '50px'
                }}>PREMIUM STREETWEAR • LIMITED DROPS • WORLDWIDE SHIPPING • EST. 2024 • UZI SHOP • THE NEW WAVE • </span>
            </div>
            <style>
                {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-100%); }
                    }
                `}
            </style>
        </div>
    );
};

export default Marquee;
