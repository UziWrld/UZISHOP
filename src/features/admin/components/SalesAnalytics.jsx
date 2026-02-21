import React, { useState, useEffect } from 'react';
import { analyticsService } from '@api/analyticsService';
import { formatCOP } from '@utils/formatters';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';

const SalesAnalytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [orderStats, setOrderStats] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const metricsData = await analyticsService.getBusinessMetrics();
            setMetrics(metricsData);
            const topProductsData = await analyticsService.getTopSellingProducts(5);
            setTopProducts(topProductsData);
            const endDate = new Date();
            const startDate = subDays(endDate, parseInt(dateRange));
            const salesByDate = await analyticsService.getSalesByDate(startDate, endDate);
            setSalesData(salesByDate);
            setOrderStats(stats);
            const pStats = await analyticsService.getProductPerformanceStats();
            setProductStats(pStats);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-card">Cargando métricas de rendimiento...</div>;

    const COLORS = ['#000000', '#2ecc71', '#3498db', '#f1c40f', '#e74c3c'];

    const pieData = orderStats ? [
        { name: 'Preparación', value: orderStats.enPreparacion },
        { name: 'Enviado', value: orderStats.enviado },
        { name: 'Entregado', value: orderStats.entregado },
        { name: 'Cancelado', value: orderStats.cancelado }
    ].filter(item => item.value > 0) : [];

    return (
        <div className="admin-section">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>METRICAS DE NEGOCIO</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#888' }}>Rendimiento real de UZISHOP</p>
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="admin-input"
                    style={{ width: 'auto', fontWeight: '800' }}
                >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 90 días</option>
                </select>
            </header>

            {/* Metrics Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="admin-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className='bx bx-dollar'></i>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Ingresos Totales</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '950' }}>{formatCOP(metrics?.totalRevenue || 0)}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className='bx bx-shopping-bag'></i>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Pedidos Totales</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '950' }}>{metrics?.totalOrders || 0}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className='bx bx-line-chart'></i>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Ticket Promedio</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '950' }}>{formatCOP(metrics?.averageOrderValue || 0)}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <i className='bx bx-time'></i>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Ventas Hoy</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '950' }}>{formatCOP(metrics?.todayRevenue || 0)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, fontSize: '0.9rem', fontWeight: '900', marginBottom: '30px' }}>TENDENCIA DE VENTAS</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'dd/MM')} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(v) => formatCOP(v)} labelStyle={{ fontWeight: 800 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, fontSize: '0.9rem', fontWeight: '900', marginBottom: '30px' }}>ESTADOS DE PEDIDO</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '800' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Inventory Performance */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px' }}>RENDIMIENTO DE INVENTARIO</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                {productStats && (
                    <>
                        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className='bx bx-show' style={{ fontSize: '1.2rem' }}></i>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900' }}>MÁS VISTOS</h3>
                            </div>
                            <div style={{ padding: '0' }}>
                                {productStats.mostViewed.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #f9f9f9' }}>
                                        <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{p.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{p.views || 0} vistas</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className='bx bx-shopping-bag' style={{ fontSize: '1.2rem' }}></i>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900' }}>MÁS VENDIDOS</h3>
                            </div>
                            <div style={{ padding: '0' }}>
                                {productStats.mostSold.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #f9f9f9' }}>
                                        <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{p.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{p.soldCount || 0} vendidos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className='bx bx-down-arrow-circle' style={{ fontSize: '1.2rem' }}></i>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900' }}>MENOS INTERÉS</h3>
                            </div>
                            <div style={{ padding: '0' }}>
                                {productStats.leastInterest.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #f9f9f9' }}>
                                        <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{p.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{p.views || 0} vistas / {p.soldCount || 0} vendidos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Top Products */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '25px', borderBottom: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900' }}>PRODUCTOS TOP VENTAS</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#fafafa' }}>
                            <th style={{ padding: '15px 25px', fontSize: '0.7rem', fontWeight: '900', color: '#bbb' }}>PRODUCTO</th>
                            <th style={{ padding: '15px 25px', fontSize: '0.7rem', fontWeight: '900', color: '#bbb' }}>UNIDADES</th>
                            <th style={{ padding: '15px 25px', fontSize: '0.7rem', fontWeight: '900', color: '#bbb' }}>VALOR TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((p, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f8f8f8' }}>
                                <td style={{ padding: '15px 25px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '40px', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: '#f8f8f8' }}>
                                            <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{p.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '15px 25px', fontWeight: '900' }}>{p.totalQuantity}</td>
                                <td style={{ padding: '15px 25px', fontWeight: '900' }}>{formatCOP(p.totalRevenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesAnalytics;
