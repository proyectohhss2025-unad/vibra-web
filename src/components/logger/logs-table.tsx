import { getLogsFiltered } from "@/api/log";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/new-york/ui/card";
import React, { useEffect, useState } from "react";
import Pagination from "../ui/table/pagination";
import './logs-table.css';

interface LogEntry {
    id: string;
    method: string;
    url: string;
    status: number;
    responseTime: number; // ms
    timestamp: string;
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
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs?.map((log: any) => (
                                    <tr key={log.id} className={`mt-0 mb-0 hover:bg-blue-100 border-b`}>
                                        <td className="text-sm px-2 py-1.5 ml-4">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="text-sm px-2 py-1.5 ml-4">{log.method}</td>
                                        <td className="text-sm px-2 py-1.5 ml-4 max-w-2xl text-truncate"><p title={log.url}>{log.url}</p>
                                            <p title={log.userAgent}>
                                                Origen: {log.origin} IP: {log.ipAddress} Agente:{log.userAgent}
                                            </p>
                                        </td>
                                        <td className={`text-sm px-2 py-1.5 ml-4 ${log.status >= 400 ? "text-red-500" : "text-green-500"}`}>
                                            {log.status}
                                        </td>
                                        <td className="text-sm px-2 py-1.5 ml-4">{log.responseTime.toFixed(2)}</td>
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

        </div>
    );
};

export default LogsTable;