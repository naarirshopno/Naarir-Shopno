import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Truck, 
  Printer, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Headphones, 
  PackageCheck, 
  Mail, 
  ExternalLink, 
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { 
    orderSuccessModalData, 
    setOrderSuccessModalData, 
    closeOrderSuccessModal,
    setTrackingOrderId,
    setIsOrderTrackingOpen,
    settings
  } = useShop();

  const { isEnglish, formatPrice, formatNumber, translateProductName, translateColor, translateSize, translateDistrict, translateSupportHours } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOrderSuccessModal();
      }
    };
    if (orderSuccessModalData) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [orderSuccessModalData, closeOrderSuccessModal]);

  if (!orderSuccessModalData) return null;

  const order = orderSuccessModalData;

  const handleCopyOrderId = () => {
    try {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  const handleTrackOrder = () => {
    setTrackingOrderId(order.id);
    closeOrderSuccessModal();
    navigate('/track');
  };

  const handleContinueShopping = () => {
    closeOrderSuccessModal();
    navigate('/');
  };

  // Direct Browser Print Receipt for Customer
  const handlePrintReceipt = () => {
    setIsPrinting(true);
    try {
      const hotline = settings.hotline1 || '09617-541717';
      const storeName = settings.storeName || (isEnglish ? 'Naarir Shopno' : 'নারীর স্বপ্ন (Naarir Shopno)');
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${isEnglish ? 'en' : 'bn'}">
            <head>
              <meta charset="utf-8" />
              <title>${isEnglish ? 'Invoice' : 'ইনভয়েস'} #${order.id} - ${storeName}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; background: #fff; margin: 0; }
                .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
                .header { text-align: center; border-bottom: 2px dashed #f43f5e; padding-bottom: 16px; margin-bottom: 16px; }
                .header h1 { margin: 0; color: #e11d48; font-size: 24px; }
                .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
                .meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 16px; }
                .customer { background: #fff1f2; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.6; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
                th { text-align: left; padding: 8px 4px; border-bottom: 2px solid #cbd5e1; color: #475569; }
                td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; }
                .totals { text-align: right; font-size: 13px; line-height: 1.8; border-top: 2px solid #e2e8f0; padding-top: 10px; }
                .total-amount { font-size: 18px; font-weight: bold; color: #e11d48; }
                .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; }
                @media print {
                  body { padding: 0; }
                  .receipt { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>${storeName}</h1>
                  <p>Women's Fashion — Dress Your Dreams | ${isEnglish ? 'Helpline:' : 'হটলাইন:'} ${hotline}</p>
                </div>
                <div class="meta">
                  <div><strong>${isEnglish ? 'Invoice #' : 'ইনভয়েস নং:'}</strong> ${order.id}</div>
                  <div><strong>${isEnglish ? 'Date:' : 'তারিখ:'}</strong> ${order.createdAt}</div>
                </div>
                <div class="customer">
                  <strong>${isEnglish ? 'Customer Details:' : 'গ্রাহকের তথ্য:'}</strong><br/>
                  ${order.customerName} | ${isEnglish ? 'Phone:' : 'মোবাইল:'} ${order.phone}<br/>
                  ${isEnglish ? 'Address:' : 'ঠিকানা:'} ${order.address}, ${order.thana ? order.thana + ', ' : ''}${translateDistrict(order.district)}<br/>
                  ${isEnglish ? 'Payment Method:' : 'পেমেন্ট মেথড:'} ${order.paymentMethod === 'cod' ? (isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)') : order.paymentMethod.toUpperCase()}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>${isEnglish ? 'Item' : 'পণ্য'}</th>
                      <th style="text-align: center;">${isEnglish ? 'Qty' : 'পরিমাণ'}</th>
                      <th style="text-align: right;">${isEnglish ? 'Price' : 'মূল্য'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(order.items || []).map(i => `
                      <tr>
                        <td>
                          <strong>${translateProductName(i.product) || (isEnglish ? 'Dress' : 'পোশাক')}</strong><br/>
                          <small style="color: #64748b;">${isEnglish ? 'Size:' : 'সাইজ:'} ${translateSize(i.selectedSize || (isEnglish ? 'Free' : 'ফ্রি'))} | ${isEnglish ? 'Color:' : 'রং:'} ${translateColor(i.selectedColor || (isEnglish ? 'Default' : 'ডিফল্ট'))}</small>
                        </td>
                        <td style="text-align: center;">×${formatNumber(i.quantity)}</td>
                        <td style="text-align: right;">${formatPrice((i.product?.price || 0) * i.quantity)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="totals">
                  <div>${isEnglish ? 'Subtotal:' : 'সাবটোটাল:'} ${formatPrice(order.subtotal || 0)}</div>
                  <div>${isEnglish ? 'Delivery Charge:' : 'ডেলিভারি চার্জ:'} ${order.deliveryCharge === 0 ? (isEnglish ? 'FREE' : 'ফ্রি') : formatPrice(order.deliveryCharge || 0)}</div>
                  ${order.discount ? `<div>${isEnglish ? 'Discount:' : 'ডিসকাউন্ট:'} -${formatPrice(order.discount)}</div>` : ''}
                  <div class="total-amount">${isEnglish ? 'Total:' : 'সর্বমোট:'} ${formatPrice(order.total || 0)}</div>
                </div>
                <div class="footer">
                  <p>${isEnglish ? `Thank you for shopping with ${storeName}!` : `${storeName}-এর সাথে কেনাকাটার জন্য ধন্যবাদ!`}</p>
                  <p>${isEnglish ? 'Helpline:' : 'হটলাইন:'} ${hotline} (${translateSupportHours(settings.supportHours)})</p>
                </div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 1000);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (e) {
      console.error('Print window error:', e);
    } finally {
      setIsPrinting(false);
    }
  };

  // WhatsApp quick assist url
  const rawHotline = settings.hotline1 || '09617-541717';
  const whatsappNumber = (settings.whatsappNumber || rawHotline).replace(/[^0-9]/g, '');
  const cleanWhatsappNumber = whatsappNumber.startsWith('880') 
    ? whatsappNumber 
    : whatsappNumber.startsWith('0') 
      ? `88${whatsappNumber}` 
      : `880${whatsappNumber}`;
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    isEnglish
      ? `Assalamu Alaikum, I just placed an order (Order ID: #${order.id}).`
      : `আসসালামু আলাইকুম, আমি মাত্র একটি অর্ডার করেছি (অর্ডার আইডি: #${order.id})।`
  )}`;

  return (
    <div 
      className="fixed inset-0 z-[95] overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={closeOrderSuccessModal}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-rose-150 overflow-hidden relative my-auto animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeOrderSuccessModal}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-xs border border-slate-200/80 cursor-pointer"
          title={isEnglish ? 'Close' : 'বন্ধ করুন'}
          aria-label="Close confirmation modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header Section */}
        <div className="relative pt-7 pb-5 px-5 sm:px-8 text-center bg-gradient-to-b from-rose-50/90 via-pink-50/40 to-white border-b border-rose-100/80">
          {/* Confetti & Particle Accents */}
          <div className="absolute top-3 left-6 text-rose-300 opacity-60 pointer-events-none select-none">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute top-4 right-14 text-pink-400 opacity-50 pointer-events-none select-none">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute top-1/2 left-3 w-2 h-2 rounded-full bg-emerald-400/50 pointer-events-none"></div>
          <div className="absolute top-1/3 right-4 w-2 h-2 rounded-full bg-rose-400/50 pointer-events-none"></div>

          {/* Animated Success Icon */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 mx-auto mb-3.5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60"></div>
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 relative">
              <CheckCircle2 className="w-10 h-10 stroke-[2.4]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEnglish ? 'Order Confirmed Successfully!' : 'অর্ডারটি সফলভাবে গৃহীত হয়েছে!'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isEnglish ? `Thank you, ${order.customerName}!` : `ধন্যবাদ, ${order.customerName}!`}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
            {isEnglish 
              ? 'Your order is recorded in our system. Our representative will contact you shortly to confirm delivery.'
              : 'নারীর স্বপ্ন-এ আপনার অর্ডারটি নথিভুক্ত করা হয়েছে। খুব শীঘ্রই প্রতিনিধি ফোন দিয়ে ডেলিভারি কনফার্ম করবেন।'}
          </p>

          {/* Order ID & Copy Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 shadow-2xs">
            <span className="text-xs text-slate-500">{isEnglish ? 'Order ID:' : 'অর্ডার আইডি:'}</span>
            <span className="font-mono font-black text-rose-600 text-sm sm:text-base">#{order.id}</span>
            <button
              onClick={handleCopyOrderId}
              className="ml-1 p-1 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
              title={isEnglish ? 'Copy Order ID' : 'অর্ডার আইডি কপি করুন'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{isEnglish ? 'Copied!' : 'কপি হয়েছে!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEnglish ? 'Copy' : 'কপি'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[58vh] overflow-y-auto">
          {/* Trust Guarantees: 3 Key Pillars */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                {isEnglish ? 'Phone Call' : 'ফোন কল যাচাই'}
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                {isEnglish ? 'Call to confirm' : 'প্রতিনিধি ফোন করবেন'}
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                {isEnglish ? 'Quality Checked' : '১০০% কোয়ালিটি'}
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                {isEnglish ? 'Inspected QC' : 'নিখুঁত ফ্যাব্রিক'}
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <PackageCheck className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                {isEnglish ? 'Cash on Delivery' : 'দেখে পেমেন্ট'}
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                {isEnglish ? 'Pay upon receipt' : 'হাতে পেয়ে টাকা দিন'}
              </p>
            </div>
          </div>

          {/* Delivery & Destination Summary Card */}
          <div className="bg-rose-50/50 rounded-2xl p-3.5 sm:p-4 border border-rose-100/90 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100 font-bold text-slate-800">
              <div className="flex items-center gap-1.5 text-rose-700">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{isEnglish ? 'Delivery Destination' : 'ডেলিভারি ঠিকানা ও তথ্য'}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                {order.createdAt}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-xs leading-relaxed">
              <div>
                <p className="text-slate-500 text-[11px]">{isEnglish ? 'Recipient Name & Phone:' : 'প্রাপকের নাম ও মোবাইল:'}</p>
                <p className="font-bold text-slate-900">{order.customerName}</p>
                <p className="font-mono text-slate-800">{order.phone}{order.altPhone ? `, ${order.altPhone}` : ''}</p>
              </div>

              <div>
                <p className="text-slate-500 text-[11px]">{isEnglish ? 'Address:' : 'ঠিকানা:'}</p>
                <p className="font-semibold text-slate-900">{order.address}</p>
                <p className="text-slate-600">{order.thana ? `${order.thana}, ` : ''}{translateDistrict(order.district)}</p>
              </div>
            </div>

            {/* Email dispatch notice if provided */}
            {order.customerEmail && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[11px] mt-1 font-medium">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {isEnglish ? 'Confirmation Email Sent:' : 'কনফার্মেশন ইমেইল পাঠানো হয়েছে:'}
                  </span>
                  <p className="text-emerald-700 mt-0.5">
                    {isEnglish 
                      ? `Complete invoice & live tracking sent to ${order.customerEmail}`
                      : `${order.customerEmail} ঠিকানায় আপনার অর্ডার ইনভয়েস ও ট্র্যাকিং লিংক পাঠানো হয়েছে।`}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery timeframe notice */}
            <div className="flex items-center gap-2 pt-2 border-t border-rose-100 text-slate-600 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                {isEnglish 
                  ? 'Estimated delivery: Inside Dhaka 24-48 hours, Outside Dhaka 2-3 days'
                  : 'আনুমানিক ডেলিভারি সময়: ঢাকার ভেতর ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ কার্যদিবস'}
              </span>
            </div>
          </div>

          {/* Ordered Items Preview */}
          <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold text-slate-800">
              <span>{isEnglish ? 'Ordered Items' : 'অর্ডারকৃত পোশাকসমূহ'} ({formatNumber((order.items || []).length)})</span>
              <span className="text-rose-600 font-black font-['Outfit'] text-sm">
                {formatPrice(order.total)}
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {(order.items || []).map((item, idx) => {
                const img = item.selectedImage || (item.product?.images && item.product.images[0]) || '';
                const name = translateProductName(item.product) || (isEnglish ? 'Dress' : 'পোশাক');
                return (
                  <div key={idx} className="flex items-center justify-between gap-2.5 p-2 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {img ? (
                        <img 
                          src={img} 
                          alt={name} 
                          className="w-11 h-13 rounded-lg object-cover border border-slate-100 shrink-0" 
                        />
                      ) : (
                        <div className="w-11 h-13 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 text-rose-400">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs">{name}</p>
                        <p className="text-[11px] text-slate-500">
                          {isEnglish ? 'Size:' : 'সাইজ:'} <span className="font-semibold text-rose-700">{translateSize(item.selectedSize || (isEnglish ? 'Free' : 'ফ্রি'))}</span>
                          {item.selectedColor ? ` | ${isEnglish ? 'Color:' : 'রং:'} ${translateColor(item.selectedColor)}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 text-xs">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                      <p className="text-[11px] text-slate-500">×{formatNumber(item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial breakdown table */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>{isEnglish ? 'Subtotal:' : 'পণ্যের মূল্য:'}</span>
                <span className="font-medium text-slate-800">{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>{isEnglish ? 'Delivery Charge:' : 'ডেলিভারি চার্জ:'}</span>
                <span className="font-medium text-slate-800">
                  {order.deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">{isEnglish ? 'FREE' : 'ফ্রি'}</span>
                  ) : (
                    formatPrice(order.deliveryCharge)
                  )}
                </span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-emerald-600">
                  <span>{isEnglish ? 'Discount:' : 'ডিসকাউন্ট:'}</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 font-black text-slate-900 text-sm">
                <span>{isEnglish ? 'Total Payable:' : 'সর্বমোট পরিশোধযোগ্য:'}</span>
                <span className="text-rose-600 font-['Outfit']">{formatPrice(order.total || 0)}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-0.5">
                {isEnglish ? 'Payment Method:' : 'পেমেন্ট মেথড:'} <strong className="text-slate-800">{order.paymentMethod === 'cod' ? (isEnglish ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে পরিশোধ)') : order.paymentMethod.toUpperCase()}</strong>
              </div>
            </div>
          </div>

          {/* Quick Help / Modify Order Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold">{isEnglish ? 'Need to change size or address?' : 'সাইজ বা ঠিকানায় কোনো ভুল হয়েছে?'}</p>
                <p className="text-slate-400 text-[11px]">{isEnglish ? 'Contact us right away' : 'আমাদের সাথে সরাসরি যোগাযোগ করুন'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${rawHotline.replace(/[^0-9]/g, '')}`}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
                title={rawHotline}
              >
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>{rawHotline}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrintReceipt}
              disabled={isPrinting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              title={isEnglish ? 'Print Invoice' : 'ইনভয়েস প্রিন্ট করুন'}
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{isEnglish ? 'Print Invoice' : 'ইনভয়েস প্রিন্ট'}</span>
            </button>

            <button
              onClick={handleTrackOrder}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              title={isEnglish ? 'Track this Order' : 'অর্ডারটি ট্র্যাক করুন'}
            >
              <Truck className="w-3.5 h-3.5 text-rose-400" />
              <span>{isEnglish ? 'Live Track' : 'লাইভ ট্র্যাক'}</span>
            </button>
          </div>

          <button
            onClick={handleContinueShopping}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 active:scale-98 cursor-pointer"
          >
            <span>{isEnglish ? 'Continue Shopping' : 'আরও কেনাকাটা করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
