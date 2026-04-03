import { getAuditLogs } from "@/api/log";
import React, { useEffect, useState } from "react";
import './audit-log.css';

type AuditLog = {
    id: string;
    user: string;
    action: string;
    entity: string;
    details: string;
    timestamp: string;
    ip: string;
};

const AuditLogComponent: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [search, setSearch] = useState("");
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    useEffect(() => {
        const filtered = logs?.filter(
            (log) =>
                log.user.toLowerCase().includes(search.toLowerCase()) ||
                log.action.toLowerCase().includes(search.toLowerCase()) ||
                log.entity.toLowerCase().includes(search.toLowerCase()) ||
                log.ip.toLowerCase().includes(search.toLowerCase()) ||
                log.details.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredLogs(filtered);
    }, [search, logs]);

    const fetchAuditLogs = async () => {
        try {
            const response: any = await getAuditLogs();
            setLogs(response);
            setFilteredLogs(response);
        } catch (error) {
            console.error("Error fetching audit logs", error);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Auditoría Interna</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por usuario, acción o entidad"
                    className="border p-2 rounded w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="" id="audit-log">
                <table className="rounded-lg min-w-full text-left text-sm">
                    <thead className="uppercase tracking-wider border-b-2">
                        <tr>
                            <th className="text-left px-3 py-3">Usuario</th>
                            <th className="text-left px-3 py-3">Acción</th>
                            <th className="text-left px-3 py-3">Entidad</th>
                            <th className="text-left px-3 py-3">Detalle</th>
                            <th className="text-left px-3 py-3">IP</th>
                            <th className="text-left px-3 py-3" style={{ width: '170px' }}>Fecha y hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                                <tr key={index+1}>
                                    <td className="text-sm px-2 py-1.5 ml-4">{log.user}</td>
                                    <td className="text-sm px-2 py-1.5 ml-4">{log.action}</td>
                                    <td className="text-sm px-2 py-1.5 ml-4">{log.entity}</td>
                                    <td className="text-sm px-2 py-1.5 ml-4">{log.details}</td>
                                    <td className="text-sm px-2 py-1.5 ml-4">{log.ip}</td>
                                    <td className="text-sm px-2 py-1.5 ml-4" style={{ width: '170px' }}>{`${new Date(log.timestamp).toLocaleString()}`}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center p-4">
                                    No se encontraron registros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogComponent;
