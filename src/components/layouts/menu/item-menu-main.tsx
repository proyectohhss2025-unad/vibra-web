'use client'

import { getCountAllNotifications } from '@/api/notification';
import { Badge } from '@/components/ui/badge';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleDownIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AnimatedIcon from '../icon/animate-icon';
import './menu-button.css';

interface PropsMenuItem {
    key_: any;
    item: any,
    isAuthenticated: boolean;
    isCollapsed: boolean;
}

const ListMenuItem: React.FC<PropsMenuItem> = ({ key_, item, isAuthenticated, isCollapsed }) => {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [hasChildren, setHasChildren] = useState(false);

    const router = useRouter();
    const { openTab } = useTabs();

    useEffect(() => {
        const a = getSafeKeyFromStorage('expandedItem');
        const b = getSafeKeyFromStorage('selectedItem');
        setExpandedItem(a);
        setSelectedItem(b)
    }, [router, hasChildren]);

    const handleItemClick = (child: any) => {
        setExpandedItem(null);
        localStorage.removeItem('expandedItem');

        const itemId = item._id;
        const href = item.href;
        const hasChildren_ = item.children?.length > 0;

        if (href && hasChildren_) {
            const exp = itemId === expandedItem ? null : itemId;

            setExpandedItem(exp);
            localStorage.setItem('expandedItem', exp ?? '');
            setHasChildren(hasChildren_);
        }
        if (href && !hasChildren_) {
            openTab(
                `/${child.name}`,
                `${child.label}`,
                <child.component />
            );
        }
    };

    const handleItemChildClick = (child: any) => {
        //const exp = itemId === expandedItem ? null : itemId;
        //setExpandedItem(exp);
        localStorage.setItem('selectedItem', child?._id);
        openTab(
            `/${child.name}`,
            `${child.label}`,
            <child.component />
        );
    };

    const itemMenuProps: any = {
        color: item.color,
        name: item.name,
        style: { "float": 'left' },
        className: `${isCollapsed ? 'h-10 w-10 ml-3' : 'h-6 w-8'} text-gray-500 hover:text-gray-800`,
        icon: item.icon
    };

    if (isAuthenticated) {
        return (
            <li key={`li_${key_}`} className={`text-gray-600 hover:text-white`}>
                <Link className={`${isCollapsed ? 'h-10 py-1' : 'flex items-center rounded border border-gray-400 mx-3 mt-0 hover:bg-gray-100'}`}
                    href={item.children?.length == 0 ? '#' : '#'}
                    replace={true}
                    scroll={false}
                    onClick={() => {
                        handleItemClick(item);
                    }}
                    data-tooltip-id="my-tooltip-l"
                    data-tooltip-content={item.label} >
                    <div className={`${isCollapsed ? 'justify-center' : 'justify-between'} relative flex items-center text-sm h-4`}>
                        <div className={`${isCollapsed ? 'items-center' : 'mt-0 flex items-center'}`}>
                            <AnimatedIcon icon={item.icon} itemMenuChildProps={itemMenuProps} />
                            {isCollapsed ? '' : item.label}
                        </div>
                        {!isCollapsed && item.labelAux && <Badge variant="destructive">
                            {item.labelAux ?? ''}</Badge>}
                        {!isCollapsed && (item?.children?.length > 0 && expandedItem === item._id) ?
                            <ArrowCircleDownIcon name="drowndown" style={{ float: 'right' }} className="flex items-center justify-end h-6 w-6 text-red leading-6" color="gray" /> : ''}
                    </div>
                </Link>
                {item.children && (
                    <ul key={`ul_${item?._id}`} className={`${expandedItem === item._id ? 'submenu expanded ml-3 mr-3' : 'submenuc collapsed ml-1 mr-0'} mt-0 mb-1 pt-0 pl-0 pr-0`}>
                        {item.children.map((child: any) => {
                            const itemMenuChildProps: any = {
                                color: child.color,
                                name: child.name,
                                style: { "float": 'left' },
                                className: `${isCollapsed ? 'h-7 w-9 mt-0' : 'h-7 w-9'} text-gray-500 hover:text-gray-800`,
                                icon: child.icon
                            };
                            return (
                                <li className={`text-sm mt-0 ${selectedItem === child._id ? 'bg-transparent' : 'bg-transparent'} mx-0 ${isCollapsed ? 'py-2 mt-2 ' : 'py-0'}`}
                                    key={`child_${child._id}${item._id}`}
                                    data-tooltip-id="my-tooltip-l"
                                    data-tooltip-content={child.description}>
                                    <a href="#" style={{ marginLeft: isCollapsed ? '-10px' : '0px', marginRight: isCollapsed ? '-4px' : '0px' }} className={`${isCollapsed ? 'h-7 mt-0 ml-0 mr-0' : 'rounded border border-gray-400 hover:border-gray-600 pb-0 mx-0 flex items-center h-9'}`} onClick={() => {
                                        handleItemChildClick(child);
                                    }}><div style={{ paddingLeft: isCollapsed ? '-10px' : '0px' }} className={`${isCollapsed ? 'h-3 pl-0 ml-0' : 'h-full'} mt-0 flex items-center`}>
                                            <AnimatedIcon icon={child.icon} itemMenuChildProps={itemMenuChildProps} />
                                            {isCollapsed ? '' : child.label}</div>
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </li>
        )
    }
};

interface PropsMenuMain {
    items: any,
    isAuthenticated: boolean;
    isCollapsed: boolean;
    setTab: (value: string) => void;
}

const MenuMainList: React.FC<PropsMenuMain> = ({ items, isAuthenticated, isCollapsed, setTab }) => {
    const [totalNotifications, setTotalNotifications] = useState<string | null>(null);

    useEffect(() => {
        getCountAllNotifications()
            .then(data => setTotalNotifications(data?.countNotifications));
    }, []);

    const itemMenuHome: any = {
        href: '/notification/notification-tray',
        label: getSafeKeyFromStorage('Inbox'),
        labelAux: totalNotifications,
        color: "#EAEAEA",
        name: "layout",
        style: { "float": 'left' },
        className: `${isCollapsed ? 'h-10 w-10' : 'h-6 w-9'} text-green-500 hover:text-gray-800`,
        icon: 'BellIcon',
        permissionID: "1",
        description: getSafeKeyFromStorage('Go to main dashboard'),
        isActive: true
    };

    if (isAuthenticated) {
        return (
            <nav>
                <ul className="list-none p-0 space-y-1">
                    {false && <ListMenuItem key_={'home-dashboard'} key={`item_n${0}`} item={itemMenuHome} isAuthenticated={true} isCollapsed={isCollapsed} />}
                    {items.map((item: any) => (
                        item.isActive && <ListMenuItem key={`itemLi_${item._id}`} key_={`item_${item._id}`} item={item} isAuthenticated={isAuthenticated} isCollapsed={isCollapsed} />
                    ))}
                </ul>
            </nav>
        );
    }
};

export default MenuMainList;