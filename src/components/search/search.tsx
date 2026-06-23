import React, { useCallback, useEffect, useRef, useState } from 'react';

import { searchByQuery } from '@/api/general';
import "../../../app/globals.css";
import './search.css';

import { useFilter } from '@/services/contexts/filter-context';
import { XCircleIcon } from '@heroicons/react/solid';
import DynamicHeroIcon from '../layouts/icon/icon-dinamic';

interface SearchProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    setData: (data: any[]) => void;
    setIsLoading: (data: boolean) => void;
    entity: string;
    onlyNumber?: boolean;
    data?: any[];
    disabled?: boolean;
    withLabelAlias?: boolean;
    placeholder?: string;
    size?: number;
    className?: string;
}

const Search: React.FC<SearchProps> = ({
    isOpen,
    onClose,
    children,
    setData,
    entity,
    onlyNumber = false,
    data,
    setIsLoading,
    disabled = false,
    withLabelAlias = true,
    placeholder = '',
    size,
    className = ''
}) => {
    const [show, setShow] = useState(isOpen);
    const [dataAux, setDataAux] = useState<any[]>();
    const [query, setQuery] = useState('');
    const [isClean, setIsClean] = useState(false);
    const { yearFilter, dateInitFilter, dateEndFilter, statusFilter } = useFilter();

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    // Búsqueda automática con debounce mientras se escribe
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.length === 0) {
            // Si se borró el texto, restaurar datos completos
            searchByEntity('');
            return;
        }
        debounceRef.current = setTimeout(() => {
            searchByEntity(query);
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    const searchByEntity = async (searchTerm: string) => {
        setIsLoading(true);
        try {
            const data_ = await searchByQuery(searchTerm, entity);
            if (data_ && data_.data) {
                setData(data_.data);
                setDataAux(data_.data);
            }
        } catch {
            // No actualizar datos si falla la búsqueda
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (query.length === 0 && !isClean) return;
        await searchByEntity(query);
        setIsClean(false);
    };

    const handleSearchClean = async () => {
        setQuery('');
    };

    return (
        <div className="mt-2 flex items-center w-full gap-x-0">
            <div style={{ paddingTop: '1px', paddingBottom: '1px' }} className={`flex w-full items-center justify-between rounded-md shadow-sm ring-1 ring-inset ring-gray-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 ${disabled ? 'bg-gray-100' : ''} ${className}`}>
                {withLabelAlias && <span className="flex select-none items-center pl-3 pr-4 text-gray-500 sm:text-sm">Buscar: </span>}
                <input
                    size={size}
                    disabled={disabled}
                    type="text"
                    name={entity}
                    id={entity}
                    value={query}
                    onChange={(e) => setQuery(onlyNumber ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className={`block flex-4 border-0 bg-transparent py-1 pl-3 pr-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm sm:leading-7`}
                    placeholder={placeholder}
                />
                <div className='flex items-center gap-1 pr-2'>
                    {query && (
                        <button type="button" onClick={handleSearchClean} title="Limpiar búsqueda" className="flex items-center justify-center p-1 rounded hover:bg-gray-100">
                            <XCircleIcon className="h-4 w-4 text-blue-500" />
                        </button>
                    )}
                    <button type="button" onClick={handleSearch} title="Buscar" className="flex items-center justify-center p-1 rounded hover:bg-gray-100">
                        <DynamicHeroIcon icon="SearchIcon" className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
};

export default Search;