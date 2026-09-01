'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderActionButtonProps {
  /** Acción al hacer clic */
  onClick: () => void;
  /** Ícono que acompaña el texto (heredará el color del botón) */
  icon: React.ReactNode;
  /** Texto del botón (ej. "Agregar", "Refrescar") */
  children: React.ReactNode;
  /** Tooltip accesible (title) */
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  /** Clases adicionales (ej. `mt-2` según el contexto del header) */
  className?: string;
}

/**
 * Botón de acción del header de listas (ej. "Agregar", "Refrescar").
 *
 * Encapsula el patrón visual de los botones de acción del header usando
 * los tokens de marca de Vibra (`bg-vibra-blue`, `hover:bg-vibra-blue-light`),
 * de modo que un cambio de tema o de estilo se propaga en un solo lugar
 * y todas las páginas que usan ListPageLayout mantienen uniformidad.
 *
 * El ícono recibe tamaño `h-4 w-4` y hereda el color del texto (currentColor).
 */
const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  onClick,
  icon,
  children,
  title,
  type = 'button',
  disabled = false,
  className,
}) => (
  <button
    type={type}
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={cn(
      'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-vibra-blue px-5 py-[7px] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-vibra-blue-light disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4',
      className,
    )}
  >
    {icon}
    {children}
  </button>
);

export default HeaderActionButton;