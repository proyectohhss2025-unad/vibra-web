'use client';

import { createCompany, getCompanyById } from '@/api/company';
import { getAllDocumentTypes } from '@/api/documentType';
import { Company } from '@/models/company.entity';
import { DocumentType } from '@/models/documentType.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import { useVibraForm } from '@/hooks/useVibraForm';
import { CompanySchema, type CompanyFormData } from '@/schemas';
import FormField from '@/components/forms/FormField';
import PhoneInput from '@/components/forms/PhoneInput';
import { ClipboardListIcon, UserCircleIcon, StarIcon, SupportIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ToggleSwitch from '../forms/toggleSwitch';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import SearchUser from '../search/search-user';

type CompanyComponentProps = {
    companyId?: string;
};

const CompanyComponent: React.FC<CompanyComponentProps> = ({ companyId }) => {
    const { token } = useContext(AuthContext);
    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();

    const resolvedCompanyId = companyId || (router.query._id as string) || '';
    const currentTabId = resolvedCompanyId ? `/Company/${resolvedCompanyId}` : '/Company/new';
    const isEditing = !!resolvedCompanyId;

    const [companyID, setCompanyID] = useState<string>('');
    const [activeTab, setActiveTab] = useState('company');
    const [labelSelectedDocumentType, setLabelSelectedDocumentType] = useState<string>('Select type');
    const [idDocumentTypeSelected, setIdDocumentTypeSelected] = useState<string>('');
    const [optionsDocumentType, setOptionsDocumentType] = useState<any[]>([]);
    const [user, setUser] = useState<any[]>([]);
    const [valUser, setValUser] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(CompanySchema, {
        name: '',
        slogan: '',
        nit: '',
        address: '',
        phoneNumber: '',
        email: '',
        billingRangeNumber: '',
        isMain: false,
        managerName: '',
        managerDocumentType: '',
        managerDocument: '',
        managerEmail: '',
        managerPhoneNumber: '',
        userAdmin: '',
    });

    const watchIsMain = watch('isMain');

    // Auth check
    useEffect(() => {
        if (!token) router.push('/layout');
    }, [token, router]);

    // Load document types
    useEffect(() => {
        const fetchData = async () => {
            try {
                const documentTypesResponse = await getAllDocumentTypes(1, 50);
                if (documentTypesResponse) {
                    const opts: any[] = [];
                    documentTypesResponse?.documentTypes?.forEach((element: DocumentType, index: any) => {
                        opts.push({ _id: element?._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsDocumentType(opts);
                }
            } catch (error: any) {
                toast.error(error.message);
            }
        };
        fetchData();
    }, []);

    // Cargar datos de la compañía para edición (independiente de document types)
    useEffect(() => {
        if (!isEditing || !resolvedCompanyId) return;

        const loadCompany = async () => {
            try {
                setCompanyID(resolvedCompanyId);
                const responseCompany: any = await getCompanyById(resolvedCompanyId);

                if (responseCompany?._id) {
                    reset({
                        name: responseCompany?.name || '',
                        slogan: responseCompany?.slogan || '',
                        nit: responseCompany?.nit || '',
                        address: responseCompany?.address || '',
                        phoneNumber: String(responseCompany?.phoneNumber ?? ''),
                        email: responseCompany?.email || '',
                        billingRangeNumber: responseCompany?.modules?.billing?.seriesCurrentBillingRange || '',
                        isMain: responseCompany?.isMain || false,
                        managerName: responseCompany?.managerData?.name || '',
                        managerDocumentType: responseCompany?.managerData?.documentType?._id || '',
                        managerDocument: responseCompany?.managerData?.document || '',
                        managerEmail: responseCompany?.managerData?.email || '',
                        managerPhoneNumber: String(responseCompany?.managerData?.phoneNumber ?? ''),
                        userAdmin: responseCompany?.userAdmin?._id || '',
                    });

                    setValUser(responseCompany?.userAdmin?.documentNumber);
                    setUser([responseCompany?.userAdmin]);
                    setIdDocumentTypeSelected(responseCompany?.managerData?.documentType?._id);
                }
            } catch (error: any) {
                toast.error('Error al cargar los datos de la institución');
            }
        };

        loadCompany();
    }, [isEditing, resolvedCompanyId]); // Sin depender de optionsDocumentType

    // Actualizar el label del tipo de documento cuando se carguen las opciones
    useEffect(() => {
        if (idDocumentTypeSelected && optionsDocumentType.length > 0) {
            const selected = optionsDocumentType.find(
                (option) => option._id === idDocumentTypeSelected
            );
            if (selected) {
                setLabelSelectedDocumentType(selected.name);
            }
        }
    }, [optionsDocumentType, idDocumentTypeSelected]);

    // Sync user selection
    useEffect(() => {
        if (user[0]?._id && user[0]?._id !== '') {
            setValUser(user[0]?.documentNumber);
            setCompanyUserAdmin(user[0]?._id);
            setValue('userAdmin', user[0]?._id);
        }
    }, [user[0]?._id, setValue]);

    const setCompanyUserAdmin = (id: string) => {
        setValue('userAdmin', id);
    };

    const handleFormSubmit = async (data: CompanyFormData) => {
        setIsSubmitting(true);

        const companyData = {
            companyID,
            companySlogan: data.slogan,
            companyName: data.name,
            companyNit: data.nit,
            companyAddress: data.address,
            companyPhoneNumber: Number(data.phoneNumber.replace(/\D/g, '')) || 0,
            companyEmail: data.email,
            companyUserAdmin: data.userAdmin,
            companyBillingRangeNumber: data.billingRangeNumber,
            companyIsMain: data.isMain,
        };

        const companyManagerData = {
            name: data.managerName,
            documentType: idDocumentTypeSelected || data.managerDocumentType,
            document: data.managerDocument,
            email: data.managerEmail,
            phoneNumber: data.managerPhoneNumber,
        };

        try {
            const companyResponse = await createCompany(companyData, companyManagerData);
            if (companyResponse) {
                const msg = isEditing ? 'Institución actualizada exitosamente' : 'Institución creada exitosamente';
                setSuccess(msg);
                setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
            } else {
                toast.error('Error al guardar la institución');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la institución');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    const handleClean = () => {
        reset({
            name: '',
            slogan: '',
            nit: '',
            address: '',
            phoneNumber: '',
            email: '',
            billingRangeNumber: '',
            isMain: false,
            managerName: '',
            managerDocumentType: '',
            managerDocument: '',
            managerEmail: '',
            managerPhoneNumber: '',
            userAdmin: '',
        });
        setCompanyID('');
        setCompanyUserAdmin('');
        setValUser('');
        setUser([]);
        setIdDocumentTypeSelected('');
        setLabelSelectedDocumentType('Select type');
        window.scrollTo(0, 0);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChangeSelectedDocumentType = (option: any) => {
        if (!option) return;
        setLabelSelectedDocumentType(option?.label);
        setIdDocumentTypeSelected(option?._id);
        setValue('managerDocumentType', option?._id);
    };

    const renderOption = ({ label }: { label: string }) => label;

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
        <FormPageLayout
            title={isEditing ? 'Editar Institución' : 'Nueva Institución'}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(handleFormSubmit)}
            onCancel={handleCancel}
        >
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Información General</h2>
                    <div className="flex items-center gap-3">
                        <StarIcon
                            data-tooltip-id="my-tooltip-t"
                            data-tooltip-content="Generate support and new features"
                            className="h-7 w-7 text-blue-600 cursor-pointer"
                            onClick={() => setShowModal(true)}
                        />
                        <SupportIcon
                            data-tooltip-id="my-tooltip-t"
                            data-tooltip-content="Init tour"
                            className="h-7 w-7 text-blue-600 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Tabs: Company | Manager */}
                <div className="flex space-x-4 mb-4 border-b border-gray-200">
                    <div
                        className={`py-2 px-4 font-semibold cursor-pointer ${activeTab === 'company'
                                ? 'text-gray-600 border-b-4 border-blue-600'
                                : 'text-gray-600 hover:text-blue-500'
                            }`}
                        onClick={() => setActiveTab('company')}
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardListIcon className="h-5 w-5" />
                            <span>Company</span>
                        </div>
                    </div>
                    <div
                        className={`py-2 px-4 font-semibold cursor-pointer ${activeTab === 'manager'
                                ? 'text-gray-600 border-b-4 border-gray-600'
                                : 'text-gray-600 hover:text-blue-500'
                            }`}
                        onClick={() => setActiveTab('manager')}
                    >
                        <div className="flex items-center gap-2">
                            <UserCircleIcon className="h-5 w-5" />
                            <span>Manager</span>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center pb-2">
                        <ToggleSwitch initialValue={watchIsMain} label="Principal" handleChange={(val: boolean) => setValue('isMain', val)} />
                    </div>
                </div>

                {activeTab === 'company' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Nombre completo"
                            name="name"
                            register={register('name')}
                            error={errors.name}
                            placeholder="Nombre de la institución"
                        />
                        <FormField
                            label="NIT"
                            name="nit"
                            register={register('nit')}
                            error={errors.nit}
                            placeholder="NIT"
                        />
                        <FormField
                            label="Slogan"
                            name="slogan"
                            register={register('slogan')}
                            error={errors.slogan}
                            placeholder="Slogan"
                        />
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            register={register('email')}
                            error={errors.email}
                            placeholder="correo@ejemplo.com"
                        />
                        <PhoneInput
                            label="Teléfono"
                            value={watch('phoneNumber')}
                            onChange={(val) => setValue('phoneNumber', val)}
                        />
                        <FormField
                            label="Rango facturación"
                            name="billingRangeNumber"
                            register={register('billingRangeNumber')}
                            error={errors.billingRangeNumber}
                            placeholder="Rango de facturación"
                        />
                        <div className="md:col-span-2">
                            <FormField
                                label="Dirección"
                                name="address"
                                register={register('address')}
                                error={errors.address}
                                placeholder="Dirección"
                            />
                        </div>
                        {errors.userAdmin && (
                            <div className="md:col-span-2">
                                <span className="text-xs text-red-500">{errors.userAdmin.message}</span>
                            </div>
                        )}
                        <div className="md:col-span-2 border-t border-gray-200 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario administrador *</label>
                            <SearchUser isOpen={showModal} onClose={handleCloseModal} setUser={setUser} disabled={false} val={valUser}>
                                {user.length > 1 && (
                                    <div className="relative mt-1">
                                        <ul className="bg-white border rounded-md shadow-sm w-full">
                                            {user.map((searchResult) => (
                                                <li key={searchResult?.name}
                                                    className="hover:bg-gray-200 p-2 cursor-pointer"
                                                    onClick={() => setUser([searchResult])}>
                                                    {searchResult?.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </SearchUser>
                            <div id="userData" className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-md py-2 px-2">
                                {user[0]?.name ? `Usuario: ${user[0]?.name} - Email: ${user[0]?.email}` : 'No hay usuario administrador seleccionado'}
                                {user[0]?.name && <div className="mt-1">{user[0]?.address} - Tel: {user[0]?.phoneNumber}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'manager' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Nombre"
                            name="managerName"
                            register={register('managerName')}
                            error={errors.managerName}
                            placeholder="Nombre del representante"
                        />
                        <PhoneInput
                            label="Teléfono"
                            value={watch('managerPhoneNumber')}
                            onChange={(val) => setValue('managerPhoneNumber', val)}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                            <DropdownMenuButton
                                label={labelSelectedDocumentType}
                                options={optionsDocumentType}
                                renderOption={renderOption}
                                onSelect={handleChangeSelectedDocumentType}
                                valueSelected={labelSelectedDocumentType}
                            />
                        </div>
                        <FormField
                            label="Número de documento"
                            name="managerDocument"
                            register={register('managerDocument')}
                            error={errors.managerDocument}
                            placeholder="Documento"
                        />
                        <div className="md:col-span-2">
                            <FormField
                                label="Email"
                                name="managerEmail"
                                type="email"
                                register={register('managerEmail')}
                                error={errors.managerEmail}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                    </div>
                )}
            </div>
        </FormPageLayout>
    );
};

export default CompanyComponent;
