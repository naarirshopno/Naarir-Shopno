import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderStatus } from '../types';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  AlertCircle,
  Calendar,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { PostPurchaseReviewSection } from '../components/PostPurchaseReviewSection';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();

  const { orders, trackingOrderId, setTrackingOrderId, settings, addToCart, setIsCartOpen, products } = useShop();
  const { 
    isEnglish, 
    formatPrice, 
    formatNumber, 
    translateProductName, 
    translateColor, 
    translateSize, 
    translateStatus, 
    translateDistrict 
  } = useLanguage();

  const initialQuery = paramOrderId || searchParams.get('id') || trackingOrderId || '';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    const query = (paramOrderId || searchParams.get('id') || trackingOrderId || '').trim().toLowerCase();
    if (query) {
      setSearchInput(query);
      const found = orders.find(
        (o) =>
          o.id.toLowerCase() === query ||
          o.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
      );
      setMatchedOrder(found || null);
      setHasSearched(true);
    }
  }, [paramOrderId, searchParams, trackingOrderId, orders]);

  // Sync matched order if updated in orders state (e.g. after cancellation)
  useEffect(() => {
    if (matchedOrder) {
      const fresh = orders.find(o => o.id === matchedOrder.id);
      if (fresh && (fresh.status !== matchedOrder.status || fresh.cancelledAt !== matchedOrder.cancelledAt)) {
        setMatchedOrder(fresh);
      }
    }
  }, [orders, matchedOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
    );

    setMatchedOrder(found || null);
    setHasSearched(true);
    if (found) {
      setTrackingOrderId(found.id);
    }
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = matchedOrder ? getStatusStepIndex(matchedOrder.status) : 0;

  const steps = isEnglish ? [
    { title: 'Order Placed', desc: 'Order received in system' },
    { title: 'Confirmation', desc: 'Confirmed by representative' },
    { title: 'Packaging Done', desc: 'Parcel is packed & ready' },
    { title: 'Courier Transit', desc: 'Handed over to courier partner' },
    { title: 'Delivered', desc: 'Received by customer' },
  ] : [
    { title: 'অর্ডার গৃহীত', desc: 'অর্ডার প্লেস করা হয়েছে' },
    { title: 'কনফার্মেশন', desc: 'ফোনে নিশ্চিত করা হয়েছে' },
    { title: 'প্যাকেজিং সম্পন্ন', desc: 'পার্সেল প্রস্তুত' },
    { title: 'কুরিয়ার ট্রানজিট', desc: 'কুরিয়ারে হস্তান্তর হয়েছে' },
    { title: 'ডেলিভারি সম্পন্ন', desc: 'কাস্টমার রিসিভ করেছেন' },
  ];

  const handleReorderOrder = () => {
    if (!matchedOrder || !matchedOrder.items) return;
    matchedOrder.items.forEach(it => {
      const p = products.find(prod => prod.id === it.product.id) || it.product;
      addToCart(p, it.selectedSize, it.selectedColor, it.quantity, false, it.selectedImage);
    });
    setIsCartOpen(true);
  };

  const isCancellable = matchedOrder && (matchedOrder.status === 'pending' || matchedOrder.status === 'confirmed');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* 1. Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="text-slate-600 hover:text-rose-600 font-medium">
            {isEnglish ? 'Home' : 'হোম'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-rose-700 font-bold">
            {isEnglish ? 'Order Tracking' : 'অর্ডার ট্র্যাকিং'}
          </span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-full border border-slate-200 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEnglish ? 'Go Back' : 'পেছনে ফিরুন'}</span>
        </button>
      </div>

      {/* 2. Page Title Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold">
            <Truck className="w-4 h-4" />
            <span>{isEnglish ? 'Live Parcel Tracking' : 'লাইভ পার্সেল ট্র্যাকিং'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Hind_Siliguri']">
            {isEnglish ? 'Check Delivery Status of Your Order' : 'আপনার অর্ডারের ডেলিভারি স্ট্যাটাস জানুন'}
          </h1>
          <p className="text-xs sm:text-sm text-pink-100">
            {isEnglish
              ? 'Get real-time updates at every stage from parcel packing to courier delivery right here.'
              : 'অর্ডার করার পর পার্সেল প্যাকিং থেকে শুরু করে কুরিয়ার ডেলিভারি পর্যন্ত প্রতিটি ধাপের আপডেট এখানে রিয়েল-টাইমে দেখতে পাবেন।'}
          </p>
        </div>
      </div>

      {/* 3. Search Box */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-5 sm:p-7 space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-slate-800 font-['Hind_Siliguri']">
            {isEnglish
              ? 'Enter your Order ID (e.g. NS-1045) or Mobile Number:'
              : 'আপনার অর্ডার আইডি (যেমন: NS-1045) অথবা মোবাইল নম্বর লিখুন:'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="input-track-search-page"
                type="text"
                placeholder={isEnglish ? 'e.g. NS-1001 or 017XXXXXXXX' : 'উদাহরণ: NS-1001 অথবা 017XXXXXXXX'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-rose-50/40 border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-900"
              />
              <Search className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-md transition shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isEnglish ? 'Track Order' : 'ট্র্যাক করুন'}</span>
            </button>
          </div>
        </form>

        {/* Recent orders quick chips */}
        {orders.length > 0 && !matchedOrder && (
          <div className="pt-2 border-t border-rose-100">
            <p className="text-[11px] text-slate-500 mb-2">
              {isEnglish ? 'Quick check recent orders:' : 'সাম্প্রতিক অর্ডারগুলো এক ক্লিকে চেক করুন:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {orders.slice(0, 4).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setSearchInput(ord.id);
                    setMatchedOrder(ord);
                    setHasSearched(true);
                  }}
                  className="text-xs bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-300 px-3 py-1.5 rounded-full font-mono transition text-slate-700 cursor-pointer"
                >
                  #{ord.id} ({ord.customerName})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Tracking Results */}
      {hasSearched && (
        matchedOrder ? (
          <div className="space-y-6">
            {/* Order Status Hero Card */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-6 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-rose-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-black text-rose-700">
                      #{matchedOrder.id}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{matchedOrder.createdAt}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-['Hind_Siliguri']">
                    {isEnglish ? 'Customer:' : 'গ্রাহক:'} {matchedOrder.customerName}
                  </h3>
                </div>

                {/* Status Badge & Cancel Button */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    matchedOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : matchedOrder.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : matchedOrder.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{translateStatus(matchedOrder.status)}</span>
                  </span>

                  {/* Cancel Order Action Button */}
                  {isCancellable && (
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 px-3 py-1.5 rounded-full border border-red-200 transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>{isEnglish ? 'Cancel Order' : 'অর্ডার বাতিল করুন'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cancelled Order Notice Banner */}
              {matchedOrder.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-900">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">
                        {isEnglish ? 'This Order Has Been Cancelled' : 'এই অর্ডারটি বাতিল করা হয়েছে'}
                      </h4>
                      {matchedOrder.cancelReason && (
                        <p className="text-xs text-red-700">
                          <strong>{isEnglish ? 'Reason: ' : 'বাতিলের কারণ: '}</strong>{matchedOrder.cancelReason}
                        </p>
                      )}
                      {matchedOrder.cancelledAt && (
                        <p className="text-[11px] text-red-600">
                          <strong>{isEnglish ? 'Cancelled on: ' : 'বাতিলের সময়: '}</strong>{matchedOrder.cancelledAt}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReorderOrder}
                    className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isEnglish ? 'Re-order Items' : 'পুনরায় অর্ডার করুন'}</span>
                  </button>
                </div>
              )}

              {/* Live Courier Details */}
              {matchedOrder.courier && matchedOrder.courier.name && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">
                        {isEnglish ? 'Courier Partner:' : 'কুরিয়ার পার্টনার:'} {matchedOrder.courier.name}
                      </span>
                    </div>
                    {matchedOrder.courier.trackingId && (
                      <div className="flex items-center gap-1 text-xs bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-mono text-slate-800">
                        <span>{isEnglish ? 'Tracking Code:' : 'ট্র্যাকিং কোড:'} {matchedOrder.courier.trackingId}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard && matchedOrder.courier?.trackingId) {
                              navigator.clipboard.writeText(matchedOrder.courier.trackingId);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            }
                          }}
                          className="p-1 rounded hover:bg-blue-50 text-slate-600 hover:text-blue-700 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {matchedOrder.courier.estimatedDelivery && (
                    <p className="text-xs text-blue-800 font-medium">
                      📅 {isEnglish ? 'Estimated Delivery:' : 'সম্ভাব্য পৌঁছানোর তারিখ:'} <strong>{matchedOrder.courier.estimatedDelivery}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Visual Delivery Stepper (Only if not cancelled) */}
              {matchedOrder.status !== 'cancelled' && (
                <div className="p-5 sm:p-7 bg-rose-50/20 rounded-3xl border border-rose-100">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6">
                    {isEnglish ? 'Delivery Progress Timeline' : 'ডেলিভারি অগ্রগতি টাইমলাইন'}
                  </h4>

                  <div className="relative flex flex-col md:flex-row justify-between gap-5">
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 flex-1 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all z-10 ${
                            isCompleted
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-4 ring-rose-100'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : formatNumber(idx + 1)}
                          </div>

                          <div>
                            <p className={`text-xs font-bold ${isCurrent ? 'text-rose-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {st.title}
                            </p>
                            <p className="text-[11px] text-slate-400">{st.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Info & Destination Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Destination */}
                <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 space-y-2">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>{isEnglish ? 'Delivery Address' : 'ডেলিভারি ঠিকানা'}</span>
                  </h5>
                  <p className="text-slate-700"><strong>{isEnglish ? 'Recipient:' : 'প্রাপক:'}</strong> {matchedOrder.customerName}</p>
                  <p className="text-slate-700"><strong>{isEnglish ? 'Phone:' : 'ফোন নম্বর:'}</strong> {matchedOrder.phone}</p>
                  <p className="text-slate-600">
                    <strong>{isEnglish ? 'Address:' : 'ঠিকানা:'}</strong> {matchedOrder.address}, {matchedOrder.thana ? `${isEnglish ? 'Thana: ' : 'থানা: '}${matchedOrder.thana}, ` : ''}{translateDistrict(matchedOrder.district)}
                  </p>
                  <p className="text-slate-600">
                    <strong>{isEnglish ? 'Payment Method:' : 'পেমেন্ট মেথড:'}</strong> {matchedOrder.paymentMethod === 'cod' ? (isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা পরিশোধ)') : matchedOrder.paymentMethod.toUpperCase()}
                  </p>
                </div>

                {/* Ordered Items */}
                <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 space-y-3">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Package className="w-4 h-4 text-rose-600" />
                    <span>
                      {isEnglish 
                        ? `Ordered Items (${formatNumber(matchedOrder.items.length)} items)`
                        : `অর্ডারকৃত পোশাকসমূহ (${formatNumber(matchedOrder.items.length)} টি)`}
                    </span>
                  </h5>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {matchedOrder.items.map((it, i) => {
                      const itemImg = it.selectedImage || (it.product.images && it.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-rose-100 shadow-2xs">
                          <img
                            src={itemImg}
                            alt={translateProductName(it.product)}
                            className="w-12 h-14 rounded-lg object-cover border border-rose-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/product/${it.product.id}`}
                              className="font-bold text-slate-800 hover:text-rose-600 line-clamp-1 text-xs"
                            >
                              {translateProductName(it.product)}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span>{isEnglish ? 'Size: ' : 'সাইজ: '}{translateSize(it.selectedSize)}</span>
                              <span>•</span>
                              <span>{isEnglish ? 'Color: ' : 'রঙ: '}{translateColor(it.selectedColor || 'ডিফল্ট')}</span>
                              <span>•</span>
                              <span>{formatNumber(it.quantity)} {isEnglish ? 'pcs' : 'টি'}</span>
                            </div>
                          </div>
                          <span className="font-bold font-['Outfit'] text-rose-700 text-xs sm:text-sm shrink-0">
                            {formatPrice(it.product.price * it.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 flex justify-between items-center font-bold text-rose-700 border-t border-rose-100">
                    <span className="text-slate-600 text-xs">{isEnglish ? 'Total Payable:' : 'মোট পরিশোধযোগ্য:'}</span>
                    <span className="font-['Outfit'] text-base font-black">{formatPrice(matchedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* 5. Post-Purchase Customer Review Section */}
              <div className="pt-4 border-t border-rose-100">
                <PostPurchaseReviewSection
                  orderId={matchedOrder.id}
                  customerName={matchedOrder.customerName}
                  customerLocation={matchedOrder.district || matchedOrder.address}
                  items={matchedOrder.items}
                />
              </div>

              {/* Hotline Support */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">
                      {isEnglish ? 'Call for any inquiry or delivery assistance:' : 'যেকোনো প্রশ্ন বা ডেলিভারি সহায়তার জন্য কল করুন:'}
                    </span>
                    {settings.supportHours && (
                      <p className="text-[10px] text-emerald-600 font-semibold">{settings.supportHours}</p>
                    )}
                  </div>
                </div>
                <a
                  href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{settings.hotline1 || '09617-541717'}</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-10 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 font-['Hind_Siliguri']">
              {isEnglish ? 'No Order Found' : 'কোনো অর্ডার খুঁজে পাওয়া যায়নি'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {isEnglish
                ? 'Please verify your Order ID (e.g. NS-1045) or the mobile number used when ordering and try searching again.'
                : 'অনুগ্রহ করে আপনার সঠিক অর্ডার আইডি (যেমন: NS-1045) অথবা অর্ডার করার সময় ব্যবহৃত মোবাইল নম্বরটি দিয়ে পুনরায় অনুসন্ধান করুন।'}
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isEnglish ? 'Browse Dress Collection' : 'পোশাক কালেকশন দেখুন'}</span>
              </Link>
            </div>
          </div>
        )
      )}

      {/* Cancel Order Modal */}
      <CancelOrderModal
        order={matchedOrder}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={(cancelledId) => {
          const fresh = orders.find(o => o.id === cancelledId);
          if (fresh) setMatchedOrder(fresh);
        }}
      />
    </div>
  );
};
