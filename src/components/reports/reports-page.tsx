'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getKpiReport, ReportsFilters } from '@/api/reports';
import { getAll as getEmotions } from '@/api/emotion';
import CurrentDateTime from '@/components/utils/current-datetime';
import KpiCards from './kpi-cards';
import ReportFiltersBar from './report-filters';
import ReportByActivity from './report-by-activity';
import ReportByUser from './report-by-user';
import ReportByEmotion from './report-by-emotion';
import ReportTrend from './report-trend';
import ReportScores from './report-scores';
import { BarChart3Icon, ListIcon, UsersIcon, SmileIcon, TrendingUpIcon, PieChartIcon } from 'lucide-react';

interface KpiData {
    totalResponses: number;
    uniqueUsers: number;
    avgScore: number;
    avgTimeMinutes: number;
    totalScore: number;
    todayResponses: number;
    activeActivities: number;
}

const tabs = [
    { id: 'kpi', label: 'Panorama', icon: BarChart3Icon },
    { id: 'by-activity', label: 'Por Actividad', icon: ListIcon },
    { id: 'by-user', label: 'Por Usuario', icon: UsersIcon },
    { id: 'by-emotion', label: 'Emociones', icon: SmileIcon },
    { id: 'trend', label: 'Tendencia', icon: TrendingUpIcon },
    { id: 'scores', label: 'Puntajes', icon: PieChartIcon },
];

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('kpi');
    const [filters, setFilters] = useState<ReportsFilters>({});
    const [kpiData, setKpiData] = useState<KpiData | null>(null);
    const [kpiLoading, setKpiLoading] = useState(true);
    const [emotions, setEmotions] = useState<any[]>([]);

    // Cargar emociones para los filtros
    useEffect(() => {
        getEmotions(1, 200).then((res) => setEmotions(res.data || [])).catch(console.error);
    }, []);

    // Cargar KPIs cuando cambian los filtros (siempre se muestran)
    useEffect(() => {
        setKpiLoading(true);
        getKpiReport(filters)
            .then(setKpiData)
            .catch(console.error)
            .finally(() => setKpiLoading(false));
    }, [filters]);

    const handleFilterChange = useCallback((newFilters: ReportsFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Reportes de Participación</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        KPIs, tendencias y desgloses de actividades
                    </p>
                </div>
                <div className="bg-white rounded-md px-2 py-1">
                    <CurrentDateTime />
                </div>
            </div>

            {/* Filtros globales */}
            <ReportFiltersBar
                filters={filters}
                onChange={handleFilterChange}
                emotions={emotions}
            />

            {/* Tabs internas estilo panel */}
            <div className="border-b border-gray-200 mb-0">
                <div className="flex gap-0 -mb-px overflow-x-auto overflow-y-hidden">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                                    isActive
                                        ? 'text-blue-700 bg-white border border-gray-200 border-b-white rounded-t-lg shadow-sm -mb-[1px] z-10'
                                        : 'text-gray-500 bg-gray-50/50 border border-transparent hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contenido según tab activa — dentro de un card blanco */}
            <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg rounded-r-lg p-5 min-h-[350px] shadow-sm">
                {activeTab === 'kpi' && <KpiCards data={kpiData} loading={kpiLoading} />}
                {activeTab === 'by-activity' && <ReportByActivity filters={filters} />}
                {activeTab === 'by-user' && <ReportByUser filters={filters} />}
                {activeTab === 'by-emotion' && <ReportByEmotion filters={filters} />}
                {activeTab === 'trend' && <ReportTrend filters={filters} />}
                {activeTab === 'scores' && <ReportScores filters={filters} />}
            </div>
        </div>
    );
};

export default ReportsPage;
