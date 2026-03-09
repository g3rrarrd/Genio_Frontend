
export type Difficulty = 'Banca' | 'Amateur' | 'PRO' | 'Leyenda';

export interface Question {
  id: number;
  pregunta: string;
  respuesta: boolean;
  dificultad: Difficulty;
  explicacion: string;
  tema?: string;
}

export interface User {
  name: string;
  email: string;
  description?: string;
  avatarColor?: string;
  avatarIcon?: string;
}

export interface GameState {
  currentScreen: 'HOME' | 'DIFFICULTY' | 'GAMEPLAY' | 'FEEDBACK' | 'SUMMARY' | 'LEAD_CAPTURE' | 'RANKING' | 'AUTH' | 'PROFILE';
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
