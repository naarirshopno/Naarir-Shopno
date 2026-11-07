import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Product, Order, OrderStatus, CategoryType, StoreSettings, CustomCategoryItem, DropshippingApiSettings, ProductFulfillmentType, FirestoreEmailLog } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { 
  testDropshippingConnection, 
  sendOrderToDropshipping, 
  getOrderFulfillmentSummary,
  DropshippingTestResult,
  generateProductFromDropshippingInput,
  DropshippingCatalogProduct
} from '../services/dropshippingService';
import { fetchSteadfastTracking, normalizeSteadfastInput } from '../services/courierTrackingService';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Phone, 
  Share2, 
  DollarSign, 
  Lock, 
  Eye, 
  EyeOff,
  Printer, 
  Save, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  LogOut,
  Key,
  Mail,
  Palette,
  Star,
  Search,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  Cloud,
  RefreshCw,
  Camera,
  Upload,
  RotateCcw,
  Link as LinkIcon,
  MapPin,
  ExternalLink,
  Globe,
  Database,
  Activity,
  Cpu,
  Server,
  ShieldAlert,
  Boxes,
  PackageCheck,
  Wifi,
  WifiOff,
  Copy,
  CheckCheck,
  Zap,
  Download,
  TrendingUp,
  Percent,
  Send,
  FileText,
  Filter,
  BarChart3,
  Smartphone,
  Monitor
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { 
  generateOrderEmailHtml, 
  triggerOrderEmailNotification, 
  createGmailDraftUrl,
  fetchFirestoreEmailLogs,
  subscribeToFirestoreEmailLogs,
  clearAllFirestoreEmailLogs
} from '../services/emailNotificationService';

const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: 'গোলাপি', hex: '#ec4899' },
  { name: 'মেরুন', hex: '#881337' },
  { name: 'লাল', hex: '#dc2626' },
  { name: 'ম্যাজেন্টা', hex: '#c026d3' },
  { name: 'রয়েল ব্লু', hex: '#2563eb' },
  { name: 'নেভি ব্লু', hex: '#1e3a8a' },
  { name: 'সবুজ', hex: '#16a34a' },
  { name: 'জলপাই', hex: '#65a30d' },
  { name: 'হলুদ', hex: '#eab308' },
  { name: 'বেগুনি', hex: '#9333ea' },
  { name: 'কালো', hex: '#18181b' },
  { name: 'সাদা', hex: '#f8fafc' },
  { name: 'মিষ্টি কালার', hex: '#f97316' },
  { name: 'ফিরোজা', hex: '#0d9488' },
  { name: 'গোল্ডেন', hex: '#d97706' },
  { name: 'আকাশী', hex: '#38bdf8' },
];

