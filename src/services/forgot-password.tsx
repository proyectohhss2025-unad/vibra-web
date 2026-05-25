import { forgotPassword } from '@/api/password-reset';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { CheckIcon, LockOpenIcon, XCircleIcon } from '@heroicons/react/solid';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const COOLDOWN_SECONDS = 60;

interface Props {
    email_: string;
}

const ForgotPassword: React.FC<Props> = ({ email_ }) => {
    const [email, setEmail] = useState(email_);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Efecto para la cuenta regresiva
    useEffect(() => {
        if (cooldown <= 0) return;

        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Si el usuario cambia el email durante el countdown, se reinicia
        if (cooldown > 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setCooldown(0);
        }
    }, [cooldown]);

    const startCooldown = useCallback(() => {
        setCooldown(COOLDOWN_SECONDS);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsSuccess(false);

        try {
            const result = await forgotPassword(email);
            setMessage(result.message || 'Si el email existe, recibirás un enlace de restablecimiento');
            setIsSuccess(true);
            startCooldown();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Error al enviar la solicitud. Intenta de nuevo.';
            setMessage(msg);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = isLoading || cooldown > 0;

    const getButtonText = () => {
        if (isLoading) return 'Enviando...';
        if (cooldown > 0) return `Reenviar en ${cooldown}s`;
        return 'Enviar nueva contraseña';
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 px-2 sm:px-4 lg:px-4">
            <div className="w-full max-w-2xl space-y-4">
                <h2 className="flex items-center text-2xl font-bold leading-7 text-center text-gray-700 sm:text-3xl sm:leading-9">
                    <LockOpenIcon name="config" className="h-20 w-20 mt-2 mb-4" /> Olvidaste tu contraseña?
                </h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-5 text-gray-700 mb-3">
                            {getSafeKeyFromStorage('Email address')}
                        </label>
                        <div className="mt-1 rounded-md shadow-sm">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                disabled={cooldown > 0}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`mt-3 text-center items-center p-3 rounded-lg ${isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className={`flex text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                {isSuccess ? (
                                    <CheckIcon name="config" className="h-10 w-10 shrink-0" />
                                ) : (
                                    <XCircleIcon name="config" className="h-10 w-10 shrink-0" />
                                )}
                                <span className='mt-2 ml-2'>{message}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;