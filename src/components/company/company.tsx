'use client';

import { createCompany, getCompanyById } from '@/api/company';
import { getAllDocumentTypes } from '@/api/documentType';
import { Company } from '@/models/company.entity';
import { DocumentType } from '@/models/documentType.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import { ArrowCircleLeftIcon, SaveAsIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, ClipboardListIcon, PlusCircleIcon, StarIcon, SupportIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/solid';
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

    const [validateForm, setValidateForm] = useState<boolean>(false);
    const [companyID, setCompanyID] = useState<string>('');
    const [companyName, setCompanyName] = useState<string>('');
    const [companySlogan, setCompanySlogan] = useState<string>('');
    const [companyNit, setCompanyNit] = useState<string>('');
    const [companyAddress, setCompanyAddress] = useState<string>('');
    const [companyPhoneNumber, setCompanyPhoneNumber] = useState<string>('');
    const [companyBillingRangeNumber, setCompanyBillingRangeNumber] = useState<string>('');
    const [companyEmail, setCompanyEmail] = useState<string>('');
    const [companyManagerDataName, setCompanyManagerDataName] = useState<string>('');
    const [companyManagerDataDocumentType, setCompanyManagerDataDocumentType] = useState<any>();
    const [companyManagerDataDocument, setCompanyManagerDataDocument] = useState<string>('');
    const [companyManagerDataPhoneNumber, setCompanyManagerDataPhoneNumber] = useState<string>('');
    const [companyManagerDataEmail, setCompanyManagerDataEmail] = useState<string>('');
    const [companyUserAdmin, setCompanyUserAdmin] = useState<any>();
    const [companyIsMain, setCompanyIsMain] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState('company');
    const [labelSelectedDocumentType, setLabelSelectedDocumentType] = useState<string>('Select type');
    const [idDocumentTypeSelected, setIdDocumentTypeSelected] = useState<string>('');
    const [optionsDocumentType, setOptionsDocumentType] = useState<any[]>([]);
    const [user, setUser] = useState<any[]>([]);
    const [valUser, setValUser] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const companyClean: Company = {
        _id: '',
        name: '',
        slogan: '',
        email: '',
        nit: '',
        address: '',
        phoneNumber: '',
        managerData: {
            name: '',
            documentType: {} as unknown as DocumentType,
            document: '',
            email: '',
            phoneNumber: '',
        },
        createdAt: new Date(),
        createdBy: '',
        userAdmin: {} as unknown as User,
        modules: {
            billing: {
                seriesCurrentBillingRange: ''
            }
        },
        isMain: false
    };

    const [company, setCompany] = useState<Company>(companyClean);

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

    // Load company data for editing
    useEffect(() => {
        const getDataCompany = async () => {
            try {
                const responseCompany: any = await getCompanyById(resolvedCompanyId);
                if (responseCompany?._id) {
                    setCompany(responseCompany);
                    setCompanyName(responseCompany?.name);
                    setCompanySlogan(responseCompany?.slogan);
                    setCompanyNit(responseCompany?.nit);
                    setCompanyAddress(responseCompany?.address);
                    setCompanyPhoneNumber(responseCompany?.phoneNumber);
                    setCompanyEmail(responseCompany?.email);
                    setCompanyManagerDataName(responseCompany?.managerData?.name);
                    setCompanyManagerDataDocumentType(responseCompany?.managerData?.documentType);
                    setCompanyManagerDataDocument(responseCompany?.managerData?.document);
                    setCompanyManagerDataEmail(responseCompany?.managerData?.email);
                    setCompanyManagerDataPhoneNumber(responseCompany?.managerData?.phoneNumber);
                    setCompanyBillingRangeNumber(responseCompany?.modules?.billing?.seriesCurrentBillingRange);
                    setCompanyUserAdmin(responseCompany?.userAdmin?._id);
                    setCompanyIsMain(responseCompany?.isMain);
                    setValUser(responseCompany?.userAdmin?.documentNumber);
                    setUser([responseCompany?.userAdmin]);
                    setIdDocumentTypeSelected(responseCompany?.managerData?.documentType?._id);

                    const selectedOptionDocumentType: any = optionsDocumentType.find(
                        (option) => option._id === responseCompany?.managerData?.documentType?._id
                    );
                    setLabelSelectedDocumentType(selectedOptionDocumentType?.name);
                }
            } catch (error: any) {
                toast.error(error.message);
            }
        };

        if (isEditing && optionsDocumentType.length > 0) {
            setCompanyID(resolvedCompanyId);
            getDataCompany();
        }
    }, [resolvedCompanyId, isEditing, optionsDocumentType.length]);

    // Validate form
    useEffect(() => {
        if (companyName && companySlogan && companyNit && companyEmail && companyPhoneNumber && companyAddress && companyUserAdmin && companyBillingRangeNumber) {
            setValidateForm(true);
        } else {
            setValidateForm(false);
        }
    }, [companyName, companySlogan, companyNit, companyEmail, companyPhoneNumber, companyAddress, companyUserAdmin, companyBillingRangeNumber]);

    // Sync user selection
    useEffect(() => {
        if (user[0]?._id !== '') {
            setValUser(user[0]?.documentNumber);
            setCompanyUserAdmin(user[0]?._id);
        }
    }, [user[0]?._id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm) {
            toast.warning('Complete todos los campos obligatorios');
            return;
        }

        setIsSubmitting(true);

        const companyData = {
            companyID, companySlogan, companyName, companyNit, companyAddress, companyPhoneNumber,
            companyEmail, companyUserAdmin, companyBillingRangeNumber, companyIsMain
        };

        const companyManagerData = {
            name: companyManagerDataName,
            documentType: companyManagerDataDocumentType,
            document: companyManagerDataDocument,
            email: companyManagerDataEmail,
            phoneNumber: companyManagerDataPhoneNumber
        };

        try {
            const companyResponse = await createCompany(companyData, companyManagerData);
            if (companyResponse) {
                toast.success('Institución guardada exitosamente');
                setTimeout(() => closeTabWithRefresh(currentTabId, true), 1000);
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
        setCompanyID('');
        setCompany(companyClean);
        setCompanyName('');
        setCompanyNit('');
        setCompanyAddress('');
        setCompanyPhoneNumber('');
        setCompanyEmail('');
        setCompanyManagerDataName('');
        setCompanyManagerDataDocumentType({});
        setCompanyManagerDataDocument('');
        setCompanyManagerDataEmail('');
        setCompanyManagerDataPhoneNumber('');
        setCompanyUserAdmin('');
        setCompanyBillingRangeNumber('');
        setCompanySlogan('');
        setCompanyIsMain(false);
        window.scrollTo(0, 0);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChangeSelectedDocumentType = (option: any) => {
        if (!option) return;
        setLabelSelectedDocumentType(option?.label);
        setIdDocumentTypeSelected(option?._id);
        setCompanyManagerDataDocumentType(option?._id);
    };

    const renderOption = ({ label }: { label: string }) => label;

    return (
        <FormPageLayout
            title={isEditing ? 'Editar Institución' : 'Nueva Institución'}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
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
                        <ToggleSwitch initialValue={companyIsMain} label="Principal" handleChange={setCompanyIsMain} />
                    </div>
                </div>

                {activeTab === 'company' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                            <input type="text" id="companyName" value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="companyNit" className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                            <input type="text" id="companyNit" value={companyNit}
                                onChange={(e) => setCompanyNit(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="companySlogan" className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                            <input type="text" id="companySlogan" value={companySlogan}
                                onChange={(e) => setCompanySlogan(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="companyEmail" value={companyEmail}
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="companyPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input type="text" id="companyPhoneNumber" value={companyPhoneNumber}
                                onChange={(e) => setCompanyPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="companyBillingRangeNumber" className="block text-sm font-medium text-gray-700 mb-1">Rango facturación</label>
                            <input type="text" id="companyBillingRangeNumber" value={companyBillingRangeNumber}
                                onChange={(e) => setCompanyBillingRangeNumber(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input type="text" id="companyAddress" value={companyAddress}
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div className="md:col-span-2 border-t border-gray-200 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario administrador</label>
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
                        <div>
                            <label htmlFor="companyManagerDataName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input type="text" id="companyManagerDataName" value={companyManagerDataName}
                                onChange={(e) => setCompanyManagerDataName(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="companyManagerDataPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input type="text" id="companyManagerDataPhoneNumber" value={companyManagerDataPhoneNumber}
                                onChange={(e) => setCompanyManagerDataPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                            <DropdownMenuButton
                                label={labelSelectedDocumentType}
                                options={optionsDocumentType}
                                renderOption={renderOption}
                                onSelect={handleChangeSelectedDocumentType}
                                valueSelected={labelSelectedDocumentType}
                            />
                        </div>
                        <div>
                            <label htmlFor="companyManagerDataDocument" className="block text-sm font-medium text-gray-700 mb-1">Número de documento</label>
                            <input type="text" id="companyManagerDataDocument" value={companyManagerDataDocument}
                                onChange={(e) => setCompanyManagerDataDocument(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="companyManagerDataEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="companyManagerDataEmail" value={companyManagerDataEmail}
                                onChange={(e) => setCompanyManagerDataEmail(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                    </div>
                )}
            </div>
        </FormPageLayout>
    );
};

export default CompanyComponent;
