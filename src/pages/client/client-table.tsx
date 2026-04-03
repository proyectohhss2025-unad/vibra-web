import DataPage from '@/components/participant/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';

const ParticipantTablePage: React.FC = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-2 mb-14" >
        <DataPage />
      </main>
    </AuthProvider>
  );
};

export default ParticipantTablePage;