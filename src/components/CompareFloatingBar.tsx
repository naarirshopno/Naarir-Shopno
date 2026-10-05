import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowLeftRight, X, Sparkles, Trash2 } from 'lucide-react';

export const CompareFloatingBar: React.FC = () => {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    setIsCompareModalOpen,
    isCompareModalOpen
  } = useShop();

  if (compareList.length === 0 || isCompareModalOpen) return null;

  return (
    <aside 
      aria-label="পণ্য তুলনা ফ্লোটিং বার"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-xl w-full px-2 animate-fadeIn"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl sm:rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-2xl border border-rose-500/30 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ArrowLeftRight className="w-4 h-4" />
          </div>

          <div className="hidden md:block">
            <span className="text-xs font-bold font-['Hind_Siliguri'] block leading-tight">
              পোশাক তুলনা
            </span>
            <span className="text-[10px] text-rose-300 font-medium">
              {compareList.length}/৩ টি পোশাক
            </span>
          </div>

          {/* Product Thumbnails with remove icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {compareList.map((product) => (
              <div 
                key={product.id}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-rose-400/80 group shrink-0 bg-white"
                title={product.bengaliName || product.name}
              >
                <img 
                  src={product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'} 
                  alt={product.bengaliName || product.name}
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCompare(product.id);
                  }}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="সরান"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slots indicator up to 3 */}
            {[...Array(3 - compareList.length)].map((_, idx) => (
              <div 
                key={`empty-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-[10px] text-white/50 shrink-0"
                title="আরও পোশাক নির্বাচন করুন"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="text-white/60 hover:text-red-400 p-1.5 rounded-lg transition hover:bg-white/10 cursor-pointer hidden sm:block"
            title="সব মুছুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>তুলনা দেখুন ({compareList.length})</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
