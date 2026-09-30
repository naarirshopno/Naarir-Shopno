import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
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
  Printer
} from 'lucide-react';

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
    setTrackingOrderId
  } = useShop();

  // Active items being checked out
  const checkoutItems: CartItem[] = directCheckoutItem ? [directCheckoutItem] : cart;

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [thana, setThana] = useState('');
  const [isCustomThana, setIsCustomThana] = useState(false);
  const [address, setAddress] = useState('');
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

  // Calculate dynamic delivery charge from settings
  let deliveryFee = 0;
  if (subtotal >= settings.deliveryCharges.freeDeliveryAbove) {
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
      newErrors.customerName = 'অনুগ্রহ করে আপনার পুরো নাম লিখুন';
    }
    if (!phone.trim()) {
      newErrors.phone = 'মোবাইল নাম্বার দেওয়া বাধ্যতামূলক';
    } else if (!/^01[3-9]\d{8}$/.test(phone.trim().replace(/-/g, ''))) {
      newErrors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)';
    }
    if (!thana.trim()) {
      newErrors.thana = 'অনুগ্রহ করে আপনার থানা বা উপজেলা লিখুন';
    }
    if (!address.trim()) {
      newErrors.address = 'বাসা/হোল্ডিং নম্বর, রোড নম্বর ও বিস্তারিত ঠিকানা লিখুন';
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      newErrors.trxId = 'অনুগ্রহ করে আপনার ট্রানজেকশন আইডি (TrxID) লিখুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newOrder = createOrder({
      customerName,
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

    setPlacedOrder(newOrder);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
              {placedOrder ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'অর্ডার কনফার্মেশন ও চেকআউট'}
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
                অর্ডার আইডি: #{placedOrder.id}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Hind_Siliguri']">
                অভিনন্দন, {placedOrder.customerName}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                নারীর স্বপ্ন থেকে আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার প্রতিনিধি আপনার সাথে ফোনে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।
              </p>
            </div>

            {/* Order Summary Receipt Box */}
            <div className="max-w-md mx-auto bg-rose-50/40 rounded-2xl p-4 sm:p-5 border border-rose-100 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-rose-100 font-bold text-slate-800">
                <span>অর্ডার তথ্য</span>
                <span>তারিখ: {placedOrder.createdAt}</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <p><strong>নাম:</strong> {placedOrder.customerName}</p>
                <p><strong>মোবাইল:</strong> {placedOrder.phone}</p>
                <p><strong>ডেলিভারি ঠিকানা:</strong> {placedOrder.address}, থানা: {placedOrder.thana}, জেলা: {placedOrder.district}</p>
                <p><strong>পেমেন্ট মেথড:</strong> {placedOrder.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : placedOrder.paymentMethod.toUpperCase()}</p>
              </div>

              <div className="pt-2 border-t border-rose-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-700">অর্ডারকৃত পণ্যসমূহ:</p>
                {placedOrder.items.map((item, idx) => {
                  const itemImg = item.selectedImage || (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                  const colorHex = item.product.colors?.find(c => c.name === item.selectedColor)?.hex;
                  const displayColor = item.selectedColor || (item.product.colors && item.product.colors[0]?.name) || 'ডিফল্ট';

                  return (
                    <div key={idx} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-rose-100 shadow-2xs">
                      <img
                        src={itemImg}
                        alt={item.product.bengaliName}
                        className="w-12 h-14 rounded-lg object-cover border border-rose-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs">{item.product.bengaliName}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                            {colorHex && (
                              <span className="w-2 h-2 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: colorHex }} />
                            )}
                            <span>রঙ: {displayColor}</span>
                          </span>
                          <span className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
                            সাইজ: {item.selectedSize}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-700">
                            × {item.quantity} টি
                          </span>
                        </div>
                      </div>
                      <span className="font-bold shrink-0 font-['Outfit'] text-rose-700 text-xs sm:text-sm">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-rose-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-rose-700 font-black font-['Outfit']">৳{placedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={handleTrackNewOrder}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>আপনার অর্ডার ট্র্যাক করুন</span>
              </button>

              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>ইনভয়েস প্রিন্ট করুন</span>
              </button>

              <button
                onClick={handleClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition"
              >
                আরও কেনাকাটা করুন
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
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>কাস্টমার ও ডেলিভারি তথ্য</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        আপনার পুরো নাম <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="input-customer-name"
                        type="text"
                        placeholder="যেমন: নুসরাত জাহান"
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
                          মোবাইল নাম্বার <span className="text-rose-600">*</span>
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
                          বিকল্প মোবাইল নাম্বার (ঐচ্ছিক)
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          জেলা <span className="text-rose-600">*</span>
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
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            থানা / উপজেলা <span className="text-rose-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomThana(!isCustomThana);
                              setThana('');
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline"
                          >
                            {isCustomThana ? '📋 তালিকা দেখুন' : '✏️ নিজে লিখুন'}
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
                            <option value="">-- থানা বা উপজেলা সিলেক্ট করুন --</option>
                            {getThanasForDistrict(district).map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="__custom__">➕ তালিকায় না পেলে নিজে লিখুন...</option>
                          </select>
                        ) : (
                          <input
                            id="input-thana"
                            type="text"
                            placeholder="আপনার থানা বা উপজেলার নাম লিখুন..."
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
                          ডেলিভারি এলাকা <span className="text-rose-600">*</span>
                        </label>
                        <select
                          id="select-zone"
                          value={deliveryZone}
                          onChange={(e) => setDeliveryZone(e.target.value as DeliveryZoneId)}
                          className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-rose-500 bg-slate-50/50 focus:outline-none focus:ring-2"
                        >
                          <option value="inside_dhaka">ঢাকা সিটি (৳{settings.deliveryCharges.insideDhaka})</option>
                          <option value="sub_dhaka">ঢাকা উপশহর (সাভার/গাজীপুর) (৳{settings.deliveryCharges.subDhaka})</option>
                          <option value="outside_dhaka">ঢাকার বাইরে (৳{settings.deliveryCharges.outsideDhaka})</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা) <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        id="textarea-address"
                        rows={2}
                        placeholder="যেমন: বাড়ি নং ১২, রোড নং ৪, সেক্টর নং ৩, উত্তরা, ঢাকা"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                          errors.address ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                        }`}
                      />
                      {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)
                      </label>
                      <input
                        id="input-order-note"
                        type="text"
                        placeholder="যেমন: বিকেলে ডেলিভারি করবেন বা নির্দিষ্ট কালার"
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
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    <span>পেমেন্ট পদ্ধতি নির্বাচন করুন</span>
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
                      <p className="text-xs">ক্যাশ অন ডেলিভারি</p>
                      <span className="text-[10px] text-slate-500 font-normal">হাতে পেয়ে টাকা</span>
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
                      <p className="text-xs text-pink-700 font-bold">বিকাশ (bKash)</p>
                      <span className="text-[10px] text-slate-500 font-normal">মার্চেন্ট পেমেন্ট</span>
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
                      <p className="text-xs text-orange-700 font-bold">নগদ (Nagad)</p>
                      <span className="text-[10px] text-slate-500 font-normal">সেন্ড মানি</span>
                    </div>
                  </div>

                  {/* Payment Instructions if bKash / Nagad */}
                  {paymentMethod !== 'cod' && (
                    <div className="mt-3 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-200">
                        <div>
                          <span className="text-[11px] text-slate-500">
                            {paymentMethod === 'bkash' && 'বিকাশ নম্বর:'}
                            {paymentMethod === 'nagad' && 'নগদ নম্বর:'}
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
                          <span>{copiedText ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            আপনার প্রেরক নম্বর:
                          </label>
                          <input
                            type="tel"
                            placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                            value={senderAccount}
                            onChange={(e) => setSenderAccount(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            ট্রানজেকশন আইডি (TrxID) <span className="text-rose-600">*</span>:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: BKH92K81M4"
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
                    <span>অর্ডারের সারসংক্ষেপ ({checkoutItems.length} টি আইটেম)</span>
                  </h4>

                  {/* Items List */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {checkoutItems.map((item, idx) => {
                      const itemImg = item.selectedImage || (item.product.images && item.product.images.length > 0 && item.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                      const colorHex = item.product.colors?.find(c => c.name === item.selectedColor)?.hex;

                      return (
                        <div key={idx} className="flex gap-2.5 p-2 bg-white rounded-xl border border-rose-100 text-xs shadow-2xs">
                          <img
                            src={itemImg}
                            alt={item.product.bengaliName}
                            className="w-12 h-14 object-cover rounded-lg shrink-0 border border-rose-100"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{item.product.bengaliName}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                              <span>সাইজ: <strong className="text-slate-700">{item.selectedSize}</strong></span>
                              {item.selectedColor && (
                                <span className="inline-flex items-center gap-1">
                                  {colorHex && (
                                    <span className="w-2 h-2 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: colorHex }} />
                                  )}
                                  <span>রঙ: <strong className="text-slate-700">{item.selectedColor}</strong></span>
                                </span>
                              )}
                              <span>| পরিমাণ: {item.quantity}</span>
                            </div>
                            <p className="font-bold text-rose-700 font-['Outfit'] mt-0.5">৳{(item.product.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculation Box */}
                  <div className="mt-4 p-3 bg-white rounded-2xl border border-rose-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>পণ্যের সাবটোটাল:</span>
                      <span className="font-bold text-slate-900 font-['Outfit']">৳{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>ডেলিভারি চার্জ:</span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-emerald-600">ফ্রি ডেলিভারি 🎉</span>
                      ) : (
                        <span className="font-bold text-slate-900 font-['Outfit']">৳{deliveryFee}</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-rose-100 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                      <span>সর্বমোট মূল্য:</span>
                      <span className="text-xl font-black text-rose-700 font-['Outfit']">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                    <span>
                      ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম টাকা নেওয়া হয় না। পার্সেল ডেলিভারি ম্যানের সামনে চেক করে রিসিভ করবেন।
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
                    <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString()})</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    অর্ডার কনফার্ম করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মতি জানাচ্ছেন।
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
