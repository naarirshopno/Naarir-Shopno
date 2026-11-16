import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const INTRO_VIDEO_SRC = '/assets/aistudio/AI_Tools_66ed6d4f.mp4';

interface IntroVideoOverlayProps {
  onComplete: () => void;
}

export const IntroVideoOverlay: React.FC<IntroVideoOverlayProps> = ({ onComplete }) => {
  const { isEnglish } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dismissedRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const [isClosing, setIsClosing] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [progress, setProgress] = useState(0);

  const finishIntro = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      onComplete();
    }, 450);
  }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Generous safety cap only in case media stalls completely on broken networks
    safetyTimerRef.current = window.setTimeout(() => {
      if (!isCancelled) {
        finishIntro();
      }
    }, 20000);

    const videoEl = videoRef.current;

    const tryAutoUnmuteOnGesture = () => {
      if (!videoEl || isCancelled) return;
      if (videoEl.muted) {
        videoEl.muted = false;
        videoEl.defaultMuted = false;
        videoEl.volume = 1;
        videoEl.play().catch(() => {});
      }
    };

    const startPlayback = async () => {
      if (!videoEl || isCancelled) return;
      try {
        videoEl.defaultMuted = false;
        videoEl.muted = false;
        videoEl.volume = 1;
        await videoEl.play();
      } catch (err) {
        if (isCancelled) return;
        const errName = err instanceof DOMException ? err.name : '';
        if (errName === 'AbortError') return;

        // If browser autoplay policy rejects unmuted cold-load playback, keep video playing smoothly
        // without blocking or showing any tap prompt, and silently unlock audio if any interaction occurs.
        try {
          videoEl.muted = true;
          await videoEl.play();
          window.addEventListener('pointerdown', tryAutoUnmuteOnGesture, { once: true, passive: true });
          window.addEventListener('touchstart', tryAutoUnmuteOnGesture, { once: true, passive: true });
          window.addEventListener('keydown', tryAutoUnmuteOnGesture, { once: true, passive: true });
        } catch {
          window.setTimeout(() => {
            if (!isCancelled) finishIntro();
          }, 3000);
        }
      }
    };

    startPlayback();

    return () => {
      isCancelled = true;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('pointerdown', tryAutoUnmuteOnGesture);
      window.removeEventListener('touchstart', tryAutoUnmuteOnGesture);
      window.removeEventListener('keydown', tryAutoUnmuteOnGesture);
      if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, [finishIntro]);

  const handlePlaying = () => {
    setIsBuffering(false);
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
    }
    const videoEl = videoRef.current;
    const expectedMs =
      videoEl && videoEl.duration && Number.isFinite(videoEl.duration)
        ? Math.ceil(videoEl.duration * 1000) + 3000
        : 12000;
    safetyTimerRef.current = window.setTimeout(() => {
      finishIntro();
    }, expectedMs);
  };

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration || !Number.isFinite(videoEl.duration)) return;
    const pct = Math.min(100, Math.max(0, (videoEl.currentTime / videoEl.duration) * 100));
    setProgress(pct);
  };

  const handleVideoError = () => {
    window.setTimeout(() => {
      finishIntro();
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Naarir Shopno Welcome Intro' : 'নারীর স্বপ্ন স্বাগতম ভিডিও'}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#fdf2f5] via-[#fae6ec] to-[#f5d9e2] px-4 py-6 transition-opacity duration-500 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle decorative radial glow */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.12)_0%,transparent_65%)]"
        aria-hidden="true"
      />

      {/* Top Welcome Pill (Clean, zero interactive buttons) */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 border border-rose-200 shadow-xs text-rose-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>{isEnglish ? 'Welcome to Naarir Shopno' : 'নারীর স্বপ্নে স্বাগতম'}</span>
        </div>
      </div>

      {/* Centered Responsive Intro Video Frame */}
      <div className="relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border-2 border-white/90 bg-[#f9eef1] aspect-video flex items-center justify-center">
        {isBuffering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f9eef1] z-0 pointer-events-none">
            <img
              src="/logo.jpg"
              alt="Naarir Shopno"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-rose-400 shadow-lg animate-pulse"
            />
          </div>
        )}

        <video
          ref={videoRef}
          src={INTRO_VIDEO_SRC}
          autoPlay
          playsInline
          preload="auto"
          onPlaying={handlePlaying}
          onCanPlay={() => setIsBuffering(false)}
          onEnded={finishIntro}
          onError={handleVideoError}
          onTimeUpdate={handleTimeUpdate}
          className="relative z-10 w-full h-full object-contain"
        />

        {/* Bottom Progress Indicator */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-rose-100/80 z-20">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-[width] duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Tagline */}
      <p className="relative z-10 mt-4 text-xs sm:text-sm font-semibold text-rose-800/85 text-center font-['Hind_Siliguri']">
        {isEnglish ? "Naarir Shopno • Dress Your Dreams — Women's Exclusive Fashion" : 'নারীর স্বপ্ন • Dress Your Dreams — আপনার স্বপ্নের এক্সক্লুসিভ ফ্যাশন'}
      </p>
    </div>
  );
};
