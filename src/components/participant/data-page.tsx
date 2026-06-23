'use client';

import type { ParticipantResponse } from '@/api/participant';
import { getAll, remove } from '@/api/participant';
import { Participant } from '@/models/participant.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';
import ParticipantComponent from './participant';

function toParticipant(r: ParticipantResponse): Participant {
  return {
    _id: r._id,
    userId: r.userId ?? '',
    nickname: r.nickname ?? r.name ?? '',
    avatar: r.avatar ?? '',
    points: r.points ?? 0,
    level: (r.level as Participant['level']) ?? 'bronce',
    currentStreak: r.currentStreak ?? 0,
    maxStreak: r.maxStreak ?? 0,
    totalActivitiesCompleted: r.totalActivitiesCompleted ?? 0,
    lastActivityDate: r.lastActivityDate ? new Date(r.lastActivityDate) : undefined,
    currentCourse: r.currentCourse ?? '',
    isActive: r.isActive ?? true,
    name: r.name,
    nit: r.nit,
    address: r.address ?? '',
    phoneNumber: r.phoneNumber ?? '',
    email: r.email ?? '',
    creditLimit: r.creditLimit ?? 0,
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
    createdBy: r.createdBy ?? '',
  };
}

const ParticipantDataPage: React.FC = () => {
  const router = useRouter();
  const { openTab } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    participant: Participant | null;
  }>({ show: false, participant: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize);
      setData((response.participants || []).map(toParticipant));
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Error al cargar los participantes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);

  const handleEdit = (participant: Participant) => {
    const id = participant?._id ? String(participant._id) : '';
    if (!id) return;
    openTab(
      `/Participante/${id}`,
      `Editar: ${participant.nickname || participant.name}`,
      <ParticipantComponent participantId={id} />
    );
  };

  const handleDeleteClick = (participant: Participant) => {
    setDeleteConfirm({ show: true, participant });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.participant?._id) return;
    try {
      await remove(deleteConfirm.participant._id);
      toast.success('Participante eliminado correctamente');
      setDeleteConfirm({ show: false, participant: null });
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el participante');
    }
  };

  return (
    <ListPageLayout
      title="Gestión de Participantes"
      subtitle="Gestione los participantes del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      searchEntity="participant"
      onSearchData={(results) => setData(results as Participant[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay participantes registrados"
      columns={[
        { key: 'nickname', label: 'Nickname', render: (p) => p.nickname || p.name || '-', className: 'min-w-[150px]' },
        { key: 'level', label: 'Nivel', render: (p) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            p.level === 'diamante' ? 'bg-purple-100 text-purple-800' :
            p.level === 'platino' ? 'bg-blue-100 text-blue-800' :
            p.level === 'oro' ? 'bg-yellow-100 text-yellow-800' :
            p.level === 'plata' ? 'bg-gray-100 text-gray-800' :
            'bg-orange-100 text-orange-800'
          }`}>{p.level}</span>
        )},
        { key: 'points', label: 'Puntos', render: (p) => p.points?.toString() ?? '0' },
        { key: 'streak', label: 'Racha', render: (p) => `${p.currentStreak ?? 0} días` },
        { key: 'activities', label: 'Actividades', render: (p) => p.totalActivitiesCompleted?.toString() ?? '0' },
        {
          key: 'status',
          label: 'Estado',
          render: (p) => (
            <span className={p.isActive !== false ? 'badge-active' : 'badge-inactive'}>
              {p.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          ),
        },
      ]}
      rowKey={(p) => p._id!}
      actions={[
        { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
        {
          icon: <Trash2 className="w-4 h-4" />,
          tooltip: 'Eliminar',
          onClick: handleDeleteClick,
          color: 'text-red-500',
        },
      ]}
      deleteConfirm={
        deleteConfirm.show
          ? {
              show: true,
              title: 'Eliminar Participante',
              message: `¿Está seguro de eliminar al participante "${deleteConfirm.participant?.nickname || deleteConfirm.participant?.name}"? Esta acción no se puede deshacer.`,
              variant: 'danger',
              onConfirm: handleDeleteConfirm,
              onClose: () => setDeleteConfirm({ show: false, participant: null }),
            }
          : null
      }
    />
  );
};

export default ParticipantDataPage;
