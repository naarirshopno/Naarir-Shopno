import React, { useState } from 'react';
import { Order } from '../types';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export interface CancelOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
}

const CANCEL_REASONS = [
  {
    id: 'placed_by_mistake',
    labelBn: 'ভুলবশত অর্ডার করেছিলাম',
    labelEn: 'Placed by mistake',
  },
  {
    id: 'change_variant',
    labelBn: 'পোশাকের সাইজ বা রঙ পরিবর্তন করতে চাই',
    labelEn: 'Want to change size or color',
  },
  {
    id: 'change_address',
    labelBn: 'ডেলিভারি ঠিকানা বা মোবাইল নম্বর ভুল হয়েছে',
    labelEn: 'Wrong delivery address or phone number',
  },
  {
    id: 'delivery_delay',
    labelBn: 'দেরিতে ডেলিভারি হবে মনে হচ্ছে',
    labelEn: 'Delivery takes too long',
  },
  {
    id: 'other',
    labelBn: 'অন্যান্য কারণ (নিচে বিস্তারিত লিখুন)',
    labelEn: 'Other reason (explain below)',
  },
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { cancelOrder, settings } = useShop();
  const { isEnglish, formatPrice, formatNumber, translateProductName } = useLanguage();

  const [selectedReasonId, setSelectedReasonId] = useState(CANCEL_REASONS[0].id);
  const [customReasonNote, setCustomReasonNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isEligibleToCancel = order.status === 'pending' || order.status === 'confirmed';

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const chosenReasonObj = CANCEL_REASONS.find(r => r.id === selectedReasonId);
    const reasonText = isEnglish 
      ? (chosenReasonObj?.labelEn || 'Customer requested cancellation')
      : (chosenReasonObj?.labelBn || 'গ্রাহকের অনুরোধে বাতিল');
    
    const finalReason = customReasonNote.trim()
      ? `${reasonText} (${customReasonNote.trim()})`
      : reasonText;

    try {
      const res = await cancelOrder(order.id, finalReason);
      if (res.success) {
        setSuccessMessage(isEnglish ? 'Your order has been cancelled successfully.' : res.message);
        setTimeout(() => {
          setIsSubmitting(false);
          setSuccessMessage(null);
          onClose();
          if (onSuccess) onSuccess(order.id);
        }, 1200);
      } else {
        setErrorMessage(res.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMessage(isEnglish ? 'Failed to cancel order. Please try again.' : 'অর্ডার বাতিল করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-red-50 via-rose-50 to-white border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg font-['Hind_Siliguri']">
                {isEnglish ? 'Cancel Order' : 'অর্ডার বাতিল করুন'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                #{order.id} • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {successMessage ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 font-['Hind_Siliguri']">
                {isEnglish ? 'Order Cancelled' : 'অর্ডার বাতিল সম্পন্ন'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
                {successMessage}
              </p>
            </div>
          ) : !isEligibleToCancel ? (
            /* Non-eligible order notice (e.g. already shipped or delivered) */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-900">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {isEnglish 
                      ? 'Online Cancellation Not Available' 
                      : 'অনলাইনে অর্ডার বাতিল করা সম্ভব নয়'}
                  </span>
                </div>
                <p>
                  {order.status === 'shipped' && (
                    isEnglish
                      ? 'This parcel is already in transit with the courier partner. To request a return or hold, please call our hotline directly.'
                      : 'পার্সেলটি ইতোমধ্যে কুরিয়ার পার্টনারের কাছে হস্তান্তর করা হয়েছে। পার্সেল হোল্ড বা রিটার্নের জন্য সরাসরি আমাদের হেল্পলাইনে যোগাযোগ করুন।'
                  )}
                  {order.status === 'delivered' && (
                    isEnglish
                      ? 'This order has already been delivered. For returns or exchanges, please contact our support team.'
                      : 'এই অর্ডারটি ইতোমধ্যে ডেলিভারি সম্পন্ন হয়েছে। কোনো এক্সচেঞ্জ বা রিটার্ন পলিসির সুবিধার জন্য আমাদের হটলাইনে কল করুন।'
                  )}
                  {order.status === 'cancelled' && (
                    isEnglish
                      ? 'This order has already been cancelled.'
                      : 'এই অর্ডারটি ইতোমধ্যে বাতিল করা হয়েছে।'
                  )}
                </p>
              </div>

              {/* Call support shortcut */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    {isEnglish ? 'Direct Helpline Support' : 'সরাসরি হেল্পলাইন সহায়তা'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {settings.supportHours || (isEnglish ? 'Daily 9:00 AM - 11:00 PM' : 'প্রতিদিন সকাল ৯টা - রাত ১১টা')}
                  </p>
                </div>
                <a
                  href={`tel:${(settings.hotline1 || '09617-541717').replace(/[^0-9]/g, '')}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{settings.hotline1 || '09617-541717'}</span>
                </a>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  {isEnglish ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>
          ) : (
            /* Eligible order: Cancellation Form */
            <form onSubmit={handleConfirmCancel} className="space-y-4">
              {/* Order quick summary bar */}
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {isEnglish ? 'Items in order:' : 'অর্ডারের পণ্যসমূহ:'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatNumber(order.items?.length || 0)} {isEnglish ? 'items' : 'টি পোশাক'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">
                    {isEnglish ? 'Total Bill:' : 'মোট মূল্য:'}
                  </span>
                  <span className="font-bold text-rose-700 font-['Outfit']">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {/* Reasons selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 font-['Hind_Siliguri']">
                  {isEnglish ? 'Why do you want to cancel?' : 'অর্ডারটি বাতিলের কারণ নির্বাচন করুন:'} <span className="text-rose-600">*</span>
                </label>

                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => {
                    const isSelected = selectedReasonId === reason.id;
                    return (
                      <label
                        key={reason.id}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'border-red-400 bg-red-50/40 text-red-900 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason.id}
                          checked={isSelected}
                          onChange={() => setSelectedReasonId(reason.id)}
                          className="mt-0.5 text-red-600 focus:ring-red-500"
                        />
                        <span>{isEnglish ? reason.labelEn : reason.labelBn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optional custom note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isEnglish ? 'Additional Note (Optional)' : 'অন্য কোনো মন্তব্য বা অনুরোধ (ঐচ্ছিক)'}
                </label>
                <textarea
                  rows={2}
                  value={customReasonNote}
                  onChange={(e) => setCustomReasonNote(e.target.value)}
                  placeholder={isEnglish ? 'e.g. Please cancel and I will order a different size...' : 'যেমন: আমি সাইজ পরিবর্তন করে আবার নতুন অর্ডার করব...'}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  {isEnglish
                    ? 'Once cancelled, the delivery process will be stopped immediately. You can re-order this item anytime from your profile.'
                    : 'অর্ডার বাতিল নিশ্চিত করলে পার্সেল প্রেরণের কাজ অবিলম্বে স্থগিত হবে। পরবর্তীতে যেকোনো সময় প্রোফাইল থেকে ১-ক্লিকে পুনরায় অর্ডার করতে পারবেন।'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-rose-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {isEnglish ? 'Keep Order' : 'ফিরে যান (অর্ডার বহাল রাখুন)'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (isEnglish ? 'Cancelling...' : 'বাতিল করা হচ্ছে...') 
                      : (isEnglish ? 'Confirm Cancel Order' : 'অর্ডার বাতিল নিশ্চিত করুন')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
