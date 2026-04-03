'use client'

import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import UserListItem from './user-list-item';
import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};
//NOTE: URL del servidor de WebSocket 
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || configAPI.baseURL;

const ActiveUsers: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // Escuchar el evento "users-update" para recibir la lista actualizada de usuarios
        newSocket.on('users-update', (updatedUsers: any[]) => {
            console.log('Actualización de usuarios conectados:', updatedUsers.length);
            setUsers(updatedUsers);
        });

        // Limpiar al desmontar el componente
        return () => {
            newSocket.disconnect();
        };
    }, []);


    /*useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Conectado al servidor WebSocket desde el sockets de usuarios activos:', socket.id);
        });

        socket.on('users-update', (updatedUsers: any[]) => {
            console.log('Actualización de usuarios:', updatedUsers);
            setUsers(updatedUsers);
        });

        socket.on('server-status', (id) => {
            console.log('connection-established:', id);
            //setUsers(updatedUsers);
        });

        return () => {
            socket.disconnect();
        };
    }, []);*/

    return (
        <div className="container mx-auto p-2">
            <h2 className={`${isCollapsed ? 'text-md ml-0' : 'text-md border-b-2 border-gray-300 pb-1'} font-bold mb-4`}>{isCollapsed ? getSafeKeyFromStorage('Online') : getSafeKeyFromStorage('System users')}</h2>
            <ul className="space-y-2">
                {users.length === 0 && <li>Not user connected.</li>}
                {users?.map(user => (
                    <UserListItem key={user._id} user={user} isCollapsed={isCollapsed} />
                ))}
            </ul>{/*<li key={user._id} className={`${user.isLogged ? 'bg-green-500 text-white' : 'bg-gray-300'} p-4 border rounded shadow-sm transition`}>
                        <h3 className="text-xl font-semibold">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                    </li><UserListItem key={user._id} user={user} />*/}
        </div>
    );
};

export default ActiveUsers;