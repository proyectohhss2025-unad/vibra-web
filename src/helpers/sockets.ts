import { config } from '@/config/config';
import { io } from 'socket.io-client';
const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

//NOTE: URL del servidor de WebSocket 
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || configAPI.baseURL;
const socket = io(SOCKET_URL);

socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket desde el sockets:', socket.id);
});

// Manejar desconexión.
socket.on('disconnect', () => {
    console.log('Desconectado del servidor WebSocket');
});