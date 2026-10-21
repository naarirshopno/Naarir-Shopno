import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { FacebookModal } from './components/FacebookModal';
import { CustomerChatDrawer } from './components/CustomerChatDrawer';
import { FloatingActions } from './components/FloatingActions';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { Footer } from './components/Footer';

// Full Page Components (Multiple Page System)
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { DeliveryInfoPage } from './pages/DeliveryInfoPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPage } from './pages/AdminPage';
import { CategoryPage } from './pages/CategoryPage';

// Auto scroll to top on every page navigation
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
};

// URL query & hash redirect handler for deep links and admin shortcut
const NavigationHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. If someone visits with ?product=ID on home, smoothly redirect to /product/ID full page
    const params = new URLSearchParams(location.search);
    const sharedProductId = params.get('product');
    if (sharedProductId && location.pathname === '/') {
      navigate(`/product/${sharedProductId}`, { replace: true });
    }
    const sharedCategory = params.get('category');
    if (sharedCategory && location.pathname === '/') {
      navigate(`/category/${sharedCategory}`, { replace: true });
    }

    // 2. Secret Admin Access via URL hash (#admin)
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        navigate('/admin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    // 3. Admin Keyboard shortcut (Ctrl+Shift+A / Cmd+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location, navigate]);

  return null;
};

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-slate-800 font-['Hind_Siliguri',sans-serif] selection:bg-rose-600 selection:text-white relative">
      <ScrollToTop />
      <NavigationHandler />

      {/* 1. Header (Sticky & Responsive across all pages) */}
      <Header />

      {/* 2. Main Page Content (Multiple Page System) */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/track/:orderId" element={<OrderTrackingPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/delivery-info" element={<DeliveryInfoPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {/* 3. Universal Footer */}
      <Footer />

      {/* 4. Global Persistent Actions & Drawers */}
      <FloatingActions />
      <BackgroundMusicPlayer />
      <CartDrawer />
      <FacebookModal />
      <CustomerChatDrawer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ShopProvider>
  );
}
