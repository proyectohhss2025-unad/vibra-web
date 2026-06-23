'use client';

import { getAllPermissionTemplates } from '@/api/permissionTemplate';
import { createRole, getRoleById } from '@/api/role';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { Role } from '@/models/role.entity';
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
import { useVibraForm } from '@/hooks/useVibraForm';
import { RoleSchema, type RoleFormData } from '@/schemas';
import FormField from '@/components/forms/FormField';

type RoleFormProps = {
  roleId?: string;
};

const RoleForm: React.FC<RoleFormProps> = ({ roleId }) => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user') ?? '{}');
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { closeTabWithRefresh } = useTabs();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);

  const isEditing = !!roleId;

  const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(RoleSchema, {
    name: '',
    description: '',
    isActive: true,
    isSuperAdmin: false,
    permissionTemplate: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/layout');
    }
  }, [token, router]);

  useEffect(() => {
    getAllPermissionTemplates(1, 50).then((res) => {
      if (res) setTemplates(res.data || res.items || res.permissionTemplates || []);
    });
  }, []);

  useEffect(() => {
    if (!roleId) return;
    setIsLoading(true);
    getRoleById(roleId)
      .then((role: Role | null) => {
        if (role) {
          const pt = role.permissionTemplate as any;
          const templateId = pt?._id || (typeof pt === 'string' ? pt : '') || '';
          reset({
            name: role.name || '',
            description: role.description || '',
            isActive: role.isActive !== false,
            isSuperAdmin: role.isSuperAdmin || false,
            permissionTemplate: templateId,
          });
        }
      })
      .catch(() => toast.error('Error al cargar el rol'))
      .finally(() => setIsLoading(false));
  }, [roleId, reset]);

  const handleFormSubmit = async (data: RoleFormData) => {
    setIsSaving(true);
    try {
      const selectedTemplate = templates.find((t) => t._id === data.permissionTemplate);

      const payload: any = {
        _id: roleId || '',
        name: data.name.trim(),
        description: data.description.trim(),
        isActive: data.isActive,
        isSuperAdmin: data.isSuperAdmin,
        permissionTemplate: selectedTemplate || null,
        createdBy: user_?.name || '',
      };

      const result = await createRole(payload);
      if (result) {
        const msg = roleId ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente';
        setSuccess(msg);
        setTimeout(() => closeTabWithRefresh(`/Role/${roleId || 'new'}`, true), 1500);
      } else {
        toast.error('Error al guardar el rol');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar el rol');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    closeTabWithRefresh(`/Role/${roleId || 'new'}`, true);
  };

  const watchPermissionTemplate = watch('permissionTemplate');
  const watchIsActive = watch('isActive');
  const watchIsSuperAdmin = watch('isSuperAdmin');
  const selectedTemplate = templates.find((t) => t._id === watchPermissionTemplate);

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
            {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? 'Modifique los datos del rol' : 'Complete los datos para crear un nuevo rol'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Información básica */}
        <CardSection title="Información del Rol" subtitle="Datos generales del rol">
          <div className="grid grid-cols-1 gap-5">
            <FormField
              label="Nombre"
              name="name"
              register={register('name')}
              error={errors.name}
              placeholder="Ej: Administrador, Docente, Estudiante"
            />
            <FormField
              label="Descripción"
              name="description"
              error={errors.description}
              placeholder="Describe el propósito de este rol"
              render={() => (
                <textarea
                  {...register('description')}
                  placeholder="Describe el propósito de este rol"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              )}
            />
          </div>
        </CardSection>

        {/* Configuración */}
        <CardSection title="Configuración" subtitle="Estado y permisos del rol">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Rol activo</p>
                <p className="text-xs text-gray-500">Determina si el rol está disponible para asignar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchIsActive}
                  onChange={(e) => setValue('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Super Admin</p>
                <p className="text-xs text-gray-500">Otorga acceso completo a todas las funcionalidades</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchIsSuperAdmin}
                  onChange={(e) => setValue('isSuperAdmin', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Plantilla de permisos
              </label>
              <select
                value={watchPermissionTemplate}
                onChange={(e) => setValue('permissionTemplate', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} — {t.description || ''}
                  </option>
                ))}
              </select>
              {selectedTemplate && (() => {
                const perms = selectedTemplate.permissions || [];
                const previewPerms = perms.slice(0, 5);
                const remaining = perms.length - previewPerms.length;
                return (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {perms.length} permiso(s) incluido(s)
                    </p>
                    {previewPerms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {previewPerms.map((p: any) => (
                          <span key={p._id || p} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {p.name || p.serial || p}
                          </span>
                        ))}
                        {remaining > 0 && (
                          <span className="text-xs text-gray-400">+{remaining} más</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </CardSection>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-300 hover:border-gray-500 transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon className="w-4 h-4" />
            {isSaving ? 'Guardando...' : isEditing ? 'Actualizar Rol' : 'Crear Rol'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
