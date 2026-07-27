import CronJobComponent from '@/components/cron-job/cron-job';
import AuthProvider from '@/services/auth-provider';
import React from 'react';
import "../../../app/globals.css";

const CronJobPage: React.FC = () => {
    return (
        <AuthProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
                <CronJobComponent />
            </main>
        </AuthProvider>
    );
};

export default CronJobPage;
