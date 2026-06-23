import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { getAvatarUrl } from '@/utils/avatar';
import { getAll as getCourses } from '@/api/course';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import ProfileParticipantSection from '@/components/profile/ProfileParticipantSection';
import { AvatarGalleryModal } from '@/components/profile/AvatarGalleryModal';
import { BuildingIcon, BookOpenIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const userFromStorage = useMemo(() => JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {}, []);
  const [user, setUser] = useState<any>(userFromStorage);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/layout');
      return;
    }
    setUser(userFromStorage);

    // Cargar cursos de la institución del usuario
    const companyId = userFromStorage?.company?._id;
    if (companyId) {
      setLoadingCourses(true);
      getCourses(1, 50, companyId)
        .then((res) => setCourses(res.data || []))
        .catch(() => setCourses([]))
        .finally(() => setLoadingCourses(false));
    } else {
      setLoadingCourses(false);
    }
  }, [router, token, userFromStorage]);

  const roleName = user?.role?.name ?? user?.roleName ?? '-';
  const company = user?.company ?? {};
  const companyName = company?.name ?? user?.companyName ?? '-';
  const companyNit = company?.nit ?? '-';
  const companyEmail = company?.email ?? '-';
  const companyPhone = company?.phoneNumber ?? '-';
  const documentNumber = user?.documentNumber ?? user?.document ?? '-';

  const handleRefreshUser = () => {
    const refreshed = JSON.parse(getSafeKeyObjectFromStorage('user') ?? '{}');
    setUser(refreshed);
  };

  const handleAvatarChange = (newAvatar: string) => {
    // Actualizar localStorage con el nuevo avatar
    try {
      const current = JSON.parse(getSafeKeyObjectFromStorage('user') || '{}');
      current.avatar = newAvatar;
      localStorage.setItem('user', JSON.stringify(current));
      setUser((prev: any) => ({ ...prev, avatar: newAvatar }));
    } catch { }
  };

  return (
    <div className="w-full h-full px-4">
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-3xl font-bold tracking-tight">Perfil</h2>
        <EditProfileModal user={user} onUpdate={handleRefreshUser} />
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6 lg:grid-cols-3">
        <Card className="col-span-1 bg-white rounded-md">
          <CardHeader>
            <CardTitle>Usuario en sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getAvatarUrl(user?.avatar)} alt="avatarUser" />
                  <AvatarFallback>{user?.username?.slice?.(0, 2) ?? 'U'}</AvatarFallback>
                </Avatar>
                <AvatarGalleryModal user={user} onAvatarChange={handleAvatarChange}>
                  <button
                    className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 hover:bg-blue-600 transition-colors shadow-sm"
                    title="Cambiar avatar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </AvatarGalleryModal>
              </div>
              <div className="flex flex-col">
                <div className="text-base font-semibold">{user?.name ?? '-'}</div>
                <div className="text-sm text-muted-foreground">{user?.email ?? '-'}</div>
                <div className="text-sm text-muted-foreground">Usuario: {user?.username ?? '-'}</div>
              </div>
            </div>
            <div className="mt-3">
              <AvatarGalleryModal user={user} onAvatarChange={handleAvatarChange}>
                <span className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer hover:underline">
                  Administrar avatares →
                </span>
              </AvatarGalleryModal>
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
                <span className="text-sm text-muted-foreground">ID Usuario</span>
                <span className="text-sm font-medium text-gray-600">{user?._id?.slice?.(-8) ?? '-'}</span>
              </div>
            </div>

            {/* Institución */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <BuildingIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Institución</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium">{companyName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">NIT</span>
                  <span className="text-sm font-medium">{companyNit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{companyEmail}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Teléfono</span>
                  <span className="text-sm font-medium">{companyPhone}</span>
                </div>
              </div>
            </div>

            {/* Cursos */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpenIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Cursos relacionados</span>
              </div>
              {loadingCourses ? (
                <div className="text-sm text-gray-400">Cargando cursos...</div>
              ) : courses.length === 0 ? (
                <div className="text-sm text-gray-400">Sin cursos asociados</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {courses.map((course: any) => (
                    <div key={course._id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <BookOpenIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{course.name || course.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileParticipantSection userId={user?._id} />
    </div>
  );
};

export default Profile;
