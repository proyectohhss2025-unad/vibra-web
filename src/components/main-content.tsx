/* eslint-disable react-hooks/rules-of-hooks */
"use client"

import About from '@/pages/about';
import LoginForm from '@/pages/forms/login/login-form';
import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import HomeDashboardComponent from './home-dashboard';

const MainContent = ({ content }: any) => {
    const { token, otp } = useContext(AuthContext);
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token && !!otp);

    useEffect(() => {
        setIsAuthenticated(!!token && !!otp);
    }, [token, otp]);

    useEffect(() => {
        setCurrentPage(content);
    }, [content]);

    const getComponentForRoute = () => {
        const radius = 10;
        const pathname = router.asPath;
        switch (pathname) {
            case '/':
                return <About />;
            case '/about':
                return <About />;
            default:
                return (isAuthenticated ? <HomeDashboardComponent /> : <LoginForm />);
        }
    };

    useEffect(() => {
        setCurrentPage((prevCurrentPage): any => {
            const component = getComponentForRoute();
            if (!component) {
                return null;
            }
            return component;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, isAuthenticated]);

    return <>{currentPage}</>;
};

export default MainContent;