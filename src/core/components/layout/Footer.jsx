import React from 'react';
import { Link } from 'react-router-dom';
import '@core/assets/css/footer.css';

const Footer = () => {
    return (
        <footer className="footer-abstract">
            {/* Infinite Marquee Top */}
            <div className="footer-marquee-top">
                <div className="track">
                    <span>LA NUEVA OLA DEL STREETWEAR • ENVÍOS A TODA COLOMBIA • PAGOS SEGUROS • </span>
                    <span>LA NUEVA OLA DEL STREETWEAR • ENVÍOS A TODA COLOMBIA • PAGOS SEGUROS • </span>
                    <span>LA NUEVA OLA DEL STREETWEAR • ENVÍOS A TODA COLOMBIA • PAGOS SEGUROS • </span>
                    <span>LA NUEVA OLA DEL STREETWEAR • ENVÍOS A TODA COLOMBIA • PAGOS SEGUROS • </span>
                </div>
            </div>

            <div className="footer-main">
                {/* Huge Typography Section */}
                <div className="footer-visual">
                    <h1 className="giant-text">UZI<br />SHOP</h1>
                </div>

                {/* Vertical Links + Socials */}
                <div className="footer-interactive">

                    <div className="nav-group">
                        <span className="group-label">01 // EXPLORAR</span>
                        <nav className="abstract-nav">
                            <Link to="/shop">TIENDA</Link>
                            <Link to="/collections">COLECCIONES</Link>
                            <Link to="/shop">NUEVOS DROPS</Link>
                        </nav>
                    </div>

                    <div className="social-abstract-container">
                        <span className="group-label" style={{ alignSelf: 'flex-start', marginLeft: '30px', marginBottom: '0' }}>02 // REDES</span>
                        <div className="social-abstract">
                            <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer">WP</a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">IG</a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FB</a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TK</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tech Bar */}
            <div className="footer-tech-bar">
                <span>© {new Date().getFullYear()} UZI CORP. COLOMBIA</span>
                <span className="scroll-msg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                    SUBIR ↑
                </span>
                <div className="legal-bits">
                </div>
            </div>
        </footer>
    );
};

export default Footer;
