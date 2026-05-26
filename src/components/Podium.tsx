import { useEffect } from 'react';
import { Player, Quiz } from '../types';
import { getScoreGrade } from '../utils/gameUtils';
import { soundEngine } from '../utils/soundEngine';
import MusicPlayer from './MusicPlayer';
import ParticleExplosion from './ParticleExplosion';

interface PodiumProps {
  players: Player[];
  currentPlayer: Player;
  quiz: Quiz;
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function Podium({ players, currentPlayer, quiz, onPlayAgain, onHome }: PodiumProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(p => p.id === currentPlayer.id) + 1;
  const gradeObj = getScoreGrade(currentPlayer.score, quiz.questions.reduce((s, q) => s + q.points, 0));
  const podiumOrder = [sorted[1], sorted[0], sorted[2]].filter(Boolean);

  useEffect(() => {
    soundEngine.startBgMusic('victory');
    soundEngine.victory();
    setTimeout(() => soundEngine.crowd(), 500);
  }, []);

  const encouragements: Record<number, string> = {
    1: '🏆 Math Champion! Absolutely incredible!',
    2: '🥈 So close! Brilliant performance!',
    3: '🥉 Top 3! Outstanding effort!',
  };
  const msg = encouragements[myRank] ?? (myRank <= 5 ? '⭐ Great job! Keep pushing to the top!' : '💪 Amazing try! Next round you\'ll dominate!');

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col overflow-hidden relative">
      <ParticleExplosion active count={80} colors={['#ffd700','#f59e0b','#fff','#a855f7','#10b981']} />

      {/* Header */}
      <div className="relative z-10 bg-black/50 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-white font-black">🏆 Final Results</div>
          <div className="text-white/40 text-xs">{quiz.title}</div>
        </div>
        <MusicPlayer category="victory" compact />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-6 max-w-lg mx-auto w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2 animate-bounce">🎉</div>
          <h2 className="text-3xl font-black text-white">Game Over!</h2>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 mb-7 w-full max-w-xs">
          {podiumOrder.map((p, i) => {
            if (!p) return <div key={i} className="flex-1" />;
            const heights = ['h-20','h-32','h-16'];
            const labels = ['🥈 2nd','🥇 1st','🥉 3rd'];
            const bgs = [
              'linear-gradient(to top,#374151,#6b7280)',
              'linear-gradient(to top,#92400e,#d97706)',
              'linear-gradient(to top,#7c2d12,#c2410c)',
            ];
            const isMe = p.id === currentPlayer.id;
            return (
              <div key={p.id} className="flex-1 flex flex-col items-center">
                <div className={`text-3xl mb-1 ${isMe ? 'animate-bounce' : ''}`}>{p.avatar}</div>
                <div className="text-white text-xs font-bold text-center truncate w-full px-1 mb-1">{p.name}</div>
                <div className={`w-full ${heights[i]} rounded-t-2xl flex flex-col items-center justify-end pb-2 border-t-2`}
                  style={{ background: bgs[i], borderColor: i===1?'#ffd700':i===0?'#c0c0c0':'#cd7f32' }}>
                  <div className="text-white/70 text-xs font-bold">{labels[i]}</div>
                  <div className="text-white font-black text-sm">{p.score.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My result */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-3xl font-black" style={{color:myRank===1?'#ffd700':myRank===2?'#c0c0c0':'#ffffff'}}>{myRank===1?'🥇':myRank===2?'🥈':myRank===3?'🥉':`#${myRank}`}</div>
              <div className="text-white/40 text-xs">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{currentPlayer.score.toLocaleString()}</div>
              <div className="text-white/40 text-xs">Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-black ${gradeObj.color}`}>{gradeObj.grade}</div>
              <div className="text-white/40 text-xs">Grade</div>
            </div>
          </div>
          <div className="text-center text-sm font-semibold"
            style={{color:myRank===1?'#ffd700':myRank<=3?'#c0c0c0':'#a78bfa'}}>
            {msg}
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={onPlayAgain}
            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
            🔄 Play Again
          </button>
          <button onClick={onHome}
            className="flex-1 py-4 bg-white/8 border border-white/12 text-white font-bold rounded-2xl hover:bg-white/14 transition-all">
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
