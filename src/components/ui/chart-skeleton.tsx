/**
 * ChartSkeleton — placeholder de carga para gráficos de barras.
 *
 * Renderiza un contenedor con barras verticales de alturas fijas simulando
 * un BarChart, con animate-pulse. Las alturas de las barras son consistentes
 * entre renders (no random en runtime).
 *
 * Uso:
 *   <ChartSkeleton />
 *   <ChartSkeleton height={200} bars={6} />
 */

interface ChartSkeletonProps {
  height?: number;
  bars?: number;
  className?: string;
}

// Alturas fijas para las barras — simulan variación natural de datos
const BAR_HEIGHTS = [60, 75, 45, 85, 55, 70, 40, 90, 65, 80, 50, 72];

export function ChartSkeleton({
  height = 160,
  bars = 12,
  className = '',
}: ChartSkeletonProps) {
  return (
    <div
      className={`w-full ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <div className="flex items-end justify-between gap-1.5 h-full pt-4 pb-6">
        {Array.from({ length: bars }).map((_, i) => {
          const barH = BAR_HEIGHTS[i % BAR_HEIGHTS.length];
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full bg-gray-200 rounded-t animate-pulse"
                style={{ height: `${barH}%` }}
              />
              <div className="h-2 w-full max-w-[24px] bg-gray-200 rounded animate-pulse" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
