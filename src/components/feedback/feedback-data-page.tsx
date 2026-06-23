'use client';

import { convertFeedbackToIdea } from '@/api/feedback';
import { getIdeasStatus, getAllIdeas } from '@/api/admin';
import { config } from '@/config/config';
import { Feedback } from '@/models/feedback.entity';
import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import FeedbackConvertModal from './feedback-convert-modal';
import { Eye, MessageSquare } from 'lucide-react';
import ListPageLayout from '@/components/ui/list-page-layout';
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
    const [ideasMap, setIdeasMap] = useState<Record<string, string>>({});
    const [filterStatus, setFilterStatus] = useState<string>('all');

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
                const sorted = (result.data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setData(sorted);
                setTotal(result.data?.length || 0);
            } else {
                const result = await response.json();
                const sorted = (result.feedbacks || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setData(sorted);
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

    const loadIdeasMap = async () => {
        const result = await getAllIdeas();
        if (result?.data) {
            const map: Record<string, string> = {};
            result.data.forEach((idea: any) => {
                if (idea.id) {
                    map[idea.id] = idea.estado;
                }
            });
            setIdeasMap(map);
        }
    };

    useEffect(() => {
        if (data.some((f) => f.convertedToIdea)) {
            loadIdeasMap();
        }
    }, [data]);

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

    const filteredData = data.filter((f) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending') return !f.convertedToIdea;
        if (filterStatus === 'converted') return f.convertedToIdea;
        if (filterStatus.startsWith('idea_')) {
            const targetStatus = filterStatus.replace('idea_', '');
            return f.convertedToIdea && ideasMap[f.ideaId || ''] === targetStatus;
        }
        return true;
    });

    const cards = [
        { key: 'all', label: 'Feedback Total', value: data.length, bg: 'bg-gray-50', text: 'text-gray-800', labelText: 'text-gray-500' },
        { key: 'pending', label: 'Pendientes', value: data.filter((f) => !f.convertedToIdea).length, bg: 'bg-amber-50', text: 'text-amber-600', labelText: 'text-amber-600' },
        { key: 'converted', label: 'Convertidos', value: data.filter((f) => f.convertedToIdea).length, bg: 'bg-green-50', text: 'text-green-600', labelText: 'text-green-600' },
        { key: 'idea_en_desarrollo', label: 'En desarrollo', value: data.filter((f) => f.convertedToIdea && ideasMap[f.ideaId || ''] === 'en_desarrollo').length, bg: 'bg-indigo-50', text: 'text-indigo-600', labelText: 'text-indigo-600' },
        { key: 'idea_desarrollada', label: 'Desarrolladas', value: data.filter((f) => f.convertedToIdea && ideasMap[f.ideaId || ''] === 'desarrollada').length, bg: 'bg-emerald-50', text: 'text-emerald-600', labelText: 'text-emerald-600' },
    ];

    return (
        <>
            {/* Stats Bar */}
            <div className="grid grid-cols-5 gap-3 mt-4 px-1">
                {cards.map((card) => {
                    const isActive = filterStatus === card.key;
                    return (
                        <button
                            key={card.key}
                            onClick={() => setFilterStatus(card.key)}
                            className={`rounded-lg border p-3 text-center transition-all duration-150 cursor-pointer ${
                                isActive
                                    ? `${card.bg} ${card.text} border-current shadow-md ring-2 ring-blue-400/40 ring-offset-1 scale-[1.02]`
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            <p className={`text-2xl font-bold ${isActive ? card.text : 'text-gray-800'}`}>{card.value}</p>
                            <p className={`text-xs mt-0.5 ${isActive ? card.labelText : 'text-gray-500'}`}>{card.label}</p>
                        </button>
                    );
                })}
            </div>

            <ListPageLayout
                title="Gestión de Feedback"
                subtitle="Gestione los feedbacks recibidos y conviértalos en ideas del backlog."
                data={filteredData}
                total={filterStatus === 'all' ? total : filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onRefresh={() => { setSearchTerm(''); setCurrentPage(1); loadData('', 1, pageSize); }}
                searchEntity="feedback"
                onSearchData={(results) => setData(results as FeedbackWithMeta[])}
                onSearchLoading={setIsLoading}
                emptyMessage="No hay feedbacks registrados"
                columns={[
                    {
                        key: 'serial',
                        label: 'Serial',
                        render: (f: FeedbackWithMeta) => (
                            <span className="font-mono text-xs whitespace-nowrap">
                                #{f.serial || f._id?.slice(-4)}
                            </span>
                        ),
                    },
                    {
                        key: 'title',
                        label: 'Título',
                        render: (f) => <span className="font-medium truncate max-w-[180px] block">{f.title}</span>,
                    },
                    {
                        key: 'description',
                        label: 'Descripción',
                        render: (f) => (
                            <span className="text-gray-600 truncate block max-w-xs">
                                {f.description?.length > 100 ? f.description.slice(0, 100) + '…' : f.description}
                            </span>
                        ),
                    },
                    {
                        key: 'type',
                        label: 'Tipo',
                        render: (f) => (
                            <span className={f.isFeature ? 'badge-feature' : 'badge-support'}>
                                {f.isFeature ? 'Mejora' : 'Apoyo'}
                            </span>
                        ),
                    },
                    {
                        key: 'status',
                        label: 'Estado',
                        render: (f) => {
                            if (!f.convertedToIdea) {
                                return <span className="badge-pending">Pendiente</span>;
                            }
                            const ideaStatus = ideasMap[f.ideaId || ''];
                            const statusStyles: Record<string, string> = {
                                pendiente: 'bg-gray-100 text-gray-700 border-gray-300',
                                en_desarrollo: 'bg-amber-50 text-amber-700 border-amber-300',
                                desarrollada: 'bg-green-50 text-green-700 border-green-300',
                            };
                            const style = statusStyles[ideaStatus] || 'bg-blue-50 text-blue-700 border-blue-300';
                            const label: Record<string, string> = {
                                pendiente: '⏳ Pendiente',
                                en_desarrollo: '🔄 En desarrollo',
                                desarrollada: '✅ Desarrollada',
                            };
                            return (
                                <div className="flex items-center gap-1.5">
                                    <span className="badge-converted text-xs">{f.ideaId}</span>
                                    {ideaStatus ? (
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
                                            {label[ideaStatus] || ideaStatus}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">sin estado</span>
                                    )}
                                </div>
                            );
                        },
                    },
                ]}
                rowKey={(f) => f._id!}
                actions={[
                    {
                        icon: <Eye className="w-4 h-4" />,
                        tooltip: 'Ver detalle',
                        onClick: openDetail,
                        color: 'text-blue-600',
                    },
                    {
                        icon: <MessageSquare className="w-4 h-4" />,
                        tooltip: 'Convertir a Idea',
                        onClick: openConvertModal,
                        color: 'text-indigo-600',
                        show: (f) => !f.convertedToIdea,
                    },
                ]}
            />

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
                                        <MessageSquare className="w-4 h-4" /> Convertir a Idea
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
