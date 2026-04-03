'use client'

import { createParticipant, getParticipantById } from '@/api/participant';
import { getAllDocumentTypes } from '@/api/documentType';
import { Participant } from '@/models/participant.entity';
import { DocumentType } from '@/models/documentType.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, SaveAsIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, ClipboardListIcon, PlusCircleIcon, StarIcon, SupportIcon, UserCircleIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import CurrentDateTime from '../utils/current-datetime';

type Props = {
    participantId?: string;
}

const ParticipantComponent: React.FC<Props> = ({ participantId }) => {
    const router = useRouter();
    const { closeTab } = useTabs();
    const [validateForm, setValidateForm] = useState<boolean>(false);
    const [participantID, setParticipantID] = useState<string>('');
    const [participantName, setParticipantName] = useState<string>('');
    const [participantNit, setParticipantNit] = useState<string>('');
    const [participantAddress, setParticipantAddress] = useState<string>('');
    const [participantPhoneNumber, setParticipantPhoneNumber] = useState<string>('');
    const [participantEmail, setParticipantEmail] = useState<string>('');
    const [participantManagerDataName, setParticipantManagerDataName] = useState<string>('');
    const [participantManagerDataDocumentType, setParticipantManagerDataDocumentType] = useState<any>();
    const [participantManagerDataDocument, setParticipantManagerDataDocument] = useState<string>('');
    const [participantManagerDataPhoneNumber, setParticipantManagerDataPhoneNumber] = useState<string>('');
    const [participantManagerDataEmail, setParticipantManagerDataEmail] = useState<string>('');
    const [participantCreditLimit, setParticipantCreditLimit] = useState<number>(0);
    const [activeTab, setActiveTab] = useState('participant');
    const [showModal, setShowModal] = useState(false);
    const [labelSelectedDocumentType, setLabelSelectedDocumentType] = useState<string>(getSafeKeyFromStorage('Select a type') ?? '');
    const [idDocumentTypeSelected, setIdDocumentTypeSelected] = useState<string>('');
    const [optionsDocumentType, setOptionsDocumentType] = useState<any[]>([]);
    const [participantId_, setParticipantId_] = useState<any>('');
    const participantClean: Participant = {
        _id: '',
        name: '',
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
        createdAt: new Date(Date.now()),
        createdBy: '',
        creditLimit: 0,
        avatar: '03.jpg'
    };
    const [participant, setParticipant] = useState<Participant>(participantClean);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setParticipantId_(participantId);
    }, [participantId]);

    //#region USE EFFECT
    useEffect(() => {
        const fetchData = async () => {
            try {
                const documentTypesResponse = await getAllDocumentTypes(1, 50);
                if (documentTypesResponse) {
                    documentTypesResponse?.documentTypes.forEach((element: DocumentType, index: any) => {
                        optionsDocumentType?.push({ _id: element?._id, description: element?.description, name: element.name, value: index, label: getSafeKeyFromStorage(element.name), icon: 'CheckCircleIcon' });
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
        router.query = {
            _id: participantId_
        }
        setParticipantID(router.query._id as unknown as string);
        const getDataParticipant = async () => {
            try {
                const responseParticipant: any = await getParticipantById(router.query._id as unknown as string);
                if (responseParticipant._id) {
                    setParticipant(responseParticipant);
                    setParticipantName(responseParticipant?.name);
                    setParticipantNit(responseParticipant?.nit);
                    setParticipantAddress(responseParticipant?.address);
                    setParticipantPhoneNumber(responseParticipant?.phoneNumber);
                    setParticipantEmail(responseParticipant?.email);
                    setParticipantManagerDataName(responseParticipant?.managerData?.name);
                    setParticipantManagerDataDocumentType(responseParticipant?.managerData?.documentType?._id);
                    setParticipantManagerDataDocument(responseParticipant?.managerData?.document);
                    setParticipantManagerDataEmail(responseParticipant?.managerData?.email);
                    setParticipantManagerDataPhoneNumber(responseParticipant?.managerData?.phoneNumber);
                    setParticipantCreditLimit(responseParticipant?.creditLimit);

                    setIdDocumentTypeSelected(responseParticipant?.managerData?.documentType?._id);
                    const selectedOptionDocumentType: any = optionsDocumentType.find((option) => option._id === responseParticipant?.managerData?.documentType?._id);
                    setLabelSelectedDocumentType(getSafeKeyFromStorage(selectedOptionDocumentType?.name) ?? '');
                }

            } catch (error) {
                setError(error.message);
            }
        };
        if (router.query._id) {
            getDataParticipant();
        }
    }, [participantId_]);

    useEffect(() => {
        if (participantName && participantNit && participantEmail && participantPhoneNumber && participantAddress && participantCreditLimit) {
            setValidateForm(true);
        }
    }, [participantName, participantNit, participantEmail, participantPhoneNumber, participantAddress, participantCreditLimit]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const participantData = {
            participantID, participantName, participantNit, participantAddress, participantPhoneNumber, participantEmail, participantCreditLimit
        }

        const participantManagerData = {
            name: participantManagerDataName,
            documentType: participantManagerDataDocumentType,
            document: participantManagerDataDocument,
            email: participantManagerDataEmail,
            phoneNumber: participantManagerDataPhoneNumber,
        }

        try {
            const participantResponse = await createParticipant(participantData, participantManagerData);
            if (participantResponse) {
                setSuccess('Participant created successfully');
                setParticipant(participantClean);
            } else {
                setError('Error creating participant');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/participant/participant-table');
    };

    const handleClean = () => {
        setSuccess('');
        setParticipantID('');
        setParticipant(participantClean);
        setParticipantName('');
        setParticipantNit('');
        setParticipantAddress('');
        setParticipantPhoneNumber('');
        setParticipantEmail('');
        setParticipantManagerDataName('');
        setParticipantManagerDataDocumentType('');
        setParticipantManagerDataDocument('');
        setParticipantManagerDataEmail('');
        setParticipantManagerDataPhoneNumber('');
        setParticipantCreditLimit(0);
        window.scrollTo(0, 0);
    };

    const handleChangeSelectedDocumentType = (option: any) => {
        if (!option) {
            return;
        }
        setLabelSelectedDocumentType(option?.label);
        setIdDocumentTypeSelected(option?._id);
        setParticipantManagerDataDocumentType(option?._id)
    };

    const renderOption = ({ label }) => label;

    return (
        <div className='w-full h-full px-4 mt-4'>
            <div className="hidden flex-col md:flex">
                <div className="flex-1 space-y-4 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">Panel general de gestión de participantes</h2>
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
                    <CardTitle className='flex items-center justify-between' >
                        <div>
                            {!participantID && <div>Datos generales del nuevo participante</div>}
                            {participantID && <div>Datos generales del participante</div>}
                        </div>
                        <div className="flex items-center justify-end">
                            <StarIcon
                                data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="Generate support and new features"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                                onClick={() => {
                                    setShowModal(true);
                                    //setIsLoading(true);
                                }}
                            />
                            <SupportIcon
                                data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="Init tour"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                            />
                        </div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0'>
                        Información general del participante.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='min-w-md gap-x-8' >
                        {!success && <form onSubmit={handleSubmit}>
                            <div className="flex flex-col space-y-4 max-h-dvh" style={{ marginTop: '-14px !important' }}>
                                <div className="pb-2 mt-0">
                                    <div className="mr-1 mt-2">
                                        <nav className="flex space-x-4">
                                            <div className={`py-2 px-4 font-semibold ${activeTab === 'participant' ? "text-gray-600 border-b-4 border-blue-600" : "border-b-2 border-white text-gray-600 hover:text-blue-500"} hover:text-gray-800`}
                                                onClick={() => setActiveTab('participant')}>
                                                <div className='flex flex-grid'>
                                                    <ClipboardListIcon className="h-8 w-8 justify-end text-gray-600 mr-2" aria-hidden="true" />
                                                    <div className='justify-end mt-1'>Información del participante</div>
                                                </div>
                                            </div>
                                            <div className={`py-2 px-4 font-semibold ${activeTab === 'manager' ? "text-gray-600 border-b-4 border-gray-600" : "border-b-2 border-white text-gray-600 hover:text-blue-500"} hover:text-gray-800`}
                                                onClick={() => setActiveTab('manager')}>
                                                <div className='flex flex-grid'>
                                                    <UserCircleIcon className="h-8 w-8 justify-end text-gray-600 mr-2" aria-hidden="true" />
                                                    <div className='justify-end mt-1'>Representante</div>
                                                </div>
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                                {activeTab === 'participant' && (
                                    <div className="pb-2 mt-0">
                                        <div className="mt-0 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="participantName"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Nombre completo
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        name="participantName"
                                                        id="participantName"
                                                        value={participantName}
                                                        onChange={(e) => setParticipantName(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="participantNit"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    NIT
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        name="participantNit"
                                                        id="participantNit"
                                                        value={participantNit}
                                                        onChange={(e) => setParticipantNit(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="participantPhoneNumber"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Número de telefono
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        id="participantPhoneNumber"
                                                        name="participantPhoneNumber"
                                                        type="text"
                                                        value={participantPhoneNumber}
                                                        onChange={(e) =>
                                                            setParticipantPhoneNumber(e.target?.value.replace(/[^0-9]/g, ''))
                                                        }
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="participantCreditLimit"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Límite de crédito
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        id="participantCreditLimit"
                                                        name="participantCreditLimit"
                                                        type="text"
                                                        value={participantCreditLimit}
                                                        onChange={(e) =>
                                                            setParticipantCreditLimit(
                                                                Number(e.target.value.replace(/[^0-9]/g, ''))
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                            <div className="sm:col-span-12">
                                                <label
                                                    htmlFor="participantEmail"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Correo electrónico
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        name="participantEmail"
                                                        id="participantEmail"
                                                        value={participantEmail}
                                                        onChange={(e) => setParticipantEmail(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-12">
                                            <div className="sm:col-span-12">
                                                <label
                                                    htmlFor="participantAddress"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Dirección de residencia
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        name="participantAddress"
                                                        id="participantAddress"
                                                        value={participantAddress}
                                                        onChange={(e) => setParticipantAddress(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'manager' && (
                                    <div className="pb-2 mt-0">
                                        <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="participantManagerDataName"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Nombre completo
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        id="participantManagerDataName"
                                                        name="participantManagerDataName"
                                                        type="text"
                                                        value={participantManagerDataName}
                                                        onChange={(e) => setParticipantManagerDataName(e.target.value)}
                                                        autoComplete="participantManagerDataName"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="participantManagerDataPhoneNumber"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Número de telefono
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        id="participantManagerDataPhoneNumber"
                                                        name="participantManagerDataPhoneNumber"
                                                        type="text"
                                                        value={participantManagerDataPhoneNumber}
                                                        onChange={(e) =>
                                                            setParticipantManagerDataPhoneNumber(
                                                                e.target?.value.replace(/[^0-9]/g, '')
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="documentType"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Tipo de documento
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
                                                    htmlFor="participantManagerDataDocument"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Número de documento
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        name="participantManagerDataDocument"
                                                        id="participantManagerDataDocument"
                                                        value={participantManagerDataDocument}
                                                        onChange={(e) =>
                                                            setParticipantManagerDataDocument(
                                                                e.target?.value.replace(/[^0-9]/g, '')
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                            <div className="sm:col-span-12">
                                                <label
                                                    htmlFor="participantManagerDataEmail"
                                                    className="block text-sm font-medium leading-6 text-gray-900"
                                                >
                                                    Correo electrónico
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="email"
                                                        name="participantManagerDataEmail"
                                                        id="participantManagerDataEmail"
                                                        value={participantManagerDataEmail}
                                                        onChange={(e) => setParticipantManagerDataEmail(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 flex items-center justify-end gap-x-6">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                                            <ArrowCircleLeftIcon
                                                name="success"
                                                className="h-6 w-8 text-white"
                                                color="#FFFFFF"
                                            />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                closeTab(`${participantID ? `/Participante?_id=${participantId_}&origin=participant` : '/Participante'}`);
                                            }}
                                            type="button"
                                            className="bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                                            <SaveAsIcon
                                                name="success"
                                                className="h-6 w-8 text-white-500"
                                                color="#FFFFFF"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!validateForm}
                                            className={`${validateForm
                                                ? 'bg-blue-600 hover:bg-blue-500 '
                                                : 'bg-gray-500 hover:bg-gray-500 '
                                                }rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                                        >
                                            Guardar datos del participante
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>}
                        {success && <div className="relative inset-0 flex items-center justify-center z-50 mt-40" style={{ pointerEvents: 'auto' }} >
                            <div className="bg-white rounded-lg shadow-lg p-8" >
                                <div className="flex h-6 items-center justify-center pt-2">
                                    <CheckCircleIcon name="beakerIcon" className="h-9 w-9 text-white-500 mr-2" color="#3c763d" />
                                    <div className="text-sm leading-6">
                                        <div className="font-medium text-gray-900">
                                            Exito en la actualización del participante
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-0 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-10">
                                    <div className="sm:col-span-5">
                                        <div className="relative mt-8">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                                <ViewListIcon name="viewListIcon" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    closeTab(`/Participante?_id=${participantId_}&origin=participant`);
                                                }}
                                                className="rounded-md bg-green-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 text-white"
                                            >
                                                Salir
                                            </button>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-5">
                                        <div className="relative mt-8">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                                <PlusCircleIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleClean}
                                                className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white"
                                            >
                                                Agregar nuevo participante
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
};

export default ParticipantComponent;
