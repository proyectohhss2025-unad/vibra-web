'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getByActivityReport, ReportsFilters } from '@/api/reports';
import { Loader2, SearchIcon } from 'lucide-react';
import Pagination from '@/components/ui/table/pagination';

interface ActivityItem {
    activityId: string;
    activityTitle: string;
    emotionName: string;
    emotionIcon: string;
    difficulty: number;
    totalResponses: number;
    uniqueUsersCount: number;
    avgScore: number;
    avgTimeSeconds: number;
}

interface ActivityPaginated {
    data: ActivityItem[];
    total: number;
    page: number;
    pageSize: number;
}

interface ReportByActivityProps {
    filters: ReportsFilters;
}

const ReportByActivity: React.FC<ReportByActivityProps> = ({ filters }) => {
    const [data, setData] = useState<ActivityItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res: ActivityPaginated = await getByActivityReport({ ...filters, page, pageSize, search });
            setData(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, page, pageSize, search]);

    useEffect(() => { loadData(); }, [loadData]);

    // Resetear página cuando cambian filtros externos
    useEffect(() => { setPage(1); }, [filters]);

    return (
        <div>
            {/* Buscador */}
            <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar actividad..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            ) : !data.length ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                    No hay datos para los filtros seleccionados
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="uppercase tracking-wider border-b-2 text-xs text-gray-500">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Actividad</th>
                                    <th className="px-3 py-2 font-medium">Emoción</th>
                                    <th className="px-3 py-2 font-medium text-right">Respuestas</th>
                                    <th className="px-3 py-2 font-medium text-right">Usuarios</th>
                                    <th className="px-3 py-2 font-medium text-right">Puntaje Prom.</th>
                                    <th className="px-3 py-2 font-medium text-right whitespace-nowrap min-w-[90px]">Tiempo Prom.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.activityId} className="hover:bg-blue-50 border-b border-gray-100">
                                        <td className="px-3 py-2.5 font-medium text-gray-900 max-w-[250px] truncate">
                                            {item.activityTitle}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {item.emotionIcon && <span className="mr-1">{item.emotionIcon}</span>}
                                            <span className="text-gray-600">{item.emotionName}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-semibold">{item.totalResponses}</td>
                                        <td className="px-3 py-2.5 text-right">{item.uniqueUsersCount}</td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className={`font-medium ${item.avgScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                                                {item.avgScore}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-500 whitespace-nowrap">
                                            {item.avgTimeSeconds > 60
                                                ? `${Math.round(item.avgTimeSeconds / 60)} min`
                                                : `${item.avgTimeSeconds}s`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={page}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={setPage}
                        setPageSize={setPageSize}
                    />
                </>
            )}
        </div>
    );
};

export default ReportByActivity;
