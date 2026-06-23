'use client'

import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};
//NOTE: URL del servidor de WebSocket 
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || configAPI.baseURL;

const ActiveUsers: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // Escuchar el evento "users-update" para recibir la lista actualizada de usuarios
        newSocket.on('users-update', (updatedUsers: any[]) => {
            setUsers(updatedUsers);
        });

        // Limpiar al desmontar el componente
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h2 className={`${isCollapsed ? 'text-md ml-0' : 'text-md border-b-2 border-gray-300 pb-1'} font-bold mb-4`}>{isCollapsed ? t('nav.online') : t('nav.systemUsers')}</h2>
            <ul className="space-y-2">
                {users?.map((user, index) => (
                    <div key={index+1}></div>)
                )}
            </ul>
        </div>
    );
};

export default ActiveUsers;