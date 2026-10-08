import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowUpDown, X, Tag, Sparkles } from 'lucide-react';
import { CategoryType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';

interface ProductToolbarProps {
  totalCount: number;
}

export const ProductToolbar: React.FC<ProductToolbarProps> = ({ totalCount }) => {
  const { 
    activeCategory, 
    setActiveCategory, 
    sortBy, 
    setSortBy, 
    searchQuery, 
    setSearchQuery,
    settings,
    products
  } = useShop();

  const customCategories = Array.isArray(settings.categories)
    ? settings.categories
    : DEFAULT_CATEGORIES;

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'সবগুলো' },
    ...customCategories.map((c) => ({
      id: c.id,
      label: c.title.replace(/ কালেকশন| মেলা| রেডিমেড/, '').trim(),
    })),
  ];

  const currentCategoryLabel = activeCategory === 'all'
    ? 'আমাদের সকল পোশাকের সংগ্রহ'
    : customCategories.find(c => c.id === activeCategory)?.title || categories.find(c => c.id === activeCategory)?.label || 'পণ্য তালিকা';

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-rose-100 shadow-sm mb-6 space-y-4">
      {/* Top Header Row: Title, Badge, Count & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-50 pb-3.5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>এক্সক্লুসিভ কালেকশন ২০২৬</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Hind_Siliguri']">
              {searchQuery ? `"${searchQuery}" এর ফলাফল` : currentCategoryLabel}
            </h2>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              মোট {totalCount} টি চমৎকার ডিজাইনের পোশাক
            </span>
          </div>

          {searchQuery && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
              <span>অনুসন্ধান: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-amber-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="select-sort" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-500" />
            <span>সাজান:</span>
          </label>
          <select
            id="select-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium bg-rose-50/50 border border-rose-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="default">জনপ্রিয় / ফিচারড</option>
            <option value="price-asc">দাম: কম থেকে বেশি ৳</option>
            <option value="price-desc">দাম: বেশি থেকে কম ৳</option>
            <option value="rating">সর্বোচ্চ রেটিংপ্রাপ্ত ⭐</option>
            <option value="newest">নতুন কালেকশন 🔥</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            id={`filter-pill-${c.id}`}
            onClick={() => setActiveCategory(c.id)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer active:scale-95 ${
              activeCategory === c.id
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
