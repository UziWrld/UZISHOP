import React, { useState, useEffect, useRef } from 'react';
import { collectionService } from '@products/services/collectionService';
import { uploadImage } from '@api/storageService';

const CollectionManagement = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCollection, setEditingCollection] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showCropEditor, setShowCropEditor] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const dragItem = useRef();
    const dragOverItem = useRef();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        status: 'active',
        order: 0
    });

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const data = await collectionService.getAllCollections();
            // Ensure every collection has an order field if it doesn't
            const dataWithOrder = data.map((col, idx) => ({
                ...col,
                order: col.order !== undefined ? col.order : idx
            }));
            setCollections(dataWithOrder);
        } catch (error) {
            console.error("Error loading collections:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setTempImage(event.target.result);
            setImagePosition({ x: 0, y: 0 });
            setShowCropEditor(true);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCrop = async () => {
        setUploading(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const targetWidth = 2560;
            const targetHeight = 1440;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const img = new Image();
            img.src = tempImage;
            await new Promise((resolve) => { img.onload = resolve; });

            const posY = 50 + (imagePosition.y / window.innerHeight * 50);
            const imgRatio = img.width / img.height;
            const canvasRatio = targetWidth / targetHeight;

            let drawWidth, drawHeight, drawX, drawY;
            if (imgRatio > canvasRatio) {
                drawHeight = targetHeight;
                drawWidth = drawHeight * imgRatio;
                drawX = -(drawWidth - targetWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = targetWidth;
                drawHeight = drawWidth / imgRatio;
                drawX = 0;
                const excessHeight = drawHeight - targetHeight;
                drawY = -excessHeight * (posY / 100);
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            const croppedDataUrl = canvas.toDataURL('image/webp', 0.92);

            // Upload to storage instead of keeping base64
            const blob = await (await fetch(croppedDataUrl)).blob();
            const file = new File([blob], `collection_${Date.now()}.webp`, { type: 'image/webp' });
            const downloadUrl = await uploadImage(file, 'collections');

            setFormData(prev => ({ ...prev, image: downloadUrl }));
            setShowCropEditor(false);
            setTempImage(null);
        } catch (error) {
            console.error(error);
            alert("Error al procesar o subir imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) return alert("Sube una imagen");

        setUploading(true);
        try {
            if (editingCollection) {
                await collectionService.updateCollection(editingCollection.id, formData);
            } else {
                // For new collections, put it at the end
                const maxOrder = collections.length > 0 ? Math.max(...collections.map(c => c.order || 0)) : -1;
                await collectionService.createCollection({
                    ...formData,
                    order: maxOrder + 1
                });
            }
            setShowForm(false);
            setEditingCollection(null);
            fetchCollections();
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (col) => {
        setEditingCollection(col);
        setFormData({
            name: col.name,
            description: col.description || '',
            image: col.image,
            status: col.status || 'active',
            order: col.order || 0
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta colección?')) return;
        try {
            await collectionService.deleteCollection(id);
            fetchCollections();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    // DRAG AND DROP LOGIC
    const handleSort = async () => {
        const _collections = [...collections];
        const draggedItemContent = _collections.splice(dragItem.current, 1)[0];
        _collections.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        // Update local state immediately for smooth UI
        const updatedCollections = _collections.map((col, idx) => ({ ...col, order: idx }));
        setCollections(updatedCollections);

        // Batch update in Firestore
        try {
            await Promise.all(updatedCollections.map(col =>
                collectionService.updateCollection(col.id, { order: col.order })
            ));
        } catch (error) {
            console.error("Error updating sequence:", error);
        }
    };

    return (
        <div className="admin-section">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>EDITORIAL & DROPS</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#888' }}>Gestiona el storytelling visual de la marca</p>
                </div>
                {!showForm && (
                    <button className="admin-btn-premium admin-btn-primary" onClick={() => { setShowForm(true); setEditingCollection(null); setFormData({ name: '', description: '', image: '', status: 'active', order: 0 }); }}>
                        + NUEVA COLECCIÓN
                    </button>
                )}
            </header>

            {showForm && (
                <div className="admin-card" style={{ marginBottom: '40px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: '900', marginBottom: '30px' }}>{editingCollection ? 'EDITAR COLECCIÓN' : 'NUEVA COLECCIÓN'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div>
                                <div className="admin-form-group">
                                    <label>Nombre de la Colección</label>
                                    <input type="text" name="name" className="admin-input" value={formData.name} onChange={handleChange} required placeholder="Ej: DARK MODE 2024" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Estado de Visibilidad</label>
                                    <select name="status" className="admin-input" value={formData.status} onChange={handleChange}>
                                        <option value="active">Pública (Live)</option>
                                        <option value="hidden">Oculta (Borrador)</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Descripción / Concepto</label>
                                    <textarea name="description" className="admin-input" value={formData.description} onChange={handleChange} rows="4" placeholder="Storytelling de la colección..." />
                                </div>
                            </div>
                            <div>
                                <div className="admin-form-group">
                                    <label>Imagen Editorial (16:9)</label>
                                    <div className="admin-image-upload-zone" onClick={() => document.getElementById('colFile').click()} style={{ padding: '30px' }}>
                                        <input type="file" id="colFile" style={{ display: 'none' }} onChange={handleFile} accept="image/*" />
                                        {formData.image ? (
                                            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden' }}>
                                                <img src={formData.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ) : (
                                            <>
                                                <i className='bx bx-camera' style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                                                <p style={{ margin: 0, fontWeight: '800', fontSize: '10px' }}>SUBIR IMAGEN CINEMÁTICA</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                            <button type="submit" className="admin-btn-premium admin-btn-primary" disabled={uploading}>
                                {uploading ? 'PROCESANDO...' : (editingCollection ? 'GUARDAR CAMBIOS' : 'PUBLICAR COLECCIÓN')}
                            </button>
                            <button type="button" className="admin-btn-premium admin-btn-secondary" onClick={() => { setShowForm(false); setEditingCollection(null); }}>
                                CANCELAR
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ gridColumn: 'span 2', marginBottom: '15px', fontSize: '0.75rem', fontWeight: '800', color: '#888' }}>
                <i className='bx bx-move'></i> ARRASTRA LAS COLECCIONES PARA REORGANIZAR EL ORDEN DE APARICIÓN EN LA WEB
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                {collections.map((col, index) => (
                    <div
                        key={col.id}
                        className="admin-card collection-draggable"
                        style={{ padding: 0, overflow: 'hidden' }}
                        draggable
                        onDragStart={() => (dragItem.current = index)}
                        onDragEnter={() => (dragOverItem.current = index)}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div style={{ height: '200px', position: 'relative' }}>
                            <img src={col.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span className={`admin-product-status ${col.status === 'active' ? 'status-active' : 'status-out'}`} style={{ top: '15px', right: '15px' }}>
                                {col.status === 'active' ? 'LIVE' : 'HIDDEN'}
                            </span>
                            <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.5)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>
                                {index + 1}
                            </div>
                        </div>
                        <div style={{ padding: '25px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{col.name}</h4>
                            <p style={{ margin: '0 0 25px 0', fontSize: '0.85rem', color: '#888', lineHeight: '1.5', height: '3em', overflow: 'hidden' }}>{col.description || 'Sin descripción conceptual.'}</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="admin-btn-premium admin-btn-secondary" style={{ flex: 1 }} onClick={() => handleEdit(col)}>EDITAR</button>
                                <button className="admin-btn-premium admin-btn-danger" onClick={() => handleDelete(col.id)}><i className='bx bx-trash'></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals keep their full-screen immersive logic but with refined UI */}
            {showCropEditor && tempImage && (
                <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 10001, display: 'flex', gap: '15px' }}>
                        <button className="admin-btn-premium" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => { setShowCropEditor(false); setTempImage(null); }}>CANCELAR</button>
                        <button className="admin-btn-premium admin-btn-primary" onClick={handleSaveCrop}>{uploading ? 'PROCESANDO...' : 'GUARDAR ENCUADRE'}</button>
                    </div>
                    <div style={{ flex: 1, position: 'relative', cursor: 'ns-resize' }}
                        onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: 0, y: e.clientY - imagePosition.y }); }}
                        onMouseMove={(e) => { if (isDragging) setImagePosition({ x: 0, y: e.clientY - dragStart.y }); }}
                        onMouseUp={() => setIsDragging(false)}
                    >
                        <img src={tempImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${50 + (imagePosition.y / window.innerHeight * 100)}%`, pointerEvents: 'none' }} draggable={false} />
                        <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 20px', borderRadius: '30px', fontSize: '0.8rem' }}>↕️ ARRASTRA PARA ENMARCAR EL STORYTELLING</div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CollectionManagement;
