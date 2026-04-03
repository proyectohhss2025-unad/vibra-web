import HomeDashboardComponent from '@/components/home-dashboard';
import AuthProvider from '@/services/auth-provider';

const HomeDashboardPage = () => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-between p-0">
        <HomeDashboardComponent />
      </div>
    </AuthProvider>
  );
};

export default HomeDashboardPage;   