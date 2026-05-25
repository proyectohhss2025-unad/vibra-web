import { BaseModel } from "./basic.models";
import { Emotion } from "./emotion.entity";

export interface Tip {
    emoji: string;
    message: string;
    category?: 'start' | 'question' | 'wordsearch' | 'matching' | 'emotionbox' | 'dicegame' | 'complete';
}

export interface GameEntry {
    type: 'WordSearch' | 'MatchingConcepts' | 'DiceGame' | 'EmotionBox';
    config: Record<string, any>;
    order: number;
}

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
    tips?: Tip[];
    games?: GameEntry[];
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
    tips?: Tip[];
    games?: GameEntry[];
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}