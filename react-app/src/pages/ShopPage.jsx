import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useCollectionData } from '../hooks/useCollectionData';

const ShopPage = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived States from URL (Inputs for the Controller)
    const activeCategory = searchParams.get('category') || 'All';
    const activeGender = searchParams.get('gender') || null;
    const activeCollection = searchParams.get('collection') || null;

    // View-only Filter States
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    // MVC Hooks (Controllers)
    const {
        products: filteredProducts,
        availableSizes,
        availableColors,
        loading: loadingProducts
    } = useProducts({
        gender: activeGender,
        category: activeCategory,
        collectionId: activeCollection,
        size: selectedSize,
        color: selectedColor,
        sortBy: sortBy,
        autoSubscribe: true
    });

    const { collectionData: currentCollectionData } = useCollectionData(activeCollection);

    const [selectedQuickAddProduct, setSelectedQuickAddProduct] = useState(null);

    const categoriesList = ['All', 'Camisetas', 'Hoodies/Chaquetas', 'Pantalones', 'Accesorios', 'Sneakers'];

    const handleCategoryChange = (cat) => {
        const nextParams = new URLSearchParams(searchParams);
        if (cat === 'All') {
            nextParams.delete('category');
        } else {
            nextParams.set('category', cat);
        }
        setSearchParams(nextParams);
    };

    const handleProductClick = (product) => {
        navigate(`/product/${product.id}`);
    };

    const handleQuickAdd = (product) => {
        setSelectedQuickAddProduct(product);
    };

    if (loadingProducts) {
        return <div style={{ paddingTop: '100px', textAlign: 'center' }}><p>Cargando SHOP...</p></div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            {/* Header / Title */}
            <div style={{ padding: '20px 5% 0 5%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-2px', margin: 0 }}>
                    {currentCollectionData ? currentCollectionData.name : (activeCollection ? activeCollection.replace('-', ' ') : 'STORE')}
                </h1>
                <p style={{ color: '#888', fontWeight: '600', letterSpacing: '2px' }}>
                    {currentCollectionData ? 'COLECCIÓN EXCLUSIVA' : 'THE NEW WAVE OF STREETWEAR'}
                </p>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar" style={{
                padding: '40px 5%',
                background: '#fff',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                position: 'sticky',
                top: '70px',
                zIndex: 100,
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
            }}>
                <div className="category-scroll" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {categoriesList.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            style={{
                                padding: '8px 20px',
                                background: activeCategory === cat ? '#000' : 'transparent',
                                color: activeCategory === cat ? '#fff' : '#000',
                                border: '1px solid #000',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat === 'All' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 25px',
                            borderRadius: '30px',
                            border: '1px solid #000',
                            background: showFilters ? '#000' : '#fff',
                            color: showFilters ? '#fff' : '#000',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        <i className={`bx ${showFilters ? 'bx-x' : 'bx-filter'}`} style={{ fontSize: '1.2rem' }}></i>
                        {showFilters ? 'CERRAR FILTROS' : 'FILTROS'}
                    </button>

                    <div style={{ position: 'relative' }}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                padding: '12px 45px 12px 25px',
                                borderRadius: '30px',
                                border: '1px solid #000',
                                background: '#fff',
                                color: '#000',
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                outline: 'none',
                                textTransform: 'uppercase',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <option value="newest">LO MÁS NUEVO</option>
                            <option value="price-low">PRECIO: MENOR A MAYOR</option>
                            <option value="price-high">PRECIO: MAYOR A MENOR</option>
                        </select>
                        <i className='bx bx-chevron-down' style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            fontSize: '1.2rem',
                            color: '#000'
                        }}></i>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="advanced-filters" style={{
                    padding: '30px 5%',
                    background: '#f9f9f9',
                    borderBottom: '1px solid #eee',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '40px'
                }}>
                    <div>
                        <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px', color: '#888' }}>Talla</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {availableSizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                    style={{
                                        padding: '10px 15px',
                                        minWidth: '45px',
                                        background: selectedSize === size ? '#000' : '#fff',
                                        color: selectedSize === size ? '#fff' : '#000',
                                        border: '1px solid #ddd',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: '0.2s'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '18px', color: '#888' }}>Color</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                            {[
                                { name: 'NEGRO', shades: ['#000000', '#1A1A1A', '#333333'] },
                                { name: 'BLANCO', shades: ['#FFFFFF', '#FDFDFD', '#F5F5F5'] },
                                { name: 'GRIS', shades: ['#808080', '#A9A9A9', '#D3D3D3'] },
                                { name: 'AZUL', shades: ['#000080', '#0000FF', '#4169E1'] },
                                { name: 'BEIGE / MARFIL', shades: ['#F5F5DC', '#FFFDD0', '#E1C16E'] },
                                { name: 'VERDE', shades: ['#006400', '#008000', '#2E8B57'] },
                                { name: 'ROJO', shades: ['#8B0000', '#FF0000', '#DC143C'] },
                                { name: 'CAFE', shades: ['#4B2C20', '#6F4E37', '#A67B5B'] },
                                { name: 'AZUL HIELO', shades: ['#E0F7FA', '#B2EBF2', '#80DEEA'] },
                                { name: 'ROSADO', shades: ['#FFC0CB', '#FF69B4'] },
                                { name: 'AMARILLO', shades: ['#FFFF00', '#FFD700'] }
                            ].map(group => {
                                const isSelected = selectedColor === group.name;
                                const step = 100 / group.shades.length;
                                const gradientString = `conic-gradient(${group.shades.map((sh, i) => `${sh} ${i * step}% ${(i + 1) * step}%`).join(', ')})`;

                                return (
                                    <div
                                        key={group.name}
                                        onClick={() => setSelectedColor(isSelected ? null : group.name)}
                                        onMouseEnter={e => {
                                            if (!isSelected) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.borderColor = '#000';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.borderColor = '#ddd';
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 15px',
                                            background: isSelected ? '#000' : '#fff',
                                            border: isSelected ? '1px solid #000' : '1px solid #ddd',
                                            borderRadius: '30px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            background: gradientString,
                                            border: isSelected ? '1px solid #fff' : '1px solid rgba(0,0,0,0.1)'
                                        }} />
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            color: isSelected ? '#fff' : '#000',
                                            flex: 1,
                                            letterSpacing: '0.5px'
                                        }}>{group.name}</span>
                                        {isSelected && <i className='bx bx-check' style={{ color: '#fff', fontSize: '1rem' }}></i>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        {(selectedSize || selectedColor) && (
                            <button
                                onClick={() => { setSelectedSize(null); setSelectedColor(null); }}
                                style={{ background: 'transparent', border: 'none', color: '#ff4444', textDecoration: 'underline', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                            >
                                LIMPIAR FILTROS
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Product Display Area */}
            <div style={{ padding: '0 5% 50px 5%' }}>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((section) => (
                        <section key={section.id} id={section.id} className="product-section" style={{ padding: '3rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{section.label}</h2>
                                <div style={{ height: '1px', background: '#eee', flex: 1 }}></div>
                                <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: '600' }}>{section.items.length} ITEMS</span>
                            </div>
                            <div className="product-grid" style={{ padding: 0 }}>
                                {section.items.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onCardClick={handleProductClick}
                                        onAddToCart={handleQuickAdd}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <i className='bx bx-search-alt' style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
                        <h3>No encontramos productos con esos filtros</h3>
                        <button
                            onClick={() => { setSelectedSize(null); setSelectedColor(null); handleCategoryChange('All'); }}
                            style={{ marginTop: '20px', background: '#000', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            VER TODO EL CATALOGO
                        </button>
                    </div>
                )}
            </div>

            <ProductDetailsModal
                product={selectedQuickAddProduct}
                isOpen={!!selectedQuickAddProduct}
                onClose={() => setSelectedQuickAddProduct(null)}
                onAddToCart={addToCart}
            />
        </div>
    );
};

export default ShopPage;
