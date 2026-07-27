'use client';

import { getAll, toggle, executeNow, remove } from '@/api/cron-job';
import { CronJob } from '@/models/cron-job.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Edit, Play, ToggleLeft, Trash2, Clock } from 'lucide-react';
import CronJobComponent from './cron-job';
import CronJobHistoryModal from './history-modal';

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  idle: { label: 'Inactivo', className: 'bg-gray-100 text-gray-700' },
  running: { label: 'Ejecutando', className: 'bg-blue-100 text-blue-700 animate-pulse' },
  paused: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-700' },
  error: { label: 'Error', className: 'bg-red-100 text-red-700' },
};

const RESULT_BADGES: Record<string, { label: string; className: string }> = {
  success: { label: 'Éxito', className: 'bg-green-100 text-green-700' },
  error: { label: 'Error', className: 'bg-red-100 text-red-700' },
};

const CronJobDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CronJob[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    job: CronJob | null;
  }>({ show: false, job: null });
  const [historyModal, setHistoryModal] = useState<{ show: boolean; job: CronJob | null }>({
    show: false,
    job: null,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize);
      setData(response.docs || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading cron jobs:', error);
      toast.error('Error al cargar las tareas programadas');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => { loadData(); }, [loadData, refreshData]);

  const handleEdit = (job: CronJob) => {
    const id = job?._id ? String(job._id) : '';
    if (!id) return;
    openTab(`/CronJob/${id}`, `Editar: ${job.name}`, <CronJobComponent jobId={id} />);
  };

  const handleNew = () => {
    openTab('/CronJob/new', 'Nueva tarea programada', <CronJobComponent />);
  };

  const handleToggle = async (job: CronJob) => {
    try {
      const result = await toggle(job._id);
      if (result) {
        toast.success(`Job ${job.active ? 'desactivado' : 'activado'}: ${job.name}`);
        loadData();
      }
    } catch (error) {
      toast.error('Error al cambiar estado del job');
    }
  };

  const handleExecuteNow = async (job: CronJob) => {
    try {
      const result = await executeNow(job._id);
      if (result) {
        toast.success(result.success ? `Job ejecutado: ${result.message}` : `Error: ${result.message}`);
        loadData();
      }
    } catch (error) {
      toast.error('Error al ejecutar el job');
    }
  };

  const handleDeleteClick = (job: CronJob) => {
    setDeleteConfirm({ show: true, job });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.job?._id) return;
    try {
      await remove(deleteConfirm.job._id);
      toast.success(`Job "${deleteConfirm.job.name}" eliminado`);
      setDeleteConfirm({ show: false, job: null });
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el job');
    }
  };

  const handleViewHistory = (job: CronJob) => {
    setHistoryModal({ show: true, job });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const filteredData = statusFilter === 'all'
    ? data
    : data.filter(j => statusFilter === 'active' ? j.active : !j.active);

  const filteredTotal = statusFilter === 'all' ? total : filteredData.length;

  return (
    <>
      <ListPageLayout
        title="Tareas Programadas"
        subtitle="Administre las tareas automáticas del sistema: active, desactive, ejecute o configure jobs programados."
        data={filteredData}
        total={filteredTotal}
        currentPage={currentPage}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onRefresh={() => { setCurrentPage(1); loadData(); }}
        onAdd={handleNew}
        addLabel="Nueva Tarea"
        searchEntity="cron-jobs"
        onSearchData={(results) => setData(results as CronJob[])}
        onSearchLoading={setIsLoading}
        filter={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-[7px] text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        }
        emptyMessage="No hay tareas programadas. Cree una nueva tarea para empezar."
        rowClassName={(j) => j.status === 'error' ? 'bg-red-50' : j.status === 'running' ? 'bg-blue-50' : undefined}
        columns={[
          {
            key: 'name',
            label: 'Nombre',
            render: (j: CronJob) => (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{j.name}</span>
                <span className="text-xs text-gray-500">{j.jobType}</span>
              </div>
            ),
            className: 'min-w-[250px]',
          },
          {
            key: 'status',
            label: 'Estado',
            render: (j: CronJob) => {
              const badge = STATUS_BADGES[j.status] || STATUS_BADGES.idle;
              return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              );
            },
            className: 'w-28 text-center',
          },
          {
            key: 'active',
            label: 'Activo',
            render: (j: CronJob) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${j.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {j.active ? 'Sí' : 'No'}
              </span>
            ),
            className: 'w-20 text-center',
          },
          {
            key: 'expression',
            label: 'Expresión Cron',
            render: (j: CronJob) => (
              <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                {j.expression}
              </code>
            ),
            className: 'w-36',
          },
          {
            key: 'lastRunAt',
            label: 'Última ejecución',
            render: (j: CronJob) => (
              <span className="text-sm text-gray-600">{formatDate(j.lastRunAt)}</span>
            ),
            className: 'w-40',
          },
          {
            key: 'lastResult',
            label: 'Resultado',
            render: (j: CronJob) => {
              if (!j.lastResult) return <span className="text-gray-400 text-xs">-</span>;
              const badge = RESULT_BADGES[j.lastResult];
              return (
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                  {j.lastDuration > 0 && (
                    <span className="text-[10px] text-gray-400">{formatDuration(j.lastDuration)}</span>
                  )}
                </div>
              );
            },
            className: 'w-24',
          },
          {
            key: 'nextRunAt',
            label: 'Próxima ejecución',
            render: (j: CronJob) => (
              <span className="text-sm text-gray-600">{formatDate(j.nextRunAt)}</span>
            ),
            className: 'w-42',
          },
        ]}
        rowKey={(j: CronJob) => j._id}
        actions={[
          {
            icon: <Edit className="w-4 h-4" />,
            tooltip: 'Editar',
            onClick: handleEdit,
            color: 'text-blue-600',
          },
          {
            icon: <ToggleLeft className="w-5 h-5" />,
            tooltip: 'Activar/Desactivar',
            onClick: handleToggle,
            color: 'text-amber-500',
          },
          {
            icon: <Play className="w-4 h-4" />,
            tooltip: 'Ejecutar ahora',
            onClick: handleExecuteNow,
            color: 'text-green-600',
          },
          {
            icon: <Clock className="w-4 h-4" />,
            tooltip: 'Ver historial',
            onClick: handleViewHistory,
            color: 'text-purple-600',
          },
          {
            icon: <Trash2 className="w-4 h-4" />,
            tooltip: 'Eliminar',
            onClick: handleDeleteClick,
            color: 'text-red-600',
            show: (j: CronJob) => !j.active,
          },
        ]}
        deleteConfirm={
          deleteConfirm.show
            ? {
              show: true,
              title: 'Eliminar Tarea Programada',
              message: `¿Está seguro de eliminar la tarea "${deleteConfirm.job?.name}"? Se detendrá su ejecución programada.`,
              variant: 'danger',
              onConfirm: handleDeleteConfirm,
              onClose: () => setDeleteConfirm({ show: false, job: null }),
            }
            : null
        }
      />

      {historyModal.show && historyModal.job && (
        <CronJobHistoryModal
          job={historyModal.job}
          onClose={() => setHistoryModal({ show: false, job: null })}
        />
      )}
    </>
  );
};

export default CronJobDataPage;
