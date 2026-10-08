import React from 'react';
import { useShop } from '../context/ShopContext';
import { MessageCircle, Phone, Truck, ArrowUp } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  const { 
    setIsFacebookModalOpen, 
    setIsCustomerChatOpen, 
    setIsOrderTrackingOpen, 
    settings
  } = useShop();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format WhatsApp Link: prefer custom short link if configured, else phone number link
  const getWhatsAppUrl = () => {
    if (settings.whatsappShortLink && settings.whatsappShortLink.trim()) {
      let link = settings.whatsappShortLink.trim();
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
      }
      return link;
    }
    const rawNumber = settings.whatsappNumber || settings.hotline1 || '01911541717';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const formattedNumber = cleanNumber.startsWith('880') 
      ? cleanNumber 
      : cleanNumber.startsWith('0') 
        ? `88${cleanNumber}` 
        : `880${cleanNumber}`;
    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম, নারীর স্বপ্ন শপ থেকে পোশাক অর্ডার ও কালেকশন সম্পর্কে জানতে চাচ্ছি।')}`;
  };

  const whatsappUrl = getWhatsAppUrl();
  const displayWhatsApp = settings.whatsappNumber || settings.hotline1 || '01911541717';

  return (
    <>
      {/* Scroll To Top Button (Button kept standalone, floating div deleted) */}
      <button
        id="btn-scroll-top"
        onClick={scrollToTop}
        title="উপরে যান"
        className="fixed bottom-18 sm:bottom-18 right-4 sm:right-6 z-40 w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Sticky Bottom Action / Hotline / Order Tracking Bar (Visible on Mobile AND Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-200 px-2 py-1.5 sm:px-4 sm:py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto grid grid-cols-5 gap-1 sm:gap-2.5">
          {/* 1. Call */}
          <a
            href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-0.5 sm:px-2 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 rounded-xl transition text-[10px] sm:text-xs font-bold font-['Hind_Siliguri'] text-center border border-slate-200 active:scale-95 cursor-pointer min-w-0"
            title={`কল করুন: ${settings.hotline1 || '09617-541717'}`}
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">কল</span>
              <span className="hidden sm:inline">কল করুন</span>
            </span>
          </a>

          {/* 2. WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-0.5 sm:px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition text-[10px] sm:text-xs font-bold font-['Hind_Siliguri'] text-center border border-emerald-200 active:scale-95 cursor-pointer min-w-0"
            title="হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-[#25D366] shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span className="truncate">WhatsApp</span>
          </a>

          {/* 3. Order Tracking */}
          <button
            id="btn-floating-track"
            onClick={() => setIsOrderTrackingOpen(true)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-0.5 sm:px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition text-[10px] sm:text-xs font-bold font-['Hind_Siliguri'] text-center border border-rose-200 active:scale-95 cursor-pointer min-w-0"
            title="আপনার অর্ডার ট্র্যাক করুন"
          >
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">ট্র্যাকিং</span>
              <span className="hidden sm:inline">অর্ডার ট্র্যাকিং</span>
            </span>
          </button>

          {/* 4. Facebook */}
          <button
            onClick={() => setIsFacebookModalOpen(true)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-0.5 sm:px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition text-[10px] sm:text-xs font-bold font-['Hind_Siliguri'] text-center border border-blue-200 active:scale-95 cursor-pointer min-w-0"
            title="ফেসবুক পেজ ও অফার দেখুন"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-blue-600 shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="truncate">ফেসবুক</span>
          </button>

          {/* 5. Message */}
          <button
            onClick={() => setIsCustomerChatOpen(true)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-0.5 sm:px-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl transition text-[10px] sm:text-xs font-bold font-['Hind_Siliguri'] text-center shadow-xs active:scale-95 cursor-pointer min-w-0"
            title="মেসেজ পাঠান"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">মেসেজ</span>
          </button>
        </div>
      </div>
    </>
  );
};
