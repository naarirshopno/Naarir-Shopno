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

export interface Product {
  id: string;
  name: string;
  bengaliName: string;
  category: CategoryType;
  categoryBengali: string;
  price: number;
  regularPrice: number;
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
  courier?: {
    name: string;
    trackingId: string;
    shippedDate?: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
  };
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  hotline1: string;
  hotline2: string;
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
  };
  announcementText: string;
  officeAddress: string;
  officeEmail?: string;
  footerBgImage?: string;
  categories?: CustomCategoryItem[];
  categoryImages?: Record<string, string>;
  backgroundMusic?: {
    enabled?: boolean;
    audioUrl?: string;
    title?: string;
    defaultVolume?: number;
    autoplayOnFirstClick?: boolean;
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
