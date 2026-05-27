'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AutocompleteTagsProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
}

const AutocompleteTags: React.FC<AutocompleteTagsProps> = ({
    value,
    onChange,
    suggestions,
    placeholder = 'Tags separados por coma',
}) => {
    const [inputFocused, setInputFocused] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get the current word being typed (after the last comma)
    const getCurrentWord = useCallback((): string => {
        const parts = value.split(',');
        const lastPart = parts[parts.length - 1] || '';
        return lastPart.trim().toLowerCase();
    }, [value]);

    // Filter suggestions based on current word
    useEffect(() => {
        const currentWord = getCurrentWord();
        if (currentWord.length > 0 && inputFocused) {
            const filtered = suggestions.filter(
                (tag) =>
                    tag.toLowerCase().includes(currentWord) &&
                    !value.split(',').map((t) => t.trim().toLowerCase()).includes(tag.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowDropdown(filtered.length > 0 || currentWord.length > 0);
            setHighlightedIndex(-1);
        } else {
            setFilteredSuggestions([]);
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    }, [value, suggestions, inputFocused, getCurrentWord]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectTag = (tag: string) => {
        const parts = value.split(',');
        parts[parts.length - 1] = tag;
        const newValue = parts.join(', ').replace(/,\s*$/, '') + ', ';
        onChange(newValue);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
                    selectTag(filteredSuggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            {/* Dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                    {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((tag, index) => {
                            const usageCount = suggestions.filter(
                                (s) => s.toLowerCase() === tag.toLowerCase()
                            ).length;
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectTag(tag);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                                        index === highlightedIndex
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {tag}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {usageCount}
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-400">
                            Sin resultados
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AutocompleteTags;
