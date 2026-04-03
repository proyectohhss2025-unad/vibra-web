'use client'

import { createCompany, getCompanyById } from '@/api/company';
import { getAllDocumentTypes } from '@/api/documentType';
import { Company } from '@/models/company.entity';
import { DocumentType } from '@/models/documentType.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { ArrowCircleLeftIcon, SaveAsIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, ClipboardListIcon, PlusCircleIcon, StarIcon, SupportIcon, UserCircleIcon, UserGroupIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../../components/ui/notification/notification.css';
import ToggleSwitch from '../forms/toggleSwitch';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import CurrentDateTime from '../utils/current-datetime';
import SearchUser from '../search/search-user';
import './company.css';

type CompanyComponentProps = {
    companyId?: string;
};

const CompanyComponent: React.FC<CompanyComponentProps> = ({ companyId }) => {
    const router = useRouter();
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //#region USE EFFECT
    useEffect(() => {
        const fetchData = async () => {
            try {
                const documentTypesResponse = await getAllDocumentTypes(1, 50);
                if (documentTypesResponse) {
                    documentTypesResponse?.documentTypes.forEach((element: DocumentType, index: any) => {
                        optionsDocumentType?.push({ _id: element?._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsDocumentType(optionsDocumentType);
                }
            } catch (error) {
                setError(error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const getDataCompany = async () => {
            try {
                const responseCompany: any = await getCompanyById(router.query._id as unknown as string);
                if (responseCompany._id) {
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

            } catch (error) {
                setError(error.message);
            }
        };
        if (router.query._id) {
            setCompanyID(router.query._id as unknown as string);
            getDataCompany();
        }
    }, [router.query._id, optionsDocumentType.length]);

    useEffect(() => {
        if (companyName && companySlogan && companyNit && companyEmail && companyPhoneNumber && companyAddress && companyUserAdmin && companyBillingRangeNumber) {
            setValidateForm(true);
        }
    }, [companyName, companySlogan, companyNit, companyEmail, companyPhoneNumber, companyAddress, companyUserAdmin, companyBillingRangeNumber]);

    useEffect(() => {
        if (user[0]?._id !== '') {
            setValUser(user[0]?.documentNumber);
            setCompanyUserAdmin(user[0]?._id);
        }
    }, [user[0]?._id]);



    //#endregion

    //#region HANDLES ZONE

    const handleSubmit = async (e) => {
        e.preventDefault();

        const companyData = {
            companyID, companySlogan, companyName, companyNit, companyAddress, companyPhoneNumber, companyEmail, companyUserAdmin, companyBillingRangeNumber,
            companyIsMain
        }

        const companyManagerData = {
            name: companyManagerDataName,
            documentType: companyManagerDataDocumentType,
            document: companyManagerDataDocument,
            email: companyManagerDataEmail,
            phoneNumber: companyManagerDataPhoneNumber
        }

        try {
            const companyResponse = await createCompany(companyData, companyManagerData);
            if (companyResponse) {
                setSuccess('Company created successfully');
                setCompany(companyClean);
            } else {
                setError('Error creating company');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/company/company-table');
    };

    const handleClean = () => {
        setSuccess('');
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
        if (!option) {
            return;
        }
        setLabelSelectedDocumentType(option?.label);
        setIdDocumentTypeSelected(option?._id);
        setCompanyManagerDataDocumentType(option?._id)
    };

    const renderOption = ({ label }) => label;

    //#endregion

    return (
        <div className='w-full h-full px-4 mx-0'>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="flex-1 space-y-4 pt-2">
                    <div className="flex items-center justify-between space-y-0">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">Información general de compañías</h2>
                        <div className="flex items-center space-x-2">
                            <Card className="col-span-12 bg-white rounded-md px-2 pl-2 pb-1">
                                <CurrentDateTime />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <Card className="col-span-4 bg-white rounded-md w-full mt-3">
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <div className="flex items-center">
                            <UserGroupIcon className="h-6 w-6 text-blue-600 mr-2" />
                            Gestión de Compañías
                        </div>
                        <div className="flex items-center justify-end">
                            <StarIcon
                                data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="Generate support and new features"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                                onClick={() => setShowModal(true)}
                            />
                            <SupportIcon
                                data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="Init tour"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                            />
                        </div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0'>
                        Cree y gestione compañías, configure datos del representante y módulos de facturación
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success && <form onSubmit={handleSubmit}>
                        <div className="flex flex-col space-y-2">
                            <div className="pb-2 mt-0">
                                <div className="mr-1">
                                    <nav className="flex space-x-4">
                                        <div className={`py-2 px-4 font-semibold ${activeTab === 'company' ? "text-gray-600 border-b-4 border-blue-600" : "border-b-2 border-white text-gray-600 hover:text-blue-500"} hover:text-gray-800`}
                                            onClick={() => setActiveTab('company')}>
                                            <div className='flex flex-grid'>
                                                <ClipboardListIcon className="h-8 w-8 justify-end text-gray-600 mr-2" aria-hidden="true" />
                                                <div className='justify-end mt-1'>Company</div>
                                            </div>
                                        </div>
                                        <div className={`py-2 px-4 font-semibold ${activeTab === 'manager' ? "text-gray-600 border-b-4 border-gray-600" : "border-b-2 border-white text-gray-600 hover:text-blue-500"} hover:text-gray-800`}
                                            onClick={() => setActiveTab('manager')}>
                                            <div className='flex flex-grid'>
                                                <UserCircleIcon className="h-8 w-8 justify-end text-gray-600 mr-2" aria-hidden="true" />
                                                <div className='justify-end mt-1'>Manager</div>
                                            </div>
                                        </div>
                                        <div className='ml-4 flex items-center'>
                                            <ToggleSwitch className='ml-20' initialValue={companyIsMain} label="Is main" handleChange={setCompanyIsMain} />
                                        </div>
                                    </nav>
                                </div>
                            </div>
                            {activeTab === 'company' && (
                                <div className="pb-2 max-w-4xl min-w-md mt-0">
                                    <div className="mt-0 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyName"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Full name
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    id="companyName"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyNit"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                NIT
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="companyNit"
                                                    id="companyNit"
                                                    value={companyNit}
                                                    onChange={(e) => setCompanyNit(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companySlogan"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Slogan
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="companySlogan"
                                                    id="companySlogan"
                                                    value={companySlogan}
                                                    onChange={(e) => setCompanySlogan(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyEmail"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Email
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="email"
                                                    name="companyEmail"
                                                    id="companyEmail"
                                                    value={companyEmail}
                                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyPhoneNumber"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Phone number
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="companyPhoneNumber"
                                                    name="companyPhoneNumber"
                                                    type="text"
                                                    value={companyPhoneNumber}
                                                    onChange={(e) =>
                                                        setCompanyPhoneNumber(e.target?.value.replace(/[^0-9]/g, ''))
                                                    }
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyBillingRangeNumber"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Billing range number
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="companyBillingRangeNumber"
                                                    name="companyBillingRangeNumber"
                                                    type="text"
                                                    value={companyBillingRangeNumber}
                                                    onChange={(e) => setCompanyBillingRangeNumber(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                        <div className="sm:col-span-12">
                                            <label
                                                htmlFor="companyAddress"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Address
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="companyAddress"
                                                    id="companyAddress"
                                                    value={companyAddress}
                                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12 border-t border-gray-200">
                                        <div className="sm:col-span-12">
                                            <label
                                                className="flex items-center text-sm font-semibold leading-6 text-gray-900 mt-3"
                                            >
                                                User admin
                                            </label>
                                            <div className="mt-2">
                                                <SearchUser isOpen={showModal} onClose={handleCloseModal} setUser={setUser} disabled={false} val={valUser} >
                                                    {user.length > 1 && (
                                                        <div className="relative left-6 mt-1">
                                                            <ul className="bg-white border rounded-md shadow-sm w-full">
                                                                {user.map((searchResult) => (
                                                                    <li key={searchResult?.name}
                                                                        className="hover:bg-gray-200 p-2"
                                                                        onClick={() => setUser(searchResult)} >
                                                                        {searchResult?.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </SearchUser>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                        <div className="sm:col-span-12 items-center max-w-4xl">
                                            <div id="userData"
                                                className="text-truncate border-0 bg-gray-50 rounded-md py-2 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" >
                                                {user[0]?.name != undefined && user[0]?.email != '' ? `User: ${user[0]?.name} - Email: ${user[0]?.email}` : ''}
                                                {user[0]?.name != undefined && user[0]?.email != '' && <div><p></p></div>}
                                                {user[0]?.name != undefined && user[0]?.email != '' ? `Address: ${user[0]?.address} - Phone Number: ${user[0]?.phoneNumber}`
                                                    : 'There is no user admin selected'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'manager' && (
                                <div className="pb-2 max-w-4xl min-w-md">
                                    <div className="mt-0 grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-12">
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyManagerDataName"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Name
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="companyManagerDataName"
                                                    name="companyManagerDataName"
                                                    type="text"
                                                    value={companyManagerDataName}
                                                    onChange={(e) => setCompanyManagerDataName(e.target.value)}
                                                    autoComplete="companyManagerDataName"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyManagerDataPhoneNumber"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Phone number
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="companyManagerDataPhoneNumber"
                                                    name="companyManagerDataPhoneNumber"
                                                    type="text"
                                                    value={companyManagerDataPhoneNumber}
                                                    onChange={(e) =>
                                                        setCompanyManagerDataPhoneNumber(
                                                            e.target?.value.replace(/[^0-9]/g, '')
                                                        )
                                                    }
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-12">
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="documentType"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Document type
                                            </label>
                                            <div className="mt-2">
                                                <DropdownMenuButton
                                                    label={labelSelectedDocumentType}
                                                    options={optionsDocumentType}
                                                    renderOption={renderOption}
                                                    onSelect={handleChangeSelectedDocumentType}
                                                    valueSelected={labelSelectedDocumentType}
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="companyManagerDataDocument"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Document number
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="companyManagerDataDocument"
                                                    id="companyManagerDataDocument"
                                                    value={companyManagerDataDocument}
                                                    onChange={(e) =>
                                                        setCompanyManagerDataDocument(
                                                            e.target?.value.replace(/[^0-9]/g, '')
                                                        )
                                                    }
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-12">
                                        <div className="sm:col-span-12">
                                            <label
                                                htmlFor="companyManagerDataEmail"
                                                className="block text-sm font-medium leading-6 text-gray-900"
                                            >
                                                Email
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="email"
                                                    name="companyManagerDataEmail"
                                                    id="companyManagerDataEmail"
                                                    value={companyManagerDataEmail}
                                                    onChange={(e) => setCompanyManagerDataEmail(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button type="button" onClick={handleCancel} className="text-sm font-semibold leading-6 text-gray-900">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!validateForm}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${validateForm ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-400'}`}
                                >
                                    Guardar compañía
                                </button>
                            </div>
                        </div>
                    </form>}
                    {success && <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">Compañía guardada exitosamente</p>
                            </div>
                            <div className="ml-auto pl-3 flex gap-x-2">
                                <button
                                    type="button"
                                    onClick={() => router.push('/company/company-table')}
                                    className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                                >
                                    Ver listado
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClean}
                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                >
                                    Nueva compañía
                                </button>
                            </div>
                        </div>
                    </div>}
                </CardContent>
            </Card>
        </div>
    );
};

export default CompanyComponent;