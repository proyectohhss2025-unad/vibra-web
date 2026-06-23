'use client';

import { getAll } from '@/api/user';
import { User } from '@/models/user.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';
import UserComponent from './user';

const UserDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize);
      setData(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);
  useEffect(() => { loadData(); }, [refreshData]);

  const handleEdit = (user: User) => {
    const id = user?._id ? String(user._id) : '';
    if (!id) return;
    openTab(`/Usuario/${id}`, `Editar: ${user.name}`, <UserComponent userId={id} />);
  };

  const handleNew = () => {
    openTab('/Usuario/new', 'Nuevo usuario', <UserComponent />);
  };

  const getRoleName = (user: User): string => {
    if (!user.role) return '-';
    if (typeof user.role === 'object') return (user.role as any).name || '-';
    return String(user.role);
  };

  return (
    <ListPageLayout
      title="Gestión de Usuarios"
      subtitle="Todos los usuarios del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Usuario"
      searchEntity="users"
      onSearchData={(results) => setData(results as User[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay usuarios registrados"
      columns={[
        { key: 'name', label: 'Nombre', render: (u) => u.name || '-', className: 'min-w-[180px]' },
        { key: 'email', label: 'Email', render: (u) => u.email || '-' },
        { key: 'documentNumber', label: 'Documento', render: (u) => u.documentNumber || '-' },
        { key: 'username', label: 'Usuario', render: (u) => u.username || '-' },
        { key: 'role', label: 'Rol', render: (u) => getRoleName(u) },
      ]}
      rowKey={(u) => u._id!}
      actions={[
        { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
      ]}
    />
  );
};

export default UserDataPage;
