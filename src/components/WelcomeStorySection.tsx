import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const WelcomeStorySection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-5 sm:my-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-white to-pink-50/80 border border-rose-200/80 shadow-md p-6 sm:p-8 md:p-10">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>"নারীর স্বপ্ন"—এ আপনাকে স্বাগতম! ✨</span>
          </div>

          {/* Emotional Headline */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri'] leading-relaxed sm:leading-snug">
            প্রতিটি নারীর স্বপ্ন থাকে নিজের পছন্দমতো ও আরামদায়ক পোশাক পরে নিজেকে সুন্দরভাবে ফুটিয়ে তোলার।
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            আপনার সেই স্বপ্নকে বাস্তবে রূপ দিতেই আমাদের এই পথচলা। আভিজাত্য, সেরা ফেব্রিক এবং অনন্য ডিজাইনের সমন্বয়ে তৈরি আমাদের প্রতিটি পোশাক।
          </p>

          {/* Feature Highlights Grid - 2 Divs Left and Right (50% each) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-2 text-left">
            {/* 1st Div (Left, 50%): Contains 1st & 2nd texts */}
            <div className="bg-white/95 backdrop-blur-xs p-3 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-xs transition space-y-2.5 sm:space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-rose-600 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 font-['Hind_Siliguri']">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-rose-600" />
                  <span>ট্রেন্ডি ও প্রিমিয়াম কোয়ালিটি</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 pl-5 sm:pl-6 leading-relaxed">
                  এক্সক্লুসিভ কালেকশন ও ঐতিহ্যবাহী শাড়ির সেরা মেলা
                </p>
              </div>

              <div className="border-t border-rose-100/70 pt-2.5 sm:pt-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-rose-600 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 font-['Hind_Siliguri']">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-rose-600" />
                  <span>ক্যাজুয়াল ও গর্জিয়াস কালেকশন</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 pl-5 sm:pl-6 leading-relaxed">
                  প্রতিদিনের স্বাচ্ছন্দ্য ও উৎসবের জাঁকজমকপূর্ণ আয়োজন
                </p>
              </div>
            </div>

            {/* 2nd Div (Right, 50%): Contains 3rd & 4th texts */}
            <div className="bg-white/95 backdrop-blur-xs p-3 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-xs transition space-y-2.5 sm:space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-rose-600 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 font-['Hind_Siliguri']">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-rose-600" />
                  <span>বাজেটবান্ধব সেরা ফেব্রিকস</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 pl-5 sm:pl-6 leading-relaxed">
                  অতুলনীয় মানের পিওর সুতি, জর্জেট, সিল্ক ও দুবাই চেরি
                </p>
              </div>

              <div className="border-t border-rose-100/70 pt-2.5 sm:pt-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-rose-600 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 font-['Hind_Siliguri']">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-rose-600" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 pl-5 sm:pl-6 leading-relaxed">
                  সারাদেশে ঘরে বসে পণ্য দেখে মূল্য পরিশোধের সুবিধা
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-rose-600 font-semibold italic pt-1">
            🌸 আপনার পথচলায় 'নারীর স্বপ্ন' থাকুক আপনার সাথে। 🌸
          </p>
        </div>
      </div>
    </section>
  );
};
