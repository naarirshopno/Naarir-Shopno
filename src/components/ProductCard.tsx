import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Eye, Star, Heart, Flame, Share2, Sparkles, Video } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    toggleWishlist,
    isInWishlist,
    settings
  } = useShop();

  const navigate = useNavigate();

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

  const [videoError, setVideoError] = useState(false);
  const modelVideo = product.videoUrl?.trim() || '';

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      setActiveImg(product.images[0]);
    }
    setVideoError(false);
  }, [product]);

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

  // Share Handler: Copies direct product link to clipboard with Web Share API support
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/product/${product.id}`;
    const shareTitle = `${product.bengaliName} | নারীর স্বপ্ন`;
    const shareText = `নারীর স্বপ্ন - ${product.bengaliName}\nমূল্য: ৳${product.price.toLocaleString()} টাকা। সরাসরি অর্ডার করতে লিংকটি দেখুন: ${shareUrl}`;

    // 1. Always copy the direct product link to clipboard first
    copyShareLink(shareUrl);

    // 2. If mobile device supports Web Share API, open native share options too
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        // User dismiss or abort is normal
      }
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

  return (
    <div 
      className="group bg-white rounded-2xl border border-rose-100/80 hover:border-pink-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
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

        {/* Share Button (Copies direct product link to clipboard) */}
        <button
          id={`btn-share-${product.id}`}
          type="button"
          onClick={handleShare}
          title="প্রোডাক্ট লিংক কপি করুন (Share with Friends)"
          aria-label={`${product.bengaliName} লিংক কপি করুন`}
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

      {/* Image Container with 1st Thumb Model Video */}
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

        {/* 1st Thumbnail AI Video: Female model wearing and showcasing clothes */}
        {modelVideo && !videoError && !isOutOfStock && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 pointer-events-none group-hover:scale-105"
          >
            <source src={modelVideo} type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-stylish-woman-walking-on-a-street-41584-large.mp4" type="video/mp4" />
          </video>
        )}

        {/* Model Look Badge on Product First Thumbnail */}
        {modelVideo && !videoError && !isOutOfStock && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
              <Sparkles className="w-2.5 h-2.5 text-pink-300 shrink-0" />
              <span>মডেল লুক</span>
            </span>
          </div>
        )}

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

        {/* Hover View Product Hint Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
            <div className="bg-slate-900/80 text-white text-xs font-bold py-2 px-4 rounded-full shadow-xl border border-white/30 backdrop-blur-xs flex items-center gap-1.5 transform scale-90 group-hover:scale-100 transition-transform">
              <Eye className="w-4 h-4 text-rose-300" />
              <span>বিস্তারিত দেখুন</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider truncate">
              {displayCategory}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Bengali Title */}
          <h3 
            className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-rose-600 transition-colors font-['Hind_Siliguri'] leading-snug cursor-pointer"
            title={product.bengaliName}
          >
            {product.bengaliName}
          </h3>
        </div>

        {/* Price & Stock Badge Row */}
        <div className="mt-2.5 pt-2 border-t border-rose-50 flex items-center justify-between gap-2 flex-wrap">
          {/* Price & Crossed-Out Regular Price */}
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

          {/* Stock Count Badge */}
          {product.stockCount !== undefined && (
            <span 
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0 ${
                isOutOfStock
                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                  : product.stockCount < 5
                  ? 'text-red-700 bg-red-50 border border-red-200 shadow-2xs font-extrabold'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-100 font-semibold'
              }`}
              title={isOutOfStock ? 'পণ্যটি বর্তমানে স্টক আউট' : `বর্তমান স্টক সংখ্যা: ${product.stockCount}টি`}
            >
              {isOutOfStock ? (
                <span>স্টক আউট</span>
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
      </div>
    </div>
  );
};
