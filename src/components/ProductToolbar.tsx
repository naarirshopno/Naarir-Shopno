import React from 'react';
import { useShop } from '../context/ShopContext';
import { SlidersHorizontal, ArrowUpDown, X, Tag } from 'lucide-react';
import { CategoryType } from '../types';

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
    setSearchQuery 
  } = useShop();

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'সবগুলো' },
    { id: 'three_piece', label: 'থ্রি-পিস' },
    { id: 'saree', label: 'শাড়ি' },
    { id: 'kurti', label: 'কুর্তি' },
    { id: 'gown', label: 'গাউন' },
    { id: 'hijab_abaya', label: 'হিজাব ও আবায়া' },
    { id: 'lehenga', label: 'লেহেঙ্গা' },
    { id: 'jewellery_bags', label: 'জুয়েলারি ও ব্যাগ' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm mb-6 space-y-3">
      {/* Top row: Counter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-rose-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {activeCategory === 'all' ? 'সব পণ্য' : categories.find(c => c.id === activeCategory)?.label}
          </h3>
          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {totalCount} টি পোশাক
          </span>

          {searchQuery && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-800 text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
              অনুসন্ধান: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-amber-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="select-sort" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-500" />
            <span>সাজান:</span>
          </label>
          <select
            id="select-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium bg-rose-50/50 border border-rose-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
        {categories.map((c) => (
          <button
            key={c.id}
            id={`filter-pill-${c.id}`}
            onClick={() => setActiveCategory(c.id)}
            className={`text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
