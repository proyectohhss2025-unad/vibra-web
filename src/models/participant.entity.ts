import { BaseModel } from "./basic.models";

export class Participant implements BaseModel {
    userId: string;
    nickname: string;
    avatar?: string;
    points: number;
    level: 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante';
    currentStreak: number;
    maxStreak: number;
    totalActivitiesCompleted: number;
    lastActivityDate?: Date;
    currentCourse?: string;
    isActive: boolean;

    // Campos legacy (compatibilidad)
    name?: string;
    nit?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    creditLimit?: number;
}

export interface Participant extends BaseModel {
    userId: string;
    nickname: string;
    avatar?: string;
    points: number;
    level: 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante';
    currentStreak: number;
    maxStreak: number;
    totalActivitiesCompleted: number;
    lastActivityDate?: Date;
    currentCourse?: string;
    isActive: boolean;

    // Campos legacy
    name?: string;
    nit?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    creditLimit?: number;
    managerData?: {
        name: string;
        document: string;
        documentType: any;
        email: string;
        phoneNumber: string;
    };
}
