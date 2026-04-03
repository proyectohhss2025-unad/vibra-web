import Link from 'next/link';
import React from 'react';

const NotFoundPage: React.FC = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white'>
            <h1 className='text-5xl font-extrabold mb-4'>404</h1>
            <p className='text-lg mb-4'>
                The page you re looking for does not exist.
            </p>
            <p className='text-lg mb-4'>
                Here are some things you can do:
            </p>
            <ul className='list-disc'>
                <li className='text-lg mb-2'>
                    <Link href="/home" className='text-blue-500'>Go to the home page</Link>
                </li>
                <li className='text-lg mb-2'>
                    <Link href="/search" className='text-blue-500'>Search for something else</Link>
                </li>
                <li className='text-lg'>
                    <Link href="mailto:support@example.com" className='text-blue-500'>Contact support</Link>
                </li>
            </ul>
        </div>
    );
};

export default NotFoundPage;