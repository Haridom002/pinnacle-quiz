import { useState, useEffect, useCallback } from 'react';
import { Quiz, Player, PlayerAnswer } from './types';
import { SAMPLE_QUIZZES } from './data/quizzes';
import { generateGameCode, simulateBotAnswer, calculatePoints, getStreakMultiplier } from './utils/gameUtils';
import HomeScreen from './components/HomeScreen';
import QuizDetail from './components/QuizDetail';
import Lobby from './components/Lobby';
import QuestionScreen from './components/QuestionScreen';
import Leaderboard from './components/Leaderboard';
import Podium from './components/Podium';
import QuizBuilder from './components/QuizBuilder';
import ArenaHub from './components/ArenaHub';
import LightningCalculator from './components/LightningCalculator';
import FormationMode from './components/FormationMode';
import TugOfWar from './components/TugOfWar';
import ArenaHostMode from './components/ArenaHostMode';

type AppPhase =
  | 'home' | 'lobby' | 'question' | 'leaderboard' | 'podium'
  | 'quiz-builder' | 'quiz-detail'
  | 'arena-hub' | 'lightning-calc' | 'formation-mode' | 'tug-war' | 'arena-host';

export default function App() {
  const [phase, setPhase]               = useState<AppPhase>('home');
  const [quizLibrary, setQuizzes]       = useState<Quiz[]>(SAMPLE_QUIZZES);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [gameCode, setGameCode]         = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [allPlayers, setAllPlayers]     = useState<Player[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const handleStartGame = useCallback((player: Player, botPlayers: Player[]) => {
    setCurrentPlayer(player);
    setAllPlayers([player, ...botPlayers]);
    setQuestionIndex(0);
    setPhase('question');
  }, []);

  useEffect(() => {
    if (phase !== 'question' || !selectedQuiz) return;
    const question = selectedQuiz.questions[questionIndex];
    if (!question) return;
    const t = setTimeout(() => {
      setAllPlayers(prev => prev.map(p => {
        if (p.id === currentPlayer?.id) return p;
        const { answerId, timeMs } = simulateBotAnswer(question, 'medium');
        const ans = question.answers.find(a => a.id === answerId);
        const isCorrect = ans?.isCorrect ?? false;
        const pts = Math.floor(
          calculatePoints(question.points, question.timeLimit, timeMs, isCorrect) *
          getStreakMultiplier(p.streak)
        );
        return {
          ...p, score: p.score + pts,
          streak: isCorrect ? p.streak + 1 : 0,
          answers: [...p.answers, { questionId: question.id, answerId, timeMs, pointsEarned: pts, isCorrect } as PlayerAnswer],
        };
      }));
    }, 500);
    return () => clearTimeout(t);
  }, [questionIndex, phase, selectedQuiz, currentPlayer?.id]);

  const handleAnswer = useCallback((answerId: string | null, pointsEarned: number, isCorrect: boolean) => {
    if (!selectedQuiz || !currentPlayer) return;
    const q = selectedQuiz.questions[questionIndex];
    const updated: Player = {
      ...currentPlayer,
      score: currentPlayer.score + pointsEarned,
      streak: isCorrect ? currentPlayer.streak + 1 : 0,
      answers: [...currentPlayer.answers, { questionId: q.id, answerId, timeMs: 0, pointsEarned, isCorrect }],
    };
    setCurrentPlayer(updated);
    setAllPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updated : p));
    setPhase('leaderboard');
  }, [selectedQuiz, currentPlayer, questionIndex]);

  const handleContinue = useCallback(() => {
    if (!selectedQuiz) return;
    if (questionIndex >= selectedQuiz.questions.length - 1) setPhase('podium');
    else { setQuestionIndex(i => i + 1); setPhase('question'); }
  }, [selectedQuiz, questionIndex]);

  const goHome = () => {
    setPhase('home'); setCurrentPlayer(null); setAllPlayers([]); setQuestionIndex(0);
  };

  // Arena modes
  if (phase === 'arena-hub')      return <ArenaHub onMode={m => setPhase(m === 'lightning' ? 'lightning-calc' : m === 'formation' ? 'formation-mode' : m === 'tug' ? 'tug-war' : 'arena-host')} onBack={() => setPhase('home')} />;
  if (phase === 'arena-host')     return <ArenaHostMode onBack={() => setPhase('arena-hub')} />;
  if (phase === 'lightning-calc') return <LightningCalculator onBack={() => setPhase('arena-hub')} />;
  if (phase === 'formation-mode') return <FormationMode onBack={() => setPhase('arena-hub')} />;
  if (phase === 'tug-war')        return <TugOfWar onBack={() => setPhase('arena-hub')} />;
  if (phase === 'quiz-builder')   return <QuizBuilder onSave={q => { setQuizzes(p => [q, ...p]); setTimeout(() => setPhase('home'), 800); }} onBack={() => setPhase('home')} />;

  if (phase === 'quiz-detail' && selectedQuiz)
    return <QuizDetail quiz={selectedQuiz} onPlay={() => { setGameCode(generateGameCode()); setPhase('lobby'); }} onBack={() => setPhase('home')} />;

  if (phase === 'lobby' && selectedQuiz)
    return <Lobby quiz={selectedQuiz} gameCode={gameCode} onStartGame={handleStartGame} onBack={() => setPhase('home')} />;

  if (phase === 'question' && selectedQuiz && currentPlayer) {
    const q = selectedQuiz.questions[questionIndex];
    return <QuestionScreen key={`q-${questionIndex}`} question={q} questionNumber={questionIndex + 1} totalQuestions={selectedQuiz.questions.length} player={currentPlayer} allPlayers={allPlayers} onAnswer={handleAnswer} quizCoverColor={selectedQuiz.coverColor} />;
  }

  if (phase === 'leaderboard' && selectedQuiz && currentPlayer)
    return <Leaderboard players={allPlayers} currentPlayer={currentPlayer} questionNumber={questionIndex + 1} totalQuestions={selectedQuiz.questions.length} onContinue={handleContinue} isLastQuestion={questionIndex >= selectedQuiz.questions.length - 1} />;

  if (phase === 'podium' && selectedQuiz && currentPlayer)
    return <Podium players={allPlayers} currentPlayer={currentPlayer} quiz={selectedQuiz}
      onPlayAgain={() => { setGameCode(generateGameCode()); setCurrentPlayer(null); setAllPlayers([]); setQuestionIndex(0); setPhase('lobby'); }}
      onHome={goHome} />;

  return (
    <HomeScreen
      onStartQuiz={q => { setSelectedQuiz(q); setGameCode(generateGameCode()); setPhase('lobby'); }}
      onViewQuiz={q => { setSelectedQuiz(q); setPhase('quiz-detail'); }}
      onCreateQuiz={() => setPhase('quiz-builder')}
      onArena={() => setPhase('arena-hub')}
      quizzes={quizLibrary}
    />
  );
}
