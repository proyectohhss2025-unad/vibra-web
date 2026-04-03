'use client'

import { useTabs } from "@/services/contexts/tabs-context";
import React, { useEffect, useRef } from "react";
import GeneralDashboardComponent from "../general-dashboard";

const DynamicTabs: React.FC = () => {
    const { tabs, activeTab, closeTab, setActiveTab, openTab } = useTabs();
    const tabsContainerRef = useRef<HTMLDivElement>(null);

    const scrollTabs = (direction: "left" | "right") => {
        console.log('direction: ', direction);
        if (tabsContainerRef.current) {
            const scrollAmount = direction === "left" ? -150 : 150;
            console.log('scrollAmount: ', scrollAmount);
            tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    useEffect(() => {
        openTab(
            `/Inicio`,
            "Inicio",
            <GeneralDashboardComponent />
        );
    }, []);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center border-b border-gray-300">
                <button
                    onClick={() => {
                        scrollTabs("left");
                    }}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    disabled={!tabsContainerRef.current || tabsContainerRef.current.scrollLeft === 0}
                >
                    ←
                </button>
                <div
                    ref={tabsContainerRef}
                    className="flex space-x-2 overflow-x-auto scrollbar-hide py-1"
                >
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`flex items-center space-x-2 px-4 py-1 cursor-pointer rounded ${activeTab === tab.id
                                ? "bg-blue-100 text-blue-600 border-b-2 border-blue-500"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.title}</span>
                            <button
                                className="text-red-500 hover:text-red-700 font-bold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scrollTabs("right")}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    disabled={
                        !tabsContainerRef.current ||
                        tabsContainerRef.current.scrollLeft + tabsContainerRef.current.clientWidth >=
                        tabsContainerRef.current.scrollWidth
                    }
                >
                    →
                </button>
            </div>

            {/* Tab Content */}
            <div className="scrollbar-div flex-grow bg-gray-100 rounded-b-md p-4" style={{ height: "84vh", overflowY: "auto" }}>
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`${activeTab === tab.id ? "block" : "hidden"}`}
                    >
                        {tab.component}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DynamicTabs;
