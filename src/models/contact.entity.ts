import { BaseModel } from "./basic.models";

export interface Contact extends BaseModel {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'in_progress' | 'resolved' | 'spam';
    notes?: string;
    readAt?: Date | null;
    resolvedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Contact implements BaseModel {
    _id!: string;
    name!: string;
    email!: string;
    subject!: string;
    message!: string;
    status: 'unread' | 'read' | 'in_progress' | 'resolved' | 'spam' = 'unread';
    notes?: string;
    readAt?: Date | null;
    resolvedAt?: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
}
