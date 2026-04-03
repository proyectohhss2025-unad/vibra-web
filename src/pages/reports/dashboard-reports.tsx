import AuthProvider from '@/services/auth-provider';
//import DashboardReports from '@/components/reports/dashboard-reports';

const HomeDashboardPage = () => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-between p-2 mb-14">
        {/*<DashboardReports />*/}
      </div>
    </AuthProvider>
  );
};

export default HomeDashboardPage;   