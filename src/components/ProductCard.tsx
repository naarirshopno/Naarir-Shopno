import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Star, Heart, Flame, Share2, Sparkles, Video } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { 
    toggleWishlist,
    isInWishlist,
    settings
  } = useShop();

  const { t, formatPrice, formatNumber, translateCategory, translateProductName, isEnglish } = useLanguage();

  const navigate = useNavigate();

  const displayCategory = React.useMemo(() => {
    const cats = Array.isArray(settings.categories) ? settings.categories : [];
    const found = cats.find(c => c.id === product.category);
    const rawCat = found
      ? found.title
      : (product.categoryBengali && product.categoryBengali !== 'থ্রি-পিস'
          ? product.categoryBengali
          : cats[0]?.title || product.categoryBengali || 'পোশাক');
    return translateCategory(rawCat);
  }, [product.category, product.categoryBengali, settings.categories, translateCategory]);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const [activeImg, setActiveImg] = useState<string>(
    (product.images && product.images.length > 0 && product.images[0]) || FALLBACK_IMAGE
  );

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      setActiveImg(product.images[0]);
    }
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
    setToastFeedback(nextSaved ? t('card.wishlist_added') : t('card.wishlist_removed'));
    setTimeout(() => setToastFeedback(null), 2000);
  };

  // Share Handler: Copies direct product link to clipboard with Web Share API support
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/product/${product.id}`;
    const prodTitle = translateProductName(product);
    const brandName = t('brand.name');
    const shareTitle = `${prodTitle} | ${brandName}`;
    const shareText = isEnglish
      ? `${brandName} - ${prodTitle}\nPrice: ${formatPrice(product.price)}. Check the link to order: ${shareUrl}`
      : `${brandName} - ${prodTitle}\nমূল্য: ${formatPrice(product.price)} টাকা। সরাসরি অর্ডার করতে লিংকটি দেখুন: ${shareUrl}`;

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
          setToastFeedback(t('card.link_copied'));
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
      setToastFeedback(t('card.link_copied'));
    } catch {
      setToastFeedback(isEnglish ? 'Share link ready' : 'শেয়ার লিংক প্রস্তুত');
    }
    setTimeout(() => setToastFeedback(null), 2000);
  };

  const discountPercent = Math.round(
    ((product.regularPrice - product.price) / product.regularPrice) * 100
  );

  const isOutOfStock = product.stockCount === 0 || (product.stockCount !== undefined && product.stockCount <= 0) || !product.inStock;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
        delay: index !== undefined ? Math.min((index % 4) * 0.05, 0.2) : 0,
      }}
      className="group visit-white-border-box rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Badges (Top Left) */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none max-w-[65%]">
        {discountPercent > 0 && !isOutOfStock && (
          <span className="bg-rose-600 text-white font-bold text-[9px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-sm w-fit">
            {formatNumber(discountPercent)}% {t('card.off')}
          </span>
        )}
        {product.isNew && !isOutOfStock && (
          <span className="bg-emerald-600 text-white font-semibold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-sm w-fit">
            {t('card.new')}
          </span>
        )}
        {product.isTrending && !isOutOfStock && (
          <span className="bg-amber-500 text-white font-semibold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-sm w-fit">
            {t('card.hot')}
          </span>
        )}
        {/* Low Stock Badge (Urgency for customers when stock < 5 and > 0) */}
        {!isOutOfStock && product.stockCount !== undefined && product.stockCount > 0 && product.stockCount < 5 && (
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20 animate-pulse w-fit whitespace-nowrap">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-amber-300 shrink-0" />
            <span>{t('card.low_stock')} ({formatNumber(product.stockCount)}{t('card.items')})</span>
          </span>
        )}
        {/* Conditional 'স্টক আউট' UI Badge when stock count is zero */}
        {isOutOfStock && (
          <span className="bg-rose-950/95 text-rose-100 font-bold text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-rose-500/50 w-fit backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{t('card.out_of_stock')}</span>
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
          title={isSaved ? t('card.remove_wishlist') : t('card.add_wishlist')}
          aria-label={isSaved ? t('card.remove_wishlist') : t('card.add_wishlist')}
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
          title={isEnglish ? 'Copy product link to share' : 'প্রোডাক্ট লিংক কপি করুন (Share with Friends)'}
          aria-label={isEnglish ? `Copy link for ${translateProductName(product)}` : `${translateProductName(product)} লিংক কপি করুন`}
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
          alt={translateProductName(product)}
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
              <span>{t('card.out_of_stock')}</span>
            </span>
          </div>
        )}

        {/* Hover View Product Hint Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
            <div className="bg-slate-900/80 text-white text-xs font-bold py-2 px-4 rounded-full shadow-xl border border-white/30 backdrop-blur-xs flex items-center gap-1.5 transform scale-90 group-hover:scale-100 transition-transform">
              <Eye className="w-4 h-4 text-rose-300" />
              <span>{t('card.view_details')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider truncate">
              {displayCategory}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{formatNumber(product.rating)}</span>
            </div>
          </div>

          {/* Title (Bengali / English based on language preference) */}
          <h3 
            className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 hover:text-rose-600 transition-colors font-['Hind_Siliguri'] leading-snug cursor-pointer"
            title={isEnglish ? (product.name || product.bengaliName) : product.bengaliName}
          >
            {isEnglish ? (product.name || product.bengaliName) : product.bengaliName}
          </h3>
        </div>

        {/* Price & Stock Badge Row */}
        <div className="mt-2.5 pt-2 border-t border-rose-50 flex items-center justify-between gap-2 flex-wrap">
          {/* Price & Crossed-Out Regular Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-rose-700 font-['Outfit']">
              {formatPrice(product.price)}
            </span>
            {product.regularPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-['Outfit']">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Stock Count Badge */}
          {product.stockCount !== undefined && (
            <span 
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0 ${
                isOutOfStock
                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                  : product.stockCount < 5
                  ? 'text-red-700 bg-red-50 border border-red-200 shadow-2xs font-extrabold'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-100 font-semibold'
              }`}
              title={isOutOfStock ? t('card.out_of_stock') : `${t('card.stock')}: ${formatNumber(product.stockCount)}${t('card.items')}`}
            >
              {isOutOfStock ? (
                <span>{t('card.out_of_stock')}</span>
              ) : product.stockCount < 5 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span>{t('card.stock')}: {formatNumber(product.stockCount)}{t('card.items')}</span>
                </>
              ) : (
                <span>{t('card.stock')}: {formatNumber(product.stockCount)}{t('card.items')}</span>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
