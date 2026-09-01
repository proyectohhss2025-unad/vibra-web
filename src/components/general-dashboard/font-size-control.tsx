'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { Minus, Plus, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

/**
 * Control de tamaño de fuente global.
 *
 * Escala la tipografía de toda la aplicación cambiando el `font-size` del elemento
 * raíz (`<html>`). Como Tailwind usa unidades `rem` para textos y espaciados,
 * el cambio escala de forma proporcional toda la interfaz.
 *
 * - Valor por defecto: 100% (tamaño actual del sistema).
 * - Rango permitido: 80% – 140% (pasos de 10%).
 * - La preferencia se persiste en `localStorage` para restaurarla entre sesiones.
 */
const FONT_SCALE_KEY = "fontScale";
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const STEP = 0.1;

export function FontSizeControl() {
  const [fontScale, setFontScale] = useState(1.0);

  // Restaurar preferencia guardada (solo en cliente, evita problemas de hidratación)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FONT_SCALE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
          setFontScale(parsed);
        }
      }
    } catch {
      // localStorage no disponible: usar valor por defecto
    }
  }, []);

  // Aplicar escala al elemento raíz
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  const applyScale = useCallback((next: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setFontScale(clamped);
    try {
      localStorage.setItem(FONT_SCALE_KEY, String(clamped));
    } catch {
      // ignorar errores de storage
    }
  }, []);

  const resetScale = useCallback(() => {
    setFontScale(1.0);
    try {
      localStorage.removeItem(FONT_SCALE_KEY);
    } catch {
      // ignorar errores de storage
    }
  }, []);

  const percent = Math.round(fontScale * 100);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={`Tamaño de fuente: ${percent}%`}
          aria-label="Ajustar tamaño de fuente de la aplicación"
          className="relative h-8 w-8 rounded-full flex items-center justify-center bg-transparent hover:bg-gray-100 transition-colors border-0"
        >
          <span
            className="font-bold !text-gray-600 hover:!text-gray-900 leading-none"
            style={{ fontSize: `${13 * fontScale}px` }}
          >
            A
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 gap-y-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Tamaño de fuente</p>
            <p className="text-xs leading-none text-muted-foreground">
              Escala toda la aplicación ({percent}%)
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <button
            type="button"
            onClick={() => applyScale(fontScale - STEP)}
            disabled={fontScale <= MIN_SCALE}
            title="Disminuir fuente"
            aria-label="Disminuir tamaño de fuente"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="h-4 w-4 !text-gray-600" />
          </button>

          <span className="text-sm font-semibold text-gray-700 tabular-nums w-12 text-center">
            {percent}%
          </span>

          <button
            type="button"
            onClick={() => applyScale(fontScale + STEP)}
            disabled={fontScale >= MAX_SCALE}
            title="Aumentar fuente"
            aria-label="Aumentar tamaño de fuente"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 !text-gray-600" />
          </button>
        </div>
        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={resetScale}
          title="Restablecer tamaño de fuente"
          aria-label="Restablecer tamaño de fuente al valor por defecto"
          className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <RotateCcw className="h-4 w-4 !text-gray-600" />
          Restablecer (100%)
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}