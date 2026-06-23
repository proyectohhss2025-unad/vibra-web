'use client'

import RoleDataPage from '@/components/role/data-page';
import AuthProvider from '@/services/auth-provider';
import RequirePagePermission from '@/components/auth/require-page-permission';
import React from 'react';

const RoleTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <RequirePagePermission requiredSerial="PERM-0001">
        <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0 mb-14" >
          <RoleDataPage />
        </main>
      </RequirePagePermission>
    </AuthProvider>
  );
};

export default RoleTablePage;