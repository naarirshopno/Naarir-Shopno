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

      {/* Categories Grid (Compact 20% smaller cards with Centered Larger Text) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
        {categoryList.map((item) => {
          const isSelected = activeCategory === item.id;
          const currentImage = settings.categoryImages?.[item.id] || item.image;

          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl aspect-[4/5] flex flex-col justify-end p-2.5 sm:p-3 border ${
                isSelected
                  ? 'border-rose-500 ring-2 ring-rose-400 scale-[1.02]'
                  : 'border-rose-100 hover:border-rose-300 hover:scale-[1.02]'
              }`}
            >
              {/* Full Image filling the entire div */}
              <img
                src={currentImage}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Gradient Scrim for crystal clear typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none group-hover:from-black/90 transition-colors" />

              {/* Category Info Overlay (Centered from the bottom with larger text) */}
              <div className="relative z-10 w-full text-center flex flex-col items-center justify-end space-y-0.5">
                <h4 className="w-full text-center text-sm sm:text-base font-extrabold font-['Hind_Siliguri'] text-white drop-shadow-md group-hover:text-pink-200 transition-colors line-clamp-1 leading-snug">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="w-full text-center text-[11px] sm:text-xs text-pink-100/95 line-clamp-1 drop-shadow-xs font-medium">
                    {item.subtitle}
                  </p>
                )}
                {isSelected && (
                  <span className="mx-auto inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 shadow-xs">
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
