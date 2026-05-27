import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  visible: boolean;
}

const OfflineBanner = ({ visible }: OfflineBannerProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 flex h-10 items-center justify-center gap-2 bg-amber-500 px-4 shadow-md transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <WifiOff className="h-4 w-4 text-white" />
      <span className="text-sm font-semibold text-white">
        Sin conexión — los datos pueden no estar actualizados
      </span>
    </div>
  );
};

export default OfflineBanner;
