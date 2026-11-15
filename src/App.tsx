import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ShopProvider } from './context/ShopContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { FacebookModal } from './components/FacebookModal';
import { CustomerChatDrawer } from './components/CustomerChatDrawer';
import { FloatingActions } from './components/FloatingActions';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { Footer } from './components/Footer';
import { OrderSuccessModal } from './components/OrderSuccessModal';

// Full Page Components (Multiple Page System)
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { DeliveryInfoPage } from './pages/DeliveryInfoPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPage } from './pages/AdminPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProfilePage } from './pages/ProfilePage';

// Auto scroll to top on every page navigation
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
};

const VISIT_COLOR_PALETTES: {
  border: [string, string, string, string];
  bg: [string, string, string, string];
  page: [string, string, string, string];
}[] = [
  {
    border: ['#e11d48', '#f59e0b', '#10b981', '#8b5cf6'],
    bg: ['#ffe4e6', '#fef3c7', '#d1fae5', '#ede9fe'],
    page: ['#fff1f2', '#fef9c3', '#ecfdf5', '#f3e8ff'],
  },
  {
    border: ['#059669', '#06b6d4', '#6366f1', '#ec4899'],
    bg: ['#d1fae5', '#cffafe', '#e0e7ff', '#fce7f3'],
    page: ['#ecfdf5', '#ecfeff', '#eef2ff', '#fdf2f8'],
  },
  {
    border: ['#7c3aed', '#d946ef', '#f43f5e', '#f59e0b'],
    bg: ['#ede9fe', '#fae8ff', '#ffe4e6', '#fef3c7'],
    page: ['#f5f3ff', '#fdf4ff', '#fff1f2', '#fffbeb'],
  },
  {
    border: ['#2563eb', '#14b8a6', '#84cc16', '#e11d48'],
    bg: ['#dbeafe', '#ccfbf1', '#ecfccb', '#ffe4e6'],
    page: ['#eff6ff', '#f0fdfa', '#f7fee7', '#fff1f2'],
  },
  {
    border: ['#f97316', '#eab308', '#a855f7', '#0ea5e9'],
    bg: ['#ffedd5', '#fef9c3', '#f3e8ff', '#e0f2fe'],
    page: ['#fff7ed', '#fefce8', '#faf5ff', '#f0f9ff'],
  },
  {
    border: ['#be123c', '#c026d3', '#0891b2', '#d97706'],
    bg: ['#ffe4e6', '#fae8ff', '#cffafe', '#fef3c7'],
    page: ['#fdf2f8', '#faf5ff', '#ecfeff', '#fffbeb'],
  },
];

// URL query & hash redirect handler for deep links and admin shortcut
const NavigationHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const prevCount = Number(localStorage.getItem('naarir_shopno_visit_count') || '0');
      const nextCount = Number.isFinite(prevCount) ? prevCount + 1 : 1;
      localStorage.setItem('naarir_shopno_visit_count', String(nextCount));
      const routeOffset = location.pathname
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const palette = VISIT_COLOR_PALETTES[(nextCount + routeOffset) % VISIT_COLOR_PALETTES.length];
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--visit-c1', palette.border[0]);
      rootStyle.setProperty('--visit-c2', palette.border[1]);
      rootStyle.setProperty('--visit-c3', palette.border[2]);
      rootStyle.setProperty('--visit-c4', palette.border[3]);
      rootStyle.setProperty('--visit-bg1', palette.bg[0]);
      rootStyle.setProperty('--visit-bg2', palette.bg[1]);
      rootStyle.setProperty('--visit-bg3', palette.bg[2]);
      rootStyle.setProperty('--visit-bg4', palette.bg[3]);
      rootStyle.setProperty('--page-c1', palette.page[0]);
      rootStyle.setProperty('--page-c2', palette.page[1]);
      rootStyle.setProperty('--page-c3', palette.page[2]);
      rootStyle.setProperty('--page-c4', palette.page[3]);
    } catch {
      // ignore storage errors
    }
  }, [location.pathname]);

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
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen overflow-x-clip flex flex-col font-['Hind_Siliguri',sans-serif] selection:bg-rose-600 selection:text-white relative ${isAdminRoute ? 'bg-slate-900 text-slate-100' : 'full-page-slow-color text-slate-800'}`}>
      <ScrollToTop />
      <NavigationHandler />

      {/* 1. Store Header - Hidden on Admin Page so Admin is a dedicated full-page system */}
      {!isAdminRoute && <Header />}

      {/* 2. Main Page Content (Multiple Page System) */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/my-orders" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {/* 3. Universal Store Footer - Hidden on Admin Page */}
      {!isAdminRoute && <Footer />}

      {/* 4. Global Persistent Actions & Drawers - Hidden on Admin Page */}
      {!isAdminRoute && (
        <>
          <FloatingActions />
          <BackgroundMusicPlayer />
          <CartDrawer />
          <FacebookModal />
          <CustomerChatDrawer />
        </>
      )}

      {/* 5. Order Success Confirmation Modal */}
      <OrderSuccessModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ShopProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ShopProvider>
    </LanguageProvider>
  );
}
