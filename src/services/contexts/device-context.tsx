import useMediaQuery from "@/helpers/useMediaQuery";
import React, { createContext, useContext, ReactNode } from "react";

interface DeviceContextValue {
    isMobile: boolean;
    isTablet: boolean;
}

const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);

interface DeviceProviderProps {
    children: ReactNode;
}

export const DeviceProvider = ({ children }: DeviceProviderProps) => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(max-width: 1024px) and (min-width: 769px)");

    return (
        <DeviceContext.Provider value={{ isMobile, isTablet }}>
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = (): DeviceContextValue => {
    const context = useContext(DeviceContext);
    if (!context) {
        throw new Error("useDevice debe usarse dentro de DeviceProvider");
    }
    return context;
};
