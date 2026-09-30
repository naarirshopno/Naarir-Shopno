import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
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
  Heart
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

  const product = selectedProductModal;
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedImg(null);
      setSelectedSize(product.sizes[0] || 'Standard');
      setSelectedColor(product.colors[0]?.name || '');
      setQuantity(1);
      setAddedToast(false);
    }
  }, [product]);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp"
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
            {/* Main Preview */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-md border border-rose-100 mb-3">
              <img
                src={activeImage}
                alt={product.bengaliName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {discountPercent}% ছাড়
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
                  {product.categoryBengali}
                </span>
                <span>কোড: {product.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Hind_Siliguri'] leading-snug">
                {product.bengaliName}
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
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  title="নিচে কাস্টমারদের রিভিউ পড়ুন"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>({product.reviewsCount} টি রিভিউ দেখুন)</span>
                </button>
              </div>

              {/* Price Banner */}
              <div className="mt-4 p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-rose-700 font-['Outfit']">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.regularPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-['Outfit']">
                    ৳{product.regularPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    আপনার সাশ্রয় ৳{(product.regularPrice - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Fabric Specs */}
              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <p>
                  <strong className="text-slate-800">কাপড়ের বিবরণ:</strong> {product.fabric}
                </p>
                <p>
                  <strong className="text-slate-800">স্টক অবস্থা:</strong>{' '}
                  <span className="text-emerald-600 font-bold">ইন স্টক (পণ্যটি রেডি আছে)</span>
                </p>
              </div>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                    <span>সাইজ বেছে নিন:</span>
                    <span className="text-rose-600 font-normal">{selectedSize}</span>
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
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                    <span>রঙ বেছে নিন:</span>
                    <span className="text-rose-600 font-normal">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c, cIdx) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedColor(c.name);
                          if (product.images && product.images[cIdx]) {
                            setSelectedImg(product.images[cIdx]);
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          selectedColor === c.name
                            ? 'border-rose-600 ring-2 ring-rose-200 bg-rose-50 text-rose-800 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800">পরিমাণ:</span>
                <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden bg-rose-50/30">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-base font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-slate-800">{quantity}</span>
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
                  <span>সরাসরি অর্ডার</span>
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
                      <span>যোগ হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-rose-600" />
                      <span>কার্টে নিন</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-modal-wishlist"
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  title={isInWishlist(product.id) ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় রাখুন"}
                  aria-label={isInWishlist(product.id) ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় রাখুন"}
                  className={`px-3 py-3 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                    isInWishlist(product.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-600 scale-102'
                      : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-transform ${isInWishlist(product.id) ? 'fill-rose-600 text-rose-600 scale-110' : ''}`} />
                </button>
              </div>

              {/* Call Hotline direct action */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>ফোনে অর্ডার করতে কল করুন:</span>
                </div>
                <a
                  href={`tel:${settings.hotline1.replace(/[^0-9]/g, '')}`}
                  className="font-bold text-rose-600 hover:underline"
                >
                  {settings.hotline1}
                </a>
              </div>

              {/* Guarantees small badges */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 text-center pt-1">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-rose-500" />
                  <span>হোম ডেলিভারি</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
                  <span>৩ দিন এক্সচেঞ্জ</span>
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
