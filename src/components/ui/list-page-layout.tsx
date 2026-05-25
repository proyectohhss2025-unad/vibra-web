import { AuthContext } from '@/services/auth';
import { PlusCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import ModalConfirm from '../layouts/modal/modal-confirm';
import Search from '../search/search';
import Pagination from './table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import '../../components/test/test.css';

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export interface ListAction<T> {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (item: T) => void;
  color?: string;
  show?: (item: T) => boolean;
}

export interface DeleteConfirm {
  show: boolean;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

interface ListPageLayoutProps<T> {
  title: string;
  subtitle: string;
  data: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
  onAdd?: () => void;
  addLabel?: string;
  columns: Column<T>[];
  rowKey: (item: T) => string | number;
  actions?: ListAction<T>[];
  searchEntity?: string;
  /** Callback para cuando Search actualiza los datos (pasa los resultados al padre) */
  onSearchData?: (data: any[]) => void;
  onSearchLoading?: (loading: boolean) => void;
  emptyMessage?: string;
  deleteConfirm?: DeleteConfirm | null;
}

function ListPageLayout<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  total,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onAdd,
  addLabel = 'Agregar',
  columns,
  rowKey,
  actions,
  searchEntity,
  onSearchData,
  onSearchLoading,
  emptyMessage = 'No hay registros',
  deleteConfirm = null,
}: ListPageLayoutProps<T>) {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/layout');
  }, [token, router]);

  return (
    <>
      <div className="hidden flex-col md:flex w-full mt-0">
        <div className="hidden flex-col w-full md:flex mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight ml-3">{title}</h2>
            <div className="bg-white rounded-md px-2 pl-2 mb-0 pb-1">
              <CurrentDateTime />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md w-full mt-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-3">
              {onSearchData && onSearchLoading && searchEntity && (
                <Search
                  isOpen={false}
                  onClose={() => {}}
                  setData={onSearchData}
                  entity={searchEntity}
                  setIsLoading={onSearchLoading}
                >
                  <RefreshIcon
                    className="h-7 w-7 text-blue-600 cursor-pointer hover:text-green-500"
                    onClick={onRefresh}
                  />
                </Search>
              )}
              {onAdd && (
                <button onClick={onAdd}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 whitespace-nowrap">
                  <PlusCircleIcon className="h-5 w-5 text-white" />
                  {addLabel}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="uppercase tracking-wider border-b-2">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className={`px-3 py-2 ${col.className || ''}`}>
                      {col.label}
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="px-3 py-2 w-24 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + (actions?.length ? 1 : 0)} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (actions?.length ? 1 : 0)} className="text-center py-8 text-gray-500">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={rowKey(item)} className="hover:bg-blue-50 border-b">
                      {columns.map((col) => (
                        <td key={col.key} className={`px-3 py-2 ${col.className || ''}`}>
                          {col.render(item)}
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className="px-3 py-2 w-24">
                          <div className="flex items-center justify-end space-x-2">
                            {actions
                              .filter((a) => !a.show || a.show(item))
                              .map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => action.onClick(item)}
                                  className={`${action.color || 'text-blue-600'} hover:text-opacity-80 text-sm font-medium`}
                                  title={action.tooltip}
                                >
                                  {action.icon}
                                </button>
                              ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={onPageChange}
            setPageSize={onPageSizeChange}
          />
        </div>
      </div>

      {deleteConfirm?.show && (
        <ModalConfirm
          isOpen={deleteConfirm.show}
          onClose={deleteConfirm.onClose}
          onConfirm={deleteConfirm.onConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          variant={deleteConfirm.variant || 'danger'}
        />
      )}
    </>
  );
}

export default ListPageLayout;
