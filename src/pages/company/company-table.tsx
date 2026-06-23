import DataPageCompany from '@/components/company/data-page';
import AuthProvider from '@/services/auth-provider';
import RequirePagePermission from '@/components/auth/require-page-permission';
import React from 'react';

const CompanyTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <RequirePagePermission requiredSerial="PERM-0039">
        <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0 mb-14" >
          <DataPageCompany />
        </main>
      </RequirePagePermission>
    </AuthProvider>
  );
};

export default CompanyTablePage;