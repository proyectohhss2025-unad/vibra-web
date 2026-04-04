'use client'

import { auditLogAction } from '../../api/log';
import { User } from '../../models/user.entity';
import { RolUsuario } from '../../models/role.entity';
import { Button } from '../../registry/new-york/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../registry/new-york/ui/card';
import { AuthContext } from '../../services/auth';
import { getSafeKeyObjectFromStorage } from '../../utils/safe-token-storage';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo, useState } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: RolUsuario | string;
  /** If string => redirect path, if false => show inline 403 card. Default: '/forbidden' */
  redirectTo?: string | false;
}

/**
 * RoleGuard component that protects children and only renders them
 * if the current user has the required role. Otherwise, it redirects
 * to a forbidden page or shows an inline 403 card.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole = RolUsuario.ADMIN,
  redirectTo = '/forbidden',
}) => {
  const router = useRouter();
  const { token, user, user_ } = useContext(AuthContext);
  const [isClient, setIsClient] = useState(false);
  const [loggedDenial, setLoggedDenial] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentUser: User | null = useMemo(() => {
    const ctxUser = (user_ as User) ?? (user as User);
    if (ctxUser && typeof ctxUser === 'object') return ctxUser;
    try {
      const stored = JSON.parse(getSafeKeyObjectFromStorage('user') || 'null');
      return stored as User | null;
    } catch {
      return null;
    }
  }, [user_, user]);

  const hasRequiredRole = useMemo(() => {
    if (!currentUser) return false;
    const roleValue = typeof requiredRole === 'string' ? requiredRole : String(requiredRole);
    return String(currentUser.role) === roleValue || (requiredRole === RolUsuario.ADMIN /*&& currentUser.role === RolUsuario.ADMIN*/);
  }, [currentUser, requiredRole]);

  // If no token or user, route to login
  useEffect(() => {
    if (isClient && (!token || !currentUser?.userId)) {
      router.push('/layout');
    }
  }, [isClient, token, currentUser, router]);

  // Optional audit log: register access denied events once
  useEffect(() => {
    const logDeniedAccess = async () => {
      if (!isClient || loggedDenial || hasRequiredRole || !currentUser?.userId) return;
      try {
        const roleValue = typeof requiredRole === 'string' ? requiredRole : String(requiredRole);
        const path = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
        await auditLogAction(
          String(currentUser.userId || '0'),
          'ACCESO_DENEGADO',
          path,
          `Rol requerido: ${roleValue} | Rol usuario: ${currentUser.role}`,
          '0.0.0.0'
        );
      } catch (e) {
        // Silently ignore logging errors to avoid blocking UX
      } finally {
        setLoggedDenial(true);
      }
    };
    logDeniedAccess();
  }, [isClient, loggedDenial, hasRequiredRole, currentUser, requiredRole]);

  if (!isClient) return null;

  if (!hasRequiredRole) {
    if (typeof redirectTo === 'string' && redirectTo.length > 0) {
      router.push(redirectTo);
      return null;
    }
    // Inline 403 card when redirectTo === false
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Acceso denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              No tienes permisos suficientes para acceder a esta sección. Este contenido está restringido para usuarios con rol Administrador.
            </p>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/layout')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;