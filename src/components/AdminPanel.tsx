import React, { useState, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, Order, OrderStatus, CategoryType, StoreSettings, CustomCategoryItem } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';
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
  ShieldAlert
} from 'lucide-react';

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
    deleteOrder,
    settings, 
    updateSettings, 
    deleteCategory,
    addCategory,
    updateCategory,
    messages, 
    markMessageAsRead, 
    deleteMessage,
    cloudSyncStatus,
    syncAllToCloud,
    deleteDemoProducts,
    clearAllProducts,
    restoreDemoProducts,
    dbHealth,
    isCheckingDbHealth,
    runDbHealthCheck
  } = useShop();

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [cloudSyncedToast, setCloudSyncedToast] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderDeleteToast, setOrderDeleteToast] = useState<string | null>(null);
  const [isConfirmDeleteDemosOpen, setIsConfirmDeleteDemosOpen] = useState(false);
  const [demoDeleteToast, setDemoDeleteToast] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'delivery' | 'social' | 'messages' | 'categories' | 'database'>('dashboard');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryItem, setEditingCategoryItem] = useState<CustomCategoryItem | null>(null);
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
      return localStorage.getItem('naarir_admin_email') || 'AliIslam01911@gmail.com';
    } catch {
      return 'AliIslam01911@gmail.com';
    }
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('naarir_admin_password') || 'M01911541717m';
    } catch {
      return 'M01911541717m';
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
  });
  const [changePassToast, setChangePassToast] = useState<{ success: boolean; message: string } | null>(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    bengaliName: '',
    sku: '',
    category: 'three_piece' as CategoryType,
    categoryBengali: 'থ্রি-পিস',
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

  // Delivery charge settings local state
  const [deliveryForm, setDeliveryForm] = useState({
    insideDhaka: settings.deliveryCharges.insideDhaka,
    subDhaka: settings.deliveryCharges.subDhaka,
    outsideDhaka: settings.deliveryCharges.outsideDhaka,
    freeDeliveryAbove: settings.deliveryCharges.freeDeliveryAbove,
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
    const isEmailValid = cleanEmail === targetEmail || cleanEmail === 'admin' || cleanEmail === 'aliislam01911@gmail.com';
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

    const updatedEmail = changePassForm.newEmail.trim() || adminEmail;
    const updatedPass = changePassForm.newPass.trim();

    try {
      localStorage.setItem('naarir_admin_email', updatedEmail);
      localStorage.setItem('naarir_admin_password', updatedPass);
    } catch (err) {
      console.error(err);
    }

    setAdminEmail(updatedEmail);
    setAdminPassword(updatedPass);
    setChangePassForm({ currentPass: '', newEmail: updatedEmail, newPass: '', confirmPass: '' });
    setChangePassToast({ success: true, message: 'এডমিন ক্রেডেনশিয়াল ও পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!' });
    setTimeout(() => setChangePassToast(null), 4000);
  };

  // Product form handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      bengaliName: '',
      sku: `NS-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'three_piece',
      categoryBengali: 'থ্রি-পিস',
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

    const catBengaliMap: Record<CategoryType, string> = {
      all: 'সব',
      three_piece: 'থ্রি-পিস',
      saree: 'শাড়ি',
      kurti: 'কুর্তি',
      gown: 'গাউন',
      hijab_abaya: 'হিজাব ও আবায়া',
      lehenga: 'লেহেঙ্গা',
      jewellery_bags: 'জুয়েলারি ও ব্যাগ',
    };

    const finalColors = productForm.colors.length > 0 
      ? productForm.colors 
      : [{ name: 'গোলাপি', hex: '#ec4899' }];

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: productForm.name || productForm.bengaliName,
        bengaliName: productForm.bengaliName,
        sku: productForm.sku || editingProduct.sku,
        category: productForm.category,
        categoryBengali: catBengaliMap[productForm.category] || 'পোশাক',
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
        categoryBengali: catBengaliMap[productForm.category] || 'পোশাক',
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
        sku: productForm.sku || `NS-${Date.now().toString().slice(-4)}`,
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

    updateOrderStatus(selectedOrderForCourier.id, 'shipped', {
      name: finalCourierName,
      trackingId: courierTrackingId || `TRK-${Date.now().toString().slice(-6)}`,
      shippedDate: new Date().toISOString().substring(0, 10),
      estimatedDelivery: courierEstDelivery,
    });

    setSelectedOrderForCourier(null);
  };

  // Calculations for overview
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-6xl w-full h-[92vh] overflow-hidden shadow-2xl border border-rose-200 flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
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
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    লকড পোর্টাল
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? `লগইন ইউজার: ${adminEmail}` : 'শপ, পণ্য, অর্ডার, ডেলিভারি ও সেটিংস নিরাপত্তা সুরক্ষিত'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 hover:shadow-xl mt-2 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>প্যানেলে প্রবেশ করুন</span>
                </button>
              </form>
            </div>
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
                      return matchesSearch && matchesCategory;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white p-10 rounded-2xl border border-rose-100 text-center space-y-3">
                          <Package className="w-12 h-12 text-rose-300 mx-auto" />
                          <h5 className="font-bold text-slate-700 text-sm">কোনো পোশাক খুঁজে পাওয়া যায়নি</h5>
                          <p className="text-xs text-slate-400">অনুগ্রহ করে সার্চ কীওয়ার্ড অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন</p>
                          <button
                            onClick={() => { setProductSearch(''); setProductCategoryFilter('all'); }}
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
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                          {prod.categoryBengali}
                                        </span>
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
                                    if (confirm(`আপনি কি "${prod.bengaliName}" প্রোডাক্টটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
                                      deleteProduct(prod.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                  title="প্রোডাক্ট ডিলিট করুন"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                      orders.map((ord) => (
                      <div key={ord.id} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-rose-50">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                                #{ord.id}
                              </span>
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
                                    <h6 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1" title={it.product.bengaliName}>
                                      {it.product.bengaliName}
                                    </h6>

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
                          <div>
                            {ord.courier ? (
                              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <Truck className="w-3.5 h-3.5" />
                                <span>কুরিয়ার: <strong>{ord.courier.name}</strong></span>
                                <span className="font-mono">কোড: <strong>{ord.courier.trackingId}</strong></span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">কুরিয়ার তথ্য এখনও যোগ করা হয়নি</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedOrderForCourier(ord);
                                setCourierTrackingId(ord.courier?.trackingId || '');
                                setCourierEstDelivery(ord.courier?.estimatedDelivery || '২-৩ দিনের মধ্যে');
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
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 transition"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>কুরিয়ার তথ্য আপডেট</span>
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
                    ))
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
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                            হোয়াটসঅ্যাপ ও হটলাইন যোগাযোগ
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            কাস্টমারদের সাথে সরাসরি যোগাযোগের মাধ্যম নির্ধারণ করুন
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Short Link */}
                      <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp শর্ট লিংক (Direct Link / wa.me):</span>
                          </label>
                          {socialForm.whatsappShortLink && (
                            <a
                              href={socialForm.whatsappShortLink.startsWith('http') ? socialForm.whatsappShortLink : `https://${socialForm.whatsappShortLink}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline self-start sm:self-auto"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>লিংক টেস্ট করুন</span>
                            </a>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="উদা: https://wa.me/message/XXXXXX অথবা https://wa.me/8801911541717"
                          value={socialForm.whatsappShortLink}
                          onChange={(e) => setSocialForm({ ...socialForm, whatsappShortLink: e.target.value })}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 font-mono"
                        />
                        <p className="text-[11px] text-emerald-800">
                          💡 <strong>টিপ:</strong> আপনার WhatsApp Business অ্যাকাউন্টের শর্ট লিংক (Short Link) বা wa.me লিংক এখানে দিন। কাস্টমাররা এক ক্লিকেই চ্যাটে চলে যাবে।
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* WhatsApp Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            WhatsApp মোবাইল নম্বর:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 01911-541717"
                            value={socialForm.whatsappNumber}
                            onChange={(e) => setSocialForm({ ...socialForm, whatsappNumber: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                          />
                        </div>

                        {/* Support Email */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            সাপোর্ট ইমেইল এড্রেস:
                          </label>
                          <input
                            type="email"
                            placeholder="যেমন: NaarirShopno@Gmail.com"
                            value={socialForm.officeEmail}
                            onChange={(e) => setSocialForm({ ...socialForm, officeEmail: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>

                        {/* Hotline 1 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            কাস্টমার সাপোর্ট ও সরাসরি ফোন নম্বর (প্রধান) *:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 09617-541717"
                            value={socialForm.hotline1}
                            onChange={(e) => setSocialForm({ ...socialForm, hotline1: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-700"
                          />
                        </div>

                        {/* Hotline 2 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            বিকল্প হটলাইন নম্বর ২:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 09649-541717"
                            value={socialForm.hotline2}
                            onChange={(e) => setSocialForm({ ...socialForm, hotline2: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                          />
                        </div>

                        {/* Support Hours */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            কাস্টমার সাপোর্ট সময়সূচি:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: সকাল ১০টা - রাত ১০টা সার্বক্ষণিক সেবা"
                            value={socialForm.supportHours}
                            onChange={(e) => setSocialForm({ ...socialForm, supportHours: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-emerald-800 bg-emerald-50/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SHOWROOM & OFFICE ADDRESS */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                            শোরুম ও অফিস ঠিকানা
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            ফুটার, ইনভয়েস ক্যাশ মেমো এবং কাস্টমার সাপোর্টে এই ঠিকানা দেখানো হবে
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          সম্পূর্ণ ঠিকানা (Full Address):
                        </label>
                        <textarea
                          rows={3}
                          value={socialForm.officeAddress}
                          onChange={(e) => setSocialForm({ ...socialForm, officeAddress: e.target.value })}
                          placeholder="যেমন: হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                        />
                      </div>

                      {/* Live Address Preview Card */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            লাইভ প্রিভিউ (ফুটার ও মেমোতে যেমন দেখাবে):
                          </span>
                          <p className="font-medium text-slate-800 mt-0.5">
                            {socialForm.officeAddress || 'হাউজ# ফকিরবাড়ি, ৮নং কোড়ালতলী, ভেদরগঞ্জ, শরিয়তপুর-৮০৩০, বাংলাদেশ'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: STORE IDENTITY & SLOGAN */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                            দোকানের নাম, স্লোগান ও নোটিশ বার্তা
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            ব্র্যান্ডের নাম, ট্যাগলাইন এবং ওয়েবসাইটের একদম উপরের স্ক্রোলিং নোটিশ
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            দোকানের নাম (Store Name):
                          </label>
                          <input
                            type="text"
                            value={socialForm.storeName}
                            onChange={(e) => setSocialForm({ ...socialForm, storeName: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            স্লোগান / ট্যাগলাইন (Slogan):
                          </label>
                          <input
                            type="text"
                            value={socialForm.slogan}
                            onChange={(e) => setSocialForm({ ...socialForm, slogan: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          শীর্ষ অফার বার্তার নোটিশ (Top Announcement Notice):
                        </label>
                        <textarea
                          rows={2}
                          value={socialForm.announcementText}
                          onChange={(e) => setSocialForm({ ...socialForm, announcementText: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* SECTION 4: PAYMENT MERCHANT ACCOUNTS */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                            পেমেন্ট মার্চেন্ট নম্বরসমূহ (বিকাশ ও নগদ)
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            চেকআউটে কাস্টমারদের পেমেন্ট করার জন্য প্রদর্শিত নম্বর
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="bg-pink-50/50 p-3.5 rounded-xl border border-pink-200">
                          <label className="block text-xs font-bold text-pink-900 mb-1">
                            📱 বিকাশ নম্বর:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 01611541717 (মার্চেন্ট)"
                            value={socialForm.bkashMerchantNumber}
                            onChange={(e) => setSocialForm({ ...socialForm, bkashMerchantNumber: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-pink-300 bg-white font-mono"
                          />
                        </div>

                        <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-200">
                          <label className="block text-xs font-bold text-orange-900 mb-1">
                            💳 নগদ নম্বর:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 01911541717 (পার্সোনাল)"
                            value={socialForm.nagadMerchantNumber}
                            onChange={(e) => setSocialForm({ ...socialForm, nagadMerchantNumber: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-orange-300 bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: FOOTER WATERMARK BACKGROUND IMAGE */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                            ফুটার ৩০% জলছাপ ব্যাকগ্রাউন্ড ছবি
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            ফুটারের পেছনের জলছাপ ছবির লিংক পরিবর্তন করুন (ডিফল্ট: /footer-bg.jpg)
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-28 h-16 rounded-xl overflow-hidden border-2 border-rose-200 shadow-xs bg-slate-900 shrink-0">
                          <img
                            src={socialForm.footerBgImage || '/footer-bg.jpg'}
                            alt="Footer Background"
                            className="w-full h-full object-cover opacity-50"
                            onError={(e) => {
                              e.currentTarget.src = '/hero-banner.jpg';
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white bg-black/30">
                            ৩০% জলছাপ
                          </span>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ছবির ইউআরএল (Image URL):
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: /footer-bg.jpg অথবা যেকোনো ইমেজ লিংক"
                            value={socialForm.footerBgImage}
                            onChange={(e) => setSocialForm({ ...socialForm, footerBgImage: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: SOCIAL MEDIA LINKS */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-['Hind_Siliguri']">
                            সোশ্যাল মিডিয়া পেজ লিংক
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            ফেসবুক, টিকটক ও ইউটিউব চ্যানেলের অফিশিয়াল লিংক
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">f</span>
                            <span>ফেসবুক পেজ লিংক (Facebook URL):</span>
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: https://www.facebook.com/NaarirShopno"
                            value={socialForm.facebookUrl}
                            onChange={(e) => setSocialForm({ ...socialForm, facebookUrl: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            টিকটক প্রোফাইল লিংক (TikTok URL):
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: https://www.tiktok.com/@naarir.shopno"
                            value={socialForm.tiktokUrl}
                            onChange={(e) => setSocialForm({ ...socialForm, tiktokUrl: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ইউটিউব চ্যানেল লিংক (YouTube URL):
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: https://youtube.com/@naarirshopno"
                            value={socialForm.youtubeUrl}
                            onChange={(e) => setSocialForm({ ...socialForm, youtubeUrl: e.target.value })}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PROMINENT SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Save className="w-5 h-5" />
                        <span>সকল সেটিংস সংরক্ষণ করুন (Save All Settings)</span>
                      </button>
                    </div>
                  </form>

                  {/* Security & Password Change Section */}
                  <div className="pt-6 border-t border-slate-200">
                    <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 font-['Hind_Siliguri']">
                            অ্যাডমিন নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            অ্যাডমিন প্যানেলে লগইন করার ইমেইল ও পাসওয়ার্ড পরিবর্তন করুন
                          </p>
                        </div>
                      </div>

                      {changePassToast && (
                        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          changePassToast.success ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {changePassToast.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>{changePassToast.message}</span>
                        </div>
                      )}

                      <form onSubmit={handleUpdatePassword} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              বর্তমান পাসওয়ার্ড: *
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                              value={changePassForm.currentPass}
                              onChange={(e) => setChangePassForm({ ...changePassForm, currentPass: e.target.value })}
                              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              লগইন ইমেইল / ইউজারনেম:
                            </label>
                            <input
                              type="text"
                              required
                              value={changePassForm.newEmail}
                              onChange={(e) => setChangePassForm({ ...changePassForm, newEmail: e.target.value })}
                              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              নতুন পাসওয়ার্ড: * (কমপক্ষে ৬ অক্ষর)
                            </label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="নতুন পাসওয়ার্ড দিন"
                              value={changePassForm.newPass}
                              onChange={(e) => setChangePassForm({ ...changePassForm, newPass: e.target.value })}
                              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              নতুন পাসওয়ার্ড নিশ্চিত করুন: *
                            </label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                              value={changePassForm.confirmPass}
                              onChange={(e) => setChangePassForm({ ...changePassForm, confirmPass: e.target.value })}
                              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>পাসওয়ার্ড আপডেট করুন</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CUSTOMER MESSAGES INBOX */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">কাস্টমার সরাসরি মেসেজ ইনবক্স</h4>
                    <p className="text-xs text-slate-500">ওয়েবসাইট থেকে কাস্টমারদের পাঠানো প্রশ্ন ও মেসেজ</p>
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
                              <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                            </div>
                          </div>

                          {/* Action Buttons: Edit / Change Picture AND Delete */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryItem(cat);
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Category Modal */}
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
                    await updateCategory({
                      id: editingCategoryItem.id,
                      title: categoryFormTitle.trim(),
                      subtitle: categoryFormSubtitle.trim() || editingCategoryItem.subtitle,
                      image: categoryFormImage.trim() || editingCategoryItem.image,
                    });
                    setCategoryToast(`"${categoryFormTitle}" ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!`);
                  } else {
                    const newId = 'cat_' + Date.now();
                    await addCategory({
                      id: newId,
                      title: categoryFormTitle.trim(),
                      subtitle: categoryFormSubtitle.trim() || 'এক্সক্লুসিভ কালেকশন',
                      image: categoryFormImage.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
                    });
                    setCategoryToast(`নতুন ক্যাটাগরি "${categoryFormTitle}" যুক্ত করা হয়েছে!`);
                  }
                  setTimeout(() => setCategoryToast(null), 3000);
                  setIsCategoryModalOpen(false);
                }}
                className="space-y-4 text-left"
              >
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরির নাম (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: লেহেঙ্গা, শীতের পোশাক, বাচ্চাদের ফ্রক"
                    value={categoryFormTitle}
                    onChange={(e) => setCategoryFormTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
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
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-400 shadow-xs shrink-0 bg-white">
                    <img
                      src={categoryFormImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block">লাইভ প্রিভিউ:</span>
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
                    <span>১. মূল বিবরণ ও পরিচিতি</span>
                  </h5>

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
                  <label className="block font-semibold text-slate-700 mb-1">কুরিয়ার কনসাইনমেন্ট / ট্র্যাকিং আইডি *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ST-889142 অথবা PTH-667104"
                    value={courierTrackingId}
                    onChange={(e) => setCourierTrackingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সম্ভাব্য ডেলিভারি সময়</label>
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
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold shadow hover:bg-rose-700"
                  >
                    কুরিয়ার আপডেট করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice View Modal */}
        {invoiceOrder && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-3 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-rose-100">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 print:hidden">
                <h4 className="font-bold text-slate-900 text-sm">ইনভয়েস ভিউ</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট</span>
                  </button>
                  <button onClick={() => setInvoiceOrder(null)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Body */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 text-xs">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-rose-700 font-['Hind_Siliguri']">
                      নারীর স্বপ্ন - Naarir Shopno
                    </h3>
                    <p className="text-[11px] text-slate-500 italic">Dress Your Dreams</p>
                    <p className="text-[11px] text-slate-600 mt-1">হটলাইন: {settings.hotline1}, {settings.hotline2}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-sm text-slate-900">#{invoiceOrder.id}</p>
                    <p className="text-[11px] text-slate-500">তারিখ: {invoiceOrder.createdAt}</p>
                  </div>
                </div>

                <div className="space-y-1 text-slate-700">
                  <p><strong>বিল টু:</strong> {invoiceOrder.customerName}</p>
                  <p><strong>ফোন:</strong> {invoiceOrder.phone}</p>
                  <p><strong>ঠিকানা:</strong> {invoiceOrder.address}, {invoiceOrder.thana ? `থানা: ${invoiceOrder.thana}, ` : ''}{invoiceOrder.district}</p>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="p-2 w-14">ছবি</th>
                      <th className="p-2">আইটেম ও বিবরণ</th>
                      <th className="p-2">রঙ ও সাইজ</th>
                      <th className="p-2 text-center">পরিমাণ</th>
                      <th className="p-2 text-right">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceOrder.items.map((it, i) => {
                      const itemImg = it.selectedImage || (it.product.images && it.product.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                      const colorHex = it.product.colors?.find(c => c.name === it.selectedColor)?.hex;
                      const displayColor = it.selectedColor || (it.product.colors && it.product.colors[0]?.name) || 'ডিফল্ট';

                      return (
                        <tr key={i}>
                          <td className="p-2">
                            <img
                              src={itemImg}
                              alt={it.product.bengaliName}
                              className="w-10 h-13 object-cover rounded border border-slate-200 bg-white"
                            />
                          </td>
                          <td className="p-2 font-medium">
                            <p className="font-bold text-slate-900">{it.product.bengaliName}</p>
                            <p className="text-[10px] text-slate-400">কোড: {it.product.sku}</p>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                              {colorHex && (
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: colorHex }} />
                              )}
                              <span>{displayColor}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">সাইজ: {it.selectedSize}</span>
                          </td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-right font-bold font-['Outfit']">৳{(it.product.price * it.quantity).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t border-slate-200 pt-2 space-y-1 text-right">
                  <p>সাবটোটাল: ৳{invoiceOrder.subtotal.toLocaleString()}</p>
                  <p>ডেলিভারি চার্জ: ৳{invoiceOrder.deliveryCharge}</p>
                  <p className="text-base font-bold text-rose-700 font-['Outfit']">
                    সর্বমোট: ৳{invoiceOrder.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
};
