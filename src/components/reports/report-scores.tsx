'use client';

import React, { useEffect, useState } from 'react';
import { getScoresReport, ReportsFilters } from '@/api/reports';
import { Loader2, TrendingUpIcon, BarChart3Icon } from 'lucide-react';

interface ScoreItem {
    range: string;
    count: number;
    percentage: number;
}

interface ReportScoresProps {
    filters: ReportsFilters;
}

const rangeColors: Record<string, string> = [
    'bg-red-400',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-lime-400',
    'bg-green-400',
    'bg-emerald-500',
];

const ReportScores: React.FC<ReportScoresProps> = ({ filters }) => {
    const [data, setData] = useState<ScoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getScoresReport(filters)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filters]);

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

    const total = data.reduce((acc, d) => acc + d.count, 0);

    // Calcular estadísticas
    const weightedSum = data.reduce((acc, d) => {
        const [low] = d.range.split('-').map(Number);
        const mid = low !== undefined ? low + 10 : 100;
        return acc + mid * d.count;
    }, 0);
    const average = total > 0 ? (weightedSum / total).toFixed(1) : '0';

    // Encontrar el rango con más respuestas
    const topRange = data.reduce((max, d) => (d.count > max.count ? d : max), data[0]);

    return (
        <div>
            {/* Cards de resumen */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Total Respuestas
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Promedio General
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{average}/100</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Rango Mayoritario
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{topRange.range}</div>
                    <div className="text-xs text-gray-400">{topRange.percentage}% del total</div>
                </div>
            </div>

            {/* Distribución por rangos */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full text-left text-sm">
                    <thead className="uppercase tracking-wider border-b-2 text-xs text-gray-500">
                        <tr>
                            <th className="px-3 py-2 font-medium">Rango</th>
                            <th className="px-3 py-2 font-medium text-right">Respuestas</th>
                            <th className="px-3 py-2 font-medium text-right">%</th>
                            <th className="px-3 py-2 font-medium">Distribución</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={item.range} className="hover:bg-blue-50 border-b border-gray-100">
                                <td className="px-3 py-2.5 font-medium text-gray-900">{item.range} pts</td>
                                <td className="px-3 py-2.5 text-right font-semibold">{item.count.toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right text-gray-500">{item.percentage}%</td>
                                <td className="px-3 py-2.5">
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${rangeColors[i] || 'bg-blue-400'}`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportScores;
