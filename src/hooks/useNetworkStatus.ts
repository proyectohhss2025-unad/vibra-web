import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isConnected: boolean;
  checkConnection: () => Promise<boolean>;
}

const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsConnected(navigator.onLine);

    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isConnected, checkConnection };
};

export default useNetworkStatus;
