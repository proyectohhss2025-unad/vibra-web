import { ArrowCircleLeftIcon, PlusCircleIcon } from '@heroicons/react/solid';
import React, { useState } from 'react';
import WhatsAppChat from '../channel/whatsapp-chat';
import ToggleSwitch from '../forms/toggleSwitch';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string, type: string | 'improvement' | 'support') => void;
}

const FeedbackModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('improvement');

    const handleSubmit = () => {
        onSubmit(message, type);
        onClose();
    };

    //return <></>;

    return (
        <div
            className={`hidden`/*`fixed inset-0 flex items-center justify-center z-50 transition-opacity ${isOpen ? 'bg-opacity-75' : 'opacity-0'}`*/}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }} >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-sm"
                onClick={(e) => e.stopPropagation()} >
                <h2 className="text-xl font-bold mb-4">Enviar comentarios</h2>
                <textarea
                    className="w-full resize-none border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="Envia un comentario de tu solicitud de apoyo o la mejora que ves posible en la aplicación"
                    value={message}
                    rows={3}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center">
                        <div className="mt-0 mb-1 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                            <div className="sm:col-span-7 flex justify-end">
                                <div className="flex sm:max-w-md mb-2">
                                    <ToggleSwitch initialValue={type === 'improvement'} label="Mejora" handleChange={() => setType('improvement')} />
                                </div>
                            </div>
                            <div className="sm:col-span-5 flex justify-end">
                                <div className="flex sm:max-w-md mb-2">
                                    <ToggleSwitch initialValue={type === 'support'} label="Apoyo" handleChange={() => setType('support')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <WhatsAppChat isIcon={true} />
                <div className="mt-6 flex justify-end">
                    <div className="relative mt-8 ml-2 pl-0">
                        <div className="absolute inset-y-0 start-0 flex mt-0 items-center ps-3.5 pointer-events-none mr-6">
                            <ArrowCircleLeftIcon style={{ float: 'left' }} name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`bg-gray-500 hover:bg-gray-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                        >
                            Cancelar
                        </button>
                    </div>
                    <div className="relative mt-8 ml-2 pl-0">
                        <div className="absolute inset-y-0 start-0 flex mt-0 items-center ps-3.5 pointer-events-none mr-6">
                            <PlusCircleIcon style={{ float: 'left' }} name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={`bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;