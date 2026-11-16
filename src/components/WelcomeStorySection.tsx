import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles } from 'lucide-react';

export const WelcomeStorySection: React.FC = () => {
  const { isEnglish } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-5 sm:my-8">
      <div className="relative overflow-hidden rounded-3xl visit-white-border-box shadow-md p-6 sm:p-8 md:p-10">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>{isEnglish ? 'Welcome to "Naarir Shopno"! ✨' : '"নারীর স্বপ্ন"—এ আপনাকে স্বাগতম! ✨'}</span>
          </div>

          {/* Emotional Headline */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri'] leading-relaxed sm:leading-snug">
            {isEnglish
              ? 'Every woman dreams of expressing her elegance with comfortable and exquisite attire.'
              : 'প্রতিটি নারীর স্বপ্ন থাকে নিজের পছন্দমতো ও আরামদায়ক পোশাক পরে নিজেকে সুন্দরভাবে ফুটিয়ে তোলার।'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isEnglish
              ? 'We are here to bring that dream to life. Every garment blends sophistication, finest fabrics, and exclusive craftsmanship.'
              : 'আপনার সেই স্বপ্নকে বাস্তবে রূপ দিতেই আমাদের এই পথচলা। আভিজাত্য, সেরা ফেব্রিক এবং অনন্য ডিজাইনের সমন্বয়ে তৈরি আমাদের প্রতিটি পোশাক।'}
          </p>

          <p className="text-xs text-rose-600 font-semibold italic pt-1">
            🌸 {isEnglish ? 'May "Naarir Shopno" accompany you on your fashion journey. 🌸' : "আপনার পথচলায় 'নারীর স্বপ্ন' থাকুক আপনার সাথে। 🌸"}
          </p>
        </div>
      </div>
    </section>
  );
};
