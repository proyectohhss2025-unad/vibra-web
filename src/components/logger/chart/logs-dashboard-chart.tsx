import { getLogs, getLogsFiltered } from "@/api/log";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/new-york/ui/hover-card";
import { useTabs } from "@/services/contexts/tabs-context";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { BugOffIcon, CheckIcon, TimerResetIcon, Wallet2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

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
    const { openTab } = useTabs();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await getLogsFiltered("", "", "", "", "", 1, 1000);
                setLogs(response?.paginatedLogs);
                calculateMetrics(response?.paginatedLogs);
                setTotalRequests(response?.meta?.totalLogs)
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        fetchLogs();
    }, []);

    // Calcular métricas clave
    const calculateMetrics = (data: LogEntry[]) => {
        //setTotalRequests(data.length);

        const errors = data?.filter((log) => log.status >= 400).length;
        setTotalErrors(errors);

        const avgResponseTime =
            data?.reduce((sum, log) => sum + log.responseTime, 0) / data?.length || 0;
        setAverageResponseTime(avgResponseTime);
    };

    // Preparar datos para gráficos
    const methodCounts = logs?.reduce((acc, log) => {
        acc[log.method] = (acc[log.method] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const methodsData = {
        labels: Object.keys(methodCounts),
        datasets: [
            {
                label: "Peticiones por Método",
                data: Object.values(methodCounts),
                backgroundColor: ["#4CAF50", "#FFC107", "#F44336", "#2196F3"],
            },
        ],
    };

    const responseTimesData = {
        labels: logs?.map((log) => new Date(log.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: "Tiempos de Respuesta (ms)",
                data: logs?.map((log) => log.responseTime),
                borderColor: "#2196F3",
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                tension: 0.2,
            },
        ],
    };
    // Contar estados HTTP
    const statusCounts = logs?.reduce(
        (acc, log) => {
            if (log.status >= 200 && log.status < 300) acc["2xx"]++;
            else if (log.status >= 300 && log.status < 400) acc["3xx"]++;
            else if (log.status >= 400 && log.status < 500) acc["4xx"]++;
            else if (log.status >= 500) acc["5xx"]++;
            return acc;
        },
        { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 }
    );

    const statusData = {
        labels: ["2xx: Success", "3xx: Redirects", "4xx: Client Errors", "5xx: Server Errors"],
        datasets: [
            {
                label: "Estados HTTP",
                data: Object.values(statusCounts),
                backgroundColor: ["#4CAF50", "#FFC107", "#F44336", "#2196F3"],
                hoverBackgroundColor: ["#45a049", "#ffb300", "#e53935", "#1976d2"],
            },
        ],
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white rounded-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de peticiones
                        </CardTitle>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <CheckIcon className="h-7 w-7 text-green-500 hover:text-green-700 cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="flex justify-between space-x-4" >
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Datos en el filtro</h4>
                                        <p className="text-sm">
                                            {''}
                                        </p>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center">
                            {totalRequests}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total de peticiones realizadas al API.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white rounded-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de errores
                        </CardTitle>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <BugOffIcon className="h-7 w-7 text-red-500 hover:text-red-700 cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="flex justify-between space-x-4" >
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Datos en el filtro</h4>
                                        <p className="text-sm">
                                            {''}
                                        </p>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center">
                            {totalErrors}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total de peticiones con errores en la Respuesta.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white rounded-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Tiempo de respuesta
                        </CardTitle>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <TimerResetIcon onClick={() => {
                                }} className="h-7 w-7 text-gray-500 hover:text-gray-700 cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="flex justify-between space-x-4" >
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Datos en el filtro</h4>
                                        <p className="text-sm">
                                            {''}
                                        </p>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center">
                            {averageResponseTime.toFixed(2)} ms
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Promedio de tiempo de las peticiones realizadas al API.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-y-8 md:grid-cols-3 sm:grid-cols-1 gap-4">
                {/* Gráfico de Barras */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-bold mb-4">Peticiones por Método</h2>
                    <Bar data={methodsData} />
                </div>

                {/* Gráfico de Pastel */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-bold mb-4">Distribución de Estados HTTP</h2>
                    {statusData.datasets.length > 1 && <Pie data={statusData} />}
                </div>

                {/* Gráfico de Líneas */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-bold mb-4">Tiempos de Respuesta</h2>
                    <Line data={responseTimesData} />
                </div>
            </div>
        </>
    );
};

export default LogsDashboardChart;
