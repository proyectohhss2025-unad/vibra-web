'use client';

import { createPermissionTemplate, getPermissionTemplateById } from '@/api/permissionTemplate';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CardSection from '@/components/ui/card-section';
import Loading from '@/components/layouts/loading/loading';
import PermissionPicker from '@/components/permission/permission-picker';
import { SaveIcon, XCircleIcon } from 'lucide-react';

type PermissionTemplateFormProps = {
  templateId?: string;
};

const PermissionTemplateForm: React.FC<PermissionTemplateFormProps> = ({ templateId }) => {
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
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

  const isEditing = !!templateId;

  useEffect(() => {
    if (!token) {
      router.push('/layout');
    }
  }, [token, router]);

  useEffect(() => {
    if (!templateId) return;
    setIsLoading(true);
    getPermissionTemplateById(templateId)
      .then((tpl: any) => {
        if (tpl) {
          setName(tpl.name || '');
          setDescription(tpl.description || '');
          setIsActive(tpl.isActive !== false);
          // Cargar permisos existentes de la plantilla
          if (tpl.permissions && Array.isArray(tpl.permissions)) {
            const ids = tpl.permissions.map((p: any) =>
              typeof p === 'string' ? p : p._id,
            ).filter(Boolean);
            setPermissionIds(ids);
          }
        }
      })
      .catch(() => toast.error('Error al cargar la plantilla'))
      .finally(() => setIsLoading(false));
  }, [templateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre de la plantilla es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        _id: templateId || '',
        name: name.trim(),
        description: description.trim(),
        isActive,
        permissions: permissionIds,
        createdBy: user_?.name || '',
      };

      const result = await createPermissionTemplate(payload);
      if (result) {
        const msg = templateId ? 'Plantilla actualizada exitosamente' : 'Plantilla creada exitosamente';
        setSuccess(msg);
        setTimeout(() => closeTabWithRefresh(`/PermissionTemplate/${templateId || 'new'}`, true), 1500);
      } else {
        toast.error('Error al guardar la plantilla');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar la plantilla');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    closeTabWithRefresh(`/PermissionTemplate/${templateId || 'new'}`, true);
  };

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
            {isEditing ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? 'Modifique los datos de la plantilla' : 'Complete los datos para crear una nueva plantilla'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardSection title="Información de la Plantilla" subtitle="Datos generales de la plantilla de permisos">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Plantilla Docente, Plantilla Estudiante"
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
                placeholder="Describe el propósito de esta plantilla"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
        </CardSection>

        <CardSection title="Estado" subtitle="Disponibilidad de la plantilla">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Plantilla activa</p>
              <p className="text-xs text-gray-500">Determina si la plantilla está disponible para asignar a roles</p>
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
        </CardSection>

        <CardSection title="Permisos de la Plantilla" subtitle="Seleccione los permisos que incluye esta plantilla">
          <PermissionPicker
            selectedIds={permissionIds}
            onChange={setPermissionIds}
            label="Permisos asignados"
          />
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
            {isSaving ? 'Guardando...' : isEditing ? 'Actualizar Plantilla' : 'Crear Plantilla'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PermissionTemplateForm;
