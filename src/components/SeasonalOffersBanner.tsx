import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { 
  Sparkles, 
  Tag, 
  Clock, 
  Copy, 
  Check, 
  ArrowRight, 
  X, 
  Flame, 
  Gift, 
  Percent,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Truck,
  ShieldCheck
} from 'lucide-react';

interface PromoOffer {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  highlight: string;
  subtitle: string;
  couponCode: string;
  categoryFilter?: CategoryType;
}

const OFFERS: PromoOffer[] = [
  {
    id: 'festive20',
    badge: 'হট ডিল',
    badgeColor: 'bg-amber-400 text-slate-950',
    title: '🌸 সব থ্রি-পিস ও ডিজাইনার শাড়িতে',
    highlight: '২০% পর্যন্ত ফ্ল্যাট ছাড়!',
    subtitle: 'কুপন কোড ব্যবহার করে লুফে নিন আকর্ষণীয় ছাড়',
    couponCode: 'FESTIVE20',
    categoryFilter: 'three_piece'
  },
  {
    id: 'freedelivery',
    badge: 'ফ্রি ডেলিভারি',
    badgeColor: 'bg-emerald-400 text-slate-950',
    title: '🚚 ৩,৫০০ টাকার যেকোনো অর্ডারে',
    highlight: 'সারাদেশে হোম ডেলিভারি ফ্রি!',
    subtitle: 'ঢাকা ও ঢাকার বাইরে ক্যাশ অন ডেলিভারি সুবিধা',
    couponCode: 'FREESHIP',
    categoryFilter: 'all'
  },
  {
    id: 'giftdeal',
    badge: 'স্পেশাল উপহার',
    badgeColor: 'bg-pink-300 text-pink-950',
    title: '🎁 আজকের স্পেশাল সারপ্রাইজ',
    highlight: 'প্রতি অর্ডারে ফ্রি আকর্ষণীয় গিফট!',
    subtitle: 'সীমিত সময়ের জন্য এক্সক্লুসিভ উপহার অফার',
    couponCode: 'SPECIALGIFT',
    categoryFilter: 'all'
  },
  {
    id: 'eidcollection',
    badge: 'নতুন কালেকশন',
    badgeColor: 'bg-rose-300 text-rose-950',
    title: '✨ প্রিমিয়াম কোয়ালিটি ফ্যাশন',
    highlight: '১০০% অরিজিনাল কালার ও ফেব্রিক গ্যারান্টি',
    subtitle: 'আমাদের নিজস্ব দক্ষ কারিগরদের তৈরি পোশাক',
    couponCode: 'BOUTIQUE',
    categoryFilter: 'saree'
  }
];

