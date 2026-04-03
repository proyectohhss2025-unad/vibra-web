'use client'

import { getCountAllNotificationsByDay } from '@/api/notification';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { items } from './layouts/sidebar/sidebar-option';
import Notifications from './notification/notifications';
import CurrentDateTime from './utils/current-datetime';

const NotificationTrayComponent = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [totalNotificationsToday, setTotalNotificationsToday] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const menuItems_: any[] = [];
        items.forEach((item: any) => {
            if (item.children?.length > 0) {
                item.children?.forEach((children: any) => {
                    menuItems_.push({
                        id: children._id,
                        name: children.label,
                        icon: children.icon,
                        handler: children.href,
                        description: children.description,
                        withLabel: children.label === "Notifications" || children.label === "Participants" || children.label === "Usuarios" ? true : false,
                        valueLabel: children.label === "Notifications" ? totalNotificationsToday + '' : children.label === "Participants" ? '0' + '' : children.label === "Usuarios" ? '0' + '' : '0'
                    });
                });
            }
        });
        setMenuItems(menuItems_);
    }, []);

    useEffect(() => {
        getCountAllNotificationsByDay()
            .then(data => setTotalNotificationsToday(data?.countNotifications));
    }, []);

    useEffect(() => {
        if (!user_?._id || !token) {
            router.push('/layout');
        }
    }, [user_, token]);

    return (
            <div className="hidden flex-col md:flex w-full mx-2">
                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
                    <div className="flex items-center sm:col-span-6">
                        <h2 className="text-3xl font-bold tracking-tight pb-3 ml-4">{getSafeKeyFromStorage("Notifications")}</h2>
                    </div>
                    <div className="flex items-center justify-end sm:col-span-6">
                        <Card className="col-span-12 bg-white rounded-md px-2 pl-2 mb-3 pb-1">
                            <CurrentDateTime />
                        </Card>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-10">
                    <Card className="col-span-2 bg-white rounded-md">
                        <CardHeader>
                            <CardTitle className='text-xl font-bold'>Ultimas notificaciones</CardTitle>
                            <CardDescription>
                                Se encuentran <strong>{totalNotificationsToday}</strong> nuevas notificaciones hoy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Notifications />
                        </CardContent>
                    </Card>
                </div>
            </div>
    );
};

export default NotificationTrayComponent;