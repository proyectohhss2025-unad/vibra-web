import BlockedIpsDataPage from '@/components/blocked-ips/blocked-ips-data-page';
import AuthProvider from '@/services/auth-provider';
import RequirePagePermission from '@/components/auth/require-page-permission';
import React from 'react';
import "../../../app/globals.css";

const BlockedIpsTablePage: React.FC = () => {
    return (
        <AuthProvider>
            <RequirePagePermission requiredSerial="PERM-0041">
                <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
                    <BlockedIpsDataPage />
                </main>
            </RequirePagePermission>
        </AuthProvider>
    );
};

export default BlockedIpsTablePage;
