import DataPage from '@/components/config/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';
import "../../../app/globals.css";

const ConfigTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
        <DataPage />
      </main>
    </AuthProvider>
  );
};

export default ConfigTablePage;