import React, { useState, useEffect } from 'react';
import { useCart } from '@cart/context/CartContext';
import { useCheckoutController } from '@checkout/hooks/useCheckoutController';
import { useNavigate } from 'react-router-dom';
import Toast from '@components/Toast';
import { useAuth } from '@auth/context/AuthContext';
import styles from '@checkout/assets/Checkout.module.css';

// Componentes modulares
import ContactForm from '@features/checkout/components/ContactForm';
import DeliveryForm from '@features/checkout/components/DeliveryForm';
import ShippingMethods from '@features/checkout/components/ShippingMethods';
import PaymentMethods from '@features/checkout/components/PaymentMethods';
import OrderSummary from '@features/checkout/components/OrderSummary';

const CheckoutPage = () => {
    const { cart } = useCart();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const { currentUser } = useAuth();
    const isAuthenticated = !!currentUser;

    const {
        formData,
        handleChange,
        shippingMethod,
        setShippingMethod,
        paymentMethod,
        setPaymentMethod,
        loading,
        totalAmount,
        discountAmount,
        shippingCost,
        finalTotal,
        couponCode,
        setCouponCode,
        applyCoupon,
        submitOrder,
        isAMB
    } = useCheckoutController();

    const taxAmount = totalAmount * 0.16;

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/');
        }
    }, [cart, navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleApplyCoupon = async () => {
        const result = await applyCoupon(couponCode);
        showToast(result.message, result.success ? 'success' : 'error');
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const result = await submitOrder();
        if (result.success) {
            showToast(`¡Pedido ${result.orderNumber} realizado con éxito!`, 'success');
            setTimeout(() => {
                navigate('/order-success', { state: { orderNumber: result.orderNumber } });
            }, 1000);
        } else {
            showToast(result.message, 'error');
        }
    };

    return (
        <div className={styles.checkoutPageWrapper}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className={styles.checkoutMainArea}>
                <h1 style={{ marginBottom: '40px', fontWeight: '900', fontSize: '1.5rem', color: '#000' }}>UZI WRD®</h1>

                <form onSubmit={handleSubmit}>
                    <ContactForm
                        formData={formData}
                        handleChange={handleChange}
                        isAuthenticated={isAuthenticated}
                    />

                    <DeliveryForm
                        formData={formData}
                        handleChange={handleChange}
                    />

                    <ShippingMethods
                        shippingMethod={shippingMethod}
                        setShippingMethod={setShippingMethod}
                        totalAmount={totalAmount}
                        isAMB={isAMB}
                        city={formData.city}
                    />

                    <PaymentMethods
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.checkoutSubmitBtn}
                    >
                        {loading ? 'PROCESANDO...' : 'FINALIZAR PEDIDO'}
                    </button>
                </form>
            </div>

            <OrderSummary
                cart={cart}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                handleApplyCoupon={handleApplyCoupon}
                discount={discountAmount}
                subtotal={totalAmount}
                shippingCost={shippingCost}
                total={finalTotal}
                processing={loading}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default CheckoutPage;
