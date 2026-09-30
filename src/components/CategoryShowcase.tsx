import React from 'react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';

interface CategoryItem {
  id: CategoryType;
  title: string;
  subtitle: string;
  image: string;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: 'three_piece',
    title: 'থ্রি-পিস কালেকশন',
    subtitle: 'জর্জেট, সুতি ও সিল্ক',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'saree',
    title: 'শাড়ির মেলা',
    subtitle: 'জামদানি ও কাঞ্জিভরম',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'kurti',
    title: 'রেডিমেড কুর্তি',
    subtitle: 'ক্যাজুয়াল ও পার্টি ওয়্যার',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'gown',
    title: 'পার্টি গাউন',
    subtitle: 'লং ফ্লেয়ার্ড সিকোয়েন্স',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'hijab_abaya',
    title: 'হিজাব ও আবায়া',
    subtitle: 'দুবাই চেরি ফেব্রিক',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'jewellery_bags',
    title: 'জুয়েলারি ও ব্যাগ',
    subtitle: 'ম্যাচিং অ্যাক্সেসরিজ',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
  },
];

export const CategoryShowcase: React.FC = () => {
  const { activeCategory, setActiveCategory } = useShop();

  const handleSelect = (id: CategoryType) => {
    setActiveCategory(id);
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-['Hind_Siliguri']">
            ক্যাটাগরি অনুযায়ী ব্রাউজ করুন
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">আপনার পছন্দের ক্যাটাগরি বেছে নিন</p>
        </div>
        <button
          onClick={() => handleSelect('all')}
          className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          সবগুলো দেখুন →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORY_ITEMS.map((item) => {
          const isSelected = activeCategory === item.id;
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
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden mb-2.5 border-2 border-rose-200/60 shadow-inner group-hover:scale-105 transition-transform">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
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
