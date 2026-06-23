import { authLogin, verifyJwtToken } from '@/api/auth-login';
import { getConfigById, hasAccessToConfig } from '@/api/config';
import ModalForgotPass from '@/components/layouts/modal/modal-forgot-pass';
import OTPInput from '@/components/login/validate-otp';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { User } from '@/models/user.entity';
import ErrorPage from '@/pages/error/error-500';
import ForgotPassword from '@/services/forgot-password';
import axios from 'axios';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { CalendarIcon, LockOpenIcon, SupportIcon } from '@heroicons/react/solid';
import { TourProvider, useTour } from '@reactour/tour';
import { UserRoundCogIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import "../../../../app/globals.css";
import logger from '../../../config/logger-dev';
import "./login-form.css";
import LogoAnimated from './logo-animated';
import { Card } from '@/registry/new-york/ui/card';
import steps from '@/components/layouts/tour/steps-login';
import useClientIp from '@/registry/new-york/hooks/use-client-ip';
import { auditLogAction } from '@/api/log';

// Define interfaces for domain entities

interface AuthCredentials {
    email: string;
    password: string;
}

// Define a service interface for authentication
interface AuthService {
    login(credentials: AuthCredentials): Promise<User>;
    logout(): Promise<void>;
}

// Implement the AuthService interface
class AuthServiceImpl implements AuthService {
    async login(credentials: AuthCredentials): Promise<User> {
        // Implement login logic
        return { userId: '1', name: 'John Doe', email: credentials.email } as User;
    }

    async logout(): Promise<void> {
        // Implement logout logic
    }
}

// Use dependency injection to provide the AuthService implementation
const authService: AuthService = new AuthServiceImpl();

const LoginForm: React.FC = () => {
    const user_ = getSafeKeyObjectFromStorage('user');
    const { setIsOpen } = useTour();
    const { clientIp } = useClientIp();
    const { formState: { errors } } = useForm();
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('yovanysuarezsilva@gmail.com');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [otp, setOtp] = useState('');
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    // #region IMPLEMENTING INITIAL TOUR COMPONENTS 
    useEffect(() => {
        const openInStorage = getSafeKeyFromStorage('tourInLogin');
        if (openInStorage) {
            return;
        }
        setIsOpen(true);
        localStorage.setItem('tourInLogin', 'true');
    }, []);
    //#endregion 

    useEffect(() => {
        window.addEventListener('error', (event) => {
            setHasError(true);
            setError(event.error);
        });

        return () => {
            window.removeEventListener('error', (event) => {
                setHasError(true);
                setError(event.error);
            });
        };
    }, []);

    useEffect(() => {
        setError('');
    }, [password]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const data = await authLogin(userName, password);
            console.log('data:', data);
            const token = data?.access_token;
            const otp = data?.otp;

            if (token) {

                localStorage.setItem('token', token);
                localStorage.setItem('otp', otp);
                // Configurar axios para enviar token en todas las peticiones
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // Parchear fetch global para incluir token
                if (typeof window !== 'undefined') {
                  const origFetch = window.fetch.bind(window);
                  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
                    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : '';
                    if (!url.includes('/api/auth/') && url.includes('/api/')) {
                      const headers = new Headers(init?.headers);
                      headers.set('Authorization', `Bearer ${token}`);
                      return origFetch(input, { ...init, headers });
                    }
                    return origFetch(input, init);
                  };
                }

                const objectToken: User = await verifyJwtToken(token);
                localStorage.setItem('user', JSON.stringify(objectToken));

                // #region CONFIG 
                const configResponse = await getConfigById('66509c3a56fa46b3d178e2a9');
                if (!configResponse) {
                    logger.warn('Configuración no encontrada');
                    setError('Error de configuración del sistema. Contacta al administrador.');
                    return;
                }
                console.log('configResponse._id - objectToken.documentNumber:', configResponse._id, objectToken);

                // Si flag es false → OTP deshabilitado globalmente → acceso directo
                if (!configResponse.flag) {
                    logger.info('Validación OTP deshabilitada globalmente (flag=false). Acceso directo.');
                    await auditLogAction(objectToken?.username, "Inicio de sesión", "Inicio de sesión de usuario", `Se ha realizado un inicio de sesión de parte del usuario: ${objectToken?.username} con rol: ${objectToken?.role?.name}`, clientIp ?? '');
                    router.push('/home-dashboard');
                    return;
                }

                const hasAccess = await hasAccessToConfig(configResponse._id, objectToken.documentNumber);
                //#endregion 

                logger.info('allowed:', hasAccess);
                if (hasAccess) {
                    logger.info('El usuario no requiere un OTP para su autenticación');
                    await auditLogAction(objectToken?.username, "Inicio de sesión", "Inicio de sesión de usuario", `Se ha realizado un inicio de sesión de parte del usuario: ${objectToken?.username} con rol: ${objectToken?.role?.name}`, clientIp ?? '');
                    router.push('/home-dashboard');
                } else {
                    if (otp) {
                        setOtp(otp);
                        await auditLogAction(objectToken?.username, "Inicio de sesión", "Inicio de sesión de usuario con validación de OTP", "Se ha realizado un inicio de sesión con validacion de OTP de parte del usuario: " + objectToken.username + " con rol " + objectToken.role?.name, clientIp ?? '');
                    } else {
                        logger.error('No se requiere OTP para su autenticación');
                        setError('No tienes permisos de acceso al sistema. Contacta al administrador.');
                    }
                }
            } else {
                logger.error('No se pudo iniciar sesión!', { email, password });
                setError('Credenciales invalidas');
            }

        } catch (error) {
            logger.error(error);
            setError('No se pudo iniciar sesión! Por favor intente nuevamente.');
        }
    };

    const radius = 10;
    const handleValidOTP = (enteredOTP: string) => {
        if (otp !== '' && enteredOTP !== '' && enteredOTP === otp) {
            logger.info('Login successful with OTP! ', { otp });
            router.push('/home-dashboard');
        } else {
            logger.error('Invalid OTP. Login failed.', { otp });
            localStorage.removeItem('token');
            router.push('/layout');
        }
    };

    if (hasError) {
        return <ErrorPage statusCode={500} title={error} />;
    }

    return (
        <TourProvider steps={steps}
            badgeContent={({ totalSteps, currentStep }) => currentStep + 1 + "/" + totalSteps}
            styles={{
                popover: (base) => ({
                    ...base,
                    '--reactour-accent': '#0099ff',
                    borderRadius: radius,
                }),
                maskArea: (base) => ({ ...base, rx: radius }),
                maskWrapper: (base) => ({ ...base, color: '#0099ff' }),
                badge: (base) => ({ ...base, left: 'auto', right: '-0.8125em' }),
                controls: (base) => ({ ...base, marginTop: 20 }),
                close: (base) => ({ ...base, right: 'auto', left: 8, top: 8 }),
            }}
        >
            <div className='login' >
                {
                    !otp && (
                        <div className="flex min-h-full flex-col justify-center px-2 py-3 lg:px-4 pt-10">
                            <img src="logo.png" alt="Site logo" className='rounded-md w-24 text-center mx-auto' />
                            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                                <UserRoundCogIcon name="config" style={{ "float": 'left' }} className="h-16 w-16 text-gray-700 hover:text-gray-700 mt-2 mb-4" />
                                <h2 className="mt-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                                    {'Iniciar sesión en su cuenta'}
                                </h2>
                            </div>
                            <div className="mt-1 sm:mx-auto sm:w-full sm:max-w-sm">
                                <Card className='rounded-lg p-4 mt-2'>
                                    <form className="space-y-6" onSubmit={handleSubmit} >
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                Usuario
                                            </label>
                                            <div className="mt-2">
                                                {/*<input data-tour="step-1"
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    autoComplete="email"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />*/}
                                                <div className="flex rounded-md shadow-sm mt-2 ring-1 ring-inset ring-gray-400 focus-within:ring-2 focus-within:ring-inset sm:max-w-md">
                                                    <span className="flex select-none items-center pl-3 text-gray-600 sm:text-sm pr-2 rounded-l-lg">vibraunad.com.co/</span>
                                                    <input data-tour="step-2"
                                                        type="text"
                                                        name="username"
                                                        id="username"
                                                        value={userName}
                                                        autoComplete="username"
                                                        onChange={(e) => setUserName(e.target.value)}
                                                        className="block flex-1 border-1 border-gray-300 bg-transparent py-1.5 pl-2 text-gray-900 rounded-r-md placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                        placeholder="username"
                                                    />
                                                </div>
                                                {errors.email && <div className="mt-10 text-center font-semibold leading-6 text-blue-600 hover:text-blue-500">Este campo es requerido.</div>}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between" data-tour="step-4">
                                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                                    {'Contraseña'}
                                                </label>
                                                <div className="text-sm">
                                                    <HoverCard>
                                                        <HoverCardTrigger>
                                                            <Link href="#" onClick={() => setShowModal(true)} className="font-semibold text-blue-600 hover:text-blue-500">
                                                                {'Olvidaste tu contraseña?'}
                                                            </Link>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent>
                                                            Clic para forzar una nueva contraseña.
                                                            <div className="flex items-center pt-2">
                                                                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                                                                <span className="text-xs text-muted-foreground">
                                                                    Septiembre 2024
                                                                </span>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>
                                            </div>
                                            <div className="mt-2" data-tour="step-3">
                                                <input
                                                    id="password"
                                                    type="password"
                                                    autoComplete="current-password"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    value={password}
                                                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.password && <div className="mt-10 text-center font-semibold leading-6 text-blue-600 hover:text-blue-500">This field is required</div>}

                                            </div>
                                        </div>
                                        {error && <div className="mt-10 text-center font-semibold leading-6 text-red-600 hover:text-red-500">{error}</div>}
                                        <div data-tour="step-5">
                                            <button
                                                type="submit"
                                                className="flex w-full justify-center rounded-md px-3 py-2.5 hover:bg-blue-600 bg-blue-500 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            ><LockOpenIcon name="error" className="h-5 w-6 text-white-500" color="#FFFFFF" />
                                                {'Iniciar sesión'}
                                            </button>
                                        </div>
                                    </form>
                                </Card>
                                <p className="mt-10 text-center text-sm text-gray-700">
                                    {'No es miembro'}?{' '}
                                    <Link href="/" className="font-semibold leading-6 text-gray-800 hover:text-blue-500">
                                        {'Vibra web - Administrador'}
                                    </Link>
                                    <SupportIcon data-tooltip-id="my-tooltip-t"
                                        data-tooltip-content={'Init tour'}
                                        style={{ float: 'right' }} className='justify-end h-7 w-7 text-blue-600 mt-0 mr-2'
                                        onClick={() => setIsOpen(true)} />
                                </p>
                            </div>
                        </div>
                    )
                }

                {
                    otp && (
                        <div className="otp-input-container flex min-h-full flex-1 flex-col justify-center px-6 py-6 lg:px-8">
                            <p>{'Se ha enviado un código OTP se ha enviado a su correo electrónico'}.</p>
                            <OTPInput onValidOTP={handleValidOTP} />
                        </div>
                    )
                }

                <blockquote className="mt-6 border-l-2 pl-6 italic">
                    Inicie sesión con el usuario asignado para tener acceso a Vibra Admin.
                </blockquote>
                <ModalForgotPass isOpen={showModal} onClose={() => { setShowModal(false) }} classSize='max-w-2xl max-h-md' zIndex={100}>
                    <ForgotPassword email_={email} />
                </ModalForgotPass>
            </div>
        </TourProvider>
    );
};

export default LoginForm;
