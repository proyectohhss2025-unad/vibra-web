import { getAll, markAsRead } from "@/api/notification";
import { FORMAT_DATE_MEDIUM } from "@/utils/constants";
import { formatDate } from "@/utils/dates";
import { BellIcon } from "@radix-ui/react-icons";
import { CheckCheckIcon, StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationsProps {
    filter?: 'all' | 'unread' | 'important';
    limit?: number;
}

const Notifications: React.FC<NotificationsProps> = ({ filter = 'all', limit = 10 }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response: any = await getAll(1, limit);
            if (response) {
                let data: any[] = Array.isArray(response?.notifications) ? response.notifications : [];

                /*if (filter === 'unread') {
                    data = data.filter((n: any) => !n.isRead);
                } else if (filter === 'important') {
                    data = data.filter((n: any) => n.isImportant || n.notificationType === 'important');
                }*/
            
                //setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [/*filter, limit*/]);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                Cargando notificaciones...
            </div>
        );
    }

    if (!notifications.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <BellIcon className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">No hay notificaciones</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {notifications.map((notification: any, index: number) => (
                <div
                    key={notification._id ?? index}
                    className={`flex items-start space-x-3 rounded-md p-3 transition-all hover:bg-blue-50 border-b last:border-0 ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}
                >
                    <div className="mt-0.5 flex-shrink-0">
                        <BellIcon className={`h-5 w-5 ${!notification.isRead ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                {formatDate(notification.createdAt, FORMAT_DATE_MEDIUM)}
                            </span>
                        </div>
                        {notification.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                        )}
                        {notification.notificationType && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {notification.notificationType}
                            </span>
                        )}
                    </div>
                    {!notification.isRead && (
                        <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            title="Marcar como leído"
                            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            <CheckCheckIcon className="h-4 w-4" />
                        </button>
                    )}
                    {notification.isImportant && (
                        <StarIcon className="flex-shrink-0 h-4 w-4 text-yellow-400 fill-yellow-400 mt-0.5" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Notifications;
