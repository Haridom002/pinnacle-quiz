import { Player, Question } from '../types';

export function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calculatePoints(
  basePoints: number,
  timeLimit: number,
  timeTakenMs: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0;
  const timeRatio = 1 - timeTakenMs / (timeLimit * 1000);
  const speedBonus = Math.floor(timeRatio * 500);
  return basePoints / 2 + speedBonus;
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  if (streak >= 2) return 1.25;
  return 1.0;
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function getScoreGrade(
  score: number,
  totalPossible: number
): { grade: string; color: string; message: string } {
  const pct = (score / totalPossible) * 100;
  if (pct >= 90) return { grade: 'A+', color: 'text-green-400', message: 'Outstanding! 🌟' };
  if (pct >= 80) return { grade: 'A', color: 'text-green-400', message: 'Excellent work! 🎉' };
  if (pct >= 70) return { grade: 'B', color: 'text-blue-400', message: 'Great job! 👏' };
  if (pct >= 60) return { grade: 'C', color: 'text-yellow-400', message: 'Good effort! 💪' };
  if (pct >= 50) return { grade: 'D', color: 'text-orange-400', message: 'Keep practising! 📚' };
  return { grade: 'F', color: 'text-red-400', message: 'Don\'t give up! 🔥' };
}

export function sortLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}

export function generateBotPlayers(count: number = 4): Player[] {
  const botNames = [
    'AlgebraAce', 'QuizWiz', 'BrainStorm', 'MindMaster',
    'ThinkFast', 'SmartCookie', 'EinsteinJr', 'TopScorer',
    'Pinnacle01', 'StudyBuddy', 'KnowledgeKing', 'LearnBot',
  ];
  const avatars = ['🦁', '🐯', '🦊', '🐺', '🦝', '🐻', '🐼', '🐨', '🦄', '🐸', '🦋', '🐙'];

  const shuffled = [...botNames].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((name, i) => ({
    id: `bot-${i}`,
    name,
    avatar: avatars[i % avatars.length],
    score: 0,
    streak: 0,
    answers: [],
  }));
}

export function simulateBotAnswer(
  question: Question,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { answerId: string; timeMs: number } {
  const accuracy = difficulty === 'easy' ? 0.85 : difficulty === 'medium' ? 0.65 : 0.45;
  const isCorrect = Math.random() < accuracy;
  const correctAnswer = question.answers.find((a) => a.isCorrect)!;
  const wrongAnswers = question.answers.filter((a) => !a.isCorrect);

  const answerId = isCorrect
    ? correctAnswer.id
    : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]?.id ?? correctAnswer.id;

  const minTime = question.timeLimit * 200;
  const maxTime = question.timeLimit * 800;
  const timeMs = Math.floor(Math.random() * (maxTime - minTime) + minTime);

  return { answerId, timeMs };
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0';
  return String(Math.ceil(seconds));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
