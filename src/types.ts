export type CategoryType = 
  | 'all'
  | 'three_piece'
  | 'saree'
  | 'kurti'
  | 'gown'
  | 'hijab_abaya'
  | 'lehenga'
  | 'jewellery_bags'
  | string;

export interface CustomCategoryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export type ProductFulfillmentType = 'own' | 'supplier';

export interface Product {
  id: string;
  name: string;
  bengaliName: string;
  category: CategoryType;
  categoryBengali: string;
  price: number;
  regularPrice: number;
  wholesalePrice?: number;
  resellerPrice?: number;
  fulfillmentType?: ProductFulfillmentType; // 'own' (নিজস্ব স্টক) | 'supplier' (অন্যের/সাপ্লায়ারের প্রোডাক্ট API)
  supplierId?: string;
  supplierName?: string;
  supplierSku?: string;
  supplierPrice?: number; // সাপ্লায়ারের পাইকারি ক্রয়মূল্য (Supplier Wholesale Cost)
  supplierProfit?: number; // আপনার নিট লাভ (Your Profit)
  images: string[];
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  featured?: boolean;
  fabric: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  inStock: boolean;
  stockCount: number;
  sku: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  selectedImage?: string;
  quantity: number;
}

export type DeliveryZoneId = 'inside_dhaka' | 'sub_dhaka' | 'outside_dhaka';

export interface DeliveryZone {
  id: DeliveryZoneId;
  name: string;
  bengaliName: string;
  charge: number;
  estimatedDays: string;
}

export type PaymentMethodType = 'cod' | 'bkash' | 'nagad';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string; // e.g. NS-1025
  createdAt: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  altPhone?: string;
  district: string;
  thana: string;
  address: string;
  deliveryZone: DeliveryZoneId;
  deliveryCharge: number;
  paymentMethod: PaymentMethodType;
  paymentDetails?: {
    accountNumber?: string;
    trxId?: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  orderNote?: string;
  emailNotification?: {
    sent: boolean;
    sentAt?: string;
    to?: string;
    error?: string;
    realDispatched?: boolean;
    messageId?: string;
  };
  courier?: {
    name: string;
    trackingId: string;
    shippedDate?: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
    deliveredDate?: string;
    latestTimeline?: string;
    lastSyncedAt?: string;
  };
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  isResellerOrder?: boolean;
  resellerDetails?: {
    resellerName: string;
    resellerPhone: string;
    payoutMethod: 'bkash' | 'nagad';
    payoutNumber: string;
    customerCollectionAmount: number;
    resellerProfit: number;
    resellerWholesaleTotal?: number;
    payoutStatus?: 'pending' | 'paid';
    resellerStoreName?: string;
  };
  supplierForwarding?: SupplierOrderForwarding;
  dropshipping?: {
    provider?: string;
    status?: string;
    forwardedAt?: string;
    externalOrderId?: string;
    resellerOrderNumber?: string;
    trackingId?: string;
    courier?: string;
    notes?: string;
  };
}

export interface SupplierOrderForwarding {
  forwarded: boolean;
  forwardedAt?: string;
  supplierId?: string;
  supplierName?: string;
  supplierOrderId?: string;
  supplierTrackingCode?: string;
  courierName?: string;
  status?: 'pending' | 'sent' | 'processing' | 'shipped' | 'failed';
  error?: string;
  wholesaleCost?: number;
  expectedProfit?: number;
}

export interface SupplierApiConfig {
  id: string;
  name: string; // e.g., 'মহসাগর ড্রপশিপিং', 'Dropshipping.com.bd', 'বিডি ফ্যাশন হাব', বা 'কাস্টম ভেন্ডর'
  providerType?: 'mohasagor' | 'dropshipping_bd' | 'custom_api';
  baseUrl: string;
  apiEndpoint?: string;
  apiKey: string;
  secretKey?: string;
  apiSecret?: string;
  accountPhone?: string;
  enabled: boolean;
  autoForwardOrders: boolean;
  defaultProfitMargin: number;
  defaultMarginPercent?: number;
  defaultProfitMarginType?: 'fixed' | 'percentage';
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastConnectedAt?: string;
  lastStatusMessage?: string;
}

export interface ResellerProgramSettings {
  enabled: boolean;
  noticeText?: string;
  whatsappNumber?: string;
  whatsappGroupLink?: string;
  minProfitNotice?: string;
  registrationNotice?: string;
}

export interface DropshippingApiSettings {
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  resellerId?: string;
  resellerPhone?: string;
  autoForwardOrders?: boolean;
  testMode?: boolean;
  defaultCourier?: string;
  webhookUrl?: string;
  lastConnectedAt?: string;
  connectionStatus?: 'disconnected' | 'connected' | 'error';
  lastStatusMessage?: string;
}

export interface MohasagorApiSettings {
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  defaultProfitMargin: number;
  autoCategorize: boolean;
  lastConnectedAt?: string;
  connectionStatus?: 'disconnected' | 'connected' | 'error';
  lastStatusMessage?: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  hotline1: string;
  hotline2: string;
  supportHours?: string;
  whatsappNumber: string;
  whatsappShortLink?: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  rocketMerchantNumber?: string;
  deliveryCharges: {
    insideDhaka: number;
    subDhaka: number;
    outsideDhaka: number;
    freeDeliveryAbove: number;
    freeDeliveryMinItems?: number;
  };
  announcementText: string;
  officeAddress: string;
  officeEmail?: string;
  footerBgImage?: string;
  categories?: CustomCategoryItem[];
  categoryImages?: Record<string, string>;
  supplierApiConfigs?: SupplierApiConfig[];
  activeSupplierId?: string;
  dropshippingApi?: DropshippingApiSettings;
  mohasagorApi?: MohasagorApiSettings;
  resellerProgram?: ResellerProgramSettings;
  backgroundMusic?: {
    enabled?: boolean;
    audioUrl?: string;
    title?: string;
    defaultVolume?: number;
    autoplayOnFirstClick?: boolean;
  };
  emailSettings?: {
    enabled?: boolean;
    provider?: 'gmail' | 'custom_smtp' | 'resend' | 'cloud_functions';
    senderName?: string;
    senderEmail?: string;
    supportEmail?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpSecure?: boolean;
    apiKey?: string;
    bccAdminOnOrder?: boolean;
    orderConfirmationSubject?: string;
    notifyCustomer?: boolean;
    notifyAdmin?: boolean;
    adminNotificationEmail?: string;
    lastTestedAt?: string;
    lastTestStatus?: 'success' | 'failed';
    lastTestMessage?: string;
  };
}

export interface CustomerMessage {
  id: string;
  name: string;
  phone: string;
  subject?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  replyText?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  location?: string;
  helpfulCount?: number;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  district: string;
  thana: string;
  address: string;
  updatedAt?: string;
}

export interface FirestoreEmailLog {
  id: string;
  to: string;
  cc?: string | null;
  subject: string;
  html?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  total?: number;
  createdAt: string;
  status: 'delivered' | 'queued' | 'failed';
  realDispatched?: boolean;
  error?: string | null;
  deliveryState?: string;
}

