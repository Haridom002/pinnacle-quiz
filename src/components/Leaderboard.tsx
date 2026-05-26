import { useEffect } from 'react';
import { Player } from '../types';
import { getRankEmoji } from '../utils/gameUtils';
import { soundEngine } from '../utils/soundEngine';
import MusicPlayer from './MusicPlayer';

interface LeaderboardProps {
  players: Player[];
  currentPlayer: Player;
  questionNumber: number;
  totalQuestions: number;
  onContinue: () => void;
  isLastQuestion: boolean;
}

export default function Leaderboard({ players, currentPlayer, questionNumber, totalQuestions, onContinue, isLastQuestion }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(p => p.id === currentPlayer.id) + 1;

  useEffect(() => {
    soundEngine.leaderboardReveal();
    if (questionNumber >= totalQuestions) soundEngine.startBgMusic('suspense');
    const timer = setTimeout(onContinue, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {/* Header */}
      <div className="bg-black/50 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-white font-black text-base">🏆 Leaderboard</div>
          <div className="text-white/40 text-xs">After Question {questionNumber}/{totalQuestions}</div>
        </div>
        <MusicPlayer category="quiz" compact />
      </div>

      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {/* My rank card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-700/20 border border-purple-400/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getRankEmoji(myRank)}</div>
            <div>
              <div className="text-white font-black text-xl">#{myRank} — {currentPlayer.name}</div>
              <div className="text-purple-300 text-sm">{currentPlayer.score.toLocaleString()} pts · 🔥{currentPlayer.streak} streak</div>
            </div>
          </div>
        </div>

        {/* Player list */}
        <div className="space-y-2 mb-5">
          {sorted.map((p, i) => {
            const isMe = p.id === currentPlayer.id;
            return (
              <div key={p.id}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                  isMe ? 'border-yellow-400/40 bg-yellow-400/8' : 'border-white/8 bg-white/3'
                }`}
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-8 text-center font-black text-sm flex-shrink-0"
                  style={{ color: i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'rgba(255,255,255,0.4)' }}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </div>
                <div className="text-2xl">{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm flex items-center gap-1.5">
                    {p.name}{isMe && <span className="text-yellow-400 text-xs">(you)</span>}
                    {p.streak >= 3 && <span className="text-orange-400 text-xs">🔥{p.streak}x</span>}
                  </div>
                </div>
                <div className="text-white font-black text-sm">{p.score.toLocaleString()}</div>
              </div>
            );
          })}
        </div>

        {/* Auto-continue */}
        <div className="text-center">
          <div className="text-white/30 text-sm mb-3 animate-pulse">
            {isLastQuestion ? '🏆 Final results coming...' : '⏩ Next question in 5 seconds...'}
          </div>
          <button onClick={onContinue}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
            {isLastQuestion ? '🏆 See Final Results' : '→ Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
