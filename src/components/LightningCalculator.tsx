import { useState, useEffect, useCallback, useRef } from 'react';
import { MathOperation, DifficultyLevel, MathQuestion } from '../types';
import { generateMathQuestion, calculateSpeedBonus, getComboMultiplier, calculateXP, getLevelFromXP, getXPForNextLevel } from '../utils/mathEngine';
import { soundEngine } from '../utils/soundEngine';
import SoundControl from './SoundControl';
import ParticleExplosion from './ParticleExplosion';

interface Props {
  onBack: () => void;
}

type Phase = 'setup' | 'playing' | 'gameover';

const LIVES_MAX = 3;
const POWER_UPS = [
  { id: 'double', icon: '💎', name: '2x Points', uses: 1 },
  { id: 'shield', icon: '🛡️', name: 'Shield', uses: 1 },
  { id: 'freeze', icon: '❄️', name: 'Time Freeze', uses: 1 },
];

export default function LightningCalculator({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [operation, setOperation] = useState<MathOperation>('multiply');
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(LIVES_MAX);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showParticle, setShowParticle] = useState(false);
  const [scorePopup, setScorePopup] = useState<string | null>(null);
  const [powerUps, setPowerUps] = useState(POWER_UPS.map(p => ({ ...p })));
  const [activePU, setActivePU] = useState<string | null>(null);
  const [questionKey, setQuestionKey] = useState(0);
  const [dailyStreak] = useState(7);
  const [bestCombo, setBestCombo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frozenRef = useRef(false);

  const level = getLevelFromXP(xp);
  const xpForNext = getXPForNextLevel(level);
  const xpProgress = (xp % (xpForNext - getXPForNextLevel(level - 1))) / (xpForNext - getXPForNextLevel(level - 1));
  const multiplier = getComboMultiplier(combo);

  const nextQuestion = useCallback(() => {
    const q = generateMathQuestion(operation, difficulty);
    setQuestion(q);
    setTimeLeft(q.timeLimit);
    setUserInput('');
    setFeedback(null);
    setQuestionKey(k => k + 1);
    frozenRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [operation, difficulty]);

  const handleTimeout = useCallback(() => {
    if (activePU === 'shield') {
      setActivePU(null);
      soundEngine.click();
      nextQuestion();
      return;
    }
    soundEngine.wrong();
    setFeedback('wrong');
    setCombo(0);
    setTotal(t => t + 1);
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      soundEngine.stopBgMusic();
      setTimeout(() => setPhase('gameover'), 800);
    } else {
      setTimeout(nextQuestion, 1000);
    }
  }, [lives, activePU, nextQuestion]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || feedback) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    if (frozenRef.current) return;
    if (timeLeft <= 3) soundEngine.timerWarning();
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, phase, feedback, handleTimeout]);

  const handleSubmit = useCallback(() => {
    if (!question || feedback) return;
    const val = parseInt(userInput.trim(), 10);
    if (isNaN(val)) return;

    const isCorrect = val === question.answer;
    const timeTaken = question.timeLimit - timeLeft;
    const speedBonus = calculateSpeedBonus(question.timeLimit, timeTaken);
    const basePoints = isCorrect ? question.points + speedBonus : 0;
    const multipliedPoints = isCorrect ? Math.floor(basePoints * multiplier * (activePU === 'double' ? 2 : 1)) : 0;
    const earnedXP = calculateXP(multipliedPoints, combo, isCorrect);

    setTotal(t => t + 1);

    if (isCorrect) {
      soundEngine.correct();
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo(b => Math.max(b, newCombo));
      if (newCombo >= 2) soundEngine.combo(newCombo);
      if (newCombo >= 5) { soundEngine.hype(); setShowParticle(true); }
      setCorrect(c => c + 1);
      setScore(s => s + multipliedPoints);
      setXp(x => x + earnedXP);
      setFeedback('correct');
      setScorePopup(`+${multipliedPoints.toLocaleString()}`);
      if (activePU === 'double') setActivePU(null);
      setTimeout(() => { setShowParticle(false); setScorePopup(null); nextQuestion(); }, 700);
    } else {
      soundEngine.wrong();
      setCombo(0);
      setFeedback('wrong');
      setScorePopup(`✗ ${question.answer}`);
      if (activePU === 'shield') {
        setActivePU(null);
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          soundEngine.stopBgMusic();
          setTimeout(() => setPhase('gameover'), 800);
          return;
        }
      }
      setTimeout(() => { setScorePopup(null); nextQuestion(); }, 1000);
    }
  }, [question, userInput, timeLeft, feedback, combo, multiplier, activePU, lives, nextQuestion]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const usePowerUp = (id: string) => {
    const pu = powerUps.find(p => p.id === id);
    if (!pu || pu.uses <= 0) return;
    soundEngine.click();
    setActivePU(id);
    setPowerUps(prev => prev.map(p => p.id === id ? { ...p, uses: p.uses - 1 } : p));
    if (id === 'freeze') {
      frozenRef.current = true;
      setTimeout(() => { frozenRef.current = false; }, 5000);
    }
  };

  const startGame = () => {
    setScore(0); setCombo(0); setLives(LIVES_MAX);
    setCorrect(0); setTotal(0); setFeedback(null);
    setPowerUps(POWER_UPS.map(p => ({ ...p })));
    setActivePU(null);
    setPhase('playing');
    soundEngine.startBgMusic('lightning');
    setTimeout(nextQuestion, 100);
  };

  const numpadKeys = ['7','8','9','4','5','6','1','2','3','0','-','⌫'];

  const handleNumpad = (k: string) => {
    if (k === '⌫') setUserInput(i => i.slice(0, -1));
    else if (k === '-') setUserInput(i => i.startsWith('-') ? i.slice(1) : '-' + i);
    else setUserInput(i => i.length < 6 ? i + k : i);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: `${4+Math.random()*8}px`, height: `${4+Math.random()*8}px`,
                left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                background: ['#f59e0b','#8b5cf6','#06b6d4','#ef4444'][i%4],
                animationDelay: `${Math.random()*3}s`, animationDuration: `${2+Math.random()*3}s`
              }}
            />
          ))}
        </div>

        <div className="w-full max-w-lg relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="text-white/60 hover:text-white flex items-center gap-2 transition-colors">
              ← Back
            </button>
            <SoundControl />
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl mb-3">⚡</div>
            <h1 className="text-4xl font-black text-white mb-2" style={{textShadow:'0 0 30px #f59e0b'}}>
              Lightning Calculator
            </h1>
            <p className="text-yellow-400/80">Mental math at the speed of light</p>
          </div>

          {/* Daily streak */}
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="text-white font-bold">{dailyStreak} Day Streak!</div>
              <div className="text-orange-300 text-sm">Keep it going — play today!</div>
            </div>
            <div className="ml-auto text-2xl font-black text-orange-400">+{dailyStreak * 50} XP</div>
          </div>

          {/* Operation select */}
          <div className="mb-6">
            <label className="text-white/70 text-sm font-semibold mb-3 block">OPERATION</label>
            <div className="grid grid-cols-5 gap-2">
              {(['multiply','add','subtract','divide','mixed'] as MathOperation[]).map(op => (
                <button key={op}
                  onClick={() => { setOperation(op); soundEngine.click(); }}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    operation === op
                      ? 'bg-yellow-500 text-black scale-105 shadow-lg shadow-yellow-500/40'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {op === 'multiply' ? '×' : op === 'add' ? '+' : op === 'subtract' ? '−' : op === 'divide' ? '÷' : '∞'}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="text-white/70 text-sm font-semibold mb-3 block">DIFFICULTY</label>
            <div className="grid grid-cols-2 gap-3">
              {([['beginner','🟢 Beginner','easy warm-up'],['intermediate','🔵 Intermediate','solid challenge'],['advanced','🟡 Advanced','push your limits'],['genius','🔴 Genius','for legends only']] as [DifficultyLevel,string,string][]).map(([d,label,sub]) => (
                <button key={d}
                  onClick={() => { setDifficulty(d); soundEngine.click(); }}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${
                    difficulty === d
                      ? 'border-yellow-400 bg-yellow-400/10 scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="font-bold text-white text-sm">{label}</div>
                  <div className="text-white/50 text-xs mt-1">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame}
            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-yellow-500/40"
            style={{textShadow:'none'}}
          >
            ⚡ START LIGHTNING MODE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade = accuracy >= 90 ? 'S+' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 50 ? 'C' : 'D';
    soundEngine.victory();
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-8xl mb-4 animate-bounce">{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}</div>
          <h2 className="text-5xl font-black text-white mb-2">GAME OVER</h2>
          <div className="text-yellow-400 text-2xl font-bold mb-8">Grade: {grade}</div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              ['Score', score.toLocaleString(), '🎯'],
              ['XP Earned', xp.toLocaleString(), '⭐'],
              ['Accuracy', `${accuracy}%`, '🎲'],
              ['Best Combo', `x${bestCombo}`, '🔥'],
              ['Correct', `${correct}/${total}`, '✅'],
              ['Level', level, '🏅'],
            ].map(([k, v, icon]) => (
              <div key={String(k)} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-black text-white">{v}</div>
                <div className="text-white/50 text-xs">{k}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={startGame}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-2xl hover:scale-[1.02] transition-all"
            >
              ⚡ Play Again
            </button>
            <button onClick={onBack}
              className="flex-1 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  const timerPct = question ? (timeLeft / question.timeLimit) * 100 : 100;
  const timerColor = timerPct > 60 ? '#10b981' : timerPct > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col select-none">
      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <ParticleExplosion active={showParticle} x={50} y={40} count={40}
          colors={['#f59e0b','#fbbf24','#fcd34d','#fff']}
          onComplete={() => setShowParticle(false)}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
        <button onClick={() => { soundEngine.stopBgMusic(); onBack(); }}
          className="text-white/60 hover:text-white text-sm transition-colors">
          ✕ Exit
        </button>

        <div className="flex items-center gap-3">
          {/* Lives */}
          <div className="flex gap-1">
            {Array.from({length: LIVES_MAX}).map((_, i) => (
              <span key={i} className={`text-xl transition-all ${i < lives ? 'scale-100' : 'scale-75 opacity-30'}`}>
                ❤️
              </span>
            ))}
          </div>
          {/* Level */}
          <div className="bg-purple-500/20 border border-purple-400/30 rounded-full px-3 py-1 text-purple-300 text-sm font-bold">
            Lv.{level}
          </div>
        </div>

        <SoundControl />
      </div>

      {/* Score/XP bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-2xl font-black text-white">{score.toLocaleString()}</div>
            <div className="text-white/40 text-xs">SCORE</div>
          </div>
          <div className="text-center">
            {combo >= 2 && (
              <div className="text-yellow-400 font-black text-lg animate-pulse">
                🔥 {combo}x COMBO
              </div>
            )}
            <div className="text-white/40 text-xs">{Math.round((multiplier - 1) * 100)}% bonus</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70">{correct}/{total} correct</div>
            <div className="text-xs text-white/40">{total > 0 ? Math.round(correct/total*100) : 0}% accuracy</div>
          </div>
        </div>
        {/* XP bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-yellow-400/70">XP</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
              style={{ width: `${Math.min(xpProgress * 100, 100)}%` }} />
          </div>
          <span className="text-xs text-white/40">{xp}</span>
        </div>
      </div>

      {/* Power-ups */}
      <div className="flex gap-2 px-4 py-2 border-b border-white/5">
        {powerUps.map(pu => (
          <button key={pu.id}
            onClick={() => usePowerUp(pu.id)}
            disabled={pu.uses <= 0 || activePU === pu.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activePU === pu.id ? 'bg-blue-500/30 border-blue-400 text-blue-300 animate-pulse' :
              pu.uses > 0 ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' :
              'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span>{pu.icon}</span>
            <span>{pu.name}</span>
            {pu.uses > 0 && <span className="bg-white/20 rounded-full w-4 h-4 flex items-center justify-center">{pu.uses}</span>}
          </button>
        ))}
        {activePU === 'freeze' && (
          <div className="ml-auto text-cyan-400 text-xs font-bold animate-pulse flex items-center gap-1">
            ❄️ FROZEN
          </div>
        )}
      </div>

      {/* Main question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {question && (
          <div key={questionKey} className="w-full max-w-md">
            {/* Timer ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="36" fill="none" stroke={timerColor} strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - timerPct / 100)}`}
                    style={{transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s'}}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{Math.ceil(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className={`text-center mb-6 rounded-3xl p-8 border-2 transition-all relative overflow-hidden ${
              feedback === 'correct' ? 'border-green-400 bg-green-400/10' :
              feedback === 'wrong' ? 'border-red-400 bg-red-400/10' :
              'border-white/20 bg-white/5'
            }`}>
              <div className="text-5xl md:text-7xl font-black text-white mb-2"
                style={{textShadow: feedback === 'correct' ? '0 0 30px #10b981' : feedback === 'wrong' ? '0 0 30px #ef4444' : '0 0 20px rgba(255,255,255,0.3)'}}>
                {question.question} = ?
              </div>
              {scorePopup && (
                <div className={`absolute top-2 right-4 text-2xl font-black animate-bounce ${
                  feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {scorePopup}
                </div>
              )}
              {feedback && (
                <div className={`text-2xl font-bold mt-2 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                  {feedback === 'correct' ? '✓ CORRECT!' : `✗ Answer: ${question.answer}`}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-white/10 border-2 border-white/20 rounded-2xl px-4 py-3 mb-3 focus-within:border-yellow-400 transition-colors">
                <input
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your answer..."
                  className="flex-1 bg-transparent text-white text-2xl font-black outline-none placeholder-white/30"
                  disabled={!!feedback}
                />
                <button onClick={handleSubmit}
                  disabled={!!feedback || !userInput}
                  className="bg-yellow-500 text-black font-black px-4 py-2 rounded-xl disabled:opacity-30 hover:bg-yellow-400 active:scale-95 transition-all">
                  GO!
                </button>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-4 gap-2">
                {numpadKeys.map(k => (
                  <button key={k}
                    onClick={() => { soundEngine.click(); handleNumpad(k); }}
                    disabled={!!feedback}
                    className={`py-4 rounded-xl font-black text-xl transition-all active:scale-95 disabled:opacity-30 ${
                      k === '⌫' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' :
                      k === '-' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' :
                      'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
