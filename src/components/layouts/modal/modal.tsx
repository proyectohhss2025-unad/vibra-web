'use client'

import React from 'react';

import "../../../../app/globals.css";
import './modal.css';

interface ModalProps {
    isOpen: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    classSize?: string;
    zIndex?: number;
    onConfirm?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, classSize = 'max-w-md', zIndex = 300, onConfirm }) => {

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="loading-container fixed inset-0 flex items-center justify-center z-50"
            style={{ zIndex: zIndex }}
        >
            <div
                className={`bg-white rounded-lg shadow-lg w-full ${classSize} p-6  bg-white rounded-md shadow-xl overflow-hidden relative`}
            >
                <button
                    className="absolute top-3 right-4 pb-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={onClose}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className='mt-1.5'>
                    {title && <h2>{title}</h2>}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;