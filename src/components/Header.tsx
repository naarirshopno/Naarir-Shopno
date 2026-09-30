import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
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
  Lock
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [useBengaliDigits, setUseBengaliDigits] = useState(true);

  // Live real-time clock updating every 1000ms
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

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'সব কালেকশন' },
    { id: 'three_piece', label: 'থ্রি-পিস' },
    { id: 'saree', label: 'শাড়ি' },
    { id: 'kurti', label: 'কুর্তি' },
    { id: 'gown', label: 'পার্টি গাউন' },
    { id: 'hijab_abaya', label: 'হিজাব ও আবায়া' },
    { id: 'lehenga', label: 'লেহেঙ্গা' },
    { id: 'jewellery_bags', label: 'জুয়েলারি ও ব্যাগ' },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-rose-100 transition-all">
      {/* Main Bar with Subtle Boutique Background Image (২০% অপাসিটি) */}
      <div className="relative overflow-hidden border-b border-rose-100/70">
        {/* Boutique Background Image - 20% opacity */}
        <div 
          className="absolute inset-0 pointer-events-none select-none bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url('/hero-banner.jpg')` }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5 w-full max-w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
          {/* Brand Logo & Name */}
          <div 
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
                className="w-full h-full object-cover scale-115 object-center"
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
          </div>

          {/* Center Area: Live Date & Time + Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4 flex flex-col items-center justify-center gap-1.5 py-0.5 min-w-0">
            {/* Live Date & Time Display Badge (Desktop & Tablet) */}
            <div 
              onClick={() => setUseBengaliDigits(!useBengaliDigits)}
              title="বর্তমান লাইভ তারিখ ও সময় (ক্লিক করে বাংলা/ইংরেজি পরিবর্তন করুন)"
              className="hidden sm:inline-flex group items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 hover:text-slate-900 transition-all duration-200 cursor-pointer select-none"
            >
              {/* Pulsing Live indicator */}
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider hidden sm:inline">
                  লাইভ
                </span>
              </div>

              <span className="text-rose-300 hidden sm:inline">|</span>

              {/* Date */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-rose-800 font-['Hind_Siliguri']">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
                <span className="hidden md:inline">{dayName}, </span>
                <span>{dateStr}</span>
              </div>

              <span className="text-rose-300">|</span>

              {/* Clock / Time */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-slate-800 font-mono tracking-tight">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0 animate-pulse" />
                <span className="tabular-nums">{timeStr}</span>
              </div>
            </div>

            {/* Search Bar - Center Desktop */}
            <div className="hidden lg:flex w-full">
              <div className="relative w-full">
                <input
                  id="input-desktop-search"
                  type="text"
                  placeholder="থ্রি-পিস, শাড়ি, কুর্তি, গাউন বা প্রোডাক্ট সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-1.5 text-xs sm:text-sm bg-rose-50/50 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
                />
                <Search className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist Button with Saved Items Count */}
            <button
              id="btn-wishlist-header"
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all group flex items-center justify-center"
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
              onClick={() => setIsAdminOpen(true)}
              className="p-2 text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all group flex items-center justify-center"
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
          <div 
            onClick={() => setUseBengaliDigits(!useBengaliDigits)}
            title="বর্তমান লাইভ তারিখ ও সময় (ক্লিক করে বাংলা/ইংরেজি পরিবর্তন করুন)"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-slate-800 bg-rose-50/90 border border-rose-200/80 shadow-xs cursor-pointer select-none text-center active:scale-95 transition-transform"
          >
            {/* Live Pulsing Dot */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                লাইভ
              </span>
            </div>

            <span className="text-rose-300">|</span>

            {/* Date */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800 font-['Hind_Siliguri'] shrink-0">
              <Calendar className="w-3 h-3 text-rose-600 shrink-0" />
              <span>{dayName}, {dateStr}</span>
            </div>

            <span className="text-rose-300">|</span>

            {/* Live Clock / Time */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 font-mono tracking-tight shrink-0">
              <Clock className="w-3 h-3 text-rose-600 shrink-0 animate-pulse" />
              <span className="tabular-nums">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 lg:hidden">
          <div className="relative w-full">
            <input
              id="input-mobile-search"
              type="text"
              placeholder="থ্রি-পিস, শাড়ি, কুর্তি সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs bg-rose-50/60 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
            />
            <Search className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-nav-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    activeCategory === cat.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-200 scale-102 ring-2 ring-rose-400'
                      : 'bg-rose-50/60 text-slate-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Quick Menu Links */}
          <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
            <button
              id="btn-mobile-drawer-wishlist"
              onClick={() => {
                setIsWishlistOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50/70 hover:bg-rose-100 rounded-lg transition-colors"
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
                setIsOrderTrackingOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Truck className="w-4 h-4 text-rose-600" />
              <span>আপনার অর্ডার ট্র্যাক করুন</span>
            </button>

            <button
              onClick={() => {
                setIsFacebookModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50/60 hover:bg-blue-100 rounded-lg transition-colors"
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
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-rose-600" />
              <span>সরাসরি মেসেজ পাঠান</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              <p className="font-semibold text-rose-700">হটলাইন সহায়তা:</p>
              <div className="flex gap-3">
                <a href={`tel:${settings.hotline1}`} className="font-bold text-slate-800 hover:text-rose-600">
                  📞 {settings.hotline1}
                </a>
                <a href={`tel:${settings.hotline2}`} className="font-bold text-slate-800 hover:text-rose-600">
                  📞 {settings.hotline2}
                </a>
              </div>
            </div>

            {/* Quick Admin Access */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminOpen(true);
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg px-2 py-1 transition"
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
