import React, { createContext, useContext, useState } from "react";

export type Tab = {
    id: string;
    title: string;
    component: React.ReactNode;
};

type TabsContextType = {
    tabs: Tab[];
    activeTab: string | null;
    openTab: (id: string, title: string, component: React.ReactNode) => void;
    setParticipantSelected: (participant: any) => void;
    activeParticipant: any | null;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    refreshData: boolean;
    setRefreshData: (value: boolean) => void;
    closeTabWithRefresh: (id: string, refreshData: boolean) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [activeParticipant, setActiveParticipant] = useState<any | null>(null);

    const setParticipantSelected = (participant: any) => {
        setActiveParticipant(participant);
    };

    const openTab = (id: string, title: string, component: React.ReactNode) => {
        const exists = tabs.some((tab) => tab.id === id);
        if (!exists) {
            setTabs((prevTabs) => [...prevTabs, { id, title, component }]);
        }
        setActiveTab(id);
        window.scrollTo(0, 0);
    };

    const closeTab = (id: string) => {
        if (tabs.length == 1) {
            return;
        }
        setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
        if (activeTab === id) {
            const remainingTabs = tabs.filter((tab) => tab.id !== id);
            setActiveTab(remainingTabs[remainingTabs.length - 1 || 0]?.id || null);
        }
        window.scrollTo(0, 0);
    };


    const closeTabWithRefresh = (id: string, withRefresh: boolean) => {
        if (tabs.length == 1) {
            return;
        }
        setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
        if (activeTab === id) {
            const remainingTabs = tabs.filter((tab) => tab.id !== id);
            setActiveTab(remainingTabs[remainingTabs.length - 1 || 0]?.id || null);
        }
        // Alternar refreshData para que el efecto en las listas detecte el cambio
        if (withRefresh) {
            setRefreshData((prev) => !prev);
        }
        window.scrollTo(0, 0);
    };

    return (
        <TabsContext.Provider value={{ tabs, activeTab, openTab, closeTab, setActiveTab, setParticipantSelected, activeParticipant, refreshData, setRefreshData, closeTabWithRefresh }}>
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("useTabs debe usarse dentro de un TabsProvider");
    }
    return context;
};
