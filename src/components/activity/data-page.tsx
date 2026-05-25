'use client';

import { getAll, updateActivityStatus } from '@/api/activity';
import { Activity } from '@/models/activity.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ActivityComponent from './activity';

const ActivityDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    activity: Activity | null;
  }>({ show: false, activity: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize);
      setData(response.docs || []);
      setTotal(response.totalDocs || 0);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize, refreshData]);

  const handleEdit = (activity: Activity) => {
    const id = activity?._id ? String(activity._id) : '';
    if (!id) return;
    openTab(`/Actividad/${id}`, `Editar: ${activity.title}`, <ActivityComponent activityId={id} />);
  };

  const handleToggleClick = (activity: Activity) => {
    setDeleteConfirm({ show: true, activity });
  };

  const handleToggleConfirm = async () => {
    if (!deleteConfirm.activity?._id) return;
    try {
      await updateActivityStatus(deleteConfirm.activity._id, !deleteConfirm.activity.isActive, deleteConfirm.activity);
      toast.success(
        `Actividad ${deleteConfirm.activity.isActive ? 'desactivada' : 'activada'} correctamente`
      );
      setDeleteConfirm({ show: false, activity: null });
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado de la actividad');
    }
  };

  const handleNew = () => {
    openTab('/Actividad/new', 'Nueva actividad', <ActivityComponent />);
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <ListPageLayout
      title="Gestión de Actividades"
      subtitle="Gestione sus actividades, asigne emociones y actualice estados."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Actividad"
      searchEntity="activity"
      onSearchData={(results) => setData(results as Activity[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay actividades registradas"
      columns={[
        { key: 'title', label: 'Título', render: (a) => a.title, className: 'min-w-[430px]' },
        {
          key: 'difficulty',
          label: 'Dificultad',
          render: (a) => (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: a.difficulty || 1 }, (_, i) => (
                <span key={i} className="text-amber-500">●</span>
              ))}
            </div>
          ),
        },
        { key: 'resources', label: 'Recursos', render: (a) => `${a.resources?.length ?? 0}` },
        { key: 'questions', label: 'Preguntas', render: (a) => `${a.questions?.length ?? 0}` },
        {
          key: 'schedule',
          label: 'Programación',
          render: (a) => (a.schedule?.date ? formatDate(a.schedule.date) : '-'),
        },
        {
          key: 'status',
          label: 'Estado',
          render: (a) => (
            <span className={a.isActive !== false ? 'badge-active' : 'badge-inactive'}>
              {a.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          ),
          className: 'w-24 text-center',
        },
      ]}
      rowKey={(a) => a._id!}
      actions={[
        { icon: '✏️', tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
        {
          icon: '🔁',
          tooltip: 'Activar/Desactivar',
          onClick: handleToggleClick,
          color: 'text-amber-500',
        },
      ]}
      deleteConfirm={
        deleteConfirm.show
          ? {
            show: true,
            title: deleteConfirm.activity?.isActive ? 'Desactivar Actividad' : 'Activar Actividad',
            message: `¿Está seguro de ${deleteConfirm.activity?.isActive ? 'desactivar' : 'activar'} la actividad "${deleteConfirm.activity?.title}"?`,
            variant: deleteConfirm.activity?.isActive ? 'danger' : 'warning',
            onConfirm: handleToggleConfirm,
            onClose: () => setDeleteConfirm({ show: false, activity: null }),
          }
          : null
      }
    />
  );
};

export default ActivityDataPage;
