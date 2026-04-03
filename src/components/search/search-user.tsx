import { searchByQuery } from '@/api/user';
import { DocumentType } from '@/models/documentType.entity';
import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { XCircleIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import "../../../app/globals.css";
import DynamicHeroIcon from '../layouts/icon/icon-dinamic';
import './search.css';

interface SearchProps {
    isOpen: boolean;
    onClose: () => void;
    setUser: (data: User[]) => void;
    disabled: boolean;
    val: string;
    children: React.ReactNode;
}

const SearchUser: React.FC<SearchProps> = ({ isOpen, onClose, setUser, disabled, val, children }) => {
    const [show, setShow] = useState(isOpen);
    const [query, setQuery] = useState('');

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

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const query = e.target.value.trim();

        if (query.length > 6) {
            const response = await searchByQuery(query);

            if (response.length > 0) {
                setUser(response);
                setQuery(response[0].documentNumber);
            } else {
                setUser([{
                    _id: '',
                    password: '',
                    name: '',
                    email: '',
                    documentType: {} as unknown as DocumentType,
                    documentNumber: query,
                    address: '',
                    phoneNumber: '',
                    username: '',
                    role: {} as unknown as Role,
                    createdAt: new Date(),
                    createdBy: '',
                    isLogged: false,
                    userId: ''
                }])
            }
        } else {
            setUser([
                {
                    _id: '',
                    password: '',
                    name: '',
                    email: '',
                    documentType: {} as unknown as DocumentType,
                    documentNumber: query,
                    address: '',
                    phoneNumber: '',
                    username: '',
                    role: {} as unknown as Role,
                    createdAt: new Date(),
                    createdBy: '',
                    isLogged: false,
                    userId: ''
                },
            ]);
        }
    };

    const handleSearchClean = async () => {
        setQuery('');
        setUser([]);
    };

    return (
        <div className="w-full">
            <div className="mt-0 w-full">
                <div className="flex rounded-md shadow-sm border-white ring-inset ring-gray-400 sm:max-w-md w-full bg-white">
                    <span className="flex rounded-l-md justify-start select-none items-center pl-3 pr-4 text-gray-500 sm:text-sm bg-white">Document: </span>
                    <input
                        type="text"
                        name="query"
                        id="query"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            handleSearch(e);
                        }}
                        disabled={disabled}
                        style={{ float: 'right' }}
                        className="block w-full py-1.5 text-gray-900 border-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder='Doc. number'
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

export default SearchUser;