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

  return (
    <>
      {/* Floating Buttons in Bottom Right */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        
        {/* Scroll To Top button */}
        <button
          onClick={scrollToTop}
          title="উপরে যান"
          className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Track Order Floating Pill */}
        <button
          id="btn-floating-track"
          onClick={() => setIsOrderTrackingOpen(true)}
          className="bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold px-3 py-2 rounded-full shadow-lg border border-rose-200 flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
        >
          <Truck className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">অর্ডার ট্র্যাকিং</span>
        </button>

        {/* Customer Direct Message Floating Button */}
        <button
          id="btn-floating-chat"
          onClick={() => setIsCustomerChatOpen(true)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition hover:scale-105 active:scale-95 border-2 border-white"
        >
          <MessageCircle className="w-5 h-5 text-white animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            মেসেজ পাঠান
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Facebook Logo Modal Button (Requested: "Facebook logo moddeal button") */}
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
            className="w-13 h-13 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition transform hover:scale-110 active:scale-95 ring-4 ring-blue-200/60"
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
          href={`tel:${settings.hotline1.replace(/[^0-9]/g, '')}`}
          className="flex-1 bg-slate-100 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-rose-600" />
          <span>কল করুন</span>
        </a>

        <button
          onClick={() => setIsFacebookModalOpen(true)}
          className="bg-blue-50 text-blue-700 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-blue-200"
        >
          <svg className="w-3.5 h-3.5 fill-current text-blue-600" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>ফেসবুক</span>
        </button>

        <button
          onClick={() => setIsCustomerChatOpen(true)}
          className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>মেসেজ</span>
        </button>
      </div>
    </>
  );
};
