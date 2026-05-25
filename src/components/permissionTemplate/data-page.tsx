'use client';

import { getAllPermissionTemplates, updateStatusPermissionTemplate } from '@/api/permissionTemplate';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, ToggleLeft } from 'lucide-react';
import PermissionTemplateForm from './permission-template';

const PermissionTemplateDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PermissionTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    template: PermissionTemplate | null;
  }>({ show: false, template: null });

  const formatDate = (dateStr?: string | Date): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPermissionTemplates(currentPage, pageSize);
      setData(response?.items || response?.data || []);
      setTotal(response?.length || response?.total || 0);
    } catch (error) {
      console.error('Error loading permission templates:', error);
      toast.error('Error al cargar las plantillas de permisos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);

  // Recargar datos cuando se cierra un tab con refresh
  useEffect(() => { loadData(); }, [refreshData]);

  const handleEdit = (tpl: PermissionTemplate) => {
    const id = tpl?._id ? String(tpl._id) : '';
    if (!id) return;
    openTab(`/PermissionTemplate/${id}`, `Editar plantilla`, <PermissionTemplateForm templateId={id} />);
  };

  const handleToggleClick = (tpl: PermissionTemplate) => {
    setDeleteConfirm({ show: true, template: tpl });
  };

  const handleToggleConfirm = async () => {
    if (!deleteConfirm.template?._id) return;
    try {
      await updateStatusPermissionTemplate(deleteConfirm.template._id, !deleteConfirm.template.isActive);
      toast.success(`Plantilla ${deleteConfirm.template.isActive ? 'desactivada' : 'activada'} correctamente`);
      setDeleteConfirm({ show: false, template: null });
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado de la plantilla');
    }
  };

  const handleNew = () => {
    openTab('/PermissionTemplate/new', 'Nueva plantilla', <PermissionTemplateForm />);
  };

  return (
    <ListPageLayout
      title="Gestión de Plantillas de Permisos"
      subtitle="Gestione las plantillas de permisos del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Plantilla"
      searchEntity="permissionTemplate"
      onSearchData={(results) => setData(results as PermissionTemplate[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay plantillas registradas"
      columns={[
        { key: 'name', label: 'Nombre', render: (t) => t.name, className: 'min-w-[150px] font-medium' },
        { key: 'description', label: 'Descripción', render: (t) => t.description || '-', className: 'min-w-[150px]' },
        {
          key: 'permissions',
          label: 'Permisos incluidos',
          render: (t) => {
            const perms = (t as any).permissions;
            if (!perms || !Array.isArray(perms) || perms.length === 0) {
              return <span className="text-xs text-gray-400">Sin permisos</span>;
            }
            const maxVisible = 5;
            const visible = perms.slice(0, maxVisible);
            const remaining = perms.length - maxVisible;
            return (
              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {visible.map((p: any) => (
                  <span
                    key={p._id || p}
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5"
                    title={p.description || p.name}
                  >
                    <span className="font-mono text-[10px] opacity-60">{p.serial}</span>
                    {p.name || p}
                  </span>
                ))}
                {remaining > 0 && (
                  <span className="text-xs text-gray-400 px-1 self-center">+{remaining} más</span>
                )}
              </div>
            );
          },
          className: 'min-w-[250px]',
        },
        { key: 'createdBy', label: 'Creado por', render: (t) => t.createdBy || '-' },
        { key: 'createdAt', label: 'Creada', render: (t) => formatDate(t.createdAt) },
        {
          key: 'status',
          label: 'Estado',
          render: (t) => (
            <span className={t.isActive !== false ? 'badge-active' : 'badge-inactive'}>
              {t.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          ),
          className: 'w-24 text-center',
        },
      ]}
      rowKey={(t) => t._id!}
      actions={[
        { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600 hover:text-blue-800' },
        {
          icon: <ToggleLeft className="w-5 h-5" />,
          tooltip: 'Activar/Desactivar',
          onClick: handleToggleClick,
          color: 'text-amber-500 hover:text-amber-700',
        },
      ]}
      deleteConfirm={
        deleteConfirm.show
          ? {
              show: true,
              title: deleteConfirm.template?.isActive ? 'Desactivar Plantilla' : 'Activar Plantilla',
              message: `¿Está seguro de ${deleteConfirm.template?.isActive ? 'desactivar' : 'activar'} la plantilla "${deleteConfirm.template?.name}"?`,
              variant: deleteConfirm.template?.isActive ? 'danger' : 'warning',
              onConfirm: handleToggleConfirm,
              onClose: () => setDeleteConfirm({ show: false, template: null }),
            }
          : null
      }
    />
  );
};

export default PermissionTemplateDataPage;
