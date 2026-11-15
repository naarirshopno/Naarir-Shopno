import React, { useState } from 'react';
import { Order } from '../types';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  MapPin, 
  Truck, 
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = useShop();
  const {
    isEnglish,
    formatPrice,
    formatNumber,
    translateProductName,
    translateColor,
    translateSize,
    translateDistrict,
    translateStatus,
    translateOfficeAddress,
  } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccessToast, setPrintSuccessToast] = useState(false);

  // Bulletproof Multi-Strategy Print Handler
  const handlePrint = () => {
    setIsPrinting(true);
    setPrintSuccessToast(false);

    const printElement = document.getElementById('printable-invoice-content');
    if (!printElement) {
      try {
        window.print();
      } catch (e) {
        console.error('Print failed:', e);
      }
      setIsPrinting(false);
      return;
    }

    try {
      // 1. Create a clean, isolated hidden iframe to print ONLY the invoice
      const iframe = document.createElement('iframe');
      iframe.id = 'invoice-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-9999';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        throw new Error('Unable to access iframe document');
      }

      // 2. Write pristine HTML & CSS with Bengali font directly to iframe
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="${isEnglish ? 'en' : 'bn'}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice_${order.id}_NaarirShopno</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif;
              color: #1e293b;
              background: #ffffff;
              font-size: 12px;
              line-height: 1.5;
              padding: 10px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .font-outfit { font-family: 'Outfit', sans-serif; }
            .font-mono { font-family: monospace; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            th {
              background-color: #fdf2f4 !important;
              color: #be123c !important;
              font-weight: 700;
              text-align: left;
              padding: 8px 10px;
              border-bottom: 2px solid #fecdd3;
              font-size: 11px;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: middle;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .no-print { display: none !important; }
            img {
              max-width: 100%;
              object-fit: cover;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${printElement.innerHTML}
          </div>
        </body>
        </html>
      `);
      doc.close();

      // Give images & fonts 300ms to settle in iframe before invoking print
      setTimeout(() => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setPrintSuccessToast(true);
            setTimeout(() => setPrintSuccessToast(false), 3000);
          } else {
            window.print();
          }
        } catch (printErr) {
          console.warn('Iframe print blocked, falling back to window.print():', printErr);
          window.print();
        } finally {
          setIsPrinting(false);
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3500);
        }
      }, 350);

    } catch (err) {
      console.warn('Printing error, standard fallback:', err);
      try {
        window.print();
      } catch (wErr) {
        console.error('Final print error:', wErr);
      }
      setIsPrinting(false);
    }
  };

  const handleCopySummary = () => {
    const itemsList = order.items
      .map(
        (it, i) =>
          `${formatNumber(i + 1)}. ${translateProductName(it.product)} (${translateSize(it.selectedSize || 'Standard')}, ${translateColor(it.selectedColor || (isEnglish ? 'Default' : 'ডিফল্ট'))}) × ${formatNumber(it.quantity)} = ${formatPrice(it.product.price * it.quantity)}`
      )
      .join('\n');

    const summary = isEnglish
      ? `🧾 Naarir Shopno - Cash Memo / Invoice\n` +
        `Order No: #${order.id}\n` +
        `Date: ${order.createdAt}\n` +
        `Customer Name: ${order.customerName}\n` +
        `Phone: ${order.phone}\n` +
        `Address: ${order.address}, ${order.thana ? `Thana: ${order.thana}, ` : ''}${translateDistrict(order.district)}\n\n` +
        `Ordered Items:\n${itemsList}\n\n` +
        `Subtotal: ${formatPrice(order.subtotal)}\n` +
        `Delivery Charge: ${formatPrice(order.deliveryCharge)}\n` +
        `Total: ${formatPrice(order.total)}\n` +
        `Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod.toUpperCase()}\n` +
        `Hotline: ${settings.hotline1 || '09617-541717'}`
      : `🧾 নারীর স্বপ্ন - ক্যাশ মেমো / ইনভয়েস\n` +
        `অর্ডার নং: #${order.id}\n` +
        `তারিখ: ${order.createdAt}\n` +
        `গ্রাহকের নাম: ${order.customerName}\n` +
        `মোবাইল: ${order.phone}\n` +
        `ঠিকানা: ${order.address}, ${order.thana ? `থানা: ${order.thana}, ` : ''}${order.district}\n\n` +
        `অর্ডারকৃত পণ্যসমূহ:\n${itemsList}\n\n` +
        `সাবটোটাল: ${formatPrice(order.subtotal)}\n` +
        `ডেলিভারি চার্জ: ${formatPrice(order.deliveryCharge)}\n` +
        `সর্বমোট: ${formatPrice(order.total)} টাকা\n` +
        `পেমেন্ট: ${order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod.toUpperCase()}\n` +
        `হটলাইন: ${settings.hotline1 || '09617-541717'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div 
      id="printable-invoice-modal-overlay"
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      {/* Fallback CSS for native browser print */}
      <style>{`
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          header, footer, nav, aside, .no-print, button {
            display: none !important;
          }
          #printable-invoice-modal-overlay {
            position: static !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: 100% !important;
            inset: auto !important;
            display: block !important;
          }
          #printable-invoice-modal-card {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: white !important;
          }
          #printable-invoice-content {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 10mm !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
          }
        }
      `}</style>

      <div 
        id="printable-invoice-modal-card"
        className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-rose-100 cursor-default relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Feedback */}
        {printSuccessToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isEnglish ? 'Print window opened!' : 'প্রিন্ট উইন্ডো খোলা হয়েছে!'}</span>
          </div>
        )}

        {/* Modal Header & Action Buttons */}
        <div className="flex justify-between items-center pb-3 border-b border-rose-100 no-print flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Hind_Siliguri']">
                {isEnglish ? 'Order Invoice / Cash Memo' : 'অর্ডার ইনভয়েস / ক্যাশ মেমো'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {isEnglish ? `ID: #${order.id}` : `আইডি: #${order.id}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              id="btn-copy-invoice-text"
              type="button"
              onClick={handleCopySummary}
              title={isEnglish ? 'Copy invoice details' : 'ইনভয়েস বিবরণ কপি করুন'}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{isEnglish ? 'Copied!' : 'কপি হয়েছে!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEnglish ? 'Copy' : 'কপি করুন'}</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              id="btn-print-invoice"
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              title={isEnglish ? 'Print invoice directly' : 'ইনভয়েস সরাসরি প্রিন্ট করুন'}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 disabled:opacity-75"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEnglish ? 'Printing...' : 'প্রিন্ট হচ্ছে...'}</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isEnglish ? 'Print' : 'প্রিন্ট করুন'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title={isEnglish ? 'Close' : 'বন্ধ করুন'}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div 
          id="printable-invoice-content" 
          className="p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-5 text-xs text-slate-800"
        >
          {/* Top Brand Banner */}
          <div className="flex justify-between items-start border-b border-rose-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl sm:text-2xl font-black text-rose-700 font-['Hind_Siliguri']">
                  {isEnglish ? 'Naarir Shopno' : (settings.storeName || 'নারীর স্বপ্ন')}
                </span>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                  {isEnglish ? 'OFFICIAL MEMO' : 'অফিসিয়াল মেমো'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium italic">
                {isEnglish 
                  ? 'Dress Your Dreams - Your Trusted Address for Heritage & Elegance'
                  : (settings.slogan || 'Dress Your Dreams - ঐতিহ্য ও আভিজাত্যের বিশ্বস্ত ঠিকানা')}
              </p>
              <div className="text-[11px] text-slate-600 mt-1.5 space-y-0.5">
                <p>{isEnglish ? 'Hotline:' : 'হটলাইন:'} <strong className="font-mono">{settings.hotline1 || '09617-541717'}</strong> {settings.hotline2 ? `, ${settings.hotline2}` : ''}</p>
                <p>{isEnglish ? 'Address:' : 'ঠিকানা:'} {translateOfficeAddress(settings.officeAddress || 'ঢাকা, বাংলাদেশ')}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-sm sm:text-base text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 inline-block mb-1">
                #{order.id}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">{isEnglish ? 'Date:' : 'তারিখ:'} {order.createdAt}</p>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {isEnglish ? 'Status:' : 'স্ট্যাটাস:'} {translateStatus(order.status)}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div>
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1 mb-1">
                <span>{isEnglish ? 'Customer Information:' : 'গ্রাহকের তথ্য:'}</span>
              </h5>
              <p className="text-slate-800 font-bold">{order.customerName}</p>
              <p className="text-slate-600 font-mono mt-0.5">📞 {order.phone}</p>
              <p className="text-slate-600 mt-0.5">
                {isEnglish ? 'Payment Method:' : 'পেমেন্ট মেথড:'} <strong className="text-slate-800">{order.paymentMethod === 'cod' ? (isEnglish ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)') : order.paymentMethod.toUpperCase()}</strong>
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{isEnglish ? 'Delivery Address:' : 'ডেলিভারি ঠিকানা:'}</span>
              </h5>
              <p className="text-slate-700 leading-relaxed">
                {order.address}
                {order.thana ? `, ${isEnglish ? 'Thana:' : 'থানা:'} ${order.thana}` : ''}
                {order.district ? `, ${isEnglish ? 'District:' : 'জেলা:'} ${translateDistrict(order.district)}` : ''}
              </p>
              {order.courier && (
                <p className="text-slate-600 text-[11px] mt-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-rose-600" />
                  <span>{isEnglish ? 'Courier:' : 'কুরিয়ার:'} {order.courier.name} ({order.courier.trackingId})</span>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold">
                  <th className="p-2.5 w-12 text-center">{isEnglish ? 'No.' : 'নং'}</th>
                  <th className="p-2.5">{isEnglish ? 'Item Name & Details' : 'পোশাকের নাম ও বিবরণ'}</th>
                  <th className="p-2.5">{isEnglish ? 'Color & Size' : 'রং ও সাইজ'}</th>
                  <th className="p-2.5 text-center">{isEnglish ? 'Qty' : 'পরিমাণ'}</th>
                  <th className="p-2.5 text-right">{isEnglish ? 'Unit Price' : 'একক মূল্য'}</th>
                  <th className="p-2.5 text-right">{isEnglish ? 'Total' : 'মোট'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it, idx) => {
                  const itemImg =
                    it.selectedImage ||
                    (it.product.images && it.product.images[0]) ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                  const colorHex = it.product.colors?.find((c) => c.name === it.selectedColor)?.hex;
                  const displayColor =
                    it.selectedColor || (it.product.colors && it.product.colors[0]?.name) || 'ডিফল্ট';
                  const itemName = translateProductName(it.product);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-center text-slate-500 font-mono">{formatNumber(idx + 1)}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-10 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{itemName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{isEnglish ? 'Code:' : 'কোড:'} {it.product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-slate-800 text-[11px]">
                            {colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: colorHex }}
                              />
                            )}
                            <span>{translateColor(displayColor)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{isEnglish ? 'Size:' : 'সাইজ:'} {translateSize(it.selectedSize)}</p>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold font-mono">{formatNumber(it.quantity)}</td>
                      <td className="p-2.5 text-right font-['Outfit'] text-slate-600">
                        {formatPrice(it.product.price)}
                      </td>
                      <td className="p-2.5 text-right font-bold font-['Outfit'] text-slate-900">
                        {formatPrice(it.product.price * it.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="text-[11px] text-slate-500 space-y-1 max-w-xs">
              <p>• {isEnglish ? 'Please inspect the parcel in front of the delivery agent before receiving.' : 'পার্সেল পাওয়ার পর ডেলিভারি ম্যানের সামনে চেক করে রিসিভ করুন।'}</p>
              <p>• {isEnglish ? 'For any assistance, contact our hotline:' : 'যেকোনো প্রয়োজনে আমাদের হটলাইনে যোগাযোগ করুন:'} {settings.hotline1 || '09617-541717'}</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <div className="flex justify-between text-slate-600">
                <span>{isEnglish ? 'Subtotal:' : 'সাবটোটাল:'}</span>
                <span className="font-['Outfit'] font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{isEnglish ? 'Delivery Charge:' : 'ডেলিভারি চার্জ:'}</span>
                <span className="font-['Outfit'] font-semibold">
                  {order.deliveryCharge === 0 ? (isEnglish ? 'FREE' : 'ফ্রি') : formatPrice(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                <span className="text-rose-700">{isEnglish ? 'Total Payable:' : 'সর্বমোট পরিশোধযোগ্য:'}</span>
                <span className="text-rose-700 font-black font-['Outfit'] text-base">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note & Signature Line */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
            <div>
              <p>{isEnglish ? 'Computer-generated invoice. No signature required.' : 'কম্পিউটার জেনারেটেড ইনভয়েস। কোনো স্বাক্ষরের প্রয়োজন নেই।'}</p>
              <p>{isEnglish ? 'Thank you for choosing Naarir Shopno!' : 'নারীর স্বপ্ন সাথে থাকার জন্য ধন্যবাদ!'}</p>
            </div>
            <div className="text-right">
              <p className="border-t border-slate-300 pt-1 px-4 text-slate-600 font-bold">
                {isEnglish ? 'Authorized Signature' : 'অনুমোদিত স্বাক্ষর'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
