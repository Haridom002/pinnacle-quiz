import { useState, useEffect } from 'react';
import { Quiz, Player } from '../types';
import { generateBotPlayers } from '../utils/gameUtils';
import { useAuth } from '../contexts/AuthContext';
import { getAvatar, CARTOON_AVATARS } from '../lib/avatars';
import AvatarPicker from '../auth/AvatarPicker';

interface LobbyProps {
  quiz: Quiz;
  gameCode: string;
  onStartGame: (player: Player, botPlayers: Player[]) => void;
  onBack: () => void;
}

export default function Lobby({ quiz, gameCode, onStartGame, onBack }: LobbyProps) {
  const { user } = useAuth();

  // Pre-fill from auth user
  const [playerName, setPlayerName] = useState(user?.full_name ?? '');
  const [avatarId, setAvatarId] = useState(user?.avatar_id ?? '0');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [botPlayers, setBotPlayers] = useState<Player[]>([]);
  const [nameError, setNameError] = useState('');
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waitingPlayers, setWaitingPlayers] = useState<{ name: string; avatarId: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedAvatar = getAvatar(avatarId);

  // Simulate players joining
  useEffect(() => {
    const bots = generateBotPlayers(5);
    setBotPlayers(bots);
    const delays = [1400, 2600, 3800, 5000, 6200];
    const timeouts = bots.slice(0, 5).map((bot, i) =>
      setTimeout(() => {
        const randomAvatarId = String(Math.floor(Math.random() * CARTOON_AVATARS.length));
        setWaitingPlayers(prev => [...prev, { name: bot.name, avatarId: randomAvatarId }]);
      }, delays[i])
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleJoin = () => {
    if (!playerName.trim()) { setNameError('Please enter your name'); return; }
    if (playerName.trim().length < 2) { setNameError('Name must be at least 2 characters'); return; }
    setNameError('');
    setJoined(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const myPlayer: Player = {
        id: user?.id ?? 'player-me',
        name: playerName.trim(),
        avatar: selectedAvatar.emoji,
        score: 0,
        streak: 0,
        answers: [],
      };
      onStartGame(myPlayer, botPlayers);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c !== null ? c - 1 : null), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const copyCode = () => {
    navigator.clipboard.writeText(gameCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPlayers = waitingPlayers.length + (joined ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {/* Countdown overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-50 bg-[#0d0d1a]/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 text-lg mb-4 font-semibold tracking-wider uppercase">Game starting in</p>
            <div className="text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-500 leading-none"
              style={{ animation: 'pulse 0.8s ease-in-out' }}>
              {countdown}
            </div>
            <div className="mt-6 flex items-center gap-3 justify-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedAvatar.bg} flex items-center justify-center text-3xl`}
                style={{ boxShadow: `0 0 20px ${selectedAvatar.glow}60` }}>
                {selectedAvatar.emoji}
              </div>
              <p className="text-white text-xl font-bold">{playerName} — Get ready!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-black/40 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm">🏔️</div>
            <span className="text-white font-bold text-sm">PinnacleQuiz</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        {/* Game PIN */}
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">Game PIN</p>
          <button onClick={copyCode}
            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-8 py-4 transition-all group">
            <span className="text-white font-black text-4xl tracking-[0.25em]">{gameCode}</span>
            <span className="text-white/40 group-hover:text-white/70 text-sm transition-colors">
              {copied ? '✓ Copied!' : '📋'}
            </span>
          </button>
          <p className="text-white/30 text-xs mt-2">Click to copy · Share with classmates at pinnacle.quiz</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Join form ── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2">
              <span>👤</span> Your Profile
            </h2>

            {/* Avatar display + change */}
            <div className="mb-5">
              <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-3">Avatar</label>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedAvatar.bg} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
                  style={{ boxShadow: `0 0 20px ${selectedAvatar.glow}50` }}>
                  {selectedAvatar.emoji}
                </div>
                <div>
                  <div className="text-white font-bold">{selectedAvatar.label}</div>
                  <button onClick={() => setShowAvatarPicker(s => !s)} disabled={joined}
                    className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors disabled:opacity-40">
                    {showAvatarPicker ? 'Close picker' : 'Change avatar →'}
                  </button>
                </div>
              </div>
              {showAvatarPicker && !joined && (
                <div className="mt-4 bg-black/30 rounded-2xl p-4 border border-white/10">
                  <AvatarPicker selectedId={avatarId} onChange={id => { setAvatarId(id); setShowAvatarPicker(false); }} size="sm" />
                </div>
              )}
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Display Name</label>
              <input type="text" value={playerName}
                onChange={e => { setPlayerName(e.target.value); setNameError(''); }}
                placeholder="Enter your name..."
                maxLength={20}
                disabled={joined}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all disabled:opacity-50"
              />
              {nameError && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {nameError}</p>}
            </div>

            {/* Quiz info card */}
            <div className={`bg-gradient-to-r ${quiz.coverColor} rounded-xl p-3.5 mb-5 flex items-center gap-3 shadow-lg`}>
              <span className="text-3xl">{quiz.icon}</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{quiz.title}</p>
                <p className="text-white/70 text-xs">{quiz.questions.length} questions · {quiz.grade}</p>
              </div>
            </div>

            <button onClick={handleJoin} disabled={joined}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {joined ? '🚀 Starting game...' : '🚀 Join & Play!'}
            </button>
          </div>

          {/* ── Players waiting ── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl flex items-center gap-2">
                <span>👥</span> Lobby
              </h2>
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-bold">LIVE</span>
              </div>
            </div>

            {/* Joined player */}
            {joined && (
              <div className="flex items-center gap-3 bg-purple-500/20 border border-purple-400/30 rounded-xl px-3 py-2.5 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${selectedAvatar.bg} flex items-center justify-center text-xl`}>
                  {selectedAvatar.emoji}
                </div>
                <span className="text-white font-bold text-sm">{playerName}</span>
                <span className="ml-auto text-purple-400 text-xs font-bold">YOU ✓</span>
              </div>
            )}

            <div className="space-y-2">
              {waitingPlayers.map((p, i) => {
                const av = getAvatar(p.avatarId);
                return (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 animate-fade-in">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                      {av.emoji}
                    </div>
                    <span className="text-white font-semibold text-sm">{p.name}</span>
                    <span className="ml-auto text-white/30 text-xs">just joined</span>
                  </div>
                );
              })}
              {waitingPlayers.length === 0 && !joined && (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3 animate-bounce">👀</div>
                  <p className="text-white/30 text-sm">Waiting for players to join...</p>
                </div>
              )}
            </div>

            {/* Player count */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">{totalPlayers} / 6 players</span>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-md transition-all ${
                      i < totalPlayers ? 'bg-purple-500' : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
