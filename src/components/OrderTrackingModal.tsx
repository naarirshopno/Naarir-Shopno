import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Order, OrderStatus } from '../types';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  AlertCircle,
  ExternalLink,
  Calendar,
  Copy,
  Check
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const { 
    isOrderTrackingOpen, 
    setIsOrderTrackingOpen, 
    orders, 
    trackingOrderId, 
    setTrackingOrderId,
    settings 
  } = useShop();

  const [searchInput, setSearchInput] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (trackingOrderId) {
      setSearchInput(trackingOrderId);
      const found = orders.find(
        (o) => o.id.toLowerCase() === trackingOrderId.toLowerCase()
      );
      setMatchedOrder(found || null);
      setHasSearched(true);
    }
  }, [trackingOrderId, orders]);

  if (!isOrderTrackingOpen) return null;

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

  const steps = [
    { title: 'অর্ডার গৃহীত', desc: 'অর্ডার প্লেস করা হয়েছে' },
    { title: 'কনফার্মেশন', desc: 'ফোনে নিশ্চিত করা হয়েছে' },
    { title: 'প্যাকেজিং সম্পন্ন', desc: 'পার্সেল প্রস্তুত' },
    { title: 'কুরিয়ার ট্রানজিট', desc: 'কুরিয়ারে হস্তান্তর হয়েছে' },
    { title: 'ডেলিভারি সম্পন্ন', desc: 'কাস্টমার রিসিভ করেছেন' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-rose-100 relative my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
              ডেলিভারি ও পার্সেল ট্র্যাকিং সিস্টেম
            </h3>
          </div>
          <button
            onClick={() => {
              setTrackingOrderId('');
              setIsOrderTrackingOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              আপনার অর্ডার আইডি (যেমন: NS-1045) অথবা মোবাইল নম্বর লিখুন:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="input-track-search"
                  type="text"
                  placeholder="NS-1045 অথবা 017XXXXXXXX"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
                <Search className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition shrink-0"
              >
                ট্র্যাক করুন
              </button>
            </div>

            {/* Quick Demo Pill Chips */}
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
              <span>ডেমো আইডি দিয়ে পরীক্ষা করুন:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('NS-1045');
                  const found = orders.find(o => o.id === 'NS-1045');
                  setMatchedOrder(found || null);
                  setHasSearched(true);
                }}
                className="bg-white hover:bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200 font-mono"
              >
                NS-1045 (কুরিয়ারে আছে)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('NS-1046');
                  const found = orders.find(o => o.id === 'NS-1046');
                  setMatchedOrder(found || null);
                  setHasSearched(true);
                }}
                className="bg-white hover:bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200 font-mono"
              >
                NS-1046 (প্রসেসিং)
              </button>
            </div>
          </form>

          {/* Results Area */}
          {hasSearched && (
            matchedOrder ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Status Hero Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-white border border-rose-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200">
                        {matchedOrder.id}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        matchedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        matchedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        matchedOrder.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        matchedOrder.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {matchedOrder.status === 'delivered' && 'ডেলিভারি সম্পন্ন'}
                        {matchedOrder.status === 'shipped' && 'কুরিয়ারে হস্তান্তর হয়েছে'}
                        {matchedOrder.status === 'processing' && 'প্যাকেজিং চলছে'}
                        {matchedOrder.status === 'confirmed' && 'অর্ডার কনফার্মড'}
                        {matchedOrder.status === 'pending' && 'অর্ডার রিভিউ চলছে'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      অর্ডার তারিখ: <strong>{matchedOrder.createdAt}</strong>
                    </p>
                  </div>

                  {matchedOrder.courier && (() => {
                    const cName = matchedOrder.courier.name || '';
                    const trkId = matchedOrder.courier.trackingId || '';
                    const lower = cName.toLowerCase();
                    let liveTrackUrl: string | null = null;
                    if (lower.includes('steadfast')) {
                      liveTrackUrl = `https://steadfast.com.bd/t/${encodeURIComponent(trkId)}`;
                    } else if (lower.includes('pathao')) {
                      liveTrackUrl = `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(trkId)}`;
                    } else if (lower.includes('redx')) {
                      liveTrackUrl = `https://redx.com.bd/track?trackingId=${encodeURIComponent(trkId)}`;
                    } else if (lower.includes('paperfly')) {
                      liveTrackUrl = `https://paperfly.com.bd/tracking?tracking_id=${encodeURIComponent(trkId)}`;
                    } else if (lower.includes('ecourier')) {
                      liveTrackUrl = `https://ecourier.com.bd/tracking?tracking_id=${encodeURIComponent(trkId)}`;
                    }

                    const handleCopyTrk = () => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(trkId);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }
                    };

                    return (
                      <div className="text-left sm:text-right bg-white p-3 rounded-xl border border-rose-100 text-xs space-y-1">
                        <p className="text-slate-500 font-medium">কুরিয়ার পার্টনার:</p>
                        <p className="font-bold text-slate-900 flex items-center sm:justify-end gap-1">
                          <Truck className="w-3.5 h-3.5 text-rose-600" />
                          <span>{cName}</span>
                        </p>
                        <div className="flex items-center sm:justify-end gap-1.5 pt-0.5">
                          <span className="text-[11px] font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {trkId}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyTrk}
                            title="ট্র্যাকিং কোড কপি করুন"
                            className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {liveTrackUrl && (
                          <div className="pt-1">
                            <a
                              href={liveTrackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <span>কুরিয়ার ওয়েবসাইটে ট্র্যাক করুন</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {matchedOrder.courier.estimatedDelivery && (
                          <p className="text-[11px] text-emerald-700 font-medium">
                            সম্ভাব্য ডেলিভারি: {matchedOrder.courier.estimatedDelivery}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Visual Stepper */}
                <div className="p-4 sm:p-6 bg-white rounded-2xl border border-rose-100 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">
                    ডেলিভারি অগ্রগতি টাইমলাইন
                  </h4>

                  <div className="relative flex flex-col md:flex-row justify-between gap-4">
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 flex-1 relative">
                          {/* Dot / Icon */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all z-10 ${
                            isCompleted
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-4 ring-rose-100'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>

                          {/* Text info */}
                          <div>
                            <p className={`text-xs font-bold ${isCurrent ? 'text-rose-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {st.title}
                            </p>
                            <p className="text-[10px] text-slate-400">{st.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer & Items Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Delivery Address */}
                  <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 space-y-1.5">
                    <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>ডেলিভারি গন্তব্য</span>
                    </h5>
                    <p className="text-slate-700"><strong>প্রাপক:</strong> {matchedOrder.customerName}</p>
                    <p className="text-slate-700"><strong>ফোন:</strong> {matchedOrder.phone}</p>
                    <p className="text-slate-600"><strong>ঠিকানা:</strong> {matchedOrder.address}, {matchedOrder.thana ? `থানা: ${matchedOrder.thana}, ` : ''}{matchedOrder.district}</p>
                    <p className="text-slate-600">
                      <strong>পেমেন্ট:</strong> {matchedOrder.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : matchedOrder.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  {/* Items Ordered */}
                  <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 space-y-2">
                    <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Package className="w-3.5 h-3.5 text-rose-600" />
                      <span>অর্ডারকৃত পণ্যসমূহ</span>
                    </h5>
                    <div className="space-y-2">
                      {matchedOrder.items.map((it, i) => {
                        const itemImg = it.selectedImage || (it.product.images && it.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                        const colorHex = it.product.colors?.find(c => c.name === it.selectedColor)?.hex;
                        const displayColor = it.selectedColor || (it.product.colors && it.product.colors[0]?.name) || 'ডিফল্ট';

                        return (
                          <div key={i} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-rose-100 shadow-2xs">
                            <img
                              src={itemImg}
                              alt={it.product.bengaliName}
                              className="w-11 h-13 rounded-lg object-cover border border-rose-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 line-clamp-1">{it.product.bengaliName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200">
                                  {colorHex && (
                                    <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
                                  )}
                                  <span>রঙ: {displayColor}</span>
                                </span>
                                <span className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                  সাইজ: {it.selectedSize}
                                </span>
                                <span className="text-[10px] text-slate-600">
                                  × {it.quantity} টি
                                </span>
                              </div>
                            </div>
                            <span className="font-bold font-['Outfit'] text-rose-700 text-xs sm:text-sm shrink-0">
                              ৳{(it.product.price * it.quantity).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-1 flex justify-between font-bold text-rose-700">
                      <span>মোট মূল্য:</span>
                      <span className="font-['Outfit'] text-sm">৳{matchedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Need Help Phone Banner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-rose-600" />
                    <span>পার্সেল সংক্রান্ত যেকোনো জরুরি তথ্যের জন্য যোগাযোগ করুন:</span>
                  </div>
                  <div className="flex gap-3">
                    <a href={`tel:${settings.hotline1.replace(/[^0-9]/g, '')}`} className="font-bold text-rose-600 hover:underline">
                      {settings.hotline1}
                    </a>
                    <a href={`tel:${settings.hotline2.replace(/[^0-9]/g, '')}`} className="font-bold text-rose-600 hover:underline">
                      {settings.hotline2}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Not Found Message */
              <div className="text-center py-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">কোনো অর্ডার খুঁজে পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  অনুগ্রহ করে আপনার সঠিক অর্ডার আইডি (যেমন: NS-1045) অথবা যে মোবাইল নম্বর দিয়ে অর্ডার করেছেন তা দিয়ে আবার চেষ্টা করুন।
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
