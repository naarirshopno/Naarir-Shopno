import { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';

/**
 * useModalBackNavigation
 * 
 * Ensures that when ANY modal, drawer, or detailed view is open:
 * 1. Pressing Browser Back (←) closes the open modal instead of navigating away from the page.
 * 2. Mobile swipe back / Android back button closes the open modal.
 * 3. Mouse Back button (button 3/4) closes the open modal.
 * 4. Keyboard Escape key closes the open modal.
 * 5. Closing manually via (X) button or backdrop click properly pops the history entry so back history stays clean.
 */
export function useModalBackNavigation() {
  const {
    selectedProductModal,
    setSelectedProductModal,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    isDeliveryInfoOpen,
    setIsDeliveryInfoOpen,
    isFacebookModalOpen,
    setIsFacebookModalOpen,
    isCustomerChatOpen,
    setIsCustomerChatOpen,
    isAdminOpen,
    setIsAdminOpen,
  } = useShop();

  // Track the stack of open modal IDs
  const activeStackRef = useRef<string[]>([]);
  // Track how many history states were pushed by modals
  const historyPushedCountRef = useRef<number>(0);
  // Flag to ignore popstate when we programmatically call history.back() on manual close
  const isProgrammaticBackRef = useRef<boolean>(false);
  // Flag to prevent manual-close handler from calling history.back() when close was triggered by popstate
  const isHandlingPopstateRef = useRef<boolean>(false);

  // Derive which modals are currently open
  const currentOpenKeys: string[] = [];
  if (selectedProductModal !== null) currentOpenKeys.push('product');
  if (isCartOpen) currentOpenKeys.push('cart');
  if (isCheckoutOpen) currentOpenKeys.push('checkout');
  if (isWishlistOpen) currentOpenKeys.push('wishlist');
  if (isOrderTrackingOpen) currentOpenKeys.push('tracking');
  if (isDeliveryInfoOpen) currentOpenKeys.push('delivery');
  if (isFacebookModalOpen) currentOpenKeys.push('facebook');
  if (isCustomerChatOpen) currentOpenKeys.push('chat');
  if (isAdminOpen) currentOpenKeys.push('admin');

  // Keep a ref of close functions for easy access inside event handlers
  const closeHandlersRef = useRef<Record<string, () => void>>({});
  closeHandlersRef.current = {
    product: () => setSelectedProductModal(null),
    cart: () => setIsCartOpen(false),
    checkout: () => setIsCheckoutOpen(false),
    wishlist: () => setIsWishlistOpen(false),
    tracking: () => setIsOrderTrackingOpen(false),
    delivery: () => setIsDeliveryInfoOpen(false),
    facebook: () => setIsFacebookModalOpen(false),
    chat: () => setIsCustomerChatOpen(false),
    admin: () => {
      setIsAdminOpen(false);
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    },
  };

  // Sync state changes with the browser history stack
  useEffect(() => {
    // If this render was triggered by popstate, we don't need to push or pop history
    if (isHandlingPopstateRef.current) {
      isHandlingPopstateRef.current = false;
      activeStackRef.current = currentOpenKeys;
      return;
    }

    const prevStack = activeStackRef.current;
    const currentKeys = currentOpenKeys;

    // Check for newly opened modals (keys in currentKeys not in prevStack)
    const newlyOpened = currentKeys.filter(k => !prevStack.includes(k));
    // Check for manually closed modals (keys in prevStack not in currentKeys)
    const manuallyClosed = prevStack.filter(k => !currentKeys.includes(k));

    if (newlyOpened.length > 0) {
      // For each new modal opened, push a history entry
      for (const modalKey of newlyOpened) {
        prevStack.push(modalKey);
        historyPushedCountRef.current += 1;
        window.history.pushState(
          { modalKey, stackDepth: historyPushedCountRef.current },
          ''
        );
      }
      activeStackRef.current = [...prevStack];
    } else if (manuallyClosed.length > 0) {
      // Modals were closed manually (via (X) button, backdrop, or form completion)
      // Remove closed keys from stack
      const remainingStack = prevStack.filter(k => currentKeys.includes(k));
      const closedCount = prevStack.length - remainingStack.length;
      activeStackRef.current = remainingStack;

      // Pop the corresponding history entries so the browser back button doesn't have dead modal states
      if (closedCount > 0 && historyPushedCountRef.current > 0) {
        const popsToMake = Math.min(closedCount, historyPushedCountRef.current);
        historyPushedCountRef.current -= popsToMake;
        isProgrammaticBackRef.current = true;
        
        if (popsToMake === 1) {
          window.history.back();
        } else {
          window.history.go(-popsToMake);
        }
      }
    } else {
      activeStackRef.current = [...currentKeys];
    }
  }, [
    selectedProductModal,
    isCartOpen,
    isCheckoutOpen,
    isWishlistOpen,
    isOrderTrackingOpen,
    isDeliveryInfoOpen,
    isFacebookModalOpen,
    isCustomerChatOpen,
    isAdminOpen,
  ]);

  // Handle Browser Back / Mouse Back / Swipe Back (popstate)
  useEffect(() => {
    const handlePopState = () => {
      // If this popstate was triggered by our own manual-close history.back(), ignore it
      if (isProgrammaticBackRef.current) {
        isProgrammaticBackRef.current = false;
        return;
      }

      // If we have open modals, close the top-most modal
      if (activeStackRef.current.length > 0 && historyPushedCountRef.current > 0) {
        historyPushedCountRef.current = Math.max(0, historyPushedCountRef.current - 1);
        isHandlingPopstateRef.current = true;

        // Pop the top modal key and invoke its close handler
        const topKey = activeStackRef.current.pop();
        if (topKey && closeHandlersRef.current[topKey]) {
          closeHandlersRef.current[topKey]();
        }
      }
    };

    // Handle Keyboard Escape key to also close top modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeStackRef.current.length > 0) {
        e.preventDefault();
        // Trigger browser back which will cleanly close the top modal
        window.history.back();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
