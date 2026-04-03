import React, { useEffect, useState } from 'react';

import "../../../app/globals.css";
import './search.css';

import { XCircleIcon } from '@heroicons/react/solid';

interface SearchProps {
    entity?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    setValue: (data: any) => void;
    setIsLoading: (data: boolean) => void;
    onlyNumber?: boolean;
    disabled?: boolean;
    withLabelAlias?: boolean;
    placeholder?: string;
    size?: number;
    className?: string;
}

const SearchReport: React.FC<SearchProps> = ({
    entity,
    isOpen,
    onClose,
    children,
    setValue,
    onlyNumber = false,
    setIsLoading,
    disabled = false,
    withLabelAlias = true,
    placeholder = '',
    size,
    className = ''
}) => {
    const [show, setShow] = useState(isOpen);
    const [query, setQuery] = useState('');
    const [isClean, setIsClean] = useState(false);

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    useEffect(() => {
        setValue(query);
        setIsClean(false);
    }, [query]);


    const handleSearchClean = async () => {
        setQuery('');
        setIsClean(true);
        setIsLoading(false);
    };

    return (
        <div className="mt-2 flex items-center w-full gap-x-0">
            <div style={{ paddingTop: '1px', paddingBottom: '1px' }} className={`flex w-full items-center rounded-md shadow-sm ring-1 ring-inset ring-gray-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 ${disabled ? 'bg-gray-100' : ''} ${className}`}>
                {withLabelAlias && <span className="flex select-none items-center pl-3 pr-4 text-gray-500 sm:text-sm">Search: </span>}
                <input
                    size={size}
                    disabled={disabled}
                    type="text"
                    name={entity}
                    id={entity}
                    value={query}
                    onChange={(e) => setQuery(onlyNumber ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)}
                    className={`block flex-4 border-0 bg-transparent py-1 pl-3 pr-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-7`}
                    placeholder={placeholder}
                />
                {!isClean && query && <XCircleIcon onClick={handleSearchClean} name="clean" className="flex h-6 w-7 justify-end text-blue-500 mt-0 pr-0 mr-0 cursor-pointer" color="#EAEAEA" />}
            </div>
            {children}
        </div>
    );
};

export default SearchReport;