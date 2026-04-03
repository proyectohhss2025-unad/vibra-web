import { ChevronDoubleDownIcon } from '@heroicons/react/solid';
import React, { useEffect, useRef, useState } from 'react';
import DynamicHeroIcon from '../icon/icon-dinamic';

interface DropdownMenuButtonProps {
    label: string;
    options: Array<{ value: any; label: string, icon: string }>;
    renderOption: (option: { value: any; label: string }) => React.ReactNode;
    onSelect: (value: any) => void;
    className?: string;
    valueSelected?: any;
    disabled?: boolean;
    minWidth?: string;
}

const DropdownMenuButton: React.FC<DropdownMenuButtonProps> = ({ label = 'jojojojs', options, renderOption, onSelect, className, valueSelected, disabled = false, minWidth = 'w-96' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggleDropdown = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleSelectOption = (value: any) => {
        onSelect(value);
        setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as unknown as any)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative inline-block w-full ${minWidth}`} ref={dropdownRef} >
            <button
                type='button'
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isOpen ? 'active' : ''} ${className} `}
                onClick={handleToggleDropdown}
            >
                <span className={'text-gray-700 text-md justify-start'}>{label}</span>
                <span className={'ml-2'}>
                    <ChevronDoubleDownIcon name="drowndown" className="h-5 w-8 text-gray-500 leading-6" color="#337ab7" />
                </span>
            </button>

            {isOpen && (
                <div className={`absolute z-10 top-full left-0 w-full overflow-hidden ${isOpen ? '' : 'hidden'} ${disabled ? 'hidden' : ''}`}>
                    <div className={'bg-gray-600 shadow-xl rounded-md border-b border-white-2 text-sm'}>
                        <ul className={'list-none p-0'}>
                            {options.map((option) => (
                                <li key={option.value} className='px-1 py-1 cursor-pointer hover:bg-blue-500 rounded border-b border-white-2'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            handleSelectOption(option);
                                        }}
                                        className='flex w-full px-3 py-2 text-white justify-start'
                                    >
                                        {valueSelected == renderOption(option) && <DynamicHeroIcon icon={option.icon} className="h-6 w-6 text-white-500 leading-4 mr-2" color="#FFFFFF" />}
                                        {renderOption(option)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenuButton;