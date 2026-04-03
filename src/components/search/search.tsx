import React, { useEffect, useState } from 'react';

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

    //NOTE: Ajustar para los diferentes entities, o llegada 
    const handleSearch = async () => {
        //setIsLoading(true);
        if (query.length === 0) return;

        const data_ = await searchByQuery(query, entity);
        setDataAux(data_.data);
        setData(data_.data);
        //setIsLoading(false);
    };

    const handleSearchCopy = async () => {
        setIsLoading(true);

        if (onlyNumber) {
            setDataAux(data);
        } else {

            const data_ = await searchByQuery(query, entity);
            setDataAux(data_.data);
            setData(data_.data);
        }
        setIsLoading(false);
    };

    const handleSearchClean = async () => {
        setQuery('');
        setData(dataAux ?? []);
        setIsClean(false);
        setIsLoading(false);
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
                    className={`block flex-4 border-0 bg-transparent py-1 pl-3 pr-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm sm:leading-7`}
                    placeholder={placeholder}
                />
                <div className='flex items-center'>
                    {!isClean && query && <XCircleIcon onClick={handleSearchClean} name="clean" className="flex h-6 w-7 justify-end text-blue-500 mt-0 pr-1 cursor-pointer" color="#EAEAEA" />}
                    <DynamicHeroIcon icon="SearchIcon" style={{ float: 'right !important' }} handler={handleSearch} className="flex h-6 w-7 justify-end text-gray-500 mt-0 pr-1 cursor-pointer" />
                </div>
            </div>
            {children}
        </div>
    );
};

export default Search;