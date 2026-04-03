import ConfigComponent from '@/components/config/config';
import AuthProvider from '@/services/auth-provider';
import "../../../app/globals.css";

const Config = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
        <ConfigComponent />
      </main>
    </AuthProvider>
  );
};

export default Config;