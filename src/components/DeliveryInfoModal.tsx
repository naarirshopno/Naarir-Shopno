import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Truck, Clock, ShieldCheck, RefreshCw, AlertTriangle, Phone } from 'lucide-react';

export const DeliveryInfoModal: React.FC = () => {
  const { isDeliveryInfoOpen, setIsDeliveryInfoOpen, settings } = useShop();

  if (!isDeliveryInfoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
              ডেলিভারি তথ্য ও নীতিমালা
            </h3>
          </div>
          <button
            onClick={() => setIsDeliveryInfoOpen(false)}
            className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          {/* Rate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-center">
              <span className="text-xs font-semibold text-rose-600">ঢাকা সিটির ভেতরে</span>
              <p className="text-2xl font-black text-rose-700 my-1 font-['Outfit']">
                ৳{settings.deliveryCharges.insideDhaka}
              </p>
              <p className="text-[11px] text-slate-500">সময়: ২৪ থেকে ৪৮ ঘণ্টা</p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200 text-center">
              <span className="text-xs font-semibold text-pink-600">ঢাকা উপশহর (সাভার/গাজীপুর)</span>
              <p className="text-2xl font-black text-pink-700 my-1 font-['Outfit']">
                ৳{settings.deliveryCharges.subDhaka}
              </p>
              <p className="text-[11px] text-slate-500">সময়: ২ থেকে ৩ দিন</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-center">
              <span className="text-xs font-semibold text-amber-700">ঢাকার বাইরে সারাদেশে</span>
              <p className="text-2xl font-black text-amber-800 my-1 font-['Outfit']">
                ৳{settings.deliveryCharges.outsideDhaka}
              </p>
              <p className="text-[11px] text-slate-500">সময়: ২ থেকে ৩ কর্মদিবস</p>
            </div>
          </div>

          {/* Free delivery banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold text-center text-xs">
            🎉 ৳{settings.deliveryCharges.freeDeliveryAbove.toLocaleString()} টাকার বেশি অর্ডারে সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
          </div>

          {/* Detailed Instructions */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-0.5">ডেলিভারি প্রসেসিং সময়</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  অর্ডার প্লেস করার পর আমাদের কাস্টমার প্রতিনিধি আপনার সাথে ফোনে কথা বলে অর্ডার নিশ্চিত করবেন। দুপুর ২টার আগের অর্ডার একই দিনে কুরিয়ারে হস্তান্তর করা হয়।
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-0.5">ক্যাশ অন ডেলিভারি ও পার্সেল চেক</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  ডেলিভারি ম্যান উপস্থিত থাকাকালীন সময়ে পার্সেল খুলে পোশাকের সাইজ ও ফেব্রিক কোয়ালিটি দেখে বুঝে নিন। কোনো অসঙ্গতি থাকলে সাথে সাথে ডেলিভারি ম্যানের সামনে আমাদের হটলাইনে কল দিন।
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-0.5">সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  সাইজ পরিবর্তন বা পোশাক পছন্দ না হলে ৩ দিনের মধ্যে এক্সচেঞ্জ সুবিধা পাওয়া যাবে। পোশাকের ট্যাগ অক্ষত ও অব্যবহৃত থাকতে হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Hotline Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">কাস্টমার সাপোর্ট ও সরাসরি ফোন:</span>
                {settings.supportHours && settings.supportHours.trim() ? (
                  <p className="text-[10px] text-emerald-600 font-semibold">{settings.supportHours}</p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2 font-bold text-rose-700 font-mono self-start sm:self-auto">
              <a href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`} className="hover:underline bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                📞 {settings.hotline1 || '09617-541717'}
              </a>
              {settings.hotline2 && settings.hotline2 !== settings.hotline1 && (
                <a href={`tel:${settings.hotline2.replace(/[^0-9]/g, '')}`} className="hover:underline text-slate-600 px-1 py-0.5">
                  / {settings.hotline2}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
