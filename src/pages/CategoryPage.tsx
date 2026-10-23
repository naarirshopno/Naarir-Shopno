import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { CustomCategoryItem, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { 
  ChevronRight, 
  Home, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Search, 
  X, 
  Truck, 
  ShieldCheck, 
  Phone, 
  RotateCcw, 
  PackageOpen, 
  ShoppingBag,
  Heart
} from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { 
    products, 
    settings, 
    setActiveCategory, 
    sortBy, 
    setSortBy,
    priceRange,
    setPriceRange,
    resetFilters
  } = useShop();

    // Local search query inside this category
  const [localSearch, setLocalSearch] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Available categories list
  const categoryList: CustomCategoryItem[] = useMemo(() => {
    return Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES;
  }, [settings.categories]);

  // Determine current active category object
  const currentCategory = useMemo(() => {
    if (!categoryId || categoryId === 'all') {
      return {
        id: 'all',
        title: 'সবগুলো কালেকশন',
        subtitle: 'নারীর স্বপ্নের সম্পূর্ণ এক্সক্লুসিভ পোশাক কালেকশন',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      };
    }

    // Try finding by exact id
    const foundById = categoryList.find((c) => c.id === categoryId);
    if (foundById) return foundById;

    // Try finding by decoded name/title match
    const decodedParam = decodeURIComponent(categoryId).trim().toLowerCase();
    const foundByTitle = categoryList.find((c) => 
      c.title.toLowerCase() === decodedParam ||
      c.id.toLowerCase() === decodedParam
    );
    if (foundByTitle) return foundByTitle;

    // Fallback if not found
    return {
      id: categoryId,
      title: decodeURIComponent(categoryId),
      subtitle: 'নারীর স্বপ্ন স্পেশাল কালেকশন',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    };
  }, [categoryId, categoryList]);

  // Keep ShopContext activeCategory synced
  useEffect(() => {
    if (categoryId) {
      setActiveCategory(categoryId);
    }
  }, [categoryId, setActiveCategory]);

  // Scroll to top and reset material filters when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setLocalSearch('');
    setSelectedMaterials([]);
  }, [categoryId]);

  // Compute available materials/fabrics in this category
  const availableMaterials = useMemo(() => {
    let catProducts = products;
    if (currentCategory.id !== 'all') {
      catProducts = catProducts.filter((p) => {
        if (p.category === currentCategory.id) return true;
        if (p.categoryBengali === currentCategory.title || p.category === currentCategory.title) return true;
        if (p.categoryBengali && currentCategory.title && (
          p.categoryBengali.includes(currentCategory.title) || 
          currentCategory.title.includes(p.categoryBengali)
        )) return true;
        return false;
      });
    }
    const set = new Set<string>();
    catProducts.forEach((p) => {
      if (p.fabric) set.add(p.fabric);
    });
    return Array.from(set);
  }, [products, currentCategory]);

  // Filter products for this category
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Filter by category
    if (currentCategory.id !== 'all') {
      result = result.filter((p) => {
        // Direct category ID match
        if (p.category === currentCategory.id) return true;
        // Direct title match
        if (p.categoryBengali === currentCategory.title || p.category === currentCategory.title) return true;
        // Fuzzy partial match for compound categories
        if (p.categoryBengali && currentCategory.title && (
          p.categoryBengali.includes(currentCategory.title) || 
          currentCategory.title.includes(p.categoryBengali)
        )) return true;
        return false;
      });
    }

    // 2. Filter by local search query
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bengaliName.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 3. Price range filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // 4. Material / Brand Fabric filter
    if (selectedMaterials.length > 0) {
      result = result.filter((p) => selectedMaterials.includes(p.fabric));
    }

    // 5. Sorting logic
    if (sortBy === 'price_asc' || sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc' || sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else {
      // default / popular
      result.sort((a, b) => {
        const scoreA = (a.featured ? 100 : 0) + (a.isTrending ? 50 : 0) + (a.rating || 4.5) * 10;
        const scoreB = (b.featured ? 100 : 0) + (b.isTrending ? 50 : 0) + (b.rating || 4.5) * 10;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [products, currentCategory, localSearch, priceRange, selectedMaterials, sortBy]);

  // Category image
  const categoryBannerImg = settings.categoryImages?.[currentCategory.id] || currentCategory.image;

  const toggleMaterialFilter = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pb-16">
      {/* 1. Breadcrumbs */}
      <div className="bg-rose-50/50 border-b border-rose-100/70 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-600">
          <Link to="/" className="flex items-center gap-1 hover:text-rose-600 transition font-medium">
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to="/" className="hover:text-rose-600 transition font-medium">
            ক্যাটাগরি সমূহ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-rose-700 truncate max-w-[200px] sm:max-w-none">
            {currentCategory.title}
          </span>
        </div>
      </div>

      {/* 2. Category Hero Banner */}
      <div className="relative bg-gradient-to-r from-rose-900 via-pink-900 to-rose-950 text-white overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src={categoryBannerImg} 
            alt="" 
            className="w-full h-full object-cover blur-md scale-110" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-rose-950/70 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>এক্সক্লুসিভ কালেকশন</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-['Hind_Siliguri'] text-white drop-shadow tracking-tight">
              {currentCategory.title}
            </h1>
            {currentCategory.subtitle && (
              <p className="text-xs sm:text-sm text-pink-100/90 font-medium max-w-xl leading-relaxed">
                {currentCategory.subtitle}
              </p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-xs text-rose-200">
              <span className="flex items-center gap-1.5 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <ShoppingBag className="w-3.5 h-3.5 text-rose-300" />
                <span>{filteredProducts.length} টি প্রোডাক্ট প্রদর্শিত</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>সারাদেশে ক্যাশ অন ডেলিভারি</span>
              </span>
            </div>
          </div>

          <div className="relative shrink-0 hidden sm:block">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl ring-4 ring-rose-500/20 group">
              <img 
                src={categoryBannerImg} 
                alt={currentCategory.title}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Category Switcher Bar */}
      <div className="bg-white border-b border-rose-100 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              ক্যাটাগরি:
            </span>

            <button
              onClick={() => {
                setActiveCategory('all');
                navigate('/category/all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentCategory.id === 'all'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                  : 'bg-rose-50/80 text-slate-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100'
              }`}
            >
              সবগুলো কালেকশন
            </button>

            {categoryList.map((cat) => {
              const isActive = currentCategory.id === cat.id;
              const imgUrl = settings.categoryImages?.[cat.id] || cat.image;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    navigate(`/category/${cat.id}`);
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                      : 'bg-rose-50/70 text-slate-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100'
                  }`}
                >
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover shrink-0 border border-rose-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="whitespace-nowrap">{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Top Search & Sort Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={`"${currentCategory.title}" এ খুঁজুন...`}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800 transition"
            />
            <Search className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                showFilterDrawer || priceRange[0] > 0 || priceRange[1] < 10000 || selectedMaterials.length > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
              <span>ফিল্টার মেনু</span>
              {(priceRange[0] > 0 || priceRange[1] < 10000 || selectedMaterials.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="default">জনপ্রিয় কালেকশন</option>
                <option value="price_asc">মূল্য: কম থেকে বেশি</option>
                <option value="price_desc">মূল্য: বেশি থেকে কম</option>
                <option value="rating">সর্বোচ্চ রেটিং</option>
                <option value="newest">নতুন কালেকশন</option>
              </select>
            </div>

            {/* Active filter count / Reset */}
            {(localSearch || priceRange[0] > 0 || priceRange[1] < 10000 || selectedMaterials.length > 0 || sortBy !== 'default') && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSelectedMaterials([]);
                  resetFilters();
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="সব ফিল্টার মুছুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Collapsible Filter Drawer */}
        {showFilterDrawer && (
          <div className="lg:hidden mt-3 p-4 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-['Hind_Siliguri']">
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                <span>প্রোডাক্ট ফিল্টার মেনু</span>
              </h3>
              <button onClick={() => setShowFilterDrawer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>মূল্য পরিসীমা (Budget)</span>
                <span className="text-rose-600 font-mono">৳{priceRange[0]} - ৳{priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: 'সব মূল্য', range: [0, 10000] as [number, number] },
                  { label: '৳১৫০০ এর নিচে', range: [0, 1500] as [number, number] },
                  { label: '৳৩০০০ এর নিচে', range: [0, 3000] as [number, number] },
                  { label: '৳৫০০০+', range: [5000, 10000] as [number, number] },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPriceRange(preset.range)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material / Brand Fabric Filter */}
            {availableMaterials.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700">ব্র্যান্ড ও ম্যাটেরিয়াল (Fabric):</h4>
                <div className="flex flex-wrap gap-1.5">
                  {availableMaterials.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat);
                    return (
                      <button
                        key={mat}
                        onClick={() => toggleMaterialFilter(mat)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                        }`}
                      >
                        {mat} {isSelected && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setPriceRange([0, 10000]);
                  setSelectedMaterials([]);
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                রিসেট
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
              >
                প্রয়োগ করুন ({filteredProducts.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Main Layout with Desktop Sidebar & Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Desktop Sidebar Filter Menu */}
          <div className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-['Hind_Siliguri']">
                <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                <span>ফিল্টার ও বাজেট মেনু</span>
              </h3>
              {(priceRange[0] > 0 || priceRange[1] < 10000 || selectedMaterials.length > 0) && (
                <button
                  onClick={() => {
                    setPriceRange([0, 10000]);
                    setSelectedMaterials([]);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">মূল্য পরিসীমা (Price Range):</h4>
              <div className="flex items-center justify-between text-xs font-semibold text-rose-700 font-mono">
                <span>৳{priceRange[0]}</span>
                <span>৳{priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { label: 'সব মূল্য', range: [0, 10000] as [number, number] },
                  { label: '৳১৫০০ নিচে', range: [0, 1500] as [number, number] },
                  { label: '৳৩০০০ নিচে', range: [0, 3000] as [number, number] },
                  { label: '৳৫০০০+', range: [5000, 10000] as [number, number] },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPriceRange(preset.range)}
                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-[11px] font-semibold transition cursor-pointer text-center"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material / Brand Fabric Filter */}
            {availableMaterials.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-rose-100">
                <h4 className="text-xs font-bold text-slate-700">ম্যাটেরিয়াল ও ফেব্রিক (Fabric):</h4>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {availableMaterials.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat);
                    return (
                      <button
                        key={mat}
                        onClick={() => toggleMaterialFilter(mat)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'bg-rose-50/60 hover:bg-rose-100/70 text-slate-700'
                        }`}
                      >
                        <span>{mat}</span>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-rose-600 font-bold' : 'border border-rose-300'}`}>
                          {isSelected && '✓'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(priceRange[0] > 0 || priceRange[1] < 10000 || selectedMaterials.length > 0) && (
              <div className="pt-3 border-t border-rose-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সক্রিয় ফিল্টার:</span>
                <div className="flex flex-wrap gap-1">
                  {priceRange[1] < 10000 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold">
                      সর্বোচ্চ ৳{priceRange[1]}
                      <button onClick={() => setPriceRange([0, 10000])} className="hover:text-rose-900 cursor-pointer">×</button>
                    </span>
                  )}
                  {selectedMaterials.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold">
                      {m}
                      <button onClick={() => toggleMaterialFilter(m)} className="hover:text-rose-900 cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Grid Area (Span 3 on Desktop) */}
          <div className="lg:col-span-3 space-y-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                {filteredProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 text-center bg-white rounded-3xl border border-rose-100 p-8 shadow-xs max-w-lg mx-auto space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 font-['Hind_Siliguri']">
                    এই মুহূর্তে কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {localSearch || selectedMaterials.length > 0 || priceRange[1] < 10000
                      ? `আপনার নির্বাচিত ফিল্টার বা খোঁজার সাথে মিল রয়েছে এমন কোনো পোশাক পাওয়া যায়নি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।`
                      : 'এই ক্যাটাগরিতে বর্তমানে নতুন স্টক আপডেট করা হচ্ছে অথবা ফিল্টার অনুযায়ী কোনো পণ্য নেই।'}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setLocalSearch('');
                      setSelectedMaterials([]);
                      resetFilters();
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    ফিল্টার রিসেট করুন
                  </button>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      navigate('/category/all');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    সবগুলো কালেকশন দেখুন
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 6. Customer Confidence & Hotline Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/50 rounded-2xl border border-rose-200/70 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-['Hind_Siliguri']">
                ১০০% অরিজিনাল কোয়ালিটি ও বিশ্বস্ত শপিং
              </h4>
              <p className="text-xs text-slate-600">
                পণ্য হাতে পেয়ে দেখে ডেলিভারিম্যানকে মূল্য পরিশোধ করার পূর্ণ নিশ্চয়তা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <a
              href={`tel:${settings.hotline1 || '09617-541717'}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>হটলাইন: {settings.hotline1 || '09617-541717'}</span>
            </a>
            <Link
              to="/checkout"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>অর্ডার সম্পন্ন করুন</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
