import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { 
  Phone, 
  Search, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Menu, 
  X, 
  MessageCircle, 
  Settings,
  ChevronDown, 
  Clock, 
  Calendar, 
  Heart, 
  Lock, 
  Sparkles, 
  User,
  Tag,
  TrendingUp,
  ArrowRight,
  SearchX
} from 'lucide-react';

const LiveClockBadge: React.FC<{ isMobile?: boolean }> = React.memo(({ isMobile }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [useBengaliDigits, setUseBengaliDigits] = useState(true);

  // Live real-time clock updating isolated to this badge only
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Bengali numerals converter
  const toBengaliNumber = (num: number | string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
  };

  const bengaliDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const bengaliMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const dayIndex = currentTime.getDay();
  const dayNameBn = bengaliDays[dayIndex];
  const dayNameEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];

  const dateVal = currentTime.getDate();
  const monthIndex = currentTime.getMonth();
  const yearVal = currentTime.getFullYear();

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const isPM = hours >= 12;
  const hours12 = hours % 12 || 12;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  const dateStr = useBengaliDigits 
    ? `${toBengaliNumber(dateVal)} ${bengaliMonths[monthIndex]} ${toBengaliNumber(yearVal)}`
    : `${dateVal} ${currentTime.toLocaleString('en-US', { month: 'short' })} ${yearVal}`;

  const timeStr = useBengaliDigits
    ? `${toBengaliNumber(padZero(hours12))}:${toBengaliNumber(padZero(minutes))}:${toBengaliNumber(padZero(seconds))} ${isPM ? 'PM' : 'AM'}`
    : `${padZero(hours12)}:${padZero(minutes)}:${padZero(seconds)} ${isPM ? 'PM' : 'AM'}`;

  const dayName = useBengaliDigits ? dayNameBn : dayNameEn;

  if (isMobile) {
    return (
      <div 
        onClick={() => setUseBengaliDigits(!useBengaliDigits)}
        title="বর্তমান লাইভ তারিখ ও সময় (ক্লিক করে বাংলা/ইংরেজি পরিবর্তন করুন)"
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-slate-800 bg-rose-50 border border-rose-200/80 shadow-xs cursor-pointer select-none text-center active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs inline-block"></span>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
            লাইভ
          </span>
        </div>
        <span className="text-rose-300">|</span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800 font-['Hind_Siliguri'] shrink-0">
          <Calendar className="w-3 h-3 text-rose-600 shrink-0" />
          <span>{dayName}, {dateStr}</span>
        </div>
        <span className="text-rose-300">|</span>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 font-mono tracking-tight shrink-0">
          <Clock className="w-3 h-3 text-rose-600 shrink-0" />
          <span className="tabular-nums">{timeStr}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setUseBengaliDigits(!useBengaliDigits)}
      title="বর্তমান লাইভ তারিখ ও সময় (ক্লিক করে বাংলা/ইংরেজি পরিবর্তন করুন)"
      className="hidden sm:inline-flex group items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 hover:text-slate-900 transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs inline-block"></span>
        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider hidden sm:inline">
          লাইভ
        </span>
      </div>
      <span className="text-rose-300 hidden sm:inline">|</span>
      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-rose-800 font-['Hind_Siliguri']">
        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
        <span className="hidden md:inline">{dayName}, </span>
        <span>{dateStr}</span>
      </div>
      <span className="text-rose-300">|</span>
      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-slate-800 font-mono tracking-tight">
        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
        <span className="tabular-nums">{timeStr}</span>
      </div>
    </div>
  );
});

