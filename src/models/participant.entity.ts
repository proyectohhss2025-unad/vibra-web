import { BaseModel } from "./basic.models";
import { DocumentType } from "./documentType.entity";

export class Participant implements BaseModel {
    name: string;
    nit: string;
    address: string;
    phoneNumber: string;
    email: string;
    transactions?: any[];
    managerData: {
        name: string;
        documentType: DocumentType;
        document: string;
        email: string;
        phoneNumber: string;
    };
    creditLimit: number;
    avatar: string;
}

export interface Participant extends BaseModel {
    name: string;
    nit: string;
    address: string;
    phoneNumber: string;
    email: string;
    transactions?: any[];
    managerData: {
        name: string;
        documentType: DocumentType;
        document: string;
        email: string;
        phoneNumber: string;
    };
    creditLimit: number;
    avatar: string;
}
