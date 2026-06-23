'use client';

import { Activity } from '@/models/activity.entity';
import { getActivityResponses, getActivityById } from '@/api/activity';
import { searchUsers } from '@/api/user';
import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import Loading from '@/components/layouts/loading/loading';
import Pagination from '@/components/ui/table/pagination';
import CurrentDateTime from '@/components/utils/current-datetime';
import SearchableSelect from '@/components/forms/searchable-select';
import './activity.css';

type ActivityResponsesPageProps = {
    activity?: Activity;
};

type ResponseRecord = {
    _id?: string;
    user: { _id: string; name?: string; username?: string; email?: string; documentNumber?: string } | string;
    activity: string;
    responses: { questionId: string; answer: any; isCorrect?: boolean; responseTime: number }[];
    score: number;
    startTime?: string;
    endTime?: string;
    createdAt?: string;
};

const ActivityResponsesPage: React.FC<ActivityResponsesPageProps> = ({ activity: activityProp }) => {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const [data, setData] = useState<ResponseRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [activity, setActivity] = useState<Activity | null>(activityProp ?? null);
    const [activityId, setActivityId] = useState<string>(activityProp?._id ?? '');

    // Filtros
    const [filterUser, setFilterUser] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const loadResponses = async () => {
        setIsLoading(true);
        try {
            const id = activityId || (router.query.id as string);
            if (!id) return;
            const response = await getActivityResponses(
                id,
                currentPage,
                pageSize,
                filterUser || undefined,
                filterDateFrom ? new Date(filterDateFrom).toISOString() : undefined,
                filterDateTo ? new Date(filterDateTo + 'T23:59:59').toISOString() : undefined,
            );
            setData(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Error loading activity responses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const id = activityProp?._id || (router.query.id as string);
        if (id) setActivityId(id);
    }, [activityProp, router.query.id]);

    useEffect(() => {
        if (!activity && router.isReady && router.query.id) {
            getActivityById(router.query.id as string).then((a) => {
                if (a) setActivity(a);
            });
        }
    }, [router.isReady, router.query.id]);

    useEffect(() => {
        if (activityId) {
            loadResponses();
        }
    }, [activityId, currentPage, pageSize]);

    useEffect(() => {
        if (activityId) {
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

    const getUserName = (record: ResponseRecord): string => {
        if (typeof record.user === 'object' && record.user !== null) {
            return (record.user as any).name || (record.user as any).username || (record.user as any).email || String(record.user._id);
        }
        return String(record.user);
    };

    const getUserId = (record: ResponseRecord): string => {
        if (typeof record.user === 'object' && record.user !== null) {
            return (record.user as any)._id || '';
        }
        return record.user || '';
    };

    if (isLoading && data.length === 0 && !activity) return <Loading />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Respuestas: {activity?.title || 'Actividad'}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Total: {total} respuestas
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
                                <th className="px-3 py-2 w-[35%]">Usuario</th>
                                <th className="px-3 py-2 w-[10%] text-center">Score</th>
                                <th className="px-3 py-2 w-[10%] text-center">Preguntas</th>
                                <th className="px-3 py-2 w-[20%] text-center">Fecha</th>
                                <th className="px-3 py-2 w-[25%] text-center">Tiempo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        {filterUser || filterDateFrom || filterDateTo
                                            ? 'No se encontraron respuestas con esos filtros'
                                            : 'No hay respuestas registradas para esta actividad'}
                                    </td>
                                </tr>
                            )}
                            {data.map((record, index) => {
                                const rowId = record._id ?? String(index);
                                const isExpanded = expandedRow === rowId;
                                const userName = getUserName(record);
                                const timeSpent = record.endTime && record.startTime
                                    ? Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 1000)
                                    : null;
                                return (
                                    <React.Fragment key={rowId}>
                                        <tr
                                            onClick={() => toggleRow(rowId)}
                                            className={`hover:bg-blue-50 border-b cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50 border-b-0' : ''}`}
                                        >
                                            <td className="px-3 py-3 text-sm font-medium text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <span className={`transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                                    <span>{userName}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                    {record.score ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center text-xs text-gray-600">
                                                {record.responses?.length ?? 0}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-gray-500 text-center">
                                                {record.endTime
                                                    ? new Date(record.endTime).toLocaleDateString('es-CO', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-gray-500 text-center">
                                                {timeSpent !== null
                                                    ? timeSpent >= 60
                                                        ? `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`
                                                        : `${timeSpent}s`
                                                    : '-'}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${rowId}-detail`}>
                                                <td colSpan={5} className="px-0 py-0">
                                                    <div className="bg-gray-50 border-b border-l-2 border-indigo-300 mx-3 mb-2 rounded-md overflow-hidden">
                                                        <table className="min-w-full text-xs">
                                                            <thead>
                                                                <tr className="bg-gray-100 border-b">
                                                                    <th className="text-left px-4 py-2 font-medium text-gray-600 w-[30%]">Pregunta</th>
                                                                    <th className="text-left px-4 py-2 font-medium text-gray-600 w-[50%]">
                                                                        Respuesta{typeof record.user === 'object' ? '' : ''}
                                                                        {record.responses.some(r => r.isCorrect !== undefined) ? ' (✓ correcta)' : ''}
                                                                    </th>
                                                                    <th className="text-center px-4 py-2 font-medium text-gray-600 w-[10%]">Tiempo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {record.responses?.length > 0 ? (
                                                                    record.responses.map((r, i) => (
                                                                        <tr key={i} className="border-b last:border-b-0 hover:bg-white transition-colors">
                                                                            <td className="px-4 py-2.5 text-gray-700 font-mono">{r.questionId}</td>
                                                                            <td className="px-4 py-2.5 text-gray-800">
                                                                                <span className={r.isCorrect === false ? 'text-red-600 line-through' : ''}>
                                                                                    {Array.isArray(r.answer) ? r.answer.join(', ') : String(r.answer)}
                                                                                </span>
                                                                                {r.isCorrect === true && (
                                                                                    <span className="ml-2 text-green-600 font-bold">✓</span>
                                                                                )}
                                                                                {r.isCorrect === false && (
                                                                                    <span className="ml-2 text-red-600 font-bold">✗</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-2.5 text-center text-gray-500">
                                                                                {r.responseTime ? `${r.responseTime}s` : '-'}
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

export default ActivityResponsesPage;
