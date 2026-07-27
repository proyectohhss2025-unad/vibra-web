/**
 * Skeleton — componente atómico para estados de carga.
 *
 * Renderiza un bloque gris animado (pulse) que puede usarse como placeholder
 * mientras se cargan datos. Es el bloque base del patrón Skeleton.
 *
 * Uso:
 *   <Skeleton className="h-4 w-20" />
 *   <Skeleton className="h-8 w-8 rounded-full" />
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}
