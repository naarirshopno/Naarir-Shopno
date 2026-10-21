import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { CustomerReviews } from '../components/CustomerReviews';
import { ProductCard } from '../components/ProductCard';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Zap, 
  Star, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  Phone, 
  Check, 
  ChevronRight, 
  Heart, 
  FileText, 
  Sparkles, 
  Info, 
  Share2, 
  ZoomIn, 
  Flame, 
  SearchX 
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const { 
    products, 
    addToCart, 
    setDirectCheckoutItem, 
    isInWishlist, 
    toggleWishlist, 
    settings 
  } = useShop();

  const product = products.find((p) => p.id === productId);

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Image Magnification State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

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

  const activeImage =
    selectedImg ||
    (product?.images && product.images.length > 0 && product.images[0]) ||
    FALLBACK_IMAGE;

  const discountPercent = product
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock =
    !product ||
    product.stockCount === 0 ||
    (product.stockCount !== undefined && product.stockCount <= 0) ||
    !product.inStock;

  const displayCategory = React.useMemo(() => {
    if (!product) return 'পোশাক';
    const cats = Array.isArray(settings.categories) ? settings.categories : [];
    const found = cats.find((c) => c.id === product.category);
    if (found) return found.title;
    return product.categoryBengali || 'পোশাক';
  }, [product, settings.categories]);

  // Related products from same category
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [products, product]);

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

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity, true, activeImage);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleInstantBuy = () => {
    if (!product || isOutOfStock) return;
    setDirectCheckoutItem({
      product,
      selectedSize,
      selectedColor,
      selectedImage: activeImage,
      quantity,
    });
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = `${product.bengaliName} | নারীর স্বপ্ন`;
    const shareText = `নারীর স্বপ্ন - ${product.bengaliName}\nমূল্য: ৳${product.price.toLocaleString()} টাকা। সরাসরি অর্ডার করতে লিংকটি দেখুন: ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareToast('লিংক কপি করা হয়েছে! 📋');
        setTimeout(() => setShareToast(null), 2000);
      });
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        // Abort is normal
      }
    }
  };

  const scrollToReviews = () => {
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <SearchX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 font-['Hind_Siliguri']">
          পোশাকটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-slate-500">
          সম্ভবত পণ্যটি সরিয়ে নেওয়া হয়েছে অথবা ভুল লিংকে প্রবেশ করা হয়েছে।
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>হোম পেজে ফিরে যান</span>
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* 1. Breadcrumbs & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="text-slate-600 hover:text-rose-600 font-medium">
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/category/${product.category}`} className="text-slate-600 hover:text-rose-600 font-medium hover:underline">
            {displayCategory}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-rose-700 font-bold truncate max-w-[200px] sm:max-w-xs">
            {product.bengaliName}
          </span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-full border border-slate-200 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>পেছনে ফিরুন</span>
        </button>
      </div>

      {/* 2. Main Product Showcase (2-Column Desktop, 1-Column Mobile) */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery with 2.5x Magnifier */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div 
            ref={imageContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsZooming(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsZooming(false)}
            className="relative w-full aspect-[3/4] max-w-lg rounded-3xl overflow-hidden bg-rose-50/30 shadow-md border border-rose-100 mb-4 cursor-zoom-in select-none group/zoom"
            title="মাউস নাড়িয়ে কাপড়ের নিখুঁত বুনন ও কাজ বড় করে দেখুন"
          >
            <img
              src={activeImage}
              alt={product.bengaliName}
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

            {/* Badges Container */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
              {discountPercent > 0 && !isOutOfStock && (
                <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {discountPercent}% ছাড়
                </span>
              )}
              {product.isNew && !isOutOfStock && (
                <span className="bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow">
                  নতুন
                </span>
              )}
              {product.isTrending && !isOutOfStock && (
                <span className="bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow">
                  হট কালেকশন
                </span>
              )}
              {!isOutOfStock && product.stockCount !== undefined && product.stockCount > 0 && product.stockCount < 5 && (
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Low Stock ({product.stockCount}টি বাকি)</span>
                </span>
              )}
              {isOutOfStock && (
                <span className="bg-rose-950/95 text-rose-100 font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-rose-500/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>স্টক আউট</span>
                </span>
              )}
            </div>

            {/* Top Right Floating Actions: Wishlist & Share */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isSaved
                    ? 'bg-rose-600 text-white scale-105 ring-2 ring-white'
                    : 'bg-white/95 text-slate-700 hover:text-rose-600 hover:bg-white'
                }`}
                title={isSaved ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় রাখুন"}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-white stroke-white' : 'stroke-current'}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="w-9 h-9 rounded-full bg-white/95 text-slate-700 hover:text-rose-600 hover:bg-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="প্রোডাক্ট লিংক কপি ও শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Share Toast */}
            {shareToast && (
              <div className="absolute top-14 right-3 z-20 bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-white/20 animate-fadeIn">
                {shareToast}
              </div>
            )}

            {/* Magnifier Lens Guide when zooming */}
            {isZooming && (
              <div 
                className="absolute pointer-events-none w-28 h-28 rounded-full border-2 border-white/90 shadow-[0_0_20px_rgba(0,0,0,0.35)] -translate-x-1/2 -translate-y-1/2 ring-2 ring-rose-500/50 bg-white/5"
                style={{
                  left: `${zoomPos.x}%`,
                  top: `${zoomPos.y}%`,
                }}
              />
            )}

            {/* Hover to Zoom Instruction Hint */}
            <div 
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-lg transition-all duration-300 pointer-events-none flex items-center gap-1.5 whitespace-nowrap border border-white/20 ${
                isZooming ? 'opacity-0 scale-90' : 'opacity-90 group-hover/zoom:opacity-100 scale-100'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5 text-rose-300" />
              <span>মাউস দিয়ে কাপড়ের নিখুঁত ফেব্রিক ও কাজ জুম করুন</span>
            </div>

            {isZooming && (
              <div className="absolute top-3 right-14 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none flex items-center gap-1 border border-white/20 animate-fadeIn">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>2.5x ম্যাগনিফায়ার</span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images.filter(Boolean).length > 1 && (
            <div className="flex gap-2.5 w-full justify-center flex-wrap">
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
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === img ? 'border-rose-600 ring-2 ring-rose-200 scale-105' : 'border-rose-100 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img || FALLBACK_IMAGE} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Selectors & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category, SKU & Rating */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <Link 
                to={`/category/${product.category}`}
                className="font-bold text-rose-600 uppercase bg-rose-50 hover:bg-rose-100 hover:text-rose-800 transition px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer"
                title={`${displayCategory} ক্যাটাগরির সবগুলো পণ্য দেখুন`}
              >
                {displayCategory}
              </Link>
              <span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                কোড: {product.sku}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri'] leading-tight">
              {product.bengaliName}
            </h1>

            {/* Rating Trigger to Reviews */}
            <div 
              onClick={scrollToReviews}
              className="flex items-center gap-2 cursor-pointer group w-fit"
              title="কাস্টমারদের রিভিউ ও রেটিং পড়তে ক্লিক করুন"
            >
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold font-['Outfit']">{product.rating}</span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 group-hover:text-rose-600 group-hover:underline font-medium">
                {product.reviewsCount || 0} টি কাস্টমার রিভিউ দেখুন
              </span>
            </div>

            {/* Price & Stock Row */}
            <div className="p-4 bg-gradient-to-r from-rose-50/60 to-pink-50/40 rounded-2xl border border-rose-100 flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-rose-700 font-['Outfit']">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.regularPrice > product.price && (
                  <span className="text-base text-slate-400 line-through font-['Outfit']">
                    ৳{product.regularPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    {discountPercent}% ছাড়
                  </span>
                )}
              </div>

              {/* Stock Status Badge */}
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>স্টক আউট</span>
                  </span>
                ) : product.stockCount !== undefined && product.stockCount < 5 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>মাত্র {product.stockCount}টি স্টকে বাকি</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>ইন স্টক ({product.stockCount || 10}টি উপলব্ধ)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Fabric Highlight */}
            <div className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 shrink-0">কাপড়ের বিবরণ:</span>
              <span className="font-['Hind_Siliguri']">{product.fabric}</span>
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">পছন্দের রঙ নির্বাচন করুন:</span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {selectedColor || product.colors[0]?.name}
                  </span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-rose-600 bg-rose-50 shadow-xs scale-102'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs font-bold text-slate-800">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">সাইজ নির্বাচন করুন:</span>
                  <span className="text-slate-500 font-medium">{selectedSize}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-800">পরিমাণ:</span>
              <div className="flex items-center border border-rose-200 rounded-xl overflow-hidden bg-rose-50/30">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-base font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-1.5 text-base font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-rose-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-page-instant-order"
                onClick={handleInstantBuy}
                disabled={isOutOfStock}
                className={`flex-1 font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white hover:shadow-xl active:scale-95 cursor-pointer'
                }`}
              >
                <Zap className="w-5 h-5 fill-current text-amber-300" />
                <span>{isOutOfStock ? 'স্টক আউট' : 'সরাসরি অর্ডার করুন'}</span>
              </button>

              <button
                id="btn-page-add-cart"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl border transition-all flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80'
                    : addedToast
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 active:scale-95 cursor-pointer'
                    : 'bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-600 border-rose-300 active:scale-95 cursor-pointer shadow-sm hover:shadow'
                }`}
              >
                {isOutOfStock ? (
                  <span>স্টক আউট</span>
                ) : addedToast ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>কার্টে যোগ হয়েছে! 🛍️</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-rose-600" />
                    <span>কার্টে যোগ করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Assurance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <Truck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ফ্রি হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <RefreshCw className="w-4 h-4 text-pink-600 shrink-0" />
                <span>৩ দিন সহজ এক্সচেঞ্জ</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>২৪/৭ হেল্পলাইন</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Description & Specifications */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
          <FileText className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
            পোশাকের সম্পূর্ণ বিবরণ ও স্পেসিফিকেশন
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5 font-['Hind_Siliguri']">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ডিজাইন ও কাজের বিবরণ:</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-['Hind_Siliguri'] whitespace-pre-line">
              {product.description || `${product.bengaliName} - এক্সক্লুসিভ কালেকশনের সেরা পোশাক।`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs text-slate-700 font-['Hind_Siliguri']">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-rose-600" />
              <span>বৈশিষ্ট্যসমূহ:</span>
            </h3>
            <div className="space-y-2">
              <p><strong className="text-slate-900">ক্যাটাগরি:</strong> {displayCategory}</p>
              <p><strong className="text-slate-900">প্রোডাক্ট কোড (SKU):</strong> {product.sku}</p>
              <p><strong className="text-slate-900">কাপড়ের ধরন:</strong> {product.fabric}</p>
              {product.sizes && product.sizes.length > 0 && (
                <p><strong className="text-slate-900">উপলব্ধ সাইজ:</strong> {product.sizes.join(', ')}</p>
              )}
              {product.colors && product.colors.length > 0 && (
                <p><strong className="text-slate-900">উপলব্ধ রঙ:</strong> {product.colors.map((c) => c.name).join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Customer Reviews Section */}
      <div ref={reviewsSectionRef} className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm">
        <CustomerReviews productId={product.id} product={product} />
      </div>

      {/* 5. Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Hind_Siliguri']">
              একই ক্যাটাগরির অন্যান্য জনপ্রিয় পোশাক
            </h2>
            <Link to="/" className="text-xs font-bold text-rose-600 hover:underline">
              সব কালেকশন দেখুন ›
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
