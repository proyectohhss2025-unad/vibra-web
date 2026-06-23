'use client';

import React from 'react';
import { ActivityIcon, UsersIcon, StarIcon, ClockIcon, TrendingUpIcon, CalendarIcon } from 'lucide-react';

interface KpiData {
    totalResponses: number;
    uniqueUsers: number;
    avgScore: number;
    avgTimeMinutes: number;
    totalScore: number;
    todayResponses: number;
    activeActivities: number;
}

interface KpiCardsProps {
    data: KpiData | null;
    loading: boolean;
}

const cards = [
    {
        key: 'activeActivities' as const,
        label: 'Actividades Activas',
        icon: ActivityIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        format: (v: number) => v.toString(),
    },
    {
        key: 'totalResponses' as const,
        label: 'Respuestas Totales',
        icon: TrendingUpIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'uniqueUsers' as const,
        label: 'Usuarios Únicos',
        icon: UsersIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'todayResponses' as const,
        label: 'Respondieron Hoy',
        icon: CalendarIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'avgScore' as const,
        label: 'Puntaje Promedio',
        icon: StarIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        format: (v: number) => `${v}/100`,
    },
    {
        key: 'avgTimeMinutes' as const,
        label: 'Tiempo Promedio',
        icon: ClockIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        format: (v: number) => `${v} min`,
    },
];

const KpiCards: React.FC<KpiCardsProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {cards.map((card) => (
                    <div key={card.key} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                        <div className="h-8 bg-gray-200 rounded w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => {
                const Icon = card.icon;
                const value = data[card.key];
                return (
                    <div
                        key={card.key}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {card.label}
                            </span>
                            <div className={`p-1.5 rounded ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${card.color}`}>
                            {card.format(value)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KpiCards;
