'use client';

import { getAllRoles, updateStatusRole } from '@/api/role';
import { Role } from '@/models/role.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RoleForm from './role';

const RoleDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    role: Role | null;
  }>({ show: false, role: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAllRoles(currentPage, pageSize);
      setData(response.items || []);
      setTotal(response.length || 0);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar los roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);

  const handleEdit = (role: Role) => {
    const id = role?._id ? String(role._id) : '';
    if (!id) return;
    openTab(`/Role/${id}`, `Editar: ${role.name}`, <RoleForm roleId={id} />);
  };

  const handleToggleClick = (role: Role) => {
    setDeleteConfirm({ show: true, role });
  };

  const handleToggleConfirm = async () => {
    if (!deleteConfirm.role?._id) return;
    try {
      await updateStatusRole(deleteConfirm.role._id, !deleteConfirm.role.isActive);
      toast.success(`Rol ${deleteConfirm.role.isActive ? 'desactivado' : 'activado'} correctamente`);
      setDeleteConfirm({ show: false, role: null });
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado del rol');
    }
  };

  const handleNew = () => {
    openTab('/Role/new', 'Nuevo rol', <RoleForm />);
  };

  return (
    <ListPageLayout
      title="Gestión de Roles"
      subtitle="Gestione los roles del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Rol"
      searchEntity="role"
      onSearchData={(results) => setData(results as Role[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay roles registrados"
      columns={[
        { key: 'name', label: 'Nombre', render: (r) => r.name, className: 'min-w-[180px]' },
        { key: 'description', label: 'Descripción', render: (r) => r.description || '-', className: 'min-w-[250px]' },
        { key: 'serial', label: 'Serial', render: (r) => r.serial || '-' },
        {
          key: 'status',
          label: 'Estado',
          render: (r) => (
            <span className={r.isActive !== false ? 'badge-active' : 'badge-inactive'}>
              {r.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          ),
          className: 'w-24 text-center',
        },
      ]}
      rowKey={(r) => r._id!}
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
              title: deleteConfirm.role?.isActive ? 'Desactivar Rol' : 'Activar Rol',
              message: `¿Está seguro de ${deleteConfirm.role?.isActive ? 'desactivar' : 'activar'} el rol "${deleteConfirm.role?.name}"?`,
              variant: deleteConfirm.role?.isActive ? 'danger' : 'warning',
              onConfirm: handleToggleConfirm,
              onClose: () => setDeleteConfirm({ show: false, role: null }),
            }
          : null
      }
    />
  );
};

export default RoleDataPage;
