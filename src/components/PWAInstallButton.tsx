import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer';
  onActionDone?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onActionDone,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { isEnglish } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    await install();
    onActionDone?.();
  };

  if (isInstallable) {
    if (variant === 'drawer') {
      return (
        <button
          id="btn-pwa-install-drawer"
          type="button"
          onClick={handleInstallClick}
          className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-white shrink-0" />
            <span>{isEnglish ? 'Install App (Offline Ready)' : 'অ্যাপ ইনস্টল করুন (অফলাইন সাপোর্ট)'}</span>
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">PWA</span>
        </button>
      );
    }

    return (
      <button
        id="btn-pwa-install-header"
        type="button"
        onClick={handleInstallClick}
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-all border border-rose-200 hover:border-rose-300 cursor-pointer shrink-0 shadow-2xs"
        title={isEnglish ? 'Install Naarir Shopno App' : 'নারীর স্বপ্ন অ্যাপ ইনস্টল করুন'}
      >
        <Download className="w-3.5 h-3.5 text-rose-600" />
        <span>{isEnglish ? 'Install App' : 'অ্যাপ ইনস্টল'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        {variant === 'drawer' ? (
          <button
            id="btn-pwa-ios-drawer"
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isEnglish ? 'Install on iPhone / iPad' : 'iPhone / iPad-এ ইনস্টল করুন'}</span>
            </div>
          </button>
        ) : (
          <button
            id="btn-pwa-ios-header"
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-all border border-rose-200 cursor-pointer shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-600" />
            <span>{isEnglish ? 'Install App' : 'অ্যাপ ইনস্টল'}</span>
          </button>
        )}

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-rose-100 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {isEnglish ? 'Install on iPhone / iPad' : 'iPhone / iPad-এ অ্যাপ ইনস্টল করুন'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isEnglish ? (
                  <>
                    1. Tap the <strong>Share</strong> icon in Safari toolbar.<br />
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </>
                ) : (
                  <>
                    ১. Safari-এর নিচে থাকা <strong>Share</strong> আইকনে ট্যাপ করুন।<br />
                    ২. নিচে স্ক্রল করে <strong>Add to Home Screen</strong> সিলেক্ট করুন।
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-sm font-bold text-white transition cursor-pointer"
              >
                {isEnglish ? 'Got it' : 'বুঝেছি'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
