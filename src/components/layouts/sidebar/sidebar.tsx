import AuthorInfo from '@/components/author-info';
import ActiveUsers from '@/components/user/active-user';
import FloatingFeedbackBtn from '@/components/ui/floating-feedback-btn';
import { AuthContext, ResolvedPermissions } from '@/services/auth';
import { useDevice } from '@/services/contexts/device-context';
import { FULL_NAME } from '@/utils/constants';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { LockClosedIcon } from '@heroicons/react/outline';
import { PanelLeftOpenIcon, PanelRightOpenIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import "../../../../app/globals.css";
import MenuMainList from '../menu/item-menu-main';
import { items } from "./sidebar-option";
import "./sidebar.css";
import { Toaster } from '@/registry/new-york/ui/toaster';
import { Card } from '@/registry/new-york/ui/card';

const Sidebar = () => {
    const { token, otp, handleLogout, resolvedPermissions/*, translates */ } = useContext(AuthContext);
    const { isMobile, isTablet } = useDevice();

    const [dataMainMenu, setDataMainMenu] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCollapsedRight, setIsCollapsedRight] = useState(false);
    const [expandedSidebar, setExpandedSidebar] = useState<any>(true);
    const [expandedSidebarRight, setExpandedSidebarRight] = useState<any>(true);

    const checkDeviceSize = () => {
        if (window.innerWidth <= 768) {
            setIsCollapsed(true);
            setExpandedSidebar(false);
            setExpandedSidebarRight(false);
        } else {
            setIsCollapsed(false);
            setExpandedSidebar(true);
            setExpandedSidebarRight(true);
        }
    };

    useEffect(() => {
        checkDeviceSize();
        window.addEventListener('resize', checkDeviceSize);

        return () => {
            window.removeEventListener('resize', checkDeviceSize);
        };
    }, []);

    useEffect(() => {
        // Si no hay permisos resueltos aún, mostrar todos los items
        if (!resolvedPermissions) {
            setDataMainMenu(items);
            return;
        }

        // SuperAdmin ve todo
        if (resolvedPermissions.isSuperAdmin) {
            setDataMainMenu(items);
            return;
        }

        // Filtrar items del menú según los seriales de permisos del usuario
        const filteredItems = items.filter(item => {
            // Si el item no requiere permiso, mostrarlo
            if (!item.permissionID) return true;

            // Si tiene hijos, verificar que al menos uno tenga acceso
            if (item.children && item.children.length > 0) {
                const hasChildWithAccess = item.children.some(
                    (child: any) => !child.permissionID || resolvedPermissions.serials.includes(child.permissionID)
                );
                if (!hasChildWithAccess) return false;
            }

            // Verificar permiso por serial
            return resolvedPermissions.serials.includes(item.permissionID);
        });

        setDataMainMenu(filteredItems);
    }, [resolvedPermissions]);

    useEffect(() => {
        setIsAuthenticated(!!token && !!otp);
    }, [token, otp]);

    useEffect(() => {
        const a = getSafeKeyFromStorage('expandedSidebar');
        setExpandedSidebar(Boolean(a));
        if (a === "true") {
            setIsCollapsed(false);
        } else {
            setIsCollapsed(true);
        }
    }, []);


    useEffect(() => {
        const b = getSafeKeyFromStorage('expandedSidebarRight');
        setExpandedSidebarRight(Boolean(b));
        if (b === "true") {
            setIsCollapsedRight(false);
        } else {
            setIsCollapsedRight(true);
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        if (isCollapsed) {
            setExpandedSidebar(true);
            localStorage.setItem('expandedSidebar', "true");
        } else {
            setExpandedSidebar(false);
            localStorage.setItem('expandedSidebar', "false");
        }
    };

    const toggleSidebarRight = () => {
        setIsCollapsedRight(!isCollapsedRight);
        if (isCollapsedRight) {
            setExpandedSidebarRight(true);
            localStorage.setItem('expandedSidebarRight', "true");
        } else {
            setExpandedSidebarRight(false);
            localStorage.setItem('expandedSidebarRight', "false");
        }
    };

    if (!isAuthenticated) {
        return;
    }

    return (
        <div className='max-h-screen' >
            <Toaster />
            {isMobile && <div className="gap-4 m-4">
                {isAuthenticated && <div>
                    <button className="w-full hover:text-white flex rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        onClick={handleLogout}>
                        <LockClosedIcon name="layout" style={{ "float": 'left' }} className={`${isCollapsed ? 'h-7 w-7 mr-1 pl-1' : 'h-5 w-6 mr-2'} text-white-500 hover:text-white-800`} color="#EAEAEA" />
                        {getSafeKeyFromStorage('Sign off')}
                    </button>
                    {<AuthorInfo isCollapsed={!isCollapsed} />}
                </div>}
            </div>}
            {!isMobile && (
                <FloatingFeedbackBtn />
            )}
            {!isMobile && <div className="gap-x-1">
                <div id="sidebar" className={`sidebar ${isCollapsed ? 'w-20 ml-0' : 'w-[240px]'} transition-all duration-300 ease-in-out scrollbar-div`} style={{ height: "100vh", overflowY: "auto", overflowX: 'auto' }} >
                    <div className={`items-center justify-between ${isCollapsed ? 'px-2' : 'px-2'} mt-2`} >
                        {!isCollapsed && <PanelRightOpenIcon style={{ float: 'right' }} className="h-6 w-6 p-0 rounded-md text-gray-700"
                            onClick={toggleSidebar} />}
                        {isCollapsed && <PanelLeftOpenIcon style={{ float: 'right' }} className="h-6 w-6 p-0 rounded-md text-gray-700"
                            onClick={toggleSidebar} />}
                        <div className="text-md mb-2 font-bold px-0 ml-1">{FULL_NAME}</div>

                        {isAuthenticated && <div>
                            <button className="font-semibold text-white hover:text-white flex rounded-md bg-green-700 px-4 py-2 text-sm shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                onClick={handleLogout}>
                                <LockClosedIcon name="layout" style={{ "float": 'left' }} className={`${isCollapsed ? 'h-7 w-7 mr-1 pl-1' : 'h-5 w-6 mr-2'} text-white-500 hover:text-white-800`} color="#EAEAEA" />
                                {!isCollapsed && getSafeKeyFromStorage('Sign off')}
                            </button>
                        </div>}
                    </div>
                    {isAuthenticated && <AuthorInfo isCollapsed={isCollapsed} />}
                    {!isCollapsed && resolvedPermissions && (
                        <div className="text-xs text-gray-400 mt-1 px-3">
                            {resolvedPermissions.permissions.length} permiso(s) asignado(s)
                            {resolvedPermissions.isSuperAdmin && ' · SuperAdmin'}
                        </div>
                    )}
                    <div className={`container mx-auto mt-0 items-center justify-between ${isCollapsed ? 'px-0' : 'px-1'}`}>
                        {<MenuMainList items={dataMainMenu} isAuthenticated={isAuthenticated} isCollapsed={isCollapsed} setTab={() => { }} />}
                    </div>
                </div>
                <div id="rightSidebar" className={`rightSidebar ${isCollapsedRight ? 'w-[64px] mr-0 mx-0' : 'w-[240px]'} transition-all duration-300 ease-in-out`} style={{ height: "100vh", overflowY: "auto" }} >
                    <div className={`items-center justify-between ${isCollapsedRight ? 'px-2' : 'px-2'} mt-2`} >
                        {!isCollapsedRight && <PanelLeftOpenIcon style={{ float: 'right' }} className="h-6 w-6 p-0 rounded-md text-gray-700"
                            onClick={toggleSidebarRight} />}
                        {isCollapsedRight && <PanelRightOpenIcon style={{ float: 'right' }} className="h-6 w-6 p-0 rounded-md text-gray-700"
                            onClick={toggleSidebarRight} />}
                    </div>
                    {!isCollapsedRight && <Card className="col-span-2 bg-white rounded-md mx-2">
                        {/*<ActivitiesRealTime />*/}
                    </Card>}
                    <ActiveUsers isCollapsed={isCollapsedRight} />
                </div>
            </div>}
        </div>
    );
};

export default Sidebar;