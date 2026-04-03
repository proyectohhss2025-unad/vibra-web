'use client'

import PermissionTemplateDataPage from '@/components/permissionTemplate/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';

const PermissionTemplateTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0 mb-14" >
        <PermissionTemplateDataPage />
      </main>
    </AuthProvider>
  );
};

export default PermissionTemplateTablePage;