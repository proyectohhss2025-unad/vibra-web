import { getLogsFiltered } from "@/api/log";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york/ui/card";
import { RefreshCwIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface LogEntry {
    id: string;
    method: string;
    url: string;
    status: number;
    responseTime: number;
    timestamp: string;
}

const LogsDashboardChart: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [totalRequests, setTotalRequests] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [averageResponseTime, setAverageResponseTime] = useState(0);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await getLogsFiltered("", "", "", "", "", 1, 500);
            if (!response) {
                setIsLoading(false);
                return;
            }
            const logsData = response?.paginatedLogs ?? [];
            setLogs(logsData);
            setTotalRequests(response?.meta?.totalLogs ?? 0);

            const errors = logsData.filter((log: LogEntry) => log.status >= 400).length;
            setTotalErrors(errors);

            const avgTime = logsData.length > 0
                ? logsData.reduce((sum: number, log: LogEntry) => sum + log.responseTime, 0) / logsData.length
                : 0;
            setAverageResponseTime(avgTime);

            setLastUpdate(new Date().toLocaleTimeString('es-CO'));
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Métricas derivadas
    const methodCounts = logs.reduce((acc, log) => {
        acc[log.method] = (acc[log.method] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const maxMethodCount = Math.max(...Object.values(methodCounts), 1);

    const statusCounts = logs.reduce(
        (acc, log) => {
            if (log.status >= 200 && log.status < 300) acc["2xx"]++;
            else if (log.status >= 300 && log.status < 400) acc["3xx"]++;
            else if (log.status >= 400 && log.status < 500) acc["4xx"]++;
            else if (log.status >= 500) acc["5xx"]++;
            return acc;
        },
        { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 }
    );

    const statusColors: Record<string, string> = {
        "2xx": "bg-green-500",
        "3xx": "bg-yellow-400",
        "4xx": "bg-orange-500",
        "5xx": "bg-red-500",
    };

    const methodColors: Record<string, string> = {
        GET: "bg-blue-500",
        POST: "bg-green-500",
        PUT: "bg-yellow-500",
        PATCH: "bg-orange-500",
        DELETE: "bg-red-500",
    };

    const hasData = logs.length > 0;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Monitor de peticiones al API</h3>
                <div className="flex items-center gap-3">
                    {lastUpdate && <span className="text-xs text-gray-400">Actualizado: {lastUpdate}</span>}
                    <button onClick={fetchLogs} disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                        <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Cargando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de peticiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '---' : totalRequests.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Peticiones registradas en el sistema.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Errores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {isLoading ? '---' : totalErrors}
                        </div>
                        <p className="text-xs text-muted-foreground">Peticiones con estado &ge;400.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo promedio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '---' : `${averageResponseTime.toFixed(0)} ms`}</div>
                        <p className="text-xs text-muted-foreground">Tiempo de respuesta promedio.</p>
                    </CardContent>
                </Card>
            </div>

            {!hasData && !isLoading && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <p className="text-amber-700 font-medium">No hay datos de monitoreo</p>
                    <p className="text-amber-600 text-sm mt-1">
                        El logger no ha registrado peticiones aún. Aparecerán automáticamente al usar el API.
                    </p>
                </div>
            )}

            {hasData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Barras por método HTTP */}
                    <div className="bg-white shadow rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Peticiones por Método</h4>
                        <div className="space-y-2">
                            {Object.entries(methodCounts).map(([method, count]) => (
                                <div key={method} className="flex items-center gap-3">
                                    <span className="w-14 text-xs font-mono font-medium text-gray-600">{method}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${methodColors[method] || 'bg-gray-400'}`}
                                            style={{ width: `${(count / maxMethodCount) * 100}%` }}
                                        />
                                    </div>
                                    <span className="w-10 text-xs text-right font-medium text-gray-700">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estados HTTP */}
                    <div className="bg-white shadow rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribución de Estados HTTP</h4>
                        <div className="space-y-2">
                            {Object.entries(statusCounts).map(([status, count]) => {
                                const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                return (
                                    <div key={status} className="flex items-center gap-3">
                                        <span className="w-10 text-xs font-medium text-gray-600">{status}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${statusColors[status] || 'bg-gray-400'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-xs text-right font-medium text-gray-700">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Últimas peticiones */}
                    <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Últimas peticiones</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-left text-gray-500 uppercase tracking-wider">
                                        <th className="py-1.5 pr-3">Método</th>
                                        <th className="py-1.5 pr-3">URL</th>
                                        <th className="py-1.5 pr-3">Status</th>
                                        <th className="py-1.5 pr-3">Tiempo</th>
                                        <th className="py-1.5">Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.slice(0, 10).map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50">
                                            <td className="py-1.5 pr-3">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-medium text-white ${methodColors[log.method] || 'bg-gray-400'}`}>
                                                    {log.method}
                                                </span>
                                            </td>
                                            <td className="py-1.5 pr-3 text-gray-600 truncate max-w-[300px]" title={log.url}>
                                                {log.url}
                                            </td>
                                            <td className="py-1.5 pr-3">
                                                <span className={`font-mono font-medium ${log.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="py-1.5 pr-3 text-gray-600">{log.responseTime}ms</td>
                                            <td className="py-1.5 text-gray-500 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleTimeString('es-CO')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LogsDashboardChart;
