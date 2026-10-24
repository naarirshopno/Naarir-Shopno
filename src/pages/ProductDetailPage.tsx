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
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  Flame, 
  SearchX,
  Video,
  Play,
  Pause
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

  // Two-Finger Pinch-to-Zoom & Pan State (Touch Gestures)
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hover-to-Zoom State (for desktop mouse hover)
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const isTouchActiveRef = useRef(false);

  // Gesture tracking refs
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingMouseRef = useRef(false);
  const mouseStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePanStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setIsPinching(false);
    setIsHoverZooming(false);
    setHoverPos({ x: 50, y: 50 });
  };

  useEffect(() => {
    if (product) {
      setSelectedImg(null);
      setSelectedSize(product.sizes[0] || 'Standard');
      setSelectedColor(product.colors[0]?.name || '');
      setQuantity(1);
      setAddedToast(false);
      setShareToast(null);
      resetZoom();
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

  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  };

  // 2-Finger Touch Pinch Zoom & Drag Pan Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isTouchActiveRef.current = true;
    setIsHoverZooming(false);
    if (e.touches.length === 2) {
      // 2 fingers detected: pinch to zoom
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
      touchStartPanRef.current = { ...pan };
      setIsPinching(true);
    } else if (e.touches.length === 1) {
      // Double tap check: toggle between 1x and 2.5x
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1.2) {
          resetZoom();
        } else {
          setScale(2.5);
          setPan({ x: 0, y: 0 });
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // 1-finger pan if already zoomed
      if (scale > 1.05) {
        touchStartPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        touchStartPanRef.current = { ...pan };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      if (e.cancelable) e.preventDefault();
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = dist / touchStartDistRef.current;
      const nextScale = Math.min(4, Math.max(1, +(touchStartScaleRef.current * factor).toFixed(2)));
      setScale(nextScale);
      if (nextScale <= 1.05) {
        setPan({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1.05) {
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - touchStartPosRef.current.x;
      const dy = e.touches[0].clientY - touchStartPosRef.current.y;

      const container = imageContainerRef.current;
      const rect = container ? container.getBoundingClientRect() : { width: 400, height: 500 };
      const maxPanX = (rect.width * (scale - 1)) / 2;
      const maxPanY = (rect.height * (scale - 1)) / 2;

      setPan({
        x: Math.min(maxPanX, Math.max(-maxPanX, touchStartPanRef.current.x + dx)),
        y: Math.min(maxPanY, Math.max(-maxPanY, touchStartPanRef.current.y + dy)),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      touchStartDistRef.current = null;
      setIsPinching(false);
    }
    if (e.touches.length === 0) {
      if (scale <= 1.05) {
        resetZoom();
      }
      setTimeout(() => {
        isTouchActiveRef.current = false;
      }, 300);
    }
  };

  // Hover-to-Zoom & Drag Handlers for Desktop Mouse
  const handleMouseEnter = () => {
    if (isTouchActiveRef.current) return;
    if (scale <= 1.05) {
      setIsHoverZooming(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchActiveRef.current) return;
    if (!imageContainerRef.current) return;

    if (isDraggingMouseRef.current && scale > 1.05) {
      const dx = e.clientX - mouseStartRef.current.x;
      const dy = e.clientY - mouseStartRef.current.y;

      const container = imageContainerRef.current;
      const rect = container ? container.getBoundingClientRect() : { width: 400, height: 500 };
      const maxPanX = (rect.width * (scale - 1)) / 2;
      const maxPanY = (rect.height * (scale - 1)) / 2;

      setPan({
        x: Math.min(maxPanX, Math.max(-maxPanX, mousePanStartRef.current.x + dx)),
        y: Math.min(maxPanY, Math.max(-maxPanY, mousePanStartRef.current.y + dy)),
      });
      return;
    }

    // High precision Hover-to-Zoom positioning
    if (scale <= 1.05) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setHoverPos({ x, y });
      setIsHoverZooming(true);
    }
  };

  const handleMouseLeave = () => {
    isDraggingMouseRef.current = false;
    setIsHoverZooming(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1.05) return;
    e.preventDefault();
    isDraggingMouseRef.current = true;
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
    mousePanStartRef.current = { ...pan };
  };

  const handleMouseUp = () => {
    isDraggingMouseRef.current = false;
  };

  const handleColorSelect = (colorName: string, colorIndex: number) => {
    setSelectedColor(colorName);
    if (product && product.images && product.images.length > 0) {
      const targetImg = product.images[colorIndex] || product.images[colorIndex % product.images.length];
      if (targetImg) {
        setSelectedImg(targetImg);
        resetZoom();
      }
    }
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
      <div className="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Image Gallery with 2-Finger Pinch Zoom */}
        <div className="lg:col-span-6 flex flex-col items-center p-0 sm:p-6 lg:p-8 bg-rose-50/15 sm:border-r border-b lg:border-b-0 border-rose-100">
          {/* Mode Switcher Buttons: AI Model Video vs Fabric Photo & Zoom */}
          <div 
            ref={imageContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
              touchAction: scale > 1.05 ? 'none' : 'pan-y',
            }}
            className={`relative w-full aspect-[3/4] max-w-xl sm:rounded-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden bg-rose-50/30 sm:shadow-sm sm:border border-rose-100 select-none group/zoom ${
              scale > 1.05
                ? 'cursor-grab active:cursor-grabbing'
                : 'cursor-crosshair'
            }`}
            title="মাউস নাড়িয়ে কাপড়ের নিখুঁত বুনন ও ফেব্রিক ডিটেইলস জুম করুন"
          >
            <img
              src={activeImage}
              alt={product.bengaliName}
              style={{
                transformOrigin: isHoverZooming ? `${hoverPos.x}% ${hoverPos.y}%` : 'center center',
                transform: isHoverZooming
                  ? 'scale(2.5)'
                  : scale > 1.05
                  ? `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
                  : 'scale(1)',
                transition: isHoverZooming
                  ? 'transform 0.08s ease-out'
                  : isPinching || isDraggingMouseRef.current
                  ? 'none'
                  : 'transform 0.2s ease-out',
              }}
              className="w-full h-full object-cover object-top will-change-transform pointer-events-none select-none"
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

            {/* Top Right Floating Actions: Wishlist, Share & Fullscreen */}
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

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                  setIsFullscreen(true);
                }}
                className="w-9 h-9 rounded-full bg-white/95 text-slate-700 hover:text-rose-600 hover:bg-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="সম্পূর্ণ স্ক্রিনে ছবি দেখুন"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Share Toast */}
            {shareToast && (
              <div className="absolute top-14 right-3 z-20 bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-white/20 animate-fadeIn">
                {shareToast}
              </div>
            )}

            {/* Magnifier Lens Guide when Hover Zooming */}
            {!isVideoMode && isHoverZooming && (
              <div 
                className="absolute pointer-events-none w-28 h-28 rounded-full border-2 border-white/95 shadow-[0_0_25px_rgba(0,0,0,0.35)] -translate-x-1/2 -translate-y-1/2 ring-2 ring-rose-500/60 bg-white/10 z-20 backdrop-contrast-125"
                style={{
                  left: `${hoverPos.x}%`,
                  top: `${hoverPos.y}%`,
                }}
              />
            )}

            {/* Hover Zoom Active Banner */}
            {!isVideoMode && isHoverZooming && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-rose-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5 border border-white/30 z-20 animate-fadeIn whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>2.5x ফেব্রিক জুম (মাউস নাড়িয়ে দেখুন)</span>
              </div>
            )}

            {/* Reset Button when Zoomed (No +/- buttons) */}
            {!isVideoMode && scale > 1.05 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-white/95 hover:bg-rose-50 shadow-md border border-rose-200 transition cursor-pointer"
                title="আগের আকারে ফিরুন (১x)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>১x রিসেট</span>
              </button>
            )}

            {/* Visual Instruction & Zoom Feedback Guide */}
            {!isVideoMode && (
              !isHoverZooming && scale <= 1.05 ? (
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5 whitespace-nowrap border border-white/20">
                  <ZoomIn className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                  <span className="hidden sm:inline">ফেব্রিক জুম করুন</span>
                  <span className="sm:hidden">২ আঙুলে জুম</span>
                </div>
              ) : scale > 1.05 && (
                <div className="absolute bottom-3 left-3 bg-rose-950/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20 animate-fadeIn">
                  <span>{scale.toFixed(1)}x জুম</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetZoom();
                    }}
                    className="bg-white text-rose-700 hover:bg-rose-50 text-[10px] font-black px-2 py-0.5 rounded-full transition cursor-pointer"
                  >
                    রিসেট
                  </button>
                </div>
              )
            )}
          </div>

          {/* Thumbnails Row */}
          {(product.images.filter(Boolean).length > 0 || (modelVideo && !videoError)) && (
            <div className="flex gap-2.5 w-full justify-center flex-wrap px-4 py-3 sm:px-0 sm:py-0 sm:mt-4">
              {/* 1st Thumbnail: AI Model Video */}
              {modelVideo && !videoError && (
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoMode(true);
                    resetZoom();
                  }}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    isVideoMode
                      ? 'border-rose-600 ring-2 ring-rose-300 scale-105 shadow-md'
                      : 'border-rose-100 opacity-80 hover:opacity-100'
                  }`}
                  title="মডেলের ড্রেস পরা এআই ভিডিও দেখুন"
                >
                  <img
                    src={product.images[0] || FALLBACK_IMAGE}
                    alt="Model Video Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/45 flex flex-col items-center justify-center text-white">
                    <span className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center shadow">
                      <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                    </span>
                    <span className="text-[9px] font-black mt-1 bg-black/70 px-1 rounded text-amber-300">
                      AI ভিডিও
                    </span>
                  </div>
                </button>
              )}

              {/* Photo Thumbnails */}
              {product.images.filter(Boolean).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsVideoMode(false);
                    setSelectedImg(img);
                    resetZoom();
                    if (product.colors && product.colors[idx]) {
                      setSelectedColor(product.colors[idx].name);
                    }
                  }}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    !isVideoMode && activeImage === img
                      ? 'border-rose-600 ring-2 ring-rose-200 scale-105 shadow-md'
                      : 'border-rose-100 opacity-75 hover:opacity-100'
                  }`}
                  title={`ফটো ${idx + 1} - জুম করে ফেব্রিক দেখুন`}
                >
                  <img src={img || FALLBACK_IMAGE} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] font-bold text-white px-1 rounded">
                    ফটো {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Selectors & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6 p-4 sm:p-6 lg:p-8">
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
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>পছন্দের রঙ নির্বাচন করুন:</span>
                  </span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                    {selectedColor || product.colors[0]?.name}
                  </span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {product.colors.map((c, idx) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleColorSelect(c.name, idx)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50 shadow-sm ring-2 ring-rose-200 scale-102 font-bold text-rose-700'
                            : 'border-slate-200 hover:border-rose-300 bg-white text-slate-700'
                        }`}
                        title={`${c.name} রঙ দেখতে ক্লিক করুন`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 flex items-center justify-center shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check className="w-2.5 h-2.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] stroke-[3]" />
                          )}
                        </span>
                        <span className="text-xs">{c.name}</span>
                      </button>
                    );
                  })}
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

      {/* 6. Fullscreen Lightbox Modal with 2-Finger Pinch Zoom */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
          onClick={() => {
            setIsFullscreen(false);
          }}
        >
          {/* Top Bar */}
          <div 
            className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white">
              <h3 className="font-bold text-sm sm:text-base font-['Hind_Siliguri'] truncate max-w-xs sm:max-w-md">
                {product.bengaliName}
              </h3>
              <p className="text-xs text-rose-300 font-semibold">
                ৳{product.price.toLocaleString()} টাকা
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFullscreen(false);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                title="বন্ধ করুন (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image Canvas with Pinch & Pan - Fits 100% of visible viewport without cutting off */}
          <div 
            className="flex-1 min-h-0 min-w-0 w-full flex items-center justify-center p-2 sm:p-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              touchAction: scale > 1.05 ? 'none' : 'pan-y',
            }}
          >
            <img
              src={activeImage}
              alt={product.bengaliName}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isPinching || isDraggingMouseRef.current ? 'none' : 'transform 0.15s ease-out',
                maxHeight: '100%',
                maxWidth: '100%',
              }}
              className="w-auto h-auto max-w-full max-h-full object-contain will-change-transform pointer-events-none select-none rounded-lg drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Bottom Floating Bar */}
          <div 
            className="px-4 py-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between gap-3 z-10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white/80 text-xs flex items-center gap-1.5 font-medium">
              <span>✌️ ২ আঙুল দিয়ে জুম বা ডাবল-ট্যাপ করে কাপড় ও কাজ বড় করে দেখুন</span>
            </div>

            {scale > 1.05 && (
              <button
                type="button"
                onClick={resetZoom}
                className="px-3 h-8 rounded-xl flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/30 transition cursor-pointer"
                title="রিসেট (১x)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>১x রিসেট</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
