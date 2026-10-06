import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, StoreSettings, CustomerMessage, CategoryType, OrderStatus, ProductReview, CustomCategoryItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS, INITIAL_MESSAGES, DEFAULT_CATEGORIES } from '../data/initialData';
import { INITIAL_PRODUCT_REVIEWS, getDefaultReviewsForProduct } from '../data/initialReviews';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { runFirestoreHealthCheck, HealthCheckResult } from '../services/dbHealthCheck';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    return value === undefined ? null : value;
  }));
}

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  messages: CustomerMessage[];
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  syncAllToCloud: () => Promise<void>;
  activeCategory: CategoryType;
  setActiveCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  resetFilters: () => void;
  
  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  isFacebookModalOpen: boolean;
  setIsFacebookModalOpen: (open: boolean) => void;
  isCustomerChatOpen: boolean;
  setIsCustomerChatOpen: (open: boolean) => void;
  isDeliveryInfoOpen: boolean;
  setIsDeliveryInfoOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isMobileSimulatorOpen: boolean;
  setIsMobileSimulatorOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (prod: Product | null) => void;
  directCheckoutItem: CartItem | null;
  setDirectCheckoutItem: (item: CartItem | null) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  getWishlistCount: () => number;

  // Actions
  addToCart: (product: Product, size?: string, color?: string, quantity?: number, openDrawer?: boolean, image?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string, image?: string) => void;
  updateQuantity: (productId: string, size: string, color: string | undefined, delta: number, image?: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartCount: () => number;
  
  // Checkout & Orders
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, courier?: Order['courier']) => void;
  deleteOrder: (orderId: string) => void;
  
  // Products Management
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  deleteDemoProducts: () => Promise<void>;
  clearAllProducts: () => Promise<void>;
  restoreDemoProducts: () => Promise<void>;
  
  // Settings & Messages
  updateSettings: (newSettings: StoreSettings) => void;
  sendCustomerMessage: (msg: { name: string; phone: string; message: string; subject?: string }) => void;
  markMessageAsRead: (msgId: string) => void;
  deleteMessage: (msgId: string) => void;

  // Category Management
  deleteCategory: (categoryId: string) => Promise<void>;
  addCategory: (category: CustomCategoryItem) => Promise<void>;
  updateCategory: (category: CustomCategoryItem) => Promise<void>;

  // Compare Products
  compareList: Product[];
  addToCompare: (product: Product) => { success: boolean; message: string };
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  toggleCompare: (product: Product) => { success: boolean; message: string };
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Reviews
  reviews: Record<string, ProductReview[]>;
  getProductReviews: (productId: string) => ProductReview[];
  addProductReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  voteReviewHelpful: (productId: string, reviewId: string) => void;

  // Firebase Database Health Check
  dbHealth: HealthCheckResult | null;
  isCheckingDbHealth: boolean;
  runDbHealthCheck: () => Promise<HealthCheckResult>;

  // Recently Viewed Products
  recentlyViewed: Product[];
  recordRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database Health Check State
  const [dbHealth, setDbHealth] = useState<HealthCheckResult | null>(null);
  const [isCheckingDbHealth, setIsCheckingDbHealth] = useState<boolean>(false);

  const runDbHealthCheck = async (): Promise<HealthCheckResult> => {
    setIsCheckingDbHealth(true);
    try {
      const res = await runFirestoreHealthCheck();
      setDbHealth(res);
      return res;
    } finally {
      setIsCheckingDbHealth(false);
    }
  };

  useEffect(() => {
    // Run real-time health check on startup
    runDbHealthCheck();
  }, []);

  // Local storage initialized states (defaulting to empty arrays, filtering out demo IDs)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ns_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: Product) => !p.id.startsWith('ns-0') && p.id !== 'ns-10');
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ns_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ns_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((o: Order) => !['NS-1045', 'NS-1046', 'NS-1047'].includes(o.id));
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('ns_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const officeAddress = (!parsed.officeAddress || parsed.officeAddress.includes('মিরপুর'))
          ? INITIAL_SETTINGS.officeAddress
          : parsed.officeAddress;
        const officeEmail = (!parsed.officeEmail || parsed.officeEmail.toLowerCase().includes('support@naarirshopno.com'))
          ? INITIAL_SETTINGS.officeEmail
          : parsed.officeEmail;
        const bkashMerchantNumber = (!parsed.bkashMerchantNumber || parsed.bkashMerchantNumber.includes('01712'))
          ? INITIAL_SETTINGS.bkashMerchantNumber
          : parsed.bkashMerchantNumber;
        const nagadMerchantNumber = (!parsed.nagadMerchantNumber || parsed.nagadMerchantNumber.includes('01912'))
          ? INITIAL_SETTINGS.nagadMerchantNumber
          : parsed.nagadMerchantNumber;
        const whatsappShortLink = parsed.whatsappShortLink || INITIAL_SETTINGS.whatsappShortLink || 'https://wa.me/8801911541717';
        const whatsappNumber = parsed.whatsappNumber || INITIAL_SETTINGS.whatsappNumber || '01911-541717';

        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          officeAddress,
          officeEmail,
          bkashMerchantNumber,
          nagadMerchantNumber,
          whatsappShortLink,
          whatsappNumber,
          categories: parsed.categories !== undefined ? parsed.categories : INITIAL_SETTINGS.categories,
          categoryImages: parsed.categoryImages !== undefined ? parsed.categoryImages : INITIAL_SETTINGS.categoryImages,
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [messages, setMessages] = useState<CustomerMessage[]>(() => {
    const saved = localStorage.getItem('ns_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [reviews, setReviews] = useState<Record<string, ProductReview[]>>(() => {
    const saved = localStorage.getItem('ns_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PRODUCT_REVIEWS;
      }
    }
    return INITIAL_PRODUCT_REVIEWS;
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');
  const isInitialSyncDone = useRef(false);

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Modal / Drawer visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [isCustomerChatOpen, setIsCustomerChatOpen] = useState(false);
  const [isDeliveryInfoOpen, setIsDeliveryInfoOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Wishlist state initialized from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('ns_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Compare Products state initialized from localStorage (up to 3 items)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ns_compare_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recently Viewed state initialized from localStorage
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ns_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordRecentlyViewed = (productId: string) => {
    if (!productId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('ns_recently_viewed', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem('ns_recently_viewed');
    } catch {
      // ignore
    }
  };

  // Automatically record when product modal opens
  useEffect(() => {
    if (selectedProductModal?.id) {
      recordRecentlyViewed(selectedProductModal.id);
    }
  }, [selectedProductModal]);

  const recentlyViewed = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  useEffect(() => {
    try {
      localStorage.setItem('ns_compare_list', JSON.stringify(compareList));
    } catch {
      // ignore
    }
  }, [compareList]);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('ns_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ns_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ns_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ns_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ns_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ns_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('ns_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cloud Firestore Real-time Synchronization across all devices
  useEffect(() => {
    setCloudSyncStatus('syncing');

    // 1. Products Collection Sync
    const productsCol = collection(db, 'products');
    const unsubProducts = onSnapshot(
      productsCol,
      (snapshot) => {
        const remoteList: Product[] = [];
        snapshot.forEach((docSnap) => {
          remoteList.push(docSnap.data() as Product);
        });
        setProducts(remoteList);
        setCloudSyncStatus('synced');
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
        setCloudSyncStatus('offline');
      }
    );

    // 2. Orders Collection Sync
    const ordersCol = collection(db, 'orders');
    const unsubOrders = onSnapshot(
      ordersCol,
      (snapshot) => {
        const remoteOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          remoteOrders.push(docSnap.data() as Order);
        });
        remoteOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(remoteOrders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    // 3. Settings Document Sync
    const settingsDoc = doc(db, 'settings', 'general');
    const unsubSettings = onSnapshot(
      settingsDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteSettings = docSnap.data() as StoreSettings;
          setSettings((prev) => {
            const categories = Array.isArray(remoteSettings.categories)
              ? remoteSettings.categories
              : (Array.isArray(prev.categories) ? prev.categories : DEFAULT_CATEGORIES);
            const categoryImages = remoteSettings.categoryImages !== undefined
              ? remoteSettings.categoryImages
              : (prev.categoryImages || {});

            const merged: StoreSettings = {
              ...INITIAL_SETTINGS,
              ...prev,
              ...remoteSettings,
              categories,
              categoryImages,
            };

            try {
              localStorage.setItem('ns_settings', JSON.stringify(merged));
            } catch {
              // ignore
            }

            return merged;
          });
        } else {
          const savedLocal = localStorage.getItem('ns_settings');
          let initialToUse = INITIAL_SETTINGS;
          if (savedLocal) {
            try {
              initialToUse = JSON.parse(savedLocal);
            } catch {
              initialToUse = INITIAL_SETTINGS;
            }
          }
          setDoc(settingsDoc, sanitizeForFirestore(initialToUse))
            .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/general'));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/general');
      }
    );

    // 4. Messages Collection Sync
    const messagesCol = collection(db, 'messages');
    const unsubMessages = onSnapshot(
      messagesCol,
      (snapshot) => {
        const remoteMsgs: CustomerMessage[] = [];
        snapshot.forEach((docSnap) => {
          remoteMsgs.push(docSnap.data() as CustomerMessage);
        });
        remoteMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(remoteMsgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
      unsubMessages();
    };
  }, []);

  // Force sync all data to cloud
  const syncAllToCloud = async () => {
    setCloudSyncStatus('syncing');
    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        batch.set(doc(db, 'products', p.id), sanitizeForFirestore(p));
      });
      orders.forEach((o) => {
        batch.set(doc(db, 'orders', o.id), sanitizeForFirestore(o));
      });
      batch.set(doc(db, 'settings', 'general'), sanitizeForFirestore(settings));
      messages.forEach((m) => {
        batch.set(doc(db, 'messages', m.id), sanitizeForFirestore(m));
      });
      await batch.commit();
      setCloudSyncStatus('synced');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'all');
      setCloudSyncStatus('offline');
    }
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  // Review operations
  const getProductReviews = (productId: string): ProductReview[] => {
    if (reviews[productId] && reviews[productId].length > 0) {
      return reviews[productId];
    }
    return getDefaultReviewsForProduct(productId);
  };

  const addProductReview = (newReviewData: Omit<ProductReview, 'id' | 'date'>) => {
    const today = new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const newReview: ProductReview = {
      ...newReviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: today,
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    setReviews(prev => {
      const existing = prev[newReviewData.productId] || getDefaultReviewsForProduct(newReviewData.productId);
      return {
        ...prev,
        [newReviewData.productId]: [newReview, ...existing],
      };
    });

    // Update product rating and reviews count
    setProducts(prev =>
      prev.map(p => {
        if (p.id === newReviewData.productId) {
          const currentReviews = reviews[p.id] || getDefaultReviewsForProduct(p.id);
          const allRatings = [newReviewData.rating, ...currentReviews.map(r => r.rating)];
          const newAvg = Number((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1));
          return {
            ...p,
            rating: newAvg,
            reviewsCount: (p.reviewsCount || 0) + 1,
          };
        }
        return p;
      })
    );
  };

  const voteReviewHelpful = (productId: string, reviewId: string) => {
    setReviews(prev => {
      const currentList = prev[productId] || getDefaultReviewsForProduct(productId);
      const updated = currentList.map(r => {
        if (r.id === reviewId) {
          return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
        }
        return r;
      });
      return {
        ...prev,
        [productId]: updated,
      };
    });
  };

  // Cart operations
  const addToCart = (
    product: Product,
    size?: string,
    color?: string,
    quantity: number = 1,
    openDrawer: boolean = true,
    image?: string
  ) => {
    const chosenSize = size || (product.sizes.length > 0 ? product.sizes[0] : 'Standard');
    const chosenColor = color || (product.colors.length > 0 ? product.colors[0].name : undefined);
    const chosenImage = image || (product.images && product.images.length > 0 ? product.images[0] : undefined);

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedSize === chosenSize &&
          item.selectedColor === chosenColor &&
          (!chosenImage || !item.selectedImage || item.selectedImage === chosenImage)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        if (chosenImage && !next[existingIndex].selectedImage) {
          next[existingIndex].selectedImage = chosenImage;
        }
        return next;
      } else {
        return [...prev, { product, selectedSize: chosenSize, selectedColor: chosenColor, selectedImage: chosenImage, quantity }];
      }
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId: string, size?: string, color?: string, image?: string) => {
    setCart(prev =>
      prev.filter(
        item =>
          !(
            item.product.id === productId &&
            (!size || item.selectedSize === size) &&
            (!color || item.selectedColor === color) &&
            (!image || item.selectedImage === image)
          )
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string | undefined, delta: number, image?: string) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (
            item.product.id === productId && 
            item.selectedSize === size && 
            item.selectedColor === color &&
            (!image || item.selectedImage === image)
          ) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const nextIdNum = orders.length + 1048;
    const newOrder: Order = {
      ...orderData,
      id: `NS-${nextIdNum}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
    };

    setOrders(prev => [newOrder, ...prev]);
    setDoc(doc(db, 'orders', newOrder.id), sanitizeForFirestore(newOrder))
      .catch(err => handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`));
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, courier?: Order['courier']) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedOrd = {
            ...ord,
            status,
            courier: courier ? { ...ord.courier, ...courier } : ord.courier,
          };
          setDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updatedOrd), { merge: true })
            .catch(err => handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`));
          return updatedOrd;
        }
        return ord;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    deleteDoc(doc(db, 'orders', orderId))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`));
  };

  // Products
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newId = `ns-${Date.now().toString().slice(-4)}`;
    const newProduct: Product = {
      ...prodData,
      id: newId,
    };
    setProducts(prev => [newProduct, ...prev]);
    setDoc(doc(db, 'products', newId), sanitizeForFirestore(newProduct))
      .catch(err => handleFirestoreError(err, OperationType.CREATE, `products/${newId}`));
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setDoc(doc(db, 'products', updated.id), sanitizeForFirestore(updated), { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `products/${updated.id}`));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteDoc(doc(db, 'products', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `products/${id}`));
  };

  const deleteDemoProducts = async () => {
    const demoIds = ['ns-01', 'ns-02', 'ns-03', 'ns-04', 'ns-05', 'ns-06', 'ns-07', 'ns-08', 'ns-09', 'ns-10', 'ns-11', 'ns-12'];
    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        if (demoIds.includes(p.id) || p.id.startsWith('ns-0')) {
          batch.delete(doc(db, 'products', p.id));
        }
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'products');
    }
    setProducts((prev) => prev.filter((p) => !demoIds.includes(p.id) && !p.id.startsWith('ns-0')));
  };

  const clearAllProducts = async () => {
    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        batch.delete(doc(db, 'products', p.id));
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'products');
    }
    setProducts([]);
  };

  const restoreDemoProducts = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((p) => {
        batch.set(doc(db, 'products', p.id), sanitizeForFirestore(p));
      });
      await batch.commit();
      setProducts(INITIAL_PRODUCTS);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  // Settings
  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('ns_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(newSettings))
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, 'settings/general'));
  };

  // Category Management
  const deleteCategory = async (categoryId: string) => {
    const currentList = Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES;
    const updatedCategories = currentList.filter(c => c.id !== categoryId);
    const updatedImages = { ...(settings.categoryImages || {}) };
    delete updatedImages[categoryId];

    const newSettings: StoreSettings = {
      ...settings,
      categories: updatedCategories,
      categoryImages: updatedImages,
    };

    setSettings(newSettings);
    try {
      localStorage.setItem('ns_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }

    try {
      await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(newSettings));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    }
  };

  const addCategory = async (newCat: CustomCategoryItem) => {
    const currentList = Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES;
    const updatedCategories = [...currentList, newCat];
    const updatedImages = { ...(settings.categoryImages || {}), [newCat.id]: newCat.image };

    const newSettings: StoreSettings = {
      ...settings,
      categories: updatedCategories,
      categoryImages: updatedImages,
    };

    setSettings(newSettings);
    try {
      localStorage.setItem('ns_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }

    try {
      await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(newSettings));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    }
  };

  const updateCategory = async (updatedCat: CustomCategoryItem) => {
    const currentList = Array.isArray(settings.categories) ? settings.categories : DEFAULT_CATEGORIES;
    const updatedCategories = currentList.map(c => c.id === updatedCat.id ? updatedCat : c);
    const updatedImages = { ...(settings.categoryImages || {}), [updatedCat.id]: updatedCat.image };

    const newSettings: StoreSettings = {
      ...settings,
      categories: updatedCategories,
      categoryImages: updatedImages,
    };

    setSettings(newSettings);
    try {
      localStorage.setItem('ns_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }

    try {
      await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(newSettings));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    }
  };

  // Compare Products Management (up to 3 products)
  const addToCompare = (product: Product): { success: boolean; message: string } => {
    if (compareList.some(p => p.id === product.id)) {
      return { success: false, message: 'পোশাকটি ইতিমধ্যে তুলনা তালিকায় যুক্ত আছে।' };
    }
    if (compareList.length >= 3) {
      return { success: false, message: 'একসাথে সর্বোচ্চ ৩টি পোশাক তুলনা করা যাবে।' };
    }
    const updated = [...compareList, product];
    setCompareList(updated);
    return { success: true, message: `"${product.bengaliName || product.name}" তুলনা তালিকায় যোগ করা হয়েছে!` };
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const toggleCompare = (product: Product): { success: boolean; message: string } => {
    if (compareList.some(p => p.id === product.id)) {
      removeFromCompare(product.id);
      return { success: true, message: 'তুলনা তালিকা থেকে সরানো হয়েছে।' };
    }
    return addToCompare(product);
  };

  const isInCompare = (productId: string): boolean => {
    return compareList.some(p => p.id === productId);
  };

  // Customer Messages
  const sendCustomerMessage = (msg: { name: string; phone: string; message: string; subject?: string }) => {
    const newMsg: CustomerMessage = {
      id: `msg-${Date.now().toString().slice(-4)}`,
      name: msg.name,
      phone: msg.phone,
      subject: msg.subject || 'সাধারণ তথ্য ও জিজ্ঞাসা',
      message: msg.message,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setMessages(prev => [newMsg, ...prev]);
    setDoc(doc(db, 'messages', newMsg.id), sanitizeForFirestore(newMsg))
      .catch(err => handleFirestoreError(err, OperationType.CREATE, `messages/${newMsg.id}`));
  };

  const markMessageAsRead = (msgId: string) => {
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, isRead: true } : m)));
    setDoc(doc(db, 'messages', msgId), { isRead: true }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `messages/${msgId}`));
  };

  const deleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    deleteDoc(doc(db, 'messages', msgId))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `messages/${msgId}`));
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortBy('default');
    setPriceRange([0, 10000]);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        settings,
        messages,
        cloudSyncStatus,
        syncAllToCloud,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        resetFilters,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isFacebookModalOpen,
        setIsFacebookModalOpen,
        isCustomerChatOpen,
        setIsCustomerChatOpen,
        isDeliveryInfoOpen,
        setIsDeliveryInfoOpen,
        isAdminOpen,
        setIsAdminOpen,
        isMobileSimulatorOpen,
        setIsMobileSimulatorOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        getWishlistCount,
        selectedProductModal,
        setSelectedProductModal,
        directCheckoutItem,
        setDirectCheckoutItem,
        trackingOrderId,
        setTrackingOrderId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartSubtotal,
        getCartCount,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteDemoProducts,
        clearAllProducts,
        restoreDemoProducts,
        updateSettings,
        deleteCategory,
        addCategory,
        updateCategory,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        toggleCompare,
        isInCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        sendCustomerMessage,
        markMessageAsRead,
        deleteMessage,
        reviews,
        getProductReviews,
        addProductReview,
        voteReviewHelpful,
        dbHealth,
        isCheckingDbHealth,
        runDbHealthCheck,
        recentlyViewed,
        recordRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
