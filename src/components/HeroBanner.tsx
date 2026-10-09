import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Truck, ShieldCheck, RefreshCw, Sparkles, Phone, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { settings } = useShop();

  // Dynamic Open / Closed calculation: 10:00 AM to 10:00 PM (10:00 - 22:00 Asia/Dhaka)
  const [isOpenNow, setIsOpenNow] = useState<boolean>(() => {
    try {
      const dhakaHour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: 'numeric',
          hour12: false,
        }).format(new Date()),
        10
      );
      return dhakaHour >= 10 && dhakaHour < 22;
    } catch {
      const h = new Date().getHours();
      return h >= 10 && h < 22;
    }
  });

  useEffect(() => {
    const checkOpenStatus = () => {
      try {
        const dhakaHour = parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Dhaka',
            hour: 'numeric',
            hour12: false,
          }).format(new Date()),
          10
        );
        setIsOpenNow(dhakaHour >= 10 && dhakaHour < 22);
      } catch {
        const h = new Date().getHours();
        setIsOpenNow(h >= 10 && h < 22);
      }
    };
    checkOpenStatus();
    const timer = setInterval(checkOpenStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-rose-100/60 via-pink-50/40 to-white pt-2 pb-6 sm:pt-4 sm:pb-8">
      {/* Decorative floral or subtle circular background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* 4 Pillars Trust Badges - 4 Distinct Beautiful Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Rose / Pink Pastel */}
          <div className="bg-gradient-to-br from-rose-50 via-pink-50/50 to-rose-100/40 p-3.5 sm:p-4 rounded-2xl border border-rose-200/90 shadow-2xs hover:shadow-xs transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">সারাদেশে দ্রুত ডেলিভারি</h4>
              <p className="text-[11px] text-slate-600">ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা</p>
            </div>
          </div>

          {/* Card 2: Warm Amber / Gold Pastel */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-100/40 p-3.5 sm:p-4 rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-xs transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">১০০% কোয়ালিটি গ্যারান্টি</h4>
              <p className="text-[11px] text-slate-600">কালার ও ফেব্রিক শতভাগ খাঁটি</p>
            </div>
          </div>

          {/* Card 3: Soft Lavender / Purple Pastel */}
          <div className="bg-gradient-to-br from-purple-50 via-violet-50/50 to-purple-100/40 p-3.5 sm:p-4 rounded-2xl border border-purple-200/90 shadow-2xs hover:shadow-xs transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">সহজ রিটার্ন ও এক্সচেঞ্জ</h4>
              <p className="text-[11px] text-slate-600">৩ দিনের মধ্যে পরিবর্তনের সুবিধা</p>
            </div>
          </div>

          {/* Card 4: Fresh Mint / Emerald Pastel */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 p-3.5 sm:p-4 rounded-2xl border border-emerald-200/90 shadow-2xs hover:shadow-xs transition flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
              isOpenNow ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">কাস্টমার সাপোর্ট</h4>
                <span className="text-[9px] font-bold bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded">সরাসরি ফোন</span>
              </div>
              <a
                href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
                className="text-xs sm:text-sm font-bold text-rose-600 font-mono hover:underline block leading-tight mt-0.5"
              >
                {settings.hotline1 || '09617-541717'}
              </a>
              <div className="mt-1">
                {isOpenNow ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-white/85 px-2 py-0.5 rounded-full border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ওপেন</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-white/85 px-2 py-0.5 rounded-full border border-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>ক্লোজ</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panoramic Boutique Showcase with Branded Watermark (টপে জলছাপ) */}
        <div className="mt-6 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-rose-200/90 group">
          <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
            <img
              src="/watermarked_hero_banner.jpg"
              alt="নারীর স্বপ্ন এক্সক্লুসিভ ফ্যাশন কালেকশন"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = "/hero-banner.jpg";
              }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top Watermark Badge (টপ এ অফিসিয়াল জলছাপ) */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 pointer-events-none select-none">
              <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md border border-white/30 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl text-white">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border-2 border-rose-400 shrink-0 shadow">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover object-center" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-black font-['Hind_Siliguri'] text-white leading-tight">
                      নারীর স্বপ্ন
                    </p>
                    <span className="bg-rose-500/80 text-[9px] font-bold px-1.5 py-0.2 rounded text-white uppercase tracking-wider">
                      Official
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-pink-200 font-medium leading-none tracking-widest uppercase mt-0.5">
                    Dress Your Dreams • উইমেন্স বুটিক
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right Hotline Watermark */}
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 pointer-events-none select-none hidden sm:block">
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 px-3.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>সরাসরি ফোন সাপোর্ট: {settings.hotline1 || '09617-541717'}</span>
              </div>
            </div>

            {/* Bottom Caption & CTA */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between text-white z-20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-['Hind_Siliguri'] text-pink-200">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>এক্সক্লুসিভ লাইভ কালেকশন ২০২৬</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 hidden sm:block">
                  প্রিমিয়াম জর্জেট থ্রি-পিস, জামদানি শাড়ি ও ডিজাইনার কুর্তির সেরা সংগ্রহ
                </p>
              </div>

              <button
                onClick={scrollToProducts}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 rounded-xl shadow-lg transition flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <span>অর্ডার করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
