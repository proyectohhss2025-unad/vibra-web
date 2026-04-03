import DataPageCompany from '@/components/company/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';

const CompanyTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0 mb-14" >
        <DataPageCompany />
      </main>
    </AuthProvider>
  );
};

export default CompanyTablePage;