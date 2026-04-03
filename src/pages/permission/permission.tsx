import PermissionComponent from '@/components/permission/permission';
import AuthProvider from '@/services/auth-provider';

const PermissionPage = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0">
        <PermissionComponent />
      </main>
    </AuthProvider>
  );
};

export default PermissionPage;