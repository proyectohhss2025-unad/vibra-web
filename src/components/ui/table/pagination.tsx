import React, { useState } from 'react';
import './css/pagination.css'
import DropdownMenuButton from '@/components/layouts/menu/dropdown-menu-button';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (newPage: number) => void;
    setPageSize: (value: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    setPageSize
}) => {
    const { t } = useTranslation();
    const totalPages = Math.ceil(totalItems / pageSize);
    const [labelSelected, setLabelSelected] = useState('12');
    const [options, setOptions] = useState<any[]>([
        { _id: '1', description: '12', name: '12', value: '12', label: '12', icon: 'CheckCircleIcon' },
        { _id: '2', description: '20', name: '20', value: '20', label: '20', icon: 'CheckCircleIcon' },
        { _id: '3', description: '40', name: '40', value: '40', label: '40', icon: 'CheckCircleIcon' },
        { _id: '4', description: '80', name: '80', value: '80', label: '80', icon: 'CheckCircleIcon' },
    ]);

    const pageRange = [
        Math.max(1, currentPage - 1),
        Math.min(totalPages, currentPage + 1),
    ];

    const handlePageClick = (newPage: number) => {
        onPageChange(newPage);
    };

    const renderOption = ({ label }) => label;
    const handleChangeSelected = (option: any) => {
        if (!option) {
            return;
        }
        const newPageSize = Number.parseInt(option.value, 10);
        setPageSize(newPageSize);
        setLabelSelected(`${newPageSize}`);
    };

    return (
        <div className="pagination">
            <button className='text-sm hover:bg-blue-500'
                disabled={currentPage === 1}
                onClick={() => handlePageClick(currentPage - 1)}
            >
                {t('common.previous')}
            </button>
            {pageRange.map((page, item) => (
                <button
                    key={`${page}_${item}`}
                    className={`text-sm hover:bg-blue-800 ${currentPage === page ? 'active rounded border bg-blue-500' : ''}`}
                    onClick={() => handlePageClick(page)}
                >
                    {page}
                </button>
            ))}
            <button className='text-sm hover:bg-blue-500'
                disabled={currentPage === totalPages}
                onClick={() => handlePageClick(currentPage + 1)}
            >
                {t('common.next')}
            </button>

            <DropdownMenuButton
                label={labelSelected}
                options={options}
                renderOption={renderOption}
                onSelect={handleChangeSelected}
                valueSelected={labelSelected}
                minWidth='max-w-20 text-sm py-1'
            />

            <div className='ml-2'>- Total de registros: {totalItems}</div>
        </div>
    );
};

export default Pagination;