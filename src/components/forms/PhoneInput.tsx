import React, { useState, useEffect, useRef } from 'react';
import { maskFormatPhoneNumber, unmaskPhoneNumber } from '@/utils/number';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChange,
    error,
    disabled = false,
    label = 'Teléfono',
    placeholder = '+57 (300) 123-4567',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    // Almacenar el último valor de solo dígitos
    const [internalDigits, setInternalDigits] = useState(() => value.replace(/\D/g, ''));
    const [isFocused, setIsFocused] = useState(false);

    // Sincronizar desde RHF hacia el componente
    useEffect(() => {
        const strValue = String(value ?? '');
        const digits = strValue.replace(/\D/g, '');
        setInternalDigits(digits);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        // Extraer solo dígitos
        const digitsOnly = e.target.value.replace(/\D/g, '');
        // Limitar a 10 dígitos (número colombiano)
        const limited = digitsOnly.slice(0, 10);
        setInternalDigits(limited);
        onChange(limited);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Al perder el foco, si hay al menos 7 dígitos, formatear
        if (internalDigits.length >= 7) {
            // Re-emitir formateado para que se vea bonito al desenfocar
            // Pero mantener solo dígitos internamente
        }
    };

    // En foco: mostrar solo dígitos. En blur: mostrar formateado.
    const displayValue = isFocused
        ? internalDigits
        : (internalDigits.length > 0 ? maskFormatPhoneNumber(internalDigits) : '');

    // Cuando hay error, siempre mostrar formateado
    const finalDisplay = error ? maskFormatPhoneNumber(internalDigits) : displayValue;

    const inputClasses = [
        'w-full px-3 py-2 border rounded-md text-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'transition-colors duration-150',
        'bg-white',
        disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'text-gray-900',
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
    ].join(' ');

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                ref={inputRef}
                type="tel"
                value={finalDisplay}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                className={inputClasses}
                maxLength={18}
                autoComplete="off"
            />
            {error && (
                <span className="text-xs text-red-500 mt-0.5">{error}</span>
            )}
        </div>
    );
};

export default PhoneInput;
