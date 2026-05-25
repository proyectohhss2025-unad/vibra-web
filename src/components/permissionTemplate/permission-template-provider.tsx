import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import React, { createContext, useContext, useEffect, useState } from 'react';

const PermissionTemplateContext = createContext<{
    permissionTemplateData: PermissionTemplate;
    setPermissionTemplateData: React.Dispatch<React.SetStateAction<PermissionTemplate>>;
} | null
>(null);

export const usePermissionTemplateContext = () => {
    const context = useContext(PermissionTemplateContext);
    if (!context) {
        throw new Error(
            'usePermissionTemplateContext must be used within a PermissionTemplateProvider'
        );
    }
    return context;
};

export const PermissionTemplateProvider: React.FC<{
    children: React.ReactNode;
    permissionTemplateData_: PermissionTemplate
}> = ({ children, permissionTemplateData_ }) => {
    const [permissionTemplateData, setPermissionTemplateData] = useState<PermissionTemplate>(permissionTemplateData_);

    useEffect(() => {
        setPermissionTemplateData(permissionTemplateData_);
    }, [permissionTemplateData_]);

    return (
        <PermissionTemplateContext.Provider value={{ permissionTemplateData, setPermissionTemplateData }} >
            {children}
        </PermissionTemplateContext.Provider>
    );
};