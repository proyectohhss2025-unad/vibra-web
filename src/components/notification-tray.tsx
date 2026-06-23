'use client'

import { getAll, getCountAllNotifications, getCountAllNotificationsByDay, getUnreadCount, markAsRead } from '../api/notification';
import { User } from '../models/user.entity';
import { Badge } from '../registry/new-york/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../registry/new-york/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../registry/new-york/ui/tabs';
import { AuthContext } from '../services/auth';
import { getSafeKeyObjectFromStorage } from '../utils/safe-token-storage';
import { BellIcon, CheckCheckIcon, CheckIcon, Inbox, Mail, RefreshCw, Star } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import Notifications from './notification/notifications';
import CurrentDateTime from './utils/current-datetime';

/**
 * Stats panel shown alongside the notification list
 */
const NotificationStats: React.FC<{ refreshKey?: number }> = ({ refreshKey = 0 }) => {
    const [total, setTotal] = useState<number>(0);
    const [unread, setUnread] = useState<number>(0);
    const [today, setToday] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const [countAll, countUnread, countToday] = await Promise.all([
                    getCountAllNotifications(),
                    getUnreadCount(),
                    getCountAllNotificationsByDay(),
                ]);
                setTotal(countAll?.countNotifications ?? 0);
                setUnread(countUnread ?? 0);
                setToday(countToday?.count ?? countToday ?? 0);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [refreshKey]);

    const stats = [
        { label: 'Total', value: total, color: 'bg-blue-100 text-blue-700', icon: <BellIcon className="h-5 w-5" /> },
        { label: 'Sin leer', value: unread, color: 'bg-red-100 text-red-700', icon: <Mail className="h-5 w-5" /> },
        { label: 'Hoy', value: today, color: 'bg-green-100 text-green-700', icon: <CheckCheckIcon className="h-5 w-5" /> },
    ];

    return (
        <div className="space-y-3">
            {stats.map(s => (
                <div key={s.label} className={`flex items-center justify-between rounded-lg px-4 py-3 ${s.color}`}>
                    <div className="flex items-center gap-2">
                        {s.icon}
                        <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <span className="text-2xl font-bold">{isLoading ? '—' : s.value}</span>
                </div>
            ))}

            <div className="mt-4 border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Últimas notificaciones</p>
                <RecentNotifications />
            </div>
        </div>
    );
};

/**
 * Compact list of the 3 most recent notifications for the stats panel
 */
const RecentNotifications: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        getAll(1, 3).then((res: any) => {
            setItems(res?.notifications ?? res?.docs ?? []);
        }).catch(() => {});
    }, []);

    if (!items.length) return <p className="text-xs text-gray-400">Sin notificaciones recientes</p>;

    return (
        <ul className="space-y-2">
            {items.map((n: any) => (
                <li key={n._id} className="flex items-start gap-2">
                    <BellIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${n.isRead ? 'text-gray-300' : 'text-blue-500'}`} />
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{n.title}</p>
                        {n.message && <p className="text-xs text-gray-400 truncate">{n.message}</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
};

/**
 * Component that displays a dashboard of notifications
 */
const NotificationTrayComponent = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token } = useContext(AuthContext);
    const [unreadCount, setUnreadCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count ?? 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-col md:flex w-full">
            {/* Header estilo ListPageLayout */}
            <div className="hidden flex-col w-full md:flex mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight ml-3">Centro de Notificaciones</h2>
                    <div className="bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                        <CurrentDateTime />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-md w-full mt-3 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold">Notificaciones</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {unreadCount > 0
                                ? <span>Tienes <strong>{unreadCount}</strong> sin leer</span>
                                : <span>Todo al día</span>}
                        </p>
                    </div>
                    <button
                        onClick={() => { fetchUnreadCount(); setRefreshKey(k => k + 1); }}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" /> Actualizar
                    </button>
                </div>

                <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
                    {/* ── Panel principal ── */}
                    <div className="sm:col-span-8">
                        <Tabs defaultValue="all" className="w-full" key={refreshKey}>
                            <TabsList className="grid w-full h-12 grid-cols-3 p-1 bg-gray-100 rounded-lg">
                                <TabsTrigger value="all"
                                    className="text-sm font-medium transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:bg-white data-[state=active]:text-primary flex items-center justify-center gap-2">
                                    <Inbox className="w-4 h-4" /> Todas
                                </TabsTrigger>
                                <TabsTrigger value="unread"
                                    className="text-sm font-medium transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:bg-white data-[state=active]:text-primary flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4" /> Sin leer
                                </TabsTrigger>
                                <TabsTrigger value="important"
                                    className="text-sm font-medium transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:bg-white data-[state=active]:text-primary flex items-center justify-center gap-2">
                                    <Star className="w-4 h-4" /> Importantes
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="mt-4">
                                <Notifications filter="all" limit={20} refreshKey={refreshKey} />
                            </TabsContent>
                            <TabsContent value="unread" className="mt-4">
                                <Notifications filter="unread" limit={20} refreshKey={refreshKey} />
                            </TabsContent>
                            <TabsContent value="important" className="mt-4">
                                <Notifications filter="important" limit={20} refreshKey={refreshKey} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* ── Panel de estadísticas ── */}
                    <div className="sm:col-span-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Estadísticas</h4>
                            <NotificationStats refreshKey={refreshKey} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationTrayComponent;
