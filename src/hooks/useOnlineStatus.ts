import { useCallback, useEffect, useRef, useState } from 'react';

async function checkRealInternet(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const probeServer = async (): Promise<boolean> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          Pragma: 'no-cache',
        },
        signal: controller.signal,
      });
      const contentType = res.headers.get('content-type') || '';
      return res.ok && contentType.includes('application/json');
    } catch {
      return false;
    } finally {
      window.clearTimeout(timer);
    }
  };

  const serverReachable = await probeServer();
  if (!serverReachable) {
    return false;
  }

  // On localhost (local PC dev where local Node server stays up even with no WAN internet),
  // verify external internet reachability as well.
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    try {
      await fetch(`https://www.gstatic.com/generate_204?_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      return true;
    } catch {
      return false;
    } finally {
      window.clearTimeout(timer);
    }
  }

  return true;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const checkingRef = useRef(false);
  const mountedRef = useRef(true);

  const verifyConnectivity = useCallback(async () => {
    if (checkingRef.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (mountedRef.current) setIsOnline(false);
      return;
    }

    checkingRef.current = true;
    try {
      const reachable = await checkRealInternet();
      if (mountedRef.current) {
        setIsOnline(reachable);
      }
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const handleOnline = () => {
      void verifyConnectivity();
    };
    const handleOffline = () => {
      if (mountedRef.current) setIsOnline(false);
    };
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState !== 'hidden') {
        void verifyConnectivity();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const netConn = (navigator as Navigator & { connection?: EventTarget }).connection;
    netConn?.addEventListener?.('change', handleOnline);

    // Run immediate check on mount
    void verifyConnectivity();

    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      netConn?.removeEventListener?.('change', handleOnline);
    };
  }, [verifyConnectivity]);

  // Fast background polling so WiFi/LAN without internet is detected within seconds
  useEffect(() => {
    const intervalMs = isOnline ? 5000 : 3000;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        void verifyConnectivity();
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isOnline, verifyConnectivity]);

  return isOnline;
}
