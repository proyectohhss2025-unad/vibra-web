import Homologate from '@/components/forms/homologate';
import AuthProvider from '@/services/auth-provider';

const Dashboard = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-6">
        <Homologate />
      </main>
    </AuthProvider>
  );
};

export default Dashboard;   