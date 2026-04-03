import axios from "axios";
import { Radio, WifiOffIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface OfflineSyncProps {
    apiUrl: string;
    isIcon: boolean;
}

const OfflineSync: React.FC<OfflineSyncProps> = ({ apiUrl, isIcon }) => {
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [unsyncedData, setUnsyncedData] = useState<string[]>([]);

    useEffect(() => {
        // Comprobar si estamos en un entorno cliente
        if (typeof window !== "undefined") {
            setIsOnline(navigator.onLine);

            const handleOnline = () => {
                setIsOnline(true);
                syncData();
            };

            const handleOffline = () => {
                setIsOnline(false);
            };

            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);

            return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            };
        }
    }, []);

    useEffect(() => {
        // Cargar datos no sincronizados desde localStorage si estamos en cliente
        if (typeof window !== "undefined") {
            const storedData = localStorage.getItem("unsyncedData");
            if (storedData) {
                setUnsyncedData(JSON.parse(storedData));
            }
        }
    }, []);

    useEffect(() => {
        // Guardar datos no sincronizados en localStorage si estamos en el cliente
        if (typeof window !== "undefined") {
            localStorage.setItem("unsyncedData", JSON.stringify(unsyncedData));
        }
    }, [unsyncedData]);

    const syncData = async () => {
        if (!isOnline || unsyncedData.length === 0) return;

        try {
            const promises = unsyncedData.map((data) =>
                axios.post(apiUrl, { data })
            );
            await Promise.all(promises);
            setUnsyncedData([]); // Limpiar datos no sincronizados al enviarlos
        } catch (error) {
            console.error("Error al sincronizar datos:", error);
        }
    };

    const addData = (data: any) => {
        setUnsyncedData((prev) => [...prev, data]);
    };

    return (
        <>
            {isIcon && <div className="flex items-center ml-0">
                {isOnline ? <Radio className="w-6 h-6" data-tooltip-id="my-tooltip-t"
                    data-tooltip-content={`Conectado a internet`} /> : <WifiOffIcon className="w-6 h-6" />}
                {!isOnline && (
                    <p style={{ color: "red" }} className="ml-2">Estás desconectado{/*'Los datos se guardarán localmente'*/}</p>
                )}</div>}
            {!isIcon && <div><h1>Estado de conexión: {isOnline ? "Conectado" : "Desconectado"}</h1>
                <button onClick={() => addData(`Dato-${Date.now()}`)}>
                    Agregar Dato
                </button>
                {!isOnline && (
                    <p style={{ color: "red" }}>Estás desconectado. Los datos se guardarán localmente.</p>
                )}</div>}
        </>
    );
};

export default OfflineSync;
