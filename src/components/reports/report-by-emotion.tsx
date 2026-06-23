'use client';

import React, { useEffect, useState } from 'react';
import { getByEmotionReport, ReportsFilters } from '@/api/reports';
import { Loader2 } from 'lucide-react';

interface EmotionItem {
    emotionId: string;
    emotionName: string;
    emotionCategory: string;
    emotionIcon: string;
    totalResponses: number;
    uniqueUsersCount: number;
    distinctActivitiesCount: number;
    avgScore: number;
}

interface ReportByEmotionProps {
    filters: ReportsFilters;
}

const categoryColors: Record<string, string> = {
    Positiva: 'text-green-600 bg-green-50',
    Negativa: 'text-red-600 bg-red-50',
    Neutra: 'text-gray-600 bg-gray-100',
    Basica: 'text-blue-600 bg-blue-50',
    Compleja: 'text-purple-600 bg-purple-50',
};

const ReportByEmotion: React.FC<ReportByEmotionProps> = ({ filters }) => {
    const [data, setData] = useState<EmotionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getByEmotionReport(filters)
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

    const maxResponses = Math.max(...data.map((d) => d.totalResponses), 1);

    return (
        <div className="space-y-3">
            {data.map((item) => {
                const pct = Math.round((item.totalResponses / maxResponses) * 100);
                return (
                    <div key={item.emotionId} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{item.emotionIcon}</span>
                                <div>
                                    <span className="font-medium text-gray-900">{item.emotionName}</span>
                                    <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.emotionCategory] || 'text-gray-500 bg-gray-50'}`}>
                                        {item.emotionCategory}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{item.totalResponses}</div>
                                <div className="text-xs text-gray-400">respuestas</div>
                            </div>
                        </div>

                        {/* Barra de contribución */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                            <div
                                className="h-2 rounded-full bg-blue-500 transition-all"
                                style={{ width: `${pct}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                            <div>
                                <span className="font-semibold text-gray-700">{item.distinctActivitiesCount}</span>{' '}
                                actividades
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">{item.uniqueUsersCount}</span>{' '}
                                usuarios
                            </div>
                            <div>
                                Ø{' '}
                                <span className="font-semibold text-gray-700">{item.avgScore}</span>{' '}
                                puntos
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReportByEmotion;
