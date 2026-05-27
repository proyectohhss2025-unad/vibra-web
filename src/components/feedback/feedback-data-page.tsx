'use client';

import { convertFeedbackToIdea } from '@/api/feedback';
import { getIdeasStatus } from '@/api/admin';
import { config } from '@/config/config';
import { Feedback } from '@/models/feedback.entity';
import { AuthContext } from '@/services/auth';
import { RefreshIcon, SearchIcon, XCircleIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import '../../../app/globals.css';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import FeedbackConvertModal from './feedback-convert-modal';
import './feedback.css';

const environment = process.env.NODE_ENV || 'development';
const BASE_URL = config[environment].apiDashboard;

interface FeedbackWithMeta extends Feedback {
    serial?: string;
    convertedToIdea?: boolean;
    ideaId?: string;
    isFeature?: boolean;
}

const FeedbackDataPage: React.FC = () => {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const [data, setData] = useState<FeedbackWithMeta[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [enDesarrolloCount, setEnDesarrolloCount] = useState(0);

    // Convert modal state
    const [convertModal, setConvertModal] = useState<{ show: boolean; feedback: FeedbackWithMeta | null }>({
        show: false,
        feedback: null,
    });

    // Detail modal state
    const [detailModal, setDetailModal] = useState<{ show: boolean; feedback: FeedbackWithMeta | null }>({
        show: false,
        feedback: null,
    });

    const loadData = async (term: string, page: number, size: number) => {
        setIsLoading(true);
        try {
            const tokenVal = getSafeKeyFromStorage('token');

            let url = `${BASE_URL}/api/feedback?page=${page}&rows=${size}`;
            if (term) {
                url = `${BASE_URL}/api/feedback/search/term?searchTerm=${encodeURIComponent(term)}&page=${page}&rows=${size}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenVal}`,
                },
            });
            if (!response.ok) throw new Error('Error al cargar feedbacks');

            if (term) {
                const result = await response.json();
                setData(result.data || []);
                setTotal(result.data?.length || 0);
            } else {
                const result = await response.json();
                setData(result.feedbacks || []);
                setTotal(result.length || 0);
            }
        } catch (error) {
            console.error('Error loading feedbacks:', error);
            toast.error('Error al cargar los feedbacks');
        } finally {
            setIsLoading(false);
        }
    };

    const loadIdeasStatus = async () => {
        const status = await getIdeasStatus();
        if (status) {
            setEnDesarrolloCount(status.totalIdeas || 0);
        }
    };

    useEffect(() => {
        loadData(searchTerm, currentPage, pageSize);
    }, [currentPage, pageSize, searchTerm]);

    useEffect(() => {
        loadIdeasStatus();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setCurrentPage(1);
        // useEffect se encarga de cargar con searchTerm actualizado
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    useEffect(() => {
        if (!token) {
            router.push('/layout');
        }
    }, [token, router]);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openDetail = (feedback: FeedbackWithMeta) => {
        setDetailModal({ show: true, feedback });
    };

    const closeDetail = () => {
        setDetailModal({ show: false, feedback: null });
    };

    const openConvertModal = (feedback: FeedbackWithMeta) => {
        closeDetail();
        setConvertModal({ show: true, feedback });
    };

    const closeConvertModal = () => {
        setConvertModal({ show: false, feedback: null });
    };

    const handleConvert = async (payload: {
        title: string;
        description: string;
        priority: string;
        tags: string[];
    }) => {
        if (!convertModal.feedback?._id) return;

        const result = await convertFeedbackToIdea(convertModal.feedback._id, payload);
        if (result?.success) {
            toast.success(`✅ Idea ${result.ideaId} creada exitosamente`);
            closeConvertModal();
            loadData(searchTerm, currentPage, pageSize);
        } else {
            toast.error('Error al convertir feedback en idea');
        }
    };

    return (
        <>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Feedback</h2>
                        <div className="flex items-center space-x-2">
                            <div className="bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                                <CurrentDateTime />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md w-full mt-3 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-semibold">Lista de Feedback</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestione los feedbacks recibidos y conviértalos en ideas del backlog.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar feedback..."
                                    className="w-60 rounded-md border border-gray-300 pl-9 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={handleSearchClear}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <XCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </form>
                            <RefreshIcon
                                className="h-7 w-7 text-blue-600 cursor-pointer hover:text-green-500"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500">Feedback Total</p>
                            <p className="text-2xl font-bold text-gray-800">{total}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-amber-600">Pendientes</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {data.filter((f) => !f.convertedToIdea).length}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-green-600">Convertidos</p>
                            <p className="text-2xl font-bold text-green-600">
                                {data.filter((f) => f.convertedToIdea).length}
                            </p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-indigo-600">En Desarrollo (backlog)</p>
                            <p className="text-2xl font-bold text-indigo-600">
                                {enDesarrolloCount}
                            </p>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="uppercase tracking-wider border-b-2">
                                <tr>
                                    <th className="px-2 py-2">Serial</th>
                                    <th className="px-2 py-2">Título</th>
                                    <th className="px-2 py-2 w-auto">Descripción</th>
                                    <th className="px-2 py-2">Tipo</th>
                                    <th className="px-2 py-2">Estado</th>
                                    <th className="px-2 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            {isLoading ? 'Cargando...' : 'No hay feedbacks registrados'}
                                        </td>
                                    </tr>
                                )}
                                {data.map((feedback) => (
                                    <tr key={feedback._id} className="hover:bg-blue-50 border-b cursor-pointer" onClick={() => openDetail(feedback)}>
                                        <td className="px-2 py-2.5 font-mono text-xs whitespace-nowrap">
                                            #{feedback.serial || feedback._id?.slice(-4)}
                                        </td>
                                        <td className="px-2 py-2.5 font-medium truncate max-w-[180px]">
                                            {feedback.title}
                                        </td>
                                        <td className="px-2 py-2.5 text-gray-600 truncate">
                                            {feedback.description?.length > 100
                                                ? feedback.description.slice(0, 100) + '…'
                                                : feedback.description}
                                        </td>
                                        <td className="px-2 py-2.5 whitespace-nowrap">
                                            <span className={feedback.isFeature ? 'badge-feature' : 'badge-support'}>
                                                {feedback.isFeature ? 'Mejora' : 'Apoyo'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 whitespace-nowrap">
                                            {feedback.convertedToIdea ? (
                                                <span className="badge-converted">
                                                    {feedback.ideaId || 'Convertido'}
                                                </span>
                                            ) : (
                                                <span className="badge-pending">Pendiente</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openDetail(feedback); }}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    title="Ver detalle"
                                                >
                                                    👁️
                                                </button>
                                                {!feedback.convertedToIdea && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openConvertModal(feedback); }}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                        title="Convertir a Idea"
                                                    >
                                                        📝
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={setCurrentPage}
                        setPageSize={setPageSize}
                    />
                </div>
            </div>

            {/* Convert Modal */}
            {convertModal.show && convertModal.feedback && (
                <FeedbackConvertModal
                    feedback={convertModal.feedback}
                    onConfirm={handleConvert}
                    onCancel={closeConvertModal}
                />
            )}

            {/* Detail Modal */}
            {detailModal.show && detailModal.feedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Detalle del Feedback</h3>
                                <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                            </div>

                            {/* Feedback info */}
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Serial</p>
                                        <p className="text-sm font-mono font-medium text-gray-900">
                                            #{detailModal.feedback.serial || detailModal.feedback._id?.slice(-4)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo</p>
                                        <span className={detailModal.feedback.isFeature ? 'badge-feature inline-block mt-1' : 'badge-support inline-block mt-1'}>
                                            {detailModal.feedback.isFeature ? 'Mejora' : 'Apoyo'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Título</p>
                                    <p className="text-sm font-medium text-gray-900">{detailModal.feedback.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Descripción</p>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                        {detailModal.feedback.description}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de recepción</p>
                                    <p className="text-sm text-gray-900">
                                        {detailModal.feedback.createdAt
                                            ? formatDate(detailModal.feedback.createdAt)
                                            : formatDate(new Date().toISOString())}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Estado actual</p>
                                    <div className="mt-1">
                                        {detailModal.feedback.convertedToIdea ? (
                                            <div className="flex items-center gap-2">
                                                <span className="badge-converted">Convertido</span>
                                                <span className="text-sm font-mono text-green-700 font-medium">
                                                    → {detailModal.feedback.ideaId}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="badge-pending">Pendiente de conversión</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={closeDetail}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                                {!detailModal.feedback.convertedToIdea && (
                                    <button
                                        onClick={() => openConvertModal(detailModal.feedback!)}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2"
                                    >
                                        📝 Convertir a Idea
                                    </button>
                                )}
                                {detailModal.feedback.convertedToIdea && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                                        ✅ Registrado como {detailModal.feedback.ideaId}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackDataPage;
