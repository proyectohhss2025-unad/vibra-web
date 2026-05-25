'use client';

import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

interface RequirePagePermissionProps {
  /**
   * Serial del permiso requerido para acceder a la página.
   * Ej: '16' para Actividades, '8' para Emociones, etc.
   */
  requiredSerial: string;
  children: React.ReactNode;
  /**
   * Componente opcional a mostrar mientras se verifica el permiso.
   */
  fallback?: React.ReactNode;
}

/**
 * Componente que protege una página verificando si el usuario
 * tiene el permiso especificado. Si no tiene acceso, redirige
 * al dashboard principal.
 *
 * @example
 * ```tsx
 * <RequirePagePermission requiredSerial="16">
 *   <ActivityDataPage />
 * </RequirePagePermission>
 * ```
 */
const RequirePagePermission: React.FC<RequirePagePermissionProps> = ({
  requiredSerial,
  children,
  fallback,
}) => {
  const { resolvedPermissions } = useContext(AuthContext);
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Aún no se han cargado los permisos
    if (resolvedPermissions === null) {
      return;
    }

    // SuperAdmin tiene acceso a todo
    if (resolvedPermissions.isSuperAdmin) {
      setHasAccess(true);
      return;
    }

    // Verificar si el serial requerido está en la lista
    const access = resolvedPermissions.serials.includes(requiredSerial);
    setHasAccess(access);

    if (!access) {
      router.replace('/general-dashboard');
    }
  }, [resolvedPermissions, requiredSerial, router]);

  // Mostrar fallback o nada mientras se cargan los permisos
  if (hasAccess === null) {
    return fallback ? <>{fallback}</> : null;
  }

  // No tiene acceso — no renderizar nada (la redirección ya ocurrió)
  if (!hasAccess) {
    return null;
  }

  // Tiene acceso — renderizar hijos
  return <>{children}</>;
};

export default RequirePagePermission;
