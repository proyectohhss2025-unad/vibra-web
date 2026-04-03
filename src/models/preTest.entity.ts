/**
 * Modelo de entidad para PreTest
 * Representa un test de preguntas que se realiza a los usuarios
 */

export interface PreTestResponse {
    _id?: string;
    testId: string;
    userId: string;
    responses: {
        questionId: string;
        answer: string;
        points: number;
    }[];
    totalScore: number;
}

export interface PreTest {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    questions: Question[];
    difficulty: number;
    timeLimit?: number; // Tiempo límite en minutos para completar el test
    passingScore?: number; // Puntaje mínimo para aprobar (porcentaje)
    isActive: boolean;
    category?: string; // Categoría del test (ej: 'Conocimiento', 'Habilidades', 'Personalidad')
    tags?: string[]; // Etiquetas para clasificar el test
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface Question {
    id?: string;
    text: string;
    type: QuestionType;
    options?: Option[];
    correctAnswer?: string | string[]; // Puede ser un ID o array de IDs para respuestas múltiples
    points: number; // Valor en puntos de la pregunta
    required: boolean;
    explanation?: string; // Explicación de la respuesta correcta
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SINGLE_CHOICE = 'single_choice',
    TRUE_FALSE = 'true_false',
    TEXT = 'text',
    MATCHING = 'matching'
}

export interface Option {
    id?: string;
    text: string;
    isCorrect?: boolean;
}