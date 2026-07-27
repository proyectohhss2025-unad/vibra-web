'use client';

import { getHistory } from '@/api/cron-job';
import { CronJob, CronJobExecution } from '@/models/cron-job.entity';
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

interface Props {
  job: CronJob;
  onClose: () => void;
}

const RESULT_BADGES: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  running: 'bg-blue-100 text-blue-700',
};

const TRIGGER_LABELS: Record<string, string> = {
  scheduler: 'Programado',
  manual: 'Manual',
  retry: 'Reintento',
};

const CronJobHistoryModal: React.FC<Props> = ({ job, onClose }) => {
  const [executions, setExecutions] = useState<CronJobExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await getHistory(job._id, page, limit);
      setExecutions(response.docs || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [page, job._id]);

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 2);
      let end = Math.min(totalPages - 1, page + 2);
      if (start > 2) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col m-4"
        style={{ maxHeight: '60vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">Historial: {job.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded">{job.jobType}</code>
              {' · '}{total} ejecución(es)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none px-2 shrink-0"
          >
            &times;
          </button>
        </div>

        {/* ── Cuerpo — scrollable ────────────────────────────── */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 110px)' }}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay ejecuciones registradas para este job.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {executions.map((exec) => (
                <div
                  key={exec._id}
                  className="group flex items-center gap-3 px-5 py-2 text-sm hover:bg-gray-50 transition-colors"
                  title={
                    exec.errorMessage
                      ? `Error: ${exec.errorMessage.substring(0, 300)}`
                      : undefined
                  }
                >
                  {/* Resultado */}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${RESULT_BADGES[exec.result] || 'bg-gray-100 text-gray-700'}`}
                    style={{ minWidth: 52, justifyContent: 'center' }}
                  >
                    {exec.result === 'success' ? 'Éxito' : exec.result === 'error' ? 'Error' : '...'}
                  </span>

                  {/* Tipo de disparo */}
                  <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                    {TRIGGER_LABELS[exec.triggeredBy] || exec.triggeredBy}
                  </span>

                  {/* Inicio */}
                  <span className="text-gray-500 truncate shrink-0">
                    <span className="text-gray-400 text-[11px]">Inicio:</span>{' '}
                    <span className="text-gray-700 text-xs">{formatDateTime(exec.startedAt)}</span>
                  </span>

                  {/* Fin (solo desktop) */}
                  <span className="text-gray-500 truncate hidden md:inline shrink-0">
                    <span className="text-gray-400 text-[11px]">Fin:</span>{' '}
                    <span className="text-gray-700 text-xs">{formatDateTime(exec.completedAt)}</span>
                  </span>

                  {/* Duración */}
                  <span className="text-gray-500 text-xs ml-auto shrink-0 tabular-nums">
                    {formatDuration(exec.duration)}
                  </span>

                  {/* Indicador de error */}
                  {exec.errorMessage && (
                    <span className="text-red-400 shrink-0" title={exec.errorMessage}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer / Paginación ────────────────────────────── */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t bg-gray-50 rounded-b-lg shrink-0">
            <span className="text-xs text-gray-500">
              {total} ejecución(es)
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                Anterior
              </button>

              {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CronJobHistoryModal;
