import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Order, OrderStatus, CartItem, CustomerProfile, Product } from '../types';
import { BANGLADESH_DISTRICTS, getThanasForDistrict } from '../data/bangladeshData';
import { OrderProgressTracker } from '../components/OrderProgressTracker';
import { InvoiceModal } from '../components/InvoiceModal';
import { 
  User, 
  ShoppingBag, 
  Package, 
  RotateCcw, 
  Truck, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Edit3, 
  Save, 
  AlertCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  X,
  CreditCard
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    orders, 
    products, 
    addToCart, 
    setIsCartOpen, 
    getWishlistCount, 
    setTrackingOrderId,
    settings 
  } = useShop();

  // 1. Profile State (Stored in localStorage)
  const [profile, setProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem('ns_customer_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Prefill from the most recent order if available
    if (orders && orders.length > 0) {
      const last = orders[0];
      return {
        name: last.customerName || '',
        phone: last.phone || '',
        altPhone: last.altPhone || '',
        email: '',
        district: last.district || 'ঢাকা',
        thana: last.thana || '',
        address: last.address || '',
      };
    }
    return {
      name: 'সম্মানিত গ্রাহক',
      phone: '',
      altPhone: '',
      email: '',
      district: 'ঢাকা',
      thana: '',
      address: '',
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<CustomerProfile>(profile);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Active status filter & search query for order history
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [expandedTrackerOrderId, setExpandedTrackerOrderId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Re-order notification toast
  const [reorderToast, setReorderToast] = useState<{
    show: boolean;
    message: string;
    itemsCount: number;
  }>({ show: false, message: '', itemsCount: 0 });

  // Update edit form when profile changes
  useEffect(() => {
    setEditForm(profile);
  }, [profile]);

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    try {
      localStorage.setItem('ns_customer_profile', JSON.stringify(editForm));
    } catch {
      // ignore
    }
    setIsEditingProfile(false);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Copy Order ID
  const handleCopyOrderId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedOrderId(id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Filter orders matching the user's phone or all orders if no phone is set
  const userOrders = useMemo(() => {
    const cleanUserPhone = profile.phone.replace(/[^0-9]/g, '');

    // If customer has a phone number saved, prefer matching their phone
    let list = orders;
    if (cleanUserPhone.length >= 6) {
      const matched = orders.filter(o => {
        const orderPhone = (o.phone || '').replace(/[^0-9]/g, '');
        const orderAltPhone = (o.altPhone || '').replace(/[^0-9]/g, '');
        return orderPhone.includes(cleanUserPhone) || orderAltPhone.includes(cleanUserPhone);
      });
      // If we found matching orders for this phone, use them. Otherwise show all recent device orders
      if (matched.length > 0) {
        list = matched;
      }
    }

    return list;
  }, [orders, profile.phone]);

  // Apply search query and status filter
  const filteredOrders = useMemo(() => {
    let result = [...userOrders];

    // Status filter
    if (activeFilter === 'active') {
      result = result.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));
    } else if (activeFilter === 'delivered') {
      result = result.filter(o => o.status === 'delivered');
    } else if (activeFilter === 'cancelled') {
      result = result.filter(o => o.status === 'cancelled');
    }

    // Text search query
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.trim().toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.items.some(item => item.product.bengaliName.toLowerCase().includes(q) || item.product.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [userOrders, activeFilter, orderSearchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalOrders = userOrders.length;
    const deliveredCount = userOrders.filter(o => o.status === 'delivered').length;
    const totalSpent = userOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const wishlistCount = getWishlistCount();

    return { totalOrders, deliveredCount, totalSpent, wishlistCount };
  }, [userOrders, getWishlistCount]);

  // Single Item Re-order
  const handleReorderItem = (item: CartItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check if the product still exists in the catalog
    const catalogProduct = products.find(p => p.id === item.product.id) || item.product;

    addToCart(
      catalogProduct,
      item.selectedSize,
      item.selectedColor,
      item.quantity || 1,
      false,
      item.selectedImage
    );

    setReorderToast({
      show: true,
      message: `"${catalogProduct.bengaliName}" কার্টে যুক্ত করা হয়েছে!`,
      itemsCount: 1
    });

    setIsCartOpen(true);
    setTimeout(() => {
      setReorderToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Re-order Entire Order
  const handleReorderEntireOrder = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!order.items || order.items.length === 0) return;

    let addedCount = 0;
    order.items.forEach(item => {
      const catalogProduct = products.find(p => p.id === item.product.id) || item.product;
      addToCart(
        catalogProduct,
        item.selectedSize,
        item.selectedColor,
        item.quantity || 1,
        false,
        item.selectedImage
      );
      addedCount++;
    });

    setReorderToast({
      show: true,
      message: `অর্ডার #${order.id}-এর সকল পণ্য (${addedCount} টি) কার্টে সফলভাবে যোগ হয়েছে!`,
      itemsCount: addedCount
    });

    setIsCartOpen(true);
    setTimeout(() => {
      setReorderToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // Status badge config
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'অর্ডার গৃহীত (Pending)',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock
        };
      case 'confirmed':
        return {
          label: 'নিশ্চিতকৃত (Confirmed)',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: CheckCircle2
        };
      case 'processing':
        return {
          label: 'প্রসেসিং ও প্যাকেজিং',
          color: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: Package
        };
      case 'shipped':
        return {
          label: 'কুরিয়ারে ট্রানজিট',
          color: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: Truck
        };
      case 'delivered':
        return {
          label: 'ডেলিভারি সম্পন্ন',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          label: 'অর্ডার বাতিল',
          color: 'bg-red-50 text-red-800 border-red-200',
          icon: AlertCircle
        };
      default:
        return {
          label: 'চলমান',
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          icon: Clock
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 animate-fadeIn">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-rose-600 transition-colors">হোম</Link>
          <span>/</span>
          <span className="text-rose-700 font-bold">গ্রাহক প্রোফাইল ও অর্ডার হিস্টোরি</span>
        </div>

        {/* Re-order Toast Notification */}
        {reorderToast.show && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-rose-500/30 flex items-center justify-between gap-3 animate-slideUp">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold font-['Hind_Siliguri']">{reorderToast.message}</p>
                <p className="text-[10px] text-rose-300">কার্ট চেক করুন অথবা সরাসরি চেকআউট করুন</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/checkout')}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
              >
                চেকআউট
              </button>
              <button
                onClick={() => setReorderToast(prev => ({ ...prev, show: false }))}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Profile Save Toast */}
        {saveSuccessToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>আপনার প্রোফাইল ও ডেলিভারি ঠিকানা সফলভাবে সংরক্ষিত হয়েছে!</span>
          </div>
        )}

        {/* Top Profile Hero & Quick Stats */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-100/40 via-pink-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Info Avatar & Basic Bio */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-400 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shadow-rose-200 border-2 border-white shrink-0 font-['Outfit']">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'N'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Hind_Siliguri']">
                    {profile.name || 'সম্মানিত গ্রাহক'}
                  </h1>
                  <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>ভেরিফাইড কাস্টমার</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  {profile.phone && (
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                  {profile.district && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>{profile.thana ? `${profile.thana}, ` : ''}{profile.district}</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 pt-0.5">
                  নারীর স্বপ্ন ফ্যাশন পরিবারের সাথে আপনার কেনাকাটা সবসময় নিরাপদ ও নির্ভরযোগ্য।
                </p>
              </div>
            </div>

            {/* Quick Actions (Edit Profile toggle) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  isEditingProfile 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'বাতিল করুন' : 'প্রোফাইল এডিট করুন'}</span>
              </button>

              <button
                onClick={() => navigate('/wishlist')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition shadow-xs cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
                <span>উইশলিস্ট ({stats.wishlistCount})</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-rose-100 relative z-10">
            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট অর্ডার</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">{stats.totalOrders}</p>
              <p className="text-[10px] text-rose-600 font-medium">লাইফটাইম ক্রয়</p>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ডেলিভারি সম্পন্ন</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 font-['Outfit']">{stats.deliveredCount}</p>
              <p className="text-[10px] text-emerald-600 font-medium">সফল ডেলিভারি</p>
            </div>

            <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট কেনাকাটা</span>
              <p className="text-xl sm:text-2xl font-black text-purple-900 font-['Outfit']">৳{stats.totalSpent.toLocaleString()}</p>
              <p className="text-[10px] text-purple-600 font-medium">পরিশোধিত মূল্য</p>
            </div>

            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">পছন্দের আইটেম</span>
              <p className="text-xl sm:text-2xl font-black text-amber-900 font-['Outfit']">{stats.wishlistCount}</p>
              <p className="text-[10px] text-amber-600 font-medium">উইশলিস্টে সেভ করা</p>
            </div>
          </div>
        </div>

        {/* Profile Edit Drawer / Form */}
        {isEditingProfile && (
          <div className="bg-white rounded-3xl border border-rose-200 shadow-lg p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-rose-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                  গ্রাহক তথ্য ও স্থায়ী ডেলিভারি ঠিকানা সম্পাদনা
                </h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">মোবাইল নম্বর (১১ ডিজিট) *</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 font-mono"
                    placeholder="০১XXXXXXXXX"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    এই নম্বরে অর্ডার সংক্রান্ত এসএমএস ও হিস্টোরি প্রদর্শিত হবে
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="tel"
                    value={editForm.altPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, altPhone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 font-mono"
                    placeholder="জরুরি যোগাযোগের জন্য বিকল্প নম্বর"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    placeholder="example@mail.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">জেলা *</label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value, thana: '' })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">থানা / উপজেলা *</label>
                  <input
                    type="text"
                    value={editForm.thana}
                    onChange={(e) => setEditForm({ ...editForm, thana: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    placeholder="থানা বা উপজেলার নাম"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">বিস্তারিত ডেলিভারি ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                  placeholder="রোড নম্বর, বাসা নম্বর, এলাকা বা ল্যান্ডমার্ক..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>তথ্য সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* Core Section: 'Order History' (অর্ডার ইতিহাস) */}
        {/* ======================================================== */}
        <section id="order-history-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Hind_Siliguri']">
                  অর্ডার ইতিহাস ও পূর্ববর্তী কেনাকাটা (Order History)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                আপনার সম্পন্নকৃত ও চলমান সকল পার্সেলের বিবরণ দেখুন এবং ১-ক্লিকে যেকোনো পণ্য পুনরায় অর্ডার করুন।
              </p>
            </div>

            {/* Quick Track Order Direct Shortcut */}
            <button
              onClick={() => navigate('/track')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Truck className="w-4 h-4 text-rose-600" />
              <span>লাইভ কুরিয়ার ট্র্যাক পেজ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Bar & Status Filter Tabs */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                >
                  সকল অর্ডার ({userOrders.length})
                </button>

                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'active'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                >
                  চলমান ({userOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length})
                </button>

                <button
                  onClick={() => setActiveFilter('delivered')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  ডেলিভারি সম্পন্ন ({userOrders.filter(o => o.status === 'delivered').length})
                </button>

                <button
                  onClick={() => setActiveFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'cancelled'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  বাতিল ({userOrders.filter(o => o.status === 'cancelled').length})
                </button>
              </div>

              {/* Order Search Input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="অর্ডার আইডি বা পণ্যের নাম দিয়ে খুঁজুন..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Orders List / Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 font-['Hind_Siliguri']">
                  কোনো অর্ডার খুঁজে পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {orderSearchQuery 
                    ? 'আপনার সার্চ কুয়েরির সাথে কোনো অর্ডার মিল পাওয়া যায়নি। আবার চেষ্টা করুন।'
                    : 'আপনার এই অ্যাকাউন্টে এখনও কোনো পূর্ববর্তী ক্রয়ের রেকর্ড নেই। আপনার পছন্দের পোশাকটি এখনই অর্ডার করুন!'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>লেটেস্ট কালেকশন দেখুন</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpandedTracker = expandedTrackerOrderId === order.id;

                return (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-3xl border border-rose-100/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card Top: Order ID, Date, Status Badge, Quick Reorder button */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/60 via-pink-50/30 to-white border-b border-rose-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm font-black text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                          <span>#{order.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(order.id)}
                            title="অর্ডার আইডি কপি করুন"
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            {copiedOrderId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </span>

                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.createdAt}</span>
                        </span>

                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>

                      {/* Header Actions: Re-order Entire Order + Invoice */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={(e) => handleReorderEntireOrder(order, e)}
                          title="এই অর্ডারের সব পণ্য পুনরায় কার্টে যুক্ত করে অর্ডার করুন"
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>পুনরায় অর্ডার (Re-order)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          title="ইনভয়েস বা রসিদ দেখুন ও প্রিন্ট করুন"
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card Body: Purchased Items Grid */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="divide-y divide-rose-50">
                        {order.items.map((item, idx) => {
                          const itemImg = item.selectedImage || (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                          const colorHex = item.product.colors?.find(c => c.name === item.selectedColor)?.hex;
                          const displayColor = item.selectedColor || (item.product.colors && item.product.colors[0]?.name) || 'ডিফল্ট';

                          return (
                            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                              {/* Thumbnail and Info */}
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={itemImg}
                                  alt={item.product.bengaliName}
                                  className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover border border-rose-100 shadow-2xs shrink-0 cursor-pointer hover:opacity-90 transition"
                                  onClick={() => navigate(`/product/${item.product.id}`)}
                                />
                                <div className="space-y-1 min-w-0">
                                  <Link 
                                    to={`/product/${item.product.id}`}
                                    className="font-bold text-slate-900 hover:text-rose-600 transition truncate block text-xs sm:text-sm font-['Hind_Siliguri']"
                                  >
                                    {item.product.bengaliName}
                                  </Link>

                                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                    <span className="inline-flex items-center gap-1 font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                                      {colorHex && (
                                        <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
                                      )}
                                      <span>রঙ: {displayColor}</span>
                                    </span>

                                    <span className="font-semibold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                      সাইজ: {item.selectedSize}
                                    </span>

                                    <span className="text-slate-600 font-semibold font-mono">
                                      × {item.quantity} টি
                                    </span>
                                  </div>

                                  <p className="text-[11px] font-bold text-rose-700 font-['Outfit']">
                                    ৳{item.product.price.toLocaleString()} × {item.quantity} = ৳{(item.product.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Single Item Re-order Button */}
                              <div className="shrink-0 flex flex-col items-end gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleReorderItem(item, e)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition active:scale-95 cursor-pointer shadow-2xs"
                                  title="শুধুমাত্র এই পণ্যটি পুনরায় কার্টে যোগ করুন"
                                >
                                  <RotateCcw className="w-3 h-3 text-rose-600" />
                                  <span>পুনরায় কিনুন</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Card Footer: Summary & Tracker Toggle */}
                      <div className="pt-3 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-rose-50/20 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 rounded-b-3xl">
                        <div className="space-y-0.5 text-slate-600">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span><strong>ডেলিভারি ঠিকানা:</strong> {order.address}, {order.thana ? `${order.thana}, ` : ''}{order.district}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px]">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>
                              <strong>পেমেন্ট:</strong> {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod.toUpperCase()}
                            </span>
                            <span className="text-rose-300">|</span>
                            <span>
                              ডেলিভারি চার্জ: ৳{order.deliveryCharge}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">সর্বমোট প্রদেয়</span>
                            <span className="text-base sm:text-lg font-black text-rose-700 font-['Outfit']">
                              ৳{order.total.toLocaleString()}
                            </span>
                          </div>

                          {/* Toggle Visual Progress Tracker */}
                          <button
                            type="button"
                            onClick={() => setExpandedTrackerOrderId(isExpandedTracker ? null : order.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
                              isExpandedTracker
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-300'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{isExpandedTracker ? 'ট্র্যাকার লুকান' : 'অগ্রগতি ট্র্যাকার'}</span>
                            {isExpandedTracker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable OrderProgressTracker */}
                      {isExpandedTracker && (
                        <div className="mt-4 pt-4 border-t border-rose-100 animate-fadeIn">
                          <OrderProgressTracker order={order} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Customer Care Hotline Box */}
        <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 rounded-2xl border border-rose-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-xs shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 font-['Hind_Siliguri'] text-sm">
                অর্ডার সংক্রান্ত কোনো জিজ্ঞাসা বা পরিবর্তনের প্রয়োজন?
              </p>
              <p className="text-slate-500 text-xs">
                আমাদের কাস্টমার কেয়ার প্রতিনিধিরা সপ্তাহে ৭ দিন সকাল ৯টা থেকে রাত ১০টা পর্যন্ত প্রস্তুত।
              </p>
            </div>
          </div>
          <a
            href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <span>কল করুন: {settings.hotline1 || '09617-541717'}</span>
          </a>
        </div>

        {/* Invoice Modal Preview */}
        {selectedInvoiceOrder && (
          <InvoiceModal 
            order={selectedInvoiceOrder} 
            onClose={() => setSelectedInvoiceOrder(null)} 
          />
        )}

      </div>
    </div>
  );
};
