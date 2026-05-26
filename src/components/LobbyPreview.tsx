import { useState, useEffect } from 'react';
import { Quiz, Player } from '../types';
import { generateBotPlayers } from '../utils/gameUtils';
import { getAvatar, CARTOON_AVATARS } from '../lib/avatars';
import AvatarPicker from '../auth/AvatarPicker';

interface MockUser { id:string; full_name:string; avatar_id:string; [k:string]:unknown; }

interface Props {
  quiz: Quiz;
  gameCode: string;
  mockUser: MockUser | null;
  onStartGame: (player: Player, botPlayers: Player[]) => void;
  onBack: () => void;
}

export default function LobbyPreview({ quiz, gameCode, mockUser, onStartGame, onBack }: Props) {
  const [playerName, setPlayerName] = useState(mockUser?.full_name ?? '');
  const [avatarId, setAvatarId] = useState(mockUser?.avatar_id ?? '0');
  const [showPicker, setShowPicker] = useState(false);
  const [bots] = useState<Player[]>(generateBotPlayers(5));
  const [nameError, setNameError] = useState('');
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waiting, setWaiting] = useState<{name:string;avatarId:string}[]>([]);
  const [copied, setCopied] = useState(false);
  const av = getAvatar(avatarId);

  useEffect(() => {
    const delays = [1200, 2500, 3700, 4900, 6100];
    const ts = bots.slice(0,5).map((bot,i) => setTimeout(()=>{
      setWaiting(p=>[...p,{name:bot.name, avatarId:String(Math.floor(Math.random()*CARTOON_AVATARS.length))}]);
    }, delays[i]));
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const player: Player = { id: mockUser?.id ?? 'player-me', name: playerName, avatar: av.emoji, score:0, streak:0, answers:[] };
      onStartGame(player, bots);
      return;
    }
    const t = setTimeout(()=>setCountdown(c=>c!==null?c-1:null), 1000);
    return ()=>clearTimeout(t);
  }, [countdown]);

  const handleJoin = () => {
    if (!playerName.trim()) { setNameError('Please enter your name'); return; }
    setNameError(''); setJoined(true); setCountdown(3);
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-50 bg-[#0d0d1a]/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <p className="text-white/50 text-lg mb-4 font-semibold tracking-wider uppercase">Game starting in</p>
          <div className="text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-500 leading-none">{countdown}</div>
          <div className="mt-6 flex items-center gap-3 justify-center">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-3xl`} style={{boxShadow:`0 0 20px ${av.glow}60`}}>{av.emoji}</div>
            <p className="text-white text-xl font-bold">{playerName} — Get ready!</p>
          </div>
        </div>
      )}

      <header className="bg-black/40 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm">← Back</button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm">🏔️</div>
            <span className="text-white font-bold text-sm">PinnacleQuiz</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">Game PIN</p>
          <button onClick={()=>{navigator.clipboard.writeText(gameCode).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-8 py-4 transition-all group">
            <span className="text-white font-black text-4xl tracking-[0.25em]">{gameCode}</span>
            <span className="text-white/40 group-hover:text-white/70 text-sm">{copied?'✓ Copied!':'📋'}</span>
          </button>
          <p className="text-white/30 text-xs mt-2">Click to copy · Share with classmates</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2">👤 Your Profile</h2>
            <div className="mb-5">
              <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-3">Avatar</label>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`} style={{boxShadow:`0 0 20px ${av.glow}50`}}>{av.emoji}</div>
                <div>
                  <div className="text-white font-bold">{av.label}</div>
                  <button onClick={()=>setShowPicker(s=>!s)} disabled={joined} className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors disabled:opacity-40">
                    {showPicker?'Close picker':'Change avatar →'}
                  </button>
                </div>
              </div>
              {showPicker && !joined && (
                <div className="mt-4 bg-black/30 rounded-2xl p-4 border border-white/10">
                  <AvatarPicker selectedId={avatarId} onChange={id=>{setAvatarId(id);setShowPicker(false);}} size="sm"/>
                </div>
              )}
            </div>
            <div className="mb-5">
              <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Display Name</label>
              <input type="text" value={playerName} onChange={e=>{setPlayerName(e.target.value);setNameError('');}} placeholder="Enter your name..." maxLength={20} disabled={joined}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all disabled:opacity-50"/>
              {nameError && <p className="text-red-400 text-xs mt-1.5">⚠ {nameError}</p>}
            </div>
            <div className={`bg-gradient-to-r ${quiz.coverColor} rounded-xl p-3.5 mb-5 flex items-center gap-3 shadow-lg`}>
              <span className="text-3xl">{quiz.icon}</span>
              <div><p className="text-white font-bold text-sm">{quiz.title}</p><p className="text-white/70 text-xs">{quiz.questions.length} questions · {quiz.grade}</p></div>
            </div>
            <button onClick={handleJoin} disabled={joined}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {joined?'🚀 Starting game...':'🚀 Join & Play!'}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl flex items-center gap-2">👥 Lobby</h2>
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                <span className="text-green-400 text-xs font-bold">LIVE</span>
              </div>
            </div>
            {joined && (
              <div className="flex items-center gap-3 bg-purple-500/20 border border-purple-400/30 rounded-xl px-3 py-2.5 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl`}>{av.emoji}</div>
                <span className="text-white font-bold text-sm">{playerName}</span>
                <span className="ml-auto text-purple-400 text-xs font-bold">YOU ✓</span>
              </div>
            )}
            <div className="space-y-2">
              {waiting.map((p,i)=>{
                const wav = getAvatar(p.avatarId);
                return (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 animate-fade-in">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${wav.bg} flex items-center justify-center text-xl flex-shrink-0`}>{wav.emoji}</div>
                    <span className="text-white font-semibold text-sm">{p.name}</span>
                    <span className="ml-auto text-white/30 text-xs">just joined</span>
                  </div>
                );
              })}
              {waiting.length===0 && !joined && (
                <div className="text-center py-10"><div className="text-5xl mb-3 animate-bounce">👀</div><p className="text-white/30 text-sm">Waiting for players to join...</p></div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">{waiting.length+(joined?1:0)} / 6 players</span>
                <div className="flex gap-1">
                  {Array.from({length:6}).map((_,i)=>(
                    <div key={i} className={`w-5 h-5 rounded-md transition-all ${i<waiting.length+(joined?1:0)?'bg-purple-500':'bg-white/10'}`}/>
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
