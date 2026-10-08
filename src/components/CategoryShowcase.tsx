import React from 'react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';

export const CategoryShowcase: React.FC = () => {
  const { activeCategory, setActiveCategory, settings } = useShop();

  const categoryList = Array.isArray(settings.categories)
    ? settings.categories
    : DEFAULT_CATEGORIES;

  const handleSelect = (id: CategoryType) => {
    setActiveCategory(id);
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Bar - Clean customer-facing interface */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-['Hind_Siliguri']">
            ক্যাটাগরি অনুযায়ী ব্রাউজ করুন
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">আপনার পছন্দের ক্যাটাগরি বেছে নিন</p>
        </div>
        
        <button
          onClick={() => handleSelect('all')}
          className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
        >
          সবগুলো দেখুন →
        </button>
      </div>

      {/* Categories Grid (50% Compact Size with Centered Bottom Text) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
        {categoryList.map((item) => {
          const isSelected = activeCategory === item.id;
          const currentImage = settings.categoryImages?.[item.id] || item.image;

          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`group relative cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg aspect-[3/4] flex flex-col justify-end p-1.5 sm:p-2.5 border ${
                isSelected
                  ? 'border-rose-500 ring-2 ring-rose-400 scale-[1.02]'
                  : 'border-rose-100 hover:border-rose-300 hover:scale-[1.02]'
              }`}
            >
              {/* Full Image filling the entire div with object-top to prevent face and dress cropping */}
              <img
                src={currentImage}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Gradient Scrim for crystal clear typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none group-hover:from-black/95 transition-colors" />

              {/* Category Info Overlay (Centered from the bottom with both Title and Subtitle) */}
              <div className="relative z-10 w-full text-center flex flex-col items-center justify-end px-1 pb-0.5 space-y-0.5">
                <h4 className="w-full text-center text-xs sm:text-sm font-extrabold font-['Hind_Siliguri'] text-white drop-shadow-md group-hover:text-pink-200 transition-colors line-clamp-1 leading-tight">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="w-full text-center text-[9px] sm:text-[11px] text-pink-100/95 font-medium line-clamp-1 drop-shadow-xs leading-tight">
                    {item.subtitle}
                  </p>
                )}
                {isSelected && (
                  <span className="mx-auto inline-flex items-center gap-0.5 bg-rose-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 shadow-xs">
                    বাছাইকৃত ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
