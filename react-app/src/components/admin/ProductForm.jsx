import React, { useState, useEffect, useRef } from 'react';
import { uploadImage } from '../../services/storageService';
import { collectionService } from '../../services/collectionService';

const ProductForm = ({ productToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Camisetas',
        gender: 'unisex',
        images: [],
        variants: [],
        color: '',
        collection: 'none'
    });

    const [uploading, setUploading] = useState(false);
    const [availableCollections, setAvailableCollections] = useState([]);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const sizeOptions = {
        'hombre': {
            'Camisetas': ['S', 'M', 'L', 'XL', 'XXL'],
            'Hoodies/Chaquetas': ['S', 'M', 'L', 'XL', 'XXL'],
            'Pantalones': ['28', '30', '32', '34', '36'],
            'Sneakers': ['38', '39', '40', '41', '42', '43', '44', '45'],
            'Accesorios': ['Única']
        },
        'mujer': {
            'Camisetas': ['XS', 'S', 'M', 'L', 'XL'],
            'Hoodies/Chaquetas': ['XS', 'S', 'M', 'L', 'XL'],
            'Pantalones': ['6', '8', '10', '12', '14'],
            'Sneakers': ['35', '36', '37', '38', '39', '40'],
            'Accesorios': ['Única']
        },
        'unisex': {
            'Camisetas': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'Hoodies/Chaquetas': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'Pantalones': ['28', '30', '32', '34', '36'],
            'Sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
            'Accesorios': ['Única']
        }
    };

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await collectionService.getAllCollections();
                setAvailableCollections(data);
            } catch (error) {
                console.error("Error loading collections:", error);
            }
        };
        fetchCollections();

        if (productToEdit) {
            const initialImages = productToEdit.images || (productToEdit.image ? [productToEdit.image] : []);
            setFormData({
                name: productToEdit.name || '',
                description: productToEdit.description || '',
                price: productToEdit.price || '',
                category: productToEdit.category || 'Camisetas',
                gender: productToEdit.gender || 'unisex',
                images: initialImages,
                variants: productToEdit.variants || [],
                color: productToEdit.color || '',
                collection: productToEdit.collection || 'none'
            });
        }
    }, [productToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'category' || name === 'gender') setFormData(prev => ({ ...prev, variants: [] }));
    };

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const newImages = await Promise.all(files.map(file => uploadImage(file)));
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        } catch (error) {
            alert("Error al subir imágenes");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSort = () => {
        let _images = [...formData.images];
        const draggedItemContent = _images.splice(dragItem.current, 1)[0];
        _images.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setFormData(prev => ({ ...prev, images: _images }));
    };

    const handleVariantStockChange = (size, stock) => {
        setFormData(prev => {
            const existing = prev.variants.find(v => v.size === size);
            let newVariants = existing
                ? prev.variants.map(v => v.size === size ? { ...v, stock: Number(stock) } : v)
                : [...prev.variants, { size, stock: Number(stock) }];
            return { ...prev, variants: newVariants };
        });
    };

    const toggleSize = (size) => {
        setFormData(prev => {
            const exists = prev.variants.find(v => v.size === size);
            return { ...prev, variants: exists ? prev.variants.filter(v => v.size !== size) : [...prev.variants, { size, stock: 0 }] };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.images.length === 0) return alert("Agrega al menos una imagen");
        const totalStock = formData.variants.reduce((acc, curr) => acc + curr.stock, 0);
        onSave({ ...formData, price: Number(formData.price), stock: totalStock });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                {/* Left Column: Basic Info */}
                <div>
                    <div className="admin-form-group">
                        <label>Nombre del Producto</label>
                        <input type="text" name="name" className="admin-input" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="admin-form-group">
                        <label>Descripción</label>
                        <textarea name="description" className="admin-input" value={formData.description} onChange={handleChange} rows="4" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="admin-form-group">
                            <label>Precio ($)</label>
                            <input type="number" name="price" className="admin-input" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label>Género</label>
                            <select name="gender" className="admin-input" value={formData.gender} onChange={handleChange}>
                                <option value="unisex">Unisex</option>
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Género</label>
                            <select name="gender" className="admin-input" value={formData.gender} onChange={handleChange}>
                                <option value="unisex">Unisex</option>
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="admin-form-group">
                            <label>Categoría</label>
                            <select name="category" className="admin-input" value={formData.category} onChange={handleChange}>
                                <option value="Camisetas">T-Shirts</option>
                                <option value="Hoodies/Chaquetas">Hoodies/Chaquetas</option>
                                <option value="Pantalones">Pants</option>
                                <option value="Accesorios">Accessories</option>
                                <option value="Sneakers">Sneakers</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Colección</label>
                            <select name="collection" className="admin-input" value={formData.collection} onChange={handleChange}>
                                <option value="none">Ninguna</option>
                                {availableCollections.map(col => (
                                    <option key={col.id} value={col.id}>{col.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label>Color Principal</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                            {['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'BEIGE', 'VERDE', 'ROJO', 'CAFE'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                    className={`admin-btn-premium ${formData.color === color ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                    style={{ padding: '8px', fontSize: '10px' }}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Media & Inventory */}
                <div>
                    <div className="admin-form-group">
                        <label>Galería de Imágenes</label>
                        <div className="admin-image-upload-zone" onClick={() => document.getElementById('fileInput').click()}>
                            <input type="file" id="fileInput" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
                            <i className='bx bx-cloud-upload' style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block' }}></i>
                            <p style={{ margin: 0, fontWeight: '700' }}>{uploading ? 'SUBIENDO...' : 'HAZ CLIC PARA SUBIR'}</p>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Soporta múltiples archivos</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '20px' }}>
                            {formData.images.map((img, index) => (
                                <div
                                    key={index}
                                    draggable
                                    onDragStart={() => (dragItem.current = index)}
                                    onDragEnter={() => (dragOverItem.current = index)}
                                    onDragEnd={handleSort}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{ position: 'relative', aspectRatio: '1', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', cursor: 'grab' }}
                                >
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                                    >
                                        &times;
                                    </button>
                                    {index === 0 && <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '9px', textAlign: 'center', padding: '2px 0', fontWeight: '800' }}>PORTADA</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label>Tallas y Stock ({formData.category} - {formData.gender})</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '15px' }}>
                            {(sizeOptions[formData.gender]?.[formData.category] || []).map(size => {
                                const variant = formData.variants.find(v => v.size === size);
                                const isSelected = !!variant;
                                return (
                                    <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <button
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`admin-btn-premium ${isSelected ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                            style={{ padding: '8px', fontSize: '10px', width: '100%' }}
                                        >
                                            {size}
                                        </button>
                                        {isSelected && (
                                            <input
                                                type="number"
                                                className="admin-input"
                                                style={{ padding: '5px', textAlign: 'center', fontSize: '12px' }}
                                                value={variant.stock}
                                                onChange={(e) => handleVariantStockChange(size, e.target.value)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #f0f0f0' }}>
                <button type="submit" className="admin-btn-premium admin-btn-primary" style={{ padding: '15px 40px' }} disabled={uploading}>
                    {productToEdit ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
                </button>
                <button type="button" className="admin-btn-premium admin-btn-secondary" style={{ padding: '15px 40px' }} onClick={onCancel}>
                    CANCELAR
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
