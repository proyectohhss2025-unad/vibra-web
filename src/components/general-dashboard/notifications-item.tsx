import { getCountAllNotifications } from "@/api/notification";
import { Badge } from "@/registry/new-york/ui/badge";
import { useTabs } from "@/services/contexts/tabs-context";
import { BellRingIcon } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationTray from "../notification-tray";

export function NotificationsItem() {
  const [totalNotifications, setTotalNotifications] = useState<string | null>(null);
  const { openTab } = useTabs();

  useEffect(() => {
    getCountAllNotifications()
      .then(data => setTotalNotifications(data?.countNotifications));
  }, []);

  return (
    <div>
      <Badge variant="destructive" className='py-1.5 cursor-pointer' onClick={() => {
        openTab(
          `Notificaciones`,
          "Notificaciones",
          <NotificationTray />
        );
      }} >
        <BellRingIcon name="drowndown" style={{ float: 'left' }} className="flex items-center justify-end h-5 w-5 text-white leading-6" />
        {totalNotifications}
      </Badge>
    </div>
  )
}
