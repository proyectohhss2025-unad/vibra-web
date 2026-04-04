'use client'

import { getAll, getCountAllNotifications, getCountAllNotificationsByDay, getUnreadCount, markAsRead } from '../api/notification';
import { RoleGuard } from '../components/auth/role-guard';
import { User } from '../models/user.entity';
import { Badge } from '../registry/new-york/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../registry/new-york/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../registry/new-york/ui/tabs';
import { AuthContext } from '../services/auth';
import { getSafeKeyObjectFromStorage } from '../utils/safe-token-storage';
import { BellIcon, CheckCheckIcon, CheckIcon, Inbox, Mail, RefreshCw, Star } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import Notifications from './notification/notifications';

/**
 * Stats panel shown alongside the notification list
 */
const NotificationStats: React.FC = () => {
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
    }, []);

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
        <RoleGuard>
            <div className="flex-col md:flex w-full mx-2">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-3xl font-bold tracking-tight ml-1">Centro de Notificaciones</h2>
                    <button
                        onClick={() => { fetchUnreadCount(); setRefreshKey(k => k + 1); }}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                    >
                        <RefreshCw className="h-4 w-4" /> Actualizar
                    </button>
                </div>

                <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-12">
                    {/* ── Panel principal ── */}
                    <Card className="col-span-8 bg-white rounded-md">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className='text-xl font-bold flex items-center gap-2'>
                                    Notificaciones
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-1">
                                            <CheckIcon className="h-3 w-3 mr-1" /> {unreadCount} sin leer
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {unreadCount > 0
                                        ? <span>Tienes <strong>{unreadCount}</strong> sin leer</span>
                                        : <span>Todo al día</span>}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="all" className="w-full" key={refreshKey}>
                                <TabsList className="grid w-full h-14 grid-cols-3 p-3 bg-gray-100 rounded-xl shadow-md">
                                    <TabsTrigger value="all"
                                        className="text-base font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:bg-white data-[state=active]:text-primary flex items-center gap-2">
                                        <Inbox className="w-4 h-4" /> Todas
                                    </TabsTrigger>
                                    <TabsTrigger value="unread"
                                        className="text-base font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:bg-white data-[state=active]:text-primary flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Sin leer
                                    </TabsTrigger>
                                    <TabsTrigger value="important"
                                        className="text-base font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:bg-white data-[state=active]:text-primary flex items-center gap-2">
                                        <Star className="w-4 h-4" /> Importantes
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="all" className="mt-4">
                                    <Notifications filter="all" limit={20} />
                                </TabsContent>
                                <TabsContent value="unread" className="mt-4">
                                    <Notifications filter="unread" limit={20} />
                                </TabsContent>
                                <TabsContent value="important" className="mt-4">
                                    <Notifications filter="important" limit={20} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* ── Panel de estadísticas ── */}
                    <Card className="col-span-4 bg-white rounded-md">
                        <CardHeader>
                            <CardTitle className='text-xl font-bold'>Estadísticas</CardTitle>
                            <CardDescription>Resumen de notificaciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationStats />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
};

export default NotificationTrayComponent;
