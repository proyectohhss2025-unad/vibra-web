import ActivityDataPage from '@/components/activity/data-page';
import AuthProvider from '@/services/auth-provider';
import RequirePagePermission from '@/components/auth/require-page-permission';
import React from 'react';
import "../../../app/globals.css";

const ActivityTablePage: React.FC = () => {
    return (
        <AuthProvider>
            <RequirePagePermission requiredSerial="PERM-0007">
                <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
                    <ActivityDataPage />
                </main>
            </RequirePagePermission>
        </AuthProvider>
    );
};

export default ActivityTablePage;