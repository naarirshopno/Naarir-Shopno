import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../context/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { isEnglish } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-5 left-1/2 -translate-x-1/2 sm:left-5 sm:translate-x-0 z-50 flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xl border border-amber-300/60 whitespace-nowrap"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {isEnglish
          ? 'Offline Mode — Cached storefront is active'
          : 'অফলাইন মোড — ক্যাশ করা স্টোর ব্যবহৃত হচ্ছে'}
      </span>
    </div>
  );
};
