import EmotionComponent from '@/components/emotion/emotion';
import AuthProvider from '@/services/auth-provider';
import React from 'react';
import "../../../app/globals.css";

const EmotionPage: React.FC = () => {
    return (
        <AuthProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
                <EmotionComponent />
            </main>
        </AuthProvider>
    );
};

export default EmotionPage;