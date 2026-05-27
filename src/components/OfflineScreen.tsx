import { WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import useNetworkStatus from '@/hooks/useNetworkStatus';

interface OfflineScreenProps {
  onRetry?: () => void;
}

const OfflineScreen = ({ onRetry }: OfflineScreenProps) => {
  const { checkConnection } = useNetworkStatus();
  const [checking, setChecking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    const connected = await checkConnection();
    setChecking(false);
    if (connected && onRetry) onRetry();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div className="flex flex-col items-center px-10 text-center">
        <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full bg-red-500/10">
          <WifiOff className="h-20 w-20 text-red-500" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-white">
          Sin conexión a internet
        </h1>
        <p className="mb-10 text-base leading-relaxed text-white/60">
          Verifica tu conexión y vuelve a intentarlo
        </p>

        <button
          onClick={handleRetry}
          disabled={checking}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-8 py-3.5 text-white transition-colors hover:bg-red-600 disabled:opacity-70"
        >
          <RefreshCw className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
          <span className="text-base font-semibold">
            {checking ? 'Verificando...' : 'Reintentar'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default OfflineScreen;
