import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../context/LanguageContext';

const VOICE_CLIPS = {
  onlineBn: '/audio/woman-online-bn.mp3',
  offlineBn: '/audio/woman-offline-bn.mp3',
  onlineEn: '/audio/woman-online-en.mp3',
  offlineEn: '/audio/woman-offline-en.mp3',
} as const;

type VoiceClipKey = keyof typeof VOICE_CLIPS;

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { isEnglish } = useLanguage();
  const prevOnlineRef = useRef<boolean>(true);
  const pendingClipRef = useRef<VoiceClipKey | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const isEnglishRef = useRef<boolean>(isEnglish);
  const blobUrlsRef = useRef<Partial<Record<VoiceClipKey, string>>>({});
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showOnlineNotice, setShowOnlineNotice] = useState(false);

  useEffect(() => {
    isEnglishRef.current = isEnglish;
  }, [isEnglish]);

  // Preload all 4 tiny female voice clips into memory so offline playback works instantly without network
  useEffect(() => {
    let cancelled = false;

    const preloadClips = async () => {
      await Promise.all(
        (Object.entries(VOICE_CLIPS) as Array<[VoiceClipKey, string]>).map(async ([key, url]) => {
          try {
            const res = await fetch(url);
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok || !contentType.includes('audio')) return;
            const blob = await res.blob();
            if (cancelled) return;
            blobUrlsRef.current[key] = URL.createObjectURL(blob);
          } catch {
            // Ignore preload errors when starting completely offline
          }
        })
      );
    };

    void preloadClips();

    return () => {
      cancelled = true;
      Object.values(blobUrlsRef.current).forEach((blobUrl) => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      });
      blobUrlsRef.current = {};
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  const playFemaleClip = useCallback((clipKey: VoiceClipKey) => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      }

      const src = blobUrlsRef.current[clipKey] || VOICE_CLIPS[clipKey];
      const audio = new Audio(src);
      audio.volume = 1;
      activeAudioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err: unknown) => {
          const name = err instanceof DOMException ? err.name : '';
          if (name === 'NotAllowedError') {
            pendingClipRef.current = clipKey;
          }
        });
      }
    } catch {
      // Ignore audio playback errors
    }
  }, []);

  // Retry autoplay-blocked voice announcement immediately on next user interaction
  useEffect(() => {
    const flushPendingVoice = () => {
      const pendingKey = pendingClipRef.current;
      if (!pendingKey) return;
      pendingClipRef.current = null;
      playFemaleClip(pendingKey);
    };

    window.addEventListener('pointerdown', flushPendingVoice, { passive: true });
    window.addEventListener('keydown', flushPendingVoice, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', flushPendingVoice);
      window.removeEventListener('keydown', flushPendingVoice);
    };
  }, [playFemaleClip]);

  useEffect(() => {
    const prevOnline = prevOnlineRef.current;
    if (prevOnline === isOnline) return;

    prevOnlineRef.current = isOnline;
    const eng = isEnglishRef.current;
    const clipKey: VoiceClipKey = isOnline
      ? eng
        ? 'onlineEn'
        : 'onlineBn'
      : eng
        ? 'offlineEn'
        : 'offlineBn';

    pendingClipRef.current = null;
    playFemaleClip(clipKey);

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (isOnline) {
      setShowOnlineNotice(true);
      hideTimerRef.current = window.setTimeout(() => {
        setShowOnlineNotice(false);
        hideTimerRef.current = null;
      }, 3500);
    } else {
      setShowOnlineNotice(false);
    }
  }, [isOnline, playFemaleClip]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (isOnline && !showOnlineNotice) return null;

  if (isOnline && showOnlineNotice) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xl border border-emerald-300/60 whitespace-nowrap"
      >
        <Wifi className="w-3.5 h-3.5 shrink-0" />
        <span>
          {isEnglish ? 'You are now online' : 'আপনি এখন অনলাইনে আছেন'}
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xl border border-amber-300/60 whitespace-nowrap"
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
