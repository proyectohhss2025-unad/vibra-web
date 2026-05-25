'use client';

import { getAllCompanies } from '@/api/company';
import { getAllDocumentTypes } from '@/api/documentType';
import { getAllPermissionsByUser } from '@/api/permission';
import { getAllRoles } from '@/api/role';
import { createUser, getUserById } from '@/api/user';
import { generateUsername } from '@/helpers/string';
import { Company } from '@/models/company.entity';
import { DocumentType } from '@/models/documentType.entity';
import { Permission } from '@/models/permission.entity';
import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { UserPermission } from '@/models/userPermission.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import { formatDate } from '@/utils/dates';
import { Gender } from '@/utils/enum';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ToggleSwitch from '../forms/toggleSwitch';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Modal from '../layouts/modal/modal';
import MiniUserDataPage from '../permission/mini-user-data-page';

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
    const [labelSelectedCompany, setLabelSelectedCompany] = useState('Seleccione compañía');
    const [optionsRole, setOptionsRole] = useState<any[]>([]);
    const [optionsCompany, setOptionsCompany] = useState<any[]>([]);
    const [optionsDocumentType, setOptionsDocumentType] = useState<any[]>([]);
    const [showModalPermissions, setShowModalPermissions] = useState(false);
    const [idRoleSelected, setIdRoleSelected] = useState('');
    const [idDocumentTypeSelected, setIdDocumentTypeSelected] = useState('');
    const [company, setCompany] = useState('');
    const [idCompanySelected, setIdCompanySelected] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState<string>(Gender.MALE);
    const [birthDate, setBirthDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userID, setUserID] = useState('');

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

    // Cargar datos del usuario si estamos editando
    useEffect(() => {
        const fetchUser = async () => {
            if (!isEditing) return;
            try {
                const response: any = await getUserById(resolvedUserId);
                if (response?._id) {
                    setUserID(resolvedUserId);
                    setName(response.name ?? '');
                    setAddress(response.address ?? '');
                    setPhoneNumber(response.phoneNumber ?? '');
                    setEmail(response.email ?? '');
                    setUsername(response.username ?? '');
                    setDocumentNumber(response.documentNumber ?? '');
                    setGender(response.gender ?? Gender.MALE);
                    setBirthDate(response.birthDate ? new Date(response.birthDate).toISOString().split('T')[0] : '');
                    if (response.role) {
                        const roleId = typeof response.role === 'object' ? response.role._id : response.role;
                        setIdRoleSelected(roleId);
                        const found = optionsRole.find((r) => r._id === roleId);
                        if (found) setLabelSelectedRole(found.name);
                    }
                    if (response.company) {
                        const compId = typeof response.company === 'object' ? response.company._id : response.company;
                        setIdCompanySelected(compId);
                        setCompany(compId);
                        const found = optionsCompany.find((c) => c._id === compId);
                        if (found) setLabelSelectedCompany(found.name);
                    }
                    if (response.documentType) {
                        const dtId = typeof response.documentType === 'object' ? response.documentType._id : response.documentType;
                        setIdDocumentTypeSelected(dtId);
                        const found = optionsDocumentType.find((d) => d._id === dtId);
                        if (found) setLabelSelectedDocumentType(found.name);
                    }
                }
            } catch (error: any) {
                toast.error(error.message || 'Error al cargar el usuario');
            }
        };
        if (isEditing && optionsRole.length > 0) fetchUser();
    }, [isEditing, resolvedUserId, optionsRole.length, optionsCompany.length, optionsDocumentType.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !username.trim()) {
            toast.warning('Nombre, email y username son obligatorios');
            return;
        }
        if (!isEditing && password !== confirmPassword) {
            toast.warning('Las contraseñas no coinciden');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload: any = {
                _id: userID || undefined,
                name: name.trim(),
                address: address.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim(),
                username: username.trim(),
                documentNumber: documentNumber.trim(),
                gender,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                role: idRoleSelected,
                company: idCompanySelected,
                documentType: idDocumentTypeSelected,
            };
            if (password) payload.password = password;

            await createUser(
                payload._id, payload.name, payload.documentType, payload.documentNumber,
                payload.address, payload.phoneNumber, payload.email, payload.username,
                payload.role, payload.company, payload.gender, payload.birthDate
            );
            toast.success(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
            setTimeout(() => closeTabWithRefresh(currentTabId, true), 1000);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar el usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    const generateUsernameHandler = () => {
        const gen = generateUsername(name);
        setUsername(gen);
    };

    const renderOption = ({ label }: { label: string }) => label;

    return (
        <FormPageLayout
            title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        >
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                        <div className="flex gap-2">
                            <input className="flex-1 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                value={username} onChange={(e) => setUsername(e.target.value)} />
                            <button type="button" onClick={generateUsernameHandler}
                                className="px-3 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">
                                Generar
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo documento</label>
                        <DropdownMenuButton
                            label={labelSelectedDocumentType}
                            options={optionsDocumentType}
                            renderOption={renderOption}
                            onSelect={(opt: any) => { setIdDocumentTypeSelected(opt._id); setLabelSelectedDocumentType(opt.label); }}
                            valueSelected={labelSelectedDocumentType}
                            minWidth="w-auto"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <DropdownMenuButton
                            label={labelSelectedRole}
                            options={optionsRole}
                            renderOption={renderOption}
                            onSelect={(opt: any) => { setIdRoleSelected(opt._id); setLabelSelectedRole(opt.label); }}
                            valueSelected={labelSelectedRole}
                            minWidth="w-auto"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Compañía</label>
                        <DropdownMenuButton
                            label={labelSelectedCompany}
                            options={optionsCompany}
                            renderOption={renderOption}
                            onSelect={(opt: any) => { setIdCompanySelected(opt._id); setCompany(opt._id); setLabelSelectedCompany(opt.label); }}
                            valueSelected={labelSelectedCompany}
                            minWidth="w-auto"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                        <select className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value={Gender.MALE}>Masculino</option>
                            <option value={Gender.FEMALE}>Femenino</option>
                            <option value={Gender.OTHER}>Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                        <input type="date" className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                    </div>
                </div>

                {!isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input type="password" className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                            <input type="password" className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
        </FormPageLayout>
    );
};

export default UserComponent;