export const SeasonalOffersBanner: React.FC = () => {
  const { setActiveCategory } = useShop();

  // Shutter state (open / closed)
  const [isShutterOpen, setIsShutterOpen] = useState<boolean>(true);
  const manualScrollPosRef = useRef<number | null>(null);

  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Countdown timer: target set for ~14 hours from now
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 45,
    seconds: 30,
  });

  // Auto-close shutter on scroll (স্ক্রোল করলে অটো শাটার লেগে যায়)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // If user explicitly opened it while scrolled, keep it open until they scroll another 40px
          if (manualScrollPosRef.current !== null) {
            if (Math.abs(scrollY - manualScrollPosRef.current) > 40) {
              manualScrollPosRef.current = null;
              if (scrollY > 50) {
                setIsShutterOpen(false);
              }
            }
          } else {
            // Scroll down past 40px: automatically close the shutter
            if (scrollY > 40) {
              setIsShutterOpen(false);
            } else if (scrollY <= 15) {
              // Scrolled back to top: automatically open the shutter
              setIsShutterOpen(true);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live countdown ticker (1 second interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Automatic offer slider / carousel (starts immediately and auto-advances every 3.5s)
  useEffect(() => {
    if (!isAutoPlaying || !isShutterOpen) return;

    const timer = setInterval(() => {
      setActiveOfferIndex((prev) => (prev + 1) % OFFERS.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isShutterOpen]);

  const handleNextOffer = () => {
    setActiveOfferIndex((prev) => (prev + 1) % OFFERS.length);
  };

  const handlePrevOffer = () => {
    setActiveOfferIndex((prev) => (prev - 1 + OFFERS.length) % OFFERS.length);
  };

  const toggleShutter = () => {
    setIsShutterOpen((prev) => {
      const next = !prev;
      if (next) {
        manualScrollPosRef.current = window.scrollY;
      } else {
        manualScrollPosRef.current = null;
      }
      return next;
    });
  };

  const handleCopyCoupon = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleExploreOffers = (categoryFilter?: CategoryType) => {
    if (categoryFilter) {
      setActiveCategory(categoryFilter);
    } else {
      setActiveCategory('all');
    }
    const productSection = document.getElementById('products-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const currentOffer = OFFERS[activeOfferIndex];

  return (
    <div className="relative w-full bg-slate-900 border-b border-rose-950/40 select-none">
      {/* Collapsible Shutter Body */}
      <div 
        className={`w-full overflow-hidden transition-all duration-500 ease-in-out bg-gradient-to-r from-rose-950 via-rose-900 to-pink-950 text-white shadow-inner ${
          isShutterOpen ? 'max-h-56 sm:max-h-24 opacity-100 py-1.5 sm:py-2' : 'max-h-0 opacity-0 py-0'
        }`}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 relative z-10 w-full">
          
          {/* Left: Auto-sliding Offers Carousel */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center md:justify-start">
            {/* Offer Prev Button */}
            <button
              onClick={handlePrevOffer}
              className="p-1 text-rose-300 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex shrink-0"
              title="পূর্বের অফার"
              aria-label="পূর্বের অফার"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Badge */}
            <div className={`inline-flex items-center gap-1 font-black text-[10px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm tracking-wide uppercase shrink-0 ${currentOffer.badgeColor}`}>
              <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600 animate-pulse" />
              <span>{currentOffer.badge}</span>
            </div>

            {/* Animated Offer Content */}
            <div className="overflow-hidden min-w-0 text-center md:text-left">
              <div 
                key={currentOffer.id}
                className="flex items-center gap-2 flex-wrap justify-center md:justify-start animate-fadeIn"
              >
                <span className="text-xs sm:text-sm font-semibold text-rose-100 flex items-center gap-1 font-['Hind_Siliguri']">
                  {currentOffer.title} <strong className="text-amber-300 font-extrabold text-xs sm:text-sm">{currentOffer.highlight}</strong>
                </span>
                <span className="text-[11px] text-rose-200/80 hidden lg:inline font-['Hind_Siliguri']">
                  • {currentOffer.subtitle}
                </span>
              </div>
            </div>

            {/* Offer Next Button */}
            <button
              onClick={handleNextOffer}
              className="p-1 text-rose-300 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex shrink-0"
              title="পরবর্তী অফার"
              aria-label="পরবর্তী অফার"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Dots Indicator */}
            <div className="hidden xl:flex items-center gap-1 shrink-0 ml-1">
              {OFFERS.map((offer, idx) => (
                <button
                  key={offer.id}
                  onClick={() => setActiveOfferIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeOfferIndex ? 'bg-amber-400 w-3' : 'bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`অফার ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Countdown, Coupon Code & Explore Action */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center shrink-0">
            {/* Live Countdown Timer */}
            <div className="flex items-center gap-1 bg-black/40 border border-rose-500/30 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-mono text-rose-100 shadow-xs">
              <Clock className="w-3 h-3 text-amber-300 shrink-0 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-sans text-rose-200 hidden sm:inline">বাকি:</span>
              <span className="font-bold text-white font-mono tracking-wider text-[11px] sm:text-xs">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Coupon Code Chip */}
            <button
              onClick={() => handleCopyCoupon(currentOffer.couponCode)}
              title="ক্লিক করে কুপন কোড কপি করুন"
              className="group flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-100 hover:text-white border border-rose-400/40 hover:border-amber-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <Tag className="w-3 h-3 text-amber-300" />
              <span className="text-amber-300 font-mono tracking-wider text-[11px] sm:text-xs">{currentOffer.couponCode}</span>
              {copiedCode ? (
                <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3 text-emerald-400" /> কপি!
                </span>
              ) : (
                <Copy className="w-3 h-3 opacity-70 group-hover:opacity-100 text-white" />
              )}
            </button>

            {/* Action CTA Button */}
            <button
              onClick={() => handleExploreOffers(currentOffer.categoryFilter)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-2.5 sm:px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1 active:scale-95 shrink-0"
            >
              <span>অফার দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Shutter Toggle Tab (সহজেই শাটার নামানো ও গুটানোর ইন্টারেক্টিভ হ্যান্ডেল) */}
      <div className="w-full flex justify-center -mb-2 relative z-20 pointer-events-none">
        <button
          onClick={toggleShutter}
          title={isShutterOpen ? "অফার শাটার গুটিয়ে রাখুন" : "অফার শাটার খুলুন (Start / Open Shutter)"}
          className="pointer-events-auto bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 hover:from-rose-600 hover:to-pink-500 text-white text-[10px] sm:text-[11px] font-bold py-0.5 px-3 rounded-b-lg shadow-md border-x border-b border-rose-400/30 flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
        >
          <Gift className="w-3 h-3 text-amber-300" />
          <span>{isShutterOpen ? 'শাটার গুটান' : '🎁 অফার শাটার খুলুন'}</span>
          {isShutterOpen ? (
            <ChevronUp className="w-3 h-3 text-pink-200" />
          ) : (
            <ChevronDown className="w-3 h-3 text-pink-200 animate-bounce" />
          )}
        </button>
      </div>
    </div>
  );
};
