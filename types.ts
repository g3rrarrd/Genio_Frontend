
export type Difficulty = 'Banca' | 'Amateur' | 'PRO' | 'Leyenda';

export interface Question {
  id: number;
  pregunta: string;
  respuesta: boolean;
  explicacion: string;
  categoria: number; // Always 1 for design-scoped questions
}

export interface User {
  name: string;
  email: string;
  description?: string;
  avatarColor?: string;
  avatarIcon?: string;
  identificador?: string;
  emblema?: string;
  id_usuarios?: number;
}

export interface GameState {
  currentScreen:
    | 'HOME'
    | 'DIFFICULTY'
    | 'GAMEPLAY'
    | 'FEEDBACK'
    | 'SUMMARY'
    | 'LEAD_CAPTURE'
    | 'RANKING'
    | 'AUTH'
    | 'PROFILE'
    | 'CODIGO'
    | 'DISENIO'
    | 'MENU_CONTROL';
  difficulty: Difficulty | null;
  currentQuestionIndex: number;
  questions: Question[];
  score: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  startTime: number;
  endTime: number | null;
  user?: User | null;
}
