'use client';

import { getAllCompanies } from '@/api/company';
import { getAllDocumentTypes } from '@/api/documentType';
import { getAllPermissionsByUser } from '@/api/permission';
import { getAllRoles } from '@/api/role';
import { getUserById } from '@/api/user';
import api from '@/api/axios-instance';
import { generateUsername } from '@/helpers/string';
import { Company } from '@/models/company.entity';
import { DocumentType } from '@/models/documentType.entity';
import { Permission } from '@/models/permission.entity';
import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { UserPermission } from '@/models/userPermission.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import FormField from '@/components/forms/FormField';
import { useVibraForm } from '@/hooks/useVibraForm';
import { UserSchema, type UserFormData } from '@/schemas';
import { Gender } from '@/utils/enum';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ToggleSwitch from '../forms/toggleSwitch';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Modal from '../layouts/modal/modal';
import MiniUserDataPage from '../permission/mini-user-data-page';
import PhoneInput from '../forms/PhoneInput';

type UserComponentProps = {
    userId?: string;
};

const UserComponent: React.FC<UserComponentProps> = ({ userId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();

    const queryId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedUserId = String(userId ?? queryId ?? '');
    const currentTabId = resolvedUserId ? `/Usuario/${resolvedUserId}` : '/Usuario/new';
    const isEditing = !!(resolvedUserId && resolvedUserId !== 'undefined' && resolvedUserId !== 'null');

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [labelSelectedRole, setLabelSelectedRole] = useState('Seleccione rol');
    const [labelSelectedDocumentType, setLabelSelectedDocumentType] = useState('Seleccione tipo');
    const [labelSelectedCompany, setLabelSelectedCompany] = useState('Seleccione institución');
    const [optionsRole, setOptionsRole] = useState<any[]>([]);
    const [optionsCompany, setOptionsCompany] = useState<any[]>([]);
    const [optionsDocumentType, setOptionsDocumentType] = useState<any[]>([]);
    const [success, setSuccess] = useState('');
    const [showModalPermissions, setShowModalPermissions] = useState(false);
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(UserSchema, {
        name: '',
        email: '',
        username: '',
        documentNumber: '',
        documentType: '',
        address: '',
        phoneNumber: '',
        gender: Gender.MALE,
        birthDate: '',
        role: '',
        company: '',
    });

    const watchName = watch('name');

    // Cargar datos iniciales (roles, companies, document types)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [rolesRes, companiesRes, docTypesRes] = await Promise.all([
                    getAllRoles(1, 100),
                    getAllCompanies(1, 100),
                    getAllDocumentTypes(1, 100),
                ]);
                if (rolesRes?.items) {
                    setOptionsRole(rolesRes.items.map((r: any) => ({ _id: r._id, name: r.name, label: r.name, icon: 'CheckCircleIcon' })));
                }
                if (companiesRes?.companies) {
                    setOptionsCompany(companiesRes.companies.map((c: any) => ({ _id: c._id, name: c.name, label: c.name, icon: 'CheckCircleIcon' })));
                }
                if (docTypesRes?.documentTypes) {
                    setOptionsDocumentType(docTypesRes.documentTypes.map((d: any) => ({ _id: d._id, name: d.name, label: d.name, icon: 'CheckCircleIcon' })));
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Función para normalizar gender (BD puede tener "MALE", "male", "Male")
    const normalizeGender = (g: string): Gender => {
        if (!g) return Gender.MALE;
        const lower = g.toLowerCase();
        if (lower === 'male') return Gender.MALE;
        if (lower === 'female') return Gender.FEMALE;
        if (lower === 'other') return Gender.OTHER;
        return Gender.MALE;
    };

    // Cargar datos del usuario si estamos editando
    useEffect(() => {
        const fetchUser = async () => {
            if (!isEditing) return;
            try {
                const response: any = await getUserById(resolvedUserId);
                if (response?._id) {
                    setUserID(resolvedUserId);
                    reset({
                        name: response.name ?? '',
                        email: response.email ?? '',
                        username: response.username ?? '',
                        documentNumber: response.documentNumber ?? '',
                        documentType: response.documentType?._id || response.documentType || '',
                        address: response.address ?? '',
                        phoneNumber: response.phoneNumber ?? '',
                        gender: normalizeGender(response.gender),
                        birthDate: response.birthDate ? new Date(response.birthDate).toISOString().split('T')[0] : '',
                        role: response.role?._id || response.role || '',
                        company: response.company?._id || response.company || '',
                    });
                }
            } catch (error: any) {
                toast.error(error.message || 'Error al cargar el usuario');
            }
        };
        if (isEditing && resolvedUserId) fetchUser();
    }, [isEditing, resolvedUserId, reset]);

    // Actualizar labels de dropdowns cuando lleguen las opciones
    const currentRole = watch('role');
    const currentCompany = watch('company');
    const currentDocType = watch('documentType');

    useEffect(() => {
        if (currentRole) {
            const found = optionsRole.find((r) => r._id === currentRole);
            if (found) setLabelSelectedRole(found.name);
        }
    }, [optionsRole, currentRole]);

    useEffect(() => {
        if (currentCompany) {
            const found = optionsCompany.find((c) => c._id === currentCompany);
            if (found) setLabelSelectedCompany(found.name);
        }
    }, [optionsCompany, currentCompany]);

    useEffect(() => {
        if (currentDocType) {
            const found = optionsDocumentType.find((d) => d._id === currentDocType);
            if (found) setLabelSelectedDocumentType(found.name);
        }
    }, [optionsDocumentType, currentDocType]);

    const handleFormSubmit = async (data: UserFormData) => {
        if (!isEditing && password !== confirmPassword) {
            toast.warning('Las contraseñas no coinciden');
            return;
        }
        setIsSubmitting(true);

        console.log('[UserForm] Enviando datos...', { userID, name: data.name, username: data.username, role: data.role, company: data.company, gender: data.gender, hasPassword: !!password });

        try {
            const emptyToUndef = (v: string) => v || undefined;
            const payload: Record<string, any> = {
                ...(isEditing ? { _id: userID } : {}),
                name: data.name,
                documentType: emptyToUndef(data.documentType),
                documentNumber: data.documentNumber || undefined,
                address: data.address || undefined,
                phoneNumber: data.phoneNumber || undefined,
                email: data.email,
                username: data.username,
                role: emptyToUndef(data.role),
                company: emptyToUndef(data.company),
                gender: data.gender,
            };
            if (data.birthDate) payload.birthDate = new Date(data.birthDate).toISOString();
            if (password) payload.password = password;

            console.log('[UserForm] Payload enviado al backend:', payload);

            if (isEditing) {
                const res = await api.post('/api/users', payload);
                console.log('[UserForm] Respuesta del backend:', res.data);
            } else {
                const res = await api.post('/api/users/create', payload);
                console.log('[UserForm] Respuesta del backend:', res.data);
            }

            const msg = isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
            setSuccess(msg);
            setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
        } catch (error: any) {
            const errData = error?.response?.data;
            const detail = errData?.message;
            let msg = '';
            if (Array.isArray(detail)) {
                // Extraer mensajes de validación de objetos NestJS (property + constraints)
                const msgs = detail.map((d: any) => {
                    if (typeof d === 'string') return d;
                    if (d.constraints) return Object.values(d.constraints).join(', ');
                    if (d.property) return `${d.property}: inválido`;
                    return JSON.stringify(d);
                });
                msg = msgs.join(' · ');
                console.error('[UserForm] Validación fallida — campos:', detail.map((d: any) => d.property));
                console.error('[UserForm] Detalle:', detail);
            } else if (typeof detail === 'string') {
                msg = detail;
            } else {
                msg = JSON.stringify(errData) || error?.message || 'Error al guardar el usuario';
            }
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    const generateUsernameHandler = () => {
        const gen = generateUsername(watchName);
        setValue('username', gen);
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

    const renderOption = ({ label }: { label: string }) => label;
    const watchPhone = watch('phoneNumber');
    const watchGender = watch('gender');
    const watchBirthDate = watch('birthDate');

    return (
        <FormPageLayout
            title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(handleFormSubmit)}
            onCancel={handleCancel}
        >
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Nombre *" name="name" register={register('name')} error={errors.name} />
                    <FormField label="Email *" name="email" type="email" register={register('email')} error={errors.email} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                        <div className="flex gap-2">
                            <input className="flex-1 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                value={watch('username')} onChange={(e) => setValue('username', e.target.value)} />
                            <button type="button" onClick={generateUsernameHandler}
                                className="px-3 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">
                                Generar
                            </button>
                        </div>
                    </div>
                    <FormField label="Documento" name="documentNumber" register={register('documentNumber')} error={errors.documentNumber} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo documento</label>
                        <DropdownMenuButton
                            label={labelSelectedDocumentType}
                            options={optionsDocumentType}
                            renderOption={renderOption}
                            onSelect={(opt: any) => { setValue('documentType', opt._id); setLabelSelectedDocumentType(opt.label); }}
                            valueSelected={labelSelectedDocumentType}
                            minWidth="w-auto"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                        <DropdownMenuButton
                            label={labelSelectedRole}
                            options={optionsRole}
                            renderOption={renderOption}
                            onSelect={(opt: any) => { setValue('role', opt._id); setLabelSelectedRole(opt.label); }}
                            valueSelected={labelSelectedRole}
                            minWidth="w-auto"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                        <DropdownMenuButton
                            label={labelSelectedCompany}
                            options={optionsCompany}
                            renderOption={renderOption}
                            onSelect={(opt: any) => { setValue('company', opt._id); setLabelSelectedCompany(opt.label); }}
                            valueSelected={labelSelectedCompany}
                            minWidth="w-auto"
                        />
                    </div>
                    <div>
                        <PhoneInput value={watchPhone} onChange={(val) => setValue('phoneNumber', val)} />
                    </div>
                    <FormField label="Dirección" name="address" register={register('address')} error={errors.address} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                        <select className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={watchGender} onChange={(e) => setValue('gender', e.target.value as Gender)}>
                            <option value={Gender.MALE}>Masculino</option>
                            <option value={Gender.FEMALE}>Femenino</option>
                            <option value={Gender.OTHER}>Otro</option>
                        </select>
                    </div>
                    <FormField label="Fecha de nacimiento" name="birthDate" type="date" register={register('birthDate')} error={errors.birthDate} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isEditing ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                        </label>
                        <input type="password" className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder={isEditing ? '••••••••' : ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                        <input type="password" className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={isEditing ? '••••••••' : ''} />
                    </div>
                </div>
            </div>
        </FormPageLayout>
    );
};

export default UserComponent;
