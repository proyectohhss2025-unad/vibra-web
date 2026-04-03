'use client'

import { createPermissionTemplate } from '@/api/permissionTemplate';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, UserCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, InformationCircleIcon, PlusCircleIcon, SaveAsIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import '../../components/ui/notification/notification.css';
import ToggleSwitch from '../forms/toggleSwitch';
import NotificationInline from '../layouts/icon/notification-inline';
import './permission-template.css';

const PermissionTemplateComponent = () => {

    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token, otp } = useContext(AuthContext);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        setIsAuthenticated(!!token && !!otp);
    }, [token, otp]);

    const router = useRouter();

    const [userSession, setUserSession] = useState<User>(user_);
    const permissionTemplateClean: PermissionTemplate = {
        _id: '',
        serial: '',
        name: '',
        description: '',
        createdAt: new Date(Date.now()),
        createdBy: userSession.name
    };

    const [permissionTemplate, setPermissionTemplate] = useState<PermissionTemplate>(permissionTemplateClean);
    const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [idPermissionTemplateCategorySelected, setIdPermissionTemplateCategorySelected] = useState<string | null>();
    const [validateForm, setValidateForm] = useState<boolean>(false);

    const [permissionTemplateID, setPermissionTemplateID] = useState<any>();
    const [permissionTemplateSerial, setPermissionTemplateSerial] = useState<string>('');
    const [permissionTemplateName, setPermissionTemplateName] = useState<string>('');
    const [permissionTemplateDescription, setPermissionTemplateDescription] = useState<string>('');
    const [permissionTemplateIsActive, setPermissionTemplateIsActive] = useState<boolean>(false);
    const [permissionTemplateIsSuperAdmin, setPermissionTemplateIsSuperAdmin] = useState<boolean>(false);

    const { register, formState: { errors } } = useForm({
        defaultValues: {
            value: permissionTemplate.isActive || true,
        },
    });

    const locale = 'en-US';

    //#region USE EFFECT
    useEffect(() => {
        if (router.query._id) {
            setPermissionTemplateID(router.query._id as unknown as string);
            setPermissionTemplateSerial(router.query.serial as unknown as string);
            setPermissionTemplateName(router.query.name as unknown as string);
            setPermissionTemplateDescription(router.query.description as string);
            setPermissionTemplateIsActive(router.query.isActive as unknown as boolean);
            setPermissionTemplateIsSuperAdmin(router.query.isSuperAdmin as unknown as boolean);
        }
    }, [router]);

    useEffect(() => {
        setError('');
        setSuccess('');
        const setData = async () => {
            try {
                console.log('permissionTemplateID: ', permissionTemplateID);
                setPermissionTemplate({
                    _id: permissionTemplateID || '',
                    serial: permissionTemplateSerial,
                    name: permissionTemplateName,
                    description: permissionTemplateDescription,
                    isActive: permissionTemplateIsActive,
                    createdAt: new Date(Date.now()),
                    createdBy: userSession.name,
                });
            } catch (error) {
                setError(error.message);
            }
        }
        if (permissionTemplateID) {
            setData();
        }
    }, [permissionTemplateID, permissionTemplateDescription, permissionTemplateIsActive, permissionTemplateName, permissionTemplateSerial, userSession.name]);

    useEffect(() => {
        if (permissionTemplateName && permissionTemplateDescription) {
            setValidateForm(true);
        }
    }, [permissionTemplateName, permissionTemplateDescription]);

    //#endregion

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const permissionTemplateCopy = { ...permissionTemplate }; // Create a copy of the activity object to prevent mutating the original state directly
            permissionTemplateCopy.name = permissionTemplateName;
            permissionTemplateCopy.description = permissionTemplateDescription;
            permissionTemplateCopy.isActive = permissionTemplateIsActive;
            const permissionTemplateResponse = await createPermissionTemplate(permissionTemplateCopy);
            if (permissionTemplateResponse) {
                setSuccess('PermissionTemplate created successfully');
                setPermissionTemplate(permissionTemplateClean);
            } else {
                setError('Error creating permissionTemplate');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.replace('/permission-template/permission-template-table');
    };

    const handleOnChange = (e: any) => {
        setIdPermissionTemplateCategorySelected(e)
    };

    const handleChangeIsAdmin = (e: any) => {
        setPermissionTemplateIsActive(e);
    };

    const handleChangeIsSuperAdmin = (e: any) => {
        setPermissionTemplateIsSuperAdmin(e);
    };

    if (!isAuthenticated) {
        return;
    }

    return (
        <div id='activity' className='mb-9'>
            {!success && <form onSubmit={handleSubmit}>
                <div className="flex space-y-12 w-full max-w-4xl max-h-dvh">
                    <div className="pb-8">
                        <StarIcon data-tooltip-id="my-tooltip-t"
                            data-tooltip-content="Generate support and new features"
                            style={{ float: 'right' }} className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                            onClick={() => {
                                // setShowModal(true);
                                //setIsLoading(true);
                            }} />
                        <SupportIcon data-tooltip-id="my-tooltip-t"
                            data-tooltip-content="Init tour"
                            style={{ float: 'right' }} className='justify-end h-7 w-7 text-blue-600 mt-0 mr-2'
                        />
                        <h1 className="h1-2 flex text-base font-semibold leading-9 text-gray-900">
                            <UserCircleIcon data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="The approval process loads the information of the .cvs file, in a collection within a database"
                                style={{ float: 'left' }} name="info" className="h-10 w-10 text-blue-600 mt-0 mr-2" color="#ff0000" /> User permission templates
                        </h1>
                        {success != '' && <NotificationInline message={success} />}
                        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                            <div className="sm:col-span-2">
                                <label htmlFor="permissionTemplateFlowPositionInProcess" className="block text-sm font-medium leading-6 text-gray-900">
                                    Is super admin
                                </label>
                                <div className="mt-3">
                                    <div className="flex sm:max-w-md">
                                        <ToggleSwitch initialValue={permissionTemplateIsSuperAdmin} label="" handleChange={handleChangeIsSuperAdmin} />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="permissionTemplateName" className="block text-sm font-medium leading-6 text-gray-900">
                                    Serial
                                </label>
                                <div className="mt-2">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-2 text-gray-500 sm:text-sm">No. </span>
                                        <input
                                            type="text"
                                            name="permissionTemplateName"
                                            id="permissionTemplateName"
                                            value={permissionTemplateSerial}
                                            placeholder='Autogenerate'
                                            disabled
                                            onChange={(e) => {
                                                setPermissionTemplateSerial(e.target.value);
                                            }}
                                            className="text-lg md:font-bold block flex-1 text-bold border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-800 focus:ring-0 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="permissionTemplateName" className="block text-sm font-medium leading-6 text-gray-900">
                                    Name or alias
                                </label>
                                <div className="mt-2">
                                    <div className="bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Name: </span>
                                        <input
                                            type="text"
                                            name="permissionTemplateName"
                                            id="permissionTemplateName"
                                            value={permissionTemplateName}
                                            onChange={(e) => {
                                                setPermissionTemplateName(e.target.value);
                                            }}
                                            className="text-lg md:font-bold block flex-1 text-bold border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-800 focus:ring-0 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="permissionTemplateFlowPositionInProcess" className="block text-sm font-medium leading-6 text-gray-900">
                                    Is active
                                </label>
                                <div className="mt-3">
                                    <div className="flex sm:max-w-md">
                                        <ToggleSwitch initialValue={permissionTemplateIsActive} label="" handleChange={handleChangeIsAdmin} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-9">
                            <div className="sm:col-span-9">
                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                    Description
                                    <InformationCircleIcon data-tooltip-id="my-tooltip-p" data-tooltip-content="Add description for more info about this permissionTemplate!"
                                        style={{ float: 'right' }} name="info" className="h-6 w-6 text-blue-500" color="#ff0000" />
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        name="description"
                                        id="description"
                                        data-tooltip-id="my-tooltip-t" data-tooltip-content="Notes!"
                                        value={permissionTemplateDescription}
                                        onChange={(e) => {
                                            setPermissionTemplateDescription(e.target.value);
                                        }}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-7">
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button onClick={handleCancel} type="button" className="rounded-md bg-blue-500 hover:bg-blue-500 px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
                            Go back
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                            <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button
                            type="submit"
                            disabled={!validateForm}
                            className={`${validateForm ? 'bg-blue-600 hover:bg-blue-500 ' : 'bg-gray-500 hover:bg-gray-500 '}rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                        >
                            Save permission template
                        </button>
                    </div>
                </div>
            </form>}
            {
                success && <div className="fixed inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }} >
                    <div className="bg-white rounded-lg shadow-lg p-8" >
                        <div className="flex h-6 items-center justify-center pt-2">
                            <CheckCircleIcon name="beakerIcon" className="h-9 w-9 text-white-500 mr-2" color="#3c763d" />
                            <div className="text-sm leading-6">
                                <label className="font-medium text-gray-900">
                                    Success in the update template
                                </label>
                            </div>
                        </div>

                        <div className="mt-0 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-10">
                            <div className="sm:col-span-4">
                                <div className="relative mt-8">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                        <ViewListIcon name="viewListIcon" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/permission-template/permission-template-table')}
                                        className="rounded-md bg-green-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 text-white"
                                    >
                                        Go back
                                    </button>
                                </div>
                            </div>
                            <div className="sm:col-span-6">
                                <div className="relative mt-8">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                        <PlusCircleIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.replace('/permissionTemplate/permissionTemplate')}
                                        className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white"
                                    >
                                        New permission template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    );
};

export default PermissionTemplateComponent;