'use client'

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Breadcrumb: React.FC<any> = ({ routes }) => {
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const router = useRouter();
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        const menuItems_: any[] = [];
        routes.forEach((item) => {
            if (item.children?.length > 0) {
                item.children?.forEach((children) => {
                    menuItems_.push({
                        id: children._id,
                        name: children.label,
                        icon: children.icon,
                        href: children.href
                    })
                });
            }
        });
        setMenuItems(menuItems_);
    }, [routes]);

    useEffect(() => {
        const updateBreadcrumb = () => {
            const pathSegments = router.pathname.split('/').filter(Boolean);
            setCurrentPath(pathSegments);
        };

        updateBreadcrumb();
    }, [router]);

    const currentBreadcrumb = menuItems.filter((route) =>
        currentPath.some((segment) => route.href.includes(segment))
    );

    return (
        <nav aria-label="Breadcrumb" className="flex items-center mb-0">
            <ol className="inline-flex items-center space-x-1 text-gray-500 ml-4">
                {currentBreadcrumb.map((route, index) => (
                    <li key={index+1} className="flex items-center mt-2">
                        <a
                            href={route.href}
                            className="hover:text-gray-900 flex items-center"
                            onClick={() => router.push(route.href)}
                        >
                            <i className="fas fa-home"></i>
                            <span className="ml-2">{route.name}</span>
                        </a>
                        {index < currentBreadcrumb.length - 1 && (
                            <svg
                                className="w-4 h-4 ml-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    d="M5.5 12.499z"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M10.293 5.293L15 10l-4.707 4.707"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                />
                            </svg>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;