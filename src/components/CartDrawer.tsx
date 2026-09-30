import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Plus, Minus } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartSubtotal, 
    clearCart,
    setIsCheckoutOpen,
    setDirectCheckoutItem,
    settings 
  } = useShop();

  if (!isCartOpen) return null;

  const subtotal = getCartSubtotal();
  const freeThreshold = settings.deliveryCharges.freeDeliveryAbove;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const diffToFree = freeThreshold - subtotal;

  const handleProceedToCheckout = () => {
    setDirectCheckoutItem(null); // use full cart
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-rose-100 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
              আপনার শপিং কার্ট ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h3>
          </div>
          <button
            id="btn-close-cart-drawer"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Goal Bar */}
        <div className="p-3 bg-pink-50/70 border-b border-pink-100 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold text-rose-700 mb-1.5">
            <Truck className="w-4 h-4 text-rose-600 animate-bounce" />
            {diffToFree > 0 ? (
              <span>
                আর মাত্র <strong className="text-rose-950 font-['Outfit']">৳{diffToFree.toLocaleString()}</strong> টাকার অর্ডারে ফ্রি ডেলিভারি!
              </span>
            ) : (
              <span className="text-emerald-700 font-bold">অভিনন্দন! আপনি ফ্রি ডেলিভারি উপভোগ করছেন! 🎉</span>
            )}
          </div>
          <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">আপনার কার্ট খালি রয়েছে</h4>
                <p className="text-xs text-slate-500">পছন্দের পোশাক যুক্ত করে দ্রুত অর্ডার সম্পন্ন করুন</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow transition"
              >
                কেনাকাটা শুরু করুন
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemImg = item.selectedImage || (item.product.images && item.product.images.length > 0 && item.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
              const colorHex = item.product.colors?.find(c => c.name === item.selectedColor)?.hex;

              return (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || ''}-${item.selectedImage || index}`}
                  className="flex gap-3 bg-rose-50/30 p-3 rounded-2xl border border-rose-100/80 hover:border-pink-200 transition"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-22 rounded-xl overflow-hidden bg-white shrink-0 border border-rose-100 shadow-2xs">
                    <img
                      src={itemImg}
                      alt={item.product.bengaliName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {item.product.bengaliName}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span>সাইজ: <strong className="text-slate-700">{item.selectedSize}</strong></span>
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1 font-medium">
                            {colorHex && (
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: colorHex }} />
                            )}
                            <span>রঙ: <strong className="text-slate-700">{item.selectedColor}</strong></span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-rose-700 font-['Outfit']">
                        ৳{item.product.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-rose-100/60">
                      <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, -1, item.selectedImage)}
                          className="p-1 hover:bg-rose-50 text-rose-700 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, 1, item.selectedImage)}
                          className="p-1 hover:bg-rose-50 text-rose-700 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor, item.selectedImage)}
                        className="text-slate-400 hover:text-red-500 p-1 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-rose-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-bold text-slate-900 font-['Outfit']">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-medium text-rose-600">চেকআউটে নির্ধারিত হবে</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>সর্বমোট (আনুমানিক):</span>
                <span className="text-base text-rose-700 font-black font-['Outfit']">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                id="btn-drawer-checkout"
                onClick={handleProceedToCheckout}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-xs">
                <button
                  onClick={clearCart}
                  className="text-slate-400 hover:text-red-500 font-medium transition"
                >
                  কার্ট খালি করুন
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-rose-600 hover:underline font-semibold"
                >
                  আরও কেনাকাটা করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
