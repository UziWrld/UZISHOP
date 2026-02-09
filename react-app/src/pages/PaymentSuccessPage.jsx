import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { formatCOP } from '../utils/formatters';
import { useCart } from '../context/CartContext';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('ref');
            const transactionId = searchParams.get('id');

            if (!reference) {
                navigate('/');
                return;
            }

            try {
                // Si hay transactionId, verificar con Wompi
                if (transactionId) {
                    const result = await paymentService.verifyPaymentStatus(transactionId);
                    setPaymentStatus(result);

                    // Actualizar estado del pedido si el pago fue aprobado
                    if (result.status === 'APPROVED') {
                        // Aquí deberías buscar el orderId asociado a la referencia
                        // Por ahora, asumimos que está en localStorage
                        const orderId = localStorage.getItem('lastOrderId');
                        if (orderId) {
                            await paymentService.updateOrderPaymentStatus(orderId, 'paid', transactionId);
                        }
                    }
                } else {
                    // Pago alternativo (ya procesado)
                    setPaymentStatus({ status: 'PENDING', method: 'alternative' });
                }

                // Limpiar carrito
                clearCart();
                setLoading(false);
            } catch (error) {
                console.error('Error verifying payment:', error);
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate, clearCart]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '100px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #000',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p>Verificando tu pago...</p>
                </div>
            </div>
        );
    }

    const isSuccess = paymentStatus?.status === 'APPROVED' || paymentStatus?.method === 'alternative';

    return (
        <div style={{
            minHeight: '100vh',
            paddingTop: '100px',
            padding: '100px 5% 50px 5%',
            background: '#f9f9f9'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                background: '#fff',
                borderRadius: '20px',
                padding: '50px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                {isSuccess ? (
                    <>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#4caf50',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 30px'
                        }}>
                            <i className='bx bx-check' style={{
                                fontSize: '3rem',
                                color: '#fff'
                            }}></i>
                        </div>

                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            marginBottom: '15px'
                        }}>
                            ¡Pedido Confirmado!
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            marginBottom: '30px'
                        }}>
                            {paymentStatus?.status === 'APPROVED'
                                ? 'Tu pago ha sido procesado exitosamente.'
                                : 'Hemos recibido tu pedido correctamente.'}
                        </p>

                        <div style={{
                            background: '#f9f9f9',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '30px'
                        }}>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#888',
                                marginBottom: '10px'
                            }}>
                                Referencia de Pedido
                            </p>
                            <p style={{
                                fontSize: '1.3rem',
                                fontWeight: '900',
                                color: '#000'
                            }}>
                                {paymentStatus?.reference || searchParams.get('ref')}
                            </p>
                        </div>

                        <div style={{
                            borderTop: '1px solid #eee',
                            paddingTop: '30px',
                            marginTop: '30px'
                        }}>
                            <p style={{
                                fontSize: '0.95rem',
                                color: '#666',
                                marginBottom: '20px'
                            }}>
                                Te hemos enviado un correo de confirmación con los detalles de tu pedido.
                                Puedes seguir el estado de tu envío desde tu perfil.
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    onClick={() => navigate('/profile')}
                                    style={{
                                        padding: '15px 30px',
                                        background: '#000',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '30px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Ver Mis Pedidos
                                </button>

                                <button
                                    onClick={() => navigate('/shop')}
                                    style={{
                                        padding: '15px 30px',
                                        background: '#fff',
                                        color: '#000',
                                        border: '2px solid #000',
                                        borderRadius: '30px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Seguir Comprando
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#f44336',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 30px'
                        }}>
                            <i className='bx bx-x' style={{
                                fontSize: '3rem',
                                color: '#fff'
                            }}></i>
                        </div>

                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            marginBottom: '15px'
                        }}>
                            Pago No Completado
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            marginBottom: '30px'
                        }}>
                            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
                        </p>

                        <button
                            onClick={() => navigate('/checkout')}
                            style={{
                                padding: '15px 30px',
                                background: '#000',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '30px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Volver al Checkout
                        </button>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccessPage;