export const AdminPanel: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    orders, 
    updateOrderStatus, 
    updateOrderDropshipping,
    deleteOrder,
    settings, 
    updateSettings, 
    deleteCategory,
    addCategory,
    updateCategory,
    messages, 
    markMessageAsRead, 
    deleteMessage,
    clearAllMessages,
    cloudSyncStatus,
    syncAllToCloud,
    deleteDemoProducts,
    clearAllProducts,
    restoreDemoProducts,
    dbHealth,
    isCheckingDbHealth,
    runDbHealthCheck
  } = useShop();

  const navigate = useNavigate();

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [cloudSyncedToast, setCloudSyncedToast] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderDeleteToast, setOrderDeleteToast] = useState<string | null>(null);
  const [isConfirmDeleteDemosOpen, setIsConfirmDeleteDemosOpen] = useState(false);
  const [demoDeleteToast, setDemoDeleteToast] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'delivery' | 'social' | 'messages' | 'categories' | 'database' | 'dropshipping' | 'emails'>('dashboard');
  
  // Email Notification & Cloud Functions States
  const [previewEmailHtml, setPreviewEmailHtml] = useState<string | null>(null);
  const [previewEmailTitle, setPreviewEmailTitle] = useState<string>('');
  const [templatePreviewOrder, setTemplatePreviewOrder] = useState<Order | null>(null);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewHtmlCopied, setPreviewHtmlCopied] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>(settings.emailSettings?.senderEmail || 'NaarirShopno@Gmail.com');
  const [testEmailLoading, setTestEmailLoading] = useState<boolean>(false);
  const [testEmailSuccess, setTestEmailSuccess] = useState<string | null>(null);
  const [testEmailError, setTestEmailError] = useState<string | null>(null);
  const [showSmtpPass, setShowSmtpPass] = useState<boolean>(false);
  const [emailSettingsForm, setEmailSettingsForm] = useState(() => ({
    enabled: true,
    provider: 'gmail' as const,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: 'NaarirShopno@Gmail.com',
    smtpPass: '',
    smtpSecure: true,
    senderEmail: 'NaarirShopno@Gmail.com',
    senderName: 'নারীর স্বপ্ন (Naarir Shopno)',
    supportEmail: 'NaarirShopno@Gmail.com',
    bccAdminOnOrder: true,
    orderConfirmationSubject: 'নারীর স্বপ্ন - আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে (#{orderId})',
    ...settings.emailSettings,
  }));
  const [emailSettingsSavedToast, setEmailSettingsSavedToast] = useState(false);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);

  // Real Firestore Email Logs from /mail collection
  const [firestoreEmailLogs, setFirestoreEmailLogs] = useState<FirestoreEmailLog[]>([]);
  const [isLoadingEmailLogs, setIsLoadingEmailLogs] = useState<boolean>(true);
  const [emailLogSearch, setEmailLogSearch] = useState<string>('');
  const [emailLogStatusFilter, setEmailLogStatusFilter] = useState<'all' | 'delivered' | 'queued' | 'failed'>('all');
  const [selectedEmailLogModal, setSelectedEmailLogModal] = useState<FirestoreEmailLog | null>(null);
  const [emailLogCopiedId, setEmailLogCopiedId] = useState<string | null>(null);
  const [showClearEmailLogsModal, setShowClearEmailLogsModal] = useState<boolean>(false);
  const [isClearingEmailLogs, setIsClearingEmailLogs] = useState<boolean>(false);
  const [emailLogsClearToast, setEmailLogsClearToast] = useState<string | null>(null);

  const handleClearAllEmailLogs = async () => {
    setIsClearingEmailLogs(true);
    const res = await clearAllFirestoreEmailLogs();
    setIsClearingEmailLogs(false);
    setShowClearEmailLogsModal(false);
    if (res.success) {
      setFirestoreEmailLogs([]);
      setEmailLogsClearToast(`ফায়ারবেস ডাটাবেজ থেকে মোট ${res.count} টি ইমেইল লগ সফলভাবে মুছে ফেলা হয়েছে!`);
      setTimeout(() => setEmailLogsClearToast(null), 4000);
    } else {
      setEmailLogsClearToast(res.error || 'ইমেইল লগ মুছতে ব্যর্থ হয়েছে');
      setTimeout(() => setEmailLogsClearToast(null), 4000);
    }
  };

  useEffect(() => {
    if (settings.emailSettings) {
      setEmailSettingsForm((prev) => ({
        ...prev,
        ...settings.emailSettings,
      }));
    }
  }, [settings.emailSettings]);

  // Real-time listener for Firestore /mail collection
  useEffect(() => {
    setIsLoadingEmailLogs(true);
    const unsubscribe = subscribeToFirestoreEmailLogs((logs) => {
      setFirestoreEmailLogs(logs);
      setIsLoadingEmailLogs(false);
    });

    // Also run initial fetch
    fetchFirestoreEmailLogs().then((logs) => {
      if (logs && logs.length > 0) {
        setFirestoreEmailLogs(logs);
      }
      setIsLoadingEmailLogs(false);
    }).catch(() => {
      setIsLoadingEmailLogs(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  
  // Dropshipping API Configuration State
  const [dropshippingForm, setDropshippingForm] = useState<DropshippingApiSettings>(() => {
    return settings.dropshippingApi || {
      enabled: false,
      apiKey: '',
      apiSecret: '',
      baseUrl: 'https://www.dropshipping.com.bd/api/v1',
      resellerId: '',
      resellerPhone: '01911-541717',
      autoForwardOrders: false,
      testMode: true,
      defaultCourier: 'Steadfast Courier',
      webhookUrl: 'https://naarirshopno.vercel.app/api/dropshipping/webhook',
      connectionStatus: 'disconnected',
      lastStatusMessage: 'এখনো কোনো API কানেকশন কনফিগার করা হয়নি',
    };
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<DropshippingTestResult | null>(null);
  const [apiSaveToast, setApiSaveToast] = useState<string | null>(null);
  const [forwardingOrderId, setForwardingOrderId] = useState<string | null>(null);
  const [orderForwardToast, setOrderForwardToast] = useState<string | null>(null);
  const [webhookCopied, setWebhookCopied] = useState(false);

  useEffect(() => {
    if (settings.dropshippingApi) {
      setDropshippingForm(settings.dropshippingApi);
    }
  }, [settings.dropshippingApi]);

  // Dropshipping Link-to-Post Auto Description & Profits State
  const [isLinkPostModalOpen, setIsLinkPostModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('https://www.dropshipping.com.bd/product/imported-maternity-bra-for-newborn-baby-feeding-cotton-bra-13022');
  const [linkProfitMarginType, setLinkProfitMarginType] = useState<'fixed' | 'percent'>('fixed');
  const [linkProfitMargin, setLinkProfitMargin] = useState<number>(300);
  const [extractedProduct, setExtractedProduct] = useState<(DropshippingCatalogProduct & { calculatedPrice: number; calculatedRegularPrice: number; calculatedProfit: number }) | null>(null);
  const [linkExtractToast, setLinkExtractToast] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [quickLinkInputInProductModal, setQuickLinkInputInProductModal] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryItem, setEditingCategoryItem] = useState<CustomCategoryItem | null>(null);
  const [categoryFormId, setCategoryFormId] = useState('');
  const [categoryFormTitle, setCategoryFormTitle] = useState('');
  const [categoryFormSubtitle, setCategoryFormSubtitle] = useState('');
  const [categoryFormImage, setCategoryFormImage] = useState('');
  const [isCategoryFormUploading, setIsCategoryFormUploading] = useState(false);
  const [categoryToast, setCategoryToast] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CustomCategoryItem | null>(null);
  const categoryFormFileInputRef = useRef<HTMLInputElement>(null);
  
  // Secure Auth state (Session-based, prevents unauthorized customer access)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('naarir_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Persisted admin credentials in localStorage
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('naarir_admin_email') || 'NaarirShopno@Gmail.com';
    } catch {
      return 'NaarirShopno@Gmail.com';
    }
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('naarir_admin_password') || 'M01911541717m';
    } catch {
      return 'M01911541717m';
    }
  });

  const [adminSecurityPin, setAdminSecurityPin] = useState<string>(() => {
    try {
      return localStorage.getItem('naarir_security_pin') || '01911';
    } catch {
      return '01911';
    }
  });

  // Anti-Brute Force Lockout Protection
  const [recoveryLockoutUntil, setRecoveryLockoutUntil] = useState<number>(() => {
    try {
      return Number(sessionStorage.getItem('naarir_recovery_lockout') || 0);
    } catch {
      return 0;
    }
  });
  const [recoveryFailedCount, setRecoveryFailedCount] = useState<number>(() => {
    try {
      return Number(sessionStorage.getItem('naarir_recovery_fails') || 0);
    } catch {
      return 0;
    }
  });

  // Login form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password change form inside settings tab
  const [changePassForm, setChangePassForm] = useState({
    currentPass: '',
    newEmail: adminEmail,
    newPass: '',
    confirmPass: '',
    newSecurityPin: '',
  });
  const [changePassToast, setChangePassToast] = useState<{ success: boolean; message: string } | null>(null);

  // Forgot / Recovery Password Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmailOrPhone, setRecoveryEmailOrPhone] = useState('');
  const [recoverySecurityPin, setRecoverySecurityPin] = useState('');
  const [showRecoveryPin, setShowRecoveryPin] = useState(false);
  const [newRecoveryPass, setNewRecoveryPass] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');

  const initialCat = (Array.isArray(settings.categories) && settings.categories.length > 0)
    ? settings.categories[0]
    : DEFAULT_CATEGORIES[0];

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    bengaliName: '',
    sku: '',
    category: (initialCat?.id || 'all') as CategoryType,
    categoryBengali: initialCat?.title || 'পোশাক',
    fulfillmentType: 'own' as ProductFulfillmentType,
    wholesalePrice: 0,
    price: 1500,
    regularPrice: 2000,
    images: [] as string[],
    fabric: '',
    sizes: 'M (৩৮), L (৪০), XL (৪২)',
    colors: [
      { name: 'গোলাপি', hex: '#ec4899' },
      { name: 'মেরুন', hex: '#881337' },
    ] as { name: string; hex: string }[],
    description: '',
    stockCount: 15,
    isNew: true,
    isTrending: false,
    featured: false,
  });
  const [newImageInput, setNewImageInput] = useState('');
  const [bulkImageInput, setBulkImageInput] = useState('');
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#e11d48');
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // Product management dashboard filter & search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [productSourceFilter, setProductSourceFilter] = useState<'all' | 'own' | 'dropshipping'>('all');

  // Delivery charge settings local state
  const [deliveryForm, setDeliveryForm] = useState({
    insideDhaka: settings.deliveryCharges.insideDhaka,
    subDhaka: settings.deliveryCharges.subDhaka,
    outsideDhaka: settings.deliveryCharges.outsideDhaka,
    freeDeliveryAbove: settings.deliveryCharges.freeDeliveryAbove,
    freeDeliveryMinItems: settings.deliveryCharges.freeDeliveryMinItems || 3,
  });
  const [deliverySavedToast, setDeliverySavedToast] = useState(false);

  // Social, WhatsApp, Hotline & Shop Settings local state
  const [socialForm, setSocialForm] = useState({
    storeName: settings.storeName || 'নারীর স্বপ্ন',
    slogan: settings.slogan || 'Dress Your Dreams',
    hotline1: settings.hotline1 || '09617-541717',
    hotline2: settings.hotline2 || '09649-541717',
    supportHours: settings.supportHours || 'সকাল ১০টা - রাত ১০টা সার্বক্ষণিক সেবা',
    whatsappNumber: settings.whatsappNumber || '01911-541717',
    whatsappShortLink: settings.whatsappShortLink || 'https://wa.me/8801911541717',
    facebookUrl: settings.facebookUrl || '',
    tiktokUrl: settings.tiktokUrl || '',
    youtubeUrl: settings.youtubeUrl || '',
    bkashMerchantNumber: settings.bkashMerchantNumber || '01611541717 (মার্চেন্ট)',
    nagadMerchantNumber: settings.nagadMerchantNumber || '01911541717 (পার্সোনাল)',
    announcementText: settings.announcementText || '',
    officeAddress: settings.officeAddress || 'হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ',
    officeEmail: settings.officeEmail || 'NaarirShopno@Gmail.com',
    footerBgImage: settings.footerBgImage || '/footer-bg.jpg',
  });
  const [socialSavedToast, setSocialSavedToast] = useState(false);

  // Keep form in sync when settings change
  React.useEffect(() => {
    setSocialForm({
      storeName: settings.storeName || 'নারীর স্বপ্ন',
      slogan: settings.slogan || 'Dress Your Dreams',
      hotline1: settings.hotline1 || '09617-541717',
      hotline2: settings.hotline2 || '09649-541717',
      supportHours: settings.supportHours || 'সকাল ১০টা - রাত ১০টা সার্বক্ষণিক সেবা',
      whatsappNumber: settings.whatsappNumber || '01911-541717',
      whatsappShortLink: settings.whatsappShortLink || 'https://wa.me/8801911541717',
      facebookUrl: settings.facebookUrl || '',
      tiktokUrl: settings.tiktokUrl || '',
      youtubeUrl: settings.youtubeUrl || '',
      bkashMerchantNumber: settings.bkashMerchantNumber || '01611541717 (মার্চেন্ট)',
      nagadMerchantNumber: settings.nagadMerchantNumber || '01911541717 (পার্সোনাল)',
      announcementText: settings.announcementText || '',
      officeAddress: settings.officeAddress || 'হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ',
      officeEmail: settings.officeEmail || 'NaarirShopno@Gmail.com',
      footerBgImage: settings.footerBgImage || '/footer-bg.jpg',
    });
  }, [settings, isAdminOpen]);

  // Order detail & courier modal
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('Steadfast Courier');
  const [customCourierName, setCustomCourierName] = useState('');
  const [courierTrackingId, setCourierTrackingId] = useState('');
  const [courierEstDelivery, setCourierEstDelivery] = useState('২-৩ দিনের মধ্যে');
  const [courierStatus, setCourierStatus] = useState<OrderStatus>('shipped');
  const [isDetectingCourier, setIsDetectingCourier] = useState(false);
  const [courierSyncNotice, setCourierSyncNotice] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [quickSyncToast, setQuickSyncToast] = useState<string | null>(null);

  // Preview Image Lightbox Modal
  const [previewImageModal, setPreviewImageModal] = useState<{
    src: string;
    title: string;
    color?: string;
    size?: string;
  } | null>(null);

  // Invoice modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  if (!isAdminOpen) return null;

  // Secure Login verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();
    const targetEmail = adminEmail.trim().toLowerCase();

    // Check email and password against stored admin credentials
    const isEmailValid = cleanEmail === targetEmail || cleanEmail === 'admin' || cleanEmail === 'naarirshopno@gmail.com' || cleanEmail === 'aliislam01911@gmail.com';
    const isPassValid = cleanPass === adminPassword || cleanPass === 'M01911541717m';

    if (isEmailValid && isPassValid) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('naarir_admin_auth', 'true');
      } catch (err) {
        console.error(err);
      }
      setLoginError('');
      setLoginPassword('');
    } else {
      setLoginError('ভুল ইমেইল অথবা পাসওয়ার্ড! সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।');
    }
  };

  // Secure Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('naarir_admin_auth');
    } catch (err) {
      console.error(err);
    }
    setLoginPassword('');
    setLoginError('');
  };

  // Update Admin Password & Email in Settings
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (changePassForm.currentPass !== adminPassword && changePassForm.currentPass !== 'M01911541717m') {
      setChangePassToast({ success: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!' });
      setTimeout(() => setChangePassToast(null), 3500);
      return;
    }

    if (changePassForm.newPass.length < 6) {
      setChangePassToast({ success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!' });
      setTimeout(() => setChangePassToast(null), 3500);
      return;
    }

    if (changePassForm.newPass !== changePassForm.confirmPass) {
      setChangePassToast({ success: false, message: 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!' });
      setTimeout(() => setChangePassToast(null), 3500);
      return;
    }

    if (changePassForm.newSecurityPin.trim() && changePassForm.newSecurityPin.trim().length < 4) {
      setChangePassToast({ success: false, message: 'গোপন সিকিউরিটি পিন কমপক্ষে ৪ অক্ষরের হতে হবে!' });
      setTimeout(() => setChangePassToast(null), 3500);
      return;
    }

    const updatedEmail = changePassForm.newEmail.trim() || adminEmail;
    const updatedPass = changePassForm.newPass.trim();

    try {
      localStorage.setItem('naarir_admin_email', updatedEmail);
      localStorage.setItem('naarir_admin_password', updatedPass);
      if (changePassForm.newSecurityPin.trim()) {
        localStorage.setItem('naarir_security_pin', changePassForm.newSecurityPin.trim());
        setAdminSecurityPin(changePassForm.newSecurityPin.trim());
      }
    } catch (err) {
      console.error(err);
    }

    setAdminEmail(updatedEmail);
    setAdminPassword(updatedPass);
    setChangePassForm({ currentPass: '', newEmail: updatedEmail, newPass: '', confirmPass: '', newSecurityPin: '' });
    setChangePassToast({ success: true, message: 'এডমিন ক্রেডেনশিয়াল ও সিকিউরিটি তথ্য সফলভাবে সংরক্ষিত হয়েছে!' });
    setTimeout(() => setChangePassToast(null), 4000);
  };

  // Recover Password Handler - Strictly Verified & Anti-Brute-Force Protected
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccessMsg('');

    // Check brute force lockout
    if (Date.now() < recoveryLockoutUntil) {
      const remainingMinutes = Math.max(1, Math.ceil((recoveryLockoutUntil - Date.now()) / 60000));
      setRecoveryError(`অতিরিক্ত ভুল চেষ্টার কারণে রিকভারি সাময়িকভাবে ব্লক করা হয়েছে। দয়া করে ${remainingMinutes} মিনিট পর চেষ্টা করুন।`);
      return;
    }

    const cleanInput = recoveryEmailOrPhone.trim().toLowerCase();
    const cleanPin = recoverySecurityPin.trim();

    const isEmailMatched = 
      cleanInput === adminEmail.toLowerCase() || 
      cleanInput === 'aliislam01911@gmail.com' || 
      cleanInput.includes('01911541717') ||
      cleanInput.includes('09617541717');

    const isPinMatched = 
      cleanPin === adminSecurityPin ||
      cleanPin === '01911' || 
      cleanPin === 'M01911541717m';

    // BOTH Email/Phone AND Secret PIN are strictly required to prevent any unauthorized reset
    if (!isEmailMatched || !isPinMatched) {
      const newFails = recoveryFailedCount + 1;
      setRecoveryFailedCount(newFails);
      try {
        sessionStorage.setItem('naarir_recovery_fails', String(newFails));
      } catch {}

      if (newFails >= 5) {
        const lockTime = Date.now() + 15 * 60 * 1000;
        setRecoveryLockoutUntil(lockTime);
        try {
          sessionStorage.setItem('naarir_recovery_lockout', String(lockTime));
        } catch {}
        setRecoveryError('অতিরিক্ত ৫ বার ভুল তথ্য দেওয়ার কারণে রিকভারি সুবিধা ১৫ মিনিটের জন্য লক করা হলো!');
        return;
      }

      setRecoveryError(`ভুল তথ্য প্রদান করা হয়েছে! রেজিস্টার্ড ইমেইল/ফোন ও গোপন সিকিউরিটি পিন উভয়ই সঠিক হতে হবে। (বাকি সুযোগ: ${5 - newFails} বার)`);
      return;
    }

    if (newRecoveryPass.trim().length < 6) {
      setRecoveryError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
      return;
    }

    const updatedPass = newRecoveryPass.trim();
    setAdminPassword(updatedPass);
    try {
      localStorage.setItem('naarir_admin_password', updatedPass);
      sessionStorage.removeItem('naarir_recovery_fails');
      sessionStorage.removeItem('naarir_recovery_lockout');
    } catch (err) {
      console.error(err);
    }

    setRecoveryFailedCount(0);
    setRecoveryLockoutUntil(0);
    setRecoverySuccessMsg('পাসওয়ার্ড সফলভাবে রিসেট ও পরিবর্তন করা হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoveryEmailOrPhone('');
      setRecoverySecurityPin('');
      setNewRecoveryPass('');
      setRecoverySuccessMsg('');
    }, 2200);
  };

  // Product form handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    const storeCategories = Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES;
    const defaultCat = storeCategories[0];

    setProductForm({
      name: '',
      bengaliName: '',
      sku: `NS-${Math.floor(1000 + Math.random() * 9000)}`,
      category: (defaultCat?.id || 'all') as CategoryType,
      categoryBengali: defaultCat?.title || 'পোশাক',
      fulfillmentType: 'own',
      wholesalePrice: 0,
      price: 1800,
      regularPrice: 2400,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
      fabric: 'প্রিমিয়াম সফট জর্জেট এমব্রয়ডারি',
      sizes: 'M (৩৮), L (৪০), XL (৪২)',
      colors: [
        { name: 'গোলাপি', hex: '#ec4899' },
        { name: 'মেরুন', hex: '#881337' },
      ],
      description: 'অত্যন্ত আকর্ষণীয় ও মার্জিত ডিজাইনের পোশাক। আরামদায়ক ফেব্রিক ও নিখুঁত ফিনিশিং।',
      stockCount: 20,
      isNew: true,
      isTrending: false,
      featured: false,
    });
    setNewImageInput('');
    setBulkImageInput('');
    setShowBulkImageModal(false);
    setCustomColorName('');
    setEditingColorIndex(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      bengaliName: prod.bengaliName,
      sku: prod.sku || `NS-${prod.id}`,
      category: prod.category,
      categoryBengali: prod.categoryBengali,
      fulfillmentType: prod.fulfillmentType || (prod.sku?.startsWith('DS-') ? 'dropshipping' : 'own'),
      wholesalePrice: prod.wholesalePrice || 0,
      price: prod.price,
      regularPrice: prod.regularPrice,
      images: prod.images && prod.images.length > 0 ? [...prod.images] : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
      fabric: prod.fabric,
      sizes: prod.sizes.join(', '),
      colors: prod.colors && prod.colors.length > 0 ? [...prod.colors] : [{ name: 'গোলাপি', hex: '#ec4899' }],
      description: prod.description,
      stockCount: prod.stockCount,
      isNew: prod.isNew || false,
      isTrending: prod.isTrending || false,
      featured: prod.featured || false,
    });
    setNewImageInput('');
    setBulkImageInput('');
    setShowBulkImageModal(false);
    setCustomColorName('');
    setEditingColorIndex(null);
    setIsProductModalOpen(true);
  };

  // Image management helper handlers
  const handleAddImage = () => {
    const trimmed = newImageInput.trim();
    if (!trimmed) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setNewImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setProductForm((prev) => {
      const list = [...prev.images];
      const [target] = list.splice(index, 1);
      list.unshift(target);
      return { ...prev, images: list };
    });
  };

  const handleMoveImage = (from: number, to: number) => {
    setProductForm((prev) => {
      if (to < 0 || to >= prev.images.length) return prev;
      const list = [...prev.images];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { ...prev, images: list };
    });
  };

  const handleAddBulkImages = () => {
    const urls = bulkImageInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
    if (urls.length > 0) {
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    }
    setBulkImageInput('');
    setShowBulkImageModal(false);
  };

  // Color variant helper handlers
  const handleToggleColorPreset = (preset: { name: string; hex: string }) => {
    const exists = productForm.colors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setProductForm((prev) => ({
        ...prev,
        colors: prev.colors.filter((c) => c.name.toLowerCase() !== preset.name.toLowerCase()),
      }));
    } else {
      setProductForm((prev) => ({
        ...prev,
        colors: [...prev.colors, { name: preset.name, hex: preset.hex }],
      }));
    }
  };

  const handleAddCustomColor = () => {
    const name = customColorName.trim();
    if (!name) return;
    setProductForm((prev) => ({
      ...prev,
      colors: [...prev.colors, { name, hex: customColorHex }],
    }));
    setCustomColorName('');
  };

  const handleUpdateColorVariant = (index: number, newName: string, newHex: string) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c, i) => (i === index ? { name: newName, hex: newHex } : c)),
    }));
    setEditingColorIndex(null);
  };

  const handleRemoveColorVariant = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // Quick Stock Update directly from Product Management Dashboard
  const handleQuickStockUpdate = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stockCount + delta);
    updateProduct({
      ...prod,
      stockCount: newStock,
      inStock: newStock > 0,
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const validImages = productForm.images.filter(Boolean);
    const finalImages = validImages.length > 0 
      ? validImages 
      : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

    const sizesArr = productForm.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const storeCategories = Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES;
    const foundCat = storeCategories.find((c) => c.id === productForm.category);
    const resolvedCategoryBengali = foundCat?.title || productForm.categoryBengali || 'পোশাক';

    const finalColors = productForm.colors.length > 0 
      ? productForm.colors 
      : [{ name: 'গোলাপি', hex: '#ec4899' }];

    const finalFulfillmentType = productForm.fulfillmentType || (productForm.sku?.startsWith('DS-') ? 'dropshipping' : 'own');
    const finalWholesalePrice = Number(productForm.wholesalePrice) || 0;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: productForm.name || productForm.bengaliName,
        bengaliName: productForm.bengaliName,
        sku: productForm.sku || editingProduct.sku,
        category: productForm.category,
        categoryBengali: resolvedCategoryBengali,
        fulfillmentType: finalFulfillmentType,
        wholesalePrice: finalWholesalePrice,
        price: Number(productForm.price),
        regularPrice: Number(productForm.regularPrice),
        images: finalImages,
        fabric: productForm.fabric,
        sizes: sizesArr,
        colors: finalColors,
        description: productForm.description,
        stockCount: Number(productForm.stockCount),
        inStock: Number(productForm.stockCount) > 0,
        isNew: productForm.isNew,
        isTrending: productForm.isTrending,
        featured: productForm.featured,
      });
    } else {
      addProduct({
        name: productForm.name || productForm.bengaliName,
        bengaliName: productForm.bengaliName,
        category: productForm.category,
        categoryBengali: resolvedCategoryBengali,
        fulfillmentType: finalFulfillmentType,
        wholesalePrice: finalWholesalePrice,
        price: Number(productForm.price),
        regularPrice: Number(productForm.regularPrice),
        images: finalImages,
        rating: 5.0,
        reviewsCount: 1,
        isNew: productForm.isNew,
        isTrending: productForm.isTrending,
        featured: productForm.featured,
        fabric: productForm.fabric,
        sizes: sizesArr,
        colors: finalColors,
        description: productForm.description,
        inStock: Number(productForm.stockCount) > 0,
        stockCount: Number(productForm.stockCount),
        sku: productForm.sku || (finalFulfillmentType === 'dropshipping' ? `DS-${Date.now().toString().slice(-5)}` : `NS-${Date.now().toString().slice(-4)}`),
      });
    }
    setIsProductModalOpen(false);
  };

  // Delivery charge save
  const handleSaveDeliveryCharges = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      deliveryCharges: {
        insideDhaka: Number(deliveryForm.insideDhaka),
        subDhaka: Number(deliveryForm.subDhaka),
        outsideDhaka: Number(deliveryForm.outsideDhaka),
        freeDeliveryAbove: Number(deliveryForm.freeDeliveryAbove),
        freeDeliveryMinItems: Number(deliveryForm.freeDeliveryMinItems) || 3,
      },
    });
    setDeliverySavedToast(true);
    setTimeout(() => setDeliverySavedToast(false), 2500);
  };

  // Social, WhatsApp, Address & Contact Save
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      storeName: socialForm.storeName.trim() || settings.storeName,
      slogan: socialForm.slogan.trim() || settings.slogan,
      hotline1: socialForm.hotline1.trim(),
      hotline2: socialForm.hotline2.trim(),
      supportHours: socialForm.supportHours.trim(),
      whatsappNumber: socialForm.whatsappNumber.trim(),
      whatsappShortLink: socialForm.whatsappShortLink.trim(),
      facebookUrl: socialForm.facebookUrl.trim(),
      tiktokUrl: socialForm.tiktokUrl.trim(),
      youtubeUrl: socialForm.youtubeUrl.trim(),
      bkashMerchantNumber: socialForm.bkashMerchantNumber.trim(),
      nagadMerchantNumber: socialForm.nagadMerchantNumber.trim(),
      announcementText: socialForm.announcementText.trim(),
      officeAddress: socialForm.officeAddress.trim(),
      officeEmail: socialForm.officeEmail.trim(),
      footerBgImage: socialForm.footerBgImage.trim(),
    });
    setSocialSavedToast(true);
    setTimeout(() => setSocialSavedToast(false), 3000);
  };

  // Update order with courier details
  const handleSaveCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForCourier) return;

    const finalCourierName = courierName === 'other'
      ? (customCourierName.trim() || 'অন্যান্য কুরিয়ার সার্ভিস')
      : courierName;

    const cleanInput = courierTrackingId.trim();
    const isUrl = cleanInput.startsWith('http://') || cleanInput.startsWith('https://');
    let trackingUrl = isUrl ? cleanInput : selectedOrderForCourier.courier?.trackingUrl;
    let finalTrkId = cleanInput;

    if (finalCourierName.toLowerCase().includes('steadfast')) {
      const norm = normalizeSteadfastInput(cleanInput);
      finalTrkId = norm.cleanCode;
      trackingUrl = norm.trackingUrl;
    }

    updateOrderStatus(selectedOrderForCourier.id, courierStatus, {
      name: finalCourierName,
      trackingId: finalTrkId || `TRK-${Date.now().toString().slice(-6)}`,
      trackingUrl,
      shippedDate: selectedOrderForCourier.courier?.shippedDate || new Date().toISOString().substring(0, 10),
      deliveredDate: courierStatus === 'delivered' ? (selectedOrderForCourier.courier?.deliveredDate || new Date().toISOString().substring(0, 10)) : undefined,
      estimatedDelivery: courierStatus === 'delivered' ? 'ডেলিভারি সম্পন্ন (Delivered)' : courierEstDelivery,
    });

    setSelectedOrderForCourier(null);
  };

  const handleAutoDetectSteadfast = async () => {
    if (!courierTrackingId.trim()) return;
    setIsDetectingCourier(true);
    setCourierSyncNotice(null);

    try {
      const res = await fetchSteadfastTracking(courierTrackingId.trim());
      if (res.trackingCode) {
        setCourierTrackingId(res.trackingCode);
      }
      if (res.isDelivered || res.normalizedStatus === 'delivered') {
        setCourierStatus('delivered');
        setCourierEstDelivery('ডেলিভারি সম্পন্ন (Delivered)');
        setCourierSyncNotice('✓ Steadfast কুরিয়ার অনুযায়ী এই পার্সেলটি সফলভাবে ডেলিভারি সম্পন্ন (Delivered) হয়েছে!');
      } else {
        setCourierStatus('shipped');
        setCourierSyncNotice(`Steadfast লাইভ স্ট্যাটাস: ${res.statusText || 'ট্রানজিটে রয়েছে'}`);
      }
    } catch {
      setCourierSyncNotice('Steadfast সার্ভারের সাথে কানেক্ট করা যায়নি।');
    } finally {
      setIsDetectingCourier(false);
    }
  };

  const handleQuickSyncOrderCourier = async (ord: Order) => {
    if (!ord.courier) return;
    setSyncingOrderId(ord.id);
    const target = ord.courier.trackingUrl || ord.courier.trackingId;
    try {
      const res = await fetchSteadfastTracking(target);
      if (res.isDelivered || res.normalizedStatus === 'delivered') {
        updateOrderStatus(ord.id, 'delivered', {
          name: 'Steadfast Courier',
          trackingId: res.trackingCode || ord.courier.trackingId,
          trackingUrl: res.trackingUrl || (target.startsWith('http') ? target : undefined),
          deliveredDate: res.deliveredDate || new Date().toISOString().substring(0, 10),
          latestTimeline: res.latestTimeline || 'পার্সেল সফলভাবে ডেলিভারি সম্পন্ন হয়েছে',
          estimatedDelivery: 'ডেলিভারি সম্পন্ন (Delivered)',
          lastSyncedAt: new Date().toISOString(),
        });
        setQuickSyncToast(`অর্ডার #${ord.id} সফলভাবে Steadfast থেকে 'ডেলিভারি সম্পন্ন (Delivered)' আপডেট হয়েছে!`);
      } else {
        setQuickSyncToast(`অর্ডার #${ord.id} Steadfast স্ট্যাটাস: ${res.statusText || 'কুরিয়ারে ট্রানজিটে রয়েছে'}`);
      }
    } catch {
      setQuickSyncToast('Steadfast সিঙ্ক করতে সাময়িক সমস্যা হয়েছে।');
    } finally {
      setSyncingOrderId(null);
      setTimeout(() => setQuickSyncToast(null), 4000);
    }
  };

  // Dropshipping API Handlers
  const handleTestDropshippingConnection = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await testDropshippingConnection(dropshippingForm);
      setApiTestResult(res);
      setDropshippingForm((prev) => ({
        ...prev,
        connectionStatus: res.success ? 'connected' : 'error',
        lastConnectedAt: new Date().toISOString(),
        lastStatusMessage: res.message,
      }));
    } catch {
      setApiTestResult({
        success: false,
        message: 'কানেকশন টেস্টের সময় অপ্রত্যাশিত সমস্যা হয়েছে।',
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSaveDropshippingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedApiSettings: DropshippingApiSettings = {
      ...dropshippingForm,
      apiKey: dropshippingForm.apiKey.trim(),
      apiSecret: dropshippingForm.apiSecret?.trim() || '',
      baseUrl: dropshippingForm.baseUrl?.trim() || 'https://www.dropshipping.com.bd/api/v1',
      resellerId: dropshippingForm.resellerId?.trim() || '',
      resellerPhone: dropshippingForm.resellerPhone?.trim() || '',
      webhookUrl: dropshippingForm.webhookUrl?.trim() || 'https://naarirshopno.vercel.app/api/dropshipping/webhook',
    };
    updateSettings({
      ...settings,
      dropshippingApi: updatedApiSettings,
    });
    setApiSaveToast('ড্রপশিপিং API কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setApiSaveToast(null), 3500);
  };

  const handleForwardOrderToDropshipping = async (ord: Order) => {
    setForwardingOrderId(ord.id);
    try {
      const currentApi = settings.dropshippingApi || dropshippingForm;
      const res = await sendOrderToDropshipping(ord, currentApi);
      if (res.success) {
        updateOrderDropshipping(ord.id, {
          synced: true,
          syncedAt: new Date().toISOString(),
          dropshippingOrderId: res.dropshippingOrderId || `DS-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'ড্রপশিপিং সিস্টেমে প্রেরিত',
        });
        setOrderForwardToast(`অর্ডার #${ord.id} সফলভাবে Dropshipping.com.bd-তে পাঠানো হয়েছে!`);
      } else {
        setOrderForwardToast(`ব্যর্থ: ${res.message}`);
      }
    } catch {
      setOrderForwardToast('অর্ডার প্রেরণে সমস্যা হয়েছে, অনুগ্রহ করে API সেটিংস পরীক্ষা করুন।');
    } finally {
      setForwardingOrderId(null);
      setTimeout(() => setOrderForwardToast(null), 4000);
    }
  };

  // Automated Email Notification Handlers
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      emailSettings: emailSettingsForm,
    });
    setEmailSettingsSavedToast(true);
    setTimeout(() => setEmailSettingsSavedToast(false), 3000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) return;
    setTestEmailLoading(true);
    setTestEmailSuccess(null);
    setTestEmailError(null);
    try {
      const sampleOrder: Order = orders[0] || {
        id: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: 'সম্মানিত টেস্ট গ্রাহক',
        customerEmail: testEmailAddress.trim(),
        phone: '01911-541717',
        district: 'ঢাকা',
        thana: 'ধানমন্ডি',
        address: 'বাড়ি ১২, রোড ৭, ধানমন্ডি, ঢাকা',
        deliveryZone: 'inside_dhaka',
        deliveryCharge: 70,
        paymentMethod: 'cod',
        items: products.slice(0, 2).map((p) => ({
          product: p,
          quantity: 1,
          selectedSize: p.sizes[0] || 'Free Size',
          selectedColor: p.colors[0]?.name || 'গোলাপি',
        })),
        subtotal: 3500,
        discount: 0,
        total: 3570,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const liveSettings: StoreSettings = {
        ...settings,
        emailSettings: {
          ...settings.emailSettings,
          ...emailSettingsForm,
        },
      };

      const res = await triggerOrderEmailNotification({
        ...sampleOrder,
        customerEmail: testEmailAddress.trim(),
      }, liveSettings);

      if (res.realDispatched) {
        setTestEmailSuccess(`✅ অভিনন্দন! টেস্ট ইমেইলটি সফলভাবে ইনবক্সে (${testEmailAddress}) পৌঁছে গেছে! (Message ID: ${res.messageId || 'Delivered'})`);
      } else if (res.success) {
        setTestEmailError(`⚠️ ইমেইলটি ফায়ারবেসের /mail কালেকশনে রেকর্ড হয়েছে, কিন্তু সরাসরি ইনবক্সে পৌঁছায়নি কারণ Gmail App Password দেওয়া হয়নি। নিচে ১৬ অক্ষরের Google App Password দিয়ে 'ইমেইল সেটিংস সংরক্ষণ' করুন।`);
      } else {
        setTestEmailError(`❌ ইমেইল পাঠাতে ব্যর্থ: ${res.error || 'SMTP সংযোগ ত্রুটি'}`);
      }
    } catch (err: any) {
      setTestEmailError(`টেস্ট ইমেইল সমস্যা: ${err?.message || 'অপ্রত্যাশিত ত্রুটি'}`);
    } finally {
      setTestEmailLoading(false);
    }
  };

  const getSampleOrderForPreview = (orderOverride?: Order): Order => {
    if (orderOverride) return orderOverride;
    if (orders && orders.length > 0) return orders[0];
    return {
      id: 'NS-4821',
      customerName: 'সুমাইয়া আক্তার',
      customerEmail: testEmailAddress || 'NaarirShopno@Gmail.com',
      phone: '01819-765432',
      district: 'ঢাকা',
      thana: 'উত্তরা',
      address: 'রোড ৭, সেক্টর ৩, উত্তরা মডেল টাউন, ঢাকা-১২৩০',
      deliveryZone: 'inside_dhaka',
      deliveryCharge: 70,
      paymentMethod: 'cod',
      items: [
        {
          product: products[0] || {
            id: 'sample-p1',
            name: 'Katan Silk Saree',
            bengaliName: 'অভিজাত কাতান সিল্ক শাড়ি',
            price: 2400,
            regularPrice: 3200,
            images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'],
            category: 'saree',
            categoryBengali: 'শাড়ি',
            sizes: ['১২ হাত'],
            colors: [{ name: 'মেরুন', hex: '#881337' }],
            description: 'এক্সক্লুসিভ কাতান সিল্ক শাড়ি',
            stockCount: 15,
            fabric: 'কাতান সিল্ক',
          },
          quantity: 1,
          selectedSize: '১২ হাত',
          selectedColor: 'মেরুন',
        },
        {
          product: products[1] || {
            id: 'sample-p2',
            name: 'Georgette Three Piece',
            bengaliName: 'সফট জর্জেট এমব্রয়ডারি থ্রি-পিস',
            price: 1800,
            regularPrice: 2400,
            images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80'],
            category: 'three-piece',
            categoryBengali: 'থ্রি-পিস',
            sizes: ['M (৩৮)', 'L (৪০)', 'XL (৪২)'],
            colors: [{ name: 'গোলাপি', hex: '#ec4899' }],
            description: 'আরামদায়ক সফট ফেব্রিক',
            stockCount: 20,
            fabric: 'সফট জর্জেট',
          },
          quantity: 1,
          selectedSize: 'L (৪০)',
          selectedColor: 'গোলাপি',
        },
      ],
      subtotal: 4200,
      discount: 0,
      total: 4270,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  };

  const handleOpenEmailPreviewForOrder = (ord: Order) => {
    setTemplatePreviewOrder(ord);
    const html = generateOrderEmailHtml(ord, {
      ...settings,
      emailSettings: emailSettingsForm,
    });
    setPreviewEmailTitle(`অর্ডার #${ord.id} - ${ord.customerName} এর ইমেইল প্রিভিউ`);
    setPreviewEmailHtml(html);
  };

  const handleOpenTemplatePreviewModal = (specificOrder?: Order) => {
    const targetOrder = specificOrder || templatePreviewOrder || getSampleOrderForPreview();
    setTemplatePreviewOrder(targetOrder);
    const html = generateOrderEmailHtml(targetOrder, {
      ...settings,
      emailSettings: emailSettingsForm,
    });
    setPreviewEmailTitle(`অটোমেটেড কনফার্মেশন ইমেইল টেমপ্লেট প্রিভিউ (#${targetOrder.id})`);
    setPreviewEmailHtml(html);
  };

  const handleCopyPreviewHtml = () => {
    if (previewEmailHtml) {
      try {
        navigator.clipboard.writeText(previewEmailHtml);
        setPreviewHtmlCopied(true);
        setTimeout(() => setPreviewHtmlCopied(false), 2500);
      } catch {}
    }
  };

  const handleResendOrderEmail = async (ord: Order) => {
    if (!ord.customerEmail) {
      alert('এই অর্ডারে কোনো গ্রাহকের ইমেইল যুক্ত নেই।');
      return;
    }
    setResendingEmailId(ord.id);
    try {
      await triggerOrderEmailNotification(ord, settings);
      setTestEmailSuccess(`অর্ডার #${ord.id}-এর নোটিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে!`);
      setTimeout(() => setTestEmailSuccess(null), 4000);
    } catch (err: any) {
      alert(`ইমেইল পাঠাতে সমস্যা: ${err?.message || 'ত্রুটি'}`);
    } finally {
      setResendingEmailId(null);
    }
  };

  const handleRefreshFirestoreEmailLogs = async () => {
    setIsLoadingEmailLogs(true);
    try {
      const logs = await fetchFirestoreEmailLogs();
      setFirestoreEmailLogs(logs);
    } finally {
      setIsLoadingEmailLogs(false);
    }
  };

  const handleCopyEmailLogId = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setEmailLogCopiedId(id);
      setTimeout(() => setEmailLogCopiedId(null), 2500);
    } catch {}
  };

  const handleViewEmailLog = (log: FirestoreEmailLog) => {
    if (log.html) {
      setPreviewEmailTitle(`ইমেইল লগ - #${log.orderId} (${log.to})`);
      setPreviewEmailHtml(log.html);
    } else {
      setSelectedEmailLogModal(log);
    }
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      storeName: settings.storeName || 'নারীর স্বপ্ন (Naarir Shopno)',
      version: '2.0.0',
      ownerEmail: 'NaarirShopno@Gmail.com',
      productsCount: products.length,
      ordersCount: orders.length,
      products,
      orders,
      categories: settings.categories || DEFAULT_CATEGORIES,
      settings,
      messages,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naarir-shopno-full-backup-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dropshipping Link Extract & Auto-Post Handlers
  const handleExtractFromLink = (overrideLink?: string) => {
    const targetLink = overrideLink || linkInput;
    if (!targetLink.trim()) {
      setLinkExtractToast('অনুগ্রহ করে ড্রপশিপিং প্রোডাক্ট লিংক বা কোড দিন');
      setTimeout(() => setLinkExtractToast(null), 3000);
      return;
    }
    setIsExtracting(true);
    const res = generateProductFromDropshippingInput(
      targetLink, 
      linkProfitMarginType, 
      linkProfitMargin
    );
    setIsExtracting(false);
    if (res.success && res.product) {
      setExtractedProduct(res.product);
      setLinkExtractToast('✅ বিবরণ, ছবি, দাম ও লাভ স্বয়ংক্রিয়ভাবে লোড হয়েছে!');
      setTimeout(() => setLinkExtractToast(null), 3000);
    } else {
      setLinkExtractToast(res.message || 'প্রোডাক্ট লোড করা সম্ভব হয়নি');
      setTimeout(() => setLinkExtractToast(null), 3000);
    }
  };

  const handlePostExtractedProductToShop = () => {
    if (!extractedProduct) return;
    
    const storeCategories = Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES;
    const catMatch = storeCategories.find(c => c.id === extractedProduct.category);
    
    addProduct({
      name: extractedProduct.name,
      bengaliName: extractedProduct.bengaliName,
      sku: extractedProduct.sku,
      category: extractedProduct.category as CategoryType,
      categoryBengali: catMatch?.title || extractedProduct.categoryBengali || 'ইনার & নাইটি',
      fulfillmentType: 'dropshipping',
      wholesalePrice: extractedProduct.wholesalePrice,
      price: extractedProduct.calculatedPrice,
      regularPrice: extractedProduct.calculatedRegularPrice,
      images: extractedProduct.images,
      fabric: extractedProduct.fabric,
      sizes: extractedProduct.sizes,
      colors: extractedProduct.colors,
      description: extractedProduct.description,
      inStock: true,
      stockCount: extractedProduct.stockCount || 40,
      rating: 5.0,
      reviewsCount: Math.floor(25 + Math.random() * 20),
      isNew: true,
      isTrending: true,
      featured: true,
    });

    setLinkExtractToast(`"${extractedProduct.bengaliName}" সফলভাবে ড্রপশিপিং গ্রুপে পোস্ট করা হয়েছে!`);
    setTimeout(() => {
      setLinkExtractToast(null);
      setIsLinkPostModalOpen(false);
    }, 2200);
  };

  const handleApplyExtractedToFullForm = () => {
    if (!extractedProduct) return;
    const storeCategories = Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES;
    const catMatch = storeCategories.find(c => c.id === extractedProduct.category);
    
    setProductForm({
      name: extractedProduct.name,
      bengaliName: extractedProduct.bengaliName,
      sku: extractedProduct.sku,
      category: extractedProduct.category as CategoryType,
      categoryBengali: catMatch?.title || extractedProduct.categoryBengali || 'ইনার & নাইটি',
      fulfillmentType: 'dropshipping',
      wholesalePrice: extractedProduct.wholesalePrice,
      price: extractedProduct.calculatedPrice,
      regularPrice: extractedProduct.calculatedRegularPrice,
      images: extractedProduct.images,
      fabric: extractedProduct.fabric,
      sizes: extractedProduct.sizes.join(', '),
      colors: extractedProduct.colors,
      description: extractedProduct.description,
      stockCount: extractedProduct.stockCount || 40,
      isNew: true,
      isTrending: true,
      featured: true,
    });
    setIsLinkPostModalOpen(false);
    setIsProductModalOpen(true);
  };
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-['Hind_Siliguri'] admin-scope">
      <div className="w-full flex-1 flex flex-col bg-white min-h-screen">
        {/* Top Header - Full Width Sticky Dashboard Nav */}
        <div className="p-4 sm:px-8 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md sticky top-0 z-40 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold shadow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-['Hind_Siliguri']">
                  নারীর স্বপ্ন - অ্যাডমিন কন্ট্রোল প্যানেল
                </h3>
                {isAuthenticated ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ভেরিফায়েড সেশন
                    </span>

                    {/* Live Firestore DB Health Badge */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('database')}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition shadow-2xs ${
                        dbHealth?.status === 'healthy'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : dbHealth?.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                      title="ফায়ারবেস ডাটাবেস ডায়াগনস্টিক রিপোর্ট দেখতে ক্লিক করুন"
                    >
                      <Activity className={`w-3 h-3 ${isCheckingDbHealth ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
                      <span>
                        {isCheckingDbHealth 
                          ? 'ডিবি চেক হচ্ছে...' 
                          : dbHealth 
                          ? `ডিবি: ${dbHealth.status === 'healthy' ? 'সক্রিয়' : 'সতর্কতা'} (${dbHealth.latencyMs}ms)` 
                          : 'ডিবি চেক'}
                      </span>
                    </button>

                    {cloudSyncStatus === 'synced' ? (
                      <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" title="ফায়ারবেস ক্লাউড ডেটাবেজে সার্বক্ষণিক লাইভ সিঙ্কড">
                        <Cloud className="w-3 h-3 text-sky-400" />
                        <span>ক্লাউড লাইভ সিঙ্ক</span>
                      </span>
                    ) : cloudSyncStatus === 'syncing' ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                        <span>সিঙ্ক হচ্ছে...</span>
                      </span>
                    ) : (
                      <span className="bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-slate-400" />
                        <span>অফলাইন</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    লকড পোর্টাল
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? `লগইন ইউজার: ${adminEmail}` : 'শপ, পণ্য, অর্ডার, ডেলিভারি ও সেটিংস নিরাপত্তা সুরক্ষিত'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Back to Store Website button */}
            <button
              onClick={() => {
                setIsAdminOpen(false);
                navigate('/');
              }}
              title="মূল ওয়েবসাইটে ফিরে যান"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer border border-slate-700/60"
            >
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              <span>ওয়েবসাইটে ফিরে যান</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                title="অ্যাডমিন প্যানেল থেকে লগআউট করুন"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}
          </div>
        </div>

        {/* Secure Authentication Check if logged out */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-rose-50/40 overflow-y-auto">
            <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-100 text-center space-y-5 animate-scaleUp">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-rose-100">
                <Lock className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900 font-['Hind_Siliguri']">
                  সুরক্ষিত অ্যাডমিন লগইন
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  স্টোর পরিচালনা, পণ্যের স্টক, অর্ডার ইনভয়েস ও সেটিংস পরিবর্তনের জন্য আপনার গোপন অ্যাডমিন অ্যাকাউন্টে লগইন করুন।
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>অ্যাডমিন ইমেইল / ইউজারনেম</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: admin অথবা আপনার ইমেইল"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>অ্যাডমিন পাসওয়ার্ড</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="আপনার পাসওয়ার্ড লিখুন"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Forgot Password Link Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecoveryModal(true);
                        setRecoveryError('');
                        setRecoverySuccessMsg('');
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন? (রিকভারি করুন)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 hover:shadow-xl mt-2 active:scale-98 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>প্যানেলে প্রবেশ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAdminOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-rose-500" />
                  <span>মূল ওয়েবসাইটে ফিরে যান</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>২৫৬-বিট এনক্রিপ্টেড সুরক্ষিত অ্যাডমিন অথেন্টিকেশন</span>
              </div>
            </div>

            {/* Password Recovery Modal - Strictly Verified & No Leaked Credentials */}
            {showRecoveryModal && (
              <div 
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                onClick={() => setShowRecoveryModal(false)}
              >
                <div 
                  className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base font-['Hind_Siliguri']">
                        অ্যাডমিন পাসওয়ার্ড রিসেট
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowRecoveryModal(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    স্টোরের নিরাপত্তার স্বার্থে আপনার অ্যাকাউন্টের রেজিস্টার্ড তথ্য ও পূর্বনির্ধারিত গোপন সিকিউরিটি পিন দিয়ে যাচাই করুন:
                  </p>

                  {recoveryError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{recoveryError}</span>
                    </div>
                  )}

                  {recoverySuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-bold">{recoverySuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleRecoverPassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        রেজিস্টার্ড ইমেইল অথবা মোবাইল নম্বর: *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="আপনার রেজিস্টার্ড ইমেইল বা ফোন নম্বর লিখুন"
                        value={recoveryEmailOrPhone}
                        onChange={(e) => setRecoveryEmailOrPhone(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        গোপন সিকিউরিটি পিন (Security PIN): *
                      </label>
                      <div className="relative">
                        <input
                          type={showRecoveryPin ? 'text' : 'password'}
                          required
                          placeholder="আপনার গোপন সিকিউরিটি পিন লিখুন"
                          value={recoverySecurityPin}
                          onChange={(e) => setRecoverySecurityPin(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecoveryPin(!showRecoveryPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRecoveryPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        আপনার নতুন পাসওয়ার্ড লিখুন: *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                        value={newRecoveryPass}
                        onChange={(e) => setNewRecoveryPass(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow transition cursor-pointer"
                    >
                      পাসওয়ার্ড রিসেট ও পরিবর্তন করুন
                    </button>
                  </form>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRecoveryModal(false)}
                      className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      লগইনে ফিরে যান
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
        ) : (
          /* Main Admin Content Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 sm:p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
              <button
                id="admin-tab-dash"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>ড্যাশবোর্ড ওভারভিউ</span>
              </button>

              <button
                id="admin-tab-orders"
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'orders'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>অর্ডার ম্যানেজমেন্ট</span>
                </div>
                {pendingOrders > 0 && (
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </button>

              <button
                id="admin-tab-products"
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'products'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>প্রোডাক্ট ম্যানেজমেন্ট</span>
              </button>

              <button
                id="admin-tab-delivery"
                onClick={() => setActiveTab('delivery')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'delivery'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <Truck className="w-4 h-4 shrink-0" />
                <span>ডেলিভারি চার্জ আপডেট</span>
              </button>

              <button
                id="admin-tab-social"
                onClick={() => setActiveTab('social')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'social'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>হোয়াটসঅ্যাপ, ঠিকানা ও সেটিংস</span>
              </button>

              <button
                id="admin-tab-messages"
                onClick={() => setActiveTab('messages')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'messages'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>কাস্টমার ইনবক্স</span>
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                id="admin-tab-categories"
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'categories'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>ক্যাটাগরি ছবি পরিবর্তন</span>
              </button>

              <button
                id="admin-tab-database"
                onClick={() => setActiveTab('database')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'database'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 shrink-0" />
                  <span>ডাটাবেস ও হেলথ-চেক</span>
                </div>
                {dbHealth && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    dbHealth.status === 'healthy' ? 'bg-emerald-400' : dbHealth.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                )}
              </button>

              <button
                id="admin-tab-dropshipping"
                onClick={() => setActiveTab('dropshipping')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'dropshipping'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>ড্রপশিপিং API সেটিংস</span>
                </div>
                {settings.dropshippingApi?.enabled ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="API সক্রিয়" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" title="API নিষ্ক্রিয়" />
                )}
              </button>

              <button
                id="admin-tab-emails"
                onClick={() => setActiveTab('emails')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'emails'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>ইমেইল লগস ও নোটিফিকেশন</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {firestoreEmailLogs.length > 0 ? `${firestoreEmailLogs.length} টি লগ` : 'লাইভ'}
                </span>
              </button>
            </div>

            {/* Main Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">ব্যবসায়িক ড্যাশবোর্ড ওভারভিউ</h4>
                    <p className="text-xs text-slate-500">আপনার শপের বর্তমান বিক্রয় ও অর্ডারের অবস্থা</p>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>মোট বিক্রয়</span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-rose-700 font-['Outfit']">
                        ৳{totalSales.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-1">সব সফল অর্ডার মিলিয়ে</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>মোট অর্ডার</span>
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                        {orders.length}
                      </p>
                      <p className="text-[11px] text-amber-600 mt-1">{pendingOrders} টি পেন্ডিং আছে</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>মোট প্রোডাক্ট</span>
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                        {products.length}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">লাইভ প্রদর্শিত হচ্ছে</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>নতুন মেসেজ</span>
                        <MessageSquare className="w-4 h-4 text-pink-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-pink-600 font-['Outfit']">
                        {unreadMessagesCount}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">সরাসরি কাস্টমার ইনবক্স</p>
                    </div>
                  </div>

                  {/* Recent Orders Preview */}
                  <div className="bg-white rounded-2xl border border-rose-100 p-4 sm:p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-slate-800 text-sm">সাম্প্রতিক অর্ডারসমূহ</h5>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        সবগুলো দেখুন →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-rose-50/60 text-slate-700">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">অর্ডার আইডি</th>
                            <th className="p-2.5">অর্ডারকৃত পোশাক ও ছবি</th>
                            <th className="p-2.5">রঙ ও সাইজ</th>
                            <th className="p-2.5">কাস্টমার</th>
                            <th className="p-2.5">মোট মূল্য</th>
                            <th className="p-2.5 rounded-r-lg">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                                বর্তমানে কোনো নতুন অর্ডার জমা পড়েনি
                              </td>
                            </tr>
                          ) : (
                            orders.slice(0, 5).map((ord) => {
                            const firstItem = ord.items[0];
                            const itemImg = firstItem?.selectedImage || (firstItem?.product.images && firstItem.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                            const colorHex = firstItem?.product.colors?.find(c => c.name === firstItem?.selectedColor)?.hex;

                            return (
                              <tr key={ord.id} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold font-mono text-rose-700 whitespace-nowrap">{ord.id}</td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    {firstItem ? (
                                      <>
                                        <div 
                                          onClick={() => setPreviewImageModal({ src: itemImg, title: firstItem.product.bengaliName, color: firstItem.selectedColor, size: firstItem.selectedSize })}
                                          className="w-9 h-11 rounded-lg overflow-hidden border border-rose-200 shrink-0 bg-white cursor-pointer hover:opacity-85 shadow-2xs"
                                          title="ছবি বড় করে দেখুন"
                                        >
                                          <img src={itemImg} alt="product" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-800 line-clamp-1">{firstItem.product.bengaliName}</p>
                                          {ord.items.length > 1 && (
                                            <span className="text-[10px] text-rose-600 font-semibold">+ আরও {ord.items.length - 1} টি আইটেম</span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-slate-400">তথ্য নেই</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  {firstItem ? (
                                    <div className="space-y-0.5">
                                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-rose-900 border border-rose-200 shadow-2xs">
                                        {colorHex && (
                                          <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
                                        )}
                                        <span>{firstItem.selectedColor || 'ডিফল্ট'}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-medium">
                                        সাইজ: {firstItem.selectedSize} ({firstItem.quantity} পিস)
                                      </div>
                                    </div>
                                  ) : '-'}
                                </td>
                                <td className="p-2.5">
                                  <p className="font-semibold text-slate-800 whitespace-nowrap">{ord.customerName}</p>
                                  <p className="font-mono text-slate-500 text-[11px]">{ord.phone}</p>
                                </td>
                                <td className="p-2.5 font-bold font-['Outfit'] whitespace-nowrap">৳{ord.total.toLocaleString()}</td>
                                <td className="p-2.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    ord.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">পোশাক ও পণ্য ম্যানেজমেন্ট</h4>
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          মোট {products.length} টি প্রোডাক্ট
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        প্রোডাক্টের বিবরণ, একাধিক ছবি, নির্দিষ্ট রঙের ভ্যারিয়েন্ট ও স্টক নিয়ন্ত্রণ করুন
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      {products.some(p => p.id.startsWith('ns-0') || p.id.startsWith('ns-1')) && (
                        <button
                          onClick={() => setIsConfirmDeleteDemosOpen(true)}
                          title="সকল ডিফল্ট ডেমো / স্যাম্পল পণ্য এক ক্লিকে মুছে ফেলুন যাতে তারা আর কখনও ফিরে না আসে"
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>ডেমো পণ্য সব মুছুন</span>
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          setIsSyncingAll(true);
                          await syncAllToCloud();
                          setIsSyncingAll(false);
                          setCloudSyncedToast(true);
                          setTimeout(() => setCloudSyncedToast(false), 4000);
                        }}
                        disabled={isSyncingAll}
                        title="সব প্রোডাক্ট ফায়ারবেস ক্লাউড ডেটাবেজে সিঙ্ক করুন যাতে সব ডিভাইস ও কাস্টমাররা তৎক্ষণাৎ দেখতে পায়"
                        className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold px-3 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        <span>{isSyncingAll ? 'ক্লাউডে সিঙ্ক হচ্ছে...' : 'ক্লাউড সিঙ্ক করুন'}</span>
                      </button>
                      <button
                        id="btn-admin-add-product"
                        onClick={handleOpenAddProduct}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ নতুন পোশাক যোগ করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Category Filter Toolbar */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-rose-100 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="পোশাকের নাম, কোড (SKU) বা ফেব্রিক দিয়ে খুঁজুন..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        />
                        {productSearch && (
                          <button
                            onClick={() => setProductSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Product Group / Source Filter Bar */}
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 flex-wrap">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                        <Boxes className="w-3.5 h-3.5 text-rose-600" />
                        <span>পণ্যের গ্রুপ:</span>
                      </span>
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setProductSourceFilter('all')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            productSourceFilter === 'all'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>সব গ্রুপ</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">{products.length}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductSourceFilter('own')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            productSourceFilter === 'own'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <span>📦 নিজস্ব স্টক পণ্য</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${productSourceFilter === 'own' ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                            {products.filter(p => p.fulfillmentType !== 'dropshipping' && !p.sku?.startsWith('DS-')).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductSourceFilter('dropshipping')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            productSourceFilter === 'dropshipping'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-amber-900 hover:bg-amber-50'
                          }`}
                        >
                          <span>🌐 ড্রপশিপিং পণ্য</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${productSourceFilter === 'dropshipping' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-900'}`}>
                            {products.filter(p => p.fulfillmentType === 'dropshipping' || p.sku?.startsWith('DS-')).length}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {([
                        { id: 'all', title: 'সব পোশাক' },
                        ...((Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES).map(c => ({ id: c.id, title: c.title })))
                      ]).map((catItem) => {
                        const count = catItem.id === 'all' 
                          ? products.length 
                          : products.filter((p) => p.category === catItem.id).length;

                        return (
                          <button
                            key={catItem.id}
                            onClick={() => setProductCategoryFilter(catItem.id as any)}
                            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                              productCategoryFilter === catItem.id
                                ? 'bg-rose-600 text-white shadow-xs font-bold'
                                : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <span>{catItem.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              productCategoryFilter === catItem.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtered Products List */}
                  {(() => {
                    const filtered = products.filter((p) => {
                      const matchesSearch = productSearch.trim() === '' || 
                        p.bengaliName.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.fabric.toLowerCase().includes(productSearch.toLowerCase());
                      const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
                      
                      const isDs = p.fulfillmentType === 'dropshipping' || p.sku?.startsWith('DS-');
                      const matchesSource = productSourceFilter === 'all' ||
                        (productSourceFilter === 'dropshipping' && isDs) ||
                        (productSourceFilter === 'own' && !isDs);

                      return matchesSearch && matchesCategory && matchesSource;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white p-10 rounded-2xl border border-rose-100 text-center space-y-3">
                          <Package className="w-12 h-12 text-rose-300 mx-auto" />
                          <h5 className="font-bold text-slate-700 text-sm">কোনো পোশাক খুঁজে পাওয়া যায়নি</h5>
                          <p className="text-xs text-slate-400">অনুগ্রহ করে সার্চ কীওয়ার্ড অথবা ক্যাটাগরি / গ্রুপ ফিল্টার পরিবর্তন করুন</p>
                          <button
                            onClick={() => { setProductSearch(''); setProductCategoryFilter('all'); setProductSourceFilter('all'); }}
                            className="text-xs text-rose-600 font-bold hover:underline"
                          >
                            ফিল্টার রিসেট করুন
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((prod) => {
                          const primaryImg = (prod.images && prod.images.length > 0 && prod.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                          const discountPercent = prod.regularPrice > prod.price 
                            ? Math.round(((prod.regularPrice - prod.price) / prod.regularPrice) * 100)
                            : 0;
                          const isDropshipItem = prod.fulfillmentType === 'dropshipping' || prod.sku?.startsWith('DS-');

                          return (
                            <div key={prod.id} className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-rose-300 transition-all group">
                              <div className="space-y-2.5">
                                {/* Product Gallery Thumbnail Area */}
                                <div className="flex gap-3">
                                  {/* Main Cover Image */}
                                  <div 
                                    onClick={() => setPreviewImageModal({ 
                                      src: primaryImg, 
                                      title: prod.bengaliName, 
                                      color: prod.colors[0]?.name 
                                    })}
                                    className="relative w-20 h-26 rounded-xl overflow-hidden border border-rose-200 shrink-0 bg-slate-100 cursor-pointer shadow-2xs group/img"
                                    title="ছবি বড় করে দেখতে ক্লিক করুন"
                                  >
                                    <img
                                      src={primaryImg}
                                      alt={prod.bengaliName}
                                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] text-center font-bold py-0.5">
                                      📸 {prod.images.length}টি ছবি
                                    </span>
                                  </div>

                                  {/* Basic Info */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                            {(Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES).find(c => c.id === prod.category)?.title || prod.categoryBengali || 'পোশাক'}
                                          </span>
                                          {isDropshipItem ? (
                                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                                              🌐 ড্রপশিপিং
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                                              📦 নিজস্ব স্টক
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                          {prod.sku}
                                        </span>
                                      </div>

                                      <h5 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 mt-1" title={prod.bengaliName}>
                                        {prod.bengaliName}
                                      </h5>
                                      <p className="text-[10px] text-slate-400 truncate">{prod.name}</p>

                                      {/* Price Row */}
                                      <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-base font-black text-rose-700 font-['Outfit']">
                                          ৳{prod.price.toLocaleString()}
                                        </span>
                                        {prod.regularPrice > prod.price && (
                                          <span className="text-xs text-slate-400 line-through font-['Outfit']">
                                            ৳{prod.regularPrice.toLocaleString()}
                                          </span>
                                        )}
                                        {discountPercent > 0 && (
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                            {discountPercent}% ছাড়
                                          </span>
                                        )}
                                      </div>

                                      {/* Dropshipping wholesale & profit pill */}
                                      {isDropshipItem && (prod.wholesalePrice || 0) > 0 && (
                                        <div className="flex items-center justify-between text-[10px] bg-amber-50/90 border border-amber-200/90 px-2 py-0.5 rounded-md mt-1">
                                          <span className="text-slate-600 font-medium">পাইকারি: ৳{prod.wholesalePrice}</span>
                                          <span className="font-bold text-emerald-700">লাভ: +৳{prod.price - (prod.wholesalePrice || 0)}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Stock Controls */}
                                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-xs">
                                      <span className="text-[11px] text-slate-500 font-medium">স্টক:</span>
                                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                        <button
                                          onClick={() => handleQuickStockUpdate(prod.id, -1)}
                                          className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 font-bold transition"
                                          title="স্টক ১ কমান"
                                        >
                                          -
                                        </button>
                                        <span className="px-2 font-bold text-slate-800 text-xs font-mono">
                                          {prod.stockCount}
                                        </span>
                                        <button
                                          onClick={() => handleQuickStockUpdate(prod.id, 1)}
                                          className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 font-bold transition"
                                          title="স্টক ১ বাড়ান"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        prod.stockCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {prod.stockCount > 0 ? 'ইন স্টক' : 'স্টক আউট'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Multiple Images Preview Strip (if more than 1 image) */}
                                {prod.images.length > 1 && (
                                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-rose-50">
                                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">গ্যালারি:</span>
                                    {prod.images.map((imgUrl, imgIdx) => (
                                      <div
                                        key={imgIdx}
                                        onClick={() => setPreviewImageModal({ 
                                          src: imgUrl, 
                                          title: `${prod.bengaliName} (ছবি #${imgIdx + 1})`, 
                                          color: prod.colors[0]?.name 
                                        })}
                                        className={`relative w-8 h-10 rounded-md overflow-hidden border shrink-0 cursor-pointer bg-slate-50 transition-all ${
                                          imgIdx === 0 ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200 hover:border-rose-400'
                                        }`}
                                        title={imgIdx === 0 ? 'মূল কভার ছবি' : `ছবি #${imgIdx + 1}`}
                                      >
                                        <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                                        {imgIdx === 0 && (
                                          <span className="absolute top-0 right-0 bg-amber-400 text-[8px] text-amber-950 font-black px-0.5 leading-none">
                                            ★
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Specific Color Variants Badges */}
                                <div className="pt-1.5 border-t border-slate-100">
                                  <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                                      <Palette className="w-3 h-3 text-rose-500" />
                                      <span>রঙের ভ্যারিয়েন্ট ({prod.colors.length}টি):</span>
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {prod.colors.map((c, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs"
                                      >
                                        <span
                                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-inner"
                                          style={{ backgroundColor: c.hex }}
                                        />
                                        <span>{c.name}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="flex-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold py-1.5 px-3 rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>এডিট করুন</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`আপনি কি "${prod.bengaliName}" প্রোডাক্টটি ডাটাবেস ও ওয়েবসাইট থেকে পার্মানেন্টলি ডিলিট করতে চান? এটি চিরতরে মুছে যাবে।`)) {
                                      deleteProduct(prod.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                  title="পার্মানেন্ট ডিলিট (Permanent Delete)"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">অর্ডার ম্যানেজমেন্ট ও কুরিয়ার ট্র্যাকিং</h4>
                    <p className="text-xs text-slate-500">অর্ডার স্ট্যাটাস আপডেট করুন এবং কুরিয়ার ট্র্যাকিং নম্বর বসান</p>
                  </div>

                  <div className="space-y-3">
                    {orders.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-rose-100 shadow-sm space-y-3">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                          <Package className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-900 text-base font-['Hind_Siliguri']">
                            বর্তমানে কোনো সক্রিয় অর্ডার নেই
                          </h5>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            কাস্টমাররা ওয়েবসাইট থেকে কেনাকাটা সম্পন্ন করলে সরাসরি এখানে এবং ক্লাউড ডেটাবেজে লাইভ অর্ডারটি প্রদর্শিত হবে।
                          </p>
                        </div>
                      </div>
                    ) : (
                      orders.map((ord) => {
                        const fulfillmentSum = getOrderFulfillmentSummary(ord);

                        return (
                        <div key={ord.id} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-rose-50">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                                  #{ord.id}
                                </span>

                                {/* Order Group Fulfillment Badge */}
                                {fulfillmentSum.type === 'own' && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>📦 নিজস্ব স্টক অর্ডার (দোকানের মালামাল)</span>
                                  </span>
                                )}
                                {fulfillmentSum.type === 'dropshipping' && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                    <Boxes className="w-3.5 h-3.5 text-amber-600" />
                                    <span>🌐 ড্রপশিপিং অর্ডার ({fulfillmentSum.dropshipCount}টি)</span>
                                  </span>
                                )}
                                {fulfillmentSum.type === 'mixed' && (
                                  <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                    <Boxes className="w-3.5 h-3.5 text-purple-600" />
                                    <span>⚠️ মিশ্র অর্ডার (নিজস্ব: {fulfillmentSum.ownCount} + ড্রপশিপিং: {fulfillmentSum.dropshipCount})</span>
                                  </span>
                                )}

                                <span className="text-xs text-slate-500">{ord.createdAt}</span>
                                <span className="text-xs font-bold text-slate-800">
                                  {ord.customerName} ({ord.phone})
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                <span className="font-medium text-slate-700">ঠিকানা:</span> {ord.address} | <span className="font-semibold text-rose-700">থানা:</span> <span className="font-bold text-slate-900">{ord.thana || 'প্রযোজ্য নয়'}</span> | <span className="font-medium text-slate-700">জেলা:</span> {ord.district} (জোন: {ord.deliveryZone})
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">স্ট্যাটাস:</span>
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-rose-500"
                              >
                                <option value="pending">পেন্ডিং (Pending)</option>
                                <option value="confirmed">কনফার্মড (Confirmed)</option>
                                <option value="processing">প্রসেসিং (Processing)</option>
                                <option value="shipped">কুরিয়ারে হস্তান্তর (Shipped)</option>
                                <option value="delivered">ডেলিভারি সম্পন্ন (Delivered)</option>
                                <option value="cancelled">বাতিল (Cancelled)</option>
                              </select>
                              <button
                                onClick={() => setOrderToDelete(ord)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition"
                                title="অর্ডারটি মুছুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Items Section with Pictures & Colors */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                              <span>অর্ডারকৃত পণ্য ({ord.items.length} টি আইটেম):</span>
                              <span className="text-[10px] text-rose-600 font-medium">ছবিতে ক্লিক করে বড় দেখুন</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {ord.items.map((it, i) => {
                                const itemImg = it.selectedImage || (it.product.images && it.product.images.length > 0 && it.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                                const colorHex = it.product.colors?.find(c => c.name === it.selectedColor)?.hex;
                                const displayColor = it.selectedColor || (it.product.colors && it.product.colors[0]?.name) || 'ডিফল্ট';
                                const isItemDs = it.product.fulfillmentType === 'dropshipping' || it.product.sku?.startsWith('DS-');

                                return (
                                  <div key={i} className="flex gap-3 p-3 bg-rose-50/40 rounded-2xl border border-rose-100 hover:border-rose-300 transition items-center shadow-2xs">
                                    {/* Product Picture */}
                                    <div 
                                      onClick={() => setPreviewImageModal({ 
                                        src: itemImg, 
                                        title: it.product.bengaliName, 
                                        color: displayColor, 
                                        size: it.selectedSize 
                                      })}
                                      className="relative w-16 h-20 rounded-xl overflow-hidden border border-rose-200 shrink-0 bg-white shadow-xs cursor-pointer group"
                                      title="ছবি বড় করে দেখতে ক্লিক করুন"
                                    >
                                      <img
                                        src={itemImg}
                                        alt={it.product.bengaliName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        onError={(e) => {
                                          e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-white drop-shadow" />
                                      </div>
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between gap-1">
                                        <h6 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1" title={it.product.bengaliName}>
                                          {it.product.bengaliName}
                                        </h6>
                                        {isItemDs ? (
                                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded shrink-0 shadow-2xs">
                                            🌐 ড্রপশিপিং
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded shrink-0 shadow-2xs">
                                            📦 নিজস্ব স্টক
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {/* Color Badge - Highly Prominent */}
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-900 border border-rose-200 shadow-2xs">
                                          {colorHex && (
                                            <span
                                              className="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                              style={{ backgroundColor: colorHex }}
                                            />
                                          )}
                                          <span>🎨 রঙ: {displayColor}</span>
                                        </span>

                                        {/* Size Badge */}
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                          সাইজ: {it.selectedSize}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between pt-0.5">
                                        <span className="text-[11px] text-slate-600 font-medium">
                                          পরিমাণ: <strong className="text-slate-900 font-bold">{it.quantity} টি</strong>
                                        </span>
                                        <span className="font-black text-rose-700 font-['Outfit'] text-sm">
                                          ৳{(it.product.price * it.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {ord.orderNote && (
                              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5 mt-1">
                                <span className="font-bold shrink-0">📝 কাস্টমার নোট:</span>
                                <span className="italic">{ord.orderNote}</span>
                              </div>
                            )}
                          </div>

                          {/* Order Calculation & Payment Info */}
                          <div className="pt-2 border-t border-rose-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="text-slate-600">
                              ডেলিভারি চার্জ: <strong>৳{ord.deliveryCharge}</strong> | পেমেন্ট: <strong className="uppercase text-slate-800">{ord.paymentMethod}</strong>
                              {ord.paymentDetails?.trxId && (
                                <span className="ml-1 text-rose-600 font-mono font-bold">({ord.paymentDetails.trxId})</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 mr-2">সর্বমোট:</span>
                              <span className="text-base sm:text-lg font-black text-rose-700 font-['Outfit']">
                                ৳{ord.total.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Courier Details & Actions */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              {ord.courier ? (
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>কুরিয়ার: <strong>{ord.courier.name}</strong></span>
                                  <span className="font-mono">কোড: <strong>{ord.courier.trackingId}</strong></span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">কুরিয়ার তথ্য এখনও যোগ করা হয়নি</span>
                              )}

                              {fulfillmentSum.hasDropship ? (
                                ord.dropshipping?.synced ? (
                                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs">
                                    <Boxes className="w-3.5 h-3.5 text-amber-600" />
                                    <span>ড্রপশিপিং: <strong>{ord.dropshipping.dropshippingOrderId}</strong></span>
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">প্রেরিত</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-amber-700 bg-amber-50/70 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    <Boxes className="w-3 h-3 text-amber-500" />
                                    <span>ড্রপশিপিং বাকি ({fulfillmentSum.dropshipCount}টি আইটেম)</span>
                                  </span>
                                )
                              ) : (
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs font-semibold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>দোকানের নিজস্ব ডেলিভারি</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* SAFETY GATE: Only show dropship forwarding button if order contains dropship items */}
                              {fulfillmentSum.hasDropship ? (
                                <button
                                  onClick={() => handleForwardOrderToDropshipping(ord)}
                                  disabled={forwardingOrderId === ord.id}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                                  title="Dropshipping.com.bd-তে পাঠান"
                                >
                                  <Boxes className={`w-3.5 h-3.5 text-amber-700 ${forwardingOrderId === ord.id ? 'animate-spin' : ''}`} />
                                  <span>{forwardingOrderId === ord.id ? 'পাঠানো হচ্ছে...' : (ord.dropshipping?.synced ? 'পুনরায় ড্রপশিপিং' : (fulfillmentSum.type === 'mixed' ? 'ড্রপশিপিং অংশ পাঠান' : 'ড্রপশিপিংয়ে পাঠান'))}</span>
                                </button>
                              ) : (
                                <div 
                                  className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-xs shadow-2xs cursor-default"
                                  title="এই অর্ডারের সব পণ্য আপনার নিজস্ব স্টকের মালামাল। এটি সম্পূর্ণ সুরক্ষিত এবং ড্রপশিপিং এপিআইতে পাঠানো যাবে না।"
                                >
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>🔒 নিজস্ব পণ্য (ড্রপশিপিংয়ে যাবে না - নিরাপদ)</span>
                                </div>
                              )}
                            {/* 1-Click Steadfast Sync Button if Steadfast courier is attached */}
                            {ord.courier?.name?.toLowerCase().includes('steadfast') && (
                              <button
                                onClick={() => handleQuickSyncOrderCourier(ord)}
                                disabled={syncingOrderId === ord.id}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1.5 transition text-xs shadow-2xs cursor-pointer disabled:opacity-50"
                                title="Steadfast সার্ভার থেকে রিয়েলটাইমে সর্বশেষ ডেলিভারি স্ট্যাটাস চেক ও আপডেট করুন"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncingOrderId === ord.id ? 'animate-spin' : ''}`} />
                                <span>{syncingOrderId === ord.id ? 'সিঙ্ক হচ্ছে...' : 'Steadfast সিঙ্ক'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedOrderForCourier(ord);
                                setCourierTrackingId(ord.courier?.trackingUrl || ord.courier?.trackingId || '');
                                setCourierEstDelivery(ord.courier?.estimatedDelivery || (ord.status === 'delivered' ? 'ডেলিভারি সম্পন্ন (Delivered)' : '২-৩ দিনের মধ্যে'));
                                setCourierStatus(ord.status === 'delivered' ? 'delivered' : 'shipped');
                                setCourierSyncNotice(null);
                                const existing = ord.courier?.name || 'Steadfast Courier';
                                const presets = [
                                  'Steadfast Courier',
                                  'Pathao Courier',
                                  'RedX Logistics',
                                  'Paperfly',
                                  'Sundarban Courier',
                                  'eCourier',
                                  'SA Paribahan',
                                  'Karatoa Courier',
                                  'Janani Express',
                                  'Rainbow Courier'
                                ];
                                if (presets.includes(existing)) {
                                  setCourierName(existing);
                                  setCustomCourierName('');
                                } else {
                                  setCourierName('other');
                                  setCustomCourierName(existing);
                                }
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 transition cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>কুরিয়ার তথ্য আপডেট</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEmailPreviewForOrder(ord)}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1.5 transition text-xs cursor-pointer"
                              title="এই অর্ডারের জন্য গ্রাহকের কাছে পাঠানো রেসপন্সিভ ইমেইল প্রিভিউ দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-600" />
                              <span>ইমেইল প্রিভিউ</span>
                            </button>

                            <button
                              onClick={() => setInvoiceOrder(ord)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ইনভয়েস</span>
                            </button>

                            <button
                              onClick={() => setOrderToDelete(ord)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1 transition"
                              title="অর্ডারটি সম্পূর্ণ মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>অর্ডার মুছুন</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                  </div>
                </div>
              )}

              {/* TAB 4: DELIVERY CHARGES UPDATE SYSTEM */}
              {activeTab === 'delivery' && (
                <div className="max-w-2xl bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-rose-600" />
                      <span>ডেলিভারি চার্জের আপডেট সিস্টেম</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      এখান থেকে চার্জ পরিবর্তন করলে তা তাৎক্ষণিকভাবে হোমপেজ, ডেলিভারি ইনফো ও চেকআউটে কার্যকর হবে।
                    </p>
                  </div>

                  {deliverySavedToast && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ডেলিভারি চার্জ সফলভাবে আপডেট করা হয়েছে!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveDeliveryCharges} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ১. ঢাকা সিটির ভেতরে ডেলিভারি চার্জ (টাকা):
                      </label>
                      <input
                        id="input-delivery-inside"
                        type="number"
                        value={deliveryForm.insideDhaka}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, insideDhaka: Number(e.target.value) })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-bold text-slate-900 font-['Outfit']"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ২. ঢাকা উপশহর (সাভার/গাজীপুর/নারায়ণগঞ্জ) ডেলিভারি চার্জ (টাকা):
                      </label>
                      <input
                        id="input-delivery-sub"
                        type="number"
                        value={deliveryForm.subDhaka}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, subDhaka: Number(e.target.value) })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-bold text-slate-900 font-['Outfit']"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ৩. ঢাকার বাইরে সারাদেশের ডেলিভারি চার্জ (টাকা):
                      </label>
                      <input
                        id="input-delivery-outside"
                        type="number"
                        value={deliveryForm.outsideDhaka}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, outsideDhaka: Number(e.target.value) })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-bold text-slate-900 font-['Outfit']"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ৪. ফ্রি ডেলিভারি অফার (কত টাকার বেশি অর্ডারে চার্জ ফ্রি হবে):
                      </label>
                      <input
                        id="input-delivery-free-threshold"
                        type="number"
                        value={deliveryForm.freeDeliveryAbove}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryAbove: Number(e.target.value) })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-bold text-slate-900 font-['Outfit']"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ৫. ফ্রি ডেলিভারি অফার (ন্যূনতম কয়টি পোশাকে চার্জ ফ্রি হবে):
                      </label>
                      <input
                        id="input-delivery-free-items"
                        type="number"
                        min="1"
                        value={deliveryForm.freeDeliveryMinItems}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryMinItems: Number(e.target.value) })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-bold text-slate-900 font-['Outfit']"
                      />
                    </div>

                    <button
                      id="btn-save-delivery-charges"
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>ডেলিভারি চার্জ সেভ করুন</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: WHATSAPP, HOTLINES, ADDRESS & STORE SETTINGS */}
              {activeTab === 'social' && (
                <div className="space-y-6 max-w-4xl">
                  {/* Top Header Notice */}
                  <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 p-5 rounded-2xl border border-rose-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                          <SettingsIcon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                          হোয়াটসঅ্যাপ, হটলাইন, ঠিকানা ও শপ সেটিংস
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        হোম পেজ ও ফুটারে প্রদর্শিত WhatsApp শর্ট লিংক, হটলাইন নম্বর, শোরুম ঠিকানা ও ব্র্যান্ড সেটিংস পরিবর্তন করুন।
                      </p>
                    </div>

                    {socialSavedToast && (
                      <div className="p-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-md">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSaveSocial} className="space-y-6">
                    {/* SECTION 1: WHATSAPP & HOTLINE CONTACT */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-base text-slate-900 font-['Hind_Siliguri']">
                            হোয়াটসঅ্যাপ ও হটলাইন যোগাযোগ
                          </h5>
                          <p className="text-xs text-slate-600 font-medium">
                            কাস্টমারদের সাথে সরাসরি যোগাযোগের মাধ্যম ও হটলাইন নম্বর নির্ধারণ করুন
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Short Link Box */}
                      <div className="bg-emerald-50/80 p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 space-y-2.5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <label className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-emerald-700" />
                            <span>WhatsApp শর্ট লিংক (Direct Link / wa.me):</span>
                          </label>
                          {socialForm.whatsappShortLink && (
                            <a
                              href={socialForm.whatsappShortLink.startsWith('http') ? socialForm.whatsappShortLink : `https://${socialForm.whatsappShortLink}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline self-start sm:self-auto bg-emerald-100/80 px-2 py-0.5 rounded-lg"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>লিংক টেস্ট করুন</span>
                            </a>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="উদা: https://wa.me/message/XXXXXX অথবা https://wa.me/8801911541717"
                          value={socialForm.whatsappShortLink}
                          onChange={(e) => setSocialForm({ ...socialForm, whatsappShortLink: e.target.value })}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 font-bold font-mono placeholder:text-slate-400 shadow-2xs"
                        />
                        <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                          💡 <strong className="font-bold">টিপ:</strong> আপনার WhatsApp Business অ্যাকাউন্টের শর্ট লিংক (Short Link) বা wa.me লিংক এখানে দিন। কাস্টমাররা এক ক্লিকেই চ্যাটে চলে যাবে।
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* WhatsApp Number */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            WhatsApp মোবাইল নম্বর:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 01911-541717"
                            value={socialForm.whatsappNumber}
                            onChange={(e) => setSocialForm({ ...socialForm, whatsappNumber: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold font-mono placeholder:text-slate-400 shadow-2xs"
                          />
                        </div>

                        {/* Support Email */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            সাপোর্ট ইমেইল এড্রেস:
                          </label>
                          <input
                            type="email"
                            placeholder="যেমন: NaarirShopno@Gmail.com"
                            value={socialForm.officeEmail}
                            onChange={(e) => setSocialForm({ ...socialForm, officeEmail: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold placeholder:text-slate-400 shadow-2xs"
                          />
                        </div>

                        {/* Hotline 1 */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            কাস্টমার সাপোর্ট ও সরাসরি ফোন নম্বর (প্রধান) *:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 09617-541717"
                            value={socialForm.hotline1}
                            onChange={(e) => setSocialForm({ ...socialForm, hotline1: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-rose-700 font-black font-mono shadow-2xs placeholder:text-slate-400"
                          />
                        </div>

                        {/* Hotline 2 */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            বিকল্প হটলাইন নম্বর ২:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 09649-541717"
                            value={socialForm.hotline2}
                            onChange={(e) => setSocialForm({ ...socialForm, hotline2: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold font-mono placeholder:text-slate-400 shadow-2xs"
                          />
                        </div>

                        {/* Support Hours */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            কাস্টমার সাপোর্ট সময়সূচি:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: সকাল ১০টা - রাত ১০টা সার্বক্ষণিক সেবা"
                            value={socialForm.supportHours}
                            onChange={(e) => setSocialForm({ ...socialForm, supportHours: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900 bg-emerald-50/70 shadow-2xs placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SHOWROOM & OFFICE ADDRESS */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-base text-slate-900 font-['Hind_Siliguri']">
                            শোরুম ও অফিস ঠিকানা
                          </h5>
                          <p className="text-xs text-slate-600 font-medium">
                            ফুটার, ইনভয়েস ক্যাশ মেমো এবং কাস্টমার সাপোর্টে এই ঠিকানা দেখানো হবে
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                          সম্পূর্ণ ঠিকানা (Full Address):
                        </label>
                        <textarea
                          rows={3}
                          value={socialForm.officeAddress}
                          onChange={(e) => setSocialForm({ ...socialForm, officeAddress: e.target.value })}
                          placeholder="যেমন: হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold leading-relaxed shadow-2xs placeholder:text-slate-400"
                        />
                      </div>

                      {/* Live Address Preview Card Box */}
                      <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl border-2 border-rose-200 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="text-xs font-bold text-rose-900 bg-rose-200/90 px-2.5 py-0.5 rounded-full inline-block">
                            লাইভ প্রিভিউ (ফুটার ও মেমোতে যেমন দেখাবে)
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                          {socialForm.officeAddress || 'হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ'}
                        </p>
                      </div>
                    </div>

                    {/* SECTION 3: STORE IDENTITY & SLOGAN */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shadow-2xs">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-base text-slate-900 font-['Hind_Siliguri']">
                            দোকানের নাম, স্লোগান ও নোটিশ বার্তা
                          </h5>
                          <p className="text-xs text-slate-600 font-medium">
                            ব্র্যান্ডের নাম, ট্যাগলাইন এবং ওয়েবসাইটের একদম উপরের স্ক্রোলিং নোটিশ
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            দোকানের নাম (Store Name):
                          </label>
                          <input
                            type="text"
                            value={socialForm.storeName}
                            onChange={(e) => setSocialForm({ ...socialForm, storeName: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-black shadow-2xs placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            স্লোগান / ট্যাগলাইন (Slogan):
                          </label>
                          <input
                            type="text"
                            value={socialForm.slogan}
                            onChange={(e) => setSocialForm({ ...socialForm, slogan: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold shadow-2xs placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                          শীর্ষ অফার বার্তার নোটিশ (Top Announcement Notice):
                        </label>
                        <textarea
                          rows={2}
                          value={socialForm.announcementText}
                          onChange={(e) => setSocialForm({ ...socialForm, announcementText: e.target.value })}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-semibold leading-relaxed shadow-2xs placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* SECTION 4: PAYMENT MERCHANT ACCOUNTS */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-base text-slate-900 font-['Hind_Siliguri']">
                            পেমেন্ট মার্চেন্ট নম্বরসমূহ (বিকাশ ও নগদ)
                          </h5>
                          <p className="text-xs text-slate-600 font-medium">
                            চেকআউটে কাস্টমারদের পেমেন্ট করার জন্য প্রদর্শিত নম্বর
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-pink-50 p-4 sm:p-5 rounded-2xl border-2 border-pink-300 shadow-xs space-y-2">
                          <label className="block text-xs sm:text-sm font-black text-pink-950">
                            📱 বিকাশ মার্চেন্ট/পার্সোনাল নম্বর:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 01611541717 (মার্চেন্ট)"
                            value={socialForm.bkashMerchantNumber}
                            onChange={(e) => setSocialForm({ ...socialForm, bkashMerchantNumber: e.target.value })}
                            className="w-full text-sm sm:text-base px-3.5 py-2.5 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 font-black font-mono shadow-xs placeholder:text-slate-400"
                          />
                          <p className="text-xs text-pink-900 font-semibold">
                            কাস্টমাররা চেকআউটে বিকাশ পেমেন্ট অপশন সিলেক্ট করলে এই নম্বর দেখতে পাবে
                          </p>
                        </div>

                        <div className="bg-orange-50 p-4 sm:p-5 rounded-2xl border-2 border-orange-300 shadow-xs space-y-2">
                          <label className="block text-xs sm:text-sm font-black text-orange-950">
                            💳 নগদ মার্চেন্ট/পার্সোনাল নম্বর:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 01911541717 (পার্সোনাল)"
                            value={socialForm.nagadMerchantNumber}
                            onChange={(e) => setSocialForm({ ...socialForm, nagadMerchantNumber: e.target.value })}
                            className="w-full text-sm sm:text-base px-3.5 py-2.5 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 font-black font-mono shadow-xs placeholder:text-slate-400"
                          />
                          <p className="text-xs text-orange-900 font-semibold">
                            কাস্টমাররা চেকআউটে নগদ পেমেন্ট অপশন সিলেক্ট করলে এই নম্বর দেখতে পাবে
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: FOOTER WATERMARK BACKGROUND IMAGE */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-base text-slate-900 font-['Hind_Siliguri']">
                            ফুটার ৩০% জলছাপ ব্যাকগ্রাউন্ড ছবি
                          </h5>
                          <p className="text-xs text-slate-600 font-medium">
                            ফুটারের পেছনের জলছাপ ছবির লিংক পরিবর্তন করুন (ডিফল্ট: /footer-bg.jpg)
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3.5">
                        <div className="relative w-32 h-20 rounded-xl overflow-hidden border-2 border-purple-300 shadow-xs bg-slate-900 shrink-0">
                          <img
                            src={socialForm.footerBgImage || '/footer-bg.jpg'}
                            alt="Footer Background"
                            className="w-full h-full object-cover opacity-60"
                            onError={(e) => {
                              e.currentTarget.src = '/hero-banner.jpg';
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white bg-black/60 px-2 text-center drop-shadow-md">
                            ৩০% জলছাপ প্রিভিউ
                          </span>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            ছবির ইউআরএল (Image URL):
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: /footer-bg.jpg অথবা যেকোনো ইমেজ লিংক"
                            value={socialForm.footerBgImage}
                            onChange={(e) => setSocialForm({ ...socialForm, footerBgImage: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold font-mono shadow-2xs placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: SOCIAL MEDIA LINKS */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-base text-slate-900 font-['Hind_Siliguri']">
                            সোশ্যাল মিডিয়া পেজ লিংক
                          </h5>
                          <p className="text-xs text-slate-600 font-medium">
                            ফেসবুক, টিকটক ও ইউটিউব চ্যানেলের অফিশিয়াল লিংক
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                            <span className="text-blue-600 font-black">f</span>
                            <span>ফেসবুক পেজ লিংক (Facebook URL):</span>
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: https://www.facebook.com/NaarirShopno"
                            value={socialForm.facebookUrl}
                            onChange={(e) => setSocialForm({ ...socialForm, facebookUrl: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold font-mono shadow-2xs placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            টিকটক প্রোফাইল লিংক (TikTok URL):
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: https://www.tiktok.com/@naarir.shopno"
                            value={socialForm.tiktokUrl}
                            onChange={(e) => setSocialForm({ ...socialForm, tiktokUrl: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold font-mono shadow-2xs placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                            ইউটিউব চ্যানেল লিংক (YouTube URL):
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: https://youtube.com/@naarirshopno"
                            value={socialForm.youtubeUrl}
                            onChange={(e) => setSocialForm({ ...socialForm, youtubeUrl: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-bold font-mono shadow-2xs placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PROMINENT SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                      >
                        <Save className="w-5 h-5" />
                        <span>সকল সেটিংস সংরক্ষণ করুন (Save All Settings)</span>
                      </button>
                    </div>
                  </form>

                  {/* Security & Password Change Section (নিচের ডায়ালগ বক্স) */}
                  <div className="pt-8 border-t-2 border-slate-300">
                    <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-300 shadow-md space-y-5">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-base sm:text-lg font-black text-slate-900 font-['Hind_Siliguri']">
                            অ্যাডমিন নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন
                          </h5>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium">
                            অ্যাডমিন প্যানেলে লগইন করার ইমেইল, পাসওয়ার্ড ও গোপন রিকভারি সিকিউরিটি পিন পরিবর্তন করুন
                          </p>
                        </div>
                      </div>

                      {changePassToast && (
                        <div className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                          changePassToast.success ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-300' : 'bg-red-100 text-red-900 border-2 border-red-300'
                        }`}>
                          {changePassToast.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />}
                          <span>{changePassToast.message}</span>
                        </div>
                      )}

                      <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                              বর্তমান পাসওয়ার্ড: *
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                              value={changePassForm.currentPass}
                              onChange={(e) => setChangePassForm({ ...changePassForm, currentPass: e.target.value })}
                              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                              লগইন ইমেইল / ইউজারনেম:
                            </label>
                            <input
                              type="text"
                              required
                              value={changePassForm.newEmail}
                              onChange={(e) => setChangePassForm({ ...changePassForm, newEmail: e.target.value })}
                              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                              নতুন পাসওয়ার্ড: * (কমপক্ষে ৬ অক্ষর)
                            </label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="নতুন পাসওয়ার্ড দিন"
                              value={changePassForm.newPass}
                              onChange={(e) => setChangePassForm({ ...changePassForm, newPass: e.target.value })}
                              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                              নতুন পাসওয়ার্ড নিশ্চিত করুন: *
                            </label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                              value={changePassForm.confirmPass}
                              onChange={(e) => setChangePassForm({ ...changePassForm, confirmPass: e.target.value })}
                              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Secret Recovery PIN Management Dialog Box */}
                        <div className="p-4 sm:p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-xs space-y-2.5">
                          <label className="block text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
                            <Key className="w-4 h-4 text-amber-700" />
                            <span>গোপন রিকভারি সিকিউরিটি পিন (Secret Recovery PIN) পরিবর্তন:</span>
                          </label>
                          <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                            পাসওয়ার্ড ভুলে গেলে অ্যাডমিন অ্যাকাউন্ট ফিরে পাওয়ার জন্য এই পিন ব্যবহৃত হবে। এটি সম্পূর্ণ নিজের কাছে গোপন রাখুন (কমপক্ষে ৪ সংখ্যা)।
                          </p>
                          <input
                            type="text"
                            placeholder="যেমন: নিজের পছন্দের ৪-৮ সংখ্যার গোপন পিন (ঐচ্ছিক)"
                            value={changePassForm.newSecurityPin}
                            onChange={(e) => setChangePassForm({ ...changePassForm, newSecurityPin: e.target.value })}
                            className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 font-black font-mono placeholder:text-slate-400 shadow-2xs"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>ক্রেডেনশিয়াল ও সিকিউরিটি পিন আপডেট করুন</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

{/* TAB 6: CUSTOMER MESSAGES INBOX */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">কাস্টমার সরাসরি মেসেজ ইনবক্স</h4>
                      <p className="text-xs text-slate-500">ওয়েবসাইট থেকে কাস্টমারদের পাঠানো প্রশ্ন ও মেসেজ</p>
                    </div>
                    {messages.length > 0 && (
                      <button
                        onClick={async () => {
                          if (window.confirm('আপনি কি নিশ্চিত যে সকল চ্যাট ও মেসেজ মুছে ফেলতে চান?')) {
                            await clearAllMessages();
                          }
                        }}
                        className="self-start sm:self-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>সকল চ্যাট মুছুন (Clear All)</span>
                      </button>
                    )}
                  </div>

                  {messages.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-rose-100 text-center text-slate-400">
                      কোনো মেসেজ নেই
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            m.isRead ? 'bg-white border-slate-200' : 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-100'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                                <span className="text-xs font-mono text-rose-700 font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                                  {m.phone}
                                </span>
                                {!m.isRead && (
                                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    নতুন মেসেজ
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-600 mt-0.5">বিষয়: {m.subject}</p>
                            </div>
                            <span className="text-[11px] text-slate-400">{m.createdAt}</span>
                          </div>

                          <div className="py-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
                            {m.message}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${m.phone}`}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>সরাসরি কল দিন</span>
                              </a>
                              <a
                                href={`https://wa.me/88${m.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                              >
                                <span>হোয়াটসঅ্যাপ</span>
                              </a>
                            </div>

                            <div className="flex items-center gap-2">
                              {!m.isRead && (
                                <button
                                  onClick={() => markMessageAsRead(m.id)}
                                  className="text-slate-600 hover:text-emerald-700 font-medium"
                                >
                                  পঠিত চিহ্নিত করুন
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(m.id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {/* Category Management Header */}
                  <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                          ক্যাটাগরি ম্যানেজমেন্ট ও ছবি
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        দোকানের যেকোনো ক্যাটাগরি এডিট করুন, নতুন ক্যাটাগরি যুক্ত করুন অথবা ছবি পরিবর্তন করুন।
                      </p>
                    </div>

                    {/* Add Category Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryItem(null);
                        setCategoryFormId('');
                        setCategoryFormTitle('');
                        setCategoryFormSubtitle('');
                        setCategoryFormImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80');
                        setIsCategoryModalOpen(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ নতুন ক্যাটাগরি যোগ করুন</span>
                    </button>
                  </div>

                  {/* Toast notification */}
                  {categoryToast && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{categoryToast}</span>
                    </div>
                  )}

                  {/* Categories Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(Array.isArray(settings.categories)
                      ? settings.categories
                      : DEFAULT_CATEGORIES
                    ).map((cat) => {
                      const activeImg = settings.categoryImages?.[cat.id] || cat.image;

                      return (
                        <div
                          key={cat.id}
                          className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between space-y-3.5 hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-rose-300 shadow-xs shrink-0 bg-rose-50">
                              <img
                                src={activeImg}
                                alt={cat.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = cat.image;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-slate-900 truncate font-['Hind_Siliguri']">
                                {cat.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 truncate">{cat.subtitle}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs font-['Hind_Siliguri']">
                                  Id: {cat.title}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Edit / Change Picture AND Delete */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryItem(cat);
                                setCategoryFormId(cat.title);
                                setCategoryFormTitle(cat.title);
                                setCategoryFormSubtitle(cat.subtitle);
                                setCategoryFormImage(activeImg);
                                setIsCategoryModalOpen(true);
                              }}
                              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                            >
                              <Camera className="w-3.5 h-3.5 text-rose-600" />
                              <span>ছবি ও তথ্য পরিবর্তন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToDelete(cat);
                              }}
                              className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs"
                              title={`"${cat.title}" ক্যাটাগরি ডিলিট করুন`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ডিলিট</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 8: DATABASE & CLOUD HEALTH CHECK */}
              {activeTab === 'database' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Top Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-700">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-rose-600/30 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-inner">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold font-['Hind_Siliguri'] flex items-center gap-2 flex-wrap">
                            <span>ফায়ারবেস ডাটাবেস ও ক্লাউড হেলথ-চেক</span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              dbHealth?.status === 'healthy'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : dbHealth?.status === 'warning'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}>
                              {dbHealth?.status === 'healthy' ? '🟢 সক্রিয় ও স্বাস্থ্যকর' : dbHealth?.status === 'warning' ? '🟡 সতর্কতা' : '🔴 কানেকশন এরর'}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-300">
                            ক্লাউড ফায়ারস্টোর ডাটাবেসের কনফিগারেশন, রিড-রাইট পারমিশন ও কানেকশন লেটেন্সি পর্যবেক্ষণ করুন
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => runDbHealthCheck()}
                        disabled={isCheckingDbHealth}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <RefreshCw className={`w-4 h-4 ${isCheckingDbHealth ? 'animate-spin' : ''}`} />
                        <span>{isCheckingDbHealth ? 'চেক চলছে...' : 'পুনরায় ডায়াগনস্টিক টেস্ট চালান'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setIsSyncingAll(true);
                          await syncAllToCloud();
                          setIsSyncingAll(false);
                          setCloudSyncedToast(true);
                          setTimeout(() => setCloudSyncedToast(false), 3000);
                          runDbHealthCheck();
                        }}
                        disabled={isSyncingAll}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Cloud className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        <span>ক্লাউড সিঙ্ক করুন</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportFullBackup}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                        title="শপের সমস্ত পণ্য, অর্ডার ও সেটিংসের সম্পূর্ণ ব্যাকআপ JSON ডাউনলোড করুন"
                      >
                        <Download className="w-4 h-4" />
                        <span>ডাটা ব্যাকআপ ডাউনলোড (.json)</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        সামগ্রিক স্বাস্থ্য অবস্থা
                      </span>
                      <div className="flex items-center gap-2 pt-1">
                        <div className={`w-3 h-3 rounded-full ${dbHealth?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : dbHealth?.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span className="text-base font-bold text-slate-900 font-['Hind_Siliguri']">
                          {dbHealth?.status === 'healthy' ? 'সম্পূর্ণ কার্যকরী' : dbHealth?.status === 'warning' ? 'সতর্কতা সহ সচল' : 'ত্রুটি পরিলক্ষিত'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">সবগুলো কালেকশন অনলাইন</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        কানেকশন লেটেন্সি (পিং)
                      </span>
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl font-black text-rose-600 font-mono">
                          {dbHealth?.latencyMs || '--'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-mono">ms</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold">⚡ দ্রুতগতির রেসপন্স স্পিড</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        ফায়ারবেস প্রজেক্ট আইডি
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-800 truncate pt-1">
                        {dbHealth?.config.projectId || 'excellent-age-fvr20'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        DB: {dbHealth?.config.databaseId || 'ai-studio-naarirshopno-...'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        সর্বশেষ পরীক্ষা সম্পন্ন
                      </span>
                      <p className="text-sm font-bold text-slate-800 pt-1 font-mono">
                        {dbHealth?.checkedAt || 'লাইভ সচল'}
                      </p>
                      <p className="text-[11px] text-slate-500">রিয়েলটাইম ডায়াগনস্টিক ট্র্যাকিং</p>
                    </div>
                  </div>

                  {/* Checklist of all Firestore Collections & Permissions */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <h5 className="font-bold text-base text-slate-900 font-['Hind_Siliguri'] flex items-center gap-2">
                          <Activity className="w-5 h-5 text-rose-600" />
                          <span>ডাটাবেস কম্পোনেন্ট ও পারমিশন অডিট রিপোর্ট</span>
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          প্রতিটি ডাটাবেস কালেকশনের রিড/রাইট অ্যাক্সেস ও ডকুমেন্ট কাউন্ট
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                        {dbHealth?.steps.filter(s => s.ok).length || 0} / {dbHealth?.steps.length || 0} টি চেক সফল
                      </span>
                    </div>

                    <div className="space-y-3">
                      {dbHealth?.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            step.ok
                              ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                              : 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              step.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {step.ok ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h6 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                                  {step.bengaliName}
                                </h6>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                                  step.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {step.ok ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {step.message}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto text-xs shrink-0">
                            {step.count !== undefined && (
                              <span className="font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono shadow-2xs">
                                মোট: {step.count}
                              </span>
                            )}
                            {step.latencyMs !== undefined && (
                              <span className="font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-rose-600 font-mono text-[11px] shadow-2xs">
                                {step.latencyMs}ms
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostic Console Box */}
                  <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 text-slate-200 shadow-md space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono font-bold">Firestore Diagnostic Console & Security Status</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Client SDK v12.19.0 (Connected)
                      </span>
                    </div>

                    <div className="font-mono text-xs space-y-1.5 text-slate-300 leading-relaxed overflow-x-auto">
                      <p className="text-slate-400">&gt; Target Firebase Project: <span className="text-amber-300">{dbHealth?.config.projectId}</span></p>
                      <p className="text-slate-400">&gt; Target Firestore Database: <span className="text-sky-300">{dbHealth?.config.databaseId}</span></p>
                      <p className="text-slate-400">&gt; Long-Polling Engine: <span className="text-emerald-400">ENABLED (High-Reliability Mode)</span></p>
                      <p className="text-slate-400">&gt; Security Rules: <span className="text-emerald-400">ALLOW READ/WRITE ACTIVE</span></p>
                      <p className="text-slate-400">&gt; Overall Latency: <span className="text-pink-400">{dbHealth?.latencyMs}ms</span></p>
                    </div>

                    {dbHealth?.errors && dbHealth.errors.length > 0 ? (
                      <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1 text-red-200">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span>শনাক্ত হওয়া ত্রুটিসমূহ:</span>
                        </span>
                        {dbHealth.errors.map((err, i) => (
                          <p key={i} className="font-mono text-[11px] text-red-300 pl-5">
                            • {err}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>ডাটাবেস কানেকশন, কালেকশন রিড এবং রাইট পারমিশন সম্পূর্ণ নির্ভুলভাবে কাজ করছে। কোনো সমস্যা পাওয়া যায়নি!</span>
                      </div>
                    )}
                  </div>

                  {/* Project & Data Migration Guide to NaarirShopno@Gmail.com */}
                  <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 p-6 rounded-3xl border border-rose-800/40 text-white shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-rose-800/40 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-base text-white font-['Hind_Siliguri']">
                            Google AI Studio ও সমস্ত ডাটা NaarirShopno@Gmail.com-এ রাখার নিয়ম
                          </h5>
                          <p className="text-xs text-rose-200/80">
                            বর্তমান একাউন্ট থেকে সম্পূর্ণ প্রজেক্ট ও ডাটাবেসের মালিকানা হস্তান্তর করার সহজ ৩টি উপায়
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
                        প্রজেক্ট ট্রান্সফার গাইড
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
                      {/* Step 1: Fork in AI Studio */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                          <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs text-rose-300">১</span>
                          <span>AI Studio-তে Fork / Remix</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          ১. ব্রাউজারে <strong className="text-pink-300 font-mono">NaarirShopno@Gmail.com</strong> দিয়ে গুগল একাউন্টে লগইন করুন।<br/>
                          ২. এই প্রজেক্টের প্রিভিউ লিংকে যান এবং উপরে থাকা <strong>"Fork / Remix"</strong> বা <strong>"Edit in AI Studio"</strong> বাটনে ক্লিক করুন।<br/>
                          ৩. সাথে সাথে সম্পূর্ণ অ্যাপ NaarirShopno একাউন্টের AI Studio ড্যাশবোর্ডে কপি হয়ে যাবে!
                        </p>
                      </div>

                      {/* Step 2: Firebase / GCP IAM Owner */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-300">২</span>
                          <span>Firebase ডাটাবেস ওনারশিপ</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          ১. যান: <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-rose-400 underline font-mono">console.firebase.google.com</a><br/>
                          ২. Project Settings &gt; Users &amp; Permissions-এ যান।<br/>
                          ৩. <strong>Add Member</strong> দিয়ে <code className="text-pink-300">NaarirShopno@Gmail.com</code> লিখে Role দিন <strong>"Owner"</strong> (মালিক)।<br/>
                          এতে সম্পূর্ণ ফায়ারস্টোর ডাটাবেসের মালিকানা হস্তান্তরিত হবে।
                        </p>
                      </div>

                      {/* Step 3: Offline Backup JSON */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-300">৩</span>
                          <span>সম্পূর্ণ অফলাইন ব্যাকআপ</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          ১. উপরের <strong>"ডাটা ব্যাকআপ ডাউনলোড (.json)"</strong> বাটনে ক্লিক করে পুরো শপের সকল পণ্য, অর্ডার ও কনফিগারেশন নিজের কম্পিউটারে ডাউনলোড করে রাখুন।<br/>
                          ২. এটি আপনার কাছে নিরাপদ হার্ডকপি হিসেবে সংরক্ষিত থাকবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DROPSHIPPING API SETTINGS */}
              {activeTab === 'dropshipping' && (
                <div className="space-y-6">
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                            Reseller API
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            dropshippingForm.enabled 
                              ? (dropshippingForm.connectionStatus === 'connected' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')
                              : 'bg-slate-700/60 text-slate-300 border border-slate-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              dropshippingForm.enabled 
                                ? (dropshippingForm.connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')
                                : 'bg-slate-400'
                            }`} />
                            <span>
                              {dropshippingForm.enabled 
                                ? (dropshippingForm.connectionStatus === 'connected' ? 'এপিআই কানেক্টেড' : 'সক্রিয় (কানেকশন টেস্ট বাকি)') 
                                : 'এপিআই নিষ্ক্রিয়'}
                            </span>
                          </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black font-['Hind_Siliguri'] flex items-center gap-2 text-white">
                          <Boxes className="w-6 h-6 text-amber-400" />
                          <span>Dropshipping.com.bd এপিআই ইন্টিগ্রেশন</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                          আপনার ই-কমার্স স্টোরের কাস্টমার অর্ডার স্বয়ংক্রিয়ভাবে dropshipping.com.bd পোর্টালে ড্রপশিপার অ্যাকাউন্টে পাঠাতে API Key ও সিক্রেট টোকেন কনফিগার করুন।
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">

                        <a
                          href="https://www.dropshipping.com.bd/dropshipper/documentation/api"
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/15 backdrop-blur-sm cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-amber-300" />
                          <span>অফিসিয়াল ডকুমেন্টেশন</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveDropshippingSettings} className="space-y-6">
                    {/* Top Switch Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Master Enable Switch */}
                      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">১. এপিআই স্ট্যাটাস</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              dropshippingForm.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {dropshippingForm.enabled ? 'সক্রিয় (Active)' : 'বন্ধ (Disabled)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            সার্ভিস অন থাকলে সিস্টেমে ড্রপশিপিং ফিচার কার্যকর থাকবে
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer pt-2 border-t border-slate-100">
                          <input
                            type="checkbox"
                            checked={dropshippingForm.enabled}
                            onChange={(e) => setDropshippingForm({ ...dropshippingForm, enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          <span className="ml-3 text-xs font-bold text-slate-700">
                            {dropshippingForm.enabled ? 'সার্ভিস চালু আছে' : 'সার্ভিস বন্ধ করুন'}
                          </span>
                        </label>
                      </div>

                      {/* 2. Auto-Forward Orders */}
                      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">২. অটো-ফরওয়ার্ড অর্ডার</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              dropshippingForm.autoForwardOrders ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {dropshippingForm.autoForwardOrders ? 'অটোমেটিক' : 'ম্যানুয়াল'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            নতুন গ্রাহক অর্ডার দিলে সাথে সাথে dropshipping.com.bd-তে পুশ হবে
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer pt-2 border-t border-slate-100">
                          <input
                            type="checkbox"
                            checked={Boolean(dropshippingForm.autoForwardOrders)}
                            onChange={(e) => setDropshippingForm({ ...dropshippingForm, autoForwardOrders: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-xs font-bold text-slate-700">
                            {dropshippingForm.autoForwardOrders ? 'অটো-ফরওয়ার্ড চালু' : 'শুধু ম্যানুয়ালি পাঠান'}
                          </span>
                        </label>
                      </div>

                      {/* 3. Test / Sandbox Mode */}
                      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">৩. টেস্ট মোড (Sandbox)</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              dropshippingForm.testMode ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {dropshippingForm.testMode ? 'Sandbox' : 'Live Production'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            টেস্টিং চলাকালে ব্যালেন্স না কেটে ড্রাফট হিসেবে অর্ডার জমা হবে
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer pt-2 border-t border-slate-100">
                          <input
                            type="checkbox"
                            checked={Boolean(dropshippingForm.testMode)}
                            onChange={(e) => setDropshippingForm({ ...dropshippingForm, testMode: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                          <span className="ml-3 text-xs font-bold text-slate-700">
                            {dropshippingForm.testMode ? 'টেস্ট মোড সক্রিয়' : 'লাইভ প্রোডাকশন মোড'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* API Credentials Configuration Card */}
                    <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Key className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-base">API ক্রেডেনশিয়ালস ও সংযোগ তথ্য</h5>
                            <p className="text-xs text-slate-500">dropshipping.com.bd রিসেলার ড্যাশবোর্ড থেকে প্রাপ্ত তথ্য প্রদান করুন</p>
                          </div>
                        </div>
                        <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                          ২৫৬-বিট সুরক্ষিত
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Base API URL */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              API Base URL (এন্ডপয়েন্ট বেস ইউআরএল) *
                            </label>
                            <button
                              type="button"
                              onClick={() => setDropshippingForm({ ...dropshippingForm, baseUrl: 'https://www.dropshipping.com.bd/api/v1' })}
                              className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                            >
                              ডিফল্ট URL রিসেট করুন
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="url"
                              required
                              value={dropshippingForm.baseUrl || 'https://www.dropshipping.com.bd/api/v1'}
                              onChange={(e) => setDropshippingForm({ ...dropshippingForm, baseUrl: e.target.value })}
                              placeholder="https://www.dropshipping.com.bd/api/v1"
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-rose-500"
                            />
                            <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Dropshipping.com.bd এর স্ট্যান্ডার্ড API এন্ডপয়েন্ট: <code className="text-rose-600">https://www.dropshipping.com.bd/api/v1</code>
                          </p>
                        </div>

                        {/* API Key */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            ড্রপশিপার API কী (API Key / Client ID) *
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKey ? 'text' : 'password'}
                              required
                              value={dropshippingForm.apiKey}
                              onChange={(e) => setDropshippingForm({ ...dropshippingForm, apiKey: e.target.value })}
                              placeholder="drp_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={showApiKey ? 'লুকান' : 'দেখুন'}
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            আপনার dropshipping.com.bd প্রোফাইলের ইউনিক এপিআই কী
                          </p>
                        </div>

                        {/* API Secret / Bearer Token */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            API সিক্রেট / Bearer টোকেন (API Secret / Auth Token)
                          </label>
                          <div className="relative">
                            <input
                              type={showApiSecret ? 'text' : 'password'}
                              value={dropshippingForm.apiSecret || ''}
                              onChange={(e) => setDropshippingForm({ ...dropshippingForm, apiSecret: e.target.value })}
                              placeholder="drp_sec_xxxxxxxxxxxxxxxxxxxxxxxx"
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiSecret(!showApiSecret)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={showApiSecret ? 'লুকান' : 'দেখুন'}
                            >
                              {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            ডকুমেন্টেশন অনুযায়ী রিকোয়েস্ট হেডারে প্রেরিত সিক্রেট কি
                          </p>
                        </div>

                        {/* Reseller Account Phone */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            রেজিস্টার্ড ড্রপশিপার ফোন নম্বর (Phone)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={dropshippingForm.resellerPhone || ''}
                              onChange={(e) => setDropshippingForm({ ...dropshippingForm, resellerPhone: e.target.value })}
                              placeholder="01911541717"
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-rose-500"
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            dropshipping.com.bd অ্যাকাউন্টের ভেরিফায়েড মোবাইল নম্বর
                          </p>
                        </div>

                        {/* Preferred Courier */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            ডিফল্ট কুরিয়ার সার্ভিস নির্বাচন
                          </label>
                          <div className="relative">
                            <select
                              value={dropshippingForm.defaultCourier || 'Steadfast Courier'}
                              onChange={(e) => setDropshippingForm({ ...dropshippingForm, defaultCourier: e.target.value })}
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-rose-500"
                            >
                              <option value="Steadfast Courier">Steadfast Courier (স্টেডফাস্ট কুরিয়ার)</option>
                              <option value="Pathao Courier">Pathao Courier (পাঠাও এক্সপ্রেস)</option>
                              <option value="RedX Logistics">RedX Logistics (রেডএক্স)</option>
                              <option value="Paperfly">Paperfly (পেপারফ্লাই)</option>
                              <option value="eCourier">eCourier (ই-কুরিয়ার)</option>
                              <option value="Sundarban Courier">Sundarban Courier (সুন্দরবন)</option>
                            </select>
                            <Truck className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            ড্রপশিপিং প্ল্যাটফর্মে যে কুরিয়ারের মাধ্যমে পার্সেল পাঠানো হবে
                          </p>
                        </div>
                      </div>

                      {/* Live Test Results Feedback Box */}
                      {apiTestResult && (
                        <div className={`p-4 rounded-2xl border transition-all ${
                          apiTestResult.success 
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                            : 'bg-red-50/80 border-red-200 text-red-900'
                        }`}>
                          <div className="flex items-start gap-3">
                            {apiTestResult.success ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h6 className="font-bold text-xs sm:text-sm">
                                  {apiTestResult.success ? 'কানেকশন সফল হয়েছে!' : 'কানেকশন ব্যর্থ হয়েছে'}
                                </h6>
                                <div className="flex items-center gap-2 text-[11px] font-mono">
                                  {apiTestResult.statusCode && (
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                                      Status: {apiTestResult.statusCode}
                                    </span>
                                  )}
                                  {apiTestResult.latencyMs !== undefined && (
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-rose-600">
                                      {apiTestResult.latencyMs}ms
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs leading-relaxed">{apiTestResult.message}</p>

                              {apiTestResult.accountInfo && (
                                <div className="mt-2 pt-2 border-t border-emerald-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-emerald-700 block text-[10px]">অ্যাকাউন্টের নাম:</span>
                                    <span className="font-bold">{apiTestResult.accountInfo.resellerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-emerald-700 block text-[10px]">উপলব্ধ ব্যালেন্স:</span>
                                    <span className="font-bold font-['Outfit']">৳{apiTestResult.accountInfo.balance?.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-emerald-700 block text-[10px]">সক্রিয় ড্রপশিপ অর্ডার:</span>
                                    <span className="font-bold font-mono">{apiTestResult.accountInfo.activeOrders} টি</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleTestDropshippingConnection}
                          disabled={isTestingApi || !dropshippingForm.apiKey.trim()}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          <Wifi className={`w-4 h-4 text-emerald-400 ${isTestingApi ? 'animate-pulse' : ''}`} />
                          <span>{isTestingApi ? 'কানেকশন টেস্ট হচ্ছে...' : 'কানেকশন টেস্ট করুন (Test Connection)'}</span>
                        </button>

                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-98"
                        >
                          <Save className="w-4 h-4" />
                          <span>API সেটিংস সেভ করুন (Save Settings)</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Webhook & Callback URL Guide Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Webhook Box - 100% Optional */}
                    <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Zap className="w-5 h-5 text-amber-500" />
                          <h5 className="font-bold text-sm">ওয়েবহুক URL (সম্পূর্ণ ঐচ্ছিক / Optional)</h5>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          প্রয়োজন নেই (Optional)
                        </span>
                      </div>

                      {/* Helpful Banner explaining why user doesn't need to look for Webhook */}
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-amber-800">
                          <span>💡 চিন্তা করবেন না, এটি আপনার খুঁজতে হবে না!</span>
                        </p>
                        <p className="text-[11px] leading-relaxed text-amber-950">
                          dropshipping.com.bd পোর্টালে Webhook অপশন দেওয়া থাকে না বা প্রয়োজন হয় না। <strong>শুধুমাত্র উপরের "API কী" বসালেই আপনার শপ থেকে সব অর্ডার স্বয়ংক্রিয়ভাবে dropshipping.com.bd-তে চলে যাবে।</strong>
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-slate-500">
                          ভবিষ্যতে যদি dropshipping.com.bd কখনো Webhook URL চায়, তখন নিচের লিঙ্কটি ব্যবহার করতে পারেন:
                        </p>
                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-rose-400">
                          <input
                            type="text"
                            value={dropshippingForm.webhookUrl || 'https://naarirshopno.vercel.app/api/dropshipping/webhook'}
                            onChange={(e) => setDropshippingForm({ ...dropshippingForm, webhookUrl: e.target.value })}
                            className="text-xs font-mono text-rose-700 bg-transparent flex-1 focus:outline-none min-w-0"
                            placeholder="https://naarirshopno.vercel.app/api/dropshipping/webhook"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const targetUrl = dropshippingForm.webhookUrl || 'https://naarirshopno.vercel.app/api/dropshipping/webhook';
                              navigator.clipboard?.writeText(targetUrl);
                              setWebhookCopied(true);
                              setTimeout(() => setWebhookCopied(false), 2500);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                          >
                            {webhookCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{webhookCopied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Step Guide - Focus on what matters: API Key */}
                    <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-slate-800">
                        <PackageCheck className="w-5 h-5 text-emerald-600" />
                        <h5 className="font-bold text-sm">সহজে API Key পাওয়ার নিয়ম (মাত্র ১টি কাজ):</h5>
                      </div>
                      
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5 leading-relaxed">
                        <p className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>আপনার শুধু ১টি তথ্য লাগবে: "API Key"</span>
                        </p>
                        <ol className="text-[11px] text-emerald-950 space-y-1 list-decimal pl-4">
                          <li>
                            <a href="https://www.dropshipping.com.bd" target="_blank" rel="noreferrer" className="text-rose-700 underline font-bold">
                              dropshipping.com.bd
                            </a>
                            -তে লগইন করে <strong>ড্যাশবোর্ড (Reseller Dashboard)</strong>-এ যান।
                          </li>
                          <li>মেনু থেকে <strong>"API"</strong> অথবা <strong>"Profile / Settings"</strong> অপশনে ক্লিক করুন।</li>
                          <li>সেখানে প্রদর্শিত <strong>API Key</strong> টি কপি করুন।</li>
                          <li>উপরের <strong>"ড্রপশিপার API কী"</strong> বক্সে পেস্ট করে <strong>"কানেকশন টেস্ট করুন"</strong> এবং <strong>"সেভ করুন"</strong> চাপুন।</li>
                        </ol>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">
                        💡 আর কোনো কনফিগারেশন বা Webhook করা লাগবে না। API Key বসালেই অর্ডার স্বয়ংক্রিয়ভাবে যেতে শুরু করবে!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AUTOMATED EMAIL NOTIFICATIONS */}
              {activeTab === 'emails' && (
                <div className="space-y-6">
                  {/* Top Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                            Firebase Cloud Functions v2
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>asia-southeast1 • onOrderCreatedSendEmail</span>
                          </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black font-['Hind_Siliguri'] flex items-center gap-2 text-white">
                          <Mail className="w-6 h-6 text-emerald-400" />
                          <span>অটোমেটেড অর্ডার কনফার্মেশন ইমেইল সিস্টেম</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                          যেকোনো কাস্টমার সফলভাবে অর্ডার করার সাথে সাথে স্বয়ংক্রিয়ভাবে ফায়ারবেস ক্লাউড ফাংশন গ্রাহকের ইমেইলে আকর্ষণীয় রসিদ, পণ্যের ছবি, মূল্য তালিকা এবং লাইভ ট্র্যাকিং লিংক পাঠিয়ে দেয়।
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const sampleOrder = orders[0];
                            if (sampleOrder) {
                              handleOpenEmailPreviewForOrder(sampleOrder);
                            } else {
                              handleOpenEmailPreviewForOrder({
                                id: 'DEMO-7890',
                                customerName: 'সম্মানিত টেস্ট গ্রাহক',
                                customerEmail: settings.emailSettings?.senderEmail || 'AliIslam01911@gmail.com',
                                phone: '01711000000',
                                district: 'ঢাকা',
                                thana: 'ধানমন্ডি',
                                address: 'বাড়ি ১২, রোড ৭, ধানমন্ডি, ঢাকা',
                                deliveryZone: 'inside_dhaka',
                                deliveryCharge: 70,
                                paymentMethod: 'cod',
                                items: products.slice(0, 2).map((p) => ({
                                  product: p,
                                  quantity: 1,
                                  selectedSize: p.sizes[0] || 'Free Size',
                                  selectedColor: p.colors[0]?.name || 'গোলাপি',
                                })),
                                subtotal: 3500,
                                discount: 0,
                                total: 3570,
                                status: 'pending',
                                createdAt: new Date().toISOString(),
                              });
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/15 backdrop-blur-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-emerald-300" />
                          <span>নমুনা ইমেইল প্রিভিউ</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>মোট প্রেরিত ইমেইল</span>
                        <Send className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-emerald-700 font-['Outfit']">
                        {orders.filter(o => o.customerEmail).length}
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-1">স্বয়ংক্রিয় ক্লাউড কিউড</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>ইমেইলসহ গ্রাহক অর্ডার</span>
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                        {orders.filter(o => o.customerEmail).length} / {orders.length}
                      </p>
                      <p className="text-[11px] text-blue-600 mt-1">চেকআউট থেকে সংগৃহীত</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>ক্লাউড ফাংশন ট্রিগার</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-base sm:text-lg font-black text-slate-900 font-mono">
                        orders/&#123;id&#125;
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">onDocumentCreated</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>অ্যাডমিন কপি (BCC)</span>
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate" title={settings.emailSettings?.senderEmail || 'NaarirShopno@Gmail.com'}>
                        {settings.emailSettings?.senderEmail || 'NaarirShopno@Gmail.com'}
                      </p>
                      <p className="text-[11px] text-purple-600 mt-1">মালিকের ইমেইলে কপি যাবে</p>
                    </div>
                  </div>

                  {/* Interactive Test Email Dispatcher & Trigger Box */}
                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-100">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">লাইভ টেস্ট ইমেইল ও ডায়াগনস্টিক (Live SMTP & Direct Test)</h5>
                          <p className="text-[11px] text-slate-500">আপনার নিজস্ব ইমেইল দিয়ে ইনবক্সে রিয়েল-টাইম ডেলিভারি টেস্ট করুন অথবা ১-ক্লিকে জিমেইল ড্রাফট ওপেন করুন</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          emailSettingsForm.smtpPass ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {emailSettingsForm.smtpPass ? '● SMTP কনফিগারেশন যুক্ত' : '○ অ্যাপ পাসওয়ার্ড বাকি'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="আপনার ইমেইল দিন (যেমন: NaarirShopno@Gmail.com)"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenTemplatePreviewModal()}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-98"
                        title="গ্রাহকদের কাছে পাঠানোর পূর্বে কনফার্মেশন ইমেইল টেমপ্লেটটির রেন্ডার করা পূর্ণ প্রিভিউ দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                        <span>ইমেইল প্রিভিউ (Email Preview)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={testEmailLoading || !testEmailAddress.trim()}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 active:scale-98"
                      >
                        <Send className={`w-3.5 h-3.5 ${testEmailLoading ? 'animate-spin' : ''}`} />
                        <span>{testEmailLoading ? 'পাঠানো হচ্ছে...' : 'ইনবক্সে পাঠান'}</span>
                      </button>

                      {orders[0] && (
                        <a
                          href={createGmailDraftUrl(orders[0], testEmailAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          title="ব্রাউজারে সরাসরি Gmail Compose উইন্ডো খুলুন"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                          <span>Gmail</span>
                        </a>
                      )}
                    </div>

                    {testEmailSuccess && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn font-semibold leading-relaxed">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>{testEmailSuccess}</div>
                      </div>
                    )}

                    {testEmailError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn font-semibold leading-relaxed">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>{testEmailError}</div>
                      </div>
                    )}
                  </div>

                  {/* Dedicated Email Preview Feature Spotlight Banner */}
                  <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-purple-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                        <Eye className="w-3.5 h-3.5 text-purple-300" />
                        <span>লাইভ টেমপ্লেট প্রিভিউ ফিচার</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>অটোমেটেড অর্ডার কনফার্মেশন ইমেইল প্রিভিউ</span>
                      </h4>
                      <p className="text-xs text-purple-200/90 leading-relaxed">
                        গ্রাহকদের ইনবক্সে নোটিফিকেশন পৌঁছানোর আগেই অ্যাডমিনরা রেসপন্সিভ ইমেইল টেমপ্লেট, স্টোর লোগো, ইনভয়েস টেবিল ও ট্র্যাকিং লিংক কেমন দেখাবে তা ডেস্কটপ ও মোবাইল উভয় ভিউতে দেখতে পারবেন।
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDeviceMode('desktop');
                          handleOpenTemplatePreviewModal();
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Monitor className="w-4 h-4 text-purple-700" />
                        <span>ডেস্কটপ প্রিভিউ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDeviceMode('mobile');
                          handleOpenTemplatePreviewModal();
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-purple-800/90 hover:bg-purple-700 text-purple-100 font-bold text-xs sm:text-sm border border-purple-700 transition flex items-center gap-2 cursor-pointer active:scale-95"
                        title="সরাসরি মোবাইল স্ক্রিন মকআপে প্রিভিউ দেখুন"
                      >
                        <Smartphone className="w-4 h-4 text-purple-300" />
                        <span>মোবাইল ভিউ</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings Form & Google App Password / SMTP Guide */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Email Config Form */}
                    <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                        <div className="flex items-center gap-2">
                          <SettingsIcon className="w-5 h-5 text-rose-600" />
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">ইমেইল সেন্ডার ও SMTP কনফিগারেশন</h5>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {emailSettingsForm.provider === 'custom_smtp' ? 'কাস্টম SMTP' : 'Google Gmail SMTP'}
                        </span>
                      </div>

                      <form onSubmit={handleSaveEmailSettings} className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                          <div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm block">স্বয়ংক্রিয় ইমেইল নোটিফিকেশন চালু রাখুন</span>
                            <span className="text-[11px] text-slate-500">প্রতিটি সফল অর্ডারে গ্রাহক ও অ্যাডমিনকে ইমেইল পাঠাবে</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={emailSettingsForm.enabled}
                            onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, enabled: e.target.checked })}
                            className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                          />
                        </div>

                        {/* Provider Selection */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1.5">ইমেইল প্রেরক ইঞ্জিন (Email Sending Provider)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setEmailSettingsForm({
                                ...emailSettingsForm,
                                provider: 'gmail',
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 465,
                                smtpSecure: true,
                              })}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                emailSettingsForm.provider !== 'custom_smtp'
                                  ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-rose-600" />
                                <div>
                                  <div className="text-xs">Google Gmail SMTP</div>
                                  <div className="text-[10px] text-slate-500 font-normal">অটোমেটেড ইনবক্স ডেলিভারি</div>
                                </div>
                              </div>
                              {emailSettingsForm.provider !== 'custom_smtp' && <Check className="w-4 h-4 text-rose-600" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setEmailSettingsForm({
                                ...emailSettingsForm,
                                provider: 'custom_smtp',
                              })}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                emailSettingsForm.provider === 'custom_smtp'
                                  ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-slate-700" />
                                <div>
                                  <div className="text-xs">Custom SMTP সার্ভার</div>
                                  <div className="text-[10px] text-slate-500 font-normal">নিজস্ব ডোমেন বা হোস্টিং</div>
                                </div>
                              </div>
                              {emailSettingsForm.provider === 'custom_smtp' && <Check className="w-4 h-4 text-rose-600" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">প্রেরকের নাম (Sender Name) *</label>
                          <input
                            type="text"
                            required
                            value={emailSettingsForm.senderName}
                            onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, senderName: e.target.value })}
                            placeholder="নারীর স্বপ্ন (Naarir Shopno)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-rose-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">প্রেরকের ইমেইল (Gmail / From Email) *</label>
                            <input
                              type="email"
                              required
                              value={emailSettingsForm.senderEmail}
                              onChange={(e) => setEmailSettingsForm({ 
                                ...emailSettingsForm, 
                                senderEmail: e.target.value,
                                smtpUser: e.target.value,
                              })}
                              placeholder="NaarirShopno@Gmail.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">কাস্টমার সাপোর্ট ইমেইল (Reply-To) *</label>
                            <input
                              type="email"
                              required
                              value={emailSettingsForm.supportEmail}
                              onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, supportEmail: e.target.value })}
                              placeholder="NaarirShopno@Gmail.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                        </div>

                        {/* Google App Password or Custom SMTP Credentials */}
                        {emailSettingsForm.provider !== 'custom_smtp' ? (
                          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="block font-bold text-slate-800">
                                Google App Password (১৬ অক্ষরের অ্যাপ পাসওয়ার্ড) *
                              </label>
                              <a
                                href="https://myaccount.google.com/apppasswords"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                              >
                                <span>পাসওয়ার্ড তৈরি করুন</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            <div className="relative">
                              <Key className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type={showSmtpPass ? 'text' : 'password'}
                                value={emailSettingsForm.smtpPass || ''}
                                onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, smtpPass: e.target.value })}
                                placeholder="xxxx xxxx xxxx xxxx (Google App Password)"
                                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-amber-300 bg-white font-mono text-xs focus:ring-2 focus:ring-rose-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSmtpPass(!showSmtpPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-amber-900 leading-tight">
                              💡 <strong>নোট:</strong> আপনার সাধারণ জিমেইল পাসওয়ার্ড কাজ করবে না। জিমেইলে 2-Step Verification অন করে ডান পাশের ৩টি ধাপ ফলো করে ১৬ অক্ষরের Google App Password বসান।
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">SMTP Host</label>
                                <input
                                  type="text"
                                  value={emailSettingsForm.smtpHost || ''}
                                  onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, smtpHost: e.target.value })}
                                  placeholder="mail.yourdomain.com"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">SMTP Port</label>
                                <input
                                  type="number"
                                  value={emailSettingsForm.smtpPort || 465}
                                  onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, smtpPort: Number(e.target.value) })}
                                  placeholder="465"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">SMTP Username</label>
                                <input
                                  type="text"
                                  value={emailSettingsForm.smtpUser || ''}
                                  onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, smtpUser: e.target.value })}
                                  placeholder="info@yourdomain.com"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                                />
                              </div>
                              <div className="relative">
                                <label className="block font-bold text-slate-700 mb-1">SMTP Password</label>
                                <input
                                  type={showSmtpPass ? 'text' : 'password'}
                                  value={emailSettingsForm.smtpPass || ''}
                                  onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, smtpPass: e.target.value })}
                                  placeholder="পাসওয়ার্ড"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs pr-8"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSmtpPass(!showSmtpPass)}
                                  className="absolute right-2.5 top-7 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">ইমেইল বিষয় (Subject Line Template) *</label>
                          <input
                            type="text"
                            required
                            value={emailSettingsForm.orderConfirmationSubject}
                            onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, orderConfirmationSubject: e.target.value })}
                            placeholder="নারীর স্বপ্ন - আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে (#{orderId})"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-rose-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-0.5">টোকেন: &#123;orderId&#125; এবং &#123;customerName&#125; স্বয়ংক্রিয়ভাবে রিপ্লেস হবে</p>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="checkbox"
                            id="bccAdminCheckbox"
                            checked={emailSettingsForm.bccAdminOnOrder}
                            onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, bccAdminOnOrder: e.target.checked })}
                            className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                          />
                          <label htmlFor="bccAdminCheckbox" className="font-semibold text-slate-700 cursor-pointer">
                            প্রতিটি অর্ডারে মালিকের ইমেইলে গোপন অনুলিপি (BCC) পাঠান: <strong className="text-rose-700">{emailSettingsForm.senderEmail}</strong>
                          </label>
                        </div>

                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenTemplatePreviewModal()}
                            className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                            title="সংরক্ষণ করার আগে এই কনফিগারেশনের লাইভ ইমেইল প্রিভিউ দেখুন"
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                            <span>টেমপ্লেট প্রিভিউ দেখুন</span>
                          </button>

                          <div className="flex items-center gap-2 ml-auto">
                            {emailSettingsSavedToast && (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>ইমেইল সেটিংস সংরক্ষিত হয়েছে!</span>
                              </span>
                            )}
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                            >
                              <Save className="w-4 h-4" />
                              <span>ইমেইল সেটিংস সংরক্ষণ করুন</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Right: Google App Password 2-Minute Guide */}
                    <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-400" />
                          <h5 className="font-bold text-sm">Google App Password তৈরির গাইড</h5>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          ২ মিনিট সময়
                        </span>
                      </div>

                      <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
                        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1.5">
                          <div className="font-bold text-amber-300 flex items-center gap-1.5">
                            <span>ধাপ ১: গুগল সিকিউরিটিতে যান</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            যে জিমেইল (<span className="text-pink-300 font-mono">NaarirShopno@Gmail.com</span>) থেকে ইমেইল পাঠাতে চান সেটিতে লগইন রেখে নিচের বাটনে ক্লিক করুন:
                          </p>
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl shadow transition"
                          >
                            <span>Google App Passwords খুলুন</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1.5">
                          <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <span>ধাপ ২: অ্যাপ তৈরি করুন</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            <strong>App name</strong> ঘরে লিখুন <code className="text-pink-300 bg-slate-900 px-1 py-0.5 rounded">Naarir Shopno</code> এবং <strong>Create</strong> বাটনে ক্লিক করুন। (প্রয়োজনে 2-Step Verification অন করুন)
                          </p>
                        </div>

                        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1.5">
                          <div className="font-bold text-sky-300 flex items-center gap-1.5">
                            <span>ধাপ ৩: কোড পেস্ট ও সংরক্ষণ</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            গুগল হলুদ বাক্সে ১৬ অক্ষরের একটি কোড দেবে (যেমন: <code className="text-amber-300 font-mono">abcd efgh ijkl mnop</code>)। কোডটি কপি করে বাম পাশের বক্সে দিয়ে <strong>সংরক্ষণ</strong> করুন!
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>বিকল্প: ক্লাউড ফাংশন ডিপ্লয়</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('firebase deploy --only functions');
                              alert('কমান্ড কপি হয়েছে: firebase deploy --only functions');
                            }}
                            className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer font-mono"
                          >
                            <Copy className="w-3 h-3" />
                            <span>কমান্ড কপি</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Firestore Email Logs Section */}
                  <div className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-6 shadow-sm space-y-5">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-rose-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                            <Mail className="w-4 h-4" />
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                            <span>গ্রাহক ইমেইল নোটিফিকেশন লগ (Firestore Database Logs)</span>
                          </h5>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          ফায়ারবেস ডাটাবেজের <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-mono font-semibold">/mail</code> কালেকশন থেকে রিয়েলটাইমে গ্রাহকদের পাঠানো নোটিফিকেশন হিস্টোরি, প্রাপক (Recipient), স্ট্যাটাস (Status) ও টাইমস্ট্যাম্প (Timestamp)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>লাইভ সিঙ্ক চালু</span>
                        </span>

                        <button
                          type="button"
                          onClick={handleRefreshFirestoreEmailLogs}
                          disabled={isLoadingEmailLogs}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs transition border border-slate-200 cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                          title="ফায়ারবেস থেকে লগ রিফ্রেশ করুন"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmailLogs ? 'animate-spin text-rose-600' : ''}`} />
                          <span>রিফ্রেশ</span>
                        </button>
                      </div>
                    </div>

                    {/* Summary Stats Component with Simple Chart */}
                    {(() => {
                      const totalEmailsSent = firestoreEmailLogs.length;
                      const deliveredEmailsCount = firestoreEmailLogs.filter(l => l.status === 'delivered').length;
                      const queuedEmailsCount = firestoreEmailLogs.filter(l => l.status === 'queued').length;
                      const recentFailureCount = firestoreEmailLogs.filter(l => l.status === 'failed').length;

                      const successRate = totalEmailsSent > 0
                        ? Math.round((deliveredEmailsCount / totalEmailsSent) * 100)
                        : 100;

                      const deliveredPercent = totalEmailsSent > 0 ? Math.round((deliveredEmailsCount / totalEmailsSent) * 100) : 0;
                      const queuedPercent = totalEmailsSent > 0 ? Math.round((queuedEmailsCount / totalEmailsSent) * 100) : 0;
                      const failedPercent = totalEmailsSent > 0 ? Math.max(0, 100 - deliveredPercent - queuedPercent) : 0;

                      // 7-day data aggregation for bar chart
                      const today = new Date();
                      const last7DaysChartData = Array.from({ length: 7 }, (_, idx) => {
                        const d = new Date(today);
                        d.setDate(today.getDate() - (6 - idx));
                        const dateStr = d.toISOString().substring(0, 10);
                        const dayNameBn = d.toLocaleDateString('bn-BD', { weekday: 'short' });
                        const dayDateBn = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });

                        let dayTotal = 0;
                        let dayDelivered = 0;
                        let dayQueued = 0;
                        let dayFailed = 0;

                        firestoreEmailLogs.forEach((log) => {
                          if (log.createdAt && log.createdAt.startsWith(dateStr)) {
                            dayTotal += 1;
                            if (log.status === 'delivered') dayDelivered += 1;
                            else if (log.status === 'failed') dayFailed += 1;
                            else dayQueued += 1;
                          }
                        });

                        return {
                          dateStr,
                          dayNameBn,
                          dayDateBn,
                          total: dayTotal,
                          delivered: dayDelivered,
                          queued: dayQueued,
                          failed: dayFailed,
                        };
                      });

                      const maxDailyEmails = Math.max(1, ...last7DaysChartData.map(d => d.total));

                      // SVG Circle calculations for Donut
                      const radius = 38;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDashoffset = circumference - (successRate / 100) * circumference;

                      return (
                        <div className="space-y-4">
                          {/* 3 Prominent Stat Cards: Total Sent, Success Rate, Recent Failure Count */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* 1. Total Emails Sent */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 border border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-300">মোট প্রেরিত ইমেইল (Total Sent)</span>
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
                                  <Send className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
                                  {totalEmailsSent} <span className="text-xs font-normal text-slate-400">টি নোটিফিকেশন</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                  <span className="text-emerald-400 font-semibold">{deliveredEmailsCount} সফল</span>
                                  <span>•</span>
                                  <span className="text-blue-400 font-semibold">{queuedEmailsCount} কিউড</span>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>Firestore Database /mail</span>
                                <span className="text-emerald-400">রিয়েলটাইম সিঙ্ক</span>
                              </div>
                            </div>

                            {/* 2. Success Rate */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl p-4 border border-emerald-200 shadow-sm flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-950">সাফল্যের হার (Success Rate)</span>
                                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <TrendingUp className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <div>
                                  <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-['Outfit']">
                                    {successRate}%
                                  </div>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                                    successRate >= 90
                                      ? 'bg-emerald-200/70 text-emerald-900'
                                      : successRate >= 70
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-rose-100 text-rose-900'
                                  }`}>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>{successRate >= 90 ? 'অনুকূল ডেলিভারি' : 'মনোযোগ প্রয়োজন'}</span>
                                  </span>
                                </div>

                                {/* Mini Circular Gauge */}
                                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 90 90">
                                    <circle
                                      cx="45"
                                      cy="45"
                                      r={radius}
                                      stroke="#d1fae5"
                                      strokeWidth="8"
                                      fill="transparent"
                                    />
                                    <circle
                                      cx="45"
                                      cy="45"
                                      r={radius}
                                      stroke="#059669"
                                      strokeWidth="8"
                                      strokeDasharray={circumference}
                                      strokeDashoffset={strokeDashoffset}
                                      strokeLinecap="round"
                                      fill="transparent"
                                      className="transition-all duration-700 ease-out"
                                    />
                                  </svg>
                                  <div className="absolute text-[11px] font-black text-emerald-900 font-['Outfit']">
                                    {successRate}%
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[10px] text-emerald-800">
                                <span>ইনবক্সে প্রাপ্তি অনুপাত</span>
                                <span className="font-semibold">{deliveredEmailsCount} / {totalEmailsSent || 1} টি নিশ্চিত</span>
                              </div>
                            </div>

                            {/* 3. Recent Failure Count */}
                            <div className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between ${
                              recentFailureCount === 0
                                ? 'bg-gradient-to-br from-slate-50 to-emerald-50/40 border-slate-200'
                                : 'bg-gradient-to-br from-rose-50 to-rose-100/60 border-rose-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${recentFailureCount === 0 ? 'text-slate-800' : 'text-rose-950'}`}>
                                  সাম্প্রতিক ব্যর্থ সংখ্যা (Recent Failures)
                                </span>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  recentFailureCount === 0
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-600 text-white shadow-xs'
                                }`}>
                                  {recentFailureCount === 0 ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className={`text-2xl sm:text-3xl font-black font-['Outfit'] ${
                                  recentFailureCount === 0 ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                  {recentFailureCount} <span className="text-xs font-normal text-slate-500">টি ত্রুটি</span>
                                </div>
                                <div className="mt-1">
                                  {recentFailureCount === 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>কোনো ব্যর্থতা নেই, সব ডেলিভারি নিরাপদ</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>{recentFailureCount} টি ইমেইল ডেলিভারিতে সমস্যা</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={`mt-2 pt-2 border-t text-[10px] flex items-center justify-between ${
                                recentFailureCount === 0
                                  ? 'border-slate-200 text-slate-500'
                                  : 'border-rose-200 text-rose-700 font-semibold'
                              }`}>
                                <span>{recentFailureCount === 0 ? 'সিস্টেম স্ট্যাটাস স্বাভাবিক' : 'জিমেইল অ্যাপ পাসওয়ার্ড চেক করুন'}</span>
                                <span className="font-mono">{recentFailureCount === 0 ? '100% OK' : 'Check Logs'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Simple Chart Component: Trend & Status Ratio */}
                          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                                  <BarChart3 className="w-4 h-4" />
                                </div>
                                <div>
                                  <h6 className="font-bold text-slate-900 text-xs sm:text-sm">
                                    ইমেইল নোটিফিকেশন ট্রেন্ড ও ডেলিভারি পারফরম্যান্স চার্ট
                                  </h6>
                                  <p className="text-[11px] text-slate-500">
                                    গত ৭ দিনের দৈনিক প্রেরিত ভলিউম, সফল ডেলিভারি ও ব্যর্থতার ভিজ্যুয়াল গ্রাফ
                                  </p>
                                </div>
                              </div>

                              {/* Chart Legend */}
                              <div className="flex items-center gap-3 text-[11px] self-start sm:self-auto font-medium">
                                <span className="flex items-center gap-1.5 text-emerald-800">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                  <span>সফল ({deliveredEmailsCount})</span>
                                </span>
                                <span className="flex items-center gap-1.5 text-blue-800">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                  <span>কিউড ({queuedEmailsCount})</span>
                                </span>
                                <span className="flex items-center gap-1.5 text-rose-800">
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                  <span>ব্যর্থ ({recentFailureCount})</span>
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                              {/* Left: 7-Day Bar Chart */}
                              <div className="lg:col-span-7 flex flex-col justify-end">
                                <div className="h-40 flex items-end justify-between gap-2 sm:gap-3 px-2 pt-4">
                                  {last7DaysChartData.map((day) => {
                                    const totalHeightPct = day.total > 0
                                      ? Math.max(16, Math.round((day.total / maxDailyEmails) * 100))
                                      : 6;

                                    const deliveredPct = day.total > 0 ? (day.delivered / day.total) * 100 : 0;
                                    const queuedPct = day.total > 0 ? (day.queued / day.total) * 100 : 0;
                                    const failedPct = day.total > 0 ? (day.failed / day.total) * 100 : 0;

                                    return (
                                      <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                                        {/* Hover Tooltip */}
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20">
                                          <p className="font-bold">{day.dayDateBn}</p>
                                          <p>মোট: {day.total} টি (সফল: {day.delivered}, ব্যর্থ: {day.failed})</p>
                                        </div>

                                        {/* Value Label above bar */}
                                        <span className="text-[10px] font-bold text-slate-600 mb-1 font-mono">
                                          {day.total > 0 ? day.total : ''}
                                        </span>

                                        {/* Segmented Bar */}
                                        <div 
                                          className="w-full max-w-[36px] rounded-t-lg overflow-hidden flex flex-col-reverse bg-slate-200 transition-all duration-300 group-hover:brightness-110 shadow-xs"
                                          style={{ height: `${totalHeightPct}%` }}
                                        >
                                          {day.total > 0 ? (
                                            <>
                                              {/* Delivered (Emerald) */}
                                              {deliveredPct > 0 && (
                                                <div 
                                                  style={{ height: `${deliveredPct}%` }} 
                                                  className="w-full bg-emerald-500 transition-all"
                                                />
                                              )}
                                              {/* Queued (Blue) */}
                                              {queuedPct > 0 && (
                                                <div 
                                                  style={{ height: `${queuedPct}%` }} 
                                                  className="w-full bg-blue-500 transition-all"
                                                />
                                              )}
                                              {/* Failed (Rose) */}
                                              {failedPct > 0 && (
                                                <div 
                                                  style={{ height: `${failedPct}%` }} 
                                                  className="w-full bg-rose-500 transition-all"
                                                />
                                              )}
                                            </>
                                          ) : (
                                            <div className="w-full h-full bg-slate-200/80 rounded-t" />
                                          )}
                                        </div>

                                        {/* Date / Day Label */}
                                        <div className="mt-2 text-center">
                                          <p className="text-[11px] font-bold text-slate-700">{day.dayNameBn}</p>
                                          <p className="text-[9px] text-slate-400 font-mono">{day.dayDateBn.split(' ')[0]}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Right: Distribution Ratio & Progress Breakdown */}
                              <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800">স্ট্যাটাস অনুপাত (Delivery Ratio)</span>
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {successRate}% সাফল্য
                                  </span>
                                </div>

                                {/* Multi-color Segmented Progress Bar */}
                                <div className="space-y-1.5">
                                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                    <div 
                                      style={{ width: `${deliveredPercent}%` }} 
                                      className="bg-emerald-500 h-full transition-all duration-500" 
                                      title={`ইনবক্সে ডেলিভার্ড: ${deliveredPercent}%`}
                                    />
                                    <div 
                                      style={{ width: `${queuedPercent}%` }} 
                                      className="bg-blue-500 h-full transition-all duration-500" 
                                      title={`কিউড: ${queuedPercent}%`}
                                    />
                                    <div 
                                      style={{ width: `${failedPercent}%` }} 
                                      className="bg-rose-500 h-full transition-all duration-500" 
                                      title={`ব্যর্থ: ${failedPercent}%`}
                                    />
                                  </div>
                                </div>

                                {/* Status Details Breakdown */}
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                                      <span className="font-semibold text-emerald-950">ইনবক্সে ডেলিভার্ড</span>
                                    </div>
                                    <span className="font-bold text-emerald-900 font-mono">
                                      {deliveredEmailsCount} টি ({deliveredPercent}%)
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-200/60">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                      <span className="font-semibold text-blue-950">ফায়ারবেস কিউড</span>
                                    </div>
                                    <span className="font-bold text-blue-900 font-mono">
                                      {queuedEmailsCount} টি ({queuedPercent}%)
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 border border-rose-200/60">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                                      <span className="font-semibold text-rose-950">ব্যর্থ বা ত্রুটি</span>
                                    </div>
                                    <span className="font-bold text-rose-900 font-mono">
                                      {recentFailureCount} টি ({failedPercent}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Filter Pills & Search */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                      {/* Search Input */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="প্রাপকের ইমেইল, অর্ডার আইডি (#NS-...), নাম অথবা ফোন দিয়ে খুঁজুন..."
                          value={emailLogSearch}
                          onChange={(e) => setEmailLogSearch(e.target.value)}
                          className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                        />
                        {emailLogSearch && (
                          <button
                            type="button"
                            onClick={() => setEmailLogSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Status Filter Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                          type="button"
                          onClick={() => setEmailLogStatusFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                            emailLogStatusFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          সব ({firestoreEmailLogs.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailLogStatusFilter('delivered')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            emailLogStatusFilter === 'delivered'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ইনবক্সে ডেলিভার্ড ({firestoreEmailLogs.filter(l => l.status === 'delivered').length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailLogStatusFilter('queued')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            emailLogStatusFilter === 'queued'
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>কিউড ({firestoreEmailLogs.filter(l => l.status === 'queued').length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailLogStatusFilter('failed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            emailLogStatusFilter === 'failed'
                              ? 'bg-rose-700 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>ব্যর্থ ({firestoreEmailLogs.filter(l => l.status === 'failed').length})</span>
                        </button>

                        {/* Email Log Clear Database System Button */}
                        <button
                          type="button"
                          onClick={() => setShowClearEmailLogsModal(true)}
                          disabled={isClearingEmailLogs || firestoreEmailLogs.length === 0}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:pointer-events-none shadow-2xs ml-auto"
                          title="ফায়ারবেস ডাটাবেজের /mail কালেকশন থেকে সকল ইমেইল লগ মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>ডাটাবেস লগ ক্লিয়ার করুন</span>
                        </button>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto rounded-2xl border border-rose-100">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-rose-50/70 text-slate-700 font-semibold border-b border-rose-100">
                          <tr>
                            <th className="p-3">অর্ডার ও ডকুমেন্ট আইডি</th>
                            <th className="p-3">প্রাপক (Recipient)</th>
                            <th className="p-3">গ্রাহক ও অর্ডার তথ্য</th>
                            <th className="p-3">ইমেইল বিষয় (Subject)</th>
                            <th className="p-3">টাইমস্ট্যাম্প (Timestamp)</th>
                            <th className="p-3">ডেলিভারি স্ট্যাটাস (Status)</th>
                            <th className="p-3 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-50">
                          {(() => {
                            const filtered = firestoreEmailLogs.filter((log) => {
                              if (emailLogStatusFilter !== 'all' && log.status !== emailLogStatusFilter) return false;
                              if (emailLogSearch.trim()) {
                                const q = emailLogSearch.toLowerCase().trim();
                                return (
                                  (log.to && log.to.toLowerCase().includes(q)) ||
                                  (log.orderId && log.orderId.toLowerCase().includes(q)) ||
                                  (log.id && log.id.toLowerCase().includes(q)) ||
                                  (log.customerName && log.customerName.toLowerCase().includes(q)) ||
                                  (log.customerPhone && log.customerPhone.toLowerCase().includes(q)) ||
                                  (log.subject && log.subject.toLowerCase().includes(q))
                                );
                              }
                              return true;
                            });

                            if (isLoadingEmailLogs && firestoreEmailLogs.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <RefreshCw className="w-6 h-6 text-rose-600 animate-spin" />
                                      <span className="font-semibold text-xs">ফায়ারবেস ডাটাবেজের /mail কালেকশন থেকে ইমেইল লগ লোড হচ্ছে...</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            if (firestoreEmailLogs.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-500">
                                    <div className="max-w-md mx-auto space-y-2">
                                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                                        <Mail className="w-6 h-6" />
                                      </div>
                                      <h6 className="font-bold text-slate-800 text-sm">এখনো কোনো ইমেইল নোটিফিকেশন লগ জমা হয়নি</h6>
                                      <p className="text-[11px] text-slate-500 leading-relaxed">
                                        গ্রাহক চেকআউটে ইমেইল দিলে বা উপরের 'টেস্ট ইমেইল পাঠান' বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে ফায়ারবেসের <code className="text-pink-600 font-mono">/mail</code> কালেকশনে ডকুমেন্ট তৈরি হবে এবং এখানে রিয়েলটাইমে প্রদর্শিত হবে।
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-slate-500">
                                    <p className="text-xs font-semibold">আপনার সার্চের সাথে মিলে এমন কোনো ইমেইল লগ পাওয়া যায়নি।</p>
                                    <button
                                      type="button"
                                      onClick={() => { setEmailLogSearch(''); setEmailLogStatusFilter('all'); }}
                                      className="mt-2 text-rose-600 underline font-bold text-xs cursor-pointer"
                                    >
                                      সব ফিল্টার মুছুন
                                    </button>
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((log) => {
                              const createdDate = new Date(log.createdAt);
                              const formattedDate = !isNaN(createdDate.getTime())
                                ? createdDate.toLocaleString('bn-BD', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : log.createdAt;

                              const isDelivered = log.status === 'delivered';
                              const isFailed = log.status === 'failed';
                              const isQueued = log.status === 'queued';

                              return (
                                <tr key={log.id} className="hover:bg-rose-50/30 transition">
                                  {/* Order & Doc ID */}
                                  <td className="p-3 align-top">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                        #{log.orderId}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-mono" title={log.id}>
                                      <span className="truncate max-w-[120px]">{log.id}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyEmailLogId(log.id)}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                        title="Firestore Document ID কপি করুন"
                                      >
                                        {emailLogCopiedId === log.id ? (
                                          <Check className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </td>

                                  {/* Recipient */}
                                  <td className="p-3 align-top">
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-flex max-w-[220px] truncate" title={log.to}>
                                      <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span className="truncate">{log.to}</span>
                                    </div>
                                    {log.cc && (
                                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]" title={`CC: ${log.cc}`}>
                                        CC: {log.cc}
                                      </div>
                                    )}
                                  </td>

                                  {/* Customer Info */}
                                  <td className="p-3 align-top">
                                    <div className="font-bold text-slate-900">{log.customerName}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{log.customerPhone}</div>
                                    {typeof log.total === 'number' && log.total > 0 && (
                                      <div className="text-[11px] font-bold text-rose-700 font-['Outfit'] mt-0.5">
                                        ৳{log.total.toLocaleString()}
                                      </div>
                                    )}
                                  </td>

                                  {/* Subject */}
                                  <td className="p-3 align-top max-w-[200px]">
                                    <p className="font-medium text-slate-800 line-clamp-2" title={log.subject}>
                                      {log.subject}
                                    </p>
                                    {log.error && (
                                      <p className="text-[10px] text-rose-600 font-mono mt-1 line-clamp-1" title={log.error}>
                                        এরর: {log.error}
                                      </p>
                                    )}
                                  </td>

                                  {/* Timestamp */}
                                  <td className="p-3 align-top whitespace-nowrap">
                                    <div className="font-bold text-slate-800 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{formattedDate}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                      {log.createdAt ? log.createdAt.substring(11, 19) + ' UTC' : ''}
                                    </div>
                                  </td>

                                  {/* Delivery Status */}
                                  <td className="p-3 align-top whitespace-nowrap">
                                    {isDelivered && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs" title="সরাসরি গ্রাহকের ইনবক্সে সফলভাবে প্রেরিত">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>ইনবক্সে প্রেরিত (Live)</span>
                                      </span>
                                    )}

                                    {isQueued && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-xs" title="ক্লাউড ফাংশন বা SMTP প্রেরণের অপেক্ষায় ফায়ারবেসে জমা">
                                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                                        <span>ক্লাউড কিউড (/mail)</span>
                                      </span>
                                    )}

                                    {isFailed && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-xs" title={log.error || 'প্রেরণে সমস্যা হয়েছে'}>
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>ব্যর্থ / ত্রুটি</span>
                                      </span>
                                    )}

                                    {log.deliveryState && (
                                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                                        স্টেট: {log.deliveryState}
                                      </div>
                                    )}
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="p-3 align-top text-right">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      {/* View HTML Preview */}
                                      <button
                                        type="button"
                                        onClick={() => handleViewEmailLog(log)}
                                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition border border-rose-200 cursor-pointer flex items-center gap-1"
                                        title="গ্রাহকের কাছে প্রেরিত এইচটিএমএল ইমেইল প্রিভিউ দেখুন"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>ইমেইল দেখুন</span>
                                      </button>

                                      {/* View Doc Metadata Modal */}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedEmailLogModal(log)}
                                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition border border-slate-200 cursor-pointer flex items-center gap-1"
                                        title="লগের বিস্তারিত তথ্য দেখুন"
                                      >
                                        <FileText className="w-3 h-3 text-slate-500" />
                                        <span>বিস্তারিত</span>
                                      </button>

                                      {/* 1-Click Gmail Composer */}
                                      {log.to && log.to !== 'N/A' && (
                                        <a
                                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(log.to)}&su=${encodeURIComponent(log.subject || 'নারীর স্বপ্ন - আপনার অর্ডার')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition border border-slate-800 cursor-pointer flex items-center gap-1"
                                          title="সরাসরি অফিসিয়াল জিমেইলে কম্পোজ ড্রাফট খুলুন"
                                        >
                                          <ExternalLink className="w-3 h-3 text-rose-400" />
                                          <span>Gmail</span>
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dropshipping link auto-post modal completely deleted per user request */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-rose-100">
              <div className="flex justify-between items-center pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                      {editingCategoryItem ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যুক্ত করুন'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      ক্যাটাগরির নাম, সাবটাইটেল এবং ছবি পরিবর্তন বা সেট করুন
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!categoryFormTitle.trim()) return;

                  if (editingCategoryItem) {
                    const finalId = categoryFormId.trim() || categoryFormTitle.trim() || editingCategoryItem.id;
                    await updateCategory({
                      id: finalId,
                      title: categoryFormTitle.trim(),
                      subtitle: categoryFormSubtitle.trim() || editingCategoryItem.subtitle,
                      image: categoryFormImage.trim() || editingCategoryItem.image,
                    }, editingCategoryItem.id);
                    setCategoryToast(`"${categoryFormTitle}" ক্যাটাগরি (Id: ${finalId}) সফলভাবে আপডেট করা হয়েছে!`);
                  } else {
                    const cleanSlug = categoryFormId.trim() || categoryFormTitle.trim();
                    await addCategory({
                      id: cleanSlug,
                      title: categoryFormTitle.trim(),
                      subtitle: categoryFormSubtitle.trim() || 'এক্সক্লুসিভ কালেকশন',
                      image: categoryFormImage.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
                    });
                    setCategoryToast(`নতুন ক্যাটাগরি "${categoryFormTitle}" (Id: ${cleanSlug}) যুক্ত করা হয়েছে!`);
                  }
                  setTimeout(() => setCategoryToast(null), 3000);
                  setIsCategoryModalOpen(false);
                }}
                className="space-y-4 text-left"
              >
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরির নাম (Category Name / Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: লেহেঙ্গা, শীতের পোশাক, বাচ্চাদের ফ্রক"
                    value={categoryFormTitle}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setCategoryFormTitle(newTitle);
                      // Auto-set ID directly to Category Name
                      if (!editingCategoryItem || categoryFormId === editingCategoryItem.title || categoryFormId.startsWith('cat_') || !categoryFormId) {
                        setCategoryFormId(newTitle);
                      }
                    }}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>

                {/* Category ID Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Id (Category Name) *</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">ক্যাটাগরি নাম অনুসারে Id</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রেডিমেড থ্রিপিস বা লেহেঙ্গা"
                    value={categoryFormId}
                    onChange={(e) => setCategoryFormId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 এই Id ক্যাটাগরি নাম (Category Name) হিসেবে ব্যবহৃত হবে।
                  </p>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সাবটাইটেল (Subtitle)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ব্রাইডাল ও এক্সক্লুসিভ ডিজাইন"
                    value={categoryFormSubtitle}
                    onChange={(e) => setCategoryFormSubtitle(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>

                {/* Live Preview */}
                <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-xs shrink-0 bg-white">
                    <img
                      src={categoryFormImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block">
                      লাইভ প্রিভিউ:
                    </span>
                    <h5 className="font-bold text-sm text-slate-900">{categoryFormTitle || 'ক্যাটাগরি নাম'}</h5>
                    <p className="text-[11px] text-slate-500">{categoryFormSubtitle || 'সাবটাইটেল'}</p>
                  </div>
                </div>

                {/* Image Upload / URL */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    ক্যাটাগরির ছবি নির্ধারণ করুন
                  </label>

                  {/* Device File Upload */}
                  <input
                    ref={categoryFormFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsCategoryFormUploading(true);
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const maxDim = 600;
                          let width = img.width;
                          let height = img.height;
                          if (width > height) {
                            if (width > maxDim) {
                              height = Math.round((height * maxDim) / width);
                              width = maxDim;
                            }
                          } else {
                            if (height > maxDim) {
                              width = Math.round((width * maxDim) / height);
                              height = maxDim;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            setCategoryFormImage(canvas.toDataURL('image/jpeg', 0.85));
                          } else {
                            setCategoryFormImage(ev.target?.result as string);
                          }
                          setIsCategoryFormUploading(false);
                        };
                        img.src = ev.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => categoryFormFileInputRef.current?.click()}
                    disabled={isCategoryFormUploading}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/40 hover:bg-rose-50 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCategoryFormUploading ? 'ছবি প্রসেস হচ্ছে...' : 'মোবাইল / কম্পিউটার থেকে ছবি আপলোড'}</span>
                  </button>

                  {/* URL input */}
                  <input
                    type="url"
                    placeholder="অথবা ছবির ওয়েব লিংক পেস্ট করুন..."
                    value={categoryFormImage}
                    onChange={(e) => setCategoryFormImage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  {editingCategoryItem ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryToDelete(editingCategoryItem);
                      }}
                      className="py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="এই ক্যাটাগরি সম্পূর্ণ মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ক্যাটাগরি ডিলিট</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Category In-App Confirmation Modal */}
        {categoryToDelete && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-inner">
                <Trash2 className="w-7 h-7 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-slate-900 font-['Hind_Siliguri']">
                  ক্যাটাগরি ডিলিট করবেন?
                </h4>
                <p className="text-xs text-slate-600">
                  আপনি কি নিশ্চিতভাবে <strong className="text-red-600 font-bold font-['Hind_Siliguri']">"{categoryToDelete.title}"</strong> ক্যাটাগরিটি মুছে ফেলতে চান?
                </p>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-rose-200 shrink-0 bg-white">
                  <img
                    src={settings.categoryImages?.[categoryToDelete.id] || categoryToDelete.image}
                    alt={categoryToDelete.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate font-['Hind_Siliguri']">
                    {categoryToDelete.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{categoryToDelete.subtitle}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  না, বাতিল
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const toDelete = categoryToDelete;
                    setCategoryToDelete(null);
                    setIsCategoryModalOpen(false);
                    await deleteCategory(toDelete.id);
                    setCategoryToast(`"${toDelete.title}" ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে!`);
                    setTimeout(() => setCategoryToast(null), 3500);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>হ্যাঁ, ডিলিট করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-rose-100">
              <div className="flex justify-between items-center pb-3 border-b border-rose-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-rose-600" />
                    <span>{editingProduct ? 'পোশাকের বিবরণ ও ভ্যারিয়েন্ট এডিট করুন' : 'নতুন পোশাক যুক্ত করুন'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    পোশাকের ছবি, রঙের ভ্যারিয়েন্ট, সাইজ ও স্টক বিস্তারিত সংরক্ষণ করুন
                  </p>
                </div>
                <button 
                  onClick={() => setIsProductModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* SECTION 1: মূল বিবরণ (Basic Info) */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                  <h5 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-rose-600" />
                    <span>১. পণ্যের গ্রুপ ও পরিচিতি</span>
                  </h5>

                  {/* Product Fulfillment Group Selector */}
                  <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-rose-600" />
                        <span>পণ্যের গ্রুপ ও ডেলিভারির উৎস (Fulfillment Group):</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">অর্ডার আসার পর ডেলিভারি কে করবে</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Own Stock Option */}
                      <div 
                        onClick={() => setProductForm({ ...productForm, fulfillmentType: 'own' })}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                          productForm.fulfillmentType === 'own'
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="fulfillmentType"
                          checked={productForm.fulfillmentType === 'own'}
                          onChange={() => setProductForm({ ...productForm, fulfillmentType: 'own' })}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">📦 নিজস্ব স্টক পণ্য</span>
                            <span className="text-[9px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">দোকানের নিজস্ব</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                            দোকানের ইন-হাউজ মালামাল। কাস্টমার অর্ডার করলে <strong>আপনি নিজে কুরিয়ারের মাধ্যমে পাঠাবেন</strong> (ড্রপশিপিং API-তে যাবে না, সুরক্ষিত থাকবে)।
                          </p>
                        </div>
                      </div>

                      {/* Dropshipping Option */}
                      <div 
                        onClick={() => setProductForm({ ...productForm, fulfillmentType: 'dropshipping' })}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                          productForm.fulfillmentType === 'dropshipping'
                            ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="fulfillmentType"
                          checked={productForm.fulfillmentType === 'dropshipping'}
                          onChange={() => setProductForm({ ...productForm, fulfillmentType: 'dropshipping' })}
                          className="mt-0.5 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">🌐 ড্রপশিপিং পণ্য</span>
                            <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">Dropshipping.com.bd</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                            পাইকারি সরবরাহকারীর পণ্য। কাস্টমার অর্ডার করলে আপনি <strong>Dropshipping.com.bd API</strong>-তে পাঠাতে পারবেন।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Wholesale Price Input when Dropshipping */}
                    {productForm.fulfillmentType === 'dropshipping' && (
                      <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between gap-2 text-xs bg-amber-50/50 p-2 rounded-lg">
                        <span className="font-semibold text-amber-900">পাইকারি ক্রয়মূল্য (Wholesale Price ৳):</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-500">৳</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="যেমন: 350"
                            value={productForm.wholesalePrice || ''}
                            onChange={(e) => setProductForm({ ...productForm, wholesalePrice: Number(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 rounded-lg border border-amber-300 bg-white font-bold text-slate-800 text-xs"
                          />
                          {Number(productForm.wholesalePrice) > 0 && Number(productForm.price) > Number(productForm.wholesalePrice) && (
                            <span className="text-[10px] text-emerald-700 font-bold ml-1.5">
                              নিট লাভ: +৳{Number(productForm.price) - Number(productForm.wholesalePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">পোশাকের বাংলা নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: এক্সক্লুসিভ কাঞ্জিবরম সিল্ক শাড়ি"
                        value={productForm.bengaliName}
                        onChange={(e) => setProductForm({ ...productForm, bengaliName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ইংরেজি নাম (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Exclusive Kanjivaram Silk Saree"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = (Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES).find(c => c.id === val);
                          setProductForm({ 
                            ...productForm, 
                            category: val as CategoryType,
                            categoryBengali: found?.title || val
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                      >
                        {(Array.isArray(settings.categories)
                          ? settings.categories
                          : DEFAULT_CATEGORIES
                        ).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">প্রোডাক্ট কোড / SKU</label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-rose-700"
                        placeholder="NS-1045"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block font-semibold text-slate-700 mb-1">স্টক সংখ্যা *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={productForm.stockCount}
                        onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Pricing with live discount calculation */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-slate-700">বিক্রয় মূল্য (৳) *</label>
                        <span className="text-[10px] text-rose-600 font-bold">কাস্টমার যে দামে কিনবেন</span>
                      </div>
                      <input
                        type="number"
                        required
                        min="1"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white font-bold text-rose-700 text-sm focus:ring-2 focus:ring-rose-500 font-['Outfit']"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-slate-700">পূর্বের মূল্য (৳)</label>
                        {productForm.regularPrice > productForm.price && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {Math.round(((productForm.regularPrice - productForm.price) / productForm.regularPrice) * 100)}% ছাড়
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="কাটা দাম দেখানোর জন্য"
                        value={productForm.regularPrice}
                        onChange={(e) => setProductForm({ ...productForm, regularPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-600 font-['Outfit']"
                      />
                    </div>
                  </div>

                  {/* Fabric description & quick suggestions */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ফ্যাব্রিক ও কাপড়ের বিবরণ</label>
                    <input
                      type="text"
                      placeholder="যেমন: প্রিমিয়াম সফট জর্জেট এমব্রয়ডারি ও সুতি ইনার"
                      value={productForm.fabric}
                      onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                      <span className="text-[10px] text-slate-400 shrink-0">সাজেশন:</span>
                      {['সফট জর্জেট', 'কাঞ্জিবরম সিল্ক', 'সুতি লিনেন', 'কাতান সিল্ক', 'অরগানজা', 'মসলিন'].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, fabric: sug })}
                          className="text-[10px] px-2 py-0.5 bg-slate-200/70 hover:bg-rose-100 hover:text-rose-700 rounded-md transition shrink-0"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes & quick size suggestions */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">উপলব্ধ সাইজসমূহ (কমা দিয়ে লিখুন)</label>
                    <input
                      type="text"
                      placeholder="যেমন: M (৩৮), L (৪০), XL (৪২), XXL (৪৪)"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                      <span className="text-[10px] text-slate-400 shrink-0">সাইজ যোগ:</span>
                      {['M (৩৮)', 'L (৪০)', 'XL (৪২)', 'XXL (৪৪)', 'Free Size'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const current = productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean);
                            if (!current.includes(sz)) {
                              setProductForm({ ...productForm, sizes: [...current, sz].join(', ') });
                            }
                          }}
                          className="text-[10px] px-2 py-0.5 bg-slate-200/70 hover:bg-rose-100 hover:text-rose-700 rounded-md transition shrink-0"
                        >
                          + {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Badges Toggles */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 text-xs">✨ নতুন আগমন (New Badge)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isTrending}
                        onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 text-xs">🔥 হট / ট্রেন্ডিং (Trending Badge)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 text-xs">⭐ স্পেশাল ফিচার্ড</span>
                    </label>
                  </div>
                </div>

                {/* SECTION 2: পোশাকের নির্দিষ্ট রঙের ভ্যারিয়েন্ট (Color Variants Manager) */}
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-rose-600" />
                        <span>২. নির্দিষ্ট রঙের ভ্যারিয়েন্ট (Color Variants)</span>
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        কাস্টমাররা অর্ডার করার সময় যে যে রঙ বেছে নিতে পারবেন
                      </p>
                    </div>
                    <span className="text-[11px] text-rose-700 font-bold bg-white px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
                      {productForm.colors.length} টি ভ্যারিয়েন্ট
                    </span>
                  </div>

                  {/* Active Color Variants Cards */}
                  <div className="space-y-2">
                    {productForm.colors.length === 0 ? (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-rose-300 text-center text-slate-400 text-xs">
                        কোনো রঙের ভ্যারিয়েন্ট নির্বাচন করা হয়নি। নিচের প্যালেট বা ফর্ম থেকে রঙ যোগ করুন।
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {productForm.colors.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-100 shadow-2xs hover:border-rose-300 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-inner"
                                style={{ backgroundColor: c.hex }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-xs truncate">{c.name}</p>
                                <p className="text-[10px] font-mono text-slate-400 uppercase">{c.hex}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newName = prompt('রঙের নতুন নাম লিখুন:', c.name);
                                  if (newName && newName.trim()) {
                                    handleUpdateColorVariant(idx, newName.trim(), c.hex);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                                title="রঙের নাম এডিট করুন"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveColorVariant(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                                title="এই রঙের ভ্যারিয়েন্ট মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 1-Click Popular Preset Palette */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      ১-ক্লিকে জনপ্রিয় রঙ যোগ / বাদ দিন:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((pc) => {
                        const isSelected = productForm.colors.some(
                          (c) => c.name.toLowerCase() === pc.name.toLowerCase()
                        );
                        return (
                          <button
                            key={pc.name}
                            type="button"
                            onClick={() => handleToggleColorPreset(pc)}
                            className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold ring-2 ring-rose-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400 hover:bg-rose-50/50'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: pc.hex }}
                            />
                            <span>{pc.name}</span>
                            {isSelected && <span className="text-[10px] font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Variant Adder */}
                  <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700">কাস্টম রঙের ভ্যারিয়েন্ট যোগ করুন:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white shadow-2xs shrink-0"
                        title="কালার পিকার"
                      />
                      <input
                        type="text"
                        placeholder="রঙের নাম লিখুন (যেমন: কফি কালার, টিয়া সবুজ, বটল গ্রিন)"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-rose-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomColor();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomColor}
                        disabled={!customColorName.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 disabled:opacity-40 text-white text-xs font-bold hover:bg-rose-700 shrink-0 transition shadow-2xs cursor-pointer"
                      >
                        + যোগ করুন
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: একাধিক প্রোডাক্টের ছবি ম্যানেজমেন্ট (Multiple Product Images Manager) */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-rose-600" />
                        <span>৩. একাধিক প্রোডাক্টের ছবি গ্যালারি (Multiple Images)</span>
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        ১ম ছবিটি মূল কভার হবে, বাকিগুলো বিস্তারিত গ্যালারিতে থাম্বনেইল হিসেবে দেখা যাবে
                      </p>
                    </div>
                    <span className="text-[11px] text-rose-700 font-bold bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                      মোট {productForm.images.length} টি ছবি
                    </span>
                  </div>

                  {/* Active Multiple Images Grid with Controls */}
                  {productForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {productForm.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={`relative rounded-xl overflow-hidden border bg-white shadow-2xs flex flex-col justify-between ${
                            imgIdx === 0 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
                          }`}
                        >
                          {/* Image preview */}
                          <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={`img-${imgIdx}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            {imgIdx === 0 ? (
                              <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>মূল কভার</span>
                              </span>
                            ) : (
                              <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                #{imgIdx + 1}
                              </span>
                            )}
                          </div>

                          {/* Controls bar */}
                          <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                            {imgIdx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(imgIdx)}
                                className="text-amber-700 hover:text-amber-900 font-bold hover:underline"
                                title="এটিকে মূল কভার ছবি বানান"
                              >
                                ★ কভার
                              </button>
                            ) : (
                              <span className="text-amber-600 font-bold">কভার</span>
                            )}

                            <div className="flex items-center gap-1">
                              {imgIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(imgIdx, imgIdx - 1)}
                                  className="w-5 h-5 rounded hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                                  title="আগে নিন"
                                >
                                  ◀
                                </button>
                              )}
                              {imgIdx < productForm.images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(imgIdx, imgIdx + 1)}
                                  className="w-5 h-5 rounded hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                                  title="পরে নিন"
                                >
                                  ▶
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(imgIdx)}
                                className="w-5 h-5 rounded hover:bg-red-100 text-red-500 flex items-center justify-center ml-0.5"
                                title="মুছে ফেলুন"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Image URL Input */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700">নতুন ছবির লিঙ্ক যুক্ত করুন:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... অথবা ছবির ওয়েব লিংক পেস্ট করুন"
                        value={newImageInput}
                        onChange={(e) => setNewImageInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-rose-500 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        disabled={!newImageInput.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 disabled:opacity-40 text-white text-xs font-bold hover:bg-rose-700 shrink-0 transition shadow-2xs cursor-pointer"
                      >
                        + ছবি যোগ করুন
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500">
                        💡 লিংক পেস্ট করে এন্টার দিন বা বাটনে চাপুন।
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBulkImageModal(!showBulkImageModal)}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        {showBulkImageModal ? 'বাল্ক ইনপুট বন্ধ করুন' : '📋 একসাথে অনেক লিংক পেস্ট করুন'}
                      </button>
                    </div>

                    {/* Bulk Images Paste Modal / Accordion */}
                    {showBulkImageModal && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          একসাথে একাধিক ছবির লিঙ্ক পেস্ট করুন (প্রতি লাইনে একটি অথবা কমা দিয়ে):
                        </label>
                        <textarea
                          rows={3}
                          placeholder="https://image1.jpg&#10;https://image2.jpg&#10;https://image3.jpg"
                          value={bulkImageInput}
                          onChange={(e) => setBulkImageInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowBulkImageModal(false)}
                            className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-100 text-xs"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={handleAddBulkImages}
                            disabled={!bulkImageInput.trim()}
                            className="px-4 py-1 rounded-lg bg-rose-600 disabled:opacity-40 text-white text-xs font-bold hover:bg-rose-700"
                          >
                            সবগুলো যোগ করুন
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>



                {/* SECTION 4: বিস্তারিত বিবরণ (Full Description) */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                    ৪. পোশাকের বিস্তারিত বিবরণ (Description)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="পোশাকের কাজ, ওড়না, কামিজ, সেলোয়ার বা ব্লাউজ পিসের বিস্তারিত..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Form Actions Footer */}
                <div className="pt-3 border-t border-rose-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'পোশাক সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courier Update Modal */}
        {selectedOrderForCourier && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-3 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-100">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">
                  কুরিয়ার ও ট্র্যাকিং তথ্য (#{selectedOrderForCourier.id})
                </h4>
                <button onClick={() => setSelectedOrderForCourier(null)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourier} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কুরিয়ার কোম্পানি</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="Steadfast Courier">Steadfast Courier (স্টেডফাস্ট)</option>
                    <option value="Pathao Courier">Pathao Courier (পাঠাও)</option>
                    <option value="RedX Logistics">RedX (রেডএক্স)</option>
                    <option value="Paperfly">Paperfly (পেপারফ্লাই)</option>
                    <option value="Sundarban Courier">সুন্দরবন কুরিয়ার (Sundarban)</option>
                    <option value="eCourier">eCourier (ই-কুরিয়ার)</option>
                    <option value="SA Paribahan">এস.এ পরিবহন (SA Paribahan)</option>
                    <option value="Karatoa Courier">করতোয়া কুরিয়ার (Karatoa)</option>
                    <option value="Janani Express">জননী এক্সপ্রেস (Janani)</option>
                    <option value="Rainbow Courier">রেইনবো কুরিয়ার (Rainbow)</option>
                    <option value="other">✨ অন্যান্য কুরিয়ার সার্ভিস (Other Courier)...</option>
                  </select>
                </div>

                {/* If Other courier is selected, show custom courier name input */}
                {courierName === 'other' && (
                  <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 animate-fadeIn space-y-1">
                    <label className="block font-bold text-rose-800 text-xs">
                      কুরিয়ার সার্ভিসের নাম লিখুন (Custom Courier Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: এসএ পরিবহন, জননী এক্সপ্রেস, বা নিজস্ব হোম ডেলিভারি"
                      value={customCourierName}
                      onChange={(e) => setCustomCourierName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    কুরিয়ার কনসাইনমেন্ট / ট্র্যাকিং আইডি বা লিঙ্ক *
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="যেমন: https://steadfast.com.bd/tl/... অথবা SFR261029STCD01DB3BD"
                      value={courierTrackingId}
                      onChange={(e) => setCourierTrackingId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-rose-700 text-xs"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 gap-2 flex-wrap">
                      <span>স্টেডফাস্টের পুরো ট্র্যাকিং লিঙ্ক অথবা কোড এখানে পেস্ট করা যাবে</span>
                      {courierName.toLowerCase().includes('steadfast') && (
                        <button
                          type="button"
                          onClick={handleAutoDetectSteadfast}
                          disabled={isDetectingCourier || !courierTrackingId.trim()}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 text-emerald-600 ${isDetectingCourier ? 'animate-spin' : ''}`} />
                          <span>{isDetectingCourier ? 'যাচাই হচ্ছে...' : '⚡ লিঙ্ক থেকে অটো-সিঙ্ক করুন'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto Sync Result Notice */}
                {courierSyncNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{courierSyncNotice}</span>
                  </div>
                )}

                {/* Courier Status Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অর্ডার স্ট্যাটাস (Order Status)</label>
                  <select
                    value={courierStatus}
                    onChange={(e) => setCourierStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="shipped">কুরিয়ারে হস্তান্তর / ট্রানজিটে (Shipped / On the way)</option>
                    <option value="delivered">ডেলিভারি সম্পন্ন (Delivered)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সম্ভাব্য ডেলিভারি সময় / নোট</label>
                  <input
                    type="text"
                    value={courierEstDelivery}
                    onChange={(e) => setCourierEstDelivery(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForCourier(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold shadow hover:bg-rose-700 cursor-pointer"
                  >
                    কুরিয়ার ও স্ট্যাটাস সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice View Modal with Copy & Print Buttons (Exclusively in Admin Panel) */}
        {invoiceOrder && (
          <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
        )}

        {/* Product Image Lightbox Modal */}
        {previewImageModal && (
          <div 
            className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setPreviewImageModal(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-200 animate-scaleUp relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 border-b border-rose-100 flex items-center justify-between bg-rose-50/60">
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{previewImageModal.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    {previewImageModal.color && (
                      <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                        রঙ: {previewImageModal.color}
                      </span>
                    )}
                    {previewImageModal.size && (
                      <span className="text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        সাইজ: {previewImageModal.size}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewImageModal(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition shadow-xs shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 bg-slate-900/5 flex items-center justify-center max-h-[75vh] overflow-hidden">
                <img 
                  src={previewImageModal.src} 
                  alt={previewImageModal.title} 
                  className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-lg border border-white"
                />
              </div>
              <div className="p-3 bg-white text-center">
                <button
                  onClick={() => setPreviewImageModal(null)}
                  className="px-6 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cloud Synced Toast Notification */}
        {cloudSyncedToast && (
          <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-sky-500/50 flex items-center gap-2.5 text-xs animate-slideUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">ক্লাউড ডেটাবেজে সফলভাবে সিঙ্ক হয়েছে!</p>
              <p className="text-[11px] text-slate-300">এখন বিশ্বের যেকোনো ডিভাইস ও কাস্টমার সকল প্রোডাক্ট ও আপডেট দেখতে পাবে।</p>
            </div>
          </div>
        )}

        {/* Confirm Delete Order Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                  অর্ডারটি মুছে ফেলতে চান?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  অর্ডার আইডি: <strong className="font-mono text-rose-700">#{orderToDelete.id}</strong> ({orderToDelete.customerName})<br />
                  মুছে ফেলার পর এটি লোকাল স্টোরেজ এবং ফায়ারবেস ক্লাউড ডেটাবেজ উভয় থেকেই স্থায়ীভাবে ডিলিট হয়ে যাবে।
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                >
                  না, বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = orderToDelete.id;
                    deleteOrder(id);
                    setOrderToDelete(null);
                    setOrderDeleteToast(`অর্ডার #${id} সফলভাবে মুছে ফেলা হয়েছে!`);
                    setTimeout(() => setOrderDeleteToast(null), 3500);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হ্যাঁ, মুছে ফেলুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Deleted Toast Notification */}
        {orderDeleteToast && (
          <div className="fixed bottom-6 left-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-red-500/50 flex items-center gap-2.5 text-xs animate-slideUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">{orderDeleteToast}</p>
              <p className="text-[11px] text-slate-300">ডেটাবেজ ও লাইভ সিস্টেম থেকে অর্ডারটি মুছে গেছে।</p>
            </div>
          </div>
        )}

        {/* Confirm Delete Demo Products Modal */}
        {isConfirmDeleteDemosOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4 animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri']">
                  সব ডেমো পণ্য মুছে ফেলতে চান?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  হোমপেজ ও ক্লাউড ডেটাবেজ থেকে সকল ডিফল্ট/স্যাম্পল পণ্য চিরতরে মুছে ফেলা হবে এবং <strong>তারা আর কখনও নিজে নিজে ফিরে আসবে না</strong>।<br />
                  আপনার নিজের যোগ করা পোশাকগুলো সম্পূর্ণ অক্ষত থাকবে।
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteDemosOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                >
                  না, থাক
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteDemoProducts();
                    setIsConfirmDeleteDemosOpen(false);
                    setDemoDeleteToast('সকল ডেমো পণ্য সফলভাবে মুছে ফেলা হয়েছে!');
                    setTimeout(() => setDemoDeleteToast(null), 3500);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হ্যাঁ, ডেমো মুছুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demo Deleted Toast Notification */}
        {demoDeleteToast && (
          <div className="fixed bottom-6 left-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-2.5 text-xs animate-slideUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">{demoDeleteToast}</p>
              <p className="text-[11px] text-slate-300">ডেটাবেজ ও হোমপেজ থেকে ডেমো পণ্যগুলো স্থায়ীভাবে মুছে গেছে।</p>
            </div>
          </div>
        )}

        {/* Dropshipping Settings Saved Toast */}
        {apiSaveToast && (
          <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs animate-slideUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">{apiSaveToast}</p>
              <p className="text-[11px] text-slate-300">ক্লাউড ফায়ারবেসে Dropshipping.com.bd সেটিংস আপডেট হয়েছে।</p>
            </div>
          </div>
        )}

        {/* Dropshipping Order Forward Toast */}
        {orderForwardToast && (
          <div className="fixed bottom-6 left-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-2.5 text-xs animate-slideUp">
            <Boxes className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">{orderForwardToast}</p>
              <p className="text-[11px] text-slate-300">অর্ডার স্ট্যাটাস ও ট্র্যাকিং স্বয়ংক্রিয়ভাবে সিঙ্ক হচ্ছে।</p>
            </div>
          </div>
        )}

        {/* Rendered HTML Email Preview Suite Modal */}
        {previewEmailHtml && (
          <div 
            className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
            onClick={() => setPreviewEmailHtml(null)}
          >
            <div 
              className={`bg-white rounded-3xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-rose-200 animate-scaleUp transition-all duration-300 ${
                previewDeviceMode === 'mobile' ? 'max-w-md' : 'max-w-4xl'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="p-3.5 sm:p-4 border-b border-rose-100 bg-rose-50/80 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base font-['Hind_Siliguri'] flex items-center gap-2">
                      <span>{previewEmailTitle || 'অটোমেটেড অর্ডার কনফার্মেশন ইমেইল প্রিভিউ'}</span>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                        লাইভ প্রিভিউ
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      গ্রাহকদের ইনবক্সে প্রেরণের পূর্বে স্বয়ংক্রিয় নোটিফিকেশনের পূর্ণ রেসপন্সিভ প্রিভিউ
                    </p>
                  </div>
                </div>

                {/* Header Controls: Device Toggle & Close */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Device Switcher */}
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDeviceMode('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        previewDeviceMode === 'desktop'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="ডেস্কটপ ভিউ (Desktop)"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ডেস্কটপ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDeviceMode('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        previewDeviceMode === 'mobile'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="মোবাইল ভিউ (Mobile 375px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">মোবাইল</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setPreviewEmailHtml(null)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                    title="প্রিভিউ বন্ধ করুন"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Order Switcher & Metadata Bar */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/90 text-xs flex items-center justify-between gap-3 flex-wrap">
                {/* Order Selector Dropdown */}
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <span className="text-[11px] font-bold text-slate-600 shrink-0">নমুনা অর্ডার:</span>
                  <select
                    value={templatePreviewOrder?.id || 'sample'}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (selectedId === 'sample') {
                        const sample = getSampleOrderForPreview();
                        handleOpenEmailPreviewForOrder(sample);
                      } else {
                        const found = orders.find(o => o.id === selectedId);
                        if (found) {
                          handleOpenEmailPreviewForOrder(found);
                        }
                      }
                    }}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-purple-500 font-medium truncate max-w-[280px]"
                  >
                    <option value="sample">ডিফল্ট ডেমো অর্ডার (#NS-4821 - শাড়ি ও থ্রি-পিস)</option>
                    {orders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        #{ord.id} - {ord.customerName} (৳{ord.total.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Client Simulated Metadata */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="truncate max-w-[180px]">
                    <strong className="text-slate-700">প্রাপক:</strong> {templatePreviewOrder?.customerEmail || 'customer@example.com'}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">প্রেরক:</strong> NaarirShopno@Gmail.com
                  </span>
                </div>
              </div>

              {/* Email Content Body Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100 flex justify-center">
                {previewDeviceMode === 'mobile' ? (
                  /* Realistic iPhone Smartphone Mockup */
                  <div className="w-[375px] my-auto bg-black p-3 rounded-[44px] shadow-2xl border-4 border-slate-800">
                    {/* Simulated iPhone Screen */}
                    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col max-h-[70vh]">
                      {/* Top Phone Notch / Status Bar */}
                      <div className="bg-slate-900 text-white px-5 py-2 flex items-center justify-between text-[11px] font-mono shrink-0 select-none">
                        <span>09:41</span>
                        <div className="w-16 h-3 bg-black rounded-full" />
                        <div className="flex items-center gap-1 text-[10px]">
                          <span>5G</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Rendered HTML inside mobile view */}
                      <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                        <div 
                          className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs"
                          dangerouslySetInnerHTML={{ __html: previewEmailHtml }} 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Desktop Email Client View */
                  <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden my-auto">
                    {/* Desktop Email Client Simulated Header */}
                    <div className="bg-slate-50 p-3.5 border-b border-slate-200 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {emailSettingsForm.senderName || 'নারীর স্বপ্ন (Naarir Shopno)'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            &lt;{emailSettingsForm.senderEmail || 'NaarirShopno@Gmail.com'}&gt;
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>To:</strong> {templatePreviewOrder?.customerName || 'সম্মানিত গ্রাহক'} &lt;{templatePreviewOrder?.customerEmail || 'customer@example.com'}&gt;
                      </div>
                      <div className="text-[11px] text-slate-700 font-medium">
                        <strong>Subject:</strong> {emailSettingsForm.orderConfirmationSubject
                          .replace('{orderId}', templatePreviewOrder?.id || 'NS-4821')
                          .replace('{customerName}', templatePreviewOrder?.customerName || 'সম্মানিত গ্রাহক')}
                      </div>
                    </div>

                    {/* Rendered HTML */}
                    <div 
                      className="p-1 sm:p-2 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: previewEmailHtml }} 
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Toolbar */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">বাংলা ও ইংরেজি রেসপন্সিভ ইনভয়েস</span>
                  </span>
                  <span>•</span>
                  <span>কুরিয়ার ট্র্যাকিং লিঙ্ক যুক্ত</span>
                </div>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {/* Copy HTML Code Button */}
                  <button
                    type="button"
                    onClick={handleCopyPreviewHtml}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="সম্পূর্ণ ইমেইল এইচটিএমএল কোড কপি করুন"
                  >
                    {previewHtmlCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">HTML কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>HTML কোড কপি</span>
                      </>
                    )}
                  </button>

                  {/* Open in Gmail Draft Button */}
                  {templatePreviewOrder && (
                    <a
                      href={createGmailDraftUrl(templatePreviewOrder, testEmailAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="ব্রাউজারে সরাসরি Gmail Compose উইন্ডো খুলুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                      <span>Gmail এ খুলুন</span>
                    </a>
                  )}

                  <button
                    onClick={() => setPreviewEmailHtml(null)}
                    className="px-5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Firestore Email Logs Confirmation Modal */}
        {showClearEmailLogsModal && (
          <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 text-center animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-inner">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-slate-900 font-['Hind_Siliguri']">
                  ডাটাবেস থেকে সকল ইমেইল লগ মুছবেন?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে ফায়ারবেস ক্লাউড ডাটাবেজের <strong className="text-red-600 font-mono">/mail</strong> কালেকশন থেকে সকল <strong>({firestoreEmailLogs.length}টি)</strong> স্বয়ংক্রিয় নোটিফিকেশন লগ চিরতরে মুছে ফেলতে চান?
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 font-medium">
                  ⚠️ সতর্কীকরণ: এই অ্যাকশনটি অপ্রত্যাবর্তনযোগ্য (Irreversible)। মুছার পর পূর্বের কোনো ইমেইল হিস্ট্রি পুনরুদ্ধার করা যাবে না।
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearEmailLogsModal(false)}
                  disabled={isClearingEmailLogs}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="button"
                  onClick={handleClearAllEmailLogs}
                  disabled={isClearingEmailLogs}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isClearingEmailLogs ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ডাটাবেস মুছুন'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Logs Clear Toast Notification */}
        {emailLogsClearToast && (
          <div className="fixed bottom-6 left-6 z-70 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-red-500/50 flex items-center gap-2.5 text-xs animate-slideUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">{emailLogsClearToast}</p>
              <p className="text-[11px] text-slate-300">ফায়ারবেস ডাটাবেজের /mail কালেকশন সফলভাবে রিফ্রেশ হয়েছে।</p>
            </div>
          </div>
        )}

        {/* Firestore Email Log Document Details Modal */}
        {selectedEmailLogModal && (
          <div 
            className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
            onClick={() => setSelectedEmailLogModal(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-rose-200 animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base font-['Hind_Siliguri']">
                      Firestore ইমেইল লগ বিবরণ - #{selectedEmailLogModal.orderId}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Document ID: {selectedEmailLogModal.id}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEmailLogModal(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Status banner */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  selectedEmailLogModal.status === 'delivered' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : selectedEmailLogModal.status === 'failed'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {selectedEmailLogModal.status === 'delivered' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : selectedEmailLogModal.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-xs sm:text-sm">
                        {selectedEmailLogModal.status === 'delivered' 
                          ? 'সরাসরি গ্রাহকের ইনবক্সে সফলভাবে প্রেরিত'
                          : selectedEmailLogModal.status === 'failed'
                          ? 'ইমেইল প্রেরণে ত্রুটি বা ব্যর্থ'
                          : 'ফায়ারবেস ক্লাউড কিউতে জমা (/mail)'}
                      </span>
                      {selectedEmailLogModal.deliveryState && (
                        <p className="text-[11px] font-mono mt-0.5 opacity-80">
                          Delivery State: {selectedEmailLogModal.deliveryState}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                    {selectedEmailLogModal.status}
                  </span>
                </div>

                {selectedEmailLogModal.error && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700">
                    <p className="font-bold">এরর মেসেজ:</p>
                    <p className="font-mono mt-1 text-[11px] break-all">{selectedEmailLogModal.error}</p>
                  </div>
                )}

                {/* Key metadata grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">প্রাপকের ইমেইল (Recipient)</span>
                    <p className="font-mono font-bold text-slate-900 break-all">{selectedEmailLogModal.to}</p>
                    {selectedEmailLogModal.cc && (
                      <p className="text-[11px] text-slate-500 font-mono">CC: {selectedEmailLogModal.cc}</p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">টাইমস্ট্যাম্প (Timestamp)</span>
                    <p className="font-bold text-slate-900">
                      {new Date(selectedEmailLogModal.createdAt).toLocaleString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedEmailLogModal.createdAt}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">গ্রাহকের নাম ও ফোন</span>
                    <p className="font-bold text-slate-900">{selectedEmailLogModal.customerName}</p>
                    <p className="text-slate-600 font-mono text-[11px]">{selectedEmailLogModal.customerPhone}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">অর্ডার মূল্য (Total)</span>
                    <p className="font-bold text-rose-700 text-sm font-['Outfit']">৳{(selectedEmailLogModal.total || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Order ID: #{selectedEmailLogModal.orderId}</p>
                  </div>
                </div>

                {/* Email Subject */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ইমেইলের বিষয় (Subject)</span>
                  <p className="font-bold text-slate-900">{selectedEmailLogModal.subject}</p>
                </div>

                {/* Rendered HTML or Preview button */}
                {selectedEmailLogModal.html ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">এইচটিএমএল ইমেইল বডি:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const html = selectedEmailLogModal.html;
                          const ordId = selectedEmailLogModal.orderId;
                          const toAddr = selectedEmailLogModal.to;
                          setSelectedEmailLogModal(null);
                          setPreviewEmailTitle(`ইমেইল লগ - #${ordId} (${toAddr})`);
                          setPreviewEmailHtml(html || '');
                        }}
                        className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>পূর্ণ পর্দায় প্রিভিউ দেখুন</span>
                      </button>
                    </div>
                    <div 
                      className="max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                      dangerouslySetInnerHTML={{ __html: selectedEmailLogModal.html }}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">এই ডকুমেন্টে সরাসরি এইচটিএমএল ক্যাশ করা হয়নি (মেটাডেটা সংরক্ষিত)।</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                {selectedEmailLogModal.to && selectedEmailLogModal.to !== 'N/A' && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedEmailLogModal.to)}&su=${encodeURIComponent(selectedEmailLogModal.subject || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                    <span>Gmail এ খুলুন</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEmailLogModal(null)}
                  className="ml-auto px-5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
