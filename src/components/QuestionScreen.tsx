import { useState, useEffect, useCallback } from 'react';
import { Question, Player } from '../types';
import { calculatePoints, getStreakMultiplier } from '../utils/gameUtils';
import { soundEngine } from '../utils/soundEngine';
import MusicPlayer from './MusicPlayer';

interface QuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  player: Player;
  allPlayers: Player[];
  onAnswer: (answerId: string | null, pointsEarned: number, isCorrect: boolean) => void;
  quizCoverColor?: string;
}

export default function QuestionScreen({
  question, questionNumber, totalQuestions, player, allPlayers, onAnswer, quizCoverColor,
}: QuestionScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [showScorePop, setShowScorePop] = useState(false);

  // Start quiz music on mount
  useEffect(() => {
    soundEngine.startBgMusic('quiz');
    return () => {};
  }, []);

  const handleTimeout = useCallback(() => {
    if (!answered) {
      soundEngine.wrong();
      setAnswered(true); setShowResult(true);
      setTimeout(() => onAnswer(null, 0, false), 2500);
    }
  }, [answered, onAnswer]);

  useEffect(() => {
    setTimeRemaining(question.timeLimit);
    setSelectedAnswerId(null);
    setAnswered(false);
    setShowResult(false);
    setShowScorePop(false);
  }, [question]);

  useEffect(() => {
    if (answered) return;
    if (timeRemaining <= 0) { handleTimeout(); return; }
    if (timeRemaining <= 5) soundEngine.timerTick();
    if (timeRemaining <= 3) soundEngine.timerWarning();
    const timer = setTimeout(() => setTimeRemaining(t => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [timeRemaining, answered, handleTimeout]);

  const handleAnswer = (answerId: string) => {
    if (answered) return;
    soundEngine.click();
    setSelectedAnswerId(answerId);
    setAnswered(true);

    const answer = question.answers.find(a => a.id === answerId);
    const isCorrect = answer?.isCorrect ?? false;
    const timeMs = Date.now() - startTime;
    const streakMultiplier = getStreakMultiplier(player.streak);
    const basePoints = calculatePoints(question.points, question.timeLimit, timeMs / 1000, isCorrect);
    const totalPoints = Math.floor(basePoints * streakMultiplier);

    if (isCorrect) {
      soundEngine.correct();
      if (player.streak >= 4) soundEngine.combo(player.streak);
      if (player.streak >= 7) soundEngine.hype();
      setScoreEarned(totalPoints);
      setShowScorePop(true);
    } else {
      soundEngine.wrong();
    }

    setShowResult(true);
    setTimeout(() => onAnswer(answerId, totalPoints, isCorrect), 2500);
  };

  const timerPct = (timeRemaining / question.timeLimit) * 100;
  const timerColor = timerPct > 60 ? '#10b981' : timerPct > 30 ? '#f59e0b' : '#ef4444';
  const topPlayers = [...allPlayers].sort((a, b) => b.score - a.score).slice(0, 4);
  const myRank = [...allPlayers].sort((a, b) => b.score - a.score).findIndex(p => p.id === player.id) + 1;

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {/* Header */}
      <div className="bg-black/50 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-white/40 text-sm font-bold">Q{questionNumber}/{totalQuestions}</div>
          {/* Mini live ranks */}
          <div className="hidden sm:flex items-center gap-1">
            {topPlayers.slice(0,3).map((p,i) => (
              <div key={p.id} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${p.id===player.id?'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30':'bg-white/8 text-white/50'}`}>
                <span>{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                <span className="font-bold">{p.name.slice(0,6)}</span>
                <span className="text-white/40">{p.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-white font-black text-sm">{player.score.toLocaleString()}</div>
            <div className="text-white/35 text-xs">#{myRank}</div>
          </div>
          {player.streak >= 2 && (
            <div className="text-orange-400 font-black text-sm animate-pulse">🔥{player.streak}x</div>
          )}
          <MusicPlayer category="quiz" compact />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-0.5 px-3 py-1.5 bg-black/25">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
            i < questionNumber - 1 ? 'bg-purple-500' :
            i === questionNumber - 1 ? 'bg-yellow-400' : 'bg-white/10'
          }`} />
        ))}
      </div>

      {/* Timer */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="5" />
              <circle cx="28" cy="28" r="24" fill="none" stroke={timerColor} strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - timerPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-base">{Math.ceil(timeRemaining)}</span>
            </div>
          </div>
          <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-none"
              style={{ width: `${timerPct}%`, background: timerColor, transition: 'width 0.1s linear' }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        {/* Question card */}
        <div className={`rounded-3xl p-6 mb-5 text-center border-2 transition-all ${
          answered && !showResult ? 'border-white/15 bg-white/4' :
          showResult && selectedAnswerId && question.answers.find(a => a.id === selectedAnswerId)?.isCorrect
            ? 'border-green-400/60 bg-green-400/8' :
          showResult && !selectedAnswerId ? 'border-red-400/60 bg-red-400/8' :
          answered ? 'border-red-400/60 bg-red-400/8' :
          'border-white/15 bg-white/4'
        }`}
          style={quizCoverColor ? { borderColor: answered ? undefined : 'rgba(139,92,246,0.3)' } : {}}>
          {showScorePop && (
            <div className="text-green-400 font-black text-2xl animate-bounce mb-2">+{scoreEarned.toLocaleString()}</div>
          )}
          <p className="text-white text-2xl md:text-3xl font-black leading-tight">{question.text}</p>
          {question.imageUrl && (
            <img src={question.imageUrl} alt="Question" className="max-h-36 object-contain mx-auto mt-3 rounded-xl" />
          )}
        </div>

        {/* Answers grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {question.answers.map((answer, i) => {
            const COLORS = [
              { bg: '#E21B3C', hover: '#ff2d50', icon: '▲' },
              { bg: '#1368CE', hover: '#1a7de8', icon: '◆' },
              { bg: '#26890C', hover: '#2ea60f', icon: '●' },
              { bg: '#FFA602', hover: '#ffb733', icon: '■' },
            ];
            const col = COLORS[i % 4];
            const isSelected   = selectedAnswerId === answer.id;
            const isCorrectAns = answer.isCorrect;
            const dim = answered && !isSelected && !isCorrectAns;

            let bg = col.bg;
            let border = 'transparent';
            if (answered && isCorrectAns) { bg = '#10b981'; border = '#34d399'; }
            if (answered && isSelected && !isCorrectAns) { bg = '#6b7280'; border = '#9ca3af'; }

            return (
              <button key={answer.id}
                onClick={() => handleAnswer(answer.id)}
                disabled={answered}
                className={`relative rounded-2xl p-4 flex items-center gap-3 text-left transition-all font-bold text-white text-sm md:text-base active:scale-95 disabled:cursor-default ${
                  !answered ? 'hover:brightness-110 hover:scale-[1.02] shadow-lg' : ''
                } ${dim ? 'opacity-40' : ''}`}
                style={{ background: bg, border: `2px solid ${border}`, minHeight: '72px',
                  boxShadow: !answered ? `0 4px 20px ${col.bg}60` : isCorrectAns && answered ? '0 0 20px #10b98180' : undefined }}>
                <span className="text-2xl opacity-80 flex-shrink-0">{col.icon}</span>
                <span className="leading-tight">{answer.text}</span>
                {answered && isCorrectAns && (
                  <span className="ml-auto text-xl animate-bounce">✓</span>
                )}
                {answered && isSelected && !isCorrectAns && (
                  <span className="ml-auto text-xl">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Result message */}
        {showResult && (
          <div className="mt-4 text-center animate-fade-in">
            {selectedAnswerId && question.answers.find(a => a.id === selectedAnswerId)?.isCorrect ? (
              <div>
                <div className="text-green-400 font-black text-xl">✓ Correct! +{scoreEarned.toLocaleString()} pts</div>
                {player.streak >= 3 && <div className="text-orange-400 text-sm font-bold mt-1">🔥 {player.streak} streak! Keep going!</div>}
              </div>
            ) : (
              <div>
                <div className="text-red-400 font-black text-lg">✗ {selectedAnswerId ? 'Wrong!' : 'Time\'s up!'}</div>
                <div className="text-white/40 text-sm mt-1">
                  Answer: <span className="text-green-400 font-bold">
                    {question.answers.find(a => a.isCorrect)?.text}
                  </span>
                </div>
                <div className="text-blue-400 text-xs mt-1">💪 Next one is yours!</div>
              </div>
            )}
            {question.explanation && (
              <div className="mt-2 text-white/50 text-xs bg-white/5 rounded-xl px-4 py-2 max-w-sm mx-auto">{question.explanation}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
