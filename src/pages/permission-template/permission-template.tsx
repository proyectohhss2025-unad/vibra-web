import PermissionTemplateComponent from '@/components/permissionTemplate/permission-template';
import AuthProvider from '@/services/auth-provider';

const PermissionTemplatePage = () => {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 pt-0">
        <PermissionTemplateComponent />
      </main>
    </AuthProvider>
  );
};

export default PermissionTemplatePage;