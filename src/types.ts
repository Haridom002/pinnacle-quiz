export type QuestionType = 'multiple-choice' | 'true-false' | 'poll';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  color: string;
  icon: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  timeLimit: number;
  points: number;
  answers: Answer[];
  imageUrl?: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  coverColor: string;
  icon: string;
  questions: Question[];
  createdAt: string;
  playCount: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  answers: PlayerAnswer[];
  xp?: number;
  level?: number;
  lives?: number;
  combo?: number;
  accuracy?: number;
  house?: 'Alpha' | 'Beta' | 'Gamma' | 'Pulsar';
  badges?: string[];
}

export interface PlayerAnswer {
  questionId: string;
  answerId: string | null;
  timeMs: number;
  pointsEarned: number;
  isCorrect: boolean;
}

export type GamePhase =
  | 'home'
  | 'lobby'
  | 'question'
  | 'answer-reveal'
  | 'leaderboard'
  | 'podium'
  | 'quiz-builder'
  | 'quiz-detail'
  | 'lightning-calculator'
  | 'formation-mode'
  | 'tug-of-war';

export interface GameState {
  phase: GamePhase;
  quiz: Quiz | null;
  currentQuestionIndex: number;
  players: Player[];
  timeRemaining: number;
  selectedAnswerId: string | null;
  showLeaderboard: boolean;
  gameCode: string;
}

export interface LeaderboardEntry {
  player: Player;
  rank: number;
  change: number;
}

// Smart Calculation Arena Types
export type MathOperation = 'multiply' | 'add' | 'subtract' | 'divide' | 'mixed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'genius';
export type TrainingCategory =
  | 'Multiplication Tables Sprint'
  | 'Addition Rush'
  | 'Division Challenge'
  | 'Subtraction Blitz'
  | 'Mixed Operations Storm';

export interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  operation: MathOperation;
  difficulty: DifficultyLevel;
  timeLimit: number;
  points: number;
}

export interface ArenaPlayer extends Player {
  combo: number;
  multiplier: number;
  lives: number;
  xp: number;
  level: number;
  accuracy: number;
  totalAnswered: number;
  correctAnswered: number;
  avgSpeed: number;
  house: 'Alpha' | 'Beta' | 'Gamma' | 'Pulsar';
}

export interface TugTeam {
  id: 'red' | 'blue';
  name: string;
  color: string;
  players: ArenaPlayer[];
  score: number;
  combo: number;
  pullingStrength: number;
}

export interface PowerUp {
  id: string;
  name: string;
  icon: string;
  description: string;
  effect: 'double_points' | 'time_freeze' | 'shield' | 'speed_boost';
  duration: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface DailyChallenge {
  date: string;
  operation: MathOperation;
  difficulty: DifficultyLevel;
  targetScore: number;
  completed: boolean;
}
