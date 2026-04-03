import NotificationTray from '@/components/notification-tray';
import AuthProvider from '@/services/auth-provider';

const NotificationTrayPage = () => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-between p-6">
        <NotificationTray />
      </div>
    </AuthProvider>
  );
};

export default NotificationTrayPage;   