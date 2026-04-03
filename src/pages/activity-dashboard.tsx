import DataPage from '@/components/activity/data-page';
import AuthProvider from '@/services/auth-provider';
import "../../app/globals.css";

const ActivityList = () => {
    return (
        <AuthProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-14">
                <DataPage />
            </main>
        </AuthProvider>
    );
};

export default ActivityList;