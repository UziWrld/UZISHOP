import React, { useState, useEffect } from 'react';
import { sizeGuideService } from '../../services/sizeGuideService';

const SizeGuideManagement = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        gender: 'unisex',
        category: 'Camisetas',
        headers: ['Talla', 'Busto (cm)', 'Largo (cm)'],
        rows: [],
        image: '/img/T-Shirt.svg'
    });

    const categories = ['Camisetas', 'Hoodies/Chaquetas', 'Pantalones', 'Sneakers', 'Accesorios'];
    const genders = ['hombre', 'mujer', 'unisex'];

    const fetchGuides = async () => {
        setLoading(true);
        try {
            const data = await sizeGuideService.getAllGuides();
            setGuides(data);
        } catch (error) {
            console.error("Error fetching guides:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const handleAddRow = () => {
        const newRow = {};
        formData.headers.forEach(h => newRow[h.toLowerCase().replace(/\s/g, '_')] = '');
        setFormData(prev => ({ ...prev, rows: [...prev.rows, newRow] }));
    };

    const handleRemoveRow = (index) => {
        setFormData(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }));
    };

    const handleRowValueChange = (rowIndex, rowKey, value) => {
        const newRows = [...formData.rows];
        newRows[rowIndex][rowKey] = value;
        setFormData(prev => ({ ...prev, rows: newRows }));
    };

    const handleEdit = (guide) => {
        setFormData(guide);
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await sizeGuideService.saveGuide(formData.gender, formData.category, formData);
            setIsEditing(false);
            setFormData({
                gender: 'unisex',
                category: 'Camisetas',
                headers: ['Talla', 'Busto (cm)', 'Largo (cm)'],
                rows: [],
                image: '/img/T-Shirt.svg'
            });
            fetchGuides();
        } catch (error) {
            alert("Error al guardar la guía");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar esta guía?")) return;
        try {
            await sizeGuideService.deleteGuide(id);
            fetchGuides();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    return (
        <div className="admin-guide-management">
            {isEditing ? (
                <div className="admin-form-guide">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ margin: 0, fontWeight: '900' }}>{formData.id ? 'EDITAR GUÍA' : 'NUEVA GUÍA'}</h2>
                        <button className="admin-btn-premium admin-btn-secondary" onClick={() => setIsEditing(false)}>CANCELAR</button>
                    </div>

                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="admin-form-group">
                                <label>Género</label>
                                <select className="admin-input" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} disabled={!!formData.id}>
                                    {genders.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Categoría</label>
                                <select className="admin-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} disabled={!!formData.id}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label>Imagen de Referencia (SVG/PNG)</label>
                            <input type="text" className="admin-input" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                        </div>

                        <div className="admin-form-group">
                            <label>Tabla de Medidas</label>
                            <div className="table-responsive">
                                <table className="admin-table" style={{ width: '100%', marginBottom: '20px' }}>
                                    <thead>
                                        <tr>
                                            {formData.headers.map((h, i) => <th key={i}>{h}</th>)}
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.rows.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {formData.headers.map((h, hIdx) => {
                                                    const key = h.toLowerCase().replace(/\s/g, '_');
                                                    return (
                                                        <td key={hIdx}>
                                                            <input
                                                                type="text"
                                                                className="admin-input"
                                                                style={{ padding: '5px', fontSize: '12px' }}
                                                                value={row[key] || ''}
                                                                onChange={(e) => handleRowValueChange(rIdx, key, e.target.value)}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                                <td>
                                                    <button type="button" className="admin-btn-premium admin-btn-danger" style={{ padding: '5px 10px' }} onClick={() => handleRemoveRow(rIdx)}>
                                                        &times;
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button type="button" className="admin-btn-premium admin-btn-secondary" style={{ width: '100%' }} onClick={handleAddRow}>
                                    + AÑADIR FILA
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="admin-btn-premium admin-btn-primary" style={{ width: '100%', marginTop: '30px', padding: '15px' }}>
                            GUARDAR GUÍA
                        </button>
                    </form>
                </div>
            ) : (
                <div className="admin-guide-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ margin: 0, fontWeight: '900' }}>GUÍAS DE TALLAS</h2>
                        <button className="admin-btn-premium admin-btn-primary" onClick={() => setIsEditing(true)}>+ NUEVA GUÍA</button>
                    </div>

                    {loading ? <p>Cargando guías...</p> : (
                        <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {guides.map(guide => (
                                <div key={guide.id} className="admin-card" style={{ padding: '20px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{guide.category}</h3>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#888', textTransform: 'uppercase' }}>{guide.gender}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button className="admin-btn-premium admin-btn-secondary" style={{ padding: '5px 10px' }} onClick={() => handleEdit(guide)}>
                                                <i className='bx bx-edit'></i>
                                            </button>
                                            <button className="admin-btn-premium admin-btn-danger" style={{ padding: '5px 10px' }} onClick={() => handleDelete(guide.id)}>
                                                <i className='bx bx-trash'></i>
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>{guide.rows.length} tallas configuradas</p>
                                </div>
                            ))}
                            {guides.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#888' }}>No hay guías de tallas configuradas todavía.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SizeGuideManagement;
