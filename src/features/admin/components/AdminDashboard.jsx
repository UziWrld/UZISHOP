import React, { useState, useEffect, lazy, Suspense } from 'react';
import { productService } from '@products/services/productService';
import { CacheService } from '@core/services/CacheService';
import { createLogger } from '@core/utils/Logger';
// Lazy: cada tab se carga solo cuando el usuario la visita por primera vez
const ProductForm = lazy(() => import('./ProductForm'));
const UserManagement = lazy(() => import('./UserManagement'));
const OrderManagement = lazy(() => import('./OrderManagement'));
const CouponManagement = lazy(() => import('./CouponManagement'));
const SalesAnalytics = lazy(() => import('./SalesAnalytics'));
const CollectionManagement = lazy(() => import('./CollectionManagement'));
const SizeGuideManagement = lazy(() => import('./SizeGuideManagement'));
import '@assets/css/admin.css';

const logger = createLogger('AdminDashboard');

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'form'
    const [currentTab, setCurrentTab] = useState('products');
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterGender, setFilterGender] = useState('All');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (error) {
            logger.error('Error loading products', error);
        } finally {
            setLoading(false);

        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        const matchesGender = filterGender === 'All' || p.gender === filterGender;
        return matchesSearch && matchesCategory && matchesGender;
    });

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
        try {
            await productService.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setView('form');
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setView('form');
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
            } else {
                await productService.createProduct(productData);
            }
            setView('list');
            fetchProducts();
        } catch (error) {
            alert("Error al guardar producto");
        }
    };

    const navItems = [
        { id: 'products', label: 'Productos', icon: 'bx-package' },
        { id: 'colecciones', label: 'Colecciones', icon: 'bx-collection' },
        { id: 'orders', label: 'Pedidos', icon: 'bx-shopping-bag' },
        { id: 'coupons', label: 'Cupones', icon: 'bx-purchase-tag' },
        { id: 'guides', label: 'Guías de Tallas', icon: 'bx-ruler' },
        { id: 'users', label: 'Usuarios', icon: 'bx-group' },
        { id: 'analytics', label: 'Analytics', icon: 'bx-stats' },
    ];

    const getPageTitle = () => {
        const item = navItems.find(i => i.id === currentTab);
        return item ? item.label : 'Dashboard';
    };

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar Navigation */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>PANEL ADMIN</h2>
                </div>
                <nav className="admin-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${currentTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentTab(item.id);
                                setView('list');
                            }}
                        >
                            <i className={`bx ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="admin-content-main">
                <header className="admin-page-header">
                    <div className="admin-page-title">
                        <h1>{getPageTitle()}</h1>
                        <p>Gestiona {getPageTitle().toLowerCase()} de tu tienda</p>
                    </div>
                    {currentTab === 'products' && view === 'list' && (
                        <button className="admin-btn-premium admin-btn-primary" onClick={handleCreate}>
                            + NUEVO PRODUCTO
                        </button>
                    )}
                </header>

                <div className="admin-content-body">
                    <Suspense fallback={
                        <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontWeight: '700', letterSpacing: '2px' }}>
                            CARGANDO...
                        </div>
                    }>
                        {currentTab === 'products' ? (
                            view === 'form' ? (
                                <div className="admin-card">
                                    <ProductForm
                                        productToEdit={editingProduct}
                                        onSave={handleSaveProduct}
                                        onCancel={() => setView('list')}
                                    />
                                </div>
                            ) : (
                                <div className="admin-section">
                                    <div className="admin-control-bar">
                                        <div className="admin-search-wrapper">
                                            <i className='bx bx-search'></i>
                                            <input
                                                type="text"
                                                placeholder="Buscar productos por nombre..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="admin-btn-premium admin-btn-secondary"
                                            value={filterGender}
                                            onChange={(e) => setFilterGender(e.target.value)}
                                            style={{ border: '1px solid #eee', marginRight: '10px' }}
                                        >
                                            <option value="All">Todos los Géneros</option>
                                            <option value="hombre">👨 Hombre</option>
                                            <option value="mujer">👩 Mujer</option>
                                            <option value="unisex">🌐 Unisex</option>
                                        </select>
                                        <select
                                            className="admin-btn-premium admin-btn-secondary"
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            style={{ border: '1px solid #eee' }}
                                        >
                                            <option value="All">Todas las Categorías</option>
                                            <option value="Camisetas">Camisetas</option>
                                            <option value="Hoodies/Chaquetas">Hoodies/Chaquetas</option>
                                            <option value="Pantalones">Pantalones</option>
                                            <option value="Sneakers">Sneakers</option>
                                            <option value="Accesorios">Accesorios</option>
                                        </select>
                                    </div>

                                    {loading ? (
                                        <div className="admin-card" style={{ textAlign: 'center', padding: '100px' }}>
                                            <p>Cargando catálogo de productos...</p>
                                        </div>
                                    ) : (
                                        <div className="admin-products-sections">
                                            {[...new Set(products.map(p => p.category || 'Otros'))].sort().map(cat => {
                                                const categoryProducts = filteredProducts.filter(p => (p.category || 'Otros') === cat);
                                                if (categoryProducts.length === 0) return null;
                                                if (filterCategory !== 'All' && filterCategory !== cat) return null;

                                                return (
                                                    <div key={cat} className="admin-category-section" style={{ marginBottom: '50px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</h2>
                                                            <span style={{ background: '#eee', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>{categoryProducts.length}</span>
                                                        </div>
                                                        <div className="admin-products-grid">
                                                            {categoryProducts.map(product => (
                                                                <div key={product.id} className="admin-product-item">
                                                                    <div className="admin-product-img">
                                                                        {product.image ? (
                                                                            <img src={product.image} alt={product.name} />
                                                                        ) : (
                                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', fontSize: '12px' }}>SIN IMAGEN</div>
                                                                        )}
                                                                        <span className={`admin-product-status ${product.stock > 0 ? 'status-active' : 'status-out'}`}>
                                                                            {product.stock > 0 ? 'Disponible' : 'Agotado'}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ marginBottom: '20px' }}>
                                                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: '800' }}>{product.name}</h4>
                                                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
                                                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price)}
                                                                        </p>
                                                                        <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                                                            Stock: {product.stock} unidades
                                                                        </p>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                                        <button className="admin-btn-premium admin-btn-secondary" style={{ flex: 1 }} onClick={() => handleEdit(product)}>
                                                                            EDITAR
                                                                        </button>
                                                                        <button className="admin-btn-premium admin-btn-danger" onClick={() => handleDelete(product.id)}>
                                                                            <i className='bx bx-trash'></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {filteredProducts.length === 0 && (
                                                <div className="admin-card" style={{ textAlign: 'center', padding: '100px' }}>
                                                    <p>No se encontraron productos en esta sección.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : currentTab === 'orders' ? (
                            <div className="admin-card">
                                <OrderManagement />
                            </div>
                        ) : currentTab === 'coupons' ? (
                            <div className="admin-card">
                                <CouponManagement />
                            </div>
                        ) : currentTab === 'colecciones' ? (
                            <div className="admin-card">
                                <CollectionManagement />
                            </div>
                        ) : currentTab === 'guides' ? (
                            <div className="admin-card">
                                <SizeGuideManagement />
                            </div>
                        ) : currentTab === 'analytics' ? (
                            <div className="admin-card">
                                <SalesAnalytics />
                            </div>
                        ) : (
                            <div className="admin-card">
                                <UserManagement />
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
