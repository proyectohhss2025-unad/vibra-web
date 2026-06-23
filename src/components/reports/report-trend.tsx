'use client';

import React, { useEffect, useState } from 'react';
import { getTrendReport, ReportsFilters } from '@/api/reports';
import { Loader2, BarChart3Icon, CalendarDaysIcon, RefreshCwIcon } from 'lucide-react';

interface TrendPoint {
    date: string;
    totalResponses: number;
    uniqueUsersCount: number;
    avgScore: number;
}

interface ReportTrendProps {
    filters: ReportsFilters;
}

const granularityOptions = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
] as const;

const ReportTrend: React.FC<ReportTrendProps> = ({ filters }) => {
    const [data, setData] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        getTrendReport({ ...filters, granularity })
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filters, granularity]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="text-center py-12 text-gray-400 text-sm">
                No hay datos para los filtros seleccionados
            </div>
        );
    }

    const maxResponses = Math.max(...data.map((d) => d.totalResponses), 1);

    const formatLabel = (date: string) => {
        if (granularity === 'month') return date; // YYYY-MM
        if (granularity === 'week') {
            const [year, week] = date.split('-W');
            return `W${week}`;
        }
        // day: YYYY-MM-DD -> DD/MM
        const parts = date.split('-');
        return `${parts[2]}/${parts[1]}`;
    };

    return (
        <div>
            {/* Toggle de granularidad */}
            <div className="flex items-center gap-2 mb-4">
                <BarChart3Icon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Agrupar por:</span>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                    {granularityOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setGranularity(opt.value)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                granularity === opt.value
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gráfica de barras CSS */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-end gap-1" style={{ height: '200px' }}>
                    {data.map((point, i) => {
                        const height = (point.totalResponses / maxResponses) * 100;
                        return (
                            <div
                                key={point.date}
                                className="flex-1 relative group"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div
                                    className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-colors cursor-pointer"
                                    style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                                />
                                {/* Tooltip */}
                                {hoveredIndex === i && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                        <div className="font-semibold mb-1">{point.date}</div>
                                        <div>Respuestas: {point.totalResponses}</div>
                                        <div>Usuarios: {point.uniqueUsersCount}</div>
                                        <div>Promedio: {point.avgScore}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Eje X: labels */}
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    {data.map((point, i) => (
                        <div
                            key={point.date}
                            className="flex-1 text-center text-[10px] text-gray-400 truncate"
                            title={point.date}
                        >
                            {i % Math.ceil(data.length / 10) === 0 ? formatLabel(point.date) : ''}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportTrend;
