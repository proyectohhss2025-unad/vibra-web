import CronJobDataPage from '@/components/cron-job/data-page';
import AuthProvider from '@/services/auth-provider';
import React from 'react';
import "../../../app/globals.css";

const CronJobTablePage: React.FC = () => {
    return (
        <AuthProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
                <CronJobDataPage />
            </main>
        </AuthProvider>
    );
};

export default CronJobTablePage;
