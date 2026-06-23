'use client'

import { User } from "@/models/user.entity"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/new-york/ui/hover-card"
import { AuthContext } from "@/services/auth"
import { useDevice } from "@/services/contexts/device-context"
import { useFilter } from "@/services/contexts/filter-context"
import { useTabs } from "@/services/contexts/tabs-context"
import OfflineSync from "@/services/offline-sync"
import { FORMAT_DATE_SHORT } from "@/utils/constants"
import { formatDate } from "@/utils/dates"
import { getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import { OpenInNewWindowIcon } from "@radix-ui/react-icons"
import { TextSearchIcon } from "lucide-react"
import { useRouter } from "next/router"
import React, { useContext, useEffect, useState } from "react"
import DynamicTabs from "./general-dashboard/dynamic-tabs"
import MainNav from "./general-dashboard/main-nav"
import { NotificationsItem } from "./general-dashboard/notifications-item"
import SearchInAllPage from "./general-dashboard/search"
import TeamSwitcher from "./general-dashboard/team-switcher"
import { UserNav } from "./general-dashboard/user-nav"

const HomeDashboardComponent: React.FC = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token, otp, resolvedPermissions } = useContext(AuthContext);
    const [data, setData] = useState<any>([]);
    const [, setIsAuthenticated] = useState<boolean>(!!token && !!otp);

    const router = useRouter();
    const { openTab } = useTabs();
    const { isMobile, isTablet } = useDevice();
    const { contractFilter,
        setContractFilter,
        epsIpsFilter,
        setEpsIpsFilter,
        dateInitFilter,
        setDateInitFilter,
        dateEndFilter,
        setDateEndFilter,
        yearFilter,
        setYearFilter,
        participantFilter,
        setParticipantFilter } = useFilter();

    useEffect(() => {
        setIsAuthenticated(!!token && !!otp);
    }, [token, otp]);

    const formatFilterDate = (date: any): string => {
        if (!date) return 'Sin filtro';
        try {
            return formatDate(date, FORMAT_DATE_SHORT);
        } catch {
            return 'Fecha inválida';
        }
    };

    // Calcular labelData directamente en el render (sin estado ni efecto)
    const filterLabel = (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-20">Año:</span>
                <span className="text-sm font-semibold text-gray-800">{yearFilter || 'Todos'}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-20">Desde:</span>
                <span className="text-sm text-gray-800">{formatFilterDate(dateInitFilter)}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-20">Hasta:</span>
                <span className="text-sm text-gray-800">{formatFilterDate(dateEndFilter)}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-20">Usuario:</span>
                <span className="text-sm text-gray-800">{participantFilter?.label || 'Todos'}</span>
            </div>
        </div>
    );

    return (
        <>
            {/*<div className="p-4 bg-gray-800 text-white">
                {isTablet && !isMobile && <p>Estás en una tablet</p>}
                {!isMobile && !isTablet && <p>Estás en un dispositivo de escritorio</p>}
            </div>*/}
            {isMobile && <div className="grid grid-cols">
                <div className="grid-cols items-top px-4">
                    <MainNav className="m-6 gap-y-4" />
                    <DynamicTabs />
                </div>
            </div>}
            <div className="hidden bg-white flex-col md:flex w-full rounded-md">
                {/* INFO: Menu de navegación superior */}
                <div className="border-b bg-white rounded-t-md">
                    <div className="flex h-16 items-center mr-4">
                        <TeamSwitcher />
                        <MainNav className="mx-4" />
                        <React.StrictMode>
                            <OfflineSync apiUrl="https://example.com/api/sync" isIcon={true} />
                        </React.StrictMode>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <TextSearchIcon className="w-6 h-6 ml-2" onClick={() => {
                                }} />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="flex justify-between space-x-4" >
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Datos en el filtro</h4>
                                        <p className="text-sm">
                                            {filterLabel}
                                        </p>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>

                        <div className="ml-auto flex items-center space-x-4">
                            <SearchInAllPage isOpen={true} val="" onClose={() => { }} setData={setData} disabled={false} resolvedPermissions={resolvedPermissions} >
                                {data.length > 1 && (
                                    <div className="absolute flex col-span-1 mt-1">
                                        <ul className="z-[100] bg-white border rounded-md shadow-sm w-full">
                                            {data.map((searchResult: any) => (
                                                <li
                                                    key={searchResult?.id}
                                                    className="hover:bg-gray-200 p-2 flex items-center"
                                                    onClick={() => {
                                                        openTab(
                                                            `/${searchResult?.id}`,
                                                            `${searchResult?.title}`,
                                                            <searchResult.component />
                                                        );
                                                        setData([]);
                                                    }}
                                                ><OpenInNewWindowIcon className="mr-2 h-4 w-4 opacity-70" />
                                                    {searchResult?.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </SearchInAllPage>
                            <NotificationsItem />
                            <UserNav />
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-4 pt-2">

                    {/* INFO: Tabs de carga dinámica de componentes */}
                    <DynamicTabs />
                </div>
            </div>
        </>
    )
}

export default HomeDashboardComponent;
