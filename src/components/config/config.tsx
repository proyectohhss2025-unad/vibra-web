'use client'

import { createConfig, getConfigById } from '@/api/config';
import { Config } from '@/models/config.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { mapArrayToString, updateArrayFromString } from '@/utils/arrays';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, PlusCircleIcon, SaveAsIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ToggleSwitch from '../forms/toggleSwitch';
import Loading from '../layouts/loading/loading';
import CurrentDateTime from '../utils/current-datetime';
import './config.css';

const ConfigComponent = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [configName, setConfigName] = useState<string>('');
    const [configFlag, setConfigFlag] = useState<boolean>(false);
    const [configDescription, setConfigDescription] = useState<string>('');
    const [configAllowedUsers, setConfigAllowedUsers] = useState<any>([]);
    const [configDisallowedUsers, setConfigDisallowedUsers] = useState<any>([]);
    const [configID, setConfigID] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const [validateForm, setValidateForm] = useState<boolean>(false);

    const [user, setUser] = useState(user_);
    const configClean: Config = {
        name: '',
        description: '',
        flag: true,
        allowedUsers: [],
        disallowedUsers: [],
        createdBy: user.name,
        createdAt: new Date(Date.now())
    };

    const [config, setConfig] = useState<any>(configClean);


    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //#region USE EFFECT
    useEffect(() => {
        const getDataConfig = async () => {
            try {
                const responseConfig: any = await getConfigById(router.query._id as unknown as string);
                if (responseConfig._id) {
                    const myObjectAllowedUsers: any = {
                        myArray: responseConfig?.allowedUsers
                    };
                    const myObjectDisallowedUsers: any = {
                        myArray: responseConfig?.disallowedUsers
                    };

                    setConfig(responseConfig);
                    setConfigName(responseConfig?.name);
                    setConfigDescription(responseConfig?.description);
                    setConfigFlag(responseConfig?.flag);
                    setConfigAllowedUsers(mapArrayToString(myObjectAllowedUsers));
                    setConfigDisallowedUsers(mapArrayToString(myObjectDisallowedUsers));
                }
            } catch (error) {
                setError(error.message);
            }
        };

        setConfigID(router.query._id as unknown as string);
        if (router.query._id) {
            getDataConfig();
        }
    }, [router.query._id]);

    useEffect(() => {
        if (configName && configFlag && (configAllowedUsers || configDisallowedUsers)) {
            setValidateForm(true);
        }
    }, [configName, configFlag, configAllowedUsers, configDisallowedUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newValuesAllowedUsers = configAllowedUsers.split(",").map(value => value.trim());
        const myObjectAllowedUsers: any = {
            myArray: newValuesAllowedUsers
        };
        const newValuesDisallowedUsers = configDisallowedUsers.split(",").map(value => value.trim());
        const myObjectDisallowedUsers: any = {
            myArray: newValuesDisallowedUsers
        };

        const updatedObjectAllowedUser = updateArrayFromString(myObjectAllowedUsers, mapArrayToString(myObjectAllowedUsers.myArray));
        const updatedObjectDisallowedUser = updateArrayFromString(myObjectDisallowedUsers, mapArrayToString(myObjectDisallowedUsers.myArray));

        try {
            const nameFormat = configName.replaceAll(' ', '-');
            const configResponse = await createConfig(configID, nameFormat, configFlag, updatedObjectAllowedUser.myArray, updatedObjectDisallowedUser.myArray, configDescription, user.name);
            if (configResponse) {
                setSuccess('Configuración guardada exitosamente');
                setConfig(configClean);
            } else {
                setError('Error creating configuration');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/config/config-table');
    };

    return (
        <div className='w-full h-full px-4 mx-0'>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="flex-1 space-y-4 pt-2">
                    <div className="flex items-center justify-between space-y-0">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">Información general de configuracion de caracteristicas.</h2>
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
                        <div>Banderas de configuración</div>
                        <div className="flex items-center justify-end sm:col-span-7">
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
                        </div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0' >
                        The config allows you to validate a functionality with respect to a user listed on a white list
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success && <form onSubmit={handleSubmit}>
                        <div className="space-y-8">
                            <div className="pb-0">
                                {isLoading && <div className="loading-container"><Loading /></div>}


                                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                                    <div className="col-span-full">
                                        <label htmlFor="configName" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Config name')}
                                        </label>
                                        <div className="mt-2">
                                            <div className="bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                                                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">config.name:</span>
                                                <input
                                                    type="text"
                                                    name="configName"
                                                    id="configName"
                                                    value={configName}
                                                    onChange={(e) => {
                                                        setConfigName(e.target.value);
                                                    }}
                                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                    placeholder="example: Send-OTP"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="configDescription" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Description flag')}
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                rows={2}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                name="configDescription"
                                                id="configDescription"
                                                value={configDescription}
                                                onChange={(e) => {
                                                    setConfigDescription(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="configAllowedUser" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Allowed users')}
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                rows={2}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                name="configAllowedUser"
                                                id="configAllowedUser"
                                                value={configAllowedUsers}
                                                onChange={(e) => {
                                                    setConfigAllowedUsers(e.target.value);
                                                }}
                                                placeholder="1,2"
                                            />
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">Whitelist active users to view functionality.</p>
                                    </div>
                                    <div className="col-span-full">
                                        <label htmlFor="configDisallowedUser" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Disallowed users')}
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                rows={1}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                name="configDisallowedUser"
                                                id="configDisallowedUser"
                                                value={configDisallowedUsers}
                                                onChange={(e) => {
                                                    setConfigDisallowedUsers(e.target.value);
                                                }}
                                                placeholder="1,2"
                                            />
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">Whitelist inactive users to view functionality</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-gray-900/10 pb-3">
                                <div className="space-y-2">
                                    <div className="mt-2 space-y-6">
                                        <div className="relative flex gap-x-3">
                                            <div className="flex h-6 items-center">
                                                <ToggleSwitch initialValue={configFlag} label="Is flag" handleChange={setConfigFlag} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-x-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                                    <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                </div>
                                <button onClick={handleCancel} type="button"
                                    className={`w-full bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}>
                                    {getSafeKeyFromStorage('Go back')}
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                                    <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!validateForm}
                                    className={`${validateForm ? 'bg-blue-600 hover:bg-blue-500 ' : 'bg-gray-300 hover:bg-gray-300 '}rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                                >
                                    {getSafeKeyFromStorage('Save config')}
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
                                            Success in the update config
                                        </label>
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
                                                onClick={() => router.push('/config/config-table')}
                                                className="rounded-md bg-green-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 text-white"
                                            >
                                                Go back
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
                                                onClick={() => router.replace('/config/config')}
                                                className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white"
                                            >
                                                New config
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfigComponent;