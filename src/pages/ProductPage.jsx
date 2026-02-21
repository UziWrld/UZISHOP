import React, { useState, useEffect } from 'react';
import { formatCOP } from '@utils/formatters';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@core/config/firebase';
import { useCart } from '@cart/context/CartContext';
import '@assets/css/product-page.css';


const AccordionItem = ({ title, isOpen, onClick, children }) => {
    return (
        <div className="accordion-item">
            <div className="accordion-header" onClick={onClick}>
                <span>{title}</span>
                <i className={`bx ${isOpen ? 'bx-minus' : 'bx-plus'}`} style={{ fontSize: '1.2rem' }}></i>
            </div>
            <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

const ProductPage = () => {
    const { addToCart } = useCart();
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeAccordion, setActiveAccordion] = useState('details');

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Size Guide State
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
    const [activeGuide, setActiveGuide] = useState(null);

    // Quantity State
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            setLoading(true);
            try {
                // 1. Fetch Main Product
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setProduct(data);

                    // Fetch Size Guide for this product
                    const guideId = `${data.gender || 'unisex'}_${data.category || 'Camisetas'}`;
                    const guideRef = doc(db, "sizeGuides", guideId);
                    const guideSnap = await getDoc(guideRef);
                    if (guideSnap.exists()) {
                        setActiveGuide(guideSnap.data());
                    } else {
                        // Fallback to unisex if specific guide doesn't exist
                        const fallbackRef = doc(db, "sizeGuides", `unisex_Camisetas`);
                        const fallbackSnap = await getDoc(fallbackRef);
                        if (fallbackSnap.exists()) setActiveGuide(fallbackSnap.data());
                    }

                    // Reset selection on new product load
                    setSelectedSize(null);
                    setQuantity(1);

                    // 2. Fetch Diversified Recommendations (Same category + Others for variety)
                    const productsRef = collection(db, "products");

                    // Fetch same category
                    const qCategory = query(productsRef, where("category", "==", data.category), limit(6));
                    const catSnap = await getDocs(qCategory);
                    const sameCat = catSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(p => p.id !== data.id);

                    // Fetch some varied products (limit 10 and pick random to ensure variety)
                    const qOther = query(productsRef, limit(10));
                    const otherSnap = await getDocs(qOther);
                    const others = otherSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(p => p.id !== data.id && p.category !== data.category);

                    // Mix: 2 from same category, 2 from others
                    const mixed = [...sameCat.slice(0, 2), ...others.slice(0, 2)];

                    // If not enough mixed, fill with whatever we have
                    if (mixed.length < 4) {
                        const remaining = [...sameCat.slice(2), ...others.slice(2)];
                        mixed.push(...remaining.slice(0, 4 - mixed.length));
                    }

                    // Final Shuffle for a fresh feeling
                    setRelatedProducts(mixed.sort(() => 0.5 - Math.random()).slice(0, 4));

                } else {
                    alert("Producto no encontrado");
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
                window.scrollTo(0, 0);
            }
        };
        fetchProductAndRelated();
    }, [id, navigate]);

    useEffect(() => {
        const trackView = async () => {
            const viewedKey = `viewed_${id}`;
            if (!sessionStorage.getItem(viewedKey)) {
                try {
                    // Dynamic import to avoid breaking if not standard, or just assume I'll fix imports next.
                    // Actually, I will update imports in the next step.
                    const { updateDoc, increment } = await import('firebase/firestore');
                    const productRef = doc(db, "products", id);
                    await updateDoc(productRef, {
                        views: increment(1)
                    });
                    sessionStorage.setItem(viewedKey, 'true');
                } catch (e) {
                    console.error("Error tracking view", e);
                }
            }
        }
        if (id) trackView();
    }, [id]);

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>CARGANDO...</div>;
    if (!product) return null;

    const hasVariants = product.variants && product.variants.length > 0;
    const isAccessory = product.category === 'Accesorios' || product.category === 'Accessories';

    // Ensure at least one image
    const imageList = product.images && product.images.length > 0 ? product.images : [product.image];

    // Determine current stock
    let currentStock = 0;
    if (isAccessory) {
        currentStock = product.stock || 0;
    } else if (selectedSize) {
        const variant = product.variants.find(v => v.size === selectedSize);
        currentStock = variant ? variant.stock : 0;
    }

    // Lightbox Handlers
    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'unset';
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % imageList.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    };

    // Size Guide Handlers
    const openSizeGuide = () => {
        setSizeGuideOpen(true);
        document.body.style.overflow = 'hidden';
    }

    const closeSizeGuide = () => {
        setSizeGuideOpen(false);
        document.body.style.overflow = 'unset';
    }

    // Quantity Handlers
    const increaseQuantity = () => {
        if (selectedSize || isAccessory) {
            if (quantity < currentStock) {
                setQuantity(prev => prev + 1);
            }
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!isAccessory && hasVariants && !selectedSize) {
            // Should be handled by UI disabled state, but double check
            return;
        }
        const sizeToAdd = isAccessory ? 'Única' : selectedSize;
        addToCart({
            ...product,
            selectedSize: sizeToAdd,
            image: imageList[0],
            quantity: quantity
        });
        // Reset quantity after add
        setQuantity(1);
        // Optional: Open cart or show toast? For now just small alert or relied on CartContext to show something?
        // Let's assume the Navbar cart counter updates.
    };

    const toggleAccordion = (section) => {
        setActiveAccordion(activeAccordion === section ? null : section);
    };

    return (
        <div className="product-page-wrapper">
            {/* LIGHTBOX OVERLAY */}
            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="lightbox-close-btn" onClick={closeLightbox}>×</button>

                    {imageList.length > 1 && (
                        <button className="lightbox-nav-btn prev" onClick={prevImage}>&#10094;</button>
                    )}

                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={imageList[lightboxIndex].startsWith('img/') ? `/${imageList[lightboxIndex]}` : imageList[lightboxIndex]}
                            alt={`Zoom view ${lightboxIndex + 1}`}
                            className="lightbox-image"
                        />
                    </div>

                    {imageList.length > 1 && (
                        <button className="lightbox-nav-btn next" onClick={nextImage}>&#10095;</button>
                    )}
                </div>
            )}

            {/* SIZE GUIDE MODAL */}
            {sizeGuideOpen && activeGuide && (
                <div className="size-guide-overlay" onClick={closeSizeGuide}>
                    <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="size-guide-close-btn" onClick={closeSizeGuide}>×</button>
                        <h2>Guía de Tallas</h2>
                        <div className="size-guide-content">
                            <div className="size-guide-table-wrapper">
                                <div className="table-responsive">
                                    <table className="size-guide-table">
                                        <thead>
                                            <tr>
                                                {activeGuide.headers.map((h, i) => <th key={i}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeGuide.rows.map((row, idx) => (
                                                <tr key={idx}>
                                                    {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="size-guide-image-wrapper">
                                <img src={activeGuide.image} alt="Guía de Medidas" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="product-container">
                {/* LEFT: GALLERY GRID */}
                <div className="product-gallery-wrapper">
                    <div className="product-gallery-grid">
                        {imageList.map((img, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="gallery-item"
                                    onClick={() => openLightbox(idx)}
                                    style={{ filter: product.stock === 0 ? 'grayscale(80%) opacity(0.6)' : 'none' }}
                                >
                                    <img
                                        src={img.startsWith('img/') ? `/${img}` : img}
                                        alt={`${product.name} - View ${idx + 1}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: STICKY INFO */}
                <div className="product-info-wrapper">
                    <div className="product-info-sticky">
                        <div>
                            <h1 className="product-title">{product.name}</h1>
                            <div className="product-price">
                                {product.stock === 0 ? (
                                    <span style={{ color: '#ff4444', fontWeight: '900', fontSize: '1.8rem', letterSpacing: '1px' }}>SOLD OUT</span>
                                ) : (
                                    <span className="price-tag">{formatCOP(product.price)}</span>
                                )}
                            </div>
                        </div>

                        {/* Size Selection */}
                        {!isAccessory && hasVariants && (
                            <div className="size-selector-container">
                                <div className="size-selector-label">
                                    <span>Seleccionar Talla</span>
                                    <span className="size-guide-link" onClick={openSizeGuide}>Guía de Tallas</span>
                                </div>
                                <div className="size-grid">
                                    {product.variants.map(variant => (
                                        <button
                                            key={variant.size}
                                            className={`size-btn ${selectedSize === variant.size ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedSize(variant.size);
                                                setQuantity(1);
                                            }}
                                            disabled={variant.stock <= 0}
                                        >
                                            {variant.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Warning & Quantity Selector */}
                        <div className="actions-row">
                            {/* Quantity Selector */}
                            <div className="quantity-selector">
                                <button onClick={decreaseQuantity} disabled={(!selectedSize && !isAccessory) || quantity <= 1}>-</button>
                                <span>{quantity}</span>
                                <button onClick={increaseQuantity} disabled={(!selectedSize && !isAccessory) || quantity >= currentStock}>+</button>
                            </div>

                            {/* Stock Warning */}
                            {(selectedSize || isAccessory) && currentStock < 20 && currentStock > 0 && (
                                <div className="stock-warning">
                                    ¡Solo quedan {currentStock} unidades!
                                </div>
                            )}
                        </div>

                        <div className="product-actions">
                            <button
                                className="add-cart-btn"
                                onClick={handleAddToCart}
                                disabled={!isAccessory && !selectedSize}
                            >
                                {product.stock === 0 ? 'SOLD OUT' :
                                    (!isAccessory && !selectedSize) ? 'Selecciona una talla' : 'Añadir al Carrito'}
                            </button>
                        </div>

                        {/* Accordions */}
                        <div className="product-accordion">
                            <AccordionItem
                                title="Descripción y Detalles"
                                isOpen={activeAccordion === 'details'}
                                onClick={() => toggleAccordion('details')}
                            >
                                <p>{product.description || "Prenda exclusiva de UZI SHOP. Diseñada con los mejores materiales para garantizar durabilidad y estilo."}</p>
                            </AccordionItem>

                            <AccordionItem
                                title="Envíos y Entregas"
                                isOpen={activeAccordion === 'shipping'}
                                onClick={() => toggleAccordion('shipping')}
                            >
                                <p>Envíos a toda Colombia. Gratis por compras superiores a $200.000 COP.<br />
                                    Tiempo de entrega: 2-5 días hábiles dependiendo de tu ubicación.<br />
                                    Para Bucaramanga y AMB, opción de entrega contraentrega disponible.</p>
                            </AccordionItem>

                            <AccordionItem
                                title="Cambios y Devoluciones"
                                isOpen={activeAccordion === 'returns'}
                                onClick={() => toggleAccordion('returns')}
                            >
                                <p>Tienes 30 días para realizar cambios por talla o defectos de fábrica. La prenda debe estar sin usar y con etiquetas originales.</p>
                            </AccordionItem>
                        </div>
                    </div>
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h2 className="section-title">Completa el Outfit</h2>
                    <div className="product-grid">
                        {relatedProducts.map(p => (
                            <div key={p.id} className="product-card" onClick={() => {
                                navigate(`/product/${p.id}`);
                                window.scrollTo(0, 0); // Force scroll top
                            }}>
                                <img
                                    src={p.image && p.image.startsWith('img/') ? `/${p.image}` : p.image}
                                    alt={p.name}
                                />
                                <h3>{p.name}</h3>
                                <div className="price">{formatCOP(p.price)}</div>
                                <button>VER AHORA</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
