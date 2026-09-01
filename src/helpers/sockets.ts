import { io } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';
const socket = io(SOCKET_URL);

socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket desde el sockets:', socket.id);
});

// Manejar desconexión.
socket.on('disconnect', () => {
    console.log('Desconectado del servidor WebSocket');
});