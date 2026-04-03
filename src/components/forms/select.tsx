import React from 'react';
import './select.css';
interface SelectProps<T> {
    id?: string;
    label: string;
    options: T[];
    selectedValue: T | null;
    onChange: (value: T) => void;
    className?: string;
    classNameLabel?: string;
    withLabel?: boolean;
    disabled?: boolean;
}

const Select: React.FC<SelectProps<any>> = ({
    id,
    label,
    options,
    selectedValue,
    onChange,
    className = '',
    withLabel = true,
    classNameLabel = '',
    disabled = false
}) => {

    return (
        <div className={`relative ${className}`}>
            {withLabel && <label htmlFor="select" className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 ${classNameLabel}`}>
                {label}
            </label>}
            <select
                id={id}
                className={`${disabled ? 'bg-gray-200 ' : 'bg-gray-50 '}cursor-pointer border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                value={selectedValue}
                onChange={onChange}
                disabled={disabled}
            >
                <option value="0">Select one element... </option>
                {options.map((option_) => (
                    <option
                        title={option_.description}
                        key={option_._id || option_}
                        value={option_._id} // Use option_ is required full object return
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        style={{ padding: '2px' }} >
                        {option_.name || option_}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;