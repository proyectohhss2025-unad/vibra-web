'use client';

import React, { useEffect, useState } from 'react';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { ReportsFilters } from '@/api/reports';

const COLOMBIA_TZ = 'America/Bogota';

interface ReportFiltersProps {
    filters: ReportsFilters;
    onChange: (filters: ReportsFilters) => void;
    emotions?: { _id: string; name: string; icono: string }[];
}

const ReportFiltersBar: React.FC<ReportFiltersProps> = ({ filters, onChange, emotions }) => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ });

    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [emotionId, setEmotionId] = useState(filters.emotionId || '');
    const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | 'year' | null>(null);

    // Sincronizar filtros externos
    useEffect(() => {
        onChange({ dateFrom, dateTo, emotionId });
    }, [dateFrom, dateTo, emotionId]);

    // Si llegan filtros externos, actualizar y limpiar preset
    useEffect(() => {
        if (filters.dateFrom !== undefined && filters.dateFrom !== dateFrom) {
            setDateFrom(filters.dateFrom || '');
        }
        if (filters.dateTo !== undefined && filters.dateTo !== dateTo) {
            setDateTo(filters.dateTo || '');
        }
    }, [filters.dateFrom, filters.dateTo]);

    const applyRange = (from: string, to: string, preset: 'today' | 'week' | 'month' | 'year' | null) => {
        setActivePreset(preset);
        setDateFrom(from);
        setDateTo(to);
    };

    const setToday = () => {
        applyRange(todayStr, todayStr, 'today');
    };

    const setCurrentWeek = () => {
        const now = new Date();
        // Calcular lunes y domingo de la semana actual en Colombia
        const colombiaNow = new Date(now.toLocaleString('en-US', { timeZone: COLOMBIA_TZ }));
        const dayOfWeek = colombiaNow.getDay(); // 0=domingo
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(colombiaNow);
        monday.setDate(colombiaNow.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        applyRange(
            monday.toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ }),
            sunday.toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ }),
            'week'
        );
    };

    const setCurrentMonth = () => {
        const now = new Date();
        const colombiaNow = new Date(now.toLocaleString('en-US', { timeZone: COLOMBIA_TZ }));
        const year = colombiaNow.getFullYear();
        const month = colombiaNow.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        applyRange(
            firstDay.toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ }),
            lastDay.toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ }),
            'month'
        );
    };

    const setCurrentYear = () => {
        const now = new Date();
        const colombiaNow = new Date(now.toLocaleString('en-US', { timeZone: COLOMBIA_TZ }));
        const year = colombiaNow.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const lastDay = new Date(year, 11, 31);
        applyRange(
            firstDay.toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ }),
            lastDay.toLocaleDateString('en-CA', { timeZone: COLOMBIA_TZ }),
            'year'
        );
    };

    const handleClear = () => {
        setActivePreset(null);
        setDateFrom('');
        setDateTo('');
        setEmotionId('');
    };

    const onFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setActivePreset(null);
        const val = e.target.value;
        setDateFrom(val);
        if (dateTo && val > dateTo) setDateTo(val);
    };

    const onToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setActivePreset(null);
        const val = e.target.value;
        setDateTo(val);
        if (dateFrom && val < dateFrom) setDateFrom(val);
    };

    const hasFilters = dateFrom || dateTo || emotionId;

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium mr-1">
                <FilterIcon className="h-4 w-4" />
                Filtros
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {/* Inputs de fecha */}
                <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={onFromChange}
                        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[130px] focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <span className="text-xs text-gray-400">—</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={onToChange}
                        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[130px] focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                </div>

                {/* Presets */}
                <button
                    type="button"
                    onClick={setToday}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activePreset === 'today'
                            ? '!text-white bg-blue-600 border border-blue-600'
                            : '!text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                    }`}
                >
                    Hoy
                </button>
                <button
                    type="button"
                    onClick={setCurrentWeek}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activePreset === 'week'
                            ? '!text-white bg-blue-600 border border-blue-600'
                            : '!text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    Esta semana
                </button>
                <button
                    type="button"
                    onClick={setCurrentMonth}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activePreset === 'month'
                            ? '!text-white bg-blue-600 border border-blue-600'
                            : '!text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    Este mes
                </button>
                <button
                    type="button"
                    onClick={setCurrentYear}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activePreset === 'year'
                            ? '!text-white bg-blue-600 border border-blue-600'
                            : '!text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    Este año
                </button>
            </div>

            {/* Emoción */}
            {emotions && emotions.length > 0 && (
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Emoción</label>
                    <select
                        value={emotionId}
                        onChange={(e) => setEmotionId(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-44 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                        <option value="">Todas las emociones</option>
                        {emotions.map((e) => (
                            <option key={e._id} value={e._id}>
                                {e.icono} {e.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {hasFilters && (
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5 border border-gray-200 rounded"
                >
                    <XIcon className="h-3 w-3" />
                    Limpiar
                </button>
            )}
        </div>
    );
};

export default ReportFiltersBar;
