import { getForgotPassword } from '@/api/user';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { CheckIcon, LockOpenIcon } from '@heroicons/react/solid';
import React, { useState } from 'react';

interface Props {
    email_: string;
}

const ForgotPassword: React.FC<Props> = ({ email_ }) => {
    const [email, setEmail] = useState(email_);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await getForgotPassword(email)
            setMessage('A new password has been sent to your email');
            setIsLoading(false);
        } catch (error) {
            setMessage('Error sending password. Please try again');
            setIsLoading(false);
        }
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
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="mt-3 text-center items-center">
                            <p className={`flex text-sm ${message.includes('has been sent') ? 'text-green-500' : 'text-red-500'}`}>
                                <CheckIcon name="config" className="h-10 w-10 mb-4" />
                                <div className='mt-2'>{message}</div>
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isLoading ? getSafeKeyFromStorage('Sending ...') : getSafeKeyFromStorage('Send new password')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;