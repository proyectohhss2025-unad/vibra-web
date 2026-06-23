'use client';

import { Test } from '@/models/test.entity';
import { getByTestId } from '@/api/preTest';
import { getTestById } from '@/api/test';
import { searchUsers } from '@/api/user';
import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import Loading from '@/components/layouts/loading/loading';
import Pagination from '@/components/ui/table/pagination';
import CurrentDateTime from '@/components/utils/current-datetime';
import SearchableSelect from '@/components/forms/searchable-select';
import './test.css';

type TestResponsesPageProps = {
  test?: Test;
};

type PretestRecord = {
  _id?: string;
  testId: string;
  userId: string;
  userName?: string;
  userRole?: string;
  responses: { questionId: string; answer: any; points: number }[];
  totalScore: number;
  createdAt?: string;
};

const TestResponsesPage: React.FC<TestResponsesPageProps> = ({ test: testProp }) => {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [data, setData] = useState<PretestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [test, setTest] = useState<Test | null>(testProp ?? null);

  // Filtros
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const testId = test?.testId;
      if (!testId) return;
      const response = await getByTestId(
        testId,
        currentPage,
        pageSize,
        filterUser || undefined,
        filterDateFrom ? new Date(filterDateFrom).toISOString() : undefined,
        filterDateTo ? new Date(filterDateTo + 'T23:59:59').toISOString() : undefined,
      );
      setData(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!test && router.isReady && router.query.testId) {
      getTestById(router.query.testId as string).then((t) => {
        if (t) setTest(t);
      });
    }
  }, [router.isReady, router.query.testId]);

  useEffect(() => {
    if (test) loadResponses();
  }, [test, currentPage, pageSize]);

  useEffect(() => {
    if (test) {
      setCurrentPage(1);
      loadResponses();
    }
  }, [filterUser, filterDateFrom, filterDateTo]);

  useEffect(() => {
    if (!token) {
      router.push('/layout');
    }
  }, [token, router]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (isLoading || !test) return <Loading />;

  return (
    <div className="test-container container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Respuestas: {test.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {total} intentos | Test ID: {test.testId}
          </p>
        </div>
        <div className="bg-white rounded-md px-2 py-1">
          <CurrentDateTime />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-64">
            <SearchableSelect
              label="Usuario"
              placeholder="Buscar usuario por nombre..."
              searchFn={async (term) => {
                const users = await searchUsers(term);
                return users;
              }}
              renderOption={(u) => (
                <span className="text-sm">{u.name || u.username} <span className="text-gray-400 text-xs ml-1">({u.email})</span></span>
              )}
              getOptionValue={(u) => u._id}
              value={filterUser}
              onChange={(val) => setFilterUser(val)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha desde</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setFilterUser(''); setFilterDateFrom(''); setFilterDateTo(''); }}
              className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="uppercase tracking-wider border-b-2">
              <tr>
                <th className="px-3 py-2 w-[40%]">Usuario</th>
                <th className="px-3 py-2 w-[12%] text-center">Score</th>
                <th className="px-3 py-2 w-[12%] text-center">Pts</th>
                <th className="px-3 py-2 w-[20%] text-center">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    {filterUser || filterDateFrom || filterDateTo
                      ? 'No se encontraron respuestas con esos filtros'
                      : 'No hay respuestas registradas para este test'}
                  </td>
                </tr>
              )}
              {data.map((record, index) => {
                const rowId = record._id ?? String(index);
                const isExpanded = expandedRow === rowId;
                return (
                  <React.Fragment key={rowId}>
                    <tr
                      onClick={() => toggleRow(rowId)}
                      className={`hover:bg-blue-50 border-b cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50 border-b-0' : ''}`}
                    >
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className={`transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                          <span>{record.userName || record.userId}</span>
                          {record.userRole && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 uppercase tracking-wide">
                              {record.userRole}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                          {record.totalScore ?? 0}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-medium text-gray-700">
                        {record.responses?.map((r) => r.points ?? 0).join(' / ') || '-'}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 text-center">
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${rowId}-detail`}>
                        <td colSpan={4} className="px-0 py-0">
                          <div className="bg-gray-50 border-b border-l-2 border-indigo-300 mx-3 mb-2 rounded-md overflow-hidden">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="bg-gray-100 border-b">
                                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-[35%]">Pregunta</th>
                                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-[50%]">Respuesta</th>
                                  <th className="text-center px-4 py-2 font-medium text-gray-600 w-[15%]">Pts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.responses?.length > 0 ? (
                                  record.responses.map((r, i) => (
                                    <tr key={i} className="border-b last:border-b-0 hover:bg-white transition-colors">
                                      <td className="px-4 py-2.5 text-gray-700 font-mono">{r.questionId}</td>
                                      <td className="px-4 py-2.5 text-gray-800">
                                        {Array.isArray(r.answer) ? r.answer.join(', ') : String(r.answer)}
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                          {r.points ?? 0}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={3} className="text-center py-4 text-gray-400">
                                      Sin respuestas detalladas
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setCurrentPage}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
};

export default TestResponsesPage;
