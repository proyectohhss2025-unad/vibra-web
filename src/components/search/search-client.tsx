import { searchParticipantsByQuery } from '@/api/participant';
import { Participant } from '@/models/participant.entity';
import { DocumentType } from '@/models/documentType.entity';
import { XCircleIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import "../../../app/globals.css";
import DynamicHeroIcon from '../layouts/icon/icon-dinamic';
import './search.css';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';

interface SearchProps {
    isOpen: boolean;
    onClose: () => void;
    setParticipant: (data: Participant[]) => void;
    disabled: boolean;
    val: string;
    children: React.ReactNode;
}

const SearchParticipant: React.FC<SearchProps> = ({ isOpen, onClose, setParticipant, disabled, val, children }) => {
    const [show, setShow] = useState(isOpen);
    const [query, setQuery] = useState('');
    const [disabled_, setDisabled_] = useState(disabled);

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
            const response = await searchParticipantsByQuery(query);

            if (response.length > 0) {
                setParticipant(response);
                setQuery(response[0].nit);
                setDisabled_(true);
            } else {
                setParticipant([
                    {
                        _id: '',
                        userId: '',
                        nickname: 'Not found',
                        points: 0,
                        level: 'bronce',
                        currentStreak: 0,
                        maxStreak: 0,
                        totalActivitiesCompleted: 0,
                        isActive: false,
                        name: 'Not found',
                        nit: query,
                        address: '',
                        phoneNumber: '',
                        email: '',
                        createdAt: new Date(),
                        createdBy: '',
                        managerData: {
                            document: '',
                            documentType: {} as unknown as DocumentType,
                            email: '',
                            name: '',
                            phoneNumber: '',
                        },
                        creditLimit: 0,
                        avatar: '03.jpg'
                    },
                ]);
            }
        } else {
            setParticipant([
                {
                    _id: '',
                    userId: '',
                    nickname: 'Not found',
                    points: 0,
                    level: 'bronce',
                    currentStreak: 0,
                    maxStreak: 0,
                    totalActivitiesCompleted: 0,
                    isActive: false,
                    name: 'Not found',
                    nit: query,
                    address: '',
                    phoneNumber: '',
                    email: '',
                    createdAt: new Date(),
                    createdBy: '',
                    managerData: {
                        document: '',
                        documentType: {} as unknown as DocumentType,
                        email: '',
                        name: '',
                        phoneNumber: '',
                    },
                    creditLimit: 0,
                    avatar: '03.jpg'
                },
            ]);
        }
    };

    const handleSearchClean = async () => {
        setQuery('');
        setParticipant([]);
        setDisabled_(false);
    };

    return (
        <div className="w-full">
            <div className="mt-0 w-full">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-400 sm:max-w-md w-full bg-white">
                    <span className="flex justify-start select-none items-center pl-2 pr-2 text-gray-500 sm:text-sm">{getSafeKeyFromStorage('NIT')}: </span>
                    <input
                        type="text"
                        name="query"
                        id="query"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            handleSearch(e);
                        }}
                        disabled={disabled_}
                        style={{ float: 'right', border: 'none' }}
                        className="w-full py-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 my-1 mr-0"
                        placeholder={`Número de documento`}
                    />
                    {<span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '60px' }}>
                        {false && <DynamicHeroIcon icon="SearchIcon" handler={() => handleSearch} className="h-7 w-8 text-blue-500 mt-1 ml-2 mr-2" />}
                        {query && <XCircleIcon onClick={handleSearchClean} name="clean" className="h-6 w-6 text-blue-500" color="#EAEAEA" />}
                    </span>}
                    {disabled_ && <span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '40px' }}>
                    </span>}
                </div>
                {children}
            </div>
        </div>
    );
};

export default SearchParticipant;
