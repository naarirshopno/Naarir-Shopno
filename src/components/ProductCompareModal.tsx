import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Trash2, 
  ArrowLeftRight, 
  Sparkles, 
  Star, 
  Check, 
  ShoppingBag, 
  Zap, 
  Eye, 
  Layers, 
  Info,
  ShieldCheck,
  TrendingDown,
  Award
} from 'lucide-react';
import { Product } from '../types';

export const ProductCompareModal: React.FC = () => {
  const { 
    compareList, 
    addToCompare,
    removeFromCompare, 
    clearCompare, 
    isCompareModalOpen, 
    setIsCompareModalOpen,
    addToCart,
    setDirectCheckoutItem,
    setIsCheckoutOpen,
    setSelectedProductModal,
    products,
    settings
  } = useShop();

  const getCatTitle = (p: Product) => {
    const cats = Array.isArray(settings.categories) ? settings.categories : [];
    const found = cats.find(c => c.id === p.category);
    if (found) return found.title;
    if (p.categoryBengali && p.categoryBengali !== 'থ্রি-পিস') return p.categoryBengali;
    return cats[0]?.title || p.categoryBengali || 'পোশাক';
  };

  if (!isCompareModalOpen) return null;

  // Find best price and top rating among compared products
  const lowestPrice = compareList.length > 0 
    ? Math.min(...compareList.map(p => p.price)) 
    : 0;
  
  const highestPrice = compareList.length > 0 
    ? Math.max(...compareList.map(p => p.price)) 
    : 0;

  const highestRating = compareList.length > 0 
    ? Math.max(...compareList.map(p => p.rating)) 
    : 0;

  // Check if fabrics are all identical or different
  const uniqueFabrics = Array.from(new Set(compareList.map(p => (p.fabric || '').trim().toLowerCase()))).filter(Boolean);
  const hasFabricDifference = uniqueFabrics.length > 1;

  const handleInstantBuy = (product: Product) => {
    setDirectCheckoutItem({
      product,
      selectedSize: product.sizes[0] || 'Standard',
      selectedColor: product.colors[0]?.name,
      selectedImage: product.images[0],
      quantity: 1,
    });
    setIsCompareModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, product.sizes[0] || 'Standard', product.colors[0]?.name, 1, true, product.images[0]);
  };

  return (
    <div 
      className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
      onClick={() => setIsCompareModalOpen(false)}
    >
      <div 
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[92vh] overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/60 via-white to-pink-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
                  পোশাকের তুলনা (Compare Products)
                </h3>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {compareList.length}/৩ টি পোশাক
                </span>
              </div>
              <p className="text-xs text-slate-500">
                দাম, ফেব্রিক ও রেটিং এর বিস্তারিত পার্থক্য পাশাপাশি মিলিয়ে দেখুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer"
                title="তুলনা তালিকা খালি করুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সব মুছুন</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {compareList.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <ArrowLeftRight className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 font-['Hind_Siliguri']">
                  তুলনা করার জন্য কোনো পোশাক যুক্ত করা হয়নি
                </h4>
                <p className="text-xs text-slate-500">
                  যেকোনো পোশাকের কার্ডের <span className="text-rose-600 font-bold">"তুলনা"</span> বাটনে চাপ দিয়ে সর্বোচ্চ ৩টি পোশাক একসাথে নির্বাচন করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                পোশাক কালেকশন দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Highlight summary cards if 2+ products are being compared */}
              {compareList.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-pink-50/70 rounded-2xl border border-rose-100">
                  {/* Price Highlight */}
                  <div className="flex items-start gap-2.5 p-2 bg-white/80 rounded-xl border border-rose-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-[11px] font-bold text-slate-500 block">দামের তুলনা</span>
                      <p className="text-xs font-bold text-emerald-700">
                        সর্বনিম্ন: ৳{lowestPrice.toLocaleString('bn-BD')}
                        {highestPrice > lowestPrice && (
                          <span className="text-[10px] text-slate-500 font-normal block">
                            (৳{(highestPrice - lowestPrice).toLocaleString('bn-BD')} পর্যন্ত সাশ্রয়ী)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Fabric Highlight */}
                  <div className="flex items-start gap-2.5 p-2 bg-white/80 rounded-xl border border-rose-100">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-[11px] font-bold text-slate-500 block">ফেব্রিক তুলনা</span>
                      <p className="text-xs font-bold text-rose-700">
                        {hasFabricDifference 
                          ? `${uniqueFabrics.length} ধরনের ভিন্ন ফেব্রিক` 
                          : `সবগুলোই ${uniqueFabrics[0] || 'একই ফেব্রিক'}`}
                      </p>
                    </div>
                  </div>

                  {/* Rating Highlight */}
                  <div className="flex items-start gap-2.5 p-2 bg-white/80 rounded-xl border border-rose-100">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-[11px] font-bold text-slate-500 block">সেরা রেটিং</span>
                      <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        <span>★ {highestRating.toFixed(1)} / ৫.০</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison Table / Columns */}
              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 min-w-[300px]">
                  {compareList.map((product) => {
                    const isBestPrice = compareList.length > 1 && product.price === lowestPrice;
                    const isTopRated = compareList.length > 1 && product.rating === highestRating;
                    const discountPercent = Math.round(
                      ((product.regularPrice - product.price) / product.regularPrice) * 100
                    );

                    return (
                      <div 
                        key={product.id}
                        className={`bg-white rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                          isBestPrice
                            ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-md'
                            : 'border-rose-100 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shadow-xs transition cursor-pointer"
                          title="তুলনা থেকে সরান"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div>
                          {/* Image & Badges */}
                          <div className="relative aspect-[4/5] bg-rose-50 overflow-hidden cursor-pointer" onClick={() => setSelectedProductModal(product)}>
                            <img
                              src={product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                              alt={product.bengaliName || product.name}
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            />

                            {/* Best Price badge */}
                            {isBestPrice && (
                              <div className="absolute top-2.5 left-2.5 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>সেরা মূল্য</span>
                              </div>
                            )}

                            {/* Top Rated badge */}
                            {isTopRated && !isBestPrice && (
                              <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                <span>শীর্ষ রেটিং</span>
                              </div>
                            )}

                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                              {getCatTitle(product)}
                            </div>
                          </div>

                          {/* Product Info Table */}
                          <div className="p-4 space-y-3.5">
                            {/* Title */}
                            <div>
                              <h4 
                                className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-rose-600 cursor-pointer font-['Hind_Siliguri']"
                                onClick={() => setSelectedProductModal(product)}
                              >
                                {product.bengaliName || product.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku || product.id}</span>
                            </div>

                            {/* 1. PRICE COMPARISON ROW (Highlighted) */}
                            <div className={`p-2.5 rounded-xl border transition ${
                              isBestPrice 
                                ? 'bg-emerald-50/70 border-emerald-200' 
                                : 'bg-slate-50/70 border-slate-200'
                            }`}>
                              <div className="flex items-baseline justify-between mb-0.5">
                                <span className="text-[11px] font-semibold text-slate-600">মূল্য (Price):</span>
                                {isBestPrice && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    কম দাম
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-rose-600 font-mono">
                                  ৳{product.price.toLocaleString('bn-BD')}
                                </span>
                                {product.regularPrice > product.price && (
                                  <span className="text-xs text-slate-400 line-through font-mono">
                                    ৳{product.regularPrice.toLocaleString('bn-BD')}
                                  </span>
                                )}
                                {discountPercent > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-600">
                                    ({discountPercent}% ছাড়)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 2. FABRIC COMPARISON ROW (Highlighted) */}
                            <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-rose-500" />
                                  <span>উপাদান (Fabric):</span>
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 font-['Hind_Siliguri']">
                                {product.fabric || 'উন্নতমানের প্রিমিয়াম ফেব্রিক'}
                              </p>
                            </div>

                            {/* 3. RATING COMPARISON ROW (Highlighted) */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isTopRated 
                                ? 'bg-amber-50/70 border-amber-200' 
                                : 'bg-slate-50/70 border-slate-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span>রেটিং (Rating):</span>
                                </span>
                                {isTopRated && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                    সেরা রেটিং
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3.5 h-3.5 ${
                                        i < Math.floor(product.rating) 
                                          ? 'fill-amber-400 text-amber-400' 
                                          : 'text-slate-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-bold text-slate-700 font-mono">
                                  {product.rating.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  ({product.reviewsCount} রিভিউ)
                                </span>
                              </div>
                            </div>

                            {/* 4. Sizes & Colors */}
                            <div className="space-y-2 pt-1 border-t border-slate-100 text-left">
                              <div>
                                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                                  সাইজ ভ্যারিয়েন্ট:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {product.sizes && product.sizes.length > 0 ? (
                                    product.sizes.map((s, idx) => (
                                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400">স্ট্যান্ডার্ড সাইজ</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                                  রঙ (Colors):
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {product.colors && product.colors.length > 0 ? (
                                    product.colors.map((c, cIdx) => (
                                      <div key={cIdx} className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                        <span 
                                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                                          style={{ backgroundColor: c.hex }} 
                                        />
                                        <span className="text-[10px] text-slate-700">{c.name}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400">একক রঙ</span>
                                  )}
                                </div>
                              </div>

                              {/* Stock status */}
                              <div className="pt-1 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">স্টক অবস্থা:</span>
                                {product.inStock && product.stockCount > 0 ? (
                                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    স্টকে আছে ({product.stockCount} টি)
                                  </span>
                                ) : (
                                  <span className="text-red-500 font-bold">স্টক শেষ</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleInstantBuy(product)}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>এখনই অর্ডার করুন</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold py-1.5 px-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>কার্টে নিন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedProductModal(product)}
                              className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-1.5 px-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                              title="পূর্ণ বিবরণ দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>বিবরণ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Placeholder for 3rd product if only 1 or 2 are selected */}
                  {compareList.length < 3 && (
                    <div className="border-2 border-dashed border-rose-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[350px] bg-rose-50/20">
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <ArrowLeftRight className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 font-['Hind_Siliguri']">
                          আরও {3 - compareList.length}টি পোশাক যোগ করুন
                        </p>
                        <p className="text-[11px] text-slate-500">
                          একসাথে সর্বোচ্চ ৩টি পোশাক পাশাপাশি তুলনা করতে পারবেন
                        </p>
                      </div>
                      
                      {/* Suggestion list */}
                      <div className="w-full space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">পরামর্শ:</span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {products
                            .filter(p => !compareList.some(c => c.id === p.id))
                            .slice(0, 3)
                            .map((p) => (
                              <div 
                                key={p.id}
                                className="flex items-center justify-between p-2 bg-white rounded-xl border border-rose-100 shadow-2xs text-left"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img 
                                    src={p.images[0]} 
                                    alt={p.bengaliName || p.name} 
                                    className="w-8 h-8 rounded-lg object-cover shrink-0" 
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-800 truncate">
                                      {p.bengaliName || p.name}
                                    </p>
                                    <span className="text-[10px] text-rose-600 font-bold font-mono">
                                      ৳{p.price.toLocaleString('bn-BD')}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addToCompare(p)}
                                  className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-lg border border-rose-200 shrink-0 cursor-pointer"
                                >
                                  + যোগ
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 bg-slate-50 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>সবগুলো পোশাকে ক্যাশ অন ডেলিভারি এবং দ্রুত হোম ডেলিভারি সুবিধা প্রযোজ্য।</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="flex-1 sm:flex-none py-2 px-5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
