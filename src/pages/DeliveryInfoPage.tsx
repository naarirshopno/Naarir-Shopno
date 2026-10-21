import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Truck, Clock, ShieldCheck, RefreshCw, AlertTriangle, Phone, ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react';

export const DeliveryInfoPage: React.FC = () => {
  const { settings } = useShop();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="text-slate-600 hover:text-rose-600 font-medium">
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-rose-700 font-bold">ডেলিভারি ও রিটার্ন পলিসি</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-full border border-slate-200 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>পেছনে ফিরুন</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold">
            <Truck className="w-4 h-4" />
            <span>সারা দেশে দ্রুত ডেলিভারি</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Hind_Siliguri']">
            ডেলিভারি তথ্য ও সহজ রিটার্ন পলিসি
          </h1>
          <p className="text-xs sm:text-sm text-pink-100">
            নারীর স্বপ্ন থেকে প্রতিটি অর্ডার দ্রুত ও নিরাপদে পৌঁছে দেওয়া আমাদের অঙ্গীকার।
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-6 sm:p-8 space-y-6">
        {/* Rate Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 text-center space-y-1">
            <span className="text-xs font-semibold text-rose-600">ঢাকা সিটির ভেতরে</span>
            <p className="text-3xl font-black text-rose-700 font-['Outfit']">
              ৳{settings.deliveryCharges.insideDhaka}
            </p>
            <p className="text-xs text-slate-500">সময়: ২৪ থেকে ৪৮ ঘণ্টা</p>
          </div>

          <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-200 text-center space-y-1">
            <span className="text-xs font-semibold text-pink-600">ঢাকা উপশহর (সাভার/গাজীপুর)</span>
            <p className="text-3xl font-black text-pink-700 font-['Outfit']">
              ৳{settings.deliveryCharges.subDhaka}
            </p>
            <p className="text-xs text-slate-500">সময়: ২ থেকে ৩ দিন</p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 text-center space-y-1">
            <span className="text-xs font-semibold text-amber-700">ঢাকার বাইরে সারাদেশে</span>
            <p className="text-3xl font-black text-amber-800 font-['Outfit']">
              ৳{settings.deliveryCharges.outsideDhaka}
            </p>
            <p className="text-xs text-slate-500">সময়: ২ থেকে ৩ কর্মদিবস</p>
          </div>
        </div>

        {/* Free delivery banner */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-center text-sm shadow-2xs">
          🎉 যেকোনো ৩টি পোশাকের অর্ডারে অথবা ৳{(settings.deliveryCharges.freeDeliveryAbove || 3000).toLocaleString()}+ টাকার অর্ডারে সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
        </div>

        {/* Detailed Points */}
        <div className="space-y-5 pt-2">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1 font-['Hind_Siliguri'] text-base">
                ডেলিভারি প্রসেসিং সময়
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                অর্ডার করার পর আমাদের প্রতিনিধি ফোন দিয়ে আপনার অর্ডারটি কনফার্ম করবেন। দুপুর ২টার আগের অর্ডার একই দিনে কুরিয়ারে বুকিং দেওয়া হয়।
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1 font-['Hind_Siliguri'] text-base">
                ক্যাশ অন ডেলিভারি ও পার্সেল চেক সুবিধা
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                ডেলিভারি ম্যানের সামনে পার্সেল খুলে ফেব্রিক, কালার ও সাইজ যাচাই করার সুযোগ রয়েছে। পছন্দ হলে মূল্য পরিশোধ করে পার্সেল গ্রহণ করুন।
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1 font-['Hind_Siliguri'] text-base">
                সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                কোনো ত্রুটি বা সাইজের গরমিল থাকলে ডেলিভারি ম্যানের উপস্থিতিতেই তাৎক্ষণিক রিটার্ন করতে পারবেন অথবা ৭ দিনের মধ্যে এক্সচেঞ্জ করার নিশ্চয়তা রয়েছে।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">যেকোনো সহায়তায় সরাসরি কল করুন:</p>
              <p className="text-xs text-slate-500">আমাদের হেল্পলাইন প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত খোলা থাকে</p>
            </div>
          </div>
          <a
            href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition"
          >
            {settings.hotline1 || '09617-541717'}
          </a>
        </div>
      </div>
    </div>
  );
};
