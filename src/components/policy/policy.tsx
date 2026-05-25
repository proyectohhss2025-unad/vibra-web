'use client';

import { createPolicy, getPolicyById } from '@/api/policy';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import CardSection from '@/components/ui/card-section';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';


type PolicyComponentProps = {
    policyId?: string;
};

const PolicyComponent: React.FC<PolicyComponentProps> = ({ policyId }) => {
    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();

    const queryPolicyId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedPolicyId = String(policyId ?? queryPolicyId ?? '');
    const currentTabId = resolvedPolicyId ? `/Policy/${resolvedPolicyId}` : '/Policy/new';
    const isEditing = !!(resolvedPolicyId && resolvedPolicyId !== 'undefined' && resolvedPolicyId !== 'null');

    const [policyID, setPolicyID] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPolicy = async () => {
            if (!isEditing) return;
            try {
                const response: any = await getPolicyById(resolvedPolicyId);
                if (response?._id) {
                    setPolicyID(resolvedPolicyId);
                    setName(response.name || response.title || '');
                    setDescription(response.description || '');
                    setCategory(response.category || response.type || '');
                    setContent(response.content ?? '');
                }
            } catch (e: any) {
                toast.error(e?.message || 'Error al cargar la política');
            }
        };
        fetchPolicy();
    }, [resolvedPolicyId, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.warning('El nombre es obligatorio');
            return;
        }
        setIsSaving(true);
        try {
            const userFromStorage: any = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await createPolicy(
                policyID, name, description, content, category,
                userFromStorage?.name || 'admin'
            );
            if (response) {
                const msg = isEditing ? 'Política actualizada exitosamente' : 'Política creada exitosamente';
                setSuccess(msg);
                setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
            } else {
                toast.error('Error al guardar la política');
            }
        } catch (e: any) {
            toast.error(e?.message || 'Error al guardar la política');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (!isSaving) closeTab(currentTabId);
    };

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
        <FormPageLayout
            title={isEditing ? 'Editar Política' : 'Nueva Política'}
            isEditing={isEditing}
            isSubmitting={isSaving}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        >
            <CardSection title="Información General" subtitle="Datos básicos de la política">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className={`w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${name.trim() ? 'ring-gray-300' : 'ring-red-300'} focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nombre de la política"
                                />
                                {!name.trim() && (
                                    <p className="text-xs text-red-500 mt-1">Campo obligatorio</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                </label>
                                <input
                                    className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Ej: Seguridad, Privacidad"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                            </label>
                            <textarea
                                rows={2}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Breve descripción del propósito de la política"
                            />
                        </div>
                    </CardSection>

                    <CardSection title="Contenido" subtitle="Texto completo de la política">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contenido <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={12}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm font-mono"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Escriba aquí el contenido de la política."
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Texto completo de la política que los usuarios deberán aceptar.
                            </p>
                        </div>
                    </CardSection>

        </FormPageLayout>
    );
};

export default PolicyComponent;