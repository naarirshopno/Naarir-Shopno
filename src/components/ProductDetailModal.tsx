import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  Star, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  Phone,
  Check,
  ChevronRight,
  MessageSquare,
  Heart,
  FileText,
  Sparkles,
  Info,
  Share2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { CustomerReviews } from './CustomerReviews';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductModal, 
    setSelectedProductModal, 
    addToCart, 
    setDirectCheckoutItem, 
    setIsCheckoutOpen,
    toggleWishlist,
    isInWishlist,
    settings 
  } = useShop();

  const {
    isEnglish,
    formatPrice,
    formatNumber,
    translateCategory,
    translateProductName,
    translateColor,
    translateSize,
    translateFabric,
    translateSupportHours,
  } = useLanguage();

  const product = selectedProductModal;
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  // Image magnification state (Top-level hooks)
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const displayCategory = React.useMemo(() => {
    if (!product) return 'পোশাক';
    const cats = Array.isArray(settings.categories) ? settings.categories : [];
    const found = cats.find(c => c.id === product.category);
    if (found) return found.title;
    if (product.categoryBengali && product.categoryBengali !== 'থ্রি-পিস') {
      return product.categoryBengali;
    }
    return cats[0]?.title || product.categoryBengali || 'পোশাক';
  }, [product, settings.categories]);

  useEffect(() => {
    if (product) {
      setSelectedImg(null);
      setSelectedSize(product.sizes[0] || 'Standard');
      setSelectedColor(product.colors[0]?.name || '');
      setQuantity(1);
      setAddedToast(false);
      setShareToast(null);
      setIsZooming(false);
      setZoomPos({ x: 50, y: 50 });
    }
  }, [product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomPos({ x: 50, y: 50 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  if (!product) return null;

  const scrollToReviews = () => {
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeImage = selectedImg || (product.images && product.images.length > 0 && product.images[0]) || FALLBACK_IMAGE;

  const discountPercent = Math.round(
    ((product.regularPrice - product.price) / product.regularPrice) * 100
  );

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity, false, activeImage);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleInstantBuy = () => {
    setDirectCheckoutItem({
      product,
      selectedSize,
      selectedColor,
      selectedImage: activeImage,
      quantity,
    });
    setSelectedProductModal(null);
    setIsCheckoutOpen(true);
  };

  const productDisplayName = translateProductName(product);

  const handleShareModal = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/?product=${product.id}`;
    const shareTitle = isEnglish ? `${productDisplayName} | Naarir Shopno` : `${productDisplayName} | নারীর স্বপ্ন`;
    const shareText = isEnglish
      ? `Naarir Shopno - ${productDisplayName}\nPrice: ${formatPrice(product.price)}. Check link to order directly:`
      : `নারীর স্বপ্ন - ${productDisplayName}\nমূল্য: ${formatPrice(product.price)} টাকা। সরাসরি অর্ডার করতে লিংকটি দেখুন:`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareToast(isEnglish ? 'Shared successfully!' : 'শেয়ার সফল হয়েছে!');
        setTimeout(() => setShareToast(null), 2000);
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
          setShareToast(isEnglish ? 'Link copied to clipboard! 📋' : 'লিংক কপি করা হয়েছে! 📋');
          setTimeout(() => setShareToast(null), 2000);
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
      setShareToast(isEnglish ? 'Link copied to clipboard! 📋' : 'লিংক কপি করা হয়েছে! 📋');
    } catch {
      setShareToast(isEnglish ? 'Share link ready' : 'শেয়ার লিংক প্রস্তুত');
    }
    setTimeout(() => setShareToast(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
      onClick={() => setSelectedProductModal(null)}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-product-modal"
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Images Section */}
          <div className="md:col-span-6 p-4 sm:p-6 bg-rose-50/30 flex flex-col items-center">
            {/* Main Preview with Image Magnification */}
            <div 
              ref={imageContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsZooming(true)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsZooming(false)}
              className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-md border border-rose-100 mb-3 cursor-zoom-in select-none group/zoom"
              title={isEnglish ? 'Move cursor to magnify fabric and craftsmanship' : 'মাউস নাড়িয়ে কাপড়ের নিখুঁত বুনন ও কাজ বড় করে দেখুন'}
            >
              <img
                src={activeImage}
                alt={productDisplayName}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                  transition: isZooming ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out',
                }}
                className="w-full h-full object-cover object-top will-change-transform pointer-events-none"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              {/* Discount Badge */}
              {discountPercent > 0 && !isZooming && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow pointer-events-none">
                  {formatNumber(discountPercent)}% {isEnglish ? 'OFF' : 'ছাড়'}
                </div>
              )}

              {/* Hover to Zoom Instruction Hint (hidden when zooming) */}
              <div 
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 pointer-events-none flex items-center gap-1.5 whitespace-nowrap border border-white/20 ${
                  isZooming ? 'opacity-0 scale-90' : 'opacity-90 group-hover/zoom:opacity-100 scale-100'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5 text-rose-300" />
                <span>{isEnglish ? 'Hover to zoom fine fabric & detail' : 'মাউস দিয়ে কাপড়ের নিখুঁত ফেব্রিক ও কাজ জুম করুন'}</span>
              </div>

              {/* Zoom Active Indicator */}
              {isZooming && (
                <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none flex items-center gap-1 border border-white/20 animate-fadeIn">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isEnglish ? '2.5x Magnifier' : '2.5x ম্যাগনিফায়ার'}</span>
                </div>
              )}
            </div>

            {/* Thumbnail switcher if multiple images */}
            {product.images.filter(Boolean).length > 1 && (
              <div className="flex gap-2 w-full justify-center">
                {product.images.filter(Boolean).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImg(img);
                      setIsZooming(false);
                      setZoomPos({ x: 50, y: 50 });
                      if (product.colors && product.colors[idx]) {
                        setSelectedColor(product.colors[idx].name);
                      }
                    }}
                    className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImage === img ? 'border-rose-600 ring-2 ring-rose-200' : 'border-rose-100 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img || FALLBACK_IMAGE} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category, SKU & Star rating */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded">
                  {translateCategory(displayCategory)}
                </span>
                <span>{isEnglish ? 'Code:' : 'কোড:'} {product.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Hind_Siliguri'] leading-snug">
                {productDisplayName}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{formatNumber(product.rating)}</span>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  title={isEnglish ? 'Read customer reviews below' : 'নিচে কাস্টমারদের রিভিউ পড়ুন'}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>
                    {isEnglish
                      ? `(${formatNumber(product.reviewsCount)} Reviews)`
                      : `(${formatNumber(product.reviewsCount)} টি রিভিউ দেখুন)`}
                  </span>
                </button>
              </div>

              {/* Price Banner */}
              <div className="mt-4 p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-rose-700 font-['Outfit']">
                  {formatPrice(product.price)}
                </span>
                {product.regularPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-['Outfit']">
                    {formatPrice(product.regularPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {isEnglish
                      ? `Save ${formatPrice(product.regularPrice - product.price)}`
                      : `আপনার সাশ্রয় ${formatPrice(product.regularPrice - product.price)}`}
                  </span>
                )}
              </div>

              {/* Fabric Specs */}
              <div className="mt-4 text-xs text-slate-600 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="flex items-center gap-1.5">
                  <strong className="text-slate-800 shrink-0">{isEnglish ? 'Fabric Details:' : 'কাপড়ের বিবরণ:'}</strong>
                  <span className="text-slate-700">{translateFabric(product.fabric)}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <strong className="text-slate-800 shrink-0">{isEnglish ? 'Stock Status:' : 'স্টক অবস্থা:'}</strong>
                  {!product.inStock || (product.stockCount !== undefined && product.stockCount <= 0) ? (
                    <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200">
                      {isEnglish ? 'Out of Stock' : 'স্টক শেষ (আউট অব স্টক)'}
                    </span>
                  ) : product.stockCount !== undefined && product.stockCount < 5 ? (
                    <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>
                        {isEnglish
                          ? `Low Stock (Only ${formatNumber(product.stockCount)} left!)`
                          : `সীমিত স্টক (আর মাত্র ${formatNumber(product.stockCount)}টি বাকি!)`}
                      </span>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                      {isEnglish
                        ? `In Stock (${product.stockCount !== undefined ? `${formatNumber(product.stockCount)} available` : 'Ready to ship'})`
                        : `ইন স্টক (${product.stockCount !== undefined ? `${formatNumber(product.stockCount)}টি রেডি আছে` : 'পণ্যটি রেডি আছে'})`}
                    </span>
                  )}
                </p>
              </div>

              {/* Product Short Description Highlight */}
              {product.description && (
                <div className="mt-4 text-xs p-3.5 bg-rose-50/50 rounded-xl border border-rose-100/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 font-['Hind_Siliguri']">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isEnglish ? 'Description:' : 'পোশাকের বিবরণ (Description):'}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-['Hind_Siliguri']">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                    <span>{isEnglish ? 'Select Size:' : 'সাইজ বেছে নিন:'}</span>
                    <span className="text-rose-600 font-normal">{translateSize(selectedSize)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                          selectedSize === s
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {translateSize(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                    <span>{isEnglish ? 'Select Color:' : 'রঙ বেছে নিন:'}</span>
                    <span className="text-rose-600 font-normal">{translateColor(selectedColor)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c, cIdx) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedColor(c.name);
                          if (product.images && product.images.length > 0) {
                            const targetImg = product.images[cIdx] || product.images[cIdx % product.images.length];
                            if (targetImg) {
                              setSelectedImg(targetImg);
                            }
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          selectedColor === c.name
                            ? 'border-rose-600 ring-2 ring-rose-200 bg-rose-50 text-rose-800 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{translateColor(c.name)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800">{isEnglish ? 'Quantity:' : 'পরিমাণ:'}</span>
                <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden bg-rose-50/30">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-base font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-slate-800">{formatNumber(quantity)}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-base font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-3 border-t border-rose-100">
              <div className="flex gap-2.5 sm:gap-3">
                <button
                  id="btn-modal-instant-order"
                  onClick={handleInstantBuy}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm py-3 px-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>{isEnglish ? 'Order Now' : 'সরাসরি অর্ডার'}</span>
                </button>

                <button
                  id="btn-modal-add-cart"
                  onClick={handleAddToCart}
                  className={`flex-1 font-bold text-xs sm:text-sm py-3 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    addedToast
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-600 border-rose-300'
                  }`}
                >
                  {addedToast ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isEnglish ? 'Added!' : 'যোগ হয়েছে!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-rose-600" />
                      <span>{isEnglish ? 'Add to Bag' : 'কার্টে নিন'}</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-modal-wishlist"
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  title={isInWishlist(product.id) ? (isEnglish ? 'Remove from Wishlist' : 'পছন্দের তালিকা থেকে সরান') : (isEnglish ? 'Add to Wishlist' : 'পছন্দের তালিকায় রাখুন')}
                  aria-label={isInWishlist(product.id) ? (isEnglish ? 'Remove from Wishlist' : 'পছন্দের তালিকা থেকে সরান') : (isEnglish ? 'Add to Wishlist' : 'পছন্দের তালিকায় রাখুন')}
                  className={`px-3 py-3 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    isInWishlist(product.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-600 scale-102'
                      : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-transform ${isInWishlist(product.id) ? 'fill-rose-600 text-rose-600 scale-110' : ''}`} />
                </button>

                {/* Share Button (Web Share API) */}
                <button
                  id="btn-modal-share"
                  type="button"
                  onClick={handleShareModal}
                  title={isEnglish ? 'Share' : 'শেয়ার করুন (Web Share)'}
                  aria-label={isEnglish ? `Share ${productDisplayName}` : `${productDisplayName} শেয়ার করুন`}
                  className="px-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Share Feedback Toast */}
              {shareToast && (
                <div className="p-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center animate-fadeIn shadow-lg">
                  {shareToast}
                </div>
              )}

              {/* Call Hotline direct action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span>{isEnglish ? 'Direct Phone Support & Order:' : 'সরাসরি ফোন সাপোর্ট ও অর্ডার:'}</span>
                    {settings.supportHours && settings.supportHours.trim() ? (
                      <p className="text-[10px] text-emerald-600 font-semibold">{translateSupportHours(settings.supportHours)}</p>
                    ) : null}
                  </div>
                </div>
                <a
                  href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
                  className="font-bold text-rose-600 font-mono hover:underline self-start sm:self-auto bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 text-xs sm:text-sm"
                >
                  📞 {settings.hotline1 || '09617-541717'}
                </a>
              </div>

              {/* Guarantees small badges */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 text-center pt-1">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isEnglish ? 'Home Delivery' : 'হোম ডেলিভারি'}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEnglish ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
                  <span>{isEnglish ? '3-Day Exchange' : '৩ দিন এক্সচেঞ্জ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width Product Specifications & Details Tab Panel */}
          <div className="md:col-span-12 border-t border-rose-100 bg-white p-4 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
              <FileText className="w-5 h-5 text-rose-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                {isEnglish ? 'Full Product Details & Specifications' : 'পোশাকের সম্পূর্ণ বিবরণ ও স্পেসিফিকেশন (Full Details)'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Description */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 font-['Hind_Siliguri']">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isEnglish ? 'Design & Craftsmanship:' : 'ডিজাইন ও কাজের বিবরণ:'}</span>
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-['Hind_Siliguri'] whitespace-pre-line">
                  {product.description || (isEnglish ? `${productDisplayName} — Exclusive collection from Naarir Shopno.` : `${productDisplayName} - এক্সক্লুসিভ কালেকশনের সেরা পোশাক।`)}
                </div>
              </div>

              {/* Box 2: Specifications summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-700 font-['Hind_Siliguri']">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Info className="w-4 h-4 text-rose-600" />
                  <span>{isEnglish ? 'Specifications:' : 'বৈশিষ্ট্যসমূহ:'}</span>
                </h4>
                <div className="space-y-1.5">
                  <p><strong className="text-slate-800">{isEnglish ? 'Category:' : 'ক্যাটাগরি:'}</strong> {translateCategory(displayCategory)}</p>
                  <p><strong className="text-slate-800">{isEnglish ? 'Product Code (SKU):' : 'প্রোডাক্ট কোড (SKU):'}</strong> {product.sku}</p>
                  <p><strong className="text-slate-800">{isEnglish ? 'Fabric Type:' : 'কাপড়ের ধরন:'}</strong> {translateFabric(product.fabric)}</p>
                  {product.sizes && product.sizes.length > 0 && (
                    <p><strong className="text-slate-800">{isEnglish ? 'Available Sizes:' : 'উপলব্ধ সাইজ:'}</strong> {product.sizes.map(s => translateSize(s)).join(', ')}</p>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <p><strong className="text-slate-800">{isEnglish ? 'Available Colors:' : 'উপলব্ধ রঙ:'}</strong> {product.colors.map(c => translateColor(c.name)).join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section - Spans Full Width at Bottom of Modal */}
          <div 
            ref={reviewsSectionRef}
            className="md:col-span-12 border-t border-rose-100 bg-slate-50/60 p-4 sm:p-8"
          >
            <CustomerReviews productId={product.id} product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};
