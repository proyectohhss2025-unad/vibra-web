'use client'

import { getAllFlags, setActive } from '@/api/config';
import { Config } from '@/models/config.entity';
import { User } from '@/models/user.entity';
import { useTranslation } from 'react-i18next';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { mapArrayToString } from '@/utils/arrays';
import { copyContent } from '@/utils/string';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, ToggleLeft, Copy } from 'lucide-react';
import ListPageLayout from '@/components/ui/list-page-layout';
import { useTabs } from '@/services/contexts/tabs-context';
import ConfigComponent from './config';
import "../../../app/globals.css";

const ConfigDataPage: React.FC = () => {
  const { t } = useTranslation();
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const router = useRouter();
  const { openTab } = useTabs();

  const [data, setData] = useState<Config[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState<{ show: boolean; config: Config | null }>({
    show: false,
    config: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAllFlags(currentPage, pageSize);
      setData(response?.configs ?? []);
      setTotal(response?.configs?.length ?? 0);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast.error('Error al cargar las configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pageSize]);

  const handleNew = () => {
    openTab('/Config/new', 'Nueva Configuración', <ConfigComponent />);
  };

  const handleEdit = (config: Config) => {
    openTab(`/Config/${config._id}`, `Config: ${config.name}`, <ConfigComponent configId={config._id} />);
  };

  const handleCopy = (config: Config) => {
    copyContent(config?._id ?? '');
    toast.success('ID copiado al portapapeles');
  };

  const handleToggleClick = (config: Config) => {
    setToggleConfirm({ show: true, config });
  };

  const handleToggleConfirm = async () => {
    if (!toggleConfirm.config?._id) return;
    try {
      const updated = await setActive(
        toggleConfirm.config._id,
        !toggleConfirm.config?.isActive,
        user_.name
      );
      if (updated) {
        toast.success(
          `Configuración ${toggleConfirm.config.isActive ? 'desactivada' : 'activada'} correctamente`
        );
        setToggleConfirm({ show: false, config: null });
        loadData();
      } else {
        toast.error('Error al cambiar estado de la configuración');
      }
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  return (
    <ListPageLayout
      title="Configuración de características"
      subtitle="Gestione las banderas (flags) para encendido y apagado de funcionalidades del sistema."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar configuración"
      searchEntity="config"
      onSearchData={(results) => setData(results as Config[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay configuraciones registradas"
      columns={[
        { key: 'name', label: 'Nombre', render: (c: Config) => c.name, className: 'font-medium w-36' },
        {
          key: 'description',
          label: 'Descripción',
          render: (c) => (
            <span className="block truncate max-w-[200px]" title={c.description || ''}>
              {c.description || '-'}
            </span>
          ),
          className: 'min-w-[160px] w-52',
        },
        {
          key: 'allowedUsers',
          label: 'Usuarios permitidos',
          render: (c) => (
            <span className="block truncate max-w-[140px]" title={mapArrayToString({ myArray: c.allowedUsers })}>
              {mapArrayToString({ myArray: c.allowedUsers }) || '-'}
            </span>
          ),
          className: 'w-28',
        },
        {
          key: 'disallowedUsers',
          label: 'Usuarios no permitidos',
          render: (c) => (
            <span className="block truncate max-w-[140px]" title={mapArrayToString({ myArray: c.disallowedUsers })}>
              {mapArrayToString({ myArray: c.disallowedUsers }) || '-'}
            </span>
          ),
          className: 'w-28',
        },
        {
          key: 'flag',
          label: 'Flag',
          render: (c) => (
            <span className={c.flag ? 'badge-active' : 'badge-inactive'}>
              {c.flag ? 'Sí' : 'No'}
            </span>
          ),
          className: 'w-16 text-center',
        },
        {
          key: 'status',
          label: 'Estado',
          render: (c) => (
            <span className={c.isActive ? 'badge-active' : 'badge-inactive'}>
              {c.isActive ? 'Activo' : 'Inactivo'}
            </span>
          ),
          className: 'w-20 text-center',
        },
      ]}
      rowKey={(c) => c._id!}
      actions={[
        { icon: <Copy className="w-4 h-4" />, tooltip: 'Copiar ID', onClick: handleCopy, color: 'text-indigo-500' },
        { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
        {
          icon: <ToggleLeft className="w-5 h-5" />,
          tooltip: 'Activar/Desactivar',
          onClick: handleToggleClick,
          color: 'text-amber-500',
        },
      ]}
      deleteConfirm={
        toggleConfirm.show
          ? {
              show: true,
              title: toggleConfirm.config?.isActive ? 'Desactivar Configuración' : 'Activar Configuración',
              message: `¿Está seguro de ${toggleConfirm.config?.isActive ? 'desactivar' : 'activar'} la configuración "${toggleConfirm.config?.name}"?`,
              variant: toggleConfirm.config?.isActive ? 'danger' : 'warning',
              onConfirm: handleToggleConfirm,
              onClose: () => setToggleConfirm({ show: false, config: null }),
            }
          : null
      }
    />
  );
};

export default ConfigDataPage;
