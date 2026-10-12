import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, ProductReview } from '../types';
import { 
  Star, 
  MessageSquarePlus, 
  ThumbsUp, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Filter, 
  Check, 
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';

interface CustomerReviewsProps {
  productId: string;
  product: Product;
}

const QUICK_TAGS = [
  'অসাধারণ ফেব্রিক ও কাপড়',
  'রং ছবির মতোই নিখুঁত',
  'সেলাই ও কাজের ফিনিশিং চমৎকার',
  'খুব দ্রুত ডেলিভারি পেয়েছি',
  'সাইজ একদম পারফেক্ট ফিটিং',
  'পরতে খুবই আরামদায়ক'
];

const RATING_LABELS: Record<number, string> = {
  5: 'অসাধারণ! (৫/৫)',
  4: 'খুব ভালো (৪/৫)',
  3: 'ভালো (৩/৫)',
  2: 'মোটামুটি সন্তোষজনক (২/৫)',
  1: 'পছন্দ হয়নি (১/৫)',
};

const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-purple-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
];

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ productId, product }) => {
  const { getProductReviews, addProductReview, voteReviewHelpful } = useShop();

  const reviews = getProductReviews(productId);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [submittedToast, setSubmittedToast] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter & Sort states
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Calculation of Rating Breakdown
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : product.rating || 5.0;

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Filtered and Sorted Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (selectedStarFilter !== 'all') {
      result = result.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    if (sortBy === 'newest') {
      // Keep natural order or ID based
      result.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    return result;
  }, [reviews, selectedStarFilter, sortBy]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (!comment.trim()) {
      setFormError('অনুগ্রহ করে আপনার অভিজ্ঞতা বা মতামত লিখুন।');
      return;
    }

    addProductReview({
      productId,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      location: location.trim() || 'বাংলাদেশ',
      verifiedPurchase: true,
      helpfulCount: 0,
    });

    // Reset Form
    setCustomerName('');
    setLocation('');
    setComment('');
    setRating(5);
    setFormError('');
    setIsFormOpen(false);
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 4000);
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (votedReviews[reviewId]) return;
    voteReviewHelpful(productId, reviewId);
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
  };

  const addQuickTagToComment = (tag: string) => {
    if (comment.includes(tag)) return;
    setComment((prev) => (prev ? `${prev}। ${tag}` : tag));
  };

  return (
    <div id="customer-reviews-section" className="w-full space-y-6">
      {/* Toast Notification */}
      {submittedToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs sm:text-sm font-semibold">
              ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
            </p>
          </div>
          <button 
            onClick={() => setSubmittedToast(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Review Scorecard Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-rose-100 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Big Score & Stars */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 min-w-[110px] sm:min-w-[130px]">
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-700 font-['Outfit'] block leading-none mb-1">
                {avgRating}
              </span>
              <div className="flex items-center justify-center gap-0.5 mb-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      star <= Math.round(avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {totalReviews} টি রিভিউ
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-['Hind_Siliguri']">
                  ক্রেতাদের রিভিউ ও রেটিং
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ১০০% ভেরিফাইড ক্রেতা
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                এই প্রোডাক্টটি যারা কিনে ব্যবহার করেছেন তাদের বাস্তব অভিজ্ঞতা ও মতামত
              </p>
            </div>
          </div>

          {/* Center: Rating Breakdown Progress Bars */}
          <div className="flex-1 max-w-md space-y-1.5 py-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div
                  key={stars}
                  onClick={() => setSelectedStarFilter(selectedStarFilter === stars ? 'all' : stars)}
                  className="group flex items-center gap-2 text-xs cursor-pointer select-none"
                  title={`${stars} স্টার রিভিউ ফিল্টার করুন`}
                >
                  <span className="w-10 font-semibold text-slate-600 group-hover:text-rose-600 transition flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] text-slate-400 group-hover:text-slate-700">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Write Review Trigger Button */}
          <div className="shrink-0 flex items-center justify-start lg:justify-end">
            <button
              id="btn-write-review-toggle"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 ${
                isFormOpen
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-rose-200 hover:shadow-md'
              }`}
            >
              {isFormOpen ? (
                <>
                  <X className="w-4 h-4" />
                  <span>ফর্ম বন্ধ করুন</span>
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>একটি রিভিউ লিখুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review Submission Form Drawer / Card */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-rose-200 shadow-md animate-fadeIn space-y-4"
        >
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 font-['Hind_Siliguri']">
                আপনার মতামত বা রিভিউ দিন
              </h4>
            </div>
            <span className="text-xs text-rose-600 font-medium">
              প্রোডাক্ট: {product.bengaliName}
            </span>
          </div>

          {formError && (
            <div className="bg-rose-50 text-rose-700 text-xs px-3.5 py-2 rounded-xl border border-rose-200">
              ⚠️ {formError}
            </div>
          )}

          {/* Star Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              রেটিং দিন: <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:scale-125 transition-transform"
                      title={`${star} স্টার`}
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Reviewer Info: Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার নাম: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: সাদিয়া ইসলাম"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার এলাকা/শহর: <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="যেমন: ধানমন্ডি, ঢাকা"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition"
              />
            </div>
          </div>

          {/* Quick Tag Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              ক্লিক করে দ্রুত মতামত যুক্ত করুন:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => addQuickTagToComment(tag)}
                  className="text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-full transition active:scale-95"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার মতামত ও অভিজ্ঞতা: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="কাপড়ের মান, কাজের ফিনিশিং, ফিটিং বা ডেলিভারি নিয়ে আপনার অনুভূতি লিখুন..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition resize-none"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-50">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              রিভিউ প্রকাশ করুন
            </button>
          </div>
        </form>
      )}

      {/* Filter & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        {/* Star Rating Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3 text-rose-600" />
            ফিল্টার:
          </span>
          <button
            onClick={() => setSelectedStarFilter('all')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
              selectedStarFilter === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সবগুলো ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStarFilter(s)}
              className={`px-2.5 py-1 rounded-full font-bold transition shrink-0 flex items-center gap-1 ${
                selectedStarFilter === s
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{s}★</span>
              <span className="text-[10px] opacity-80">({starCounts[s as 1 | 2 | 3 | 4 | 5] || 0})</span>
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <span className="text-slate-500 font-medium hidden sm:inline">সর্ট করুন:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer text-xs"
          >
            <option value="newest">সর্বশেষ রিভিউ</option>
            <option value="highest">সর্বোচ্চ রেটিং</option>
            <option value="helpful">সবচেয়ে সহায়ক</option>
          </select>
        </div>
      </div>

      {/* Customer Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-rose-200 p-6">
            <p className="text-sm font-semibold text-slate-600 mb-2">
              এই ফিল্টারে কোনো রিভিউ পাওয়া যায়নি।
            </p>
            <button
              onClick={() => setSelectedStarFilter('all')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              সব রিভিউ দেখতে ক্লিক করুন
            </button>
          </div>
        ) : (
          filteredReviews.map((rev, index) => {
            const hasVoted = votedReviews[rev.id];
            const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
            const initial = rev.customerName ? rev.customerName.trim().charAt(0) : 'ক';

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100/80 shadow-xs hover:shadow-md transition-shadow duration-200 space-y-2.5"
              >
                {/* Review Header: User Info & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs shrink-0 select-none`}>
                      {initial}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                          {rev.customerName}
                        </h5>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            ভেরিফাইড ক্রেতা
                          </span>
                        )}
                      </div>

                      {/* Location & Date */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {rev.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {rev.location}
                          </span>
                        )}
                        {rev.location && <span>•</span>}
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {rev.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars badge */}
                  <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1 font-mono">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {rev.comment}
                </p>

                {/* Helpful voting footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="italic">
                    নারীর স্বপ্ন থেকে যাচাইকৃত অর্ডার
                  </span>

                  <button
                    onClick={() => handleHelpfulClick(rev.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                      hasVoted
                        ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                        : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                    title="এই রিভিউটি আপনার উপকারে এসেছে?"
                  >
                    <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>
                      {hasVoted ? 'সহায়ক লেগেছে!' : 'সহায়ক ছিল'} ({(rev.helpfulCount || 0) + (hasVoted ? 1 : 0)})
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
