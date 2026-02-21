import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCollections } from '@products/hooks/useCollections';
import { gsap } from 'gsap';

const Navbar = ({ user, onLoginClick, onLogout, onAdminClick, cartCount, onCartClick }) => {
    const { collections: activeCollections } = useCollections();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hoveredGender, setHoveredGender] = useState(null);
    const [closeTimeout, setCloseTimeout] = useState(null);
    const [activeMobileGender, setActiveMobileGender] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef(null);
    const logoRef = useRef(null);
    const linksRef = useRef([]);

    const isHomePage = location.pathname === '/';
    const isCollectionsPage = location.pathname === '/collections';
    const knownRoutes = ['/', '/shop', '/collections', '/admin', '/login', '/reset-password', '/checkout', '/profile', '/order-success', '/payment-success'];
    const isProductPage = location.pathname.startsWith('/product/');
    const isNotFoundPage = !knownRoutes.includes(location.pathname) && !isProductPage;
    const isImmersive = isHomePage || isCollectionsPage || isNotFoundPage;

    const toggleMobileGender = (gender) => {
        setActiveMobileGender(activeMobileGender === gender ? null : gender);
    };

    useEffect(() => {
        // Initial entrance animation - using 'from' so it defaults to visible if animation fails or finishes
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.from(logoRef.current, { opacity: 0, x: -20, duration: 0.8, clearProps: 'all' })
            .from(linksRef.current.filter(Boolean), {
                opacity: 0,
                y: -10,
                duration: 0.5,
                stagger: 0.1,
                clearProps: 'all'
            }, '-=0.4');
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            const threshold = window.innerHeight * 0.7;
            if (offset > threshold) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveMobileGender(null);
    }, [location]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            gsap.fromTo('.mobile-nav-links li',
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
            );
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const handleMouseEnter = (gender) => {
        if (closeTimeout) clearTimeout(closeTimeout);
        setHoveredGender(gender);
    };

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setHoveredGender(null);
        }, 150);
        setCloseTimeout(timeout);
    };

    const isMenuOpen = hoveredGender !== null || mobileMenuOpen;
    const navbarClass = `navbar ${scrolled ? 'scrolled' : ''} ${isHomePage ? 'at-home' : ''} ${isCollectionsPage ? 'at-collections' : ''} ${isImmersive ? 'at-immersive' : 'not-at-home'} ${isMenuOpen ? 'menu-open' : ''}`;

    const renderMegaMenu = (gender) => {
        return (
            <div className={`mega-menu ${hoveredGender === gender ? 'active' : ''}`}>
                <div className="mega-menu-content">
                    <div className="mega-column">
                        <span className="mega-column-title">Explorar {gender}</span>
                        <div className="mega-links-stack">
                            <Link to={`/shop?category=Camisetas&gender=${gender}`} className="mega-link-premium">
                                <span className="link-text">Camisetas</span>
                                <span className="link-hover-line"></span>
                            </Link>
                            <Link to={`/shop?category=Hoodies/Chaquetas&gender=${gender}`} className="mega-link-premium">
                                <span className="link-text">Hoodies & Chaquetas</span>
                                <span className="link-hover-line"></span>
                            </Link>
                            <Link to={`/shop?category=Pantalones&gender=${gender}`} className="mega-link-premium">
                                <span className="link-text">Pantalones</span>
                                <span className="link-hover-line"></span>
                            </Link>
                            <Link to={`/shop?category=Sneakers&gender=${gender}`} className="mega-link-premium">
                                <span className="link-text">Sneakers</span>
                                <span className="link-hover-line"></span>
                            </Link>
                            <Link to={`/shop?category=Accesorios&gender=${gender}`} className="mega-link-premium">
                                <span className="link-text">Accesorios</span>
                                <span className="link-hover-line"></span>
                            </Link>
                        </div>
                    </div>

                    <div className="mega-column featured-col">
                        <span className="mega-column-title">Destacados</span>
                        <div className="mega-links-stack">
                            <Link to={`/shop?gender=${gender}&collection=latest`} className="mega-link-premium">
                                <span className="link-text">Nueva Colección</span>
                                <span className="link-hover-line"></span>
                            </Link>
                            <Link to={`/shop?gender=${gender}&status=sale`} className="mega-link-premium">
                                <span className="link-text">Sale</span>
                                <span className="link-hover-line"></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <nav ref={navRef} className={navbarClass}>
                <div className="navbar-container">
                    <div ref={logoRef} className="nav-logo">
                        <Link to="/">UZISHOP</Link>
                    </div>

                    <ul className="nav-links desktop-only">
                        <li
                            ref={el => linksRef.current[0] = el}
                            style={{ height: '70px', display: 'flex', alignItems: 'center' }}
                        >
                            <Link to="/shop" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>ALL</Link>
                        </li>
                        <li
                            ref={el => linksRef.current[1] = el}
                            style={{ height: '70px', display: 'flex', alignItems: 'center' }}
                        >
                            <Link to="/collections" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>COLECCIONES</Link>
                        </li>
                        <li
                            ref={el => linksRef.current[2] = el}
                            onMouseEnter={() => handleMouseEnter('hombre')}
                            onMouseLeave={handleMouseLeave}
                            style={{ height: '70px', display: 'flex', alignItems: 'center' }}
                        >
                            <Link to="/shop?gender=hombre" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>HOMBRE</Link>
                            {renderMegaMenu('hombre')}
                        </li>
                        <li
                            ref={el => linksRef.current[3] = el}
                            onMouseEnter={() => handleMouseEnter('mujer')}
                            onMouseLeave={handleMouseLeave}
                            style={{ height: '70px', display: 'flex', alignItems: 'center' }}
                        >
                            <Link to="/shop?gender=mujer" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>MUJER</Link>
                            {renderMegaMenu('mujer')}
                        </li>
                    </ul>

                    <div className="nav-actions">
                        {user?.isAdmin() && (
                            <button className="nav-btn admin-btn desktop-only" onClick={onAdminClick}>
                                ADMIN
                            </button>
                        )}

                        <button className="nav-icon-btn nav-cart-btn" onClick={onCartClick}>
                            <i className='bx bx-shopping-bag'></i>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>

                        {user ? (
                            <>
                                <button className="nav-icon-btn desktop-only" onClick={() => navigate('/profile')}>
                                    <i className='bx bx-user'></i>
                                </button>
                                <button className="nav-icon-btn logout-btn desktop-only" onClick={onLogout} title="Cerrar Sesión">
                                    <i className='bx bx-log-out'></i>
                                </button>
                            </>
                        ) : (
                            <button className="nav-icon-btn desktop-only" onClick={onLoginClick}>
                                <i className='bx bx-user'></i>
                            </button>
                        )}

                        <button className="nav-btn hamburger-btn mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-content">
                    <ul className="mobile-nav-links">
                        <li><Link to="/shop" className="mobile-menu-link">TODOS LOS PRODUCTOS</Link></li>
                        <li><Link to="/collections" className="mobile-menu-link">COLECCIONES</Link></li>

                        <li className="mobile-expandable">
                            <button className="mobile-menu-link" onClick={() => toggleMobileGender('hombre')}>
                                HOMBRE <i className={`bx bx-chevron-${activeMobileGender === 'hombre' ? 'up' : 'down'}`}></i>
                            </button>
                            <ul className={`mobile-submenu ${activeMobileGender === 'hombre' ? 'active' : ''}`}>
                                <li><Link to="/shop?category=Camisetas&gender=hombre">Camisetas</Link></li>
                                <li><Link to="/shop?category=Hoodies/Chaquetas&gender=hombre">Hoodies/Chaquetas</Link></li>
                                <li><Link to="/shop?category=Pantalones&gender=hombre">Pantalones</Link></li>
                                <li><Link to="/shop?category=Sneakers&gender=hombre">Sneakers</Link></li>
                                <li><Link to="/shop?category=Accesorios&gender=hombre">Accesorios</Link></li>
                            </ul>
                        </li>

                        <li className="mobile-expandable">
                            <button className="mobile-menu-link" onClick={() => toggleMobileGender('mujer')}>
                                MUJER <i className={`bx bx-chevron-${activeMobileGender === 'mujer' ? 'up' : 'down'}`}></i>
                            </button>
                            <ul className={`mobile-submenu ${activeMobileGender === 'mujer' ? 'active' : ''}`}>
                                <li><Link to="/shop?category=Camisetas&gender=mujer">Camisetas</Link></li>
                                <li><Link to="/shop?category=Hoodies/Chaquetas&gender=mujer">Hoodies/Chaquetas</Link></li>
                                <li><Link to="/shop?category=Pantalones&gender=mujer">Pantalones</Link></li>
                                <li><Link to="/shop?category=Sneakers&gender=mujer">Sneakers</Link></li>
                                <li><Link to="/shop?category=Accesorios&gender=mujer">Accesorios</Link></li>
                            </ul>
                        </li>


                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

                        {user ? (
                            <>
                                <li><Link to="/profile" className="mobile-menu-link">MI PERFIL</Link></li>
                                {user.isAdmin() && <li><Link to="/admin" className="mobile-menu-link">ADMIN PANEL</Link></li>}
                                <li><button onClick={onLogout} className="mobile-menu-link logout">CERRAR SESIÓN</button></li>
                            </>
                        ) : (
                            <li><Link to="/login" className="mobile-menu-link">INICIAR SESIÓN</Link></li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Navbar;
