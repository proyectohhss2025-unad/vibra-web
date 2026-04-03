import React, { useEffect, useState } from 'react';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, disabled = false }) => {
    const [displayValue, setDisplayValue] = useState(
        new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    );

    useEffect(() => {
        const inputValue = value;

        onChange(inputValue);

        setDisplayValue(
            new Intl.NumberFormat('es-CO', {
                style: 'currency', currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value || 0)
        );
    }, [value]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.replaceAll(/[^0-9]/g, '');
        const numericValue = Number.parseInt(inputValue || '0', 10);

        onChange(numericValue);

        setDisplayValue(
            new Intl.NumberFormat('es-CO', {
                style: 'currency', currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(numericValue)
        );
    };

    return (
        <input
            type="text"
            disabled={disabled}
            value={displayValue}
            onChange={handleInputChange}
            className="text-center text-4xl max-w-md bg-transparent pl-4 py-0 font-bold text-gray-700 rounded-md border-0 focus:outline-none focus:ring-0 mb-0"
        />
    );
};

export default CurrencyInput;
