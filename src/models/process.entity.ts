export class Process {
    _id: string;
    name: string;
    description: string;
    editedAt?: Date;
    editedBy?: string;
    createdAt: Date;
    createdBy: string;
}

export interface Process {
    _id: string;
    name: string;
    description: string;
    editedAt?: Date;
    editedBy?: string;
    createdAt: Date;
    createdBy: string;
}