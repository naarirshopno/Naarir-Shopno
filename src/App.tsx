import React, { useMemo, useEffect, useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { DEFAULT_CATEGORIES } from './data/initialData';
import { CustomCategoryItem } from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { WelcomeStorySection } from './components/WelcomeStorySection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductToolbar } from './components/ProductToolbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { FacebookModal } from './components/FacebookModal';
import { CustomerChatDrawer } from './components/CustomerChatDrawer';
import { DeliveryInfoModal } from './components/DeliveryInfoModal';
import { AdminPanel } from './components/AdminPanel';
import { WishlistModal } from './components/WishlistModal';
import { FloatingActions } from './components/FloatingActions';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { RecentlyViewedSection } from './components/RecentlyViewedSection';
import { Footer } from './components/Footer';
import { 
  Sparkles, 
  RotateCcw, 
  ShoppingBag, 
  SearchX, 
  Truck, 
  Phone, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Heart,
  Loader2,
  ArrowDownCircle,
  CheckCircle2
} from 'lucide-react';

const StorefrontContent: React.FC = () => {
  const { 
    products, 
    activeCategory, 
    setActiveCategory,
    searchQuery, 
    setSearchQuery,
    sortBy, 
    priceRange, 
    resetFilters,
    setIsOrderTrackingOpen,
    setIsDeliveryInfoOpen,
    setIsFacebookModalOpen,
    setIsAdminOpen,
    settings
  } = useShop();

  // Secret Admin Access via URL hash (#admin) or keyboard shortcut (Ctrl+Shift+A / Cmd+Shift+A)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsAdminOpen]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'all') {
      const targetCat = (Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES).find((c: CustomCategoryItem) => c.id === activeCategory);
      result = result.filter((p) => 
        p.category === activeCategory || 
        (targetCat && (p.categoryBengali === targetCat.title || p.category === targetCat.title))
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        p.bengaliName.toLowerCase().includes(q) ||
        p.categoryBengali.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Price range filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    if (sortBy === 'price_asc' || sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc' || sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'default' || sortBy === 'popular' || sortBy === 'featured') {
      // জনপ্রিয় / ফিচারড sort:
      // ১. ফিচারড প্রোডাক্টগুলো সবার আগে (featured === true)
      // ২. ট্রেন্ডিং পোশাকগুলো পরবর্তীতে (isTrending === true)
      // ৩. এরপর সর্বোচ্চ রেটিং এবং রিভিউয়ের ভিত্তিতে
      result.sort((a, b) => {
        const scoreA = (a.featured ? 100 : 0) + (a.isTrending ? 50 : 0) + ((a.rating || 4.5) * 10) + (a.reviewsCount || 0);
        const scoreB = (b.featured ? 100 : 0) + (b.isTrending ? 50 : 0) + ((b.rating || 4.5) * 10) + (b.reviewsCount || 0);
        return scoreB - scoreA;
      });
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy, priceRange]);

  // Featured / New Arrivals subset
  const newArrivals = useMemo(() => {
    return products.filter((p) => p.isNew).slice(0, 4);
  }, [products]);

  // Load More Pagination (৮টি করে পণ্য আসবে, এরপর Load More বাটনে ক্লিকে পরবর্তী পণ্যগুলো লোড হবে)
  const PRODUCTS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState<number>(PRODUCTS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset pagination count when category, search, or filters change
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [activeCategory, searchQuery, sortBy, priceRange]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
      setIsLoadingMore(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] flex flex-col font-['Outfit'] selection:bg-rose-500 selection:text-white pb-16 sm:pb-16 w-full">
      
      {/* 0 & 1. Sticky Navigation Header */}
      <div className="sticky top-0 z-50 w-full shadow-md">
        <Header />
      </div>

      {/* 2. Hero Banner Showcase with live CTAs */}
      <HeroBanner />

      {/* 2.5. Official Brand Welcome & Introduction */}
      <WelcomeStorySection />

      {/* 3. Category Filter Showcase Bar */}
      <CategoryShowcase />

      {/* 4. Quick Delivery & Trust Notification Strip */}
      <section className="bg-rose-50/70 border-y border-rose-100 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              ঢাকা সিটিতে ডেলিভারি চার্জ মাত্র <strong>৳{settings.deliveryCharges.insideDhaka}</strong>, সারাদেশে <strong>৳{settings.deliveryCharges.outsideDhaka}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDeliveryInfoOpen(true)}
              className="text-rose-700 hover:text-rose-800 font-bold underline flex items-center gap-0.5 text-xs"
            >
              <span>ডেলিভারি পলিসি ও চার্জ বিবরণী</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="text-slate-700 hover:text-rose-600 font-bold flex items-center gap-1 text-xs"
            >
              <span>পার্সেল ট্র্যাক করুন</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Main Product Catalog Section */}
      <main id="products-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Product Toolbar: Search Bar, Category Dropdown, Price Sorting, Price Slider */}
        <ProductToolbar totalCount={filteredProducts.length} />

        {/* Product Grid / Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-fadeIn">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button & Catalog Progress Bar */}
            {filteredProducts.length > PRODUCTS_PER_PAGE && (
              <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-3.5">
                {/* Visual Progress Indicator */}
                <div className="w-full max-w-xs space-y-1.5 text-center">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>প্রদর্শিত হচ্ছে</span>
                    <span className="font-bold text-slate-800">
                      {displayedProducts.length} / {filteredProducts.length} টি পোশাক
                    </span>
                  </div>
                  <div className="w-full bg-rose-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (displayedProducts.length / filteredProducts.length) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Load More Button or Finished Notification */}
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 shadow-md hover:shadow-xl active:scale-95 transition-all disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>নতুন পণ্য লোড হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-200 group-hover:translate-y-0.5 transition-transform" />
                        <span>আরও পণ্য দেখুন (বাকি {filteredProducts.length - displayedProducts.length}টি)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>সকল {filteredProducts.length}টি চমৎকার কালেকশন প্রদর্শিত হয়েছে</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-rose-100 shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            {products.length === 0 ? (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">
                  <span>🌸 নারীর স্বপ্ন এক্সক্লুসিভ কালেকশন</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
                  নতুন কালেকশন শীঘ্রই আসছে!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                  আমাদের প্রিমিয়াম ডিজাইনার পোশাকগুলোর নতুন কালেকশন খুব শীঘ্রই যুক্ত করা হচ্ছে। আকর্ষণীয় সব অফার ও আপডেটের জন্য আমাদের সাথে থাকুন।
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                    কোনো পোশাক খুঁজে পাওয়া যায়নি
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার দেওয়া ফিল্টার বা সার্চ কিওয়ার্ডের সাথে মেলে এমন কোনো পণ্য পাওয়া যায়নি।
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ফিল্টার রিসেট করুন</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Recently Viewed Products Section */}
        <RecentlyViewedSection />

        {/* Promotional Special Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-900 via-pink-900 to-rose-950 p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="bg-white/20 backdrop-blur-sm text-pink-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              সোশ্যাল মিডিয়া এক্সক্লুসিভ অফার
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-['Hind_Siliguri'] leading-tight">
              আমাদের ফেসবুক পেজে যুক্ত হয়ে পান আকর্ষণীয় গিফট ও ডিসকাউন্ট ভাউচার!
            </h3>
            <p className="text-xs sm:text-sm text-pink-100">
              নিয়মিত লাইভ ভিডিওতে নতুন কালেকশন প্রদর্শন এবং কাস্টমারদের জন্য বিশেষ সারপ্রাইজ অফার থাকে আমাদের অফিসিয়াল ফেসবুক পেজে।
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsFacebookModalOpen(true)}
                className="bg-white hover:bg-rose-50 text-rose-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>ফেসবুক পেজ ভিজিট করুন</span>
              </button>

              <a
                href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
                className="bg-rose-800/80 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-rose-700 transition flex items-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4 text-emerald-300" />
                <span>সরাসরি ফোন সাপোর্ট: {settings.hotline1 || '09617-541717'}</span>
              </a>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
            <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 C30,40 70,60 100,100 L100,0 Z"></path>
            </svg>
          </div>
        </div>

      </main>

      {/* 6. Footer */}
      <Footer />

      {/* 7. Floating Action Icons (Facebook Modal Button, Order Tracking, Chat, Scroll Top) */}
      <FloatingActions />
      <BackgroundMusicPlayer />

      {/* 8. Modals & Overlays */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <FacebookModal />
      <CustomerChatDrawer />
      <DeliveryInfoModal />
      <AdminPanel />
      <WishlistModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <StorefrontContent />
    </ShopProvider>
  );
}
