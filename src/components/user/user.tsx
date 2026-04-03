'use client'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { formatDate } from '@/utils/dates';
import { Gender } from '@/utils/enum';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, PlusCircleIcon, SaveAsIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import '../../components/ui/notification/notification.css';
import ToggleSwitch from '../forms/toggleSwitch';
import NotificationInline from '../layouts/icon/notification-inline';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Modal from '../layouts/modal/modal';
import MiniUserDataPage from '../permission/mini-user-data-page';
import CurrentDateTime from '../utils/current-datetime';
import './user.css';

type UserComponentProps = {
    userId?: string;
};

const UserComponent: React.FC<UserComponentProps> = ({ userId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token } = useContext(AuthContext);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [labelSelectedRole, setLabelSelectedRole] = useState<string>('Select role user');
    const [labelSelectedDocumentType, setLabelSelectedDocumentType] = useState<string>('Select type');
    const [labelSelectedCompany, setLabelSelectedCompany] = useState<string>('Select company');
    const [optionsRole, setOptionsRole] = useState<any[]>([]);
    const [optionsCompany, setOptionsCompany] = useState<any[]>([]);
    const [optionsDocumentType, setOptionsDocumentType] = useState<any[]>([]);
    const [showModalPermissions, setShowModalPermissions] = useState(false);
    const [idRoleSelected, setIdRoleSelected] = useState<string>('');
    const [idDocumentTypeSelected, setIdDocumentTypeSelected] = useState<string>('');
    const [idCompanySelected, setIdCompanySelected] = useState<string>('');
    const [validateForm, setValidateForm] = useState<boolean>(false);
    const [userID, setUserID] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [userDocumentType, setUserDocumentType] = useState<string>('');
    const [userAddress, setUserAddress] = useState<string>('');
    const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');
    const [userUserName, setUserUserName] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');
    const [userDocumentNumber, setUserDocumentNumber] = useState<string>('');
    const [userCompany, setUserCompany] = useState<string>('');
    const [userGender, setUserGender] = useState(Gender.MALE);
    const [userBirthDate, setUserBirthDate] = useState<any | null>(formatDate(new Date('1983-09-03'), 'yyyy-MM-DD'));
    const userClean: User = {
        _id: '',
        userId: '',
        password: '',
        name: '',
        email: '',
        documentType: {} as unknown as DocumentType,
        documentNumber: '',
        address: '',
        phoneNumber: '',
        username: '',
        role: {} as unknown as Role,
        company: {} as unknown as Company,
        createdAt: new Date(),
        createdBy: '',
        isLogged: false
    };

    const [user, setUser] = useState(userClean);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsAuthenticated(!!token);
    }, [token]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Group the promises
                const [
                    processResponse,
                    companyResponse,
                    documentTypesResponse,
                ] = await Promise.all([
                    getAllRoles(1, 50),
                    getAllCompanies(1, 50),
                    getAllDocumentTypes(1, 50),
                ]);

                // Process data for each response
                if (processResponse) {
                    processResponse.roles.forEach(
                        (element: Role, index) =>
                            optionsRole?.push({
                                _id: element._id,
                                description: element?.description,
                                name: element.name,
                                value: index,
                                label: element.name,
                                icon: 'CheckCircleIcon',
                            })
                    );
                    setOptionsRole(optionsRole);
                }

                if (companyResponse) {
                    companyResponse.companies.forEach(
                        (element: Company, index) =>
                            optionsCompany?.push({
                                _id: element._id,
                                description: element?.slogan,
                                name: element.name,
                                value: index,
                                label: element.name,
                                icon: 'CheckCircleIcon',
                            })
                    );
                    setOptionsCompany(optionsCompany);
                }

                if (documentTypesResponse) {
                    console.log('documentTypesResponse.documentTypes:', documentTypesResponse.documentTypes);
                    documentTypesResponse.documentTypes.forEach(
                        (element: DocumentType, index) =>
                            optionsDocumentType?.push({
                                _id: element?._id,
                                description: element?.description,
                                name: element.name,
                                value: index,
                                label: element.name,
                                icon: 'CheckCircleIcon',
                            })
                    );
                    setOptionsDocumentType(optionsDocumentType);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    /* useEffect(() => {
        const fetchData = async () => {
            try {
                const processResponse = await getAllRoles(1, 50);
                if (processResponse) {
                    //setRoles(processResponse.roles);

                    processResponse?.roles.forEach((element: Role, index) => {
                        optionsRole?.push({ _id: element._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsRole(optionsRole);
                }

                const companyResponse = await getAllCompanies(1, 50);
                if (companyResponse) {
                    companyResponse?.company.forEach((element: Role, index) => {
                        optionsCompany?.push({ _id: element._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsCompany(optionsCompany);
                }

                const documentTypesResponse = await getAllDocumentTypes(1, 50);
                if (documentTypesResponse) {
                    //setDocumentTypes(documentTypesResponse.documentTypes);

                    documentTypesResponse?.documentTypes.forEach((element: DocumentType, index) => {
                        optionsDocumentType?.push({ _id: element?._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsDocumentType(optionsDocumentType);
                }
            } catch (error) {
                setError(error.message);
            }
        };
        fetchData();
    }, []); */

    const queryUserId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedUserId = String(userId ?? queryUserId ?? '');

    useEffect(() => {
        setUserID(resolvedUserId);
        const getDataParticipant = async () => {
            try {
                const responseUser: any = await getUserById(resolvedUserId);
                if (responseUser._id) {
                    setUser(responseUser);
                    setUserEmail(responseUser?.email);
                    setUserName(responseUser?.name);
                    setUserUserName(responseUser?.username);
                    setUserDocumentType(responseUser?.documentType);
                    setUserAddress(responseUser?.address);
                    setUserPhoneNumber(responseUser?.phoneNumber);
                    setUserDocumentNumber(responseUser?.documentNumber);
                    setUserRole(responseUser?.role);
                    setUserCompany(responseUser?.company);
                    setUserGender(responseUser?.gender);
                    setUserBirthDate(formatDate(responseUser?.birthDate, 'YYYY-MM-DD'));

                    setIdDocumentTypeSelected(responseUser?.documentType?._id);
                    const selectedOptionDocumentType: any = optionsDocumentType.find((option) => option._id === responseUser?.documentType?._id);
                    setLabelSelectedDocumentType(getSafeKeyFromStorage(selectedOptionDocumentType?.name) ?? '');

                    setIdRoleSelected(responseUser?.role?._id);
                    const selectedOptionRole: any = optionsRole.find((option) => option._id === responseUser?.role?._id);
                    setLabelSelectedRole(selectedOptionRole?.name);

                    setIdCompanySelected(responseUser?.company?._id);
                    const selectedOptionCompany: any = optionsCompany.find((option) => option._id === responseUser?.company?._id);
                    setLabelSelectedCompany(selectedOptionCompany?.name);
                }

            } catch (error) {
                setError(error.message);
            }
        };
        if (resolvedUserId && resolvedUserId !== 'undefined' && resolvedUserId !== 'null') {
            getDataParticipant();
        }
    }, [resolvedUserId, optionsRole.length, optionsCompany.length, optionsDocumentType.length]);

    //INFO: permissions
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userID) {
                    /*const permissionsResponse = await getAllPermissionsByUser(userID, 1, 100);
                    if (permissionsResponse) {
                        const permissionsAux: Permission[] = [];
                        permissionsResponse.userPermissions.map((permission: UserPermission) => {
                            if (!permission?.deleted) {
                                permissionsAux.push(permission?.permission);
                            }
                        });
                        setPermissions(permissionsAux);
                    }*/
                }
            } catch (error) {
                console.log('error: ', error)
            }
        };
        if (permissions.length === 0) {
            fetchData();
        }
    }, [userID]);

    /*
    useEffect(() => {
        if (userID != '') {
            console.log('userDocumentType:', userDocumentType);
            setUser({
                _id: userID,
                password: '****',
                name: userName,
                email: userEmail,
                documentType: { _id: userDocumentType } as unknown as DocumentType,
                documentNumber: userDocumentNumber,
                address: userAddress,
                phoneNumber: userPhoneNumber,
                username: userUserName,
                role: {
                    _id: userRole
                } as unknown as Role,
                company: {
                    _id: userCompany
                } as unknown as Company,
                createdAt: new Date(),
                createdBy: user_.name
            });

            const selectedOptionRole: any = optionsRole.find((option) => option._id == userRoleId);
            setIdRolSelected(selectedOptionRole?._id);
            setLabelSelectedRole(selectedOptionRole?.name);

            const selectedOptionsDocumentType: any = optionsDocumentType.find((option) => option._id === userDocumentType);
            setIdDocumentTypeSelected(selectedOptionsDocumentType?._id);
            setLabelSelectedDocumentType(selectedOptionsDocumentType?.name);
        }
    }, [userID, userRoleId, userName, userEmail, userDocumentType, userDocumentNumber, userAddress, userPhoneNumber, userUserName, optionsRole.length, optionsDocumentType.length]);
*/

    useEffect(() => {
        if (userName && userEmail && idDocumentTypeSelected && userDocumentNumber && idRoleSelected && idCompanySelected) {
            setValidateForm(true);
        }
    }, [userName, userEmail, idDocumentTypeSelected, userDocumentNumber, idRoleSelected, idCompanySelected]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userResponse = await createUser(userID, userName, idDocumentTypeSelected, userDocumentNumber, userAddress, userPhoneNumber, userEmail, userUserName, idRoleSelected, idCompanySelected, userGender, userBirthDate);
            // if (userResponse.status === 201) {
            if (userResponse) {
                setSuccess('User created successfully');
                setUser(userClean);
            } else {
                setError('Error creating user');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/user/user-table');
    };

    const handleChangeSelected = (option: any) => {
        if (!option) {
            return;
        }
        setLabelSelectedRole(option?.label);
        setIdRoleSelected(option?._id);
    };

    const handleChangeSelectedDocumentType = (option: any) => {
        if (!option) {
            return;
        }
        setLabelSelectedDocumentType(option?.label);
        setIdDocumentTypeSelected(option?._id);
    };

    const handleChangeSelectedCompany = (option: any) => {
        if (!option) {
            return;
        }
        setLabelSelectedCompany(option?.label);
        setIdCompanySelected(option?._id);
    };


    const renderOption = ({ label }) => label;

    const handleCloseModalPermissions = () => {
        setShowModalPermissions(false);
    };

    const handleClean = () => {
        setSuccess('');
        window.scrollTo(0, 0);
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            <div className='w-full h-full px-4 mt-4'>
                <div className="hidden flex-col md:flex">
                    <div className="flex-1 space-y-4 pt-6">
                        <div className="flex items-center justify-between space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight ml-2">Información general del usuario</h2>
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
                            <div>Usuarios</div>
                            <div className="flex items-center justify-end">
                                <StarIcon
                                    data-tooltip-id="my-tooltip-t"
                                    data-tooltip-content="Generate support and new features"
                                    className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                                    onClick={() => {
                                        //setShowModal(true);
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
                            Información principal del usuario
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success && <NotificationInline message={success} />}
                        {!success && <form onSubmit={handleSubmit} className='w-full mt-0 ml-6' style={{ marginTop: '-20px' }}>
                            <div className="flex space-y-2 w-full">
                                <div className="w-full">
                                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
                                        <div className="sm:col-span-7 gap-y-6 gap-x-10">
                                            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Nombre completo
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            id="name"
                                                            autoComplete="name"
                                                            value={userName}
                                                            onChange={(e) => {
                                                                setUserName(e.target.value)
                                                                setUserUserName(generateUsername(e.target.value));
                                                            }}
                                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Nombre de usuario
                                                    </label>
                                                    <div className="mt-2">
                                                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                                            <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Usuario:</span>
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                id="username"
                                                                value={userUserName}
                                                                onChange={(e) => { setUserUserName(e.target.value) }}
                                                                className="block flex-1 border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="documentType" className="block text-sm font-medium leading-6 text-gray-900">
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
                                                    <label htmlFor="documentNumber" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Número de documento
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            name="documentNumber"
                                                            id="documentNumber"
                                                            value={userDocumentNumber}
                                                            onChange={(e) => { setUserDocumentNumber(e.target.value.replace(/[^0-9]/g, '')) }}
                                                            autoComplete="documentNumber"
                                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Correo electrónico
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={userEmail}
                                                            onChange={(e) => { setUserEmail(e.target.value) }}
                                                            autoComplete="email"
                                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="phoneNumber" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Número de telefono
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            id="phoneNumber"
                                                            name="phoneNumber"
                                                            type="text"
                                                            value={userPhoneNumber}
                                                            onChange={(e) => { setUserPhoneNumber(e.target.value.replace(/[^0-9]/g, '')) }}
                                                            autoComplete="phoneNumber"
                                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Sexo
                                                    </label>
                                                    <div className="flex items-center">
                                                        <div className="mt-2 mb-1 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                                            <div className="sm:col-span-7 flex justify-end">
                                                                <div className="flex sm:max-w-md mb-2">
                                                                    <ToggleSwitch initialValue={userGender === Gender.MALE} label={getSafeKeyFromStorage(Gender.MALE) ?? ''} handleChange={() => setUserGender(Gender.MALE)} />
                                                                </div>
                                                            </div>
                                                            <div className="sm:col-span-5 flex justify-end">
                                                                <div className="flex sm:max-w-md mb-2">
                                                                    <ToggleSwitch initialValue={userGender === Gender.FEMALE} label={getSafeKeyFromStorage(Gender.FEMALE) ?? ''} handleChange={() => setUserGender(Gender.FEMALE)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="birthDate" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Fecha de nacimiento
                                                    </label>
                                                    <div className="relative mt-2">
                                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="date"
                                                            name="birthDate"
                                                            id="birthDate"
                                                            onChange={(e) => {
                                                                //const newDate = new Date(e.target.value);
                                                                //const [isValid, error] = validateDateWithError(newDate, subtractDaysToDate(new Date(Date.now()), 1));
                                                                //setIsDateValid(isValid);
                                                                setUserBirthDate(e.target.value);
                                                                //setErrorDateValid(error ?? '');
                                                            }}
                                                            value={userBirthDate}
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-1.6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                                <div className="sm:col-span-12">
                                                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Dirección de residencia
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            id="address"
                                                            autoComplete="address"
                                                            value={userAddress}
                                                            onChange={(e) => { setUserAddress(e.target.value) }}
                                                            className="text-md block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="roleUser" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                                        Rol de usuario
                                                    </label>
                                                    <DropdownMenuButton
                                                        label={labelSelectedRole}
                                                        options={optionsRole}
                                                        renderOption={renderOption}
                                                        onSelect={handleChangeSelected}
                                                        valueSelected={labelSelectedRole}
                                                        disabled={userID != undefined}
                                                    />
                                                </div>
                                                <div className="sm:col-span-6">
                                                    <label htmlFor="documentType" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Empresa
                                                    </label>
                                                    <div className="mt-2">
                                                        <DropdownMenuButton
                                                            label={labelSelectedCompany}
                                                            options={optionsCompany}
                                                            renderOption={renderOption}
                                                            onSelect={handleChangeSelectedCompany}
                                                            valueSelected={labelSelectedCompany}
                                                            disabled={userID != undefined}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: "60vh", overflowY: "auto" }} className="scrollbar-div sm:col-span-5 mr-6 p-6 border-l border-gray">
                                            <div className={`block mb-2 text-md font-semibold text-gray-700`}>
                                                Permisos asignados al usuario
                                            </div>
                                            <ul
                                                className="list-none p-0"
                                            >
                                                {/*permissionTemplate?.permissions?.map((item) => (
                                        <li
                                            key={item._id}
                                            className="py-1 px-3 bg-gray-100 rounded-md m-1"
                                        >
                                            <div data-tooltip-id="my-tooltip-l" data-tooltip-content={item.description} ><strong>[{item.serial}]</strong> {item.name}</div>
                                        </li>
                                    ))*/}
                                                {permissions?.map((item) => (
                                                    <li key={item._id}
                                                        className="py-1 px-3 bg-gray-100 rounded-md m-1">
                                                        <div className='text-sm' data-tooltip-id="my-tooltip-l" data-tooltip-content={item.description} ><strong>[{item.serial}]</strong> {item.name}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-x-6 mr-10">
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                                        <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                    </div>
                                    <button onClick={handleCancel} type="button" className="bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
                                        Ir atrás
                                    </button>
                                </div>
                                <div className="relative flex mx-1">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                                        <PlusCircleIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModalPermissions(true);
                                        }}
                                        disabled={!userID || userID == ''}
                                        className={`pl-12 w-full ${userID && userID != '' ? 'bg-blue-600 hover:bg-blue-500 ' : 'bg-gray-500 hover:bg-gray-500 '} rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                                    >
                                        Agregar permisos al usuario
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                                        <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!validateForm}
                                        className={`${validateForm ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-500 hover:bg-gray-500'} rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                                    >
                                        Guardar datos del usuario
                                    </button>
                                </div>
                            </div>
                        </form>}
                        {
                            success && <div className="relative inset-0 flex items-center justify-center z-50 mt-20" style={{ pointerEvents: 'auto' }} >
                                <div className="bg-white rounded-lg shadow-lg p-8" >
                                    <div className="flex h-6 items-center justify-center pt-2">
                                        <CheckCircleIcon name="beakerIcon" className="h-9 w-9 text-white-500 mr-2" color="#3c763d" />
                                        <div className="text-sm leading-6">
                                            <div className="font-medium text-gray-900">
                                                Actualización de usuario realizada con exito
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
                                                    onClick={() => router.push('/user/user-table')}
                                                    className="rounded-md bg-green-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 text-white"
                                                >
                                                    Go back to list
                                                </button>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-5">
                                            <div className="relative mt-8">
                                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                                    <PlusCircleIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                                </div>
                                                <button
                                                    disabled={true}
                                                    type="button"
                                                    onClick={handleClean}
                                                    className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white"
                                                >
                                                    New user
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </CardContent>
                </Card>
            </div>
            <Modal isOpen={showModalPermissions} onClose={handleCloseModalPermissions} classSize='max-w-6xl h-[42rem]'>
                <div className="pb-1">
                    <MiniUserDataPage permissions={permissions} userId={userID} userName={userName} setPermissions={setPermissions} />
                </div>
            </Modal>
        </div>
    );
};

export default UserComponent;
