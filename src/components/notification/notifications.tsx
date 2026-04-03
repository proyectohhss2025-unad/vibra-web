import { getAll } from "@/api/notification";
import { FORMAT_DATE_MEDIUM } from "@/utils/constants";
import { formatDate } from "@/utils/dates";
import { BellIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<any>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: any = await getAll(1, 6);
                setNotifications(response.notifications);
            } catch (error) {
                console.error("Error fetching due alerts:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {notifications?.map((notification: any, index: number) => (
                <div key={index+1} className="mx-0 ml-3 bg-blue-100 flex items-start space-x-2 rounded-md p-2 mt-1 transition-all hover:bg-accent hover:text-accent-foreground">
                    <div className="space-y-1 w-full">
                        <p className="text-sm justify-between font-medium leading-none">
                            <div className="flex items-center justify-between">
                                <p className="flex items-center"><BellIcon className="min-h-5 min-w-5 mr-1 text-blue-600" /> {notification.title}</p>
                                <p className="flex justify-end items-center text-xs font-normal">{formatDate(notification.createdAt, FORMAT_DATE_MEDIUM)}</p>
                            </div>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {notification.message}
                        </p>
                    </div>
                </div>
            ))}
        </>
    )
}

export default Notifications;