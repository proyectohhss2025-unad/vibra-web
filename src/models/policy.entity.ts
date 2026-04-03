import { BaseModel } from "./basic.models";

export interface Policy extends BaseModel {
    name: string;
    description: string;
    content: string;
    category?: string;
}

export class Policy implements BaseModel {
    name!: string;
    description!: string;
    content!: string;
    category?: string;
    createdAt!: Date;
    createdBy!: string;
}

