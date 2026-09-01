'use client'

import { useTranslation } from 'react-i18next';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import UserListItem from './user-list-item';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';

/** Duración del mensaje de notificación en ms */
const TOAST_DURATION = 5000;

const ActiveUsers: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'connect' | 'disconnect' } | null>(null);
    const identified = useRef(false);
    const prevUsers = useRef<any[]>([]);
    const toastTimer = useRef<NodeJS.Timeout | null>(null);

    /** Muestra un toast y lo auto-destruye después de TOAST_DURATION */
    const showToast = useCallback((message: string, type: 'connect' | 'disconnect') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => {
            setToast(null);
            toastTimer.current = null;
        }, TOAST_DURATION);
    }, []);

    /** Compara lista anterior vs nueva y muestra notificaciones */
    const detectChanges = useCallback((prev: any[], current: any[]) => {
        const prevMap = new Map(prev.map(u => [u.userId, u]));
        const currentMap = new Map(current.map(u => [u.userId, u]));

        // Usuarios que se desconectaron (estaban en prev pero ya no en current)
        for (const [id, user] of prevMap) {
            if (!currentMap.has(id) && user.name && user.name !== 'Conectando...') {
                showToast(`Usuario desconectado: ${user.name}`, 'disconnect');
            }
        }

        // Usuarios que se conectaron (están en current pero no en prev)
        for (const [id, user] of currentMap) {
            if (!prevMap.has(id) && user.name && user.name !== 'Conectando...') {
                showToast(`Usuario conectado: ${user.name}`, 'connect');
            }
        }
    }, [showToast]);

    useEffect(() => {
        identified.current = false;
        const newSocket = io(SOCKET_URL);
        let cleanup = false;

        // Cuando se establece la conexión, identificar al usuario actual
        newSocket.on('connect', () => {
            if (cleanup) return;
            console.log('Socket conectado para usuarios activos:', newSocket.id);

            // Leer datos del usuario desde localStorage
            let userData: any = null;
            try {
                const raw = getSafeKeyObjectFromStorage('user');
                if (raw) {
                    userData = JSON.parse(raw);
                }
            } catch (e) {
                console.warn('No se pudo leer user de localStorage:', e);
            }

            if (userData && userData.sub) {
                newSocket.emit('identifyUser', {
                    userId: userData.sub,
                    username: userData.username || '',
                    name: userData.name || '',
                    email: userData.email || '',
                    avatar: userData.avatar || 'default-avatar.svg',
                    role: userData.role || null,
                    platform: 'web',
                });
                identified.current = true;
                console.log('Usuario identificado en socket:', userData.name);
            }
        });

        // Escuchar el evento "users-update" para recibir la lista actualizada de usuarios conectados
        newSocket.on('users-update', (updatedUsers: any[]) => {
            if (cleanup) return;
            console.log('Actualización de usuarios conectados:', updatedUsers.length);

            // Detectar cambios vs la lista anterior
            detectChanges(prevUsers.current, updatedUsers);
            prevUsers.current = updatedUsers;

            setUsers(updatedUsers);
        });

        // Limpiar al desmontar el componente
        return () => {
            cleanup = true;
            identified.current = false;
            if (toastTimer.current) clearTimeout(toastTimer.current);
            newSocket.disconnect();
        };
    }, [detectChanges]);

    return (
        <>
            <div className="container mx-auto p-2">
                <h2 className={`${isCollapsed ? 'text-md ml-0' : 'text-md border-b-2 border-gray-300 pb-1'} font-bold mb-4`}>
                    {isCollapsed ? t('nav.online') : t('nav.systemUsers')}
                </h2>
                <ul className="space-y-2">
                    {users.length === 0 && <li className="text-sm text-gray-400 px-2">Not user connected.</li>}
                    {users?.map(user => (
                        <UserListItem key={user.socketId || user.userId} user={user} isCollapsed={isCollapsed} />
                    ))}
                </ul>
            </div>

            {/* Toast de notificación fijo en la parte inferior */}
            {toast && (
                <div
                    className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
                        toast.type === 'connect' ? 'bg-green-600' : 'bg-red-500'
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </>
    );
};

export default ActiveUsers;