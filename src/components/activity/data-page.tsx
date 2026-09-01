'use client';

import { getAll, updateActivityStatus } from '@/api/activity';
import { Activity } from '@/models/activity.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Eye, ToggleLeft } from 'lucide-react';
import ActivityComponent from './activity';
import ActivityResponsesPage from './activity-responses-page';

const ActivityDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'reto' | 'evento_personal' | 'actividad_pares' | 'otro'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    activity: Activity | null;
  }>({ show: false, activity: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize, {
        type: typeFilter,
        isActive: statusFilter,
      });
      setData(response.docs || []);
      setTotal(response.totalDocs || 0);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize, refreshData, statusFilter, typeFilter]);

  const handleEdit = (activity: Activity) => {
    const id = activity?._id ? String(activity._id) : '';
    if (!id) return;
    openTab(`/Actividad/${id}`, `Editar: ${activity.title}`, <ActivityComponent activityId={id} />);
  };

  const handleToggleClick = (activity: Activity) => {
    setDeleteConfirm({ show: true, activity });
  };

  const handleViewResponses = (activity: Activity) => {
    const id = activity?._id ? String(activity._id) : '';
    if (!id) return;
    openTab(`/Actividad/${id}/responses`, `Respuestas: ${activity.title}`, <ActivityResponsesPage activity={activity} />);
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
    // Extraer fecha del ISO string sin convertir timezone
    const isoStr = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
    const [year, month, day] = isoStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const ACTIVITY_TYPE_LABELS: Record<string, { label: string; className: string }> = {
    reto: { label: 'Reto', className: 'bg-purple-100 text-purple-700' },
    evento_personal: { label: 'Evento Personal', className: 'bg-green-100 text-green-700' },
    actividad_pares: { label: 'Actividad en Pares', className: 'bg-amber-100 text-amber-700' },
    otro: { label: 'Otro', className: 'bg-gray-100 text-gray-700' },
  };

  const formatType = (type?: string) => {
    if (!type) return <span className="text-gray-400">-</span>;
    const cfg = ACTIVITY_TYPE_LABELS[type] ?? ACTIVITY_TYPE_LABELS.otro;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
        {cfg.label}
      </span>
    );
  };

  /** Verifica si la fecha de programación ya pasó (actividad expirada) */
  const isExpired = (activity: Activity): boolean => {
    if (!activity.schedule?.date) return false;
    const scheduleDate =
      typeof activity.schedule.date === 'string'
        ? new Date(activity.schedule.date)
        : activity.schedule.date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const schedDate = new Date(scheduleDate);
    schedDate.setHours(0, 0, 0, 0);
    return schedDate < today;
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
      searchEntity="activities"
      onSearchData={(results) => setData(results as Activity[])}
      onSearchLoading={setIsLoading}
      filter={
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
            className="rounded-md border border-gray-300 px-3 py-[7px] text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          >
            <option value="all">Todos los tipos</option>
            <option value="reto">Retos</option>
            <option value="evento_personal">Eventos Personales</option>
            <option value="actividad_pares">Actividad en Pares</option>
            <option value="otro">Otros</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'active' | 'inactive'); setCurrentPage(1); }}
            className="rounded-md border border-gray-300 px-3 py-[7px] text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      }
      emptyMessage="No hay actividades registradas"
      rowClassName={(a) => isExpired(a) && a.isActive !== false ? 'bg-orange-50' : undefined}
      columns={[
        { key: 'title', label: 'Título', render: (a) => a.title, className: 'min-w-[430px]' },
        { key: 'type', label: 'Tipo', render: (a) => formatType(a.type), className: 'w-36' },
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
          render: (a) => {
            if (!a.schedule?.date) return <span className="text-gray-400">-</span>;
            const expired = isExpired(a);
            return (
              <span className={expired ? 'text-red-500 font-medium' : ''}>
                {expired && '⏰ '}
                {formatDate(a.schedule.date)}
              </span>
            );
          },
        },
        {
          key: 'status',
          label: 'Estado',
          render: (a) => {
            if (a.isActive === false) {
              return <span className="badge-inactive">Inactivo</span>;
            }
            if (isExpired(a)) {
              return (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
                  Expirada
                </span>
              );
            }
            return <span className="badge-active">Activo</span>;
          },
          className: 'w-24 text-center',
        },
      ]}
      rowKey={(a) => a._id!}
      actions={[
        { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
        {
          icon: <Eye className="w-4 h-4" />,
          tooltip: 'Ver respuestas',
          onClick: handleViewResponses,
          color: 'text-green-600',
        },
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
