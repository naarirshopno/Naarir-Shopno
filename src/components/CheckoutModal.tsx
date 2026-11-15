import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { BANGLADESH_DISTRICTS, getThanasForDistrict } from '../data/bangladeshData';
import { DeliveryZoneId, PaymentMethodType, CartItem, Order } from '../types';
import { 
  X, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  FileText,
  Sparkles,
  Mail
} from 'lucide-react';
import { PostPurchaseReviewSection } from './PostPurchaseReviewSection';
import { OrderProgressTracker } from './OrderProgressTracker';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    clearCart, 
    directCheckoutItem, 
    setDirectCheckoutItem, 
    settings, 
    createOrder,
    setIsOrderTrackingOpen,
    setTrackingOrderId,
    openOrderSuccessModal
  } = useShop();

  const {
    isEnglish,
    formatPrice,
    formatNumber,
    translateProductName,
    translateColor,
    translateSize,
    translateDistrict,
  } = useLanguage();

  // Active items being checked out
  const checkoutItems: CartItem[] = directCheckoutItem ? [directCheckoutItem] : cart;

  const navigate = useNavigate();

  // Form states initialized from saved customer profile
  const [customerName, setCustomerName] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).name || '';
    } catch {}
    return '';
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).email || '';
    } catch {}
    return '';
  });
  const [phone, setPhone] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).phone || '';
    } catch {}
    return '';
  });
  const [altPhone, setAltPhone] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).altPhone || '';
    } catch {}
    return '';
  });
  const [district, setDistrict] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).district || 'ঢাকা';
    } catch {}
    return 'ঢাকা';
  });
  const [thana, setThana] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).thana || '';
    } catch {}
    return '';
  });
  const [isCustomThana, setIsCustomThana] = useState(false);
  const [address, setAddress] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).address || '';
    } catch {}
    return '';
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneId>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [senderAccount, setSenderAccount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedText, setCopiedText] = useState(false);

  // Success state after order placed
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

  // Free Delivery Rule: Any 3 products (items >= 3) OR subtotal >= 3000 (freeDeliveryAbove)
  const freeThreshold = settings.deliveryCharges.freeDeliveryAbove || 3000;
  const freeMinItems = settings.deliveryCharges.freeDeliveryMinItems || 3;
  const isFreeDelivery = totalItemCount >= freeMinItems || subtotal >= freeThreshold;

  // Calculate dynamic delivery charge from settings
  let deliveryFee = 0;
  if (isFreeDelivery) {
    deliveryFee = 0;
  } else {
    if (deliveryZone === 'inside_dhaka') {
      deliveryFee = settings.deliveryCharges.insideDhaka;
    } else if (deliveryZone === 'sub_dhaka') {
      deliveryFee = settings.deliveryCharges.subDhaka;
    } else {
      deliveryFee = settings.deliveryCharges.outsideDhaka;
    }
  }

  const grandTotal = subtotal + deliveryFee;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) {
      newErrors.customerName = isEnglish ? 'Please enter your full name' : 'অনুগ্রহ করে আপনার পুরো নাম লিখুন';
    }
    if (!phone.trim()) {
      newErrors.phone = isEnglish ? 'Phone number is required' : 'মোবাইল নাম্বার দেওয়া বাধ্যতামূলক';
    } else if (!/^01[3-9]\d{8}$/.test(phone.trim().replace(/-/g, ''))) {
      newErrors.phone = isEnglish ? 'Enter a valid 11-digit phone number (e.g. 017XXXXXXXX)' : 'সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)';
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      newErrors.customerEmail = isEnglish ? 'Enter a valid email address (e.g. name@example.com)' : 'সঠিক ইমেইল ঠিকানা দিন (যেমন: name@example.com)';
    }
    if (!thana.trim()) {
      newErrors.thana = isEnglish ? 'Please enter your Thana or Upazila' : 'অনুগ্রহ করে আপনার থানা বা উপজেলা লিখুন';
    }
    if (!address.trim()) {
      newErrors.address = isEnglish ? 'Please enter house/holding, road and full address' : 'বাসা/হোল্ডিং নম্বর, রোড নম্বর ও বিস্তারিত ঠিকানা লিখুন';
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      newErrors.trxId = isEnglish ? 'Please enter your Transaction ID (TrxID)' : 'অনুগ্রহ করে আপনার ট্রানজেকশন আইডি (TrxID) লিখুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newOrder = createOrder({
      customerName,
      customerEmail: customerEmail.trim() || undefined,
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      district,
      thana: thana.trim(),
      address,
      deliveryZone,
      deliveryCharge: deliveryFee,
      paymentMethod,
      paymentDetails: (paymentMethod !== 'cod') ? {
        accountNumber: senderAccount || phone,
        trxId: trxId.trim()
      } : undefined,
      items: checkoutItems,
      subtotal,
      discount: 0,
      total: grandTotal,
      orderNote: orderNote.trim() || undefined,
      status: 'pending',
    });

    // Clear cart or direct item
    if (directCheckoutItem) {
      setDirectCheckoutItem(null);
    } else {
      clearCart();
    }

    // Save customer profile for future checkout prefill & order history
    try {
      localStorage.setItem('ns_customer_profile', JSON.stringify({
        name: customerName.trim(),
        email: customerEmail.trim() || undefined,
        phone: phone.trim(),
        altPhone: altPhone.trim() || undefined,
        district,
        thana: thana.trim() || 'সদর',
        address: address.trim(),
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // ignore
    }

    setPlacedOrder(newOrder);
    openOrderSuccessModal(newOrder);
    setIsCheckoutOpen(false);
  };

  const handleClose = () => {
    setPlacedOrder(null);
    setIsCheckoutOpen(false);
  };

  const handleTrackNewOrder = () => {
    if (placedOrder) {
      setTrackingOrderId(placedOrder.id);
      setIsCheckoutOpen(false);
      setIsOrderTrackingOpen(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
      onClick={() => setIsCheckoutOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
              {placedOrder
                ? (isEnglish ? 'Order Placed Successfully!' : 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!')
                : (isEnglish ? 'Order Confirmation & Checkout' : 'অর্ডার কনফার্মেশন ও চেকআউট')}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen after Order Placed */}
        {placedOrder ? (
          <div className="p-6 sm:p-10 text-center space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {isEnglish ? 'Order ID:' : 'অর্ডার আইডি:'} #{placedOrder.id}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Hind_Siliguri']">
                {isEnglish ? `Congratulations, ${placedOrder.customerName}!` : `অভিনন্দন, ${placedOrder.customerName}!`}
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                {isEnglish
                  ? 'Your order from Naarir Shopno has been received. Our representative will call you shortly to confirm.'
                  : 'নারীর স্বপ্ন থেকে আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার প্রতিনিধি আপনার সাথে ফোনে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।'}
              </p>
            </div>

            {/* Visual Step-by-Step Progress Tracker */}
            <div className="max-w-xl mx-auto text-left">
              <OrderProgressTracker order={placedOrder} compact={true} />
            </div>

            {/* Order Summary Receipt Box */}
            <div className="max-w-md mx-auto bg-rose-50/40 rounded-2xl p-4 sm:p-5 border border-rose-100 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-rose-100 font-bold text-slate-800">
                <span>{isEnglish ? 'Order Info' : 'অর্ডার তথ্য'}</span>
                <span>{isEnglish ? 'Date:' : 'তারিখ:'} {placedOrder.createdAt}</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <p><strong>{isEnglish ? 'Name:' : 'নাম:'}</strong> {placedOrder.customerName}</p>
                <p><strong>{isEnglish ? 'Phone:' : 'মোবাইল:'}</strong> {placedOrder.phone}</p>
                {placedOrder.customerEmail && (
                  <p><strong>{isEnglish ? 'Email:' : 'ইমেইল:'}</strong> {placedOrder.customerEmail}</p>
                )}
                <p>
                  <strong>{isEnglish ? 'Delivery Address:' : 'ডেলিভারি ঠিকানা:'}</strong> {placedOrder.address}, {isEnglish ? 'Thana:' : 'থানা:'} {placedOrder.thana}, {isEnglish ? 'District:' : 'জেলা:'} {translateDistrict(placedOrder.district)}
                </p>
                <p>
                  <strong>{isEnglish ? 'Payment Method:' : 'পেমেন্ট মেথড:'}</strong> {placedOrder.paymentMethod === 'cod' ? (isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)') : placedOrder.paymentMethod.toUpperCase()}
                </p>
              </div>

              {placedOrder.customerEmail ? (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[11px]">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {isEnglish ? 'Automated confirmation email sent:' : 'অটোমেটেড কনফার্মেশন ইমেইল পাঠানো হয়েছে:'}
                    </span>
                    <p className="text-emerald-700 mt-0.5">
                      {isEnglish
                        ? `Your complete invoice and tracking link were sent to ${placedOrder.customerEmail}.`
                        : `${placedOrder.customerEmail} ঠিকানায় আপনার সম্পূর্ণ ইনভয়েস ও ট্র্যাকিং লিংক পাঠানো হয়েছে।`}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="pt-2 border-t border-rose-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-700">{isEnglish ? 'Ordered Items:' : 'অর্ডারকৃত পণ্যসমূহ:'}</p>
                {placedOrder.items.map((item, idx) => {
                  const itemImg = item.selectedImage || (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                  const colorHex = item.product.colors?.find(c => c.name === item.selectedColor)?.hex;
                  const displayColor = item.selectedColor || (item.product.colors && item.product.colors[0]?.name) || 'ডিফল্ট';
                  const itemName = translateProductName(item.product);

                  return (
                    <div key={idx} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-rose-100 shadow-2xs">
                      <img
                        src={itemImg}
                        alt={itemName}
                        className="w-12 h-14 rounded-lg object-cover border border-rose-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs">{itemName}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                            {colorHex && (
                              <span className="w-2 h-2 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: colorHex }} />
                            )}
                            <span>{isEnglish ? 'Color:' : 'রঙ:'} {translateColor(displayColor)}</span>
                          </span>
                          <span className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
                            {isEnglish ? 'Size:' : 'সাইজ:'} {translateSize(item.selectedSize)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-700">
                            × {formatNumber(item.quantity)} {isEnglish ? 'pcs' : 'টি'}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold shrink-0 font-['Outfit'] text-rose-700 text-xs sm:text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-rose-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>{isEnglish ? 'Total Payable:' : 'সর্বমোট পরিশোধযোগ্য:'}</span>
                <span className="text-rose-700 font-black font-['Outfit']">{formatPrice(placedOrder.total)}</span>
              </div>
            </div>

            {/* Post-Purchase Review Section */}
            <PostPurchaseReviewSection
              orderId={placedOrder.id}
              customerName={placedOrder.customerName}
              customerLocation={placedOrder.district || placedOrder.address}
              items={placedOrder.items}
            />

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={handleTrackNewOrder}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>{isEnglish ? 'Track Your Order' : 'আপনার অর্ডার ট্র্যাক করুন'}</span>
              </button>

              <button
                onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-rose-200 transition flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <span>{isEnglish ? 'Order History & Profile' : 'অর্ডার হিস্টোরি ও প্রোফাইল'}</span>
              </button>

              <button
                onClick={handleClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition cursor-pointer"
              >
                {isEnglish ? 'Continue Shopping' : 'আরও কেনাকাটা করুন'}
              </button>
            </div>
          </div>
        ) : (
          /* Active Checkout Form */
          <form onSubmit={handlePlaceOrder} className="max-h-[85vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-rose-100">
              
              {/* Left Column: Customer details & Payment */}
              <div className="lg:col-span-7 p-4 sm:p-6 space-y-6">
                
                {/* 1. Customer Information */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">{formatNumber(1)}</span>
                    <span>{isEnglish ? 'Customer & Delivery Information' : 'কাস্টমার ও ডেলিভারি তথ্য'}</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Your Full Name' : 'আপনার পুরো নাম'} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="input-customer-name"
                        type="text"
                        placeholder={isEnglish ? 'e.g. Nusrat Jahan' : 'যেমন: নুসরাত জাহান'}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 ${
                          errors.customerName ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                        }`}
                      />
                      {errors.customerName && <p className="text-[11px] text-red-500 mt-1">{errors.customerName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEnglish ? 'Phone Number' : 'মোবাইল নাম্বার'} <span className="text-rose-600">*</span>
                        </label>
                        <input
                          id="input-customer-phone"
                          type="tel"
                          placeholder="017XXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 ${
                            errors.phone ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                          }`}
                        />
                        {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEnglish ? 'Alternative Phone (Optional)' : 'বিকল্প মোবাইল নাম্বার (ঐচ্ছিক)'}
                        </label>
                        <input
                          id="input-customer-alt-phone"
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={altPhone}
                          onChange={(e) => setAltPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-rose-500 bg-slate-50/50 focus:outline-none focus:ring-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Email Address' : 'ইমেইল এড্রেস'} <span className="text-slate-400 font-normal">({isEnglish ? 'Receive order confirmation & invoice by email' : 'অর্ডার কনফার্মেশন ও ইনভয়েস ইমেইলে পেতে'})</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-customer-email"
                          type="email"
                          placeholder={isEnglish ? 'Enter your email (e.g. customer@example.com)' : 'আপনার ইমেইল দিন (যেমন: customer@example.com)'}
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 ${
                            errors.customerEmail ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                          }`}
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                      {errors.customerEmail && <p className="text-[11px] text-red-500 mt-1">{errors.customerEmail}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEnglish ? 'District' : 'জেলা'} <span className="text-rose-600">*</span>
                        </label>
                        <select
                          id="select-district"
                          value={district}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDistrict(val);
                            setThana('');
                            setIsCustomThana(false);
                            if (val === 'ঢাকা') {
                              setDeliveryZone('inside_dhaka');
                            } else if (val === 'গাজীপুর' || val === 'নারায়ণগঞ্জ' || val === 'মানিকগঞ্জ' || val === 'মুন্সীগঞ্জ') {
                              setDeliveryZone('sub_dhaka');
                            } else {
                              setDeliveryZone('outside_dhaka');
                            }
                          }}
                          className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-rose-500 bg-slate-50/50 focus:outline-none focus:ring-2 font-medium text-slate-800"
                        >
                          {BANGLADESH_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{translateDistrict(d)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            {isEnglish ? 'Thana / Upazila' : 'থানা / উপজেলা'} <span className="text-rose-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomThana(!isCustomThana);
                              setThana('');
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline"
                          >
                            {isCustomThana ? (isEnglish ? '📋 Select List' : '📋 তালিকা দেখুন') : (isEnglish ? '✏️ Type Manually' : '✏️ নিজে লিখুন')}
                          </button>
                        </div>

                        {!isCustomThana ? (
                          <select
                            id="select-thana"
                            value={thana}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '__custom__') {
                                setIsCustomThana(true);
                                setThana('');
                                return;
                              }
                              setThana(val);
                              if (district === 'ঢাকা' && (val.includes('সাভার') || val.includes('কেরানীগঞ্জ') || val.includes('ধামরাই') || val.includes('নবাবগঞ্জ') || val.includes('দোহার'))) {
                                setDeliveryZone('sub_dhaka');
                              } else if (district === 'ঢাকা' && deliveryZone === 'sub_dhaka') {
                                setDeliveryZone('inside_dhaka');
                              }
                            }}
                            className={`w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-medium text-slate-800 ${
                              errors.thana ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                            }`}
                          >
                            <option value="">{isEnglish ? '-- Select Thana or Upazila --' : '-- থানা বা উপজেলা সিলেক্ট করুন --'}</option>
                            {getThanasForDistrict(district).map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="__custom__">{isEnglish ? '➕ Type manually if not listed...' : '➕ তালিকায় না পেলে নিজে লিখুন...'}</option>
                          </select>
                        ) : (
                          <input
                            id="input-thana"
                            type="text"
                            placeholder={isEnglish ? 'Enter your Thana or Upazila...' : 'আপনার থানা বা উপজেলার নাম লিখুন...'}
                            value={thana}
                            onChange={(e) => {
                              const val = e.target.value;
                              setThana(val);
                              if (district === 'ঢাকা' && (val.includes('সাভার') || val.includes('কেরানীগঞ্জ') || val.includes('ধামরাই') || val.includes('নবাবগঞ্জ') || val.includes('দোহার'))) {
                                setDeliveryZone('sub_dhaka');
                              } else if (district === 'ঢাকা' && deliveryZone === 'sub_dhaka') {
                                setDeliveryZone('inside_dhaka');
                              }
                            }}
                            className={`w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-medium ${
                              errors.thana ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                            }`}
                          />
                        )}
                        {errors.thana && <p className="text-[11px] text-red-500 mt-1">{errors.thana}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEnglish ? 'Delivery Zone' : 'ডেলিভারি এলাকা'} <span className="text-rose-600">*</span>
                        </label>
                        <select
                          id="select-zone"
                          value={deliveryZone}
                          onChange={(e) => setDeliveryZone(e.target.value as DeliveryZoneId)}
                          className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-rose-500 bg-slate-50/50 focus:outline-none focus:ring-2"
                        >
                          <option value="inside_dhaka">
                            {isEnglish ? `Dhaka City (${formatPrice(settings.deliveryCharges.insideDhaka)})` : `ঢাকা সিটি (${formatPrice(settings.deliveryCharges.insideDhaka)})`}
                          </option>
                          <option value="sub_dhaka">
                            {isEnglish ? `Sub-Dhaka (Savar/Gazipur) (${formatPrice(settings.deliveryCharges.subDhaka)})` : `ঢাকা উপশহর (সাভার/গাজীপুর) (${formatPrice(settings.deliveryCharges.subDhaka)})`}
                          </option>
                          <option value="outside_dhaka">
                            {isEnglish ? `Outside Dhaka (${formatPrice(settings.deliveryCharges.outsideDhaka)})` : `ঢাকার বাইরে (${formatPrice(settings.deliveryCharges.outsideDhaka)})`}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          {isEnglish ? 'Full Delivery Address (House/Road/Area)' : 'পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা)'} <span className="text-rose-600">*</span>
                        </label>
                      </div>
                      <textarea
                        id="textarea-address"
                        rows={2}
                        placeholder={isEnglish ? 'e.g. House 12, Road 4, Sector 3, Uttara, Dhaka' : 'যেমন: বাড়ি নং ১২, রোড নং ৪, সেক্টর নং ৩, উত্তরা, ঢাকা'}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                          errors.address ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                        }`}
                      />
                      {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <div className="mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          {isEnglish ? 'Special Instructions / Note (Optional)' : 'বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)'}
                        </label>
                      </div>
                      <input
                        id="input-order-note"
                        type="text"
                        placeholder={isEnglish ? 'e.g. Please deliver in the afternoon or preferred color' : 'যেমন: বিকেলে ডেলিভারি করবেন বা নির্দিষ্ট কালার'}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-rose-500 focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">{formatNumber(2)}</span>
                    <span>{isEnglish ? 'Select Payment Method' : 'পেমেন্ট পদ্ধতি নির্বাচন করুন'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* COD */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-200 text-rose-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-base mb-1">💵</div>
                      <p className="text-xs">{isEnglish ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</p>
                      <span className="text-[10px] text-slate-500 font-normal">{isEnglish ? 'Pay on receipt' : 'হাতে পেয়ে টাকা'}</span>
                    </div>

                    {/* bKash */}
                    <div
                      onClick={() => setPaymentMethod('bkash')}
                      className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-200 text-pink-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-base mb-1">📱</div>
                      <p className="text-xs text-pink-700 font-bold">{isEnglish ? 'bKash' : 'বিকাশ (bKash)'}</p>
                      <span className="text-[10px] text-slate-500 font-normal">{isEnglish ? 'Merchant Payment' : 'মার্চেন্ট পেমেন্ট'}</span>
                    </div>

                    {/* Nagad */}
                    <div
                      onClick={() => setPaymentMethod('nagad')}
                      className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                        paymentMethod === 'nagad'
                          ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-200 text-orange-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-base mb-1">💳</div>
                      <p className="text-xs text-orange-700 font-bold">{isEnglish ? 'Nagad' : 'নগদ (Nagad)'}</p>
                      <span className="text-[10px] text-slate-500 font-normal">{isEnglish ? 'Send Money' : 'সেন্ড মানি'}</span>
                    </div>
                  </div>

                  {/* Payment Instructions if bKash / Nagad */}
                  {paymentMethod !== 'cod' && (
                    <div className="mt-3 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-200">
                        <div>
                          <span className="text-[11px] text-slate-500">
                            {paymentMethod === 'bkash' && (isEnglish ? 'bKash Number:' : 'বিকাশ নম্বর:')}
                            {paymentMethod === 'nagad' && (isEnglish ? 'Nagad Number:' : 'নগদ নম্বর:')}
                          </span>
                          <p className="font-bold text-rose-700 text-sm">
                            {paymentMethod === 'bkash' && settings.bkashMerchantNumber}
                            {paymentMethod === 'nagad' && settings.nagadMerchantNumber}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const num = paymentMethod === 'bkash' 
                              ? settings.bkashMerchantNumber 
                              : settings.nagadMerchantNumber;
                            handleCopyNumber(num);
                          }}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText ? (isEnglish ? 'Copied' : 'কপি হয়েছে') : (isEnglish ? 'Copy' : 'কপি করুন')}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {isEnglish ? 'Your Sender Number:' : 'আপনার প্রেরক নম্বর:'}
                          </label>
                          <input
                            type="tel"
                            placeholder={isEnglish ? 'Number you sent payment from' : 'যে নম্বর থেকে টাকা পাঠিয়েছেন'}
                            value={senderAccount}
                            onChange={(e) => setSenderAccount(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {isEnglish ? 'Transaction ID (TrxID)' : 'ট্রানজেকশন আইডি (TrxID)'} <span className="text-rose-600">*</span>:
                          </label>
                          <input
                            type="text"
                            placeholder={isEnglish ? 'e.g. BKH92K81M4' : 'যেমন: BKH92K81M4'}
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className={`w-full text-xs px-3 py-2 rounded-lg border bg-white ${
                              errors.trxId ? 'border-red-400' : 'border-slate-200'
                            }`}
                          />
                          {errors.trxId && <p className="text-[10px] text-red-500 mt-0.5">{errors.trxId}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary & Confirmation */}
              <div className="lg:col-span-5 p-4 sm:p-6 bg-rose-50/20 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                    <span>
                      {isEnglish
                        ? `Order Summary (${formatNumber(checkoutItems.length)} items)`
                        : `অর্ডারের সারসংক্ষেপ (${formatNumber(checkoutItems.length)} টি আইটেম)`}
                    </span>
                  </h4>

                  {/* Items List */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {checkoutItems.map((item, idx) => {
                      const itemImg = item.selectedImage || (item.product.images && item.product.images.length > 0 && item.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                      const colorHex = item.product.colors?.find(c => c.name === item.selectedColor)?.hex;
                      const itemName = translateProductName(item.product);

                      return (
                        <div key={idx} className="flex gap-2.5 p-2 bg-white rounded-xl border border-rose-100 text-xs shadow-2xs">
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-12 h-14 object-cover rounded-lg shrink-0 border border-rose-100"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{itemName}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                              <span>{isEnglish ? 'Size:' : 'সাইজ:'} <strong className="text-slate-700">{translateSize(item.selectedSize)}</strong></span>
                              {item.selectedColor && (
                                <span className="inline-flex items-center gap-1">
                                  {colorHex && (
                                    <span className="w-2 h-2 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: colorHex }} />
                                  )}
                                  <span>{isEnglish ? 'Color:' : 'রঙ:'} <strong className="text-slate-700">{translateColor(item.selectedColor)}</strong></span>
                                </span>
                              )}
                              <span>| {isEnglish ? 'Qty:' : 'পরিমাণ:'} {formatNumber(item.quantity)}</span>
                            </div>
                            <p className="font-bold text-rose-700 font-['Outfit'] mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculation Box */}
                  <div className="mt-4 p-3 bg-white rounded-2xl border border-rose-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{isEnglish ? 'Items Subtotal:' : 'পণ্যের সাবটোটাল:'}</span>
                      <span className="font-bold text-slate-900 font-['Outfit']">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>{isEnglish ? 'Delivery Charge:' : 'ডেলিভারি চার্জ:'}</span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-emerald-600">{isEnglish ? 'Free Delivery 🎉' : 'ফ্রি ডেলিভারি 🎉'}</span>
                      ) : (
                        <span className="font-bold text-slate-900 font-['Outfit']">{formatPrice(deliveryFee)}</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-rose-100 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                      <span>{isEnglish ? 'Grand Total:' : 'সর্বমোট মূল্য:'}</span>
                      <span className="text-xl font-black text-rose-700 font-['Outfit']">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Free Delivery Offer Status Banner */}
                  <div className="mt-2.5">
                    {deliveryFee === 0 ? (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {totalItemCount >= freeMinItems 
                            ? (isEnglish
                                ? `🎉 Congrats! Free delivery unlocked for ${formatNumber(totalItemCount)} items!`
                                : `🎉 অভিনন্দন! ৩টি বা ততোধিক (${formatNumber(totalItemCount)}টি) পোশাক অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!`)
                            : (isEnglish
                                ? `🎉 Congrats! Free delivery unlocked on orders over ${formatPrice(freeThreshold)} (${formatPrice(subtotal)})!`
                                : `🎉 অভিনন্দন! ৩,০০০+ টাকার (${formatPrice(subtotal)}) অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!`)}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-pink-50/70 rounded-xl border border-pink-200 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="font-medium">
                          {isEnglish
                            ? `💡 Free delivery on ${formatNumber(freeMinItems)} dresses or ${formatPrice(freeThreshold)}+ orders!`
                            : '💡 যেকোনো ৩টি পোশাকে বা ৩,০০০+ টাকার অর্ডারে ডেলিভারি ফ্রি!'}
                        </span>
                        <span className="font-bold text-[11px] text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs self-start sm:self-auto">
                          {isEnglish
                            ? `Add ${formatNumber(Math.max(1, freeMinItems - totalItemCount))} more`
                            : `আরও ${formatNumber(Math.max(1, freeMinItems - totalItemCount))}টি পোশাক যোগ করুন`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notice */}
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                    <span>
                      {isEnglish
                        ? 'No advance payment is required for Cash on Delivery. Check your parcel in front of the delivery agent before paying.'
                        : 'ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম টাকা নেওয়া হয় না। পার্সেল ডেলিভারি ম্যানের সামনে চেক করে রিসিভ করবেন।'}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    id="btn-confirm-order"
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isEnglish
                        ? `Confirm Order (${formatPrice(grandTotal)})`
                        : `অর্ডার কনফার্ম করুন (${formatPrice(grandTotal)})`}
                    </span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    {isEnglish
                      ? 'By confirming your order, you agree to our terms and conditions.'
                      : 'অর্ডার কনফার্ম করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মতি জানাচ্ছেন।'}
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
