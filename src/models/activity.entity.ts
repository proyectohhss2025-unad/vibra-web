import { BaseModel } from "./basic.models";
import { Emotion } from "./emotion.entity";

export interface Activity extends BaseModel {
    id: string;
    emotion: Emotion;
    title: string;
    description?: string;
    resources?: Array<{
        type: 'video' | 'audio';
        url: string;
        duration?: number;
        metadata?: Record<string, any>;
    }>;
    questions?: Array<{
        id: string;
        questionText: string;
        type: 'multiple' | 'open';
        options?: string[];
        correctAnswer?: string;
        points: number;
    }>;
    difficulty: number;
    isActive: boolean;
    schedule?: {
        date: Date;
        weekNumber: number;
        year: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export class Activity implements BaseModel {
    id!: string;
    emotion!: Emotion;
    title!: string;
    description?: string;
    resources?: Array<{
        type: 'video' | 'audio';
        url: string;
        duration?: number;
        metadata?: Record<string, any>;
    }>;
    questions?: Array<{
        id: string;
        questionText: string;
        type: 'multiple' | 'open';
        options?: string[];
        correctAnswer?: string;
        points: number;
    }>;
    difficulty: number = 3;
    isActive: boolean = true;
    schedule?: {
        date: Date;
        weekNumber: number;
        year: number;
    };
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}