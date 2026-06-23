import { getAuditLogs } from "@/api/log";
import { ChevronLeftIcon, ChevronRightIcon, Eye, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import './audit-log.css';

type AuditLog = {
    _id: string;
    user: string;
    action: string;
    entity: string;
    details: string;
    timestamp: string;
    ip: string;
};

const PAGE_SIZE = 12;

const AuditLogComponent: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

    const openDetail = (log: AuditLog) => setDetailLog(log);
    const closeDetail = () => setDetailLog(null);

    const fetchAuditLogs = async (page: number) => {
        setIsLoading(true);
        try {
            const response: any = await getAuditLogs(page, PAGE_SIZE);
            if (response?.data) {
                setLogs(response.data);
                setTotal(response.total);
            } else {
                setLogs(response ?? []);
                setTotal(Array.isArray(response) ? response.length : 0);
            }
        } catch (error) {
            console.error("Error fetching audit logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs(currentPage);
    }, [currentPage]);

    // Filtro local por texto
    const filteredLogs = search
        ? logs.filter(
            (log) =>
                log.user?.toLowerCase().includes(search.toLowerCase()) ||
                log.action?.toLowerCase().includes(search.toLowerCase()) ||
                log.entity?.toLowerCase().includes(search.toLowerCase()) ||
                log.ip?.toLowerCase().includes(search.toLowerCase()) ||
                log.details?.toLowerCase().includes(search.toLowerCase())
        )
        : logs;

    // Siempre limitar los datos mostrados a PAGE_SIZE (evita renderizar todos si el backend devuelve sin paginar)
    const displayData = filteredLogs.slice(0, PAGE_SIZE);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Auditoría Interna</h1>
                <span className="text-sm text-gray-500">{total} registros</span>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por usuario, acción o entidad..."
                    className="border p-2 rounded w-full text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto" id="audit-log">
                <table className="rounded-lg min-w-full text-left text-sm">
                    <thead className="uppercase tracking-wider border-b-2">
                        <tr>
                            <th className="px-3 py-3 w-20">Usuario</th>
                            <th className="px-3 py-3 w-28">Acción</th>
                            <th className="px-3 py-3">Entidad</th>
                            <th className="px-3 py-3">Detalle</th>
                            <th className="px-3 py-3 w-24">IP</th>
                            <th className="px-3 py-3" style={{ width: '170px' }}>Fecha y hora</th>
                            <th className="px-3 py-3 w-16 text-center">Acc.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-400">Cargando...</td>
                            </tr>
                        ) : displayData.length > 0 ? (
                            displayData.map((log) => (
                                <tr
                                    key={log._id}
                                    className="border-b hover:bg-blue-50 cursor-pointer"
                                    onDoubleClick={() => openDetail(log)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap">{log.user}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.action}</td>
                                    <td className="px-3 py-2 max-w-[200px] truncate" title={log.entity}>{log.entity}</td>
                                    <td className="px-3 py-2 max-w-xs truncate" title={log.details}>{log.details}</td>
                                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{log.ip}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleString('es-CO') : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openDetail(log); }}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Ver detalle"
                                        >
                                            <Eye className="w-4 h-4 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500">
                                    {search ? 'No se encontraron registros con ese criterio' : 'No hay registros de auditoría'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {total >= 0 && !search && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-500">
                        {totalPages > 1
                            ? `Página ${currentPage} de ${totalPages}`
                            : `${total} registro${total !== 1 ? 's' : ''}`}
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon className="w-3.5 h-3.5" /> Anterior
                            </button>

                            {(() => {
                                const maxVisible = 7;
                                const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                const end = Math.min(totalPages, start + maxVisible - 1);
                                const adjustedStart = Math.max(1, end - maxVisible + 1);
                                return Array.from({ length: end - adjustedStart + 1 }, (_, i) => {
                                    const pageNum = adjustedStart + i;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                pageNum === currentPage
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                });
                            })()}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Siguiente <ChevronRightIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de detalle */}
            {detailLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDetail}>
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Detalle del registro</h3>
                                <button
                                    onClick={closeDetail}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Contenido */}
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">ID</p>
                                        <p className="text-sm font-mono text-gray-900 break-all">{detailLog._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">IP</p>
                                        <p className="text-sm font-mono text-gray-900">{detailLog.ip || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Usuario</p>
                                        <p className="text-sm font-medium text-gray-900">{detailLog.user || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Acción</p>
                                        <p className="text-sm font-medium text-gray-900">{detailLog.action || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Entidad</p>
                                    <p className="text-sm font-medium text-gray-900">{detailLog.entity || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Detalle</p>
                                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detailLog.details || 'Sin detalle'}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha y hora</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {detailLog.timestamp
                                            ? new Date(detailLog.timestamp).toLocaleString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Botón cerrar */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={closeDetail}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogComponent;
