import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderStatus, CartItem, CustomerProfile, Product } from '../types';
import { BANGLADESH_DISTRICTS, getThanasForDistrict } from '../data/bangladeshData';
import { OrderProgressTracker } from '../components/OrderProgressTracker';
import { InvoiceModal } from '../components/InvoiceModal';
import { CancelOrderModal } from '../components/CancelOrderModal';
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
  CreditCard,
  XCircle
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
  const { 
    isEnglish, 
    formatPrice, 
    formatNumber, 
    translateProductName, 
    translateColor, 
    translateSize, 
    translateStatus, 
    translateDistrict,
    translateSupportHours,
  } = useLanguage();

  // Selected order for cancellation modal
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);

  // 1. Profile State (Stored in localStorage strictly for this device)
  const [profile, setProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem('ns_customer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            name: parsed.name || '',
            phone: parsed.phone || '',
            altPhone: parsed.altPhone || '',
            email: parsed.email || '',
            district: parsed.district || 'ঢাকা',
            thana: parsed.thana || '',
            address: parsed.address || '',
          };
        }
      }
    } catch {
      // fallback
    }

    // Check if an order was placed from this device
    try {
      const myIds: string[] = JSON.parse(localStorage.getItem('ns_my_order_ids') || '[]');
      if (myIds.length > 0) {
        const myLast = orders.find(o => myIds.includes(o.id));
        if (myLast) {
          return {
            name: myLast.customerName || '',
            phone: myLast.phone || '',
            altPhone: myLast.altPhone || '',
            email: myLast.customerEmail || '',
            district: myLast.district || 'ঢাকা',
            thana: myLast.thana || '',
            address: myLast.address || '',
          };
        }
      }
    } catch {}

    return {
      name: '',
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

  // Quick phone lookup input for customers who ordered from another device
  const [lookupPhoneInput, setLookupPhoneInput] = useState('');
  const [lookupFeedback, setLookupFeedback] = useState<string | null>(null);

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

  // Lookup previous orders by phone number
  const handleLookupByPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupPhoneInput.replace(/[^0-9]/g, '');
    if (clean.length < 6) {
      setLookupFeedback(isEnglish ? 'Please enter a valid phone number.' : 'অনুগ্রহ করে সঠিক ফোন নম্বর দিন (যেমন: 01711...)');
      return;
    }
    const found = orders.filter(o => {
      const p1 = (o.phone || '').replace(/[^0-9]/g, '');
      const p2 = (o.altPhone || '').replace(/[^0-9]/g, '');
      return p1 === clean || p2 === clean || (clean.length >= 10 && (p1.endsWith(clean.slice(-10)) || p2.endsWith(clean.slice(-10))));
    });
    if (found.length > 0) {
      const updated = {
        ...profile,
        phone: clean,
        name: profile.name || found[0].customerName || '',
        district: profile.district || found[0].district || 'ঢাকা',
        thana: profile.thana || found[0].thana || '',
        address: profile.address || found[0].address || '',
      };
      setProfile(updated);
      try {
        localStorage.setItem('ns_customer_profile', JSON.stringify(updated));
        const currentIds: string[] = JSON.parse(localStorage.getItem('ns_my_order_ids') || '[]');
        const merged = Array.from(new Set([...found.map(o => o.id), ...currentIds]));
        localStorage.setItem('ns_my_order_ids', JSON.stringify(merged));
      } catch {}
      setLookupFeedback(isEnglish ? `Found ${formatNumber(found.length)} orders linked to your phone!` : `আপনার ${formatNumber(found.length)}টি পূর্ববর্তী অর্ডার পাওয়া গেছে!`);
      setTimeout(() => setLookupFeedback(null), 4000);
    } else {
      setLookupFeedback(isEnglish ? 'No orders found matching this phone number.' : 'এই ফোন নম্বরে কোনো পূর্ববর্তী অর্ডার খুঁজে পাওয়া যায়নি।');
    }
  };

  // Filter orders matching ONLY this customer's device orders or their phone number
  const userOrders = useMemo(() => {
    let deviceOrderIds: string[] = [];
    try {
      deviceOrderIds = JSON.parse(localStorage.getItem('ns_my_order_ids') || '[]');
    } catch {}

    const cleanUserPhone = (profile.phone || '').replace(/[^0-9]/g, '');

    // If customer has neither placed an order on this device nor saved a valid phone number,
    // they have no order history yet (NEVER show other customers' orders!)
    if (deviceOrderIds.length === 0 && cleanUserPhone.length < 6) {
      return [];
    }

    const matched = orders.filter((o) => {
      // 1. Was this order placed from this browser/device?
      if (deviceOrderIds.includes(o.id)) return true;

      // 2. Does this order match the customer's phone number?
      if (cleanUserPhone.length >= 6) {
        const orderPhone = (o.phone || '').replace(/[^0-9]/g, '');
        const orderAltPhone = (o.altPhone || '').replace(/[^0-9]/g, '');
        if (orderPhone === cleanUserPhone || orderAltPhone === cleanUserPhone) return true;
        if (cleanUserPhone.length >= 10 && (orderPhone.endsWith(cleanUserPhone.slice(-10)) || orderAltPhone.endsWith(cleanUserPhone.slice(-10)))) return true;
      }

      return false;
    });

    return matched;
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
      message: isEnglish 
        ? `"${translateProductName(catalogProduct)}" added to bag!` 
        : `"${translateProductName(catalogProduct)}" কার্টে যুক্ত করা হয়েছে!`,
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
      message: isEnglish
        ? `All items (${formatNumber(addedCount)}) from Order #${order.id} added to bag!`
        : `অর্ডার #${order.id}-এর সকল পণ্য (${formatNumber(addedCount)} টি) কার্টে সফলভাবে যোগ হয়েছে!`,
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
          label: isEnglish ? 'Pending' : 'অর্ডার গৃহীত (Pending)',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock
        };
      case 'confirmed':
        return {
          label: isEnglish ? 'Confirmed' : 'নিশ্চিতকৃত (Confirmed)',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: CheckCircle2
        };
      case 'processing':
        return {
          label: isEnglish ? 'Processing' : 'প্রসেসিং ও প্যাকেজিং',
          color: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: Package
        };
      case 'shipped':
        return {
          label: isEnglish ? 'Shipped (In Transit)' : 'কুরিয়ারে ট্রানজিট',
          color: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: Truck
        };
      case 'delivered':
        return {
          label: isEnglish ? 'Delivered' : 'ডেলিভারি সম্পন্ন',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          label: isEnglish ? 'Cancelled' : 'অর্ডার বাতিল',
          color: 'bg-red-50 text-red-800 border-red-200',
          icon: AlertCircle
        };
      default:
        return {
          label: isEnglish ? 'Active' : 'চলমান',
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          icon: Clock
        };
    }
  };

  return (
    <div className="w-full min-w-0 min-h-screen bg-transparent py-6 sm:py-10 overflow-x-hidden">
      <div className="w-full min-w-0 max-w-6xl mx-auto px-3 sm:px-6 space-y-8 animate-fadeIn">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-rose-600 transition-colors">
            {isEnglish ? 'Home' : 'হোম'}
          </Link>
          <span>/</span>
          <span className="text-rose-700 font-bold">
            {isEnglish ? 'Customer Profile & Order History' : 'গ্রাহক প্রোফাইল ও অর্ডার হিস্টোরি'}
          </span>
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
                <p className="text-[10px] text-rose-300">
                  {isEnglish ? 'Check your bag or proceed to checkout' : 'কার্ট চেক করুন অথবা সরাসরি চেকআউট করুন'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/checkout')}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
              >
                {isEnglish ? 'Checkout' : 'চেকআউট'}
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
            <span>
              {isEnglish
                ? 'Your profile and delivery address have been saved!'
                : 'আপনার প্রোফাইল ও ডেলিভারি ঠিকানা সফলভাবে সংরক্ষিত হয়েছে!'}
            </span>
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
                    {profile.name || (isEnglish ? 'Valued Customer' : 'সম্মানিত গ্রাহক')}
                  </h1>
                  <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>{isEnglish ? 'Verified Customer' : 'ভেরিফাইড কাস্টমার'}</span>
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
                      <span>{profile.thana ? `${profile.thana}, ` : ''}{translateDistrict(profile.district)}</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 pt-0.5">
                  {isEnglish
                    ? 'Your shopping with the Naarir Shopno fashion family is always safe and reliable.'
                    : 'নারীর স্বপ্ন ফ্যাশন পরিবারের সাথে আপনার কেনাকাটা সবসময় নিরাপদ ও নির্ভরযোগ্য।'}
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
                <span>{isEditingProfile ? (isEnglish ? 'Cancel' : 'বাতিল করুন') : (isEnglish ? 'Edit Profile' : 'প্রোফাইল এডিট করুন')}</span>
              </button>

              <button
                onClick={() => navigate('/wishlist')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition shadow-xs cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
                <span>{isEnglish ? `Wishlist (${formatNumber(stats.wishlistCount)})` : `উইশলিস্ট (${formatNumber(stats.wishlistCount)})`}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-rose-100 relative z-10">
            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnglish ? 'Total Orders' : 'মোট অর্ডার'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                {formatNumber(stats.totalOrders)}
              </p>
              <p className="text-[10px] text-rose-600 font-medium">
                {isEnglish ? 'Lifetime Orders' : 'লাইফটাইম ক্রয়'}
              </p>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnglish ? 'Delivered' : 'ডেলিভারি সম্পন্ন'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 font-['Outfit']">
                {formatNumber(stats.deliveredCount)}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                {isEnglish ? 'Successful Delivery' : 'সফল ডেলিভারি'}
              </p>
            </div>

            <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnglish ? 'Total Spent' : 'মোট কেনাকাটা'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-purple-900 font-['Outfit']">
                {formatPrice(stats.totalSpent)}
              </p>
              <p className="text-[10px] text-purple-600 font-medium">
                {isEnglish ? 'Paid Amount' : 'পরিশোধিত মূল্য'}
              </p>
            </div>

            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/70 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnglish ? 'Wishlist' : 'পছন্দের আইটেম'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-900 font-['Outfit']">
                {formatNumber(stats.wishlistCount)}
              </p>
              <p className="text-[10px] text-amber-600 font-medium">
                {isEnglish ? 'Saved in Wishlist' : 'উইশলিস্টে সেভ করা'}
              </p>
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
                  {isEnglish ? 'Edit Customer Details & Permanent Delivery Address' : 'গ্রাহক তথ্য ও স্থায়ী ডেলিভারি ঠিকানা সম্পাদনা'}
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
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'Your Name *' : 'আপনার নাম *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    placeholder={isEnglish ? 'Enter your full name' : 'আপনার পূর্ণ নাম লিখুন'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'Mobile Number (11 Digits) *' : 'মোবাইল নম্বর (১১ ডিজিট) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 font-mono"
                    placeholder="01XXXXXXXXX"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {isEnglish
                      ? 'Order SMS updates and order history will be synced with this number'
                      : 'এই নম্বরে অর্ডার সংক্রান্ত এসএমএস ও হিস্টোরি প্রদর্শিত হবে'}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'Alternative Mobile (Optional)' : 'বিকল্প মোবাইল নম্বর (ঐচ্ছিক)'}
                  </label>
                  <input
                    type="tel"
                    value={editForm.altPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, altPhone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 font-mono"
                    placeholder={isEnglish ? 'Alternative number for urgent contact' : 'জরুরি যোগাযোগের জন্য বিকল্প নম্বর'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'Email Address (Optional)' : 'ইমেইল ঠিকানা (ঐচ্ছিক)'}
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    placeholder="example@mail.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'District *' : 'জেলা *'}
                  </label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value, thana: '' })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{translateDistrict(dist)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'Thana / Upazila *' : 'থানা / উপজেলা *'}
                  </label>
                  <input
                    type="text"
                    value={editForm.thana}
                    onChange={(e) => setEditForm({ ...editForm, thana: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    placeholder={isEnglish ? 'Enter thana or upazila name' : 'থানা বা উপজেলার নাম'}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isEnglish ? 'Detailed Delivery Address *' : 'বিস্তারিত ডেলিভারি ঠিকানা *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                  placeholder={isEnglish ? 'Road number, house number, area or landmark...' : 'রোড নম্বর, বাসা নম্বর, এলাকা বা ল্যান্ডমার্ক...'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  {isEnglish ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEnglish ? 'Save Information' : 'তথ্য সংরক্ষণ করুন'}</span>
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
                  {isEnglish ? 'Order History & Previous Purchases' : 'অর্ডার ইতিহাস ও পূর্ববর্তী কেনাকাটা (Order History)'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isEnglish
                  ? 'View details of your past and active parcels, or re-order any dress in 1 click.'
                  : 'আপনার সম্পন্নকৃত ও চলমান সকল পার্সেলের বিবরণ দেখুন এবং ১-ক্লিকে যেকোনো পণ্য পুনরায় অর্ডার করুন।'}
              </p>
            </div>

            {/* Quick Track Order Direct Shortcut */}
            <button
              onClick={() => navigate('/track')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Truck className="w-4 h-4 text-rose-600" />
              <span>{isEnglish ? 'Live Courier Tracking Page' : 'লাইভ কুরিয়ার ট্র্যাক পেজ'}</span>
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
                  {isEnglish 
                    ? `All Orders (${formatNumber(userOrders.length)})` 
                    : `সকল অর্ডার (${formatNumber(userOrders.length)})`}
                </button>

                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'active'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                >
                  {isEnglish 
                    ? `Active (${formatNumber(userOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length)})` 
                    : `চলমান (${formatNumber(userOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length)})`}
                </button>

                <button
                  onClick={() => setActiveFilter('delivered')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {isEnglish 
                    ? `Delivered (${formatNumber(userOrders.filter(o => o.status === 'delivered').length)})` 
                    : `ডেলিভারি সম্পন্ন (${formatNumber(userOrders.filter(o => o.status === 'delivered').length)})`}
                </button>

                <button
                  onClick={() => setActiveFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'cancelled'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  {isEnglish 
                    ? `Cancelled (${formatNumber(userOrders.filter(o => o.status === 'cancelled').length)})` 
                    : `বাতিল (${formatNumber(userOrders.filter(o => o.status === 'cancelled').length)})`}
                </button>
              </div>

              {/* Order Search Input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder={isEnglish ? 'Search by Order ID or Product name...' : 'অর্ডার আইডি বা পণ্যের নাম দিয়ে খুঁজুন...'}
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
                  {isEnglish ? 'No Orders Found' : 'কোনো অর্ডার খুঁজে পাওয়া যায়নি'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {orderSearchQuery 
                    ? (isEnglish ? 'No orders matched your search query. Please try again.' : 'আপনার সার্চ কুয়েরির সাথে কোনো অর্ডার মিল পাওয়া যায়নি। আবার চেষ্টা করুন।')
                    : (isEnglish ? 'You have no previous purchase records in this account yet. Order your favorite dress today!' : 'আপনার এই অ্যাকাউন্টে এখনও কোনো পূর্ববর্তী ক্রয়ের রেকর্ড নেই। আপনার পছন্দের পোশাকটি এখনই অর্ডার করুন!')}
                </p>
              </div>
              <div className="pt-2 flex flex-col items-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEnglish ? 'Explore Latest Collection' : 'লেটেস্ট কালেকশন দেখুন'}</span>
                </button>

                {/* Quick Phone Lookup Box */}
                <div className="mt-4 pt-4 border-t border-rose-100 max-w-md w-full text-center">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    {isEnglish ? 'Ordered before from another device or phone?' : 'আগে অন্য মোবাইল বা কম্পিউটার থেকে অর্ডার করেছিলেন?'}
                  </p>
                  <form onSubmit={handleLookupByPhone} className="flex gap-2">
                    <input
                      type="tel"
                      value={lookupPhoneInput}
                      onChange={(e) => setLookupPhoneInput(e.target.value)}
                      placeholder={isEnglish ? 'Enter your 11-digit phone number' : 'আপনার মোবাইল নম্বর দিন (যেমন: 01711...)'}
                      className="flex-1 px-3 py-2 text-xs bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-center sm:text-left"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shrink-0 cursor-pointer"
                    >
                      {isEnglish ? 'Find My Orders' : 'আমার অর্ডার খুঁজুন'}
                    </button>
                  </form>
                  {lookupFeedback && (
                    <p className={`text-[11px] font-semibold mt-2.5 ${lookupFeedback.includes('✅') || lookupFeedback.includes('পাওয়া গেছে') || lookupFeedback.includes('Found') ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {lookupFeedback}
                    </p>
                  )}
                </div>
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
                            title={isEnglish ? 'Copy Order ID' : 'অর্ডার আইডি কপি করুন'}
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

                        {order.status === 'cancelled' && order.cancelReason && (
                          <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                            {isEnglish ? 'Reason: ' : 'কারণ: '}{order.cancelReason}
                          </span>
                        )}
                      </div>

                      {/* Header Actions: Re-order Entire Order + Cancel Order + Invoice */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                        {/* Cancel Order Action if order is pending or confirmed */}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCancelOrder(order);
                            }}
                            title={isEnglish ? 'Cancel this order' : 'অর্ডারটি বাতিল করুন'}
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-xl transition active:scale-95 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>{isEnglish ? 'Cancel' : 'বাতিল করুন'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleReorderEntireOrder(order, e)}
                          title={isEnglish ? 'Add all items from this order back to cart' : 'এই অর্ডারের সব পণ্য পুনরায় কার্টে যুক্ত করে অর্ডার করুন'}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isEnglish ? 'Re-order' : 'পুনরায় অর্ডার (Re-order)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          title={isEnglish ? 'View & Print Invoice / Receipt' : 'ইনভয়েস বা রসিদ দেখুন ও প্রিন্ট করুন'}
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
                                  alt={translateProductName(item.product)}
                                  className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover border border-rose-100 shadow-2xs shrink-0 cursor-pointer hover:opacity-90 transition"
                                  onClick={() => navigate(`/product/${item.product.id}`)}
                                />
                                <div className="space-y-1 min-w-0">
                                  <Link 
                                    to={`/product/${item.product.id}`}
                                    className="font-bold text-slate-900 hover:text-rose-600 transition truncate block text-xs sm:text-sm font-['Hind_Siliguri']"
                                  >
                                    {translateProductName(item.product)}
                                  </Link>

                                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                    <span className="inline-flex items-center gap-1 font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                                      {colorHex && (
                                        <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
                                      )}
                                      <span>{isEnglish ? 'Color:' : 'রঙ:'} {translateColor(displayColor)}</span>
                                    </span>

                                    <span className="font-semibold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                      {isEnglish ? 'Size:' : 'সাইজ:'} {translateSize(item.selectedSize)}
                                    </span>

                                    <span className="text-slate-600 font-semibold font-mono">
                                      × {formatNumber(item.quantity)} {isEnglish ? 'pcs' : 'টি'}
                                    </span>
                                  </div>

                                  <p className="text-[11px] font-bold text-rose-700 font-['Outfit']">
                                    {formatPrice(item.product.price)} × {formatNumber(item.quantity)} = {formatPrice(item.product.price * item.quantity)}
                                  </p>
                                </div>
                              </div>

                              {/* Single Item Re-order Button */}
                              <div className="shrink-0 flex flex-col items-end gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleReorderItem(item, e)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition active:scale-95 cursor-pointer shadow-2xs"
                                  title={isEnglish ? 'Add only this item back to cart' : 'শুধুমাত্র এই পণ্যটি পুনরায় কার্টে যোগ করুন'}
                                >
                                  <RotateCcw className="w-3 h-3 text-rose-600" />
                                  <span>{isEnglish ? 'Buy Again' : 'পুনরায় কিনুন'}</span>
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
                            <span>
                              <strong>{isEnglish ? 'Delivery Address:' : 'ডেলিভারি ঠিকানা:'}</strong>{' '}
                              {order.address}, {order.thana ? `${order.thana}, ` : ''}{translateDistrict(order.district)}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px]">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>
                              <strong>{isEnglish ? 'Payment:' : 'পেমেন্ট:'}</strong>{' '}
                              {order.paymentMethod === 'cod'
                                ? (isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)')
                                : order.paymentMethod.toUpperCase()}
                            </span>
                            <span className="text-rose-300">|</span>
                            <span>
                              {isEnglish ? 'Delivery Charge:' : 'ডেলিভারি চার্জ:'} {formatPrice(order.deliveryCharge)}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              {isEnglish ? 'Total Payable' : 'সর্বমোট প্রদেয়'}
                            </span>
                            <span className="text-base sm:text-lg font-black text-rose-700 font-['Outfit']">
                              {formatPrice(order.total)}
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
                            <span>
                              {isExpandedTracker
                                ? (isEnglish ? 'Hide Tracker' : 'ট্র্যাকার লুকান')
                                : (isEnglish ? 'Progress Tracker' : 'অগ্রগতি ট্র্যাকার')}
                            </span>
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
                {isEnglish ? 'Questions or changes regarding an order?' : 'অর্ডার সংক্রান্ত কোনো জিজ্ঞাসা বা পরিবর্তনের প্রয়োজন?'}
              </p>
              <p className="text-slate-500 text-xs">
                {translateSupportHours(settings.supportHours)}
              </p>
            </div>
          </div>
          <a
            href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <span>{isEnglish ? 'Call:' : 'কল করুন:'} {settings.hotline1 || '09617-541717'}</span>
          </a>
        </div>

        {/* Invoice Modal Preview */}
        {selectedInvoiceOrder && (
          <InvoiceModal 
            order={selectedInvoiceOrder} 
            onClose={() => setSelectedInvoiceOrder(null)} 
          />
        )}

        {/* Cancel Order Modal */}
        <CancelOrderModal
          order={selectedCancelOrder}
          isOpen={Boolean(selectedCancelOrder)}
          onClose={() => setSelectedCancelOrder(null)}
        />

      </div>
    </div>
  );
};
