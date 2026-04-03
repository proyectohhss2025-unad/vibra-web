import UserDataPage from '@/components/user/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';

const UserTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-2 mb-14">
        <UserDataPage />
      </main>
    </AuthProvider>
  );
};

export default UserTablePage;