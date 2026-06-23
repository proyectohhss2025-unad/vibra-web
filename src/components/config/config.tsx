'use client'

import { createConfig, updateConfig, getConfigById } from '@/api/config';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTabs } from '@/services/contexts/tabs-context';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../layouts/loading/loading';
import FormField from '@/components/forms/FormField';
import ToggleSwitch from '../forms/toggleSwitch';
import '../test/test.css';

type ConfigComponentProps = {
    configId?: string;
};

const ConfigComponent: React.FC<ConfigComponentProps> = ({ configId }) => {
    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();
    const currentTabId = configId ? `/Config/${configId}` : '/Config/new';

    const queryId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedConfigId = String(configId ?? queryId ?? '');
    const isEditing = !!(resolvedConfigId && resolvedConfigId !== 'undefined' && resolvedConfigId !== 'null');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    // Estado del formulario (manual por allowedUsers/disallowedUsers que son arrays)
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [flag, setFlag] = useState(false);
    const [allowedUsers, setAllowedUsers] = useState('');
    const [disallowedUsers, setDisallowedUsers] = useState('');

    useEffect(() => {
        const loadConfig = async () => {
            if (!isEditing) return;
            setIsLoading(true);
            try {
                const res: any = await getConfigById(resolvedConfigId);
                if (res?._id) {
                    setName(res.name ?? '');
                    setDescription(res.description ?? '');
                    setFlag(res.flag ?? false);
                    setAllowedUsers(Array.isArray(res.allowedUsers) ? res.allowedUsers.join(', ') : '');
                    setDisallowedUsers(Array.isArray(res.disallowedUsers) ? res.disallowedUsers.join(', ') : '');
                }
            } catch (err: any) {
                toast.error(err?.message || 'Error al cargar la configuración');
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, [resolvedConfigId, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        setIsSubmitting(true);
        try {
            const nameFormat = name.trim().replaceAll(/\s+/g, '-');
            const parsedAllowed = allowedUsers.split(',').map(v => v.trim()).filter(Boolean);
            const parsedDisallowed = disallowedUsers.split(',').map(v => v.trim()).filter(Boolean);

            let result;
            if (isEditing) {
                result = await updateConfig(
                    resolvedConfigId,
                    nameFormat,
                    flag,
                    parsedAllowed,
                    parsedDisallowed,
                    description,
                    'admin'
                );
            } else {
                result = await createConfig(
                    nameFormat,
                    flag,
                    parsedAllowed,
                    parsedDisallowed,
                    description,
                    'admin'
                );
            }
            if (result) {
                setSuccess(isEditing ? 'Configuración actualizada exitosamente' : 'Configuración creada exitosamente');
                setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
            } else {
                toast.error('Error al guardar la configuración');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error al guardar la configuración');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    if (isLoading) return <Loading />;

    if (success) {
        return (
            <div className="test-container container mx-auto px-4 py-8">
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
            </div>
        );
    }

    return (
        <div className="test-container container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEditing ? 'Editar Configuración' : 'Nueva Configuración'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Nombre *"
                        name="name"
                        value={name}
                        onChange={setName}
                        placeholder="Ej: send-otp, feature-flag-x"
                    />
                    <div className="flex items-end pb-2">
                        <ToggleSwitch
                            label="Flag activo"
                            initialValue={flag}
                            handleChange={setFlag}
                        />
                    </div>
                    <FormField
                        label="Descripción"
                        name="description"
                        value={description}
                        onChange={setDescription}
                        placeholder="Descripción de la configuración"
                        render={({ value, onChange }) => (
                            <textarea
                                id="description"
                                rows={2}
                                value={value || ''}
                                onChange={(e) => onChange?.(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white"
                                placeholder="Descripción de la configuración"
                            />
                        )}
                    />
                    <FormField
                        label="Usuarios permitidos (IDs separados por coma)"
                        name="allowedUsers"
                        value={allowedUsers}
                        onChange={setAllowedUsers}
                        placeholder="1, 2, 3"
                        render={({ value, onChange }) => (
                            <textarea
                                id="allowedUsers"
                                rows={2}
                                value={value || ''}
                                onChange={(e) => onChange?.(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white"
                                placeholder="1, 2, 3"
                            />
                        )}
                    />
                    <FormField
                        label="Usuarios no permitidos (IDs separados por coma)"
                        name="disallowedUsers"
                        value={disallowedUsers}
                        onChange={setDisallowedUsers}
                        placeholder="4, 5, 6"
                        render={({ value, onChange }) => (
                            <textarea
                                id="disallowedUsers"
                                rows={2}
                                value={value || ''}
                                onChange={(e) => onChange?.(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white"
                                placeholder="4, 5, 6"
                            />
                        )}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
                    <button type="button" onClick={handleCancel}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-300 hover:border-gray-500 transition-colors">
                        <XCircleIcon className="w-4 h-4" /> Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting || !name.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <SaveIcon className="w-4 h-4" /> {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfigComponent;
