'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getByUserReport, ReportsFilters } from '@/api/reports';
import { Loader2, SearchIcon, MedalIcon } from 'lucide-react';
import Pagination from '@/components/ui/table/pagination';

interface UserItem {
    userId: string;
    userName: string;
    email: string;
    totalResponses: number;
    totalScore: number;
    avgScore: number;
    totalTimeSeconds: number;
    level: string;
    currentStreak: number;
    lastActivityDate: string;
}

interface UserPaginated {
    data: UserItem[];
    total: number;
    page: number;
    pageSize: number;
}

interface ReportByUserProps {
    filters: ReportsFilters;
}

const levelColors: Record<string, string> = {
    bronce: 'text-amber-700 bg-amber-50',
    plata: 'text-gray-600 bg-gray-100',
    oro: 'text-yellow-600 bg-yellow-50',
    diamante: 'text-purple-600 bg-purple-50',
};

const ReportByUser: React.FC<ReportByUserProps> = ({ filters }) => {
    const [data, setData] = useState<UserItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res: UserPaginated = await getByUserReport({ ...filters, page, pageSize, search });
            setData(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, page, pageSize, search]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => { setPage(1); }, [filters]);

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const mins = Math.round(seconds / 60);
        if (mins < 60) return `${mins} min`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return `${hrs}h ${rem}m`;
    };

    return (
        <div>
            {/* Buscador */}
            <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar usuario..."
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
                                    <th className="px-3 py-2 font-medium">Usuario</th>
                                    <th className="px-3 py-2 font-medium text-right">Completadas</th>
                                    <th className="px-3 py-2 font-medium text-right whitespace-nowrap min-w-[100px]">Puntaje Total</th>
                                    <th className="px-3 py-2 font-medium text-right">Promedio</th>
                                    <th className="px-3 py-2 font-medium text-right">Tiempo Total</th>
                                    <th className="px-3 py-2 font-medium text-center">Nivel</th>
                                    <th className="px-3 py-2 font-medium text-center">Racha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.userId} className="hover:bg-blue-50 border-b border-gray-100">
                                        <td className="px-3 py-2.5">
                                            <div className="font-medium text-gray-900">{item.userName}</div>
                                            <div className="text-xs text-gray-400">{item.email}</div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-semibold">{item.totalResponses}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">{item.totalScore}</td>
                                        <td className="px-3 py-2.5 text-right">{item.avgScore}</td>
                                        <td className="px-3 py-2.5 text-right text-gray-500">{formatTime(item.totalTimeSeconds)}</td>
                                        <td className="px-3 py-2.5 text-center">
                                            {item.level ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[item.level.toLowerCase()] || 'text-gray-500 bg-gray-50'}`}>
                                                    <MedalIcon className="h-3 w-3" />
                                                    {item.level}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <span className={`font-semibold ${item.currentStreak >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                                                {item.currentStreak > 0 ? `🔥 ${item.currentStreak}` : '—'}
                                            </span>
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

export default ReportByUser;
