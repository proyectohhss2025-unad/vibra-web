import { BaseModel } from "./basic.models";

export interface DocumentType extends BaseModel {
    name: string;
    description: string;
}

export class DocumentType implements BaseModel {
    name: string;
    description: string;
}