import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowLeft, ChevronRight, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, toggleWishlist } = useShop();
  const navigate = useNavigate();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="text-slate-600 hover:text-rose-600 font-medium">
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-rose-700 font-bold">পছন্দের তালিকা (উইশলিস্ট)</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-full border border-slate-200 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>পেছনে ফিরুন</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold">
            <Heart className="w-4 h-4 fill-white" />
            <span>আপনার পছন্দের পোশাকসমূহ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Hind_Siliguri']">
            সংরক্ষিত উইশলিস্ট ({savedProducts.length} টি)
          </h1>
          <p className="text-xs sm:text-sm text-pink-100">
            আপনার পরবর্তীতে কেনার জন্য সংরক্ষিত পছন্দের পোশাকগুলো এখানে একনজরে পেয়ে যাবেন।
          </p>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {savedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-['Hind_Siliguri']">
            আপনার পছন্দের তালিকা বর্তমানে খালি
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            যেকোনো পোশাকের কার্ডের ওপরের হার্ট (❤️) আইকনে ক্লিক করে আপনার পছন্দের তালিকায় যুক্ত করে রাখুন।
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>পোশাক কালেকশন দেখুন</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
