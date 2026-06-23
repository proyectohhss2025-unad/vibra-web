'use client';

import { getAll, toggleTestStatus, deleteTest } from '@/api/test';
import { Test } from '@/models/test.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ListPageLayout from '@/components/ui/list-page-layout';
import TestFormPage from './test-form-page';
import TestResponsesPage from './test-responses-page';
import { Edit, Eye, Play, Pause, Trash2 } from 'lucide-react';
import './test.css';

const TestListPage: React.FC = () => {
  const router = useRouter();
  const { openTab, refreshData } = useTabs();

  const [data, setData] = useState<Test[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; test: Test | null }>({
    show: false,
    test: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize);
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Error al cargar los tests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);
  useEffect(() => { loadData(); }, [refreshData]);

  // Recargar cuando se cierra el formulario con refresh
  useEffect(() => {
    if (refreshData) {
      loadData();
    }
  }, [refreshData]);

  const handleNew = () => {
    openTab('/Test/new', 'Nuevo Test', <TestFormPage />);
  };

  const handleEdit = (test: Test) => {
    openTab(`/Test/${test._id}`, `Editar: ${test.title}`, <TestFormPage testId={test._id} />);
  };

  const handleViewResponses = (test: Test) => {
    openTab(`/Test/${test._id}/responses`, `Respuestas: ${test.title}`, <TestResponsesPage test={test} />);
  };

  const handleToggleStatus = async (test: Test) => {
    try {
      const updated = await toggleTestStatus(test._id!);
      setData((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast.success(updated.isActive ? 'Test activado' : 'Test desactivado');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  const handleDeleteClick = (test: Test) => {
    setDeleteConfirm({ show: true, test });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.test?._id) return;
    try {
      await deleteTest(deleteConfirm.test._id);
      toast.success('Test eliminado correctamente');
      setDeleteConfirm({ show: false, test: null });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar test');
    }
  };

  const difficultyDots = (difficulty: number = 0) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i < difficulty ? 'bg-amber-400' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );

  return (
    <ListPageLayout
      title="Gestión de Tests"
      subtitle="Gestione los tests, configure preguntas y revise respuestas."
      data={data}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onRefresh={() => { setCurrentPage(1); loadData(); }}
      onAdd={handleNew}
      addLabel="Agregar Test"
      searchEntity="tests"
      onSearchData={(results) => setData(results as Test[])}
      onSearchLoading={setIsLoading}
      emptyMessage="No hay tests registrados"
      columns={[
        { key: 'testId', label: 'ID', render: (t: Test) => <span className="font-mono text-xs">{t.testId}</span>, className: 'w-20' },
        { key: 'title', label: 'Título', render: (t) => t.title, className: 'font-medium min-w-[280px] w-96' },
        { key: 'category', label: 'Categoría', render: (t) => t.category || '-', className: 'w-28' },
        { key: 'difficulty', label: 'Dificultad', render: (t) => difficultyDots(t.difficulty), className: 'w-28' },
        {
          key: 'status',
          label: 'Estado',
          render: (t) => (
            <span className={t.isActive ? 'badge-active' : 'badge-inactive'}>
              {t.isActive ? 'Activo' : 'Inactivo'}
            </span>
          ),
          className: 'w-24 text-center',
        },
        {
          key: 'visualization',
          label: 'Momento',
          render: (t) => (
            <div className="flex gap-1">
              {t.showAtStart && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  Inicial
                </span>
              )}
              {t.showAtEnd && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  Final
                </span>
              )}
              {!t.showAtStart && !t.showAtEnd && (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          ),
          className: 'w-28',
        },
        {
          key: 'questions',
          label: 'P.',
          render: (t) => (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t.questions?.length || 0}
            </span>
          ),
          className: 'w-16 text-center',
        },
      ]}
      rowKey={(t) => t._id!}
      actions={[
        { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
        {
          icon: <Eye className="w-4 h-4" />,
          tooltip: 'Ver respuestas',
          onClick: handleViewResponses,
          color: 'text-green-600',
        },
        {
          icon: <Pause className="w-4 h-4" />,
          tooltip: 'Desactivar',
          onClick: handleToggleStatus,
          color: 'text-orange-500',
          show: (t) => t.isActive === true,
        },
        {
          icon: <Play className="w-4 h-4" />,
          tooltip: 'Activar',
          onClick: handleToggleStatus,
          color: 'text-green-500',
          show: (t) => t.isActive === false,
        },
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
              title: 'Eliminar Test',
              message: `¿Está seguro de eliminar el test "${deleteConfirm.test?.title}"? Esta acción no se puede deshacer.`,
              variant: 'danger',
              onConfirm: handleDeleteConfirm,
              onClose: () => setDeleteConfirm({ show: false, test: null }),
            }
          : null
      }
    />
  );
};

export default TestListPage;
