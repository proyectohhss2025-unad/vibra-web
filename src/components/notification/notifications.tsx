import { getAll, markAsRead } from "@/api/notification";
import { FORMAT_DATE_MEDIUM } from "@/utils/constants";
import { formatDate } from "@/utils/dates";
import { BellIcon } from "@radix-ui/react-icons";
import { CheckCheckIcon, ChevronLeftIcon, ChevronRightIcon, Eye, StarIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface NotificationsProps {
    filter?: 'all' | 'unread' | 'important';
    limit?: number;
    refreshKey?: number;
}

const Notifications: React.FC<NotificationsProps> = ({ filter = 'all', limit = 10, refreshKey = 0 }) => {
    const [allNotifications, setAllNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [detailNotif, setDetailNotif] = useState<any | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response: any = await getAll(1, 500);
            if (response) {
                let data: any[] = Array.isArray(response?.notifications) ? response.notifications : [];

                if (filter === 'unread') {
                    data = data.filter((n: any) => !n.isRead);
                } else if (filter === 'important') {
                    data = data.filter((n: any) => n.isImportant || n.notificationType === 'important' || n.notificationType?.title === 'important');
                }

                setAllNotifications(data);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter, limit, refreshKey]);

    // Filtro local por texto
    const filteredNotifications = useMemo(() => {
        if (!searchText.trim()) return allNotifications;
        const q = searchText.toLowerCase();
        return allNotifications.filter(n =>
            (n.title?.toLowerCase() || '').includes(q) ||
            (n.message?.toLowerCase() || '').includes(q) ||
            (typeof n.notificationType === 'object' ? (n.notificationType?.title || '') : (n.notificationType || '')).toLowerCase().includes(q)
        );
    }, [allNotifications, searchText]);

    // Paginación local
    const totalPages = Math.ceil(filteredNotifications.length / limit);
    const notifications = filteredNotifications.slice((currentPage - 1) * limit, currentPage * limit);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                Cargando notificaciones...
            </div>
        );
    }

    if (!allNotifications.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <BellIcon className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">No hay notificaciones</p>
            </div>
        );
    }

    return (
        <div>
            {/* Buscador */}
            <div className="mb-3">
                <input
                    type="text"
                    value={searchText}
                    onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar notificaciones por título o mensaje..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-1">
                {notifications.length === 0 && searchText ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No se encontraron notificaciones con ese criterio</div>
                ) : (
                    notifications.map((notification: any, index: number) => (
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
                                {typeof notification.notificationType === 'object'
                                    ? notification.notificationType.title || notification.notificationType.name || 'Tipo'
                                    : notification.notificationType}
                            </span>
                        )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => setDetailNotif(notification)}
                                    title="Ver detalle"
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification._id)}
                                        title="Marcar como leído"
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <CheckCheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                                {notification.isImportant && (
                                    <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-500">
                        Página {currentPage} de {totalPages} ({allNotifications.length} notificaciones)
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="w-3.5 h-3.5" /> Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    page === currentPage
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Siguiente <ChevronRightIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de detalle */}
            {detailNotif && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailNotif(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Detalle de notificación</h3>
                                <button onClick={() => setDetailNotif(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Título</p>
                                    <p className="text-sm font-medium text-gray-900">{detailNotif.title || '-'}</p>
                                </div>
                                {detailNotif.message && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Mensaje</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detailNotif.message}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo</p>
                                        <p className="text-sm text-gray-900">
                                            {typeof detailNotif.notificationType === 'object'
                                                ? detailNotif.notificationType.title || detailNotif.notificationType.name || '-'
                                                : detailNotif.notificationType || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                                        <p className="text-sm text-gray-900">{detailNotif.isRead ? 'Leído' : 'Sin leer'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha</p>
                                    <p className="text-sm text-gray-900">
                                        {detailNotif.createdAt
                                            ? new Date(detailNotif.createdAt).toLocaleString('es-CO', {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })
                                            : '-'}
                                    </p>
                                </div>
                                {detailNotif.isImportant && (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                        <StarIcon className="h-3.5 w-3.5 fill-yellow-500" /> Importante
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => setDetailNotif(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cerrar
                                </button>
                                {!detailNotif.isRead && (
                                    <button
                                        onClick={() => { handleMarkAsRead(detailNotif._id); setDetailNotif(null); }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Marcar como leído
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
