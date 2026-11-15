import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchSteadfastTracking } from '../services/courierTrackingService';
import {
  CheckCircle2,
  ClipboardCheck,
  Package,
  Truck,
  Check,
  XCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export interface OrderProgressTrackerProps {
  order: Order;
  compact?: boolean;
  /** Optional normalized status returned directly from backend tracking endpoint */
  backendNormalizedStatus?: OrderStatus | null;
  /** Optional raw status label returned from courier/backend (e.g. "Delivered", "In Transit") */
  backendStatusText?: string | null;
  /** Optional timeline note returned from backend */
  backendTimeline?: string | null;
  /** Whether parent is currently querying backend tracking */
  isSyncingBackend?: boolean;
  /** Optional callback to trigger backend tracking refresh from parent */
  onRefreshBackend?: () => void;
}

export type ProgressMilestoneKey = 'ordered' | 'packing' | 'shipped' | 'delivered';

interface StageConfig {
  key: ProgressMilestoneKey;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageConfig[] = [
  {
    key: 'ordered',
    titleEn: 'Ordered',
    titleBn: 'অর্ডার সম্পন্ন',
    descEn: 'Order received & queued for confirmation',
    descBn: 'অর্ডারটি সিস্টেমে সফলভাবে গৃহীত হয়েছে',
    icon: ClipboardCheck,
  },
  {
    key: 'packing',
    titleEn: 'Packing',
    titleBn: 'প্যাকিং চলছে',
    descEn: 'Quality checked & securely packed for dispatch',
    descBn: 'কোয়ালিটি চেক করে প্রিমিয়াম প্যাকেজিং করা হচ্ছে',
    icon: Package,
  },
  {
    key: 'shipped',
    titleEn: 'Shipped',
    titleBn: 'কুরিয়ারে শিপড',
    descEn: 'Handed over to courier & currently in transit',
    descBn: 'কুরিয়ার পার্টনারের কাছে হস্তান্তর হয়েছে ও পথে রয়েছে',
    icon: Truck,
  },
  {
    key: 'delivered',
    titleEn: 'Delivered',
    titleBn: 'ডেলিভারি সম্পন্ন',
    descEn: 'Parcel successfully delivered to recipient',
    descBn: 'পার্সেলটি সফলভাবে গ্রাহকের হাতে পৌঁছেছে',
    icon: CheckCircle2,
  },
];

/**
 * Normalizes backend or local OrderStatus strings to one of the 4 visual stages (0..3) or -1 if cancelled.
 */
export function resolveOrderStageIndex(status?: string | null): number {
  const normalized = String(status || 'pending').trim().toLowerCase();
  switch (normalized) {
    case 'pending':
    case 'ordered':
      return 0;
    case 'confirmed':
    case 'processing':
    case 'packing':
      return 1;
    case 'shipped':
    case 'in_transit':
    case 'transit':
      return 2;
    case 'delivered':
    case 'completed':
      return 3;
    case 'cancelled':
    case 'canceled':
    case 'returned':
      return -1;
    default:
      return 0;
  }
}

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({
  order,
  compact = false,
  backendNormalizedStatus = null,
  backendStatusText = null,
  backendTimeline = null,
  isSyncingBackend = false,
  onRefreshBackend,
}) => {
  const { updateOrderStatus } = useShop();
  const { isEnglish, formatNumber } = useLanguage();
  const [isInternalSyncing, setIsInternalSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const effectiveStatus: OrderStatus = backendNormalizedStatus || order.status;
  const currentStageIndex = resolveOrderStageIndex(effectiveStatus);
  const isCancelled = currentStageIndex === -1;
  const isDelivered = currentStageIndex === 3;
  const isSyncing = isSyncingBackend || isInternalSyncing;

  // Milestone percentages: Ordered = 25%, Packing = 50%, Shipped = 75%, Delivered = 100%
  const progressPercent = isCancelled ? 0 : (currentStageIndex + 1) * 25;
  // Connecting track width across the 4 centers (0%, 33.3%, 66.6%, 100%)
  const connectorPercent = isCancelled
    ? 0
    : Math.round((currentStageIndex / (STAGES.length - 1)) * 100);

  const handleSyncCourierStatus = async () => {
    if (onRefreshBackend) {
      onRefreshBackend();
      return;
    }
    if (!order.courier) return;
    setIsInternalSyncing(true);
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
          latestTimeline:
            result.latestTimeline ||
            (isEnglish ? 'Parcel delivered successfully' : 'পার্সেল সফলভাবে ডেলিভারি সম্পন্ন হয়েছে'),
          estimatedDelivery: isEnglish ? 'Delivered' : 'ডেলিভারি সম্পন্ন (Delivered)',
          lastSyncedAt: new Date().toISOString(),
        });
        setSyncNotice(
          isEnglish
            ? 'Confirmed via Steadfast: Parcel has been delivered!'
            : '✓ Steadfast থেকে নিশ্চিত করা হয়েছে: পার্সেলটি সফলভাবে ডেলিভারি সম্পন্ন হয়েছে!'
        );
      } else {
        setSyncNotice(
          isEnglish
            ? `Steadfast Live Status: ${result.statusText || 'In Transit'}`
            : `Steadfast লাইভ স্ট্যাটাস: ${result.statusText || 'কুরিয়ারে ট্রানজিটে রয়েছে'}`
        );
      }
    } catch {
      setSyncNotice(
        isEnglish
          ? 'Could not reach Steadfast server. Please check via the live link.'
          : 'Steadfast সার্ভারের সাথে সংযোগ করা যায়নি, অনুগ্রহ করে সরাসরি ওয়েবসাইটে ট্র্যাক করুন।'
      );
    } finally {
      setIsInternalSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const getStatusSummary = () => {
    if (isCancelled) {
      return {
        badgeText: isEnglish ? 'Cancelled' : 'অর্ডার বাতিল (Cancelled)',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        message: isEnglish
          ? 'This order has been cancelled. Contact our helpline if you need assistance.'
          : 'এই অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে আমাদের হেল্পলাইনে যোগাযোগ করুন।',
      };
    }

    switch (currentStageIndex) {
      case 0:
        return {
          badgeText: isEnglish ? 'Ordered' : 'অর্ডার সম্পন্ন (Ordered)',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          message: isEnglish
            ? 'Your order has been received and is awaiting confirmation.'
            : 'আপনার অর্ডারটি গৃহীত হয়েছে। নারীর স্বপ্ন টিম শীঘ্রই কনফার্ম করবে।',
        };
      case 1:
        return {
          badgeText: isEnglish ? 'Packing' : 'প্যাকিং চলছে (Packing)',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          message: isEnglish
            ? 'Your order is confirmed and currently being quality-checked and packed.'
            : 'অর্ডারটি কনফার্ম হয়েছে এবং আপনার পোশাকটি যত্নসহকারে প্যাকিং করা হচ্ছে।',
        };
      case 2:
        return {
          badgeText: isEnglish ? 'Shipped' : 'কুরিয়ারে শিপড (Shipped)',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          message: isEnglish
            ? `Your parcel is in transit via ${order.courier?.name || 'our courier partner'}.`
            : `পার্সেলটি ${order.courier?.name || 'কুরিয়ারে'} ট্রানজিটে রয়েছে। শীঘ্রই আপনার ঠিকানায় পৌঁছাবে।`,
        };
      case 3:
        return {
          badgeText: isEnglish ? 'Delivered' : 'ডেলিভারি সম্পন্ন (Delivered)',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          message: isEnglish
            ? 'Your parcel has been delivered. Thank you for shopping with Naarir Shopno!'
            : 'পার্সেলটি সফলভাবে ডেলিভারি করা হয়েছে। নারীর স্বপ্নের সাথে থাকার জন্য ধন্যবাদ!',
        };
      default:
        return {
          badgeText: isEnglish ? 'In Progress' : 'চলমান',
          badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
          message: isEnglish ? 'Order is being processed.' : 'অর্ডারটি প্রসেস করা হচ্ছে।',
        };
    }
  };

  const statusSummary = getStatusSummary();

  if (isCancelled) {
    return (
      <div className="w-full min-w-0 bg-red-50/70 rounded-2xl border border-red-200 p-5 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <XCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-red-950 font-['Hind_Siliguri']">
            {isEnglish ? 'Order Cancelled' : 'অর্ডারটি বাতিল করা হয়েছে'}
          </h4>
          <p className="text-xs text-red-700">
            {isEnglish ? 'Order ID: ' : 'অর্ডার আইডি: '}
            <span className="font-mono font-bold">#{order.id}</span>
          </p>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {isEnglish
              ? 'If this order was cancelled by mistake or you wish to re-order, please contact our support helpline.'
              : 'যদি ভুলবশত এই অর্ডারটি বাতিল হয়ে থাকে বা নতুন করে অর্ডার করতে চান, অনুগ্রহ করে আমাদের হেল্পলাইনে যোগাযোগ করুন।'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-w-0 bg-white rounded-3xl border border-rose-100 shadow-sm ${
        compact ? 'p-4 space-y-4' : 'p-4 sm:p-6 space-y-5'
      }`}
    >
      {/* Top Header: Title, Current Normalized Stage Badge & Completion % */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100/80 min-w-0">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-slate-800 font-['Hind_Siliguri']">
              {isEnglish ? 'Order Delivery Progress' : 'ডেলিভারি অগ্রগতি ট্র্যাকার'}
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${statusSummary.badgeBg}`}
            >
              {statusSummary.badgeText}
            </span>
            {backendStatusText && (
              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                {isEnglish ? `Backend: ${backendStatusText}` : `সার্ভার স্ট্যাটাস: ${backendStatusText}`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-snug">{statusSummary.message}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {order.courier && (
            <button
              type="button"
              onClick={handleSyncCourierStatus}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
              title={isEnglish ? 'Refresh live status from backend' : 'সার্ভার থেকে লাইভ স্ট্যাটাস রিফ্রেশ করুন'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isEnglish ? 'Syncing...' : 'সিঙ্ক হচ্ছে...') : (isEnglish ? 'Sync Status' : 'লাইভ সিঙ্ক')}</span>
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <span className="text-[11px] font-medium text-slate-500">
              {isEnglish ? 'Progress:' : 'অগ্রগতি:'}
            </span>
            <span className="text-sm font-black text-rose-600 font-['Outfit']">
              {formatNumber(progressPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Continuous Visual Progress Bar */}
      <div className="space-y-2 w-full min-w-0">
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={isEnglish ? 'Order progress' : 'অর্ডার অগ্রগতি'}
          className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70 relative"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
              isDelivered
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 4 Stage Quick Labels along Bar */}
        <div className="grid grid-cols-4 gap-1 text-[10px] sm:text-[11px] font-semibold">
          {STAGES.map((stage, idx) => {
            const isActiveOrDone = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={`bar-label-${stage.key}`}
                className={`truncate ${
                  idx === 0
                    ? 'text-left'
                    : idx === STAGES.length - 1
                    ? 'text-right'
                    : 'text-center'
                } ${
                  isCurrent
                    ? 'text-rose-700 font-extrabold'
                    : isActiveOrDone
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {isEnglish ? stage.titleEn : stage.titleBn}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Stepper Milestones: Ordered -> Packing -> Shipped -> Delivered */}
      <div className="relative pt-2 w-full min-w-0">
        {/* Desktop Horizontal Connector Track */}
        <div className="hidden md:block absolute top-[32px] left-[12.5%] right-[12.5%] h-1 bg-slate-200 rounded-full z-0 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${
              isDelivered ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-rose-500'
            }`}
            style={{ width: `${connectorPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-2 relative z-10 w-full min-w-0">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && isDelivered);
            const isCurrent = idx === currentStageIndex && !isDelivered;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2 p-3 md:p-2 rounded-2xl transition-all min-w-0 ${
                  isCurrent
                    ? 'bg-rose-50/75 border border-rose-200 shadow-2xs md:bg-transparent md:border-transparent md:shadow-none'
                    : isCompleted
                    ? 'bg-emerald-50/35 md:bg-transparent'
                    : 'bg-transparent'
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 relative ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}

                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {formatNumber(idx + 1)}
                  </span>
                </div>

                {/* Stage Title & Description */}
                <div className="min-w-0 flex-1 md:flex-initial space-y-0.5">
                  <div className="flex items-center md:justify-center gap-1.5 flex-wrap">
                    <h5
                      className={`text-xs sm:text-sm font-bold font-['Hind_Siliguri'] ${
                        isCurrent
                          ? 'text-rose-700 font-black'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {isEnglish ? stage.titleEn : stage.titleBn}
                    </h5>
                  </div>

                  <p
                    className={`text-[11px] leading-snug ${
                      isCurrent
                        ? 'text-slate-700 font-medium'
                        : isCompleted
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {isEnglish ? stage.descEn : stage.descBn}
                  </p>

                  {isCurrent && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-white/95 px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                        <span>{isEnglish ? 'Current Stage' : 'বর্তমান ধাপ'}</span>
                      </span>
                    </div>
                  )}

                  {isCompleted && idx === 0 && order.createdAt && (
                    <p className="text-[10px] text-emerald-700 font-mono">
                      {isEnglish ? 'Placed: ' : 'নথিভুক্ত: '}
                      {order.createdAt.split(' ')[0]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Toast Notice */}
      {syncNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold break-words">{syncNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5 rounded cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Backend Timeline Update Note */}
      {(backendTimeline || order.courier?.latestTimeline) && (
        <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Truck className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="font-medium break-words">
              <strong className="text-sky-900">
                {isEnglish ? 'Latest Courier Update: ' : 'সর্বশেষ কুরিয়ার আপডেট: '}
              </strong>
              {backendTimeline || order.courier?.latestTimeline}
            </span>
          </div>
          {order.courier?.trackingUrl && (
            <a
              href={order.courier.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline shrink-0"
            >
              <span>{isEnglish ? 'Track Live' : 'লাইভ দেখুন'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
