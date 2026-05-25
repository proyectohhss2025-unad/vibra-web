'use client';

import { createPermission, getAllCategories, getPermissionById } from '@/api/permission';
import { PermissionCategory } from '@/models/permissionCategory.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CardSection from '@/components/ui/card-section';
import Loading from '@/components/layouts/loading/loading';
import { SaveIcon, XCircleIcon } from 'lucide-react';

type PermissionFormProps = {
  permissionId?: string;
};

const PermissionForm: React.FC<PermissionFormProps> = ({ permissionId }) => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user') ?? '{}');
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { closeTabWithRefresh } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const isEditing = !!permissionId;

  useEffect(() => {
    if (!token) {
      router.push('/layout');
    }
  }, [token, router]);

  useEffect(() => {
    getAllCategories(1, 50).then((res: any) => {
      if (res) setCategories(res.items || res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!permissionId) return;
    setIsLoading(true);
    getPermissionById(permissionId)
      .then((perm: any) => {
        if (perm) {
          setName(perm.name || '');
          setDescription(perm.description || '');
          setIsActive(perm.isActive !== false);
          const cat = perm.permissionCategory as any;
          if (cat?._id) setSelectedCategoryId(cat._id);
        }
      })
      .catch(() => toast.error('Error al cargar el permiso'))
      .finally(() => setIsLoading(false));
  }, [permissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del permiso es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCategory = categories.find((c) => c._id === selectedCategoryId);

      const payload: any = {
        _id: permissionId || '',
        name: name.trim(),
        description: description.trim(),
        isActive,
        permissionCategory: selectedCategory || null,
        createdBy: user_?.name || '',
      };

      const result = await createPermission(payload);
      if (result) {
        const msg = permissionId ? 'Permiso actualizado exitosamente' : 'Permiso creado exitosamente';
        setSuccess(msg);
        setTimeout(() => closeTabWithRefresh(`/Permission/${permissionId || 'new'}`, true), 1500);
      } else {
        toast.error('Error al guardar el permiso');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar el permiso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    closeTabWithRefresh(`/Permission/${permissionId || 'new'}`, true);
  };

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);

  if (isLoading) return <Loading />;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Operación exitosa!</h3>
          <p className="text-sm text-gray-500">{success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Permiso' : 'Nuevo Permiso'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? 'Modifique los datos del permiso' : 'Complete los datos para crear un nuevo permiso'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardSection title="Información del Permiso" subtitle="Datos generales del permiso">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Ver usuarios, Editar actividades"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito de este permiso"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
        </CardSection>

        <CardSection title="Configuración" subtitle="Categoría y estado del permiso">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Categoría
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Seleccionar categoría...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="mt-1.5 text-xs text-gray-500">
                  {selectedCategory.description || 'Sin descripción'}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Permiso activo</p>
                <p className="text-xs text-gray-500">Determina si el permiso está disponible para asignar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon className="w-4 h-4" />
            {isSaving ? 'Guardando...' : isEditing ? 'Actualizar Permiso' : 'Crear Permiso'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PermissionForm;
