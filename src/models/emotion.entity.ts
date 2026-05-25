import { BaseModel } from "./basic.models";

export interface Emotion extends BaseModel {
    id: string;
    name: string;
    orientationNote?: string;
    description?: string;
    icono: string;
    percentNote: number;
    category?: 'Positiva' | 'Negativa' | 'Neutra' | 'Basica' | 'Compleja';
    intensity?: number;
    isActive: boolean;
}

export class Emotion implements BaseModel {
    id!: string;
    name!: string;
    orientationNote?: string;
    description?: string;
    icono!: string;
    percentNote: number = 0;
    category?: 'Positiva' | 'Negativa' | 'Neutra' | 'Basica' | 'Compleja';
    intensity?: number;
    isActive: boolean = true;
}
