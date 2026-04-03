import RoleComponent from '@/components/role/role';
import AuthProvider from '@/services/auth-provider';

const RolePage = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0">
        <RoleComponent />
      </main>
    </AuthProvider>
  );
};

export default RolePage;