import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { useShop } from '../context/ShopContext';
import { fetchSteadfastTracking } from '../services/courierTrackingService';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  Check, 
  XCircle, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  RefreshCw
} from 'lucide-react';

export interface OrderProgressTrackerProps {
  order: Order;
  compact?: boolean;
}

interface StepConfig {
  id: 'pending' | 'processing' | 'shipped' | 'delivered';
  titleBn: string;
  titleEn: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}

const STAGES: StepConfig[] = [
  {
    id: 'pending',
    titleBn: 'অর্ডার গৃহীত',
    titleEn: 'Pending',
    description: 'অর্ডারটি সিস্টেমে নথিভুক্ত হয়েছে ও রিভিউ চলছে',
    icon: Clock,
    hint: 'সাধারণত ১০-৩০ মিনিটের মধ্যে রিভিউ হয়'
  },
  {
    id: 'processing',
    titleBn: 'প্রসেসিং ও প্যাকেজিং',
    titleEn: 'Processing',
    description: 'পোশাকের কোয়ালিটি চেক ও পার্সেল প্রস্তুত সম্পন্ন',
    icon: Package,
    hint: 'নিখুঁতভাবে প্যাকিং ও কোয়ালিটি ইনস্পেকশন'
  },
  {
    id: 'shipped',
    titleBn: 'কুরিয়ারে ট্রানজিট',
    titleEn: 'Shipped',
    description: 'কুরিয়ার পার্টনারের কাছে পার্সেল হস্তান্তর করা হয়েছে',
    icon: Truck,
    hint: 'কুরিয়ার ট্র্যাকিং নম্বর দিয়ে সরাসরি ট্র্যাক করুন'
  },
  {
    id: 'delivered',
    titleBn: 'ডেলিভারি সম্পন্ন',
    titleEn: 'Delivered',
    description: 'পার্সেলটি সফলভাবে গ্রাহকের হাতে পৌঁছে দেওয়া হয়েছে',
    icon: CheckCircle2,
    hint: 'আপনার পছন্দের জন্য নারীর স্বপ্ন পরিবার কৃতজ্ঞ'
  }
];

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ order, compact = false }) => {
  const { updateOrderStatus } = useShop();
  const [isSyncingCourier, setIsSyncingCourier] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const handleSyncSteadfastStatus = async () => {
    if (!order.courier) return;
    setIsSyncingCourier(true);
    setSyncNotice(null);

    const queryTarget = order.courier.trackingUrl || order.courier.trackingId;
    try {
      const result = await fetchSteadfastTracking(queryTarget);
      if (result.isDelivered || result.normalizedStatus === 'delivered') {
        updateOrderStatus(order.id, 'delivered', {
          name: 'Steadfast Courier',
          trackingId: result.trackingCode || order.courier.trackingId,
          trackingUrl: result.trackingUrl || (queryTarget.startsWith('http') ? queryTarget : undefined),
          deliveredDate: result.deliveredDate || new Date().toISOString().substring(0, 10),
          latestTimeline: result.latestTimeline || 'পার্সেল সফলভাবে ডেলিভারি সম্পন্ন হয়েছে',
          estimatedDelivery: 'ডেলিভারি সম্পন্ন (Delivered)',
          lastSyncedAt: new Date().toISOString(),
        });
        setSyncNotice('✓ Steadfast থেকে নিশ্চিত করা হয়েছে: পার্সেলটি সফলভাবে ডেলিভারি সম্পন্ন হয়েছে!');
      } else {
        setSyncNotice(`Steadfast লাইভ স্ট্যাটাস: ${result.statusText || 'কুরিয়ারে ট্রানজিটে রয়েছে'}`);
      }
    } catch {
      setSyncNotice('Steadfast সার্ভারের সাথে সংযোগ করা যায়নি, অনুগ্রহ করে সরাসরি ওয়েবসাইটে ট্র্যাক করুন।');
    } finally {
      setIsSyncingCourier(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // Map order status to stage index (0 to 3)
  const getStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1; // Confirmed counts as entering packaging/processing phase
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(order.status);

  // Calculate percentage for the continuous progress line
  const progressPercent = isCancelled 
    ? 0 
    : Math.round(((currentStageIndex) / (STAGES.length - 1)) * 100);

  // Status color badge and message generator
  const getStatusSummary = () => {
    if (isCancelled) {
      return {
        badgeText: 'অর্ডার বাতিল (Cancelled)',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        message: 'এই অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে আমাদের হেল্পলাইনে যোগাযোগ করুন।',
      };
    }
    switch (order.status) {
      case 'pending':
        return {
          badgeText: 'পর্যালোচনাধীন (Pending)',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          message: 'আপনার অর্ডারটি গৃহীত হয়েছে। নারীর স্বপ্ন টিম শীঘ্রই যোগাযোগ করবে।',
        };
      case 'confirmed':
        return {
          badgeText: 'নিশ্চিতকৃত (Confirmed)',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          message: 'অর্ডারটি কনফার্ম হয়েছে এবং প্যাকেজিং বিভাগে পাঠানো হয়েছে।',
        };
      case 'processing':
        return {
          badgeText: 'প্রসেসিং ও প্যাকেজিং (Processing)',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          message: 'আপনার পছন্দের পোশাকটি প্রিমিয়াম বক্সে প্যাকিং করা হচ্ছে।',
        };
      case 'shipped':
        return {
          badgeText: 'কুরিয়ারে হস্তান্তর (Shipped)',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          message: `পার্সেলটি ${order.courier?.name || 'কুরিয়ারে'} ট্রানজিটে রয়েছে। খুব শীঘ্রই আপনার ঠিকানায় পৌঁছাবে।`,
        };
      case 'delivered':
        return {
          badgeText: 'ডেলিভারি সম্পন্ন (Delivered)',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          message: 'পার্সেলটি সফলভাবে ডেলিভারি করা হয়েছে। আপনার কেনাকাটা শুভ হোক!',
        };
      default:
        return {
          badgeText: 'চলমান (In Progress)',
          badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
          message: 'অর্ডারটি সিস্টেমে প্রসেস করা হচ্ছে।',
        };
    }
  };

  const statusSummary = getStatusSummary();

  // If order is cancelled, show an explicit alert state
  if (isCancelled) {
    return (
      <div className="bg-red-50/60 rounded-2xl border border-red-200 p-5 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-red-950 font-['Hind_Siliguri']">
            অর্ডারটি বাতিল করা হয়েছে
          </h4>
          <p className="text-xs text-red-700 mt-0.5">
            অর্ডার আইডি: <span className="font-mono font-bold">{order.id}</span>
          </p>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            যদি কোনো ভুলবশত এই অর্ডারটি বাতিল হয়ে থাকে বা নতুন করে অর্ডার করতে চান, অনুগ্রহ করে আমাদের হোয়াটসঅ্যাপ বা হটলাইনে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Top Header: Current Status & Overall Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-50">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 font-['Hind_Siliguri']">
              ডেলিভারি অগ্রগতি ট্র্যাকার
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${statusSummary.badgeBg}`}>
              {statusSummary.badgeText}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-snug">
            {statusSummary.message}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <span className="text-[11px] font-medium text-slate-500">সম্পূর্ণ:</span>
          <span className="text-sm font-black text-rose-600 font-['Outfit']">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Main Linear Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 relative">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-500 shadow-xs"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>অর্ডার প্লেস</span>
          <span>প্রসেসিং</span>
          <span>কুরিয়ার ট্রানজিট</span>
          <span>ডেলিভারি</span>
        </div>
      </div>

      {/* Step Nodes: Desktop Horizontal / Mobile Vertical Stepper */}
      <div className="relative pt-2">
        {/* Desktop Connecting Line behind nodes */}
        <div className="hidden md:block absolute top-[28px] left-[5%] right-[5%] h-1 bg-slate-200 z-0">
          <div 
            className="h-full bg-rose-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;
            const Icon = stage.icon;

            return (
              <div 
                key={stage.id} 
                className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2 p-3 md:p-2 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-rose-50/70 border border-rose-200 shadow-2xs md:bg-transparent md:border-transparent md:shadow-none' 
                    : 'bg-transparent'
                }`}
              >
                {/* Node Icon Circle */}
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 relative ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}

                  {/* Stage Number Badge */}
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-700 text-white'
                      : isCurrent
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                </div>

                {/* Node Content */}
                <div className="min-w-0 flex-1 md:flex-initial space-y-0.5">
                  <div className="flex items-center md:justify-center gap-1.5 flex-wrap">
                    <h5 className={`text-xs sm:text-sm font-bold font-['Hind_Siliguri'] ${
                      isCurrent 
                        ? 'text-rose-700 font-black' 
                        : isCompleted 
                        ? 'text-slate-900' 
                        : 'text-slate-400'
                    }`}>
                      {stage.titleBn}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      ({stage.titleEn})
                    </span>
                  </div>

                  <p className={`text-[11px] leading-snug line-clamp-2 ${
                    isCurrent 
                      ? 'text-slate-700 font-medium' 
                      : isCompleted 
                      ? 'text-slate-500' 
                      : 'text-slate-400'
                  }`}>
                    {stage.description}
                  </p>

                  {/* Stage-specific dynamic status timestamp / info */}
                  {isCurrent && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-white/90 px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                        <span>বর্তমানে এই ধাপে আছে</span>
                      </span>
                    </div>
                  )}

                  {isCompleted && idx === 0 && (
                    <p className="text-[10px] text-emerald-700 font-mono">
                      নথিভুক্ত: {order.createdAt.split(' ')[0] || 'সম্পন্ন'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Status Toast Notice if any */}
      {syncNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Courier & Tracking Quick Box if Shipped / Delivered */}
      {order.courier && (
        <div className="p-4 bg-gradient-to-r from-rose-50/50 via-sky-50/40 to-emerald-50/40 rounded-2xl border border-sky-100 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
              }`}>
                {isDelivered ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Truck className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    কুরিয়ার: {order.courier.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-sky-900 bg-white px-2 py-0.5 rounded-md border border-sky-200 shadow-2xs">
                    {order.courier.trackingId.startsWith('http') ? 'লাইভ ট্র্যাকিং লিংক যুক্ত' : order.courier.trackingId}
                  </span>
                  {isDelivered && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      ডেলিভারি সম্পন্ন (DELIVERED)
                    </span>
                  )}
                </div>
                
                {isDelivered ? (
                  <p className="text-[11px] text-emerald-800 font-medium">
                    ✓ ডেলিভারি নিশ্চিত: {order.courier.deliveredDate || order.deliveredAt || 'সম্পন্ন'}
                    {order.courier.latestTimeline ? ` • ${order.courier.latestTimeline}` : ''}
                  </p>
                ) : (
                  order.courier.estimatedDelivery && (
                    <p className="text-[11px] text-slate-600 font-medium">
                      সম্ভাব্য আগমন: {order.courier.estimatedDelivery}
                    </p>
                  )
                )}
              </div>
            </div>

            {/* Action Buttons: Live Tracking Link & Steadfast Sync */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {/* Steadfast Status Sync Button if Steadfast */}
              {order.courier.name.toLowerCase().includes('steadfast') && (
                <button
                  type="button"
                  onClick={handleSyncSteadfastStatus}
                  disabled={isSyncingCourier}
                  title="Steadfast কুরিয়ার সার্ভার থেকে সর্বশেষ ডেলিভারি স্ট্যাটাস স্বয়ংক্রিয়ভাবে সিঙ্ক করুন"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncingCourier ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCourier ? 'সিঙ্ক হচ্ছে...' : 'Steadfast স্ট্যাটাস সিঙ্ক'}</span>
                </button>
              )}

              {/* Direct External Tracking Link Button */}
              {(() => {
                const cName = order.courier.name.toLowerCase();
                const trkId = order.courier.trackingId;
                let trackUrl: string | null = order.courier.trackingUrl || null;

                if (!trackUrl) {
                  if (trkId.startsWith('http://') || trkId.startsWith('https://')) {
                    trackUrl = trkId;
                  } else if (cName.includes('steadfast')) {
                    if (trkId.length > 20 || trkId.includes('_')) {
                      trackUrl = `https://steadfast.com.bd/tl/${encodeURIComponent(trkId)}`;
                    } else {
                      trackUrl = `https://steadfast.com.bd/t/${encodeURIComponent(trkId)}`;
                    }
                  } else if (cName.includes('pathao')) {
                    trackUrl = `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(trkId)}`;
                  } else if (cName.includes('redx')) {
                    trackUrl = `https://redx.com.bd/track?trackingId=${encodeURIComponent(trkId)}`;
                  } else if (cName.includes('paperfly')) {
                    trackUrl = `https://paperfly.com.bd/tracking?tracking_id=${encodeURIComponent(trkId)}`;
                  } else if (cName.includes('ecourier')) {
                    trackUrl = `https://ecourier.com.bd/tracking?tracking_id=${encodeURIComponent(trkId)}`;
                  }
                }

                if (!trackUrl) return null;

                return (
                  <a
                    href={trackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
                  >
                    <span>Steadfast-এ লাইভ ট্র্যাকিং দেখুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
