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

      {/* Categories Grid (dynamic for all categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {categoryList.map((item) => {
          const isSelected = activeCategory === item.id;
          const currentImage = settings.categoryImages?.[item.id] || item.image;

          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`group cursor-pointer rounded-2xl p-2.5 sm:p-3 text-center transition-all bg-white border ${
                isSelected
                  ? 'border-rose-500 shadow-md ring-2 ring-rose-200 bg-rose-50/30'
                  : 'border-rose-100 hover:border-pink-300 hover:shadow-md'
              }`}
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden mb-2.5 border-2 border-rose-200/60 shadow-inner group-hover:scale-105 transition-transform bg-rose-50">
                <img
                  src={currentImage}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = item.image;
                  }}
                />
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
