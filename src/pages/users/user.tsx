import UserComponent from '@/components/user/user';
import AuthProvider from '@/services/auth-provider';

const UserPage = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-2 mb-14">
        <UserComponent />
      </main>
    </AuthProvider>
  );
};

export default UserPage;