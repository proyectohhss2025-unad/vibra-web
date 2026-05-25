import DataPage from '@/components/config/data-page';
import AuthProvider from '@/services/auth-provider';
import RequirePagePermission from '@/components/auth/require-page-permission';
import React from 'react';
import "../../../app/globals.css";

const ConfigTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <RequirePagePermission requiredSerial="11">
        <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
          <DataPage />
        </main>
      </RequirePagePermission>
    </AuthProvider>
  );
};

export default ConfigTablePage;