'use client'

import { Maximize, Minimize } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Botón de pantalla completa (simula F11).
 *
 * Alterna el modo fullscreen del documento usando la Fullscreen API del navegador.
 * El icono cambia según el estado (Maximize ↔ Minimize) y se sincroniza con el
 * evento `fullscreenchange` (también se actualiza si el usuario sale con F11 o Esc).
 */
export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    } else {
      const el = doc.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      title={isFullscreen ? "Salir de pantalla completa (F11)" : "Pantalla completa (F11)"}
      aria-label={isFullscreen ? "Salir de pantalla completa" : "Entrar en pantalla completa"}
      className="relative h-8 w-8 rounded-full flex items-center justify-center bg-transparent hover:bg-gray-100 transition-colors border-0"
    >
      {isFullscreen ? (
        <Minimize className="h-5 w-5 !text-gray-600 hover:!text-gray-900" />
      ) : (
        <Maximize className="h-5 w-5 !text-gray-600 hover:!text-gray-900" />
      )}
    </button>
  );
}