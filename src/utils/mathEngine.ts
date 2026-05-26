import { MathQuestion, MathOperation, DifficultyLevel } from '../types';

let questionIdCounter = 0;

function generateId(): string {
  return `mq-${++questionIdCounter}-${Date.now()}`;
}

interface RangeConfig {
  min: number;
  max: number;
}

const DIFFICULTY_RANGES: Record<DifficultyLevel, Record<MathOperation, { a: RangeConfig; b: RangeConfig; timeLimit: number; points: number }>> = {
  beginner: {
    multiply: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 }, timeLimit: 15, points: 100 },
    add:      { a: { min: 1, max: 50 }, b: { min: 1, max: 50 }, timeLimit: 10, points: 80 },
    subtract: { a: { min: 10, max: 50 }, b: { min: 1, max: 10 }, timeLimit: 10, points: 80 },
    divide:   { a: { min: 2, max: 9 }, b: { min: 2, max: 9 }, timeLimit: 15, points: 100 },
    mixed:    { a: { min: 1, max: 20 }, b: { min: 1, max: 10 }, timeLimit: 12, points: 90 },
  },
  intermediate: {
    multiply: { a: { min: 6, max: 15 }, b: { min: 6, max: 15 }, timeLimit: 12, points: 150 },
    add:      { a: { min: 20, max: 100 }, b: { min: 20, max: 100 }, timeLimit: 8, points: 120 },
    subtract: { a: { min: 50, max: 200 }, b: { min: 10, max: 50 }, timeLimit: 8, points: 120 },
    divide:   { a: { min: 12, max: 144 }, b: { min: 2, max: 12 }, timeLimit: 12, points: 150 },
    mixed:    { a: { min: 10, max: 50 }, b: { min: 5, max: 25 }, timeLimit: 10, points: 140 },
  },
  advanced: {
    multiply: { a: { min: 12, max: 25 }, b: { min: 12, max: 25 }, timeLimit: 10, points: 200 },
    add:      { a: { min: 100, max: 500 }, b: { min: 100, max: 500 }, timeLimit: 7, points: 180 },
    subtract: { a: { min: 200, max: 999 }, b: { min: 50, max: 200 }, timeLimit: 7, points: 180 },
    divide:   { a: { min: 50, max: 300 }, b: { min: 5, max: 20 }, timeLimit: 10, points: 200 },
    mixed:    { a: { min: 20, max: 100 }, b: { min: 10, max: 50 }, timeLimit: 8, points: 190 },
  },
  genius: {
    multiply: { a: { min: 25, max: 99 }, b: { min: 11, max: 99 }, timeLimit: 8, points: 350 },
    add:      { a: { min: 500, max: 9999 }, b: { min: 500, max: 9999 }, timeLimit: 6, points: 300 },
    subtract: { a: { min: 1000, max: 9999 }, b: { min: 100, max: 999 }, timeLimit: 6, points: 300 },
    divide:   { a: { min: 100, max: 999 }, b: { min: 11, max: 99 }, timeLimit: 8, points: 350 },
    mixed:    { a: { min: 50, max: 999 }, b: { min: 10, max: 99 }, timeLimit: 7, points: 320 },
  },
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperation(op: MathOperation): MathOperation {
  if (op !== 'mixed') return op;
  const ops: MathOperation[] = ['multiply', 'add', 'subtract', 'divide'];
  return ops[Math.floor(Math.random() * ops.length)];
}

export function generateMathQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel
): MathQuestion {
  const actualOp = pickOperation(operation);
  const config = DIFFICULTY_RANGES[difficulty][actualOp];

  let a: number;
  let b: number;
  let answer: number;
  let questionStr: string;

  switch (actualOp) {
    case 'multiply':
      a = randInt(config.a.min, config.a.max);
      b = randInt(config.b.min, config.b.max);
      answer = a * b;
      questionStr = `${a} × ${b}`;
      break;
    case 'add':
      a = randInt(config.a.min, config.a.max);
      b = randInt(config.b.min, config.b.max);
      answer = a + b;
      questionStr = `${a} + ${b}`;
      break;
    case 'subtract':
      a = randInt(config.a.min, config.a.max);
      b = randInt(config.b.min, Math.min(config.b.max, a - 1));
      if (b < 1) b = 1;
      if (b >= a) a = b + randInt(1, 20);
      answer = a - b;
      questionStr = `${a} − ${b}`;
      break;
    case 'divide':
      b = randInt(config.b.min, config.b.max);
      answer = randInt(2, Math.floor(config.a.max / b));
      a = b * answer;
      questionStr = `${a} ÷ ${b}`;
      break;
    default:
      a = randInt(1, 20);
      b = randInt(1, 10);
      answer = a + b;
      questionStr = `${a} + ${b}`;
  }

  return {
    id: generateId(),
    question: questionStr,
    answer,
    operation: actualOp,
    difficulty,
    timeLimit: config.timeLimit,
    points: config.points,
  };
}

export function generateQuestionBatch(
  operation: MathOperation,
  difficulty: DifficultyLevel,
  count: number = 10
): MathQuestion[] {
  return Array.from({ length: count }, () => generateMathQuestion(operation, difficulty));
}

export function calculateSpeedBonus(timeLimit: number, timeTaken: number): number {
  const ratio = Math.max(0, 1 - timeTaken / timeLimit);
  return Math.floor(ratio * ratio * 500);
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 3.0;
  if (combo >= 7) return 2.5;
  if (combo >= 5) return 2.0;
  if (combo >= 3) return 1.5;
  if (combo >= 2) return 1.25;
  return 1.0;
}

export function calculateXP(points: number, combo: number, correct: boolean): number {
  if (!correct) return 0;
  const base = Math.floor(points / 10);
  const comboBonus = combo >= 5 ? combo * 2 : combo;
  return base + comboBonus;
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForNextLevel(level: number): number {
  return (level * level) * 100;
}

export function getDifficultyColor(d: DifficultyLevel): string {
  return {
    beginner: '#10b981',
    intermediate: '#3b82f6',
    advanced: '#f59e0b',
    genius: '#ef4444',
  }[d];
}

export function getDifficultyLabel(d: DifficultyLevel): string {
  return {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    genius: '🔥 Genius',
  }[d];
}

export function adaptDifficulty(
  currentDifficulty: DifficultyLevel,
  recentAccuracy: number
): DifficultyLevel {
  const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'genius'];
  const idx = levels.indexOf(currentDifficulty);
  if (recentAccuracy > 0.85 && idx < levels.length - 1) return levels[idx + 1];
  if (recentAccuracy < 0.5 && idx > 0) return levels[idx - 1];
  return currentDifficulty;
}

export function getAchievements(
  totalCorrect: number,
  bestCombo: number,
  totalXP: number
): string[] {
  const badges: string[] = [];
  if (totalCorrect >= 1) badges.push('🎯 First Blood');
  if (totalCorrect >= 10) badges.push('🔟 Ten Streak');
  if (totalCorrect >= 50) badges.push('💯 Half Century');
  if (totalCorrect >= 100) badges.push('🏆 Centurion');
  if (bestCombo >= 5) badges.push('🔥 On Fire');
  if (bestCombo >= 10) badges.push('⚡ Unstoppable');
  if (totalXP >= 1000) badges.push('⭐ XP Master');
  if (totalXP >= 5000) badges.push('💎 Legend');
  return badges;
}
