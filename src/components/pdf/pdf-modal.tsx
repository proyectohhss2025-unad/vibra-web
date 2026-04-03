import React, { Fragment, useEffect, useState } from 'react';
import './pdf-modal.css';
import { Dialog, Transition } from '@headlessui/react';

interface PdfModalProps {
    pdfBase64: string;
    isOpen: boolean;
    onClose: () => void;
    classSize?: string;
}

const PdfModal: React.FC<PdfModalProps> = ({ pdfBase64, isOpen, onClose, classSize = 'max-w-md' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [show, setShow] = useState(isOpen);

    const handleLoad = () => {
        setIsLoading(false);
    };

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setShow(false);
        if (onClose) {
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    /* return (
        <div className="modal-overlay">
            <div className="modal max-w-4xl">
                <button className="close-button" onClick={onClose}>
                    X
                </button>
                {!pdfBase64 ? (
                    <div className="loading">Loading PDF...</div>
                ) : (
                    <iframe
                        src={`data:application/pdf;base64,${pdfBase64}`}
                        title="PDF Viewer"
                        onLoad={handleLoad}
                        className="pdf-viewer"
                    />
                )}
            </div>
        </div>
    ); */

    return (
        <Transition
            as={Fragment}
            show={show}
            enter="transform transition-duration-500 ease-in-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition-duration-500 ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <Dialog open={show} onClose={onClose} className='success fixed top-0 left-0 w-full h-full overflow-auto bg-gray-500 bg-opacity-75 flex justify-center items-center'>
                <Transition.Child
                    as={Fragment}
                    enter="transform transition-duration-500 ease-in-out"
                    enterFrom="translate-y-full"
                    enterTo="translate-y-0"
                    leave="transform transition-duration-500 ease-in-out"
                    leaveFrom="translate-y-0"
                    leaveTo="translate-y-full"
                >
                    <div className={`w-full ${classSize} max-h-dvh p-6 bg-white rounded-md shadow-xl`}>
                        <button className="close-button" onClick={onClose}>
                            X
                        </button>
                        {pdfBase64 ? (
                            <iframe
                                src={`data:application/pdf;base64,${pdfBase64}`}
                                title="PDF Viewer"
                                onLoad={handleLoad}
                                className="pdf-viewer"
                            />
                        ) : (
                            <div className="loading">Loading PDF...</div>
                        )}
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    )
};

export default PdfModal;