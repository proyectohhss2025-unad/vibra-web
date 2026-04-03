import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo, useState } from 'react';

const Profile: React.FC = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const userFromStorage = useMemo(() => JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {}, []);
  const [user, setUser] = useState<any>(userFromStorage);

  useEffect(() => {
    if (!token) {
      router.push('/layout');
      return;
    }
    setUser(userFromStorage);
  }, [router, token, userFromStorage]);

  const roleName = user?.role?.name ?? user?.roleName ?? '-';
  const companyName = user?.company?.name ?? user?.companyName ?? '-';
  const documentNumber = user?.documentNumber ?? user?.document ?? '-';

  return (
    <div className="w-full h-full px-4">
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-3xl font-bold tracking-tight">Perfil</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6 lg:grid-cols-3">
        <Card className="col-span-1 bg-white rounded-md">
          <CardHeader>
            <CardTitle>Usuario en sesión</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/avatars/${user?.avatar}`} alt="avatarUser" />
              <AvatarFallback>{user?.username?.slice?.(0, 2) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="text-base font-semibold">{user?.name ?? '-'}</div>
              <div className="text-sm text-muted-foreground">{user?.email ?? '-'}</div>
              <div className="text-sm text-muted-foreground">Usuario: {user?.username ?? '-'}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-white rounded-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Documento</span>
                <span className="text-sm font-medium">{documentNumber}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Rol</span>
                <span className="text-sm font-medium">{roleName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Compañía</span>
                <span className="text-sm font-medium">{companyName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">ID</span>
                <span className="text-sm font-medium">{user?._id ?? '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
