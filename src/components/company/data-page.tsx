'use client';

import { getAllCompanies, setActive } from '@/api/company';
import { Company } from '@/models/company.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CompanyComponent from './company';

const CompanyDataPage: React.FC = () => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const router = useRouter();
  const { openTab } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    company: Company | null;
  }>({ show: false, company: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCompanies(currentPage, pageSize);
      const companies = response?.companies || response?.data || [];
      const count = response?.length || response?.total || 0;
      setData(companies);
      setTotal(count);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Error al cargar las instituciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);

  const handleEdit = (company: Company) => {
    const id = company?._id ? String(company._id) : '';
    if (!id) return;
    openTab(`/Company/${id}`, `Editar: ${company.name}`, <CompanyComponent companyId={id} />);
  };

  const handleToggleClick = (company: Company) => {
    setDeleteConfirm({ show: true, company });
  };

  const handleToggleConfirm = async () => {
    if (!deleteConfirm.company?._id) return;
    try {
      await setActive(deleteConfirm.company._id, !deleteConfirm.company.isActive, user_.name);
      toast.success(
        `Institución ${deleteConfirm.company.isActive ? 'desactivada' : 'activada'} correctamente`
      );
      setDeleteConfirm({ show: false, company: null });
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado de la institución');
    }
  };

  const handleNew = () => {
    openTab('/Company/new', 'Nueva institución', <CompanyComponent />);
  };

  return (
    <ListPageLayout
      title="Gestión de Instituciones"
      subtitle="Gestione las instituciones educativas del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Institución"
      searchEntity="company"
      onSearchData={(results) => setData(results as Company[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay instituciones registradas"
      columns={[
        { key: 'name', label: 'Nombre', render: (c) => c.name, className: 'min-w-[220px]' },
        { key: 'nit', label: 'NIT', render: (c) => c.nit || '-' },
        { key: 'phone', label: 'Teléfono', render: (c) => c.phoneNumber || '-' },
        { key: 'email', label: 'Email', render: (c) => c.email || '-' },
        {
          key: 'manager',
          label: 'Representante',
          render: (c) => c.managerData?.name || '-',
        },
        {
          key: 'isMain',
          label: 'Principal',
          render: (c) => (
            <span className={c.isMain ? 'badge-active' : 'badge-inactive'}>
              {c.isMain ? 'Sí' : 'No'}
            </span>
          ),
        },
        {
          key: 'status',
          label: 'Estado',
          render: (c) => (
            <span className={c.isActive !== false ? 'badge-active' : 'badge-inactive'}>
              {c.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          ),
        },
      ]}
      rowKey={(c) => c._id!}
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
              title: deleteConfirm.company?.isActive ? 'Desactivar Institución' : 'Activar Institución',
              message: `¿Está seguro de ${
                deleteConfirm.company?.isActive ? 'desactivar' : 'activar'
              } la institución "${deleteConfirm.company?.name}"?`,
              variant: deleteConfirm.company?.isActive ? 'danger' : 'warning',
              onConfirm: handleToggleConfirm,
              onClose: () => setDeleteConfirm({ show: false, company: null }),
            }
          : null
      }
    />
  );
};

export default CompanyDataPage;
