/**
 * StatCardSkeleton — placeholder de carga para grillas de cards de métricas.
 *
 * Patrón estándar para reemplazar spinners full-page en secciones de
 * cards de información. Mantiene la estructura visual de las cards reales
 * (icono + número + label) pero con bloques grises animados.
 *
 * Uso:
 *   <StatCardSkeleton count={4} />
 *
 * Para personalizar el grid:
 *   <div className="grid grid-cols-3 gap-4">
 *     <StatCardSkeleton count={3} />
 *   </div>
 */

import { Skeleton } from './skeleton';

interface StatCardSkeletonProps {
  count?: number;
  className?: string;
}

export function StatCardSkeleton({
  count = 4,
  className = 'grid-cols-2 md:grid-cols-4',
}: StatCardSkeletonProps) {
  return (
    <div className={`grid gap-4 mb-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
