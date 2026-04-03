import { BaseModel } from "./basic.models";
import { User } from "./user.entity";
import { DocumentType } from "./documentType.entity";

export interface Company extends BaseModel {
    name: string;
    slogan: string;
    nit: string;
    address: string;
    email: string;
    phoneNumber: string;
    managerData: {
        name: string;
        documentType: DocumentType;
        document: string;
        email: string;
        phoneNumber: string;
    };
    userAdmin: User;
    modules: {
        billing: {
            seriesCurrentBillingRange: string;
        }
    };
    isMain?: boolean;
}

export class Company implements BaseModel {
    name: string;
    slogan: string;
    nit: string;
    address: string;
    email: string;
    phoneNumber: string;
    managerData: {
        name: string;
        documentType: DocumentType;
        document: string;
        email: string;
        phoneNumber: string;
    };
    userAdmin: User;
    modules: {
        billing: {
            seriesCurrentBillingRange: string;
        }
    };
    isMain?: boolean;
}

