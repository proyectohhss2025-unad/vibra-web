import { SearchIcon, XIcon } from '@heroicons/react/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SearchableSelectProps<T extends { _id: string }> {
  label: string;
  placeholder?: string;
  searchFn: (term: string) => Promise<T[]>;
  renderOption: (item: T) => React.ReactNode;
  getOptionValue?: (item: T) => string;
  value: string;
  onChange: (value: string, item?: T) => void;
  required?: boolean;
  disabled?: boolean;
  minSearchLength?: number;
  debounceMs?: number;
  /** Item preseleccionado (evita llamada a searchFn al editar) */
  initialSelectedItem?: T | null;
}

function SearchableSelect<T extends { _id: string }>({
  label,
  placeholder = 'Buscar...',
  searchFn,
  renderOption,
  getOptionValue,
  value,
  onChange,
  required = false,
  disabled = false,
  minSearchLength = 2,
  debounceMs = 300,
  initialSelectedItem,
}: SearchableSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar cuando el usuario selecciona un item desde el padre (vía value)
  const fetchSelectedItem = useCallback(async () => {
    if (!value) {
      setSelectedItem(null);
      return;
    }
    // Si ya tenemos el item seleccionado y coincide, no buscar
    if (selectedItem && selectedItem._id === value) return;

    // Intentar buscar el item por el término (para mostrar su nombre)
    try {
      const items = await searchFn('');
      const found = items.find(
        (item) => (getOptionValue ? getOptionValue(item) : item._id) === value,
      );
      if (found) {
        setSelectedItem(found);
        setSearchTerm('');
      }
    } catch {
      // Si falla la búsqueda, mostrar el ID como texto
    }
  }, [value, searchFn, getOptionValue, selectedItem]);

  // Sincronizar con el padre: usar initialSelectedItem si existe, sino buscar
  useEffect(() => {
    if (!value) {
      setSelectedItem(null);
      return;
    }
    // Si el padre proporciona el item directamente, usarlo sin buscar
    if (initialSelectedItem && initialSelectedItem._id === value) {
      setSelectedItem(initialSelectedItem);
      setSearchTerm('');
      return;
    }
    // Sino, buscar via API
    fetchSelectedItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, initialSelectedItem]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ejecutar búsqueda con debounce
  const doSearch = useCallback(
    (term: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (term.length < minSearchLength) {
        setResults([]);
        setHasSearchedOnce(false);
        setIsOpen(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        setHasSearchedOnce(true);
        try {
          const data = await searchFn(term);
          setResults(data || []);
          setIsOpen(true);
          setHighlightedIndex(-1);
        } catch {
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [searchFn, minSearchLength, debounceMs],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Si el usuario está escribiendo de nuevo, limpia la selección previa
    if (selectedItem && term !== '') {
      setSelectedItem(null);
      onChange('');
    }
    doSearch(term);
  };

  const handleSelect = (item: T) => {
    const optionValue = getOptionValue ? getOptionValue(item) : item._id;
    setSelectedItem(item);
    setSearchTerm('');
    setIsOpen(false);
    onChange(optionValue, item);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchTerm('');
    setResults([]);
    setHasSearchedOnce(false);
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const inputBaseClass =
    'w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm';

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {selectedItem ? (
        // === MODO SELECCIONADO ===
        <div
          className={`${inputBaseClass} flex items-center justify-between cursor-pointer pl-3 pr-2`}
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(false);
          }}
        >
          <div className="flex-1 min-w-0">{renderOption(selectedItem)}</div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
            title="Limpiar selección"
          >
            <XIcon className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      ) : (
        // === MODO BÚSQUEDA ===
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputBaseClass} pl-10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* === DROPDOWN DE RESULTADOS === */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {results.length === 0 && hasSearchedOnce ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Sin resultados
            </div>
          ) : (
            results.map((item, index) => (
              <button
                key={item._id}
                type="button"
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  index === highlightedIndex
                    ? 'bg-blue-600 text-white [&_*]:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {renderOption(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
