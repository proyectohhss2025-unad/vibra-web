'use client'

import { useTabs } from "@/services/contexts/tabs-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DashboardRouter } from "../dashboard/dashboard-router";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface DynamicTabsProps {
    roleName?: string;
}

const DynamicTabs: React.FC<DynamicTabsProps> = ({ roleName }) => {
    const { tabs, activeTab, closeTab, setActiveTab, openTab } = useTabs();
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const hasOpenedInicio = useRef(false);

    const updateScrollState = useCallback(() => {
        const el = tabsContainerRef.current;
        if (!el) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }
        const hasOverflow = el.scrollWidth > el.clientWidth;
        setCanScrollLeft(hasOverflow && el.scrollLeft > 2);
        setCanScrollRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }, []);

    // Abrir tab inicial SOLO cuando roleName está definido.
    // Si se abre sin roleName (ej: permisos aún no cargados), el dashboard
    // por defecto (GeneralDashboard) queda fijo y nunca se actualiza porque
    // openTab() NO reemplaza tabs existentes.
    useEffect(() => {
        if (!roleName || hasOpenedInicio.current) return;
        hasOpenedInicio.current = true;
        openTab(
            `/Inicio`,
            "Inicio",
            <DashboardRouter roleName={roleName} />
        );
    }, [roleName, openTab]);

    const scrollTabs = (direction: "left" | "right") => {
        const el = tabsContainerRef.current;
        if (!el) return;
        const scrollAmount = direction === "left" ? -200 : 200;
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
        // Actualizar estado después del scroll
        setTimeout(updateScrollState, 100);
    };

    // Recalcular en cada cambio de tabs y en resize/scroll
    useEffect(() => {
        updateScrollState();
    }, [tabs, updateScrollState]);

    // Hacer scroll automático para mostrar la tab activa
    useEffect(() => {
        const el = tabsContainerRef.current;
        if (!el) return;
        const activeTabEl = el.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement | null;
        if (activeTabEl) {
            activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            setTimeout(updateScrollState, 150);
        }
    }, [activeTab, tabs.length, updateScrollState]);

    useEffect(() => {
        const el = tabsContainerRef.current;
        if (!el) return;

        const handleScroll = () => updateScrollState();
        el.addEventListener("scroll", handleScroll, { passive: true });

        const observer = new ResizeObserver(() => updateScrollState());
        observer.observe(el);
        if (el.parentElement) observer.observe(el.parentElement);

        return () => {
            el.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, [updateScrollState]);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center border-b border-gray-300 bg-white rounded-t-md">
                {/* Flecha izquierda — solo visible cuando hay overflow hacia la izquierda */}
                <button
                    onClick={() => scrollTabs("left")}
                    className={`flex-shrink-0 px-1 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-all ${
                        canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    tabIndex={canScrollLeft ? 0 : -1}
                    aria-hidden={!canScrollLeft}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div
                    ref={tabsContainerRef}
                    className="flex space-x-1 overflow-x-auto scrollbar-hide py-1 flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            data-tab-id={tab.id}
                            className={`flex items-center space-x-2 px-4 py-1.5 cursor-pointer rounded whitespace-nowrap text-sm transition-colors ${
                                activeTab === tab.id
                                    ? "bg-blue-100 text-blue-600 border-b-2 border-blue-500"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.title}</span>
                            {tab.id !== '/Inicio' && (
                                <button
                                    className="text-red-400 hover:text-red-600 font-bold text-xs ml-1 rounded-full hover:bg-red-50 w-4 h-4 flex items-center justify-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                        setTimeout(updateScrollState, 50);
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Flecha derecha — solo visible cuando hay overflow hacia la derecha */}
                <button
                    onClick={() => scrollTabs("right")}
                    className={`flex-shrink-0 px-1 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-all ${
                        canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    tabIndex={canScrollRight ? 0 : -1}
                    aria-hidden={!canScrollRight}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Tab Content */}
            <div className="scrollbar-div flex-grow bg-gray-100 rounded-b-md p-4" style={{ height: "84vh", overflowY: "auto" }}>
                {tabs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                            <p className="text-sm text-muted-foreground">
                                Cargando panel...
                            </p>
                        </div>
                    </div>
                ) : (
                    tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`${activeTab === tab.id ? "block" : "hidden"}`}
                        >
                            {tab.component}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DynamicTabs;
