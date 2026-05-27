'use client';

import React, { useState } from 'react';
import { config } from '@/config/config';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { toast } from 'sonner';
import FeedbackModal from '../feedback/feedback-modal';

const environment = process.env.NODE_ENV || 'development';
const BASE_URL = config[environment].apiDashboard;

const FloatingFeedbackBtn: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState<'improvement' | 'support'>('improvement');
    const [showModal, setShowModal] = useState(false);

    const handleSelect = (type: 'improvement' | 'support') => {
        setModalType(type);
        setIsOpen(false);
        setShowModal(true);
    };

    const handleSubmit = async (data: { title: string; description: string; type: string }) => {
        try {
            const token = getSafeKeyFromStorage('token');
            const user = getSafeKeyObjectFromStorage('user');
            const response = await fetch(`${BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    isFeature: data.type === 'improvement',
                    isSupport: data.type === 'support',
                    createdBy: user?.name || 'anonymous',
                }),
            });

            if (!response.ok) throw new Error('Error al enviar feedback');

            toast.success('✅ Feedback enviado correctamente');
            setShowModal(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar feedback');
        }
    };

    return (
        <>
            {/* FAB */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
                {/* Opciones expandidas */}
                {isOpen && (
                    <>
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={() => handleSelect('support')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg border text-sm font-medium text-gray-700 hover:text-gray-700 focus:text-gray-700 active:text-gray-700 hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                            >
                                <span>💬</span> Enviar apoyo
                            </button>
                            <button
                                onClick={() => handleSelect('improvement')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg border text-sm font-medium text-gray-700 hover:text-gray-700 focus:text-gray-700 active:text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                            >
                                <span>✨</span> Sugerir mejora
                            </button>
                        </div>
                    </>
                )}

                {/* Botón principal */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all active:scale-95"
                    title="Enviar comentario"
                >
                    <span className="text-2xl">{isOpen ? '✕' : '📝'}</span>
                </button>
            </div>

            {/* Modal */}
            <FeedbackModal
                isOpen={showModal}
                initialType={modalType}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            />
        </>
    );
};

export default FloatingFeedbackBtn;
