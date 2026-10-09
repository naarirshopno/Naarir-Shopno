import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Heart, 
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    settings, 
    setIsFacebookModalOpen, 
    setIsDeliveryInfoOpen, 
    setIsOrderTrackingOpen, 
    setIsCustomerChatOpen
  } = useShop();

  return (
    <footer className="relative bg-neutral-950 text-slate-200 pt-14 pb-48 sm:pb-14 border-t border-rose-950/40 overflow-hidden">
      {/* 30% JolChap (Watermark) Background Image Layer */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url(${settings.footerBgImage || '/footer-bg.jpg'})`
        }}
        aria-hidden="true"
      />
      {/* Subtle overlay for text clarity while showing 30% watermark */}
      <div className="absolute inset-0 bg-neutral-950/40 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        {/* Feature highlights bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">সারাদেশে দ্রুত হোম ডেলিভারি</h4>
              <p className="text-xs text-slate-300">ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারাদেশে ২-৩ দিন</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ক্যাশ অন ডেলিভারি (COD)</h4>
              <p className="text-xs text-slate-300">পণ্য দেখে ও চেক করে পরিশোধের সুযোগ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">সহজ রিটার্ন ও এক্সচেঞ্জ</h4>
              <p className="text-xs text-slate-300">৩ দিনের মধ্যে সাইজ পরিবর্তনের নিশ্চয়তা</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">সরাসরি ফোন সাপোর্ট</h4>
              <p className="text-xs text-slate-300">
                {settings.supportHours || 'সকাল ১০টা - রাত ১০টা সার্বক্ষণিক সেবা'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-rose-500 shadow shrink-0">
                <img
                  src="/logo.jpg"
                  alt="নারীর স্বপ্ন"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80";
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-['Hind_Siliguri']">নারীর স্বপ্ন</h3>
                <p className="text-xs text-rose-400 font-medium">Dress Your Dreams • উইমেন্স ফ্যাশন</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              নারীর স্বপ্ন বাংলাদেশের আধুনিক ও আভিজাত্যময় নারী পোশাকের বিশ্বস্ত অনলাইন বুটিক শপ। প্রিমিয়াম কোয়ালিটির থ্রি-পিস, এক্সক্লুসিভ শাড়ি, স্টাইলিশ কুর্তি ও পার্টি গাউনের সেরা সংগ্রহ।
            </p>

            {/* Social Media Buttons requested by user */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                id="footer-facebook-btn"
                onClick={() => setIsFacebookModalOpen(true)}
                title="ফেসবুক পেজ দেখুন"
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow shadow-blue-900/50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                title="TikTok Official"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-black text-pink-400 border border-slate-700 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c-.03 2.11-.79 4.26-2.22 5.82-1.63 1.83-4.04 2.87-6.49 2.74-2.82-.12-5.46-1.72-6.72-4.23-1.39-2.71-.97-6.17.98-8.48 1.84-2.22 4.8-3.21 7.6-2.58v4.06c-1.3-.4-2.79-.27-3.96.42-1.07.61-1.78 1.79-1.8 3.03-.02 1.48.91 2.88 2.33 3.37 1.34.48 2.92.21 3.98-.71.74-.63 1.18-1.57 1.2-2.55V.02z"/>
                </svg>
              </a>

              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                title="YouTube Channel"
                className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow shadow-red-900/50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <button
                onClick={() => setIsCustomerChatOpen(true)}
                title="সরাসরি চ্যাট করুন"
                className="w-9 h-9 rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition shadow shadow-pink-900/50"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-sm font-['Hind_Siliguri']">জরুরি লিংক</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setIsOrderTrackingOpen(true)} className="hover:text-rose-400 transition text-left">
                  পার্সেল ট্র্যাকিং
                </button>
              </li>
              <li>
                <button onClick={() => setIsDeliveryInfoOpen(true)} className="hover:text-rose-400 transition text-left">
                  ডেলিভারি চার্জ ও সময়
                </button>
              </li>
              <li>
                <button onClick={() => setIsFacebookModalOpen(true)} className="hover:text-rose-400 transition text-left">
                  অফিসিয়াল ফেসবুক পেজ
                </button>
              </li>
              <li>
                <button onClick={() => setIsCustomerChatOpen(true)} className="hover:text-rose-400 transition text-left">
                  সরাসরি বার্তা পাঠান
                </button>
              </li>
              <li>
                <button onClick={() => setIsDeliveryInfoOpen(true)} className="hover:text-rose-400 transition text-left">
                  রিটার্ন ও এক্সচেঞ্জ পলিসি
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm font-['Hind_Siliguri']">কাস্টমার সাপোর্ট</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-bold">সরাসরি ফোন সাপোর্ট:</p>
                  <a
                    href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
                    className="font-mono text-white text-sm font-bold hover:text-rose-400 block transition mt-0.5"
                  >
                    📞 {settings.hotline1 || '09617-541717'}
                  </a>
                  {settings.hotline2 && settings.hotline2 !== settings.hotline1 && (
                    <a
                      href={`tel:${settings.hotline2.replace(/[^0-9]/g, '')}`}
                      className="font-mono text-slate-300 text-xs hover:text-rose-400 block transition mt-0.5"
                    >
                      বিকল্প: {settings.hotline2}
                    </a>
                  )}
                  <p className="text-emerald-400 text-[11px] font-semibold mt-1">
                    {settings.supportHours || 'সকাল ১০টা - রাত ১০টা সার্বক্ষণিক সেবা'}
                  </p>
                </div>
              </div>

              {/* WhatsApp direct support */}
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 fill-current text-[#25D366] shrink-0 mt-0.5" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <div>
                  <p className="text-slate-300 font-bold">হোয়াটসঅ্যাপ সাপোর্ট:</p>
                  <a
                    href={
                      settings.whatsappShortLink && settings.whatsappShortLink.trim()
                        ? (settings.whatsappShortLink.startsWith('http') ? settings.whatsappShortLink.trim() : `https://${settings.whatsappShortLink.trim()}`)
                        : `https://wa.me/${(settings.whatsappNumber || settings.hotline1 || '01911541717').replace(/[^0-9]/g, '')}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 underline"
                  >
                    <span>{settings.whatsappNumber || settings.hotline1 || '01911-541717'}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{settings.officeAddress || 'হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <a href={`mailto:${settings.officeEmail || 'NaarirShopno@Gmail.com'}`} className="hover:text-rose-400 transition">
                    {settings.officeEmail || 'NaarirShopno@Gmail.com'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Security */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm font-['Hind_Siliguri']">পেমেন্ট মেথডসমূহ</h4>
            <p className="text-xs text-slate-400">
              আমরা ক্যাশ অন ডেলিভারির পাশাপাশি বিকাশ ও নগদের মাধ্যমে নিরাপদ পেমেন্ট গ্রহণ করি।
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] font-bold text-white flex items-center gap-1 backdrop-blur-sm">
                <span>💵 ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-pink-950/70 border border-pink-700/60 text-[11px] font-bold text-pink-300 flex items-center gap-1 backdrop-blur-sm">
                <span>📱 বিকাশ (bKash)</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-orange-950/70 border border-orange-700/60 text-[11px] font-bold text-orange-300 flex items-center gap-1 backdrop-blur-sm">
                <span>💳 নগদ (Nagad)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Admin Direct Entry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} নারীর স্বপ্ন - Naarir Shopno. সর্বস্বত্ব সংরক্ষিত।</p>

        <p className="flex items-center gap-1 text-[11px]">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for Bengali Women Fashion
        </p>
      </div>

      </div>

      {/* Dedicated mobile safe buffer to guarantee no overlap with bottom action bar or music pill */}
      <div className="h-16 sm:hidden pointer-events-none" aria-hidden="true" />
    </footer>
  );
};
