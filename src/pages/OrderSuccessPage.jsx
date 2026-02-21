import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import Footer from '@core/components/layout/Footer';

const OrderSuccessPage = () => {
    const location = useLocation();
    const { orderNumber } = location.state || {};

    if (!orderNumber) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="order-success-wrapper" style={{ paddingTop: '120px', minHeight: '100vh', background: '#fff', textAlign: 'center' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
                <div style={{ fontSize: '5rem', color: '#2ed573', marginBottom: '20px' }}>
                    <i className='bx bx-check-circle'></i>
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>¡GRACIAS POR TU COMPRA!</h1>
                <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '30px' }}>
                    Tu pedido ha sido recibido y está siendo procesado por la UZI GANG.
                </p>

                <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '8px', marginBottom: '40px', border: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Número de Pedido</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '5px 0', color: '#000' }}>#{orderNumber}</h2>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '15px' }}>¿Qué sigue?</h3>
                    <ul style={{ paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
                        <li>Recibirás un correo de confirmación con los detalles.</li>
                        <li>Un asesor te contactará si elegiste **Pago Contraentrega**.</li>
                        <li>Podrás seguir el estado de tu pedido en tu **Perfil**.</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link to="/profile" style={{
                        padding: '15px 30px',
                        background: '#000',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: '800',
                        borderRadius: '5px'
                    }}>VER MIS PEDIDOS</Link>

                    <Link to="/" style={{
                        padding: '15px 30px',
                        background: '#fff',
                        color: '#000',
                        border: '2px solid #000',
                        textDecoration: 'none',
                        fontWeight: '800',
                        borderRadius: '5px'
                    }}>VOLVER AL INICIO</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
