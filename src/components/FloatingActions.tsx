import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { MessageCircle, Phone, Truck, ArrowUp, X } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  const { 
    setIsFacebookModalOpen, 
    setIsCustomerChatOpen, 
    setIsOrderTrackingOpen, 
    settings
  } = useShop();

  const [showTooltip, setShowTooltip] = useState(true);

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
      {/* Floating Buttons in Bottom Right */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        
        {/* Scroll To Top button */}
        <button
          onClick={scrollToTop}
          title="উপরে যান"
          className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Track Order Floating Pill */}
        <button
          id="btn-floating-track"
          onClick={() => setIsOrderTrackingOpen(true)}
          className="bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold px-3 py-2 rounded-full shadow-lg border border-rose-200 flex items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">অর্ডার ট্র্যাকিং</span>
        </button>

        {/* Customer Direct Message Floating Button */}
        <button
          id="btn-floating-chat"
          onClick={() => setIsCustomerChatOpen(true)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition hover:scale-105 active:scale-95 border-2 border-white cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 text-white animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            মেসেজ পাঠান
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white"></span>
        </button>

        {/* WhatsApp Direct Chat Floating Button */}
        <a
          id="btn-floating-whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`হোয়াটসঅ্যাপে চ্যাট করুন (${displayWhatsApp})`}
          aria-label="WhatsApp Chat"
          className="group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl transition transform hover:scale-110 active:scale-95 ring-4 ring-emerald-200/60 cursor-pointer"
        >
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            হোয়াটসঅ্যাপ
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full ring-2 ring-white animate-ping"></span>
        </a>

        {/* Facebook Logo Modal Button */}
        <div className="relative">
          {showTooltip && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-1.5 animate-bounce">
              <span>ফেসবুক পেজ ও অফার দেখুন!</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            id="btn-facebook-modal-trigger"
            onClick={() => setIsFacebookModalOpen(true)}
            title="নারীর স্বপ্ন ফেসবুক পেজ"
            className="w-13 h-13 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition transform hover:scale-110 active:scale-95 ring-4 ring-blue-200/60 cursor-pointer"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sticky Order / Hotline Bar at Bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-rose-100 p-2.5 flex items-center justify-between gap-2 shadow-lg">
        <a
          href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
          className="flex-1 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 font-mono transition"
        >
          <Phone className="w-3.5 h-3.5 text-rose-600" />
          <span>কল: {settings.hotline1 || '09617-541717'}</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-50 text-emerald-800 text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 border border-emerald-200"
        >
          <svg className="w-3.5 h-3.5 fill-current text-[#25D366]" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>WhatsApp</span>
        </a>

        <button
          onClick={() => setIsFacebookModalOpen(true)}
          className="bg-blue-50 text-blue-700 text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 border border-blue-200"
        >
          <svg className="w-3.5 h-3.5 fill-current text-blue-600" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>ফেসবুক</span>
        </button>

        <button
          onClick={() => setIsCustomerChatOpen(true)}
          className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>মেসেজ</span>
        </button>
      </div>
    </>
  );
};
