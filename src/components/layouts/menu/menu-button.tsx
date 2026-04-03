'use client'

import React from 'react';

import './menu-button.css';

interface MenuButtonProps {
    id: string;
    name: string;
    children: any;
    handler: (value: any) => void;
    description?: any;
    disabled?: boolean;
    detailsIncluded?: any;
    withLabel?: boolean;
    valueLabel?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ id, name, handler, children, description, disabled, detailsIncluded, withLabel = false, valueLabel = '0' }) => {
    return (
        <button disabled={disabled} onClick={handler} key={id}
            className={`${disabled ? 'hover:bg-gray-200 hover:text-gray-800 bg-gray-400'
                : 'hover:bg-green-50 hover:text-gray-800 bg-gray-100'} relative flex-cols items-center px-1 py-1 justify-center w-full h-full border-2 rounded-md cursor-pointer`}>
            <div className='relative flex items-center'>
                <div className={'text-ms ml-2 mt-0'}>
                    {children}
                </div>
                <div className={'text-sm font-bold pl-1 justify-center text-gray-600 hover:text-gray-700 mt-0'} style={{ marginTop: '-20px' }}>
                    {name}
                </div>
                {withLabel && <div className={`text-xs min-w-8 h-full justify-end bg-blue-600 text-white pl-1 py-0 mt-0 rounded-md cursor-pointer px-2 flex items-center`}
                    style={{ float: 'right', marginTop: '-20px', marginLeft: '10%' }} >{valueLabel}</div>}
            </div>
            <div className='text-xs mt-0' style={{ marginTop: '-10px' }}>{description}</div>
        </button>
    );
};

export default MenuButton;