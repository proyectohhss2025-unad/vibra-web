/**
 * Modelo de entidad para Test
 * Representa la definición de un test con sus preguntas embebidas
 */

export interface Test {
  _id?: string;
  testId: string;
  title: string;
  description: string;
  category?: string;
  difficulty: number;
  timeLimit?: number;
  passingScore?: number;
  isActive: boolean;
  showAtStart?: boolean;
  showAtEnd?: boolean;
  questions: TestQuestion[];
  tags?: string[];
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestQuestion {
  questionId: string;
  type: 'open' | 'single' | 'multiple';
  text: string;
  options?: string[];
  points?: number;
  required?: boolean;
}

export interface TestResponse {
  _id?: string;
  testId: string;
  userId: string;
  userName?: string;
  responses: {
    questionId: string;
    answer: string | string[];
    points: number;
  }[];
  totalScore: number;
  timeSpent?: number;
  createdAt?: string;
}

export interface TestPaginatedResponse {
  data: Test[];
  total: number;
}
