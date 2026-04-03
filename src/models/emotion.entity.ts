import { BaseModel } from "./basic.models";

export interface Emotion extends BaseModel {
    id: string;
    name: string;
    orientationNote?: string;
    description?: string;
    icono: string;
    percentNote: number;
}

export class Emotion implements BaseModel {
    id!: string;
    name!: string;
    orientationNote?: string;
    description?: string;
    icono!: string;
    percentNote: number = 0;
}