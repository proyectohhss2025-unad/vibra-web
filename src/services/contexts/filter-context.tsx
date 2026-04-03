import { getYearCurrent } from "@/utils/dates";
import React, { createContext, useContext, useState } from "react";

type FilterContextType = {
    contractFilter: string;
    setContractFilter: (value: string) => void;
    epsIpsFilter: string;
    setEpsIpsFilter: (value: string) => void;
    dateInitFilter: Date;
    setDateInitFilter: (value: Date) => void;
    dateEndFilter: Date;
    setDateEndFilter: (value: Date) => void;
    yearFilter: number;
    setYearFilter: (value: number) => void;
    participantFilter: any;
    setParticipantFilter: (value: any) => void;
    isRangeFilter: boolean;
    setIsRangeFilter: (value: boolean) => void;
    statusFilter: any;
    setStatusFilter: (value: any) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [contractFilter, setContractFilter] = useState<any | null>(null);
    const [epsIpsFilter, setEpsIpsFilter] = useState<any | null>(null);
    const [dateInitFilter, setDateInitFilter] = useState<any | null>(null);
    const [dateEndFilter, setDateEndFilter] = useState<any | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(getYearCurrent());
    const [participantFilter, setParticipantFilter] = useState<any | null>(null);
    const [isRangeFilter, setIsRangeFilter] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<any | null>(null);

    return (
        <FilterContext.Provider value={{
            contractFilter,
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
            setParticipantFilter,
            isRangeFilter,
            setIsRangeFilter,
            statusFilter,
            setStatusFilter
        }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilter debe usarse dentro de un FilterProvider");
    }
    return context;
};
