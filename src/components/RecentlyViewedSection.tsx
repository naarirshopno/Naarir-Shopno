import React from 'react';
import { useShop } from '../context/ShopContext';
import { Eye, Clock, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

export const RecentlyViewedSection: React.FC = () => {
  const { recentlyViewed, clearRecentlyViewed, setSelectedProductModal, addToCart } = useShop();

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section 
      id="recently-viewed-section"
      className="mt-12 sm:mt-16 pt-8 border-t border-rose-100 animate-fadeIn"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri'] flex items-center gap-2">
              <span>সম্প্রতি দেখা পোশাকসমূহ</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {recentlyViewed.length}টি পোশাক
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            আপনার পছন্দের তালিকায় রাখা বা সম্প্রতি ভিজিট করা পোশাকগুলো সহজেই আবার খুঁজে নিন
          </p>
        </div>

        <button
          onClick={clearRecentlyViewed}
          className="self-start sm:self-auto text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 cursor-pointer active:scale-95"
          title="সম্প্রতি দেখা পোশাকের তালিকা মুছে ফেলুন"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>হিস্ট্রি মুছুন</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {recentlyViewed.map((product: Product) => {
          const discount = product.regularPrice && product.regularPrice > product.price
            ? product.regularPrice - product.price
            : 0;

          const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';

          return (
            <div
              key={`recent-${product.id}`}
              onClick={() => setSelectedProductModal(product)}
              className="group bg-white rounded-2xl border border-rose-100 hover:border-rose-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
                <img
                  src={thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                    ৳{discount} ছাড়
                  </span>
                )}

                {/* Quick Eye Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-rose-600" />
                    <span>দেখুন</span>
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-rose-600 transition font-['Hind_Siliguri']">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-rose-600 font-mono">
                      ৳{product.price.toLocaleString('bn-BD')}
                    </span>
                    {product.regularPrice && product.regularPrice > product.price && (
                      <span className="text-[11px] text-slate-400 line-through font-mono">
                        ৳{product.regularPrice.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, product.sizes?.[0] || 'Free Size', product.colors?.[0]?.name, 1, true);
                  }}
                  className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>ব্যাগে নিন</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
