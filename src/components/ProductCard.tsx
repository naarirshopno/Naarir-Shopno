import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Eye, Zap, Star, Check, Heart, Flame, Share2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    setSelectedProductModal, 
    setDirectCheckoutItem, 
    setIsCheckoutOpen,
    toggleWishlist,
    isInWishlist,
    settings
  } = useShop();

  const displayCategory = React.useMemo(() => {
    const cats = Array.isArray(settings.categories) ? settings.categories : [];
    const found = cats.find(c => c.id === product.category);
    if (found) return found.title;
    if (product.categoryBengali && product.categoryBengali !== 'থ্রি-পিস') {
      return product.categoryBengali;
    }
    return cats[0]?.title || product.categoryBengali || 'পোশাক';
  }, [product.category, product.categoryBengali, settings.categories]);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const [activeImg, setActiveImg] = useState<string>(
    (product.images && product.images.length > 0 && product.images[0]) || FALLBACK_IMAGE
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      setActiveImg(product.images[0]);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  const [addedAnimation, setAddedAnimation] = useState(false);

  // Local state for wishlist status of this item
  const [isSaved, setIsSaved] = useState<boolean>(() => isInWishlist(product.id));
  const [heartBurst, setHeartBurst] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Synchronize local state with global context/localStorage updates
  useEffect(() => {
    setIsSaved(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved); // local state update
    toggleWishlist(product.id);

    // Heart pop animation
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 500);

    // Visual toast feedback
    setToastFeedback(nextSaved ? 'পছন্দের তালিকায় সেভ হয়েছে!' : 'তালিকা থেকে সরানো হয়েছে');
    setTimeout(() => setToastFeedback(null), 2000);
  };

  // Web Share API Handler with Clipboard Fallback
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/?product=${product.id}`;
    const shareTitle = `${product.bengaliName} | নারীর স্বপ্ন`;
    const shareText = `নারীর স্বপ্ন - ${product.bengaliName}\nমূল্য: ৳${product.price.toLocaleString()} টাকা। সরাসরি অর্ডার করতে লিংকটি দেখুন:`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setToastFeedback('শেয়ার সফল হয়েছে!');
        setTimeout(() => setToastFeedback(null), 2000);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          copyShareLink(shareUrl);
        }
      }
    } else {
      copyShareLink(shareUrl);
    }
  };

  const copyShareLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setToastFeedback('লিংক কপি করা হয়েছে! 📋');
          setTimeout(() => setToastFeedback(null), 2000);
        })
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (url: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setToastFeedback('লিংক কপি করা হয়েছে! 📋');
    } catch {
      setToastFeedback('শেয়ার লিংক প্রস্তুত');
    }
    setTimeout(() => setToastFeedback(null), 2000);
  };

  const discountPercent = Math.round(
    ((product.regularPrice - product.price) / product.regularPrice) * 100
  );

  const isOutOfStock = product.stockCount === 0 || (product.stockCount !== undefined && product.stockCount <= 0) || !product.inStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      setToastFeedback('পণ্যটি বর্তমানে স্টক আউট!');
      setTimeout(() => setToastFeedback(null), 2000);
      return;
    }
    addToCart(product, product.sizes?.[0] || 'Standard', selectedColor || product.colors?.[0]?.name, 1, false, activeImg);
    setAddedAnimation(true);
    setToastFeedback('কার্টে যুক্ত হয়েছে! 🛍️');
    setTimeout(() => {
      setAddedAnimation(false);
      setToastFeedback(null);
    }, 1800);
  };

  const handleInstantBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      setToastFeedback('পণ্যটি বর্তমানে স্টক আউট!');
      setTimeout(() => setToastFeedback(null), 2000);
      return;
    }
    setDirectCheckoutItem({
      product,
      selectedSize: product.sizes[0] || 'Standard',
      selectedColor: selectedColor || product.colors[0]?.name,
      selectedImage: activeImg,
      quantity: 1,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      className="group bg-white rounded-2xl border border-rose-100/80 hover:border-pink-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
      onClick={() => setSelectedProductModal(product)}
    >
      {/* Badges (Top Left) */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none max-w-[55%]">
        {discountPercent > 0 && !isOutOfStock && (
          <span className="bg-rose-600 text-white font-bold text-[9px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-sm w-fit">
            {discountPercent}% ছাড়
          </span>
        )}
        {product.isNew && !isOutOfStock && (
          <span className="bg-emerald-600 text-white font-semibold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-sm w-fit">
            নতুন
          </span>
        )}
        {product.isTrending && !isOutOfStock && (
          <span className="bg-amber-500 text-white font-semibold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-sm w-fit">
            হট
          </span>
        )}
        {/* Low Stock Badge (Urgency for customers when stock < 5 and > 0) */}
        {!isOutOfStock && product.stockCount !== undefined && product.stockCount > 0 && product.stockCount < 5 && (
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20 animate-pulse w-fit whitespace-nowrap">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-amber-300 shrink-0" />
            <span>Low Stock ({product.stockCount}টি)</span>
          </span>
        )}
        {/* Conditional 'স্টক আউট' UI Badge when stock count is zero */}
        {isOutOfStock && (
          <span className="bg-rose-950/95 text-rose-100 font-bold text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-rose-500/50 w-fit backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>স্টক আউট</span>
          </span>
        )}
      </div>

      {/* Top Right Action Buttons: Wishlist & Share */}
      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20 flex flex-col gap-1.5">
        {/* Wishlist Button */}
        <button
          id={`btn-wishlist-${product.id}`}
          type="button"
          onClick={handleToggleWishlist}
          title={isSaved ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় যোগ করুন"}
          aria-label={isSaved ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় যোগ করুন"}
          className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            isSaved 
              ? 'bg-rose-600 text-white scale-105 shadow-rose-300/60 ring-2 ring-white' 
              : 'bg-white/95 text-slate-600 hover:text-rose-600 hover:bg-white hover:scale-110 shadow-xs'
          }`}
        >
          <Heart 
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
              isSaved ? 'fill-white stroke-white' : 'stroke-current'
            } ${heartBurst ? 'scale-125' : ''}`} 
          />
        </button>

        {/* Share Button (Web Share API) */}
        <button
          id={`btn-share-${product.id}`}
          type="button"
          onClick={handleShare}
          title="শেয়ার করুন (সোশ্যাল মিডিয়া বা মেসেজিং অ্যাপে)"
          aria-label={`${product.bengaliName} শেয়ার করুন`}
          className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md bg-white/95 text-slate-600 hover:text-rose-600 hover:bg-white hover:scale-110 shadow-xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 hover:text-rose-600 transition-colors" />
        </button>
      </div>

      {/* Instant Feedback Toast */}
      {toastFeedback && (
        <div className="absolute top-22 sm:top-24 right-2.5 sm:right-3 z-30 bg-slate-900/95 text-white text-[10px] font-medium py-1 px-2.5 rounded-lg shadow-lg animate-fadeIn pointer-events-none whitespace-nowrap border border-white/20">
          {toastFeedback}
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-rose-50/50 cursor-pointer">
        <img
          src={activeImg || (product.images && product.images.length > 0 && product.images[0]) || FALLBACK_IMAGE}
          alt={product.bengaliName}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />

        {/* Out of Stock Image Center Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-10">
            <span className="bg-rose-950/95 text-rose-100 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-2xl border border-rose-500/50 flex items-center gap-1.5 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>স্টক আউট</span>
            </span>
          </div>
        )}

        {/* Quick View Eye Icon Overlay (Center on hover) */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
            <button
              type="button"
              id={`btn-quick-view-eye-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProductModal(product);
              }}
              title="পোশাকের বিস্তারিত দেখুন (Quick View)"
              aria-label={`${product.bengaliName} Quick View`}
              className="pointer-events-auto bg-slate-900/80 hover:bg-rose-600 text-white text-xs font-bold py-2 px-3.5 rounded-full shadow-xl border border-white/40 hover:border-white transition-all transform scale-80 group-hover:scale-100 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Quick View</span>
            </button>
          </div>
        )}

        {/* Desktop Hover Action Bar: Quick Add to Cart & Quick View */}
        <div className="hidden sm:flex absolute bottom-3 left-2.5 right-2.5 gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10 pointer-events-auto">
          <button
            type="button"
            id={`btn-desktop-quick-add-${product.id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 text-white text-xs font-bold py-2.5 px-2 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 ${
              isOutOfStock
                ? 'bg-slate-700/80 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 hover:shadow-xl active:scale-95 cursor-pointer'
            }`}
            title={isOutOfStock ? 'পণ্যটি বর্তমানে স্টক আউট' : 'দ্রুত কার্টে যোগ করুন (Quick Add to Cart)'}
            aria-label={`${product.bengaliName} কার্টে যোগ করুন`}
          >
            {isOutOfStock ? (
              <span className="truncate text-rose-200">স্টক আউট</span>
            ) : addedAnimation ? (
              <>
                <Check className="w-4 h-4 text-emerald-200 stroke-[2.5] shrink-0" />
                <span className="truncate">যুক্ত হয়েছে!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">Quick Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductModal(product);
            }}
            className="bg-white/95 hover:bg-white text-slate-800 hover:text-rose-600 text-xs font-bold py-2.5 px-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer shrink-0"
            title="পোশাকের বিস্তারিত বিবরণ দেখুন"
            aria-label="বিস্তারিত দেখুন"
          >
            <Eye className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="hidden xl:inline text-[11px]">বিস্তারিত</span>
          </button>
        </div>

        {/* Mobile Quick View Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProductModal(product);
          }}
          className="sm:hidden absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white/95 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md opacity-90 transition-all flex items-center gap-1 hover:bg-rose-50 hover:text-rose-600 whitespace-nowrap z-10 cursor-pointer"
          title="পোশাকের বিস্তারিত বিবরণ দেখুন"
        >
          <Eye className="w-3.5 h-3.5 text-rose-600" />
          <span>বিস্তারিত দেখুন</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              {displayCategory}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Bengali Title */}
          <h3 
            className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-rose-600 transition-colors font-['Hind_Siliguri'] cursor-pointer"
            title={product.bengaliName}
          >
            {product.bengaliName}
          </h3>

          {/* Color Dots & Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center -space-x-0.5">
                {product.colors.slice(0, 4).map((c, cIdx) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(c.name);
                      if (product.images && product.images[cIdx]) {
                        setActiveImg(product.images[cIdx]);
                      }
                    }}
                    onMouseEnter={() => {
                      if (product.images && product.images[cIdx]) {
                        setActiveImg(product.images[cIdx]);
                      }
                    }}
                    className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                      selectedColor === c.name
                        ? 'ring-2 ring-rose-500 scale-110 z-10 border-white'
                        : 'border-black/20 hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              {product.colors.length > 4 && (
                <span className="text-[9px] text-slate-400 font-bold">+{product.colors.length - 4}</span>
              )}
              {selectedColor && (
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">{selectedColor}</span>
              )}
            </div>
          )}

          {/* Fabric preview & View Details */}
          <div 
            className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-light cursor-pointer group/desc hover:text-rose-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductModal(product);
            }}
            title="পোশাকের বিস্তারিত বিবরণ পড়তে ক্লিক করুন"
          >
            <p className="line-clamp-1 flex-1 font-['Hind_Siliguri']">
              {product.fabric}
            </p>
            <span className="text-[10px] font-bold text-rose-600 group-hover/desc:underline shrink-0 ml-1.5 flex items-center">
              বিস্তারিত ›
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-rose-50">
          {/* Price & Stock Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-rose-700 font-['Outfit']">
                ৳{product.price.toLocaleString()}
              </span>
              {product.regularPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-['Outfit']">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Count Badge on Card (Guaranteed not to overflow boundary) */}
            {product.stockCount !== undefined && (
              <span 
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0 ${
                  isOutOfStock
                    ? 'text-rose-700 bg-rose-50 border border-rose-200'
                    : product.stockCount < 5
                    ? 'text-red-700 bg-red-50 border border-red-200 shadow-2xs font-extrabold'
                    : 'text-emerald-700 bg-emerald-50 border border-emerald-100 font-semibold'
                }`}
                title={isOutOfStock ? 'পণ্যটি বর্তমানে স্টক আউট' : `বর্তমান স্টক সংখ্যা: ${product.stockCount}টি`}
              >
                {isOutOfStock ? (
                  <span className="font-bold">স্টক আউট</span>
                ) : product.stockCount < 5 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span>স্টক: {product.stockCount}টি</span>
                  </>
                ) : (
                  <span>স্টক: {product.stockCount}টি</span>
                )}
              </span>
            )}
          </div>

          {/* Action Buttons: Instant Order & Add to Cart */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-order-instant-${product.id}`}
              onClick={handleInstantBuy}
              disabled={isOutOfStock}
              className={`w-full font-bold text-xs py-2 px-1 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white hover:shadow active:scale-95 cursor-pointer'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isOutOfStock ? 'স্টক আউট' : 'অর্ডার করুন'}</span>
            </button>

            <button
              id={`btn-add-cart-${product.id}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full font-bold text-xs py-2 px-1 rounded-xl border transition-all flex items-center justify-center gap-1 ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80'
                  : addedAnimation
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 active:scale-95 cursor-pointer'
                  : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-rose-200 active:scale-95 cursor-pointer'
              }`}
            >
              {isOutOfStock ? (
                <span>স্টক আউট</span>
              ) : addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>যুক্ত হয়েছে</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                  <span>কার্টে নিন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
