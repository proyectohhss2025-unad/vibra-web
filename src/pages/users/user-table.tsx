import UserDataPage from '@/components/user/data-page';
import AuthProvider from '@/services/auth-provider';
import RequirePagePermission from '@/components/auth/require-page-permission';
import React from 'react';

const UserTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <RequirePagePermission requiredSerial="9">
        <main className="flex min-h-screen flex-col items-center justify-between p-2 mb-14">
          <UserDataPage />
        </main>
      </RequirePagePermission>
    </AuthProvider>
  );
};

export default UserTablePage;