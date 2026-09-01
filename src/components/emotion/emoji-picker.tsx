'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/new-york/ui/popover';

/**
 * Catálogo de emojis de emociones agrupados por las categorías
 * del sistema (Positiva, Negativa, Neutra, Basica, Compleja).
 * Cada emoji tiene una etiqueta legible para que el usuario
 * sepa qué emoción representa al momento de seleccionarlo.
 */
export const EMOTION_EMOJIS: {
  category: string;
  items: { emoji: string; label: string }[];
}[] = [
  {
    category: 'Positivas',
    items: [
      { emoji: '😊', label: 'Alegría' },
      { emoji: '😄', label: 'Felicidad' },
      { emoji: '😁', label: 'Entusiasmo' },
      { emoji: '😍', label: 'Amor' },
      { emoji: '🥰', label: 'Cariño' },
      { emoji: '😎', label: 'Confianza' },
      { emoji: '🤩', label: 'Asombro' },
      { emoji: '🙌', label: 'Gratitud' },
      { emoji: '💖', label: 'Ilusión' },
      { emoji: '🌟', label: 'Esperanza' },
    ],
  },
  {
    category: 'Negativas',
    items: [
      { emoji: '😢', label: 'Tristeza' },
      { emoji: '😭', label: 'Pena' },
      { emoji: '😠', label: 'Enojo' },
      { emoji: '😡', label: 'Ira' },
      { emoji: '🤬', label: 'Frustración' },
      { emoji: '😨', label: 'Miedo' },
      { emoji: '😱', label: 'Terror' },
      { emoji: '😰', label: 'Ansiedad' },
      { emoji: '😞', label: 'Decepción' },
      { emoji: '💔', label: 'Dolor' },
    ],
  },
  {
    category: 'Neutras',
    items: [
      { emoji: '😐', label: 'Neutral' },
      { emoji: '😑', label: 'Indiferencia' },
      { emoji: '🤔', label: 'Reflexión' },
      { emoji: '🧐', label: 'Curiosidad' },
      { emoji: '😌', label: 'Calma' },
      { emoji: '🫤', label: 'Confusión' },
      { emoji: '😏', label: 'Picardía' },
      { emoji: '😶', label: 'Sin palabras' },
    ],
  },
  {
    category: 'Básicas',
    items: [
      { emoji: '😀', label: 'Feliz' },
      { emoji: '😢', label: 'Triste' },
      { emoji: '😠', label: 'Enojado' },
      { emoji: '😨', label: 'Asustado' },
      { emoji: '🤢', label: 'Asco' },
      { emoji: '🥱', label: 'Aburrido' },
      { emoji: '😴', label: 'Cansado' },
      { emoji: '🤯', label: 'Abrumado' },
    ],
  },
  {
    category: 'Complejas',
    items: [
      { emoji: '🥺', label: 'Nostalgia' },
      { emoji: '😳', label: 'Vergüenza' },
      { emoji: '😅', label: 'Nervios' },
      { emoji: '😬', label: 'Incomodidad' },
      { emoji: '🤗', label: 'Empatía' },
      { emoji: '🫠', label: 'Derrota' },
      { emoji: '😵', label: 'Aturdimiento' },
      { emoji: '🤒', label: 'Malestar' },
    ],
  },
];

interface EmojiPickerProps {
  /** Emoji actualmente seleccionado (valor del campo icono) */
  value?: string;
  /** Callback al seleccionar un emoji del panel o editar el input */
  onChange: (emoji: string) => void;
  /** Deshabilita el campo y el botón del panel */
  disabled?: boolean;
  /** id del input de texto (para asociar con el label del formulario) */
  inputId?: string;
}

/**
 * Selector visual de emojis para el campo "Icono" de una emoción.
 *
 * Combina un input de texto (para compatibilidad con valores existentes)
 * con un botón que abre un panel (Popover) con la grilla de emojis
 * agrupados por categoría. Cada emoji muestra su nombre como tooltip
 * (title) y aria-label para accesibilidad.
 */
const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onChange,
  disabled = false,
  inputId,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <input
        id={inputId}
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Ej: 😊"
        autoComplete="off"
        className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Abrir panel de emojis para seleccionar el icono"
            title="Elegir emoji del panel"
            className="inline-flex min-w-12 items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-2xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span aria-hidden="true">{value || '😀'}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Elige un emoji para representar la emoción
          </p>
          {EMOTION_EMOJIS.map((group) => (
            <div key={group.category} className="mb-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                {group.category}
              </p>
              <div className="grid grid-cols-5 gap-1">
                {group.items.map((item) => (
                  <button
                    key={item.emoji}
                    type="button"
                    title={item.label}
                    aria-label={`${item.label} (${item.emoji})`}
                    aria-pressed={value === item.emoji}
                    onClick={() => {
                      onChange(item.emoji);
                      setOpen(false);
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-md text-2xl transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      value === item.emoji
                        ? 'bg-blue-50 ring-1 ring-blue-300'
                        : ''
                    }`}
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;