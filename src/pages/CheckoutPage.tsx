import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { BANGLADESH_DISTRICTS, getThanasForDistrict } from '../data/bangladeshData';
import { DeliveryZoneId, PaymentMethodType, CartItem, Order } from '../types';
import { PostPurchaseReviewSection } from '../components/PostPurchaseReviewSection';
import { 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  Lock,
  Mail
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    clearCart, 
    directCheckoutItem, 
    setDirectCheckoutItem, 
    settings, 
    createOrder,
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
    translateDistrict 
  } = useLanguage();

  const checkoutItems: CartItem[] = directCheckoutItem ? [directCheckoutItem] : cart;

  // Form states initialized with saved customer profile if available
  const [customerName, setCustomerName] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).name || '';
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
  const [customerEmail, setCustomerEmail] = useState(() => {
    try {
      const p = localStorage.getItem('ns_customer_profile');
      if (p) return JSON.parse(p).email || '';
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
  const [orderNote, setOrderNote] = useState('');
  const [selectedZone, setSelectedZone] = useState<DeliveryZoneId>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const availableThanas = React.useMemo(() => {
    return getThanasForDistrict(district);
  }, [district]);

  // Financial calculations
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalQuantity = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

  const isFreeDelivery =
    (settings.deliveryCharges.freeDeliveryAbove > 0 &&
      subtotal >= settings.deliveryCharges.freeDeliveryAbove) ||
    (settings.deliveryCharges.freeDeliveryMinItems !== undefined &&
      settings.deliveryCharges.freeDeliveryMinItems > 0 &&
      totalQuantity >= settings.deliveryCharges.freeDeliveryMinItems);

  const deliveryCharge = isFreeDelivery
    ? 0
    : selectedZone === 'inside_dhaka'
    ? settings.deliveryCharges.insideDhaka
    : selectedZone === 'sub_dhaka'
    ? settings.deliveryCharges.subDhaka
    : settings.deliveryCharges.outsideDhaka;

  const grandTotal = subtotal + deliveryCharge;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAccount(label);
      setTimeout(() => setCopiedAccount(null), 2000);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errs.customerName = isEnglish ? 'Please enter your full name' : 'আপনার নাম লিখুন';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      errs.phone = isEnglish ? 'Mobile number is required' : 'মোবাইল নম্বর দেওয়া আবশ্যক';
    } else if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      errs.phone = isEnglish 
        ? 'Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)' 
        : 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    }

    if (!address.trim()) {
      errs.address = isEnglish 
        ? 'Please enter house/road number and full delivery address' 
        : 'বাসা/রোড নম্বর ও সম্পূর্ণ ডেলিভারি ঠিকানা দিন';
    }

    if (paymentMethod !== 'cod' && !transactionId.trim()) {
      errs.transactionId = isEnglish 
        ? 'Please enter payment TrxID or sender phone number' 
        : 'পেমেন্টের TrxID অথবা যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (checkoutItems.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const order = createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        phone: phone.trim(),
        altPhone: altPhone.trim() || undefined,
        district,
        thana: thana.trim() || 'সদর',
        address: address.trim(),
        deliveryZone: selectedZone,
        deliveryCharge,
        items: checkoutItems,
        subtotal,
        discount: 0,
        total: grandTotal,
        paymentMethod,
        paymentDetails: paymentMethod !== 'cod' ? { trxId: transactionId.trim() } : undefined,
        orderNote: orderNote.trim() || undefined,
        status: 'pending',
      });

      setPlacedOrder(order);
      openOrderSuccessModal(order);
      setIsSubmitting(false);

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

      if (directCheckoutItem) {
        setDirectCheckoutItem(null);
      } else {
        clearCart();
      }
    }, 600);
  };

  // If order was successfully placed, render Order Confirmation View
  if (placedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 sm:p-10 text-center space-y-6 border border-rose-100 shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              {isEnglish ? `Order ID: #${placedOrder.id}` : `অর্ডার আইডি: #${placedOrder.id}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Hind_Siliguri']">
              {isEnglish ? `Congratulations, ${placedOrder.customerName}!` : `অভিনন্দন, ${placedOrder.customerName}!`}
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              {isEnglish
                ? 'Your order has been successfully placed at Naarir Shopno. Our customer representative will call you shortly to confirm your order.'
                : 'নারীর স্বপ্ন থেকে আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার প্রতিনিধি আপনার সাথে ফোনে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।'}
            </p>
          </div>

          {/* Receipt Details Box */}
          <div className="max-w-md mx-auto bg-rose-50/40 rounded-2xl p-4 sm:p-5 border border-rose-100 text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-rose-100 font-bold text-slate-800">
              <span>{isEnglish ? 'Order Details' : 'অর্ডার তথ্য'}</span>
              <span>{isEnglish ? `Date: ${placedOrder.createdAt}` : `তারিখ: ${placedOrder.createdAt}`}</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <p><strong>{isEnglish ? 'Name:' : 'নাম:'}</strong> {placedOrder.customerName}</p>
              <p><strong>{isEnglish ? 'Mobile:' : 'মোবাইল:'}</strong> {placedOrder.phone}</p>
              {placedOrder.customerEmail && (
                <p><strong>{isEnglish ? 'Email:' : 'ইমেইল:'}</strong> {placedOrder.customerEmail}</p>
              )}
              <p>
                <strong>{isEnglish ? 'Delivery Address:' : 'ডেলিভারি ঠিকানা:'}</strong>{' '}
                {placedOrder.address},{' '}
                {placedOrder.thana ? `${isEnglish ? 'Thana: ' : 'থানা: '}${placedOrder.thana}, ` : ''}
                {isEnglish ? 'District: ' : 'জেলা: '}{translateDistrict(placedOrder.district)}
              </p>
              <p>
                <strong>{isEnglish ? 'Payment Method:' : 'পেমেন্ট মেথড:'}</strong>{' '}
                {placedOrder.paymentMethod === 'cod' 
                  ? (isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)') 
                  : placedOrder.paymentMethod.toUpperCase()}
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
                      ? `Your full invoice and tracking link have been sent to ${placedOrder.customerEmail}.` 
                      : `${placedOrder.customerEmail} ঠিকানায় আপনার সম্পূর্ণ ইনভয়েস ও ট্র্যাকিং লিংক পাঠানো হয়েছে।`}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-rose-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-700">
                {isEnglish ? 'Ordered Items:' : 'অর্ডারকৃত পণ্যসমূহ:'}
              </p>
              {placedOrder.items.map((item, idx) => {
                const itemImg =
                  item.selectedImage ||
                  (item.product.images && item.product.images[0]) ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                return (
                  <div key={idx} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-rose-100 shadow-2xs">
                    <img
                      src={itemImg}
                      alt={translateProductName(item.product)}
                      className="w-12 h-14 rounded-lg object-cover border border-rose-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate text-xs">
                        {translateProductName(item.product)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-600">
                        <span>{isEnglish ? 'Size: ' : 'সাইজ: '}{translateSize(item.selectedSize)}</span>
                        {item.selectedColor && (
                          <span>• {isEnglish ? 'Color: ' : 'রঙ: '}{translateColor(item.selectedColor)}</span>
                        )}
                        <span>• × {formatNumber(item.quantity)} {isEnglish ? 'pcs' : 'টি'}</span>
                      </div>
                    </div>
                    <span className="font-bold font-['Outfit'] text-rose-700 text-xs sm:text-sm shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-rose-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>{isEnglish ? 'Total Payable:' : 'সর্বমোট পরিশোধযোগ্য:'}</span>
              <span className="text-rose-700 font-black font-['Outfit']">
                {formatPrice(placedOrder.total)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => openOrderSuccessModal(placedOrder)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEnglish ? 'Popup Summary & Invoice' : 'পপআপ সামারি ও ইনভয়েস'}</span>
            </button>

            <button
              onClick={() => {
                setTrackingOrderId(placedOrder.id);
                navigate('/track-order');
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{isEnglish ? 'Track Your Order' : 'আপনার অর্ডার ট্র্যাক করুন'}</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-rose-200 transition flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-rose-600" />
              <span>{isEnglish ? 'Order History & Profile' : 'অর্ডার হিস্টোরি ও প্রোফাইল'}</span>
            </button>

            <Link
              to="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition inline-flex items-center gap-2"
            >
              <span>{isEnglish ? 'Continue Shopping' : 'আরও কেনাকাটা করুন'}</span>
            </Link>
          </div>
        </div>

        {/* Embedded Post-Purchase Review Section */}
        <PostPurchaseReviewSection
          orderId={placedOrder.id}
          customerName={placedOrder.customerName}
          customerLocation={placedOrder.district || placedOrder.address}
          items={placedOrder.items}
        />
      </div>
    );
  }

  // If no items in checkout
  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-['Hind_Siliguri']">
          {isEnglish ? 'Your cart is currently empty' : 'আপনার কার্ট বর্তমানে খালি'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {isEnglish
            ? 'To place an order, please add your favorite dress to your cart or click Direct Order.'
            : 'অর্ডার সম্পন্ন করতে প্রথমে আপনার পছন্দের পোশাকটি কার্টে যোগ করুন অথবা সরাসরি অর্ডার বাটনে ক্লিক করুন।'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEnglish ? 'Browse Dress Collection' : 'পোশাক কালেকশন দেখুন'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden animate-fadeIn">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 border-b border-rose-100 pb-3">
        <Link to="/" className="text-slate-600 hover:text-rose-600 font-medium">
          {isEnglish ? 'Home' : 'হোম'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-rose-700 font-bold">
          {isEnglish ? 'Checkout & Order Placement' : 'চেকআউট ও ডেলিভারি অর্ডার'}
        </span>
      </div>

      <div className="w-full min-w-0 bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-white border-b border-rose-100">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Hind_Siliguri'] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-rose-600 shrink-0" />
            <span>
              {isEnglish ? 'Fill in Details to Complete Order' : 'অর্ডার সম্পন্ন করতে তথ্য পূরণ করুন'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEnglish
              ? 'Complete the form below to confirm your order. Cash on delivery is available nationwide with inspect-on-delivery privilege.'
              : 'নিচের ফর্মটি পূরণ করে অর্ডার কনফার্ম করুন। ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা রয়েছে।'}
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-4 sm:p-8 w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full min-w-0">
            
            {/* Left Column: Customer Form & Payment */}
            <div className="lg:col-span-7 min-w-0 w-full space-y-6">
              
              {/* Step 1: Customer Details */}
              <div className="space-y-4">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    {formatNumber(1)}
                  </span>
                  <span>{isEnglish ? 'Customer & Delivery Address' : 'কাস্টমার ও ডেলিভারি ঠিকানা'}</span>
                </h2>

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
                        {isEnglish ? 'Mobile Number' : 'মোবাইল নম্বর'} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="input-phone"
                        type="tel"
                        placeholder="017XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-mono ${
                          errors.phone ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-rose-500 bg-slate-50/50'
                        }`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Alternative Phone (Optional)' : 'বিকল্প নম্বর (ঐচ্ছিক)'}
                      </label>
                      <input
                        type="tel"
                        placeholder={isEnglish ? 'Another active number' : 'অন্য কোনো সচল নম্বর'}
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Customer Email Input (for automated email confirmation) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>{isEnglish ? 'Email Address (Optional)' : 'ইমেইল ঠিকানা (ঐচ্ছিক)'}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {isEnglish ? 'Get automated order confirmation & invoice' : 'স্বয়ংক্রিয় অর্ডার কনফার্মেশন ও ইনভয়েস পাবেন'}
                      </span>
                    </label>
                    <input
                      id="input-customer-email"
                      type="email"
                      placeholder={isEnglish ? 'e.g. customer@example.com' : 'যেমন: customer@example.com'}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                    />
                  </div>

                  {/* District & Thana */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Select District' : 'জেলা নির্বাচন করুন'} <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => {
                          const newDist = e.target.value;
                          setDistrict(newDist);
                          setThana('');
                          setIsCustomThana(false);
                          if (newDist === 'ঢাকা') {
                            setSelectedZone('inside_dhaka');
                          } else if (newDist === 'গাজীপুর' || newDist === 'নারায়ণগঞ্জ') {
                            setSelectedZone('sub_dhaka');
                          } else {
                            setSelectedZone('outside_dhaka');
                          }
                        }}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 text-slate-800"
                      >
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {translateDistrict(d)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Thana / Upazila' : 'থানা / উপজেলা'}
                      </label>
                      {!isCustomThana && availableThanas.length > 0 ? (
                        <select
                          value={thana}
                          onChange={(e) => {
                            if (e.target.value === '__other__') {
                              setIsCustomThana(true);
                              setThana('');
                            } else {
                              setThana(e.target.value);
                            }
                          }}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 text-slate-800"
                        >
                          <option value="">{isEnglish ? 'Select Thana...' : 'থানা বেছে নিন...'}</option>
                          {availableThanas.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                          <option value="__other__">{isEnglish ? '+ Not in list (Type manually)' : '+ তালিকায় নেই (নিজে লিখুন)'}</option>
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={isEnglish ? 'Enter thana / area name' : 'থানা / এলাকার নাম লিখুন'}
                            value={thana}
                            onChange={(e) => setThana(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                          />
                          {availableThanas.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomThana(false);
                                setThana('');
                              }}
                              className="text-[10px] text-rose-600 underline absolute right-2.5 top-1/2 -translate-y-1/2"
                            >
                              {isEnglish ? 'View List' : 'তালিকা দেখুন'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isEnglish ? 'Full Delivery Address' : 'সম্পূর্ণ ডেলিভারি ঠিকানা'} <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="input-address"
                      rows={2}
                      placeholder={isEnglish ? 'House/holding number, road, area or nearby landmark...' : 'বাসা/হোল্ডিং নম্বর, রোড, এলাকা বা পরিচিত ল্যান্ডমার্ক লিখুন...'}
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
                      {isEnglish ? 'Delivery Note or Special Request (Optional)' : 'ডেলিভারি নোট বা বিশেষ অনুরোধ (ঐচ্ছিক)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEnglish ? 'e.g. Please deliver in the afternoon / Call before arrival' : 'যেমন: বিকেলে ডেলিভারি দিলে ভালো হয় / কল করে আসবেন'}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Area Zone Selector */}
              <div className="space-y-3 pt-3 border-t border-rose-100">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    {formatNumber(2)}
                  </span>
                  <span>{isEnglish ? 'Delivery Area & Charges' : 'ডেলিভারি এরিয়া ও চার্জ'}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedZone('inside_dhaka')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedZone === 'inside_dhaka'
                        ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-800">
                      {isEnglish ? 'Inside Dhaka' : 'ঢাকা সিটি'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isEnglish ? 'Home Delivery' : 'হোম ডেলিভারি'}
                    </span>
                    <span className="block mt-1 font-bold text-rose-700 font-['Outfit'] text-sm">
                      {isFreeDelivery 
                        ? (isEnglish ? 'Free (৳0)' : 'ফ্রি (৳০)') 
                        : formatPrice(settings.deliveryCharges.insideDhaka)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedZone('sub_dhaka')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedZone === 'sub_dhaka'
                        ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-800">
                      {isEnglish ? 'Dhaka Suburbs' : 'ঢাকা উপশহর'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isEnglish ? 'Savar, Gazipur, Keraniganj' : 'সাভার, গাজীপুর, কেরানীগঞ্জ'}
                    </span>
                    <span className="block mt-1 font-bold text-rose-700 font-['Outfit'] text-sm">
                      {isFreeDelivery 
                        ? (isEnglish ? 'Free (৳0)' : 'ফ্রি (৳০)') 
                        : formatPrice(settings.deliveryCharges.subDhaka)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedZone('outside_dhaka')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedZone === 'outside_dhaka'
                        ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-800">
                      {isEnglish ? 'Outside Dhaka' : 'ঢাকার বাইরে'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isEnglish ? 'All districts nationwide' : 'সারাদেশের যেকোনো জেলা'}
                    </span>
                    <span className="block mt-1 font-bold text-rose-700 font-['Outfit'] text-sm">
                      {isFreeDelivery 
                        ? (isEnglish ? 'Free (৳0)' : 'ফ্রি (৳০)') 
                        : formatPrice(settings.deliveryCharges.outsideDhaka)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="space-y-3 pt-3 border-t border-rose-100">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    {formatNumber(3)}
                  </span>
                  <span>{isEnglish ? 'Select Payment Method' : 'পেমেন্ট মেথড নির্বাচন করুন'}</span>
                </h2>

                <div className="space-y-2.5">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-rose-600 bg-rose-50/60 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                        {isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {isEnglish
                          ? 'Inspect the package upon delivery and pay the delivery agent.'
                          : 'পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে সম্পূর্ণ টাকা পরিশোধ করুন।'}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'bkash' ? 'border-rose-600 bg-rose-50/60 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                        {isEnglish ? 'bKash Payment' : 'বিকাশ পেমেন্ট (bKash)'}
                      </span>
                      {paymentMethod === 'bkash' && (
                        <div className="mt-2.5 p-3 bg-pink-50 rounded-xl border border-pink-200 text-xs space-y-2">
                          <p className="text-slate-700">
                            {isEnglish ? (
                              <>Send payment to bKash merchant number using <strong>Make Payment</strong> or Send Money:</>
                            ) : (
                              <>বিকাশ মার্চেন্ট নম্বরে <strong>Make Payment</strong> অথবা Send Money করুন:</>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-rose-700 text-sm bg-white px-2.5 py-1 rounded border border-rose-200">
                              {settings.bkashMerchantNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(settings.bkashMerchantNumber, 'bKash')}
                              className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedAccount === 'bKash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>
                                {copiedAccount === 'bKash' 
                                  ? (isEnglish ? 'Copied' : 'কপি হয়েছে') 
                                  : (isEnglish ? 'Copy' : 'কপি করুন')}
                              </span>
                            </button>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder={isEnglish ? 'TrxID or sender bKash number' : 'TrxID অথবা যে বিকাশ নম্বর থেকে পাঠিয়েছেন'}
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-pink-300 bg-white"
                            />
                            {errors.transactionId && <p className="text-[10px] text-red-500 mt-1">{errors.transactionId}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'nagad' ? 'border-rose-600 bg-rose-50/60 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                        {isEnglish ? 'Nagad Payment' : 'নগদ পেমেন্ট (Nagad)'}
                      </span>
                      {paymentMethod === 'nagad' && (
                        <div className="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                          <p className="text-slate-700">
                            {isEnglish ? (
                              <>Send payment to Nagad merchant number using <strong>Payment</strong> or Cash-in:</>
                            ) : (
                              <>নগদ মার্চেন্ট নম্বরে <strong>Payment</strong> অথবা ক্যাশ-ইন করুন:</>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-800 text-sm bg-white px-2.5 py-1 rounded border border-amber-200">
                              {settings.nagadMerchantNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(settings.nagadMerchantNumber, 'Nagad')}
                              className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedAccount === 'Nagad' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>
                                {copiedAccount === 'Nagad' 
                                  ? (isEnglish ? 'Copied' : 'কপি হয়েছে') 
                                  : (isEnglish ? 'Copy' : 'কপি করুন')}
                              </span>
                            </button>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder={isEnglish ? 'TrxID or sender Nagad number' : 'TrxID অথবা যে নগদ নম্বর থেকে পাঠিয়েছেন'}
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-white"
                            />
                            {errors.transactionId && <p className="text-[10px] text-red-500 mt-1">{errors.transactionId}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items Summary & Total */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-rose-50/40 rounded-3xl p-5 sm:p-6 border border-rose-100 space-y-4 sticky top-24">
                <div className="flex justify-between items-center pb-3 border-b border-rose-100">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Hind_Siliguri']">
                    {isEnglish ? 'Your Ordered Items' : 'আপনার অর্ডারের পণ্যসমূহ'}
                  </h3>
                  <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-0.5 rounded-full border border-rose-200">
                    {formatNumber(totalQuantity)} {isEnglish ? 'items' : 'টি আইটেম'}
                  </span>
                </div>

                {/* Items List */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {checkoutItems.map((item, idx) => {
                    const itemImg =
                      item.selectedImage ||
                      (item.product.images && item.product.images[0]) ||
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                    const colorHex = item.product.colors?.find((c) => c.name === item.selectedColor)?.hex;
                    const displayColor =
                      item.selectedColor || (item.product.colors && item.product.colors[0]?.name) || 'ডিফল্ট';

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-2xl border border-rose-100/80 shadow-2xs"
                      >
                        <img
                          src={itemImg}
                          alt={translateProductName(item.product)}
                          className="w-14 h-16 rounded-xl object-cover border border-rose-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {translateProductName(item.product)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10px]">
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200">
                              {colorHex && (
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20"
                                  style={{ backgroundColor: colorHex }}
                                />
                              )}
                              <span>{translateColor(displayColor)}</span>
                            </span>
                            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                              {translateSize(item.selectedSize)}
                            </span>
                            <span className="text-slate-600 font-semibold">
                              × {formatNumber(item.quantity)} {isEnglish ? 'pcs' : 'টি'}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold font-['Outfit'] text-rose-700 text-xs sm:text-sm shrink-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Free Delivery Bar */}
                {settings.deliveryCharges.freeDeliveryAbove > 0 && (
                  <div className="p-2.5 bg-white rounded-xl border border-rose-100 text-xs space-y-1">
                    <div className="flex justify-between font-medium text-[11px]">
                      <span>{isEnglish ? 'Free Delivery Offer' : 'ফ্রি ডেলিভারি অফার'}</span>
                      {isFreeDelivery ? (
                        <span className="text-emerald-700 font-bold">
                          {isEnglish ? 'Congrats! Delivery is Free 🎉' : 'অভিনন্দন! ডেলিভারি চার্জ ফ্রি 🎉'}
                        </span>
                      ) : (
                        <span className="text-rose-600">
                          {isEnglish 
                            ? `Shop ${formatPrice(settings.deliveryCharges.freeDeliveryAbove - subtotal)} more for Free Delivery` 
                            : `আরও ${formatPrice(settings.deliveryCharges.freeDeliveryAbove - subtotal)} কেনাকাটায় ফ্রি ডেলিভারি`}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (subtotal / settings.deliveryCharges.freeDeliveryAbove) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Calculation breakdown */}
                <div className="space-y-2 pt-2 border-t border-rose-200/80 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{isEnglish ? 'Dresses Subtotal:' : 'পোশাকের মূল্য (সাবটোটাল):'}</span>
                    <span className="font-['Outfit'] font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{isEnglish ? 'Delivery Charge:' : 'ডেলিভারি চার্জ:'}</span>
                    <span className="font-['Outfit'] font-semibold">
                      {isFreeDelivery ? (
                        <span className="text-emerald-700 font-bold">{isEnglish ? 'Free (৳0)' : 'ফ্রি (৳০)'}</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-rose-200 pt-2 text-base font-extrabold text-slate-900">
                    <span className="text-rose-700 font-['Hind_Siliguri']">
                      {isEnglish ? 'Total Payable:' : 'সর্বমোট প্রদেয়:'}
                    </span>
                    <span className="text-rose-700 font-black font-['Outfit'] text-xl">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <button
                  id="btn-page-confirm-order"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95 text-white font-bold text-sm sm:text-base py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (isEnglish ? 'Processing order...' : 'অর্ডার প্রসেসিং হচ্ছে...')
                      : (isEnglish ? `Confirm Order (${formatPrice(grandTotal)})` : `অর্ডার কনফার্ম করুন (${formatPrice(grandTotal)})`)}
                  </span>
                </button>

                <div className="text-center space-y-1 text-[11px] text-slate-500">
                  <p className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEnglish ? '100% Safe Checkout & Cash on Delivery' : '১০০% নিরাপদ চেকআউট ও ক্যাশ অন ডেলিভারি'}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
