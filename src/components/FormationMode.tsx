import { useState, useEffect, useCallback, useRef } from 'react';
import { MathOperation, DifficultyLevel, MathQuestion, TrainingCategory } from '../types';
import { generateMathQuestion, adaptDifficulty, getComboMultiplier, calculateXP, getLevelFromXP } from '../utils/mathEngine';
import { soundEngine } from '../utils/soundEngine';
import SoundControl from './SoundControl';

interface Props { onBack: () => void; }

type Phase = 'setup' | 'playing' | 'results';

const CATEGORIES: { id: TrainingCategory; icon: string; op: MathOperation; color: string }[] = [
  { id: 'Multiplication Tables Sprint', icon: '×', op: 'multiply', color: '#8b5cf6' },
  { id: 'Addition Rush',                icon: '+', op: 'add',      color: '#10b981' },
  { id: 'Division Challenge',           icon: '÷', op: 'divide',   color: '#f59e0b' },
  { id: 'Subtraction Blitz',            icon: '−', op: 'subtract', color: '#ef4444' },
  { id: 'Mixed Operations Storm',       icon: '∞', op: 'mixed',    color: '#06b6d4' },
];

const DURATIONS = [30, 60, 120, 300]; // seconds

interface SessionData {
  questions: MathQuestion[];
  userAnswers: (number | null)[];
  times: number[];
  correct: number;
  total: number;
  xp: number;
  combo: number;
  bestCombo: number;
  score: number;
}

