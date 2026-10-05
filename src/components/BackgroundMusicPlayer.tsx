import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sliders, 
  X, 
  Disc, 
  Radio, 
  Check, 
  ExternalLink,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  url: string;
}

export const PRESET_TRACKS: MusicTrack[] = [
  {
    id: 'track-acoustic',
    title: 'শান্ত অ্যাকোস্টিক গিটার মেলোডি',
    artist: 'Boutique Ambient',
    category: 'অ্যাকোস্টিক',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: 'track-flute',
    title: 'নরম বাঁশি ও পিয়ানো সুবাস',
    artist: 'Eastern Relaxing',
    category: 'রিল্যাক্সিং',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  },
  {
    id: 'track-lounge',
    title: 'সুইট বুটিক লাউঞ্জ টিউন',
    artist: 'Fashion Chill',
    category: 'মডার্ন ফ্যাশন',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  },
];

export const BackgroundMusicPlayer: React.FC = () => {
  const { settings, updateSettings } = useShop();

  const musicConfig = settings.backgroundMusic || {
    enabled: true,
    audioUrl: PRESET_TRACKS[0].url,
    title: PRESET_TRACKS[0].title,
    defaultVolume: 0.35,
    autoplayOnFirstClick: false,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(musicConfig.defaultVolume ?? 0.35);
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [currentTrackTitle, setCurrentTrackTitle] = useState(musicConfig.title || PRESET_TRACKS[0].title);
  const [currentUrl, setCurrentUrl] = useState(musicConfig.audioUrl || PRESET_TRACKS[0].url);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'metadata';
    audio.src = currentUrl;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update track when url changes
  const changeTrack = (track: MusicTrack) => {
    setCurrentUrl(track.url);
    setCurrentTrackTitle(track.title);
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.src = track.url;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  };

  const applyCustomUrl = () => {
    if (!customUrl.trim()) return;
    const trimmed = customUrl.trim();
    setCurrentUrl(trimmed);
    setCurrentTrackTitle('কাস্টম অডিও ট্র্যাক');
    if (audioRef.current) {
      audioRef.current.src = trimmed;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
    setCustomUrl('');
  };

  const togglePlay = () => {
    setHasInteracted(true);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Floating Bottom-Left Music Trigger Widget */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 flex flex-col items-start select-none">
        
        {/* Expanded Music Control Panel Popup */}
        {isOpen && (
          <div className="mb-3 w-80 sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-rose-200 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Music className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-['Hind_Siliguri']">
                    ব্যাকগ্রাউন্ড মিউজিক
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    শপিংয়ের সময় মিষ্টি সুর উপভোগ করুন
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Playing Track Bar */}
            <div className="bg-rose-50/80 rounded-xl p-3 border border-rose-100 mb-3 flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                  <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
                  <span className="truncate">{currentTrackTitle}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isPlaying ? 'এখন বাজছে...' : 'মিউজিক বন্ধ আছে'}
                </p>
              </div>

              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white flex items-center justify-center shadow-md active:scale-95 transition shrink-0"
                title={isPlaying ? 'মিউজিক থামান' : 'মিউজিক চালান'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>

            {/* Volume Control Slider */}
            <div className="space-y-1.5 mb-4 px-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-rose-600" />
                  <span>শব্দ মাত্রা (ভলিউম)</span>
                </span>
                <span className="font-mono font-bold text-rose-600">
                  {isMuted ? '০%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="text-slate-500 hover:text-rose-600 transition"
                  title={isMuted ? 'শব্দ চালু করুন' : 'নিঃশব্দ করুন'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-full accent-rose-600 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-2 mb-3">
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>শান্ত ও মনকাড়া সুর নির্বাচন করুন:</span>
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESET_TRACKS.map((t) => {
                  const isSelected = currentUrl === t.url;
                  return (
                    <button
                      key={t.id}
                      onClick={() => changeTrack(t)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-rose-500 text-white font-bold shadow-xs' 
                          : 'bg-slate-50 hover:bg-rose-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="truncate text-xs">{t.title}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                          {t.category} • {t.artist}
                        </p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input Accordion */}
            <div className="border-t border-rose-100 pt-2.5">
              <p className="text-[11px] font-medium text-slate-600 mb-1.5">
                নিজের অডিও লিঙ্ক / MP3 যোগ করতে চান?
              </p>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://.../music.mp3 বা /audio.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 text-xs border border-rose-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  onClick={applyCustomUrl}
                  disabled={!customUrl.trim()}
                  className="bg-rose-600 disabled:opacity-50 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold hover:bg-rose-700 transition shrink-0"
                >
                  সেট
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact Floating Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border transition-all active:scale-95 ${
              isPlaying
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-300 ring-2 ring-rose-200'
                : 'bg-white hover:bg-rose-50 text-slate-700 border-rose-200'
            }`}
            title="ব্যাকগ্রাউন্ড মিউজিক প্লেয়ার খুলুন"
          >
            {/* Animated Equalizer Waves when playing */}
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_100ms] h-2"></span>
                <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_300ms] h-3.5"></span>
                <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_200ms] h-2.5"></span>
              </div>
            ) : (
              <Music className="w-3.5 h-3.5 text-rose-600" />
            )}

            <span className="text-xs font-bold font-['Hind_Siliguri']">
              {isPlaying ? 'মিউজিক বাজছে' : 'ব্যাকগ্রাউন্ড মিউজিক'}
            </span>

            <ChevronUp className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Play/Pause Mini Toggle */}
          <button
            onClick={togglePlay}
            className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition active:scale-90 ${
              isPlaying
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
            }`}
            title={isPlaying ? 'থামান' : 'চালান'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </div>
    </>
  );
};
