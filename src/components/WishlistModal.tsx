import React from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { 
  X, 
  Heart, 
  Trash2, 
  ShoppingBag, 
  Zap, 
  ArrowRight, 
  Check, 
  Sparkles,
  ShoppingBasket
} from 'lucide-react';

export const WishlistModal: React.FC = () => {
  const { 
    isWishlistOpen, 
    setIsWishlistOpen, 
    wishlist, 
    removeFromWishlist, 
    clearWishlist, 
    products, 
    addToCart, 
    setDirectCheckoutItem, 
    setIsCheckoutOpen,
    setSelectedProductModal,
    settings
  } = useShop();

  const getCategoryTitle = (prod: Product) => {
    const cats = Array.isArray(settings.categories) ? settings.categories : [];
    const found = cats.find(c => c.id === prod.category);
    if (found) return found.title;
    if (prod.categoryBengali && prod.categoryBengali !== 'থ্রি-পিস') return prod.categoryBengali;
    return cats[0]?.title || prod.categoryBengali || 'পোশাক';
  };

  if (!isWishlistOpen) return null;

  // Filter products in wishlist
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleClose = () => {
    setIsWishlistOpen(false);
  };

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.stopPropagation();
    addToCart(product, undefined, undefined, 1, false, product.images && product.images[0]);
  };

  const handleDirectBuy = (e: React.MouseEvent, product: typeof products[0]) => {
    e.stopPropagation();
    setIsWishlistOpen(false);
    setDirectCheckoutItem({
      product,
      selectedSize: product.sizes[0] || 'Standard',
      selectedColor: product.colors[0]?.name,
      selectedImage: product.images && product.images[0],
      quantity: 1,
    });
    setIsCheckoutOpen(true);
  };

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach(product => {
      addToCart(product, undefined, undefined, 1, false, product.images && product.images[0]);
    });
  };

  const handleBrowseCatalog = () => {
    setIsWishlistOpen(false);
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 flex flex-col max-h-[90vh] z-10 animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-['Hind_Siliguri'] leading-tight">
                  পছন্দের তালিকা (উইশলিস্ট)
                </h3>
                <span className="bg-white/25 text-white font-bold text-xs px-2 py-0.5 rounded-full">
                  {wishlistedProducts.length} টি
                </span>
              </div>
              <p className="text-[11px] text-pink-100">
                আপনার পছন্দের সংরক্ষিত পোশাকসমূহ
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {wishlistedProducts.length === 0 ? (
            /* Empty State */
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center text-rose-300">
                <Heart className="w-10 h-10 stroke-1" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-lg font-bold text-slate-800 font-['Hind_Siliguri']">
                  আপনার পছন্দের তালিকাটি খালি!
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  পণ্য ব্রাউজ করার সময় পোশাকের উপরে থাকা হার্ট (<Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500 -mt-0.5" />) আইকনে ক্লিক করে আপনার পছন্দের পোশাক এখানে সংরক্ষণ করে রাখতে পারবেন।
                </p>
              </div>
              <button
                onClick={handleBrowseCatalog}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>পোশাক কালেকশন দেখুন</span>
              </button>
            </div>
          ) : (
            /* Items List */
            <>
              {/* Batch action bar */}
              <div className="flex items-center justify-between bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-xs">
                <span className="font-semibold text-rose-900">
                  মোট {wishlistedProducts.length} টি পছন্দের পোশাক পাওয়া গেছে
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddAllToCart}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <ShoppingBasket className="w-3.5 h-3.5" />
                    <span>সবগুলো কার্টে নিন</span>
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="text-slate-500 hover:text-rose-600 font-medium px-2 py-1 transition-colors flex items-center gap-1"
                    title="তালিকা খালি করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>খালি করুন</span>
                  </button>
                </div>
              </div>

              {/* Product cards in wishlist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {wishlistedProducts.map((product) => {
                  const discountPercent = Math.round(
                    ((product.regularPrice - product.price) / product.regularPrice) * 100
                  );

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-rose-100 p-3 shadow-xs hover:shadow-md transition-all flex gap-3 relative overflow-hidden"
                    >
                      {/* Image Thumbnail */}
                      <div 
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-rose-50/50 shrink-0 cursor-pointer relative"
                        onClick={() => {
                          setSelectedProductModal(product);
                          setIsWishlistOpen(false);
                        }}
                      >
                        <img
                          src={(product.images && product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                          alt={product.bengaliName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        {discountPercent > 0 && (
                          <span className="absolute top-1 left-1 bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded shadow-xs">
                            {discountPercent}% ছাড়
                          </span>
                        )}
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                              {getCategoryTitle(product)}
                            </span>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              title="উইশলিস্ট থেকে মুছুন"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <h4 
                            className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 hover:text-rose-600 cursor-pointer"
                            onClick={() => {
                              setSelectedProductModal(product);
                              setIsWishlistOpen(false);
                            }}
                          >
                            {product.bengaliName}
                          </h4>

                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-sm font-bold text-rose-600 font-['Outfit']">
                              ৳{product.price.toLocaleString()}
                            </span>
                            {product.regularPrice > product.price && (
                              <span className="text-[11px] text-slate-400 line-through font-['Outfit']">
                                ৳{product.regularPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3 text-rose-600" />
                            <span>কার্টে নিন</span>
                          </button>

                          <button
                            onClick={(e) => handleDirectBuy(e, product)}
                            className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>অর্ডার করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-rose-50/50 border-t border-rose-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {wishlistedProducts.length > 0 
              ? `মোট ${wishlistedProducts.length} টি পছন্দের পোশাক সংরক্ষিত`
              : 'কোনো পোশাক সংরক্ষিত নেই'}
          </span>
          <button
            onClick={handleClose}
            className="text-xs font-bold text-slate-700 hover:text-rose-600 px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
