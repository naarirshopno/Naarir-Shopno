import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, ExternalLink, MessageCircle, Heart, Share2, Users, ThumbsUp, Video } from 'lucide-react';

export const FacebookModal: React.FC = () => {
  const { isFacebookModalOpen, setIsFacebookModalOpen, settings } = useShop();

  if (!isFacebookModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover / Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-4 text-white flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold shadow">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="font-bold text-sm tracking-wide">অফিসিয়াল ফেসবুক পেজ</span>
          </div>

          <button
            onClick={() => setIsFacebookModalOpen(false)}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Info Overlay */}
        <div className="px-6 pb-6 pt-0 relative space-y-4">
          <div className="flex items-end justify-between -mt-12">
            <div className="w-22 h-22 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
              <img
                src="/logo.jpg"
                alt="নারীর স্বপ্ন লোগো"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80";
                }}
              />
            </div>

            <div className="flex gap-2">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>লাইক দিন</span>
              </a>

              <a
                href="https://m.me/NaarirShopno"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>মেসেঞ্জার</span>
              </a>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-black text-slate-900 font-['Hind_Siliguri']">
                নারীর স্বপ্ন - Naarir Shopno
              </h3>
              <span className="text-blue-500 font-bold" title="ভেরিফাইড পেজ">✓</span>
            </div>
            <p className="text-xs text-rose-600 font-semibold italic">Dress Your Dreams</p>
            <p className="text-xs text-slate-500 mt-1">
              উইমেন্স ক্লোথিং শপ • এক্সক্লুসিভ থ্রি-পিস, শাড়ি, কুর্তি ও গাউন কালেকশন।
            </p>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
            <div>
              <p className="font-black text-slate-900 text-sm">45K+</p>
              <p className="text-[11px] text-slate-500">ফলোয়ার্স</p>
            </div>
            <div className="border-x border-slate-200">
              <p className="font-black text-slate-900 text-sm">4.9 ★</p>
              <p className="text-[11px] text-slate-500">রেটিং</p>
            </div>
            <div>
              <p className="font-black text-emerald-600 text-sm">১০০%</p>
              <p className="text-[11px] text-slate-500">রেসপন্স রেট</p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-700">আমাদের সকল অফিসিয়াল সোশ্যাল লিংক:</h4>

            {/* Facebook */}
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold border border-blue-200 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Facebook Page</p>
                  <p className="text-[11px] text-blue-700 font-normal">www.facebook.com/NaarirShopno</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* TikTok */}
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c-.03 2.11-.79 4.26-2.22 5.82-1.63 1.83-4.04 2.87-6.49 2.74-2.82-.12-5.46-1.72-6.72-4.23-1.39-2.71-.97-6.17.98-8.48 1.84-2.22 4.8-3.21 7.6-2.58v4.06c-1.3-.4-2.79-.27-3.96.42-1.07.61-1.78 1.79-1.8 3.03-.02 1.48.91 2.88 2.33 3.37 1.34.48 2.92.21 3.98-.71.74-.63 1.18-1.57 1.2-2.55V.02z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold">TikTok Official</p>
                  <p className="text-[11px] text-pink-300 font-normal">tiktok.com/@naarir.shopno</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* YouTube */}
            <a
              href={settings.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 text-xs font-semibold border border-red-200 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">YouTube Channel</p>
                  <p className="text-[11px] text-red-700 font-normal">youtube.com/@naarirshopno</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-red-600 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => setIsFacebookModalOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
