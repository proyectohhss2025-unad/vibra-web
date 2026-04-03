import { searchReportsByName } from '@/utils/arrays';
import { XCircleIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import "../../../app/globals.css";
import DynamicHeroIcon from '../layouts/icon/icon-dinamic';
//import { items } from '../reports/reports-option';
import './search.css';

interface SearchProps {
    isOpen: boolean;
    onClose: () => void;
    setConfigs: (data: any[]) => void;
    disabled: boolean;
    val: string;
    items: any[];
    children: React.ReactNode;
}

const SearchConfigs: React.FC<SearchProps> = ({ isOpen, onClose, setConfigs, disabled, val, items, children }) => {
    const [show, setShow] = useState(isOpen);
    const [query, setQuery] = useState('');
    const [disabled_, setDisabled_] = useState<boolean>(false);
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        if (val) {
            setQuery(val);
        }
    }, [val]);

    useEffect(() => {
        setShow(isOpen);
        if (disabled) {
            setQuery(val);
        }
    }, [isOpen, disabled, val]);

    useEffect(() => {
        const menuItems_: any[] = [];
        items.forEach((item) => {
            menuItems_.push({
                id: item._id,
                name: item.label,
                icon: item.icon,
                handler: item.href,
                description: item.description,
                detailsIncluded: item.detailsIncluded,
                isActive: item.isActive,
                viewInFastMenu: item.viewInFastMenu,
                type: item.type
            });
        });
        console.log('menuItems_:', menuItems_);
        setMenuItems(menuItems_);
    }, []);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const query = e.target.value.trim();

        if (query.length > 4) {
            console.log('menuItems: ', menuItems, ' query: ', query);
            const response: any = searchReportsByName(menuItems, query);
            console.log('response: ', response);
            if (response?.length > 0) {
                setConfigs(response);
                setQuery(response[0].name);
                setDisabled_(true);
            } else {
                setConfigs([])
            }
        } else {
            setConfigs([]);
        }
    };

    const handleSearchClean = async () => {
        setQuery('');
        setConfigs([]);
        setDisabled_(false);
    };

    return (
        <div className="w-full">
            <div className="mt-0 w-full">
                <div className="flex rounded-md shadow-sm border-white ring-1 ring-inset ring-gray-400 sm:max-w-md w-full bg-white">
                    <span className="flex rounded-l-md justify-start select-none items-center pl-2 pr-2 m-1 text-gray-500 sm:text-sm bg-white">Busqueda: </span>
                    <input
                        type="text"
                        name="query"
                        id="query"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            handleSearch(e);
                        }}
                        disabled={disabled_ ?? disabled}
                        style={{ float: 'right' }}
                        className="block w-full m-1 py-1 text-gray-900 border-white placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder='Nombre, descripción'
                    />
                    {!disabled && <span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '60px' }}>
                        {false && <DynamicHeroIcon icon="SearchIcon" handler={() => handleSearch} className="h-7 w-8 text-blue-500 mt-1 ml-2 mr-2" />}
                        {query && <XCircleIcon onClick={handleSearchClean} name="clean" className="h-6 w-6 text-blue-500" color="#EAEAEA" />}
                    </span>}
                </div>
                {children}
            </div>
        </div>
    );
};

export default SearchConfigs;