export default function FormationMode({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [category, setCategory] = useState<typeof CATEGORIES[0]>(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [duration, setDuration] = useState(60);
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [session, setSession] = useState<SessionData>({
    questions: [], userAnswers: [], times: [],
    correct: 0, total: 0, xp: 0, combo: 0, bestCombo: 0, score: 0
  });
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [speedMeter, setSpeedMeter] = useState(0); // questions per minute
  const [currentDiff, setCurrentDiff] = useState<DifficultyLevel>('intermediate');
  const [diffAdapted, setDiffAdapted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qTimerRef = useRef<NodeJS.Timeout | null>(null);
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef(0);
  const recentCorrect = useRef<boolean[]>([]);

  const level = getLevelFromXP(session.xp);

  const nextQuestion = useCallback((diff: DifficultyLevel = currentDiff) => {
    const q = generateMathQuestion(category.op, diff);
    setQuestion(q);
    setUserInput('');
    setFeedback(null);
    questionStartRef.current = Date.now();
    setQuestionTime(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [category.op, currentDiff]);

  const handleAnswer = useCallback(() => {
    if (!question || feedback) return;
    const val = parseInt(userInput.trim(), 10);
    if (isNaN(val)) return;

    const isCorrect = val === question.answer;
    const timeTaken = (Date.now() - questionStartRef.current) / 1000;
    recentCorrect.current.push(isCorrect);
    if (recentCorrect.current.length > 10) recentCorrect.current.shift();

    const recentAcc = recentCorrect.current.filter(Boolean).length / recentCorrect.current.length;

    setSession(s => {
      const newCombo = isCorrect ? s.combo + 1 : 0;
      const mult = getComboMultiplier(newCombo);
      const pts = isCorrect ? Math.floor(question.points * mult) : 0;
      const earnedXP = calculateXP(pts, newCombo, isCorrect);
      const newBestCombo = Math.max(s.bestCombo, newCombo);
      const newTotal = s.total + 1;
      const newCorrect = s.correct + (isCorrect ? 1 : 0);

      // Speed tracking
      const elapsed = duration - timeLeft;
      const qpm = elapsed > 0 ? (newTotal / elapsed) * 60 : 0;
      setSpeedMeter(Math.round(qpm));

      // Detect weak areas
      if (!isCorrect) {
        const area = category.id;
        setWeakAreas(prev => prev.includes(area) ? prev : [...prev, area]);
      }

      return {
        ...s,
        questions: [...s.questions, question],
        userAnswers: [...s.userAnswers, val],
        times: [...s.times, timeTaken],
        correct: newCorrect,
        total: newTotal,
        combo: newCombo,
        bestCombo: newBestCombo,
        score: s.score + pts,
        xp: s.xp + earnedXP,
      };
    });

    if (isCorrect) {
      soundEngine.correct();
      setFeedback('correct');
    } else {
      soundEngine.wrong();
      setFeedback('wrong');
    }

    // Adapt difficulty
    if (recentCorrect.current.length >= 5) {
      const newDiff = adaptDifficulty(currentDiff, recentAcc);
      if (newDiff !== currentDiff) {
        setCurrentDiff(newDiff);
        setDiffAdapted(true);
        setTimeout(() => setDiffAdapted(false), 2000);
        nextQuestion(newDiff);
        return;
      }
    }

    setTimeout(() => nextQuestion(), 400);
  }, [question, userInput, feedback, currentDiff, duration, timeLeft, nextQuestion, category.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnswer();
  };

  // Global timer
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      soundEngine.stopBgMusic();
      setPhase('results');
      return;
    }
    if (timeLeft <= 5) soundEngine.timerWarning();
    globalTimerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (globalTimerRef.current) clearTimeout(globalTimerRef.current); };
  }, [timeLeft, phase]);

  // Question reaction timer
  useEffect(() => {
    if (phase !== 'playing' || feedback) return;
    if (qTimerRef.current) clearTimeout(qTimerRef.current);
    const timer = setInterval(() => setQuestionTime(t => t + 0.1), 100);
    qTimerRef.current = timer as any;
    return () => clearInterval(timer);
  }, [phase, feedback, question]);

  const startGame = () => {
    setCurrentDiff(difficulty);
    setSession({ questions: [], userAnswers: [], times: [], correct: 0, total: 0, xp: 0, combo: 0, bestCombo: 0, score: 0 });
    setWeakAreas([]);
    setSpeedMeter(0);
    recentCorrect.current = [];
    setTimeLeft(duration);
    setPhase('playing');
    soundEngine.startBgMusic('formation');
    setTimeout(() => nextQuestion(difficulty), 100);
  };

  const numpadKeys = ['7','8','9','4','5','6','1','2','3','0','-','⌫'];
  const handleNumpad = (k: string) => {
    if (k === '⌫') setUserInput(i => i.slice(0, -1));
    else if (k === '-') setUserInput(i => i.startsWith('-') ? i.slice(1) : '-' + i);
    else setUserInput(i => i.length < 6 ? i + k : i);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">← Back</button>
            <SoundControl />
          </div>

          <div className="text-center mb-8">
            <div className="text-5xl mb-2">🧠</div>
            <h1 className="text-3xl font-black text-white mb-1">Calculator Formation</h1>
            <p className="text-cyan-400/80">Rapid-fire mental arithmetic training</p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="text-white/60 text-xs font-bold tracking-wider mb-3 block">TRAINING CATEGORY</label>
            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  onClick={() => { setCategory(cat); soundEngine.click(); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    category.id === cat.id
                      ? 'border-opacity-100 scale-[1.01]'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                  style={category.id === cat.id ? {
                    borderColor: cat.color,
                    background: `${cat.color}20`,
                  } : {}}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl font-black"
                    style={{ background: cat.color + '30', color: cat.color }}>
                    {cat.icon}
                  </div>
                  <span className="text-white font-semibold">{cat.id}</span>
                  {category.id === cat.id && <span className="ml-auto text-xs font-bold" style={{color: cat.color}}>✓ Selected</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="text-white/60 text-xs font-bold tracking-wider mb-3 block">DIFFICULTY</label>
            <div className="grid grid-cols-4 gap-2">
              {(['beginner','intermediate','advanced','genius'] as DifficultyLevel[]).map(d => (
                <button key={d}
                  onClick={() => { setDifficulty(d); soundEngine.click(); }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                    difficulty === d
                      ? 'bg-cyan-500 border-cyan-400 text-black'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  {d === 'genius' ? '🔥 Genius' : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-8">
            <label className="text-white/60 text-xs font-bold tracking-wider mb-3 block">SESSION DURATION</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map(d => (
                <button key={d}
                  onClick={() => { setDuration(d); soundEngine.click(); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    duration === d
                      ? 'bg-cyan-500 border-cyan-400 text-black'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  {d < 60 ? `${d}s` : `${d/60}m`}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame}
            className="w-full py-5 font-black text-xl rounded-2xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            style={{ background: `linear-gradient(135deg, ${category.color}, #1e1b4b)` }}>
            🧠 START FORMATION TRAINING
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
    const avgTime = session.times.length > 0 ? (session.times.reduce((a,b)=>a+b,0)/session.times.length).toFixed(1) : '0';
    soundEngine.victory();
    return (
      <div className="min-h-screen bg-[#0d0d1a] px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{accuracy >= 85 ? '🏆' : accuracy >= 70 ? '⭐' : '💪'}</div>
            <h2 className="text-4xl font-black text-white">Session Complete!</h2>
            <p className="text-cyan-400 mt-1">{category.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              ['Score', session.score.toLocaleString(), '🎯'],
              ['XP', session.xp.toLocaleString(), '⭐'],
              ['Accuracy', `${accuracy}%`, '🎲'],
              ['Best Combo', `x${session.bestCombo}`, '🔥'],
              ['Speed', `${speedMeter} q/min`, '⚡'],
              ['Avg Time', `${avgTime}s`, '⏱️'],
            ].map(([k,v,icon]) => (
              <div key={String(k)} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xl font-black text-white">{v}</div>
                <div className="text-white/40 text-xs">{k}</div>
              </div>
            ))}
          </div>

          {weakAreas.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-6">
              <div className="text-orange-400 font-bold text-sm mb-2">🎯 AI Recommendation</div>
              <p className="text-white/70 text-sm">Focus more practice on: <span className="text-orange-300 font-semibold">{weakAreas.join(', ')}</span></p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={startGame}
              className="flex-1 py-4 font-black rounded-2xl text-white"
              style={{ background: `linear-gradient(135deg, ${category.color}, #1e1b4b)` }}>
              🔄 Try Again
            </button>
            <button onClick={onBack}
              className="flex-1 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20">
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => { soundEngine.stopBgMusic(); onBack(); }}
          className="text-white/50 hover:text-white text-sm">✕</button>

        <div className="flex items-center gap-4">
          {/* Global timer */}
          <div className={`text-2xl font-black px-3 py-1 rounded-xl ${
            timeLeft <= 10 ? 'text-red-400 bg-red-400/20 animate-pulse' : 'text-white bg-white/10'
          }`}>
            {timeLeft}s
          </div>

          {/* Speed meter */}
          <div className="hidden sm:flex items-center gap-2 bg-purple-500/20 rounded-xl px-3 py-1">
            <span className="text-purple-400 text-xs font-bold">⚡ SPEED</span>
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full transition-all"
                style={{ width: `${Math.min(speedMeter / 60 * 100, 100)}%` }}/>
            </div>
            <span className="text-purple-300 text-xs">{speedMeter}/min</span>
          </div>
        </div>

        <SoundControl />
      </div>

      {/* Stats row */}
      <div className="flex gap-3 px-4 py-2 border-b border-white/5 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-green-400 font-bold">{session.correct}</span>
          <span className="text-white/40">correct</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/70 font-bold">{session.total}</span>
          <span className="text-white/40">total</span>
        </div>
        {session.combo >= 2 && (
          <div className="ml-auto flex items-center gap-1 text-yellow-400 font-bold animate-pulse">
            🔥 {session.combo}x
          </div>
        )}
        {diffAdapted && (
          <div className="text-cyan-400 text-xs font-bold animate-bounce">
            AI: Difficulty Adjusted!
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 text-purple-400 text-xs">
          Lv.{level}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {question && (
          <div className="w-full max-w-md">
            {/* Reaction timer bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
              <div className="h-full rounded-full transition-none"
                style={{
                  width: `${Math.max(0, (1 - questionTime / question.timeLimit) * 100)}%`,
                  background: questionTime < question.timeLimit * 0.5 ? '#10b981' : questionTime < question.timeLimit * 0.8 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            <div className={`text-center p-8 rounded-3xl border-2 mb-6 transition-all ${
              feedback === 'correct' ? 'border-green-400 bg-green-400/10' :
              feedback === 'wrong' ? 'border-red-400 bg-red-400/10' :
              'border-white/20 bg-white/5'
            }`}>
              <div className="text-5xl md:text-6xl font-black text-white">
                {question.question} = ?
              </div>
              {feedback && (
                <div className={`mt-3 text-xl font-bold ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                  {feedback === 'correct' ? '⚡ FAST!' : `Answer: ${question.answer}`}
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <input ref={inputRef} type="number" value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="= ?"
                disabled={!!feedback}
                className="flex-1 bg-white/10 border-2 border-white/20 text-white text-2xl font-black rounded-2xl px-4 py-3 outline-none focus:border-cyan-400 transition-colors placeholder-white/20"
              />
              <button onClick={handleAnswer} disabled={!!feedback || !userInput}
                className="px-6 py-3 font-black text-black rounded-2xl disabled:opacity-30 active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}aa)` }}>
                ✓
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {numpadKeys.map(k => (
                <button key={k} onClick={() => { soundEngine.click(); handleNumpad(k); }}
                  disabled={!!feedback}
                  className={`py-4 rounded-xl font-black text-xl transition-all active:scale-95 disabled:opacity-30 ${
                    k === '⌫' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    k === '-' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  }`}
                >{k}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
