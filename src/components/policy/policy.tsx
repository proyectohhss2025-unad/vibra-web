'use client';

import { createPolicy, getPolicyById } from '@/api/policy';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import CardSection from '@/components/ui/card-section';
import FormField from '@/components/forms/FormField';
import { useVibraForm } from '@/hooks/useVibraForm';
import { PolicySchema, type PolicyFormData } from '@/schemas';
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
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState('');

    const { register, handleSubmit, errors, reset, watch } = useVibraForm(PolicySchema, {
        name: '',
        description: '',
        category: '',
        content: '',
    });

    const watchName = watch('name');

    useEffect(() => {
        const fetchPolicy = async () => {
            if (!isEditing) return;
            try {
                const response: any = await getPolicyById(resolvedPolicyId);
                if (response?._id) {
                    setPolicyID(resolvedPolicyId);
                    reset({
                        name: response.name || response.title || '',
                        description: response.description || '',
                        category: response.category || response.type || '',
                        content: response.content ?? '',
                    });
                }
            } catch (e: any) {
                toast.error(e?.message || 'Error al cargar la política');
            }
        };
        fetchPolicy();
    }, [resolvedPolicyId, isEditing, reset]);

    const handleFormSubmit = async (data: PolicyFormData) => {
        if (!data.name.trim()) {
            toast.warning('El nombre es obligatorio');
            return;
        }
        setIsSaving(true);
        try {
            const userFromStorage: any = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await createPolicy(
                policyID, data.name, data.description, data.content, data.category,
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
            onSubmit={handleSubmit(handleFormSubmit)}
            onCancel={handleCancel}
        >
            <CardSection title="Información General" subtitle="Datos básicos de la política">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Nombre"
                        name="name"
                        register={register('name')}
                        error={errors.name}
                        placeholder="Nombre de la política"
                    />
                    <FormField
                        label="Categoría"
                        name="category"
                        register={register('category')}
                        error={errors.category}
                        placeholder="Ej: Seguridad, Privacidad"
                    />
                </div>

                <div className="mt-4">
                    <FormField
                        label="Descripción"
                        name="description"
                        error={errors.description}
                        placeholder="Breve descripción del propósito de la política"
                        render={() => (
                            <textarea
                                {...register('description')}
                                rows={2}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                placeholder="Breve descripción del propósito de la política"
                            />
                        )}
                    />
                </div>
            </CardSection>

            <CardSection title="Contenido" subtitle="Texto completo de la política">
                <div>
                    <FormField
                        label="Contenido"
                        name="content"
                        error={errors.content}
                        placeholder="Escriba aquí el contenido de la política."
                        render={() => (
                            <textarea
                                {...register('content')}
                                rows={12}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm font-mono"
                                placeholder="Escriba aquí el contenido de la política."
                            />
                        )}
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
