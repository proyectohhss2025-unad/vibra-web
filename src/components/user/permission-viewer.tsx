'use client';

import { getMyPermissions } from '@/api/permission';
import { AuthContext, ResolvedPermissions } from '@/services/auth';
import { ShieldCheckIcon, UserIcon, KeyIcon } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';

interface PermissionViewerProps {
  /** Si se pasa, muestra permisos de ese userId. Si no, usa el usuario autenticado */
  userId?: string;
}

/**
 * Panel que muestra los permisos resueltos de un usuario:
 * - Rol asignado y su template
 * - Permisos heredados del rol
 * - Resumen de seriales
 */
const PermissionViewer: React.FC<PermissionViewerProps> = ({ userId }) => {
  const { resolvedPermissions: contextPermissions } = useContext(AuthContext);
  const [permissions, setPermissions] = useState<ResolvedPermissions | null>(
    userId ? null : contextPermissions,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Si se pasa un userId específico, cargar sus permisos
  useEffect(() => {
    if (!userId) {
      setPermissions(contextPermissions);
      return;
    }
    // Para otros usuarios, idealmente habría un endpoint
    // GET /api/auth/user-permissions/:userId. Por ahora, mostramos
    // que esta funcionalidad requiere endpoint dedicado.
    setIsLoading(true);
    // TODO: endpoint específico para permisos de otro usuario
    setIsLoading(false);
  }, [userId, contextPermissions]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        Cargando permisos...
      </div>
    );
  }

  if (!permissions) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        No hay información de permisos disponible.
      </div>
    );
  }

  const filteredPermissions = search.trim()
    ? permissions.permissions.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.serial?.toLowerCase().includes(search.toLowerCase()),
      )
    : permissions.permissions;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <ShieldCheckIcon className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">SuperAdmin</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {permissions.isSuperAdmin ? 'Sí' : 'No'}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <UserIcon className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Rol</span>
          </div>
          <p className="text-lg font-bold text-green-900 truncate">
            {permissions.role?.name || 'Sin rol'}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-700 mb-1">
            <KeyIcon className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Permisos</span>
          </div>
          <p className="text-lg font-bold text-purple-900">
            {permissions.permissions.length}
          </p>
        </div>
      </div>

      {/* Buscador de permisos */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar permisos por nombre o serial..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de permisos */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-72 overflow-y-auto">
        {filteredPermissions.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">
            {search ? 'Sin resultados' : 'No tiene permisos asignados'}
          </div>
        ) : (
          filteredPermissions.map((perm) => (
            <div
              key={perm._id}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {perm.name}
                </div>
                <div className="text-xs text-gray-500">
                  Serial: {perm.serial}
                  {perm.description && ` · ${perm.description}`}
                </div>
              </div>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {perm.serial}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Seriales planos (para debugging) */}
      <details className="text-xs text-gray-400">
        <summary className="cursor-pointer hover:text-gray-600">
          Ver seriales ({permissions.serials.length})
        </summary>
        <div className="mt-1 flex flex-wrap gap-1">
          {permissions.serials.map((s) => (
            <span
              key={s}
              className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
};

export default PermissionViewer;
