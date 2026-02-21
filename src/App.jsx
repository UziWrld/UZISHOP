import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@components/layout/Navbar.jsx';
import Cart from '@cart/components/Cart';
import Footer from '@components/layout/Footer.jsx';
import ScrollToTop from '@components/ScrollToTop.jsx';

// Pages
const HomePage = lazy(() => import('@pages/HomePage.jsx'));
const ProductPage = lazy(() => import('@pages/ProductPage.jsx'));
const AdminPage = lazy(() => import('@pages/AdminPage.jsx'));
const AuthPage = lazy(() => import('@pages/AuthPage.jsx'));
const ResetPasswordPage = lazy(() => import('@pages/ResetPasswordPage.jsx'));
const CheckoutPage = lazy(() => import('@pages/CheckoutPage.jsx'));
const ProfilePage = lazy(() => import('@pages/ProfilePage.jsx'));
const ShopPage = lazy(() => import('@pages/ShopPage.jsx'));
const OrderSuccessPage = lazy(() => import('@pages/OrderSuccessPage.jsx'));
const PaymentSuccessPage = lazy(() => import('@pages/PaymentSuccessPage.jsx'));
const CollectionsPage = lazy(() => import('@pages/CollectionsPage.jsx'));

import { useAuthController } from '@auth/hooks/useAuthController.js';
import { CartProvider, useCart } from '@cart/context/CartContext.jsx';
import { formatCOP } from '@utils/formatters.js';
import '@core/assets/css/style.css';
import '@core/assets/css/responsive.css';
import '@core/assets/css/cart-premium.css';
import '@core/assets/css/checkout.css';
import '@core/assets/css/mobile.css';

const NotFoundPage = lazy(() => import('@pages/NotFoundPage.jsx'));
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@components/common/LoadingScreen.jsx';

// Guard para rutas de Administrador
const AdminRoute = ({ children, user, loading }) => {
  if (loading) return <LoadingScreen />;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Guard para rutas Privadas (Perfil, Checkout)
const PrivateRoute = ({ children, user, loading }) => {
  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, loading: authLoading, logout } = useAuthController();
  const { cart, removeFromCart, updateQuantity, clearCart, cartCount, totalAmount } = useCart();

  useEffect(() => {
    if (!authLoading) {
      setInitialLoading(false);
    }
  }, [authLoading]);

  const onLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const goToPayment = () => {
    if (!isAuthenticated) {
      setIsCartVisible(false); // Close cart before redirecting
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cart.length > 0) {
      setIsCartVisible(false);
      navigate('/checkout');
    }
  };

  if (initialLoading || authLoading) {
    return <LoadingScreen />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/reset-password');

  return (
    <div className="App">
      <Navbar
        user={user}
        onLoginClick={() => navigate('/login')}
        onLogout={onLogout}
        onAdminClick={() => navigate('/admin')}
        cartCount={cartCount}
        onCartClick={() => setIsCartVisible(!isCartVisible)}
      />

      <div className={isAdminRoute ? 'admin-dashboard-wrapper' : (isAuthRoute ? 'auth-page-wrapper-outer' : 'main-content')}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/admin/*" element={
                <AdminRoute user={user} loading={authLoading}>
                  <AdminPage />
                </AdminRoute>
              } />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/checkout" element={
                <PrivateRoute user={user} loading={authLoading}>
                  <CheckoutPage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute user={user} loading={authLoading}>
                  <ProfilePage />
                </PrivateRoute>
              } />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      <Cart
        isVisible={isCartVisible}
        toggleVisible={() => setIsCartVisible(false)}
        onCheckout={goToPayment}
      />
      <Footer />
    </div>
  );
};

import ErrorBoundary from '@core/components/ErrorBoundary.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
