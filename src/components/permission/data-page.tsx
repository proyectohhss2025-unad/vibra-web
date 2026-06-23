'use client';

import { getAllPermissions, updateStatusPermission } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, ToggleLeft } from 'lucide-react';
import PermissionForm from './permission';

const PermissionDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Permission[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    permission: Permission | null;
  }>({ show: false, permission: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPermissions(currentPage, pageSize);
      setData(response?.items || response?.data || []);
      setTotal(response?.length || response?.total || 0);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Error al cargar los permisos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);

  // Recargar datos cuando se cierra un tab con refresh
  useEffect(() => { loadData(); }, [refreshData]);

  const handleEdit = (perm: Permission) => {
    const id = perm?._id ? String(perm._id) : '';
    if (!id) return;
    openTab(`/Permission/${id}`, `Editar permiso`, <PermissionForm permissionId={id} />);
  };

  const handleToggleClick = (perm: Permission) => {
    setDeleteConfirm({ show: true, permission: perm });
  };

  const handleToggleConfirm = async () => {
    if (!deleteConfirm.permission?._id) return;
    try {
      await updateStatusPermission(deleteConfirm.permission._id, !deleteConfirm.permission.isActive);
      toast.success(`Permiso ${deleteConfirm.permission.isActive ? 'desactivado' : 'activado'} correctamente`);
      setDeleteConfirm({ show: false, permission: null });
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado del permiso');
    }
  };

  const handleNew = () => {
    openTab('/Permission/new', 'Nuevo permiso', <PermissionForm />);
  };

  return (
    <ListPageLayout
      title="Gestión de Permisos"
      subtitle="Gestione los permisos del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Permiso"
      searchEntity="permissions"
      onSearchData={(results) => setData(results as Permission[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay permisos registrados"
      columns={[
        { key: 'serial', label: 'Serial', render: (p) => <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{p.serial}</code>, className: 'w-32 text-center' },
        { key: 'name', label: 'Nombre', render: (p) => p.name, className: 'min-w-[160px]' },
        { key: 'description', label: 'Descripción', render: (p) => p.description || '-', className: 'min-w-[350px] max-w-[450px]' },
        {
          key: 'category', label: 'Categoría', render: (p) => {
            const cat = (p as any).permissionCategory;
            return cat?.name ? (
              <span className="inline-flex items-center text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                {cat.name}
              </span>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            );
          }, className: 'min-w-[140px]'
        },
        {
          key: 'status',
          label: 'Estado',
          render: (p) => (
            <span className={p.isActive !== false ? 'badge-active' : 'badge-inactive'}>
              {p.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          ),
          className: 'w-24 text-center',
        },
      ]}
      rowKey={(p) => p._id!}
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
            title: deleteConfirm.permission?.isActive ? 'Desactivar Permiso' : 'Activar Permiso',
            message: `¿Está seguro de ${deleteConfirm.permission?.isActive ? 'desactivar' : 'activar'} el permiso "${deleteConfirm.permission?.name}"?`,
            variant: deleteConfirm.permission?.isActive ? 'danger' : 'warning',
            onConfirm: handleToggleConfirm,
            onClose: () => setDeleteConfirm({ show: false, permission: null }),
          }
          : null
      }
    />
  );
};

export default PermissionDataPage;