export const Header: React.FC = () => {
  const { 
    products,
    settings, 
    cart, 
    getCartCount, 
    getCartSubtotal, 
    setIsCartOpen, 
    setIsOrderTrackingOpen, 
    setIsFacebookModalOpen,
    setIsCustomerChatOpen,
    setIsAdminOpen,
    setIsMobileSimulatorOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    getWishlistCount,
    activeCategory, 
    setActiveCategory,
    searchQuery, 
    setSearchQuery
  } = useShop();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Close search popovers on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setIsDesktopSearchOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDesktopSearchOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic categories synced directly from Admin Panel (settings.categories)
  const categoryItems = Array.isArray(settings.categories) && settings.categories.length > 0
    ? settings.categories
    : DEFAULT_CATEGORIES;

  const categories: { id: CategoryType; label: string; image?: string }[] = [
    { id: 'all', label: 'সব কালেকশন' },
    ...categoryItems.map((cat) => ({
      id: cat.id as CategoryType,
      label: cat.title,
      image: settings.categoryImages?.[cat.id] || cat.image,
    })),
  ];

  // Real-time matched products & categories as user types
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchedCategories = useMemo(() => {
    if (!trimmedQuery) return [];
    return categories.filter(c => 
      c.id !== 'all' && (
        c.label.toLowerCase().includes(trimmedQuery) ||
        c.id.toLowerCase().includes(trimmedQuery)
      )
    );
  }, [categories, trimmedQuery]);

  const matchedProducts = useMemo(() => {
    if (!trimmedQuery) return [];
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const bengaliName = (p.bengaliName || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const catBn = (p.categoryBengali || '').toLowerCase();
      const fabric = (p.fabric || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();

      return (
        name.includes(trimmedQuery) ||
        bengaliName.includes(trimmedQuery) ||
        cat.includes(trimmedQuery) ||
        catBn.includes(trimmedQuery) ||
        fabric.includes(trimmedQuery) ||
        desc.includes(trimmedQuery)
      );
    });
  }, [products, trimmedQuery]);

  const popularSearches = [
    { label: 'থ্রি-পিস', category: 'three_piece' },
    { label: 'কাতান শাড়ি', category: 'saree' },
    { label: 'কুর্তি কালেকশন', category: 'kurti' },
    { label: 'জর্জেট গাউন', category: 'gown' },
    { label: 'ব্রাইডাল লেহেঙ্গা', category: 'lehenga' },
    { label: 'মাদার ব্রেস্টফিডিং ব্রা', query: 'ব্রা' },
    { label: 'সুতি পোশাক', query: 'সুতি' },
  ];

  // Reusable real-time search dropdown component
  const renderSearchDropdown = (closeDropdown: () => void) => (
    <div className="absolute left-0 right-0 top-full mt-2 bg-white/98 backdrop-blur-md rounded-2xl border border-rose-200 shadow-2xl z-50 overflow-hidden animate-scaleUp divide-y divide-rose-50 max-h-[75vh] overflow-y-auto">
      {!trimmedQuery ? (
        /* Empty Query State: Popular searches & quick categories */
        <div className="p-3.5 sm:p-4 space-y-3 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            <span>জনপ্রিয় সার্চ ও কিওয়ার্ড</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {popularSearches.map((ps, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(ps.label);
                  closeDropdown();
                  if (location.pathname !== '/') navigate('/');
                }}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-rose-50/70 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200/80 transition cursor-pointer"
              >
                <Search className="w-3 h-3 text-rose-500" />
                <span>{ps.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Categories Bar */}
          <div className="pt-2.5 border-t border-rose-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ক্যাটাগরি ব্রাউজ করুন
              </span>
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  navigate('/categories');
                }}
                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
              >
                সকল ({categories.length - 1} টি)
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {categories.filter(c => c.id !== 'all').slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    closeDropdown();
                    navigate(`/category/${cat.id}`);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition text-left cursor-pointer group"
                >
                  {cat.image && (
                    <img 
                      src={cat.image} 
                      alt="" 
                      className="w-5 h-5 rounded-md object-cover shrink-0 border border-rose-100" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-700 truncate">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Real-time Typed Query Results */
        <div className="text-left">
          {/* Header Summary */}
          <div className="px-3.5 sm:px-4 py-2 bg-rose-50/80 flex items-center justify-between text-xs font-bold text-slate-700 border-b border-rose-100">
            <span className="flex items-center gap-1.5 truncate">
              <Search className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">‘{searchQuery}’ দিয়ে খোঁজা হচ্ছে</span>
            </span>
            <span className="text-[11px] bg-rose-200/80 text-rose-800 px-2.5 py-0.5 rounded-full font-mono shrink-0">
              {matchedProducts.length} টি পণ্য
            </span>
          </div>

          {/* Matched Categories (if any) */}
          {matchedCategories.length > 0 && (
            <div className="p-2.5 sm:p-3 bg-amber-50/50 border-b border-amber-100/70 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-600" />
                <span>সম্পর্কিত ক্যাটাগরি:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchedCategories.map((cat) => {
                  const catCount = products.filter(p => p.category === cat.id || p.categoryBengali === cat.label).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        closeDropdown();
                        navigate(`/category/${cat.id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 hover:text-amber-950 border border-amber-200 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      {cat.image && (
                        <img src={cat.image} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                      )}
                      <span>{cat.label}</span>
                      <span className="text-[10px] text-amber-700 font-normal">({catCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Products List (Live real-time preview) */}
          {matchedProducts.length > 0 ? (
            <div className="divide-y divide-rose-50 max-h-72 overflow-y-auto">
              {matchedProducts.slice(0, 6).map((product) => {
                const prodImg = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      closeDropdown();
                      navigate(`/product/${product.id}`);
                    }}
                    className="p-2.5 sm:p-3 hover:bg-rose-50/60 flex items-center justify-between gap-3 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <img
                        src={prodImg}
                        alt={product.bengaliName}
                        className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl object-cover border border-rose-100 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition truncate font-['Hind_Siliguri']">
                          {product.bengaliName}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          <span className="text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                            {product.categoryBengali || product.category}
                          </span>
                          {product.fabric && (
                            <span className="text-slate-500 hidden sm:inline">
                              ফেব্রিক: {product.fabric}
                            </span>
                          )}
                          {product.inStock ? (
                            <span className="text-emerald-700 font-semibold">● স্টকে আছে</span>
                          ) : (
                            <span className="text-red-600 font-semibold">● স্টক আউট</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-black text-rose-700 font-['Outfit']">
                        ৳{product.price.toLocaleString()}
                      </p>
                      {product.regularPrice > product.price && (
                        <p className="text-[10px] text-slate-400 line-through font-['Outfit']">
                          ৳{product.regularPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* No Results Found State */
            <div className="p-6 text-center space-y-2">
              <SearchX className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                ‘{searchQuery}’ দিয়ে কোনো পণ্য পাওয়া যায়নি
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                বানান সঠিক আছে কি না পরীক্ষা করুন অথবা অন্য কোনো পোশাক বা ক্যাটাগরি সার্চ করুন।
              </p>
            </div>
          )}

          {/* View All Matching Products in Catalog Button */}
          {matchedProducts.length > 0 && (
            <div className="p-2 sm:p-2.5 bg-rose-50/50 text-center border-t border-rose-100">
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  if (location.pathname !== '/') navigate('/');
                  setTimeout(() => {
                    const catalogEl = document.getElementById('product-catalog-section');
                    if (catalogEl) {
                      catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>সকল {matchedProducts.length} টি ফলাফল দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full bg-white/98 border-b border-rose-100 shadow-xs transition-colors">
      {/* Main Bar */}
      <div className="relative border-b border-rose-100/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5 w-full max-w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
          {/* Brand Logo & Name */}
          <Link 
            to="/"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-rose-500 shadow-md group-hover:scale-105 transition-transform shrink-0 bg-white">
              <img 
                src="/logo.jpg" 
                alt="নারীর স্বপ্ন লোগো" 
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // fallback to icon if missing
                  e.currentTarget.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-rose-700 font-['Hind_Siliguri'] leading-none sm:leading-tight">
                  নারীর স্বপ্ন
                </h1>
                <span className="hidden md:inline-block text-rose-600/90 text-[11px] font-semibold tracking-wide uppercase">
                  Women's Fashion
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-rose-500 italic font-medium leading-tight">
                Dress Your Dreams
              </p>
            </div>
          </Link>

          {/* Center Area: Live Date & Time + Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4 flex flex-col items-center justify-center gap-1.5 py-0.5 min-w-0">
            {/* Live Date & Time Display Badge (Desktop & Tablet) */}
            <LiveClockBadge />

            {/* Search Bar - Center Desktop */}
            <div className="hidden lg:flex w-full relative" ref={desktopSearchRef}>
              <div className="relative w-full">
                <input
                  id="input-desktop-search"
                  type="text"
                  placeholder="থ্রি-পিস, শাড়ি, কুর্তি, গাউন বা প্রোডাক্ট সার্চ করুন..."
                  value={searchQuery}
                  onFocus={() => setIsDesktopSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDesktopSearchOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsDesktopSearchOpen(false);
                      if (location.pathname !== '/') navigate('/');
                    }
                  }}
                  className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-rose-50/60 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
                />
                <Search className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsDesktopSearchOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Real-time search dropdown results popover */}
                {isDesktopSearchOpen && renderSearchDropdown(() => setIsDesktopSearchOpen(false))}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Track Order Direct Button (Desktop) */}
            <button
              id="btn-track-header"
              onClick={() => navigate('/track')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all border border-slate-200 hover:border-rose-300 cursor-pointer"
              title="অর্ডার ট্র্যাক করুন"
            >
              <Truck className="w-3.5 h-3.5 text-rose-600" />
              <span>অর্ডার ট্র্যাক</span>
            </button>

            {/* User Profile & Order History Button */}
            <button
              id="btn-profile-header"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all border border-slate-200 hover:border-rose-300 cursor-pointer"
              title="গ্রাহক প্রোফাইল ও অর্ডার হিস্টোরি"
              aria-label="গ্রাহক প্রোফাইল ও অর্ডার হিস্টোরি"
            >
              <User className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">প্রোফাইল</span>
            </button>

            {/* Wishlist Button with Saved Items Count */}
            <button
              id="btn-wishlist-header"
              onClick={() => navigate('/wishlist')}
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all group flex items-center justify-center cursor-pointer"
              title="পছন্দের তালিকা (উইশলিস্ট)"
              aria-label="পছন্দের তালিকা (উইশলিস্ট)"
            >
              <Heart 
                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  getWishlistCount() > 0 ? 'text-rose-600 fill-rose-500' : 'text-slate-700 group-hover:text-rose-600'
                }`} 
              />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {getWishlistCount()}
                </span>
              )}
            </button>

            {/* Admin Panel Direct Access Button */}
            <button
              id="btn-admin-header"
              onClick={() => navigate('/admin')}
              className="p-2 text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all group flex items-center justify-center cursor-pointer"
              title="এডমিন প্যানেল (মালিকের লগইন ও প্রোডাক্ট যোগ)"
              aria-label="এডমিন প্যানেল"
            >
              <ShieldCheck className="w-5 h-5 text-slate-600 group-hover:text-rose-600 transition-colors" />
            </button>

            {/* Cart Drawer Trigger */}
            <button
              id="btn-cart-header"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 sm:px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                    {getCartCount()}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold font-['Outfit']">
                ৳{getCartSubtotal().toLocaleString()}
              </span>
            </button>

            {/* Menu Drawer Toggle Button with SVG */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1 p-1.5 sm:p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-100/50 rounded-lg transition-colors"
              title="ক্যাটাগরি ও মেনু"
              aria-label="ক্যাটাগরি ও মেনু"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              <span className="text-xs font-bold text-rose-700 hidden sm:inline">ক্যাটাগরি</span>
            </button>
          </div>
        </div>

        {/* Mobile Centered Live Date & Time Display Badge */}
        <div className="flex sm:hidden justify-center items-center mt-2 mb-1 w-full">
          <LiveClockBadge isMobile />
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 lg:hidden relative" ref={mobileSearchRef}>
          <div className="relative w-full">
            <input
              id="input-mobile-search"
              type="text"
              placeholder="থ্রি-পিস, শাড়ি, কুর্তি সার্চ করুন..."
              value={searchQuery}
              onFocus={() => setIsMobileSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsMobileSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsMobileSearchOpen(false);
                  if (location.pathname !== '/') navigate('/');
                }
              }}
              className="w-full pl-9 pr-16 py-2 text-xs bg-rose-50/60 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsMobileSearchOpen(true);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile real-time search dropdown results popover */}
            {isMobileSearchOpen && renderSearchDropdown(() => setIsMobileSearchOpen(false))}
          </div>
        </div>
      </div>
      </div>

      {/* Desktop Quick Category Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-rose-50/80 border-b border-rose-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              ক্যাটাগরি:
            </span>
            {categories.map((cat) => {
              const isActive = location.pathname === `/category/${cat.id}` || (cat.id === 'all' && (location.pathname === '/' || location.pathname === '/category/all'));
              return (
                <button
                  key={`desktop-bar-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    navigate(`/category/${cat.id}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-rose-600 text-white shadow-xs scale-102 ring-2 ring-rose-300' 
                      : 'text-slate-700 hover:text-rose-700 hover:bg-rose-100/70'
                  }`}
                >
                  {cat.image && (
                    <img 
                      src={cat.image} 
                      alt="" 
                      className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-rose-200"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>নতুন স্টক লাইভ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Drawer Menu with Categories Navigation inside the SVG Menu */}
      {mobileMenuOpen && (
        <div className="bg-white border-b border-rose-200 shadow-2xl px-4 py-4 space-y-4 animate-fadeIn">
          {/* Category Navigation (<nav>) inside the SVG menu */}
          <nav className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                প্রোডাক্ট ক্যাটাগরি সমূহ
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {categories.length} টি ক্যাটাগরি
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {categories.map((cat) => {
                const isActive = location.pathname === `/category/${cat.id}` || (cat.id === 'all' && (location.pathname === '/' || location.pathname === '/category/all')) || activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`cat-nav-${cat.id}`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setMobileMenuOpen(false);
                      navigate(`/category/${cat.id}`);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-200 scale-102 ring-2 ring-rose-400'
                        : 'bg-rose-50/60 text-slate-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100'
                    }`}
                  >
                    {cat.image && (
                      <img 
                        src={cat.image} 
                        alt="" 
                        className="w-4 h-4 rounded-full object-cover shrink-0 border border-rose-200" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Quick Menu Links */}
          <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
            <button
              id="btn-mobile-drawer-profile"
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-rose-600" />
                <span>আমার প্রোফাইল ও অর্ডার হিস্টোরি</span>
              </div>
              <span className="text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-full border border-rose-200">
                অর্ডার দেখুন
              </span>
            </button>

            <button
              id="btn-mobile-drawer-wishlist"
              onClick={() => {
                navigate('/wishlist');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50/70 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />
                <span>পছন্দের তালিকা (উইশলিস্ট)</span>
              </div>
              <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {getWishlistCount()} টি
              </span>
            </button>

            <button
              onClick={() => {
                navigate('/track');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-rose-600" />
              <span>আপনার অর্ডার ট্র্যাক করুন</span>
            </button>

            <button
              onClick={() => {
                setIsFacebookModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50/60 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-blue-600" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>ফেসবুক পেজ ও অফিশিয়াল লিংক</span>
            </button>

            <button
              onClick={() => {
                setIsCustomerChatOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-rose-600" />
              <span>সরাসরি মেসেজ পাঠান</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              <p className="font-semibold text-rose-700 text-xs">কাস্টমার সাপোর্ট (সরাসরি ফোন):</p>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <a href={`tel:${settings.hotline1 || '09617-541717'}`} className="font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 font-mono text-sm">
                  📞 {settings.hotline1 || '09617-541717'}
                </a>
                {settings.supportHours && settings.supportHours.trim() ? (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {settings.supportHours}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Quick Admin Access */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/admin');
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg px-2 py-1 transition cursor-pointer"
              title="এডমিন লগইন"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>এডমিন</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
