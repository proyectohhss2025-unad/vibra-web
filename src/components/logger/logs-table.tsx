import { getLogsFiltered } from "@/api/log";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/new-york/ui/card";
import { Eye, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Pagination from "../ui/table/pagination";
import './logs-table.css';

interface LogEntry {
    _id: string;
    id: string;
    method: string;
    url: string;
    status: number;
    responseTime: number;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    origin: string;
    createdAt?: string;
}

const LogsTable: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [totalPages, setTotalPages] = useState(0);
    const [totalLogs, setTotalLogs] = useState(0);
    const [currentLogs, setCurrentLogs] = useState<any>();
    const [detailLog, setDetailLog] = useState<LogEntry | null>(null);

    const openDetail = (log: LogEntry) => setDetailLog(log);
    const closeDetail = () => setDetailLog(null);

    // Fetch logs from API
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                //FIX: llevar al BBFF - AJustar para enviar filtros directamente al API
                const response = await getLogsFiltered("", "", "", "", "", 1, 1000);
                setLogs(response?.paginatedLogs);
                setFilteredLogs(response?.paginatedLogs);
                setTotalLogs(response?.meta?.totalLogs);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        fetchLogs();
    }, []);

    // Filter logs by search query
    useEffect(() => {
        const filtered = logs?.filter((log) =>
            `${log.method} ${log.url} ${log.status}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
        setFilteredLogs(filtered);
        setCurrentPage(1); // Reset to first page
    }, [searchQuery, logs]);

    useEffect((): any => {
        const indexOfLastLog = currentPage * pageSize;
        const indexOfFirstLog = indexOfLastLog - pageSize;
        const currentLogs_ = filteredLogs?.slice(indexOfFirstLog, indexOfLastLog);
        setCurrentLogs(currentLogs_);
        const totalPages_ = Math.ceil(filteredLogs?.length / pageSize);
        setTotalPages(totalPages_);
    }, [currentPage, pageSize, totalLogs, filteredLogs]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="mx-auto">
            <Card className="col-span-4 bg-white rounded-md w-full mt-3">
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <div>Logs de peticiones al API</div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0'>
                        <p>Registros de las peticiones realizadas al API.</p>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <input
                        type="text"
                        className="border rounded-md p-2 mb-4 w-full"
                        placeholder="Busque por fecha, metodo, origen, url, ip o estado ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="" id="logs-table">
                        <table className="rounded-lg min-w-full text-left text-sm">
                            <thead className="uppercase tracking-wider border-b-2">
                                <tr>
                                    <th className="text-left px-3 py-3">Fecha</th>
                                    <th className="text-left px-3 py-3">Método</th>
                                    <th className="text-left px-3 py-3">URL</th>
                                    <th className="text-left px-3 py-3">Estado</th>
                                    <th className="text-left px-3 py-3">Respuesta (ms)</th>
                                    <th className="px-3 py-3 w-16 text-center">Acc.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs?.map((log: LogEntry) => (
                                    <tr
                                        key={log.id}
                                        className="mt-0 mb-0 hover:bg-blue-100 border-b cursor-pointer"
                                        onDoubleClick={() => openDetail(log)}
                                    >
                                        <td className="text-sm px-2 py-1.5 ml-4">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="text-sm px-2 py-1.5 ml-4">{log.method}</td>
                                        <td className="text-sm px-2 py-1.5 ml-4 max-w-2xl text-truncate"><p title={log.url}>{log.url}</p>
                                            <p title={log.userAgent} className="truncate max-w-md">
                                                Origen: {log.origin} IP: {log.ipAddress} Agente:{log.userAgent}
                                            </p>
                                        </td>
                                        <td className={`text-sm px-2 py-1.5 ml-4 ${log.status >= 400 ? "text-red-500" : "text-green-500"}`}>
                                            {log.status}
                                        </td>
                                        <td className="text-sm px-2 py-1.5 ml-4">{log.responseTime.toFixed(2)}</td>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={totalLogs} // Total number of items (from API response)
                        onPageChange={handlePageChange}
                        setPageSize={setPageSize}
                    />
                </CardContent>
            </Card>

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
                                <h3 className="text-xl font-bold text-gray-900">Detalle del Log</h3>
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
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">UUID</p>
                                        <p className="text-sm font-mono text-gray-900 break-all">{detailLog.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Método</p>
                                        <p className="text-sm font-medium text-gray-900">{detailLog.method}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                                        <p className={`text-sm font-medium ${detailLog.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                                            {detailLog.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Respuesta</p>
                                        <p className="text-sm font-medium text-gray-900">{detailLog.responseTime.toFixed(2)} ms</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">URL</p>
                                    <p className="text-sm font-mono text-gray-900 bg-gray-50 rounded-lg p-3 break-all">{detailLog.url}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Origen</p>
                                    <p className="text-sm text-gray-900">{detailLog.origin || '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">IP</p>
                                        <p className="text-sm font-mono text-gray-900">{detailLog.ipAddress || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha y hora</p>
                                        <p className="text-sm text-gray-900">
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

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">User-Agent</p>
                                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 break-all">{detailLog.userAgent || '-'}</p>
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

export default LogsTable;