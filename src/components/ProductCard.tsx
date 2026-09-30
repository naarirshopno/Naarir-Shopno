import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Eye, Zap, Star, Check, Heart } from 'lucide-react';

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
    isInWishlist
  } = useShop();

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

  const discountPercent = Math.round(
    ((product.regularPrice - product.price) / product.regularPrice) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, undefined, selectedColor || undefined, 1, false, activeImg);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleInstantBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-rose-600 text-white font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-sm">
            {discountPercent}% ছাড়
          </span>
        )}
        {product.isNew && (
          <span className="bg-emerald-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            নতুন
          </span>
        )}
        {product.isTrending && (
          <span className="bg-amber-500 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            হট
          </span>
        )}
      </div>

      {/* Wishlist Button (Top Right) */}
      <button
        id={`btn-wishlist-${product.id}`}
        type="button"
        onClick={handleToggleWishlist}
        title={isSaved ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় যোগ করুন"}
        aria-label={isSaved ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় যোগ করুন"}
        className={`absolute top-3 right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          isSaved 
            ? 'bg-rose-600 text-white scale-105 shadow-rose-300/60 ring-2 ring-white' 
            : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:text-rose-600 hover:bg-white hover:scale-110'
        }`}
      >
        <Heart 
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 ${
            isSaved ? 'fill-white stroke-white' : 'stroke-current'
          } ${heartBurst ? 'scale-125' : ''}`} 
        />
      </button>

      {/* Instant Feedback Toast */}
      {toastFeedback && (
        <div className="absolute top-12 right-3 z-30 bg-slate-900/90 text-white text-[10px] font-medium py-1 px-2.5 rounded-lg shadow-lg backdrop-blur-xs animate-fadeIn pointer-events-none whitespace-nowrap border border-white/20">
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProductModal(product);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>বিস্তারিত দেখুন</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              {product.categoryBengali}
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

          {/* Fabric preview */}
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-light">
            {product.fabric}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-rose-50">
          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-black text-rose-700 font-['Outfit']">
              ৳{product.price.toLocaleString()}
            </span>
            {product.regularPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-['Outfit']">
                ৳{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons: Instant Order & Add to Cart */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-order-instant-${product.id}`}
              onClick={handleInstantBuy}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs py-2 px-1 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>অর্ডার করুন</span>
            </button>

            <button
              id={`btn-add-cart-${product.id}`}
              onClick={handleAddToCart}
              className={`w-full font-bold text-xs py-2 px-1 rounded-xl border transition-all flex items-center justify-center gap-1 active:scale-95 ${
                addedAnimation
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-rose-200'
              }`}
            >
              {addedAnimation ? (
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
