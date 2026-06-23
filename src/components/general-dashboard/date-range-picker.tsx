"use client"

import { CalendarIcon } from "lucide-react";
import * as React from "react"

interface Props {
  disabled: boolean;
  setIsRange: (value: any) => void;
  setSelectedDate: (date: any) => void;
  externalDateFrom?: string | null;
  externalDateTo?: string | null;
  onYearSelected?: (year: number) => void;
}

const CalendarDateRangePicker: React.FC<Props> = ({ disabled, setIsRange, setSelectedDate, externalDateFrom, externalDateTo, onYearSelected }) => {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

  const [dateFrom, setDateFrom] = React.useState(externalDateFrom || todayStr);
  const [dateTo, setDateTo] = React.useState(externalDateTo || todayStr);
  const [activePreset, setActivePreset] = React.useState<'today' | 'week' | 'month' | 'year' | null>(null);

  // Sincronizar state interno cuando cambian las fechas externas
  React.useEffect(() => {
    if (externalDateFrom) setDateFrom(externalDateFrom);
    if (externalDateTo) setDateTo(externalDateTo);
    if (externalDateFrom || externalDateTo) setActivePreset(null);
  }, [externalDateFrom, externalDateTo]);

  const applyRange = (from: string, to: string, preset: 'today' | 'week' | 'month' | 'year' | null) => {
    setDateFrom(from);
    setDateTo(to);
    setActivePreset(preset);
    setSelectedDate({ from: new Date(from + 'T00:00:00'), to: new Date(to + 'T00:00:00') });
    // Reactivar rango si estaba en modo año
    setIsRange(true);
  };

  const setToday = () => {
    applyRange(todayStr, todayStr, 'today');
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    applyRange(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0],
      'month'
    );
  };

  const setCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    applyRange(
      monday.toISOString().split('T')[0],
      sunday.toISOString().split('T')[0],
      'week'
    );
  };

  const setCurrentYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    applyRange(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0],
      'year'
    );
    onYearSelected?.(year);
  };

  const onFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    const val = e.target.value;
    setDateFrom(val);
    const newTo = dateTo && val > dateTo ? val : dateTo;
    if (newTo !== dateTo) setDateTo(newTo);
    setSelectedDate({ from: new Date(val + 'T00:00:00'), to: new Date(newTo + 'T00:00:00') });
    setIsRange(true);
  };

  const onToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    const val = e.target.value;
    setDateTo(val);
    const newFrom = dateFrom && val < dateFrom ? val : dateFrom;
    if (newFrom !== dateFrom) setDateFrom(newFrom);
    setSelectedDate({ from: new Date(newFrom + 'T00:00:00'), to: new Date(val + 'T00:00:00') });
    setIsRange(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarIcon className={`h-5 w-5 flex-shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-500'}`} />
      <input
        type="date"
        value={dateFrom}
        onChange={onFromChange}
        disabled={disabled}
        className={`rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[140px] ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
      />
      <span className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>—</span>
      <input
        type="date"
        value={dateTo}
        onChange={onToChange}
        disabled={disabled}
        className={`rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[140px] ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
      />
      <button
        type="button"
        onClick={setToday}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
          activePreset === 'today'
            ? '!text-white bg-blue-600 border border-blue-600 hover:bg-blue-700'
            : '!text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:!text-blue-800'
        }`}
      >
        Hoy
      </button>
      <button
        type="button"
        onClick={setCurrentWeek}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
          activePreset === 'week'
            ? '!text-white bg-blue-600 border border-blue-600 hover:bg-blue-700'
            : '!text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:!text-gray-800'
        }`}
      >
        Esta semana
      </button>
      <button
        type="button"
        onClick={setCurrentMonth}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
          activePreset === 'month'
            ? '!text-white bg-blue-600 border border-blue-600 hover:bg-blue-700'
            : '!text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:!text-gray-800'
        }`}
      >
        Este mes
      </button>
      <button
        type="button"
        onClick={setCurrentYear}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
          activePreset === 'year'
            ? '!text-white bg-blue-600 border border-blue-600 hover:bg-blue-700'
            : '!text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:!text-gray-800'
        }`}
      >
        Este año
      </button>
    </div>
  )
}

export default CalendarDateRangePicker;
