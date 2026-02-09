import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService'; // Assuming uploadImage is here or in common util

const MenuSettings = () => {
    const [settings, setSettings] = useState({
        hombre: { title: '', description: '', imageUrl: '' },
        mujer: { title: '', description: '', imageUrl: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [uploading, setUploading] = useState({ hombre: false, mujer: false });
    const [previews, setPreviews] = useState({ hombre: null, mujer: null });

    useEffect(() => {
        const unsubscribe = categoryService.subscribeToMenuSettings((data) => {
            if (data) {
                setSettings(data);
                setPreviews({
                    hombre: data.hombre?.imageUrl || null,
                    mujer: data.mujer?.imageUrl || null
                });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await categoryService.updateMenuSettings(settings);
            setMessage({ type: 'success', text: 'Ajustes guardados correctamente' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar los ajustes' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleImageUpload = async (gender, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Local preview
        const localUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [gender]: localUrl }));
        setUploading(prev => ({ ...prev, [gender]: true }));

        try {
            const url = await productService.uploadImage(file);
            setSettings(prev => ({
                ...prev,
                [gender]: { ...prev[gender], imageUrl: url }
            }));
            setPreviews(prev => ({ ...prev, [gender]: url }));
        } catch (error) {
            alert("Error al subir imagen");
            // Reset to current saved image if error
            setPreviews(prev => ({ ...prev, [gender]: settings[gender].imageUrl }));
        } finally {
            setUploading(prev => ({ ...prev, [gender]: false }));
        }
    };

    if (loading) return <div>Cargando ajustes...</div>;

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>Ajustes del Mega Menú</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* HOMBRES */}
                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', color: '#666' }}>Sección Destacada (HOMBRE)</h3>
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Título</label>
                        <input
                            type="text"
                            value={settings.hombre.title}
                            onChange={(e) => setSettings(prev => ({ ...prev, hombre: { ...prev.hombre, title: e.target.value } }))}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                            placeholder="Ej: NUEVA COLECCIÓN"
                        />
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Descripción</label>
                        <textarea
                            value={settings.hombre.description}
                            onChange={(e) => setSettings(prev => ({ ...prev, hombre: { ...prev.hombre, description: e.target.value } }))}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Imagen Destacada</label>
                        <div style={{
                            width: '100%',
                            height: '200px',
                            background: '#f9f9f9',
                            borderRadius: '8px',
                            border: '2px dashed #ddd',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            marginBottom: '10px'
                        }}>
                            {previews.hombre ? (
                                <img src={previews.hombre} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploading.hombre ? 0.3 : 1 }} />
                            ) : (
                                <span style={{ color: '#999', fontSize: '0.8rem' }}>Sin imagen seleccionada</span>
                            )}
                            {uploading.hombre && (
                                <div style={{ position: 'absolute', background: 'rgba(255,255,255,0.8)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    SUBIENDO...
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload('hombre', e)} style={{ fontSize: '0.8rem' }} />
                    </div>
                </div>

                {/* MUJERES */}
                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', color: '#666' }}>Sección Destacada (MUJER)</h3>
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Título</label>
                        <input
                            type="text"
                            value={settings.mujer.title}
                            onChange={(e) => setSettings(prev => ({ ...prev, mujer: { ...prev.mujer, title: e.target.value } }))}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                            placeholder="Ej: NUEVA COLECCIÓN"
                        />
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Descripción</label>
                        <textarea
                            value={settings.mujer.description}
                            onChange={(e) => setSettings(prev => ({ ...prev, mujer: { ...prev.mujer, description: e.target.value } }))}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Imagen Destacada</label>
                        <div style={{
                            width: '100%',
                            height: '200px',
                            background: '#f9f9f9',
                            borderRadius: '8px',
                            border: '2px dashed #ddd',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            marginBottom: '10px'
                        }}>
                            {previews.mujer ? (
                                <img src={previews.mujer} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploading.mujer ? 0.3 : 1 }} />
                            ) : (
                                <span style={{ color: '#999', fontSize: '0.8rem' }}>Sin imagen seleccionada</span>
                            )}
                            {uploading.mujer && (
                                <div style={{ position: 'absolute', background: 'rgba(255,255,255,0.8)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    SUBIENDO...
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload('mujer', e)} style={{ fontSize: '0.8rem' }} />
                    </div>

                </div>
            </div>

            {message && (
                <div style={{ marginTop: '20px', padding: '10px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', borderRadius: '4px' }}>
                    {message.text}
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={saving}
                style={{ marginTop: '30px', padding: '12px 30px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
                {saving ? 'GUARDANDO...' : 'GUARDAR AJUSTES'}
            </button>
        </div>
    );
};

export default MenuSettings;
