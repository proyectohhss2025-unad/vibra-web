'use client'

import { createPolicy, getPolicyById } from '@/api/policy';
import { Policy } from '@/models/policy.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

type PolicyComponentProps = {
    policyId?: string;
};

const PolicyComponent: React.FC<PolicyComponentProps> = ({ policyId }) => {
    const router = useRouter();
    const { token } = useContext(AuthContext);
    const { closeTabWithRefresh, refreshData, closeTab } = useTabs();
    const userFromStorage: any = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

    const [policyID, setPolicyID] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const queryPolicyId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedPolicyId = String(policyId ?? queryPolicyId ?? '');
    const currentTabId = resolvedPolicyId ? `/Policy/${resolvedPolicyId}` : '/Policy';

    useEffect(() => {
        if (!token) {
            return;
        }
        const fetchPolicy = async () => {
            if (!resolvedPolicyId || resolvedPolicyId === 'undefined' || resolvedPolicyId === 'null') {
                setPolicyID('');
                return;
            }
            try {
                const response: Policy = await getPolicyById(resolvedPolicyId);
                if (response?._id) {
                    setPolicyID(resolvedPolicyId);
                    setName(response.name ?? '');
                    setDescription(response.description ?? '');
                    setCategory(response.category ?? '');
                    setContent(response.content ?? '');
                }
            } catch (e: any) {
                setError(e?.message ?? 'Error loading policy');
            }
        };

        fetchPolicy();
    }, [resolvedPolicyId, token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSaving(true);
        try {
            const response = await createPolicy(
                policyID,
                name,
                description,
                content,
                category,
                userFromStorage?.name ?? 'admin'
            );

            if (response) {
                setSuccess('Policy saved successfully');
                closeTabWithRefresh(currentTabId, refreshData);
            } else {
                setError('Error saving policy');
            }
        } catch (e: any) {
            setError(e?.message ?? 'Error saving policy');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    if (!token) {
        return null;
    }

    return (
        <div className="w-full h-full px-4 pt-4">
            <Card className="col-span-4 bg-white rounded-md w-full mt-3">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div>{policyID ? 'Editar política' : 'Nueva política'}</div>
                    </CardTitle>
                    <CardDescription className="mt-0 mb-0">
                        Gestione políticas del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Nombre</label>
                            <input
                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Categoría</label>
                            <input
                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Descripción</label>
                            <textarea
                                rows={2}
                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Contenido</label>
                            <textarea
                                rows={10}
                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 font-mono"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Escriba aquí la política (texto o JSON)."
                            />
                        </div>

                        {error && <div className="text-sm text-red-600">{error}</div>}
                        {success && <div className="text-sm text-green-600">{success}</div>}

                        <div className="flex justify-end gap-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-md bg-gray-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !name}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-300"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PolicyComponent;

