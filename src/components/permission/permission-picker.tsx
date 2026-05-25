'use client';

import { getAllPermissions } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { SearchIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface PermissionPickerProps {
  /** IDs de permisos actualmente seleccionados */
  selectedIds: string[];
  /** Callback cuando cambia la selección */
  onChange: (ids: string[]) => void;
  /** Label del componente */
  label?: string;
}

/**
 * Componente reutilizable para seleccionar permisos con búsqueda
 * y agrupación visual. Muestra checkboxes con nombre y serial.
 */
const PermissionPicker: React.FC<PermissionPickerProps> = ({
  selectedIds,
  onChange,
  label = 'Permisos',
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAllPermissions(1, 200)
      .then((res: any) => {
        const list = res?.data || res?.items || res || [];
        setPermissions(Array.isArray(list) ? list : []);
      })
      .catch(() => setPermissions([]))
      .finally(() => setIsLoading(false));
  }, []);

  const togglePermission = (permId: string) => {
    if (selectedIds.includes(permId)) {
      onChange(selectedIds.filter((id) => id !== permId));
    } else {
      onChange([...selectedIds, permId]);
    }
  };

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return permissions;
    const q = search.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.serial?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [permissions, search]);

  // Agrupar por categoría
  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of filteredPermissions) {
      const cat = (p.permissionCategory as any)?.name || 'Sin categoría';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPermissions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {label}{' '}
          <span className="text-xs text-gray-400">
            ({selectedIds.length} seleccionados)
          </span>
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar permiso por nombre, serial o descripción..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de permisos */}
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-400">Cargando permisos...</div>
        ) : grouped.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">
            {search ? 'Sin resultados' : 'No hay permisos disponibles'}
          </div>
        ) : (
          grouped.map(([category, perms]) => (
            <div key={category}>
              <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {category}
              </div>
              {perms.map((perm) => (
                <label
                  key={perm._id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(perm._id!)}
                    onChange={() => togglePermission(perm._id!)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {perm.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Serial: {perm.serial}
                      {perm.description && ` · ${perm.description}`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PermissionPicker;
