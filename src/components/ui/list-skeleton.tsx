/**
 * ListSkeleton — placeholder de carga para listas.
 *
 * Renderiza N filas con avatar circular + líneas de texto animadas (pulse),
 * simulando la estructura de listas como leaderboard o notificaciones.
 *
 * Uso:
 *   <ListSkeleton rows={5} />
 *   <ListSkeleton rows={3} avatar={false} subtitle={false} />
 */

interface ListSkeletonProps {
  rows?: number;
  avatar?: boolean;
  subtitle?: boolean;
  className?: string;
}

export function ListSkeleton({
  rows = 5,
  avatar = true,
  subtitle = true,
  className = '',
}: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 animate-pulse"
        >
          {avatar && (
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 w-3/5 bg-gray-200 rounded" />
            {subtitle && (
              <div className="h-2.5 w-4/5 bg-gray-200 rounded" />
            )}
          </div>
          {avatar && (
            <div className="h-5 w-10 shrink-0 bg-gray-200 rounded" />
          )}
        </div>
      ))}
    </div>
  );
}
