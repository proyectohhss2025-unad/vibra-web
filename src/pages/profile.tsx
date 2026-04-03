import ProfileComponent from '@/components/general-dashboard/profile';
import AuthProvider from '@/services/auth-provider';

const ProfilePage = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-0">
        <div className="w-full">
          <ProfileComponent />
        </div>
      </main>
    </AuthProvider>
  );
};

export default ProfilePage;
