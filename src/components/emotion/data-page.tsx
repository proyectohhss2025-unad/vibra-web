'use client';

import { getAll, toggleActive } from '@/api/emotion';
import { Emotion } from '@/models/emotion.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, ToggleLeft } from 'lucide-react';
import ListPageLayout from '@/components/ui/list-page-layout';
import EmotionComponent from './emotion';

const EmotionDataPage: React.FC = () => {
    const router = useRouter();
    const { openTab, refreshData } = useTabs();

    const [data, setData] = useState<Emotion[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; emotion: Emotion | null }>({
        show: false,
        emotion: null,
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await getAll(currentPage, pageSize, { isActive: statusFilter });
            setData(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error('Error loading emotions:', error);
            toast.error('Error al cargar las emociones');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentPage, pageSize, refreshData, statusFilter]);

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
        <ListPageLayout
            title="Gestión de Emociones"
            subtitle="Gestione las emociones del sistema, configure nombres, categorías e intensidades."
            data={data}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onRefresh={() => { setCurrentPage(1); loadData(); }}
            onAdd={handleNew}
            addLabel="Agregar Emoción"
            searchEntity="emotions"
            onSearchData={(results) => setData(results as Emotion[])}
            onSearchLoading={setIsLoading}
            filter={
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                    className="rounded-md border border-gray-300 px-3 py-[7px] text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                </select>
            }
            emptyMessage="No hay emociones registradas"
            columns={[
                { key: 'name', label: 'Nombre', render: (e: Emotion) => e.name, className: 'font-medium w-36' },
                { key: 'category', label: 'Categoría', render: (e) => formatCategory(e.category), className: 'w-20' },
                { key: 'intensity', label: 'Intensidad', render: (e) => formatIntensity(e.intensity), className: 'w-14 text-center' },
                { key: 'icon', label: 'Icono', render: (e) => e.icono || '-', className: 'w-14 text-center' },
                {
                    key: 'description',
                    label: 'Descripción',
                    render: (e) => (
                        <span className="block truncate max-w-[220px]" title={e.description || ''}>
                            {e.description || '-'}
                        </span>
                    ),
                    className: 'min-w-[150px] w-56',
                },
                {
                    key: 'orientationNote',
                    label: 'Nota orientación',
                    render: (e) => (
                        <span className="block truncate max-w-[200px]" title={e.orientationNote || ''}>
                            {e.orientationNote || '-'}
                        </span>
                    ),
                    className: 'min-w-[140px] w-52',
                },
                {
                    key: 'status',
                    label: 'Estado',
                    render: (e) => (
                        <span className={e.isActive ? 'badge-active' : 'badge-inactive'}>
                            {e.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    ),
                    className: 'w-24 text-center',
                },
            ]}
            rowKey={(e) => e._id!}
            actions={[
                { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
                {
                    icon: <ToggleLeft className="w-5 h-5" />,
                    tooltip: 'Activar/Desactivar',
                    onClick: handleToggleClick,
                    color: 'text-amber-500',
                },
            ]}
            deleteConfirm={
                deleteConfirm.show
                    ? {
                          show: true,
                          title: deleteConfirm.emotion?.isActive ? 'Desactivar Emoción' : 'Activar Emoción',
                          message: `¿Está seguro de ${deleteConfirm.emotion?.isActive ? 'desactivar' : 'activar'} la emoción "${deleteConfirm.emotion?.name}"?`,
                          variant: deleteConfirm.emotion?.isActive ? 'danger' : 'warning',
                          onConfirm: handleToggleConfirm,
                          onClose: () => setDeleteConfirm({ show: false, emotion: null }),
                      }
                    : null
            }
        />
    );
};

export default EmotionDataPage;
