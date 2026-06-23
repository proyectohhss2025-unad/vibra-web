'use client';

import { getAllPolicies, updatePolicyStatus } from '@/api/policy';
import { Policy } from '@/models/policy.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, ToggleLeft } from 'lucide-react';
import PolicyComponent from './policy';

const PolicyDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Policy[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    policy: Policy | null;
  }>({ show: false, policy: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPolicies(currentPage, pageSize);
      setData(response.policies || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Error al cargar las políticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);
  useEffect(() => { loadData(); }, [refreshData]);

  const handleEdit = (policy: Policy) => {
    const id = policy?._id ? String(policy._id) : '';
    if (!id) return;
    openTab(`/Policy/${id}`, `Editar: ${policy.name}`, <PolicyComponent policyId={id} />);
  };

  const handleToggleClick = (policy: Policy) => {
    setDeleteConfirm({ show: true, policy });
  };

  const handleToggleConfirm = async () => {
    if (!deleteConfirm.policy?._id) return;
    try {
      const newStatus = deleteConfirm.policy.isActive ? 'false' : 'true';
      await updatePolicyStatus(deleteConfirm.policy._id, newStatus);
      toast.success(
        `Política ${deleteConfirm.policy.isActive ? 'desactivada' : 'activada'} correctamente`
      );
      setDeleteConfirm({ show: false, policy: null });
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado de la política');
    }
  };

  const handleNew = () => {
    openTab('/Policy/new', 'Nueva política', <PolicyComponent />);
  };

  return (
    <ListPageLayout
      title="Gestión de Políticas"
      subtitle="Gestione las políticas del sistema y actualice estados."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Política"
      searchEntity="policies"
      onSearchData={(results) => setData(results as Policy[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay políticas registradas"
      columns={[
        { key: 'name', label: 'Nombre', render: (p) => p.name || '—', className: 'min-w-[200px]' },
        { key: 'description', label: 'Descripción', render: (p) => p.description || (p.content ? p.content.substring(0, 80) + (p.content.length > 80 ? '...' : '') : '—') },
        { key: 'category', label: 'Categoría', render: (p) => p.category || '—' },
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
              title: deleteConfirm.policy?.isActive ? 'Desactivar Política' : 'Activar Política',
              message: `¿Está seguro de ${deleteConfirm.policy?.isActive ? 'desactivar' : 'activar'} la política "${deleteConfirm.policy?.name}"?`,
              variant: deleteConfirm.policy?.isActive ? 'danger' : 'warning',
              onConfirm: handleToggleConfirm,
              onClose: () => setDeleteConfirm({ show: false, policy: null }),
            }
          : null
      }
    />
  );
};

export default PolicyDataPage;
