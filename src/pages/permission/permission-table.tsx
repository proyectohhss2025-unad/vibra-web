'use client'

import PermissionDataPage from '@/components/permission/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';

const PermissionTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0 mb-14" >
        <PermissionDataPage />
      </main>
    </AuthProvider>
  );
};

export default PermissionTablePage;