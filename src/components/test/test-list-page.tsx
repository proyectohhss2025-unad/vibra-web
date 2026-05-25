'use client';

import { getAll, toggleTestStatus, deleteTest } from '@/api/test';
import { Test } from '@/models/test.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { PlusCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import '../../../app/globals.css';
import ModalConfirm from '../layouts/modal/modal-confirm';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import TestFormPage from './test-form-page';
import TestResponsesPage from './test-responses-page';
import './test.css';

const TestListPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { openTab, closeTab } = useTabs();

  const [data, setData] = useState<Test[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; test: Test | null }>({
    show: false,
    test: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAll(currentPage, pageSize, searchTerm || undefined);
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

  useEffect(() => {
    if (!token) {
      router.push('/layout');
    }
  }, [token, router]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    // Recargar con el término de búsqueda
    getAll(1, pageSize, term || undefined).then((response) => {
      setData(response.data);
      setTotal(response.total);
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  return (
    <>
      <div className="hidden flex-col md:flex w-full mt-0">
        <div className="hidden flex-col w-full md:flex mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Tests</h2>
            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                <CurrentDateTime />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md w-full mt-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Lista de Tests</h3>
              <p className="text-sm text-gray-500 mt-1">
                Gestione los tests, configure preguntas y revise respuestas.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Search
                isOpen={false}
                onClose={() => { }}
                setData={(results: any) => setData(results)}
                entity="test"
                setIsLoading={setIsLoading}
              >
                <RefreshIcon
                  className="h-7 w-7 text-blue-600 cursor-pointer hover:text-green-500"
                  onClick={() => {
                    setCurrentPage(1);
                    loadData();
                  }}
                />
              </Search>
              <button
                onClick={handleNew}
                className="flex w-60 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <PlusCircleIcon className="h-5 w-8 text-white" />
                Agregar Test
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="uppercase tracking-wider border-b-2">
                <tr>
                  <th className="px-3 py-2">Test ID</th>
                  <th className="px-3 py-2">Título</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Dificultad</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Preguntas</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {isLoading ? 'Cargando...' : 'No hay tests registrados'}
                    </td>
                  </tr>
                )}
                {data.map((test) => (
                  <tr key={test._id} className="hover:bg-blue-50 border-b">
                    <td className="px-3 py-2 font-mono text-xs">{test.testId}</td>
                    <td className="px-3 py-2 font-medium">{test.title}</td>
                    <td className="px-3 py-2">{test.category || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${i < test.difficulty ? 'bg-amber-400' : 'bg-gray-200'
                              }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={test.isActive ? 'badge-active' : 'badge-inactive'}>
                        {test.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {test.questions?.length || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleViewResponses(test)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                          title="Ver respuestas"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleToggleStatus(test)}
                          className={`text-sm font-medium ${test.isActive ? 'text-orange-500' : 'text-green-500'
                            } hover:text-opacity-80`}
                          title={test.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {test.isActive ? '⏸' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(test)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={handlePageChange}
            setPageSize={setPageSize}
          />
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ModalConfirm
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, test: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Test"
        message={`¿Está seguro de eliminar el test "${deleteConfirm.test?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default TestListPage;
