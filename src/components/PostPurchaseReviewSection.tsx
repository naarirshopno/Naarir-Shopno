import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { Star, CheckCircle2, MessageSquarePlus, Sparkles, Send } from 'lucide-react';

interface PurchaseItemReview {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  selectedImage?: string;
}

interface PostPurchaseReviewSectionProps {
  orderId: string;
  customerName: string;
  customerLocation?: string;
  items: PurchaseItemReview[];
}

const QUICK_TAGS = [
  'অসাধারণ ফেব্রিক ও কাপড়',
  'রং ছবির মতোই নিখুঁত',
  'সেলাই ও কাজের ফিনিশিং চমৎকার',
  'সাইজ একদম পারফেক্ট ফিটিং',
  'খুব দ্রুত ডেলিভারি পেয়েছি',
  'পরতে আরামদায়ক ও মার্জিত',
];

const RATING_LABELS: Record<number, string> = {
  5: 'অসাধারণ! (৫/৫)',
  4: 'খুব ভালো (৪/৫)',
  3: 'ভালো (৩/৫)',
  2: 'মোটামুটি (২/৫)',
  1: 'পছন্দ হয়নি (১/৫)',
};

export const PostPurchaseReviewSection: React.FC<PostPurchaseReviewSectionProps> = ({
  orderId,
  customerName,
  customerLocation = 'বাংলাদেশ',
  items,
}) => {
  const { addProductReview } = useShop();

  // State per item: rating, comment, submitted
  const [reviewsState, setReviewsState] = useState<
    Record<
      string,
      {
        rating: number;
        hoverRating: number;
        comment: string;
        isSubmitted: boolean;
        error?: string;
      }
    >
  >(() => {
    const initial: Record<string, any> = {};
    items.forEach((it) => {
      initial[it.product.id] = {
        rating: 5,
        hoverRating: 0,
        comment: '',
        isSubmitted: false,
      };
    });
    return initial;
  });

  const handleRatingChange = (productId: string, rating: number) => {
    setReviewsState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating,
        error: undefined,
      },
    }));
  };

  const handleHoverRating = (productId: string, rating: number) => {
    setReviewsState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        hoverRating: rating,
      },
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviewsState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment,
        error: undefined,
      },
    }));
  };

  const handleQuickTagClick = (productId: string, tag: string) => {
    setReviewsState((prev) => {
      const current = prev[productId]?.comment || '';
      const updated = current.includes(tag) ? current : current ? `${current}। ${tag}` : tag;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          comment: updated,
          error: undefined,
        },
      };
    });
  };

  const handleSubmitReview = (productId: string) => {
    const itemState = reviewsState[productId];
    if (!itemState) return;

    if (!itemState.comment.trim()) {
      setReviewsState((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          error: 'অনুগ্রহ করে অন্তত কয়েকটি শব্দে আপনার মতামত বা অভিজ্ঞতা লিখুন।',
        },
      }));
      return;
    }

    // Submit review to shop context (and Firestore / localStorage)
    addProductReview({
      productId,
      customerName: customerName || 'সম্মানিত ক্রেতা',
      rating: itemState.rating || 5,
      comment: itemState.comment.trim(),
      location: customerLocation || 'বাংলাদেশ',
      verifiedPurchase: true,
      helpfulCount: 0,
    });

    // Mark as submitted
    setReviewsState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        isSubmitted: true,
        error: undefined,
      },
    }));
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-br from-rose-50/70 via-white to-pink-50/60 rounded-3xl p-4 sm:p-6 border border-rose-100 shadow-sm space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquarePlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Hind_Siliguri']">
              পোশাক কেমন লেগেছে? রেটিং ও রিভিউ দিন
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              আপনার বাস্তব অভিজ্ঞতা ও মতামত অন্য ক্রেতাদের সঠিক পোশাকটি বেছে নিতে সাহায্য করবে
            </p>
          </div>
        </div>

        <span className="self-start sm:self-center bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>ভেরিফাইড ক্রেতা রিভিউ</span>
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const state = reviewsState[item.product.id] || {
            rating: 5,
            hoverRating: 0,
            comment: '',
            isSubmitted: false,
          };

          const itemImg =
            item.selectedImage ||
            (item.product.images && item.product.images[0]) ||
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';

          const activeStars = state.hoverRating || state.rating;

          if (state.isSubmitted) {
            return (
              <div
                key={idx}
                className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fadeIn"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.product.bengaliName}
                  </p>
                  <p className="text-emerald-700 text-xs font-semibold mt-0.5 flex items-center gap-1.5">
                    <span>আপনার {state.rating}-স্টার রিভিউ সফলভাবে প্রকাশিত হয়েছে! ধন্যবাদ।</span>
                    <span className="flex text-amber-400">
                      {[...Array(state.rating)].map((_, sIdx) => (
                        <Star key={sIdx} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </span>
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="p-4 bg-white rounded-2xl border border-rose-100/90 shadow-xs space-y-3 transition-all hover:border-rose-300"
            >
              {/* Product Info Header */}
              <div className="flex items-center gap-3">
                <img
                  src={itemImg}
                  alt={item.product.bengaliName}
                  className="w-12 h-14 rounded-xl object-cover border border-rose-100 shrink-0 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.product.bengaliName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    {item.selectedSize && <span>সাইজ: {item.selectedSize}</span>}
                    {item.selectedColor && (
                      <>
                        <span>•</span>
                        <span>রং: {item.selectedColor}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">স্টার রেটিং দিন:</span>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onMouseLeave={() => handleHoverRating(item.product.id, 0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.product.id, star)}
                        onMouseEnter={() => handleHoverRating(item.product.id, star)}
                        className="p-1 hover:scale-120 transition-transform focus:outline-none"
                        title={`${star} স্টার`}
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            star <= activeStars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-100 w-fit">
                  {RATING_LABELS[activeStars] || `${activeStars} স্টার`}
                </span>
              </div>

              {/* Quick Tags */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>দ্রুত মন্তব্য বাছাই করুন:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(item.product.id, tag)}
                      className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        state.comment.includes(tag)
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Review Box */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  আপনার রিভিউ ও অভিজ্ঞতা (Text Review):
                </label>
                <textarea
                  rows={2}
                  value={state.comment}
                  onChange={(e) => handleCommentChange(item.product.id, e.target.value)}
                  placeholder="পোশাকের কাপড়, সেলাই, রং, সাইজের মাপ ও কুরিয়ার ডেলিভারি সম্পর্কে আপনার মতামত লিখুন..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                {state.error && <p className="text-[11px] text-red-500 mt-1 font-semibold">{state.error}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleSubmitReview(item.product.id)}
                  className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>রিভিউ জমা দিন</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
