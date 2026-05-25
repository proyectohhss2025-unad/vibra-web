'use client';

import { getAll, toggleActive } from '@/api/emotion';
import { Emotion } from '@/models/emotion.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { PlusCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ModalConfirm from '../layouts/modal/modal-confirm';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import EmotionComponent from './emotion';
import '../test/test.css';

const EmotionDataPage: React.FC = () => {
    const { token } = useContext(AuthContext);
    const router = useRouter();
    const { openTab, closeTab, refreshData } = useTabs();

    const [data, setData] = useState<Emotion[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; emotion: Emotion | null }>({
        show: false,
        emotion: null,
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await getAll(currentPage, pageSize);
            setData(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error('Error loading emotions:', error);
            toast.error('Error al cargar las emociones');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentPage, pageSize, refreshData]);

    useEffect(() => {
        if (!token) router.push('/layout');
    }, [token, router]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (searchTerm === '') return;
        const timer = setTimeout(() => loadData(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleNew = () => {
        openTab('/Emocion/new', 'Nueva emoción', <EmotionComponent />);
    };

    const handleEdit = (emotion: Emotion) => {
        openTab(`/Emocion/${emotion._id}`, `Editar: ${emotion.name}`, <EmotionComponent emotionId={emotion._id} />);
    };

    const handleToggleClick = (emotion: Emotion) => {
        setDeleteConfirm({ show: true, emotion });
    };

    const handleToggleConfirm = async () => {
        if (!deleteConfirm.emotion?._id) return;
        try {
            await toggleActive(deleteConfirm.emotion._id);
            toast.success(
                `Emoción ${deleteConfirm.emotion.isActive ? 'desactivada' : 'activada'} correctamente`
            );
            setDeleteConfirm({ show: false, emotion: null });
            loadData();
        } catch (error) {
            toast.error('Error al cambiar el estado de la emoción');
        }
    };

    const formatCategory = (cat?: string) => cat || '-';
    const formatIntensity = (val?: number) => val ?? '-';

    return (
        <>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Emociones</h2>
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
                            <h3 className="text-xl font-semibold">Lista de Emociones</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestione las emociones del sistema, configure nombres, categorías e intensidades.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Search
                                isOpen={false}
                                onClose={() => { }}
                                setData={(results: any) => setData(results)}
                                entity="emotion"
                                setIsLoading={setIsLoading}
                            >
                                <RefreshIcon
                                    className="h-7 w-7 text-blue-600 cursor-pointer hover:text-green-500"
                                    onClick={() => { setCurrentPage(1); loadData(); }}
                                />
                            </Search>
                            <button onClick={handleNew}
                                className="flex rounded-md bg-blue-600 w-full px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                                <PlusCircleIcon className="h-5 w-8 text-white" />
                                Agregar Emoción
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="uppercase tracking-wider border-b-2">
                                <tr>
                                    <th className="px-3 py-2">Nombre</th>
                                    <th className="px-3 py-2">Categoría</th>
                                    <th className="px-3 py-2">Intensidad</th>
                                    <th className="px-3 py-2">Icono</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            {isLoading ? 'Cargando...' : 'No hay emociones registradas'}
                                        </td>
                                    </tr>
                                )}
                                {data.map((emotion) => (
                                    <tr key={emotion._id} className="hover:bg-blue-50 border-b">
                                        <td className="px-3 py-2 font-medium">{emotion.name}</td>
                                        <td className="px-3 py-2">{formatCategory(emotion.category)}</td>
                                        <td className="px-3 py-2">{formatIntensity(emotion.intensity)}</td>
                                        <td className="px-3 py-2">{emotion.icono || '-'}</td>
                                        <td className="px-3 py-2">
                                            <span className={emotion.isActive ? 'badge-active' : 'badge-inactive'}>
                                                {emotion.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleEdit(emotion)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium" title="Editar">
                                                    ✏️
                                                </button>
                                                <button onClick={() => handleToggleClick(emotion)}
                                                    className="text-amber-500 hover:text-amber-700 text-sm font-medium"
                                                    title={emotion.isActive ? 'Desactivar' : 'Activar'}>
                                                    🔁
                                                </button>
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

            <ModalConfirm
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, emotion: null })}
                onConfirm={handleToggleConfirm}
                title={deleteConfirm.emotion?.isActive ? 'Desactivar Emoción' : 'Activar Emoción'}
                message={`¿Está seguro de ${deleteConfirm.emotion?.isActive ? 'desactivar' : 'activar'} la emoción "${deleteConfirm.emotion?.name}"?`}
                confirmText={deleteConfirm.emotion?.isActive ? 'Desactivar' : 'Activar'}
                cancelText="Cancelar"
                variant={deleteConfirm.emotion?.isActive ? 'danger' : 'warning'}
            />
        </>
    );
};

export default EmotionDataPage;
