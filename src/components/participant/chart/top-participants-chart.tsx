import { getTopParticipants } from "@/api/participant";
import { useFilter } from "@/services/contexts/filter-context";
import { formatDate } from "@/utils/dates";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

// Registrar los módulos de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Tipo de dato para los participantes principales
interface TopParticipant {
    _id: string;
    totalAmount: number;
    activityCount: number; // Número de participaciones
}

// Componente principal
const TopParticipantsChart: React.FC = () => {

    const [participants, setParticipants] = useState<TopParticipant[]>([]);
    const [limit, setLimit] = useState(10);
    const [startDate, setStartDate] = useState<string>(""); // Fecha inicial
    const [endDate, setEndDate] = useState<string>(""); // Fecha final
    const { dateInitFilter, dateEndFilter } = useFilter();

    useEffect(() => {
        setStartDate(formatDate(dateInitFilter, 'YYYY-MM-DD'));
        setEndDate(formatDate(dateEndFilter, 'YYYY-MM-DD'));
    }, [dateInitFilter, dateEndFilter]);

    // Obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getTopParticipants(limit, startDate, endDate);
                setParticipants(response.participants);
            } catch (error) {
                console.error("Error fetching top participants:", error);
            }
        };

        fetchData();
    }, [limit, startDate, endDate]);

    // Manejar cambios en el límite
    const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLimit = Number.parseInt(event.target.value, 10);
        if (!Number.isNaN(newLimit) && newLimit > 0) {
            setLimit(newLimit);
        }
    };

    // Configuración de los datos para Chart.js
    const data = {
        labels: participants?.map((participant) => participant._id), // Nombres de los participantes
        datasets: [
            {
                label: "Monto Total Pendiente ($)",
                data: participants.map((participant) => participant.totalAmount),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Opciones de configuración
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Participaciones por usuario",
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                /*ticks: {
                    callback: (value: string | number) => `$${value}`, // Formato
                },*/
            },
            y: {
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className="p-4 bg-white rounded-md">
            <div className="relative sm:col-span-12">
                <h2 className="text-2xl font-bold mb-4 mt-2" style={{ marginTop: '-10px' }}>Montos pendientes por participante</h2>
                <div className="flex items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex items-center space-x-2 justify-start">
                        <label htmlFor="participantLimit" className="font-medium text-gray-700 mr-2 text-xs">
                            Mostrar:
                        </label>
                        <input
                            id="participantLimit"
                            type="number"
                            value={limit}
                            onChange={handleLimitChange}
                            className="w-10 p-1 ml-2 border rounded-md text-center text-xs"
                            min={1}
                        />
                    </div>
                    <div className="flex items-center space-x-2 justify-start">
                        <label htmlFor="startDate" className="font-medium text-gray-700 mr-2 text-xs">
                            Desde:
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 w-32 border rounded-md text-xs"
                        />
                    </div>
                    <div className="flex items-center space-x-2 justify-start">
                        <label htmlFor="endDate" className="font-medium text-gray-700 mr-2 text-xs">
                            Hasta:
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 w-32 border rounded-md text-xs"
                        />
                    </div>
                </div>
            </div>
            <Bar data={data} options={options} />
        </div>
    );
};

export default TopParticipantsChart;
