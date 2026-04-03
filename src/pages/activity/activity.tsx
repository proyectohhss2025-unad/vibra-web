import ActivityComponent from '@/components/activity/activity';
import AuthProvider from '@/services/auth-provider';
import React from 'react';
import "../../../app/globals.css";

const ActivityPage: React.FC = () => {
    return (
        <AuthProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
                <ActivityComponent />
            </main>
        </AuthProvider>
    );
};

export default ActivityPage;