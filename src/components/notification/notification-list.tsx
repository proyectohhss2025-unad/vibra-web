import { getAllNotifications, markAsRead } from '@/api/notification';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { DotsVerticalIcon, ViewGridAddIcon } from '@heroicons/react/solid';
import { BellIcon } from '@radix-ui/react-icons';
import { CheckCheckIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Badge } from '../ui/badge';

const NotificationListItem: React.FC<any> = ({ notification, setNotifications, colorIcon }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const c = twMerge('flex cursor-pointer items-center py-2', notification?.serial % 2 === 0 ? 'bg-gray-100' : 'bg-white');

  const handleMaskAsRead = async () => {
    await markAsRead(notification?._id);
    setNotifications([]);
  }

  const handleLinkToActivity = async () => {
    router.push(`/activity/activity?_id=${notification?.ID}&origin=notificationTray`);
  }

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className='rounded-md bg-white'
      onMouseLeave={handleMouseLeave}>
      <div className="mx-0 flex items-start space-x-4 rounded-md p-1 transition-all hover:bg-accent hover:text-accent-foreground" >
        <BellIcon className="mt-2 min-h-5 min-w-5" />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {notification.message}
          </p>
        </div>
        <div className={`w-4 h-full rounded-md mr-2 cursor-pointer flex items-center`} >
          <DotsVerticalIcon onClick={handleMouseEnter} name="success" className="h-9 w-7 text-gray-400 hover:text-gray-500" />
        </div>
      </div>
      {showTooltip && (
        <div className="relative z-10 bg-white rounded-md shadow-md px-1 py-1">
          <ul className="space-y-1">
            <li className='flex items-center justify-center'>
              <div className="relative w-full flex items-center mt-1 ml-0 pl-0 pb-0">
                <div className="min-pl absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4 mt-1">
                  <CheckCheckIcon style={{ marginTop: '-6px' }} name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
                </div>
                <button
                  type="button"
                  onClick={handleMaskAsRead}
                  className={`bg-blue-400 w-full hover:bg-blue-600 rounded-md px-2 py-2 pl-8 text-xs text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                >
                  {'Leído'}
                </button>
              </div>
              <div className="relative w-full flex items-center mt-1 ml-2 pl-0 pb-0">
                <div className="min-pl absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4 mt-1">
                  <ViewGridAddIcon style={{ marginTop: '-6px' }} name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
                </div>
                <button
                  type="button"
                  onClick={handleLinkToActivity}
                  className={`bg-blue-400 w-full hover:bg-blue-600 rounded-md px-2 py-2 pl-8 text-xs text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                >
                  {getSafeKeyFromStorage('View activity')}
                </button>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

interface NotificationProps {
  title?: string;
  colorIcon: string;
}

const NotificationList: React.FC<NotificationProps> = ({ title = 'Próximas a vencer', colorIcon }) => {
  const [notifications, setNotifications] = useState<any>([]);
  const [count, setCount] = useState<number>();

  useEffect((): any => {
    const fetchData = async () => {

      const { notifications, length } = await getAllNotifications(1, 200, title);
      console.log('notifications:', notifications);
      setNotifications(notifications);
      setCount(length);
    }
    fetchData();
  }, []);

  return (<div className='border-2 border-white rounded-lg mt-2 bg-white'>
    <div className="relative p-2 flex justify-between items-center text-md font-semibold ml-2">{title}
      <Badge variant="destructive">
        {count}</Badge>
    </div>
    <div className='scrollbar-div' style={{ height: "50vh", overflowY: "auto" }}>
      <ul className="list-none p-3">
        {notifications?.length == 0 && <div className='relative flex items-center text-xs p-2'>
          <BellIcon name="previewActivity" className="h-6 w-8 text-green-500" />  No se encontraron participaciones</div>}
        {notifications.map((notification: any) => (
          <NotificationListItem key={notification._id} notification={notification} setNotifications={setNotifications} colorIcon={colorIcon} />
        ))}
      </ul>
    </div>
  </div>);
};

export default NotificationList;