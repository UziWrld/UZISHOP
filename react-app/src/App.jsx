import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import CollectionsPage from './pages/CollectionsPage';

import { useAuth } from './context/AuthContext';
import { useAuthController } from './hooks/useAuthController';
import { CartProvider, useCart } from './context/CartContext';
import { formatCOP } from './utils/formatters';
import './assets/css/style.css';
import './assets/css/responsive.css';
import './assets/css/cart-premium.css';
import './assets/css/checkout.css';
import './assets/css/mobile.css';

import NotFoundPage from './pages/NotFoundPage';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './components/common/LoadingScreen';

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

  const { currentUser } = useAuth();
  const { user, loading: authLoading, logout } = useAuthController();
  const { cart, removeFromCart, updateQuantity, clearCart, cartCount, totalAmount } = useCart();

  useEffect(() => {
    // Premium Splash Screen Effect over 2 seconds
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const onLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const goToPayment = () => {
    if (!currentUser) {
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
      </div>

      <Cart
        isVisible={isCartVisible}
        toggleVisible={() => setIsCartVisible(!isCartVisible)}
        onCheckout={goToPayment}
        currentUser={currentUser}
      />
      <Footer />
    </div>
  );
};

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;
