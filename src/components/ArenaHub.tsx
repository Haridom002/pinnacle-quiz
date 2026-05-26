import { useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import MusicPlayer from './MusicPlayer';

interface Props {
  onMode: (mode: 'lightning' | 'formation' | 'tug' | 'host') => void;
  onBack: () => void;
}

const MODES = [
  {
    id: 'host' as const,
    icon: '🎮',
    title: 'Live Arena',
    subtitle: 'Real-time multiplayer',
    description: 'Host or join a live math battle using a 6-digit code. Pick your house, earn combos, and see live leaderboards!',
    color: '#a855f7',
    gradient: 'from-purple-500/25 to-violet-700/25',
    border: 'border-purple-500/50',
    hover: 'hover:border-purple-400',
    tags: ['👥 Multiplayer', '🏠 Houses', '🏆 Live Board', '⚡ Speed Scoring'],
    badge: 'LIVE',
    badgeColor: 'bg-purple-500/25 text-purple-300 border-purple-500/40',
    hot: true,
  },
  {
    id: 'lightning' as const,
    icon: '⚡',
    title: 'Lightning Calculator',
    subtitle: 'Fast-paced solo speed',
    description: 'Race against the clock answering math at lightning speed. Earn combos, XP, hearts, and power-ups.',
    color: '#f59e0b',
    gradient: 'from-yellow-500/20 to-orange-600/20',
    border: 'border-yellow-500/40',
    hover: 'hover:border-yellow-400',
    tags: ['⏱️ Timed', '🔥 Combos', '❤️ Lives', '⭐ XP'],
    badge: 'SOLO',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hot: false,
  },
  {
    id: 'formation' as const,
    icon: '🧠',
    title: 'Formation Training',
    subtitle: 'AI adaptive drills',
    description: 'Rapid-fire arithmetic with AI difficulty scaling. Track speed, accuracy and weak areas in real time.',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/40',
    hover: 'hover:border-cyan-400',
    tags: ['🤖 AI Adaptive', '📈 Analytics', '🎯 5 Categories', '🔄 Speed Training'],
    badge: 'TRAINING',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    hot: false,
  },
  {
    id: 'tug' as const,
    icon: '⚔️',
    title: 'Math Tug Arena',
    subtitle: 'Team vs team battle',
    description: 'Two animal teams battle through math questions in tug-of-war. Super Pull with 3-combo streaks!',
    color: '#ef4444',
    gradient: 'from-red-600/20 to-blue-600/20',
    border: 'border-red-500/40',
    hover: 'hover:border-red-400',
    tags: ['👥 2 Teams', '⚡ Super Pull', '☠️ Sudden Death', '🦁 Animals'],
    badge: 'VS',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    hot: false,
  },
];

const LEADERBOARD = [
  { rank:1, name:'MathDestroyer', xp:45230, avatar:'🦁', house:'Alpha', pts:12500 },
  { rank:2, name:'QuickBrain',    xp:38910, avatar:'⚡', house:'Pulsar', pts:11900 },
  { rank:3, name:'SpeedStar',     xp:35670, avatar:'🔥', house:'Gamma',  pts:11100 },
  { rank:4, name:'NumberNinja',   xp:29340, avatar:'🧠', house:'Beta',   pts:10800 },
  { rank:5, name:'LightningBoy',  xp:24120, avatar:'💎', house:'Alpha',  pts:10200 },
];

const HOUSE_SCORES = [
  { house:'Alpha',  icon:'🔴', score:142300, color:'#ef4444' },
  { house:'Pulsar', icon:'🟡', score:138900, color:'#f59e0b' },
  { house:'Gamma',  icon:'🟢', score:125600, color:'#10b981' },
  { house:'Beta',   icon:'🔵', score:118400, color:'#3b82f6' },
];

export default function ArenaHub({ onMode, onBack }: Props) {
  const [hovered, setHovered] = useState<string|null>(null);
  const [showLB, setShowLB] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d1a] overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15 animate-pulse" style={{background:'radial-gradient(circle,#a855f7,transparent)'}}/>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15 animate-pulse" style={{background:'radial-gradient(circle,#f59e0b,transparent)',animationDelay:'1.5s'}}/>
        {[...Array(25)].map((_,i)=>(
          <div key={i} className="absolute rounded-full animate-pulse" style={{
            width:`${2+Math.random()*5}px`,height:`${2+Math.random()*5}px`,
            left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
            background:['#f59e0b','#a855f7','#06b6d4','#ef4444','#10b981'][i%5],
            opacity:0.25+Math.random()*0.35,
            animationDuration:`${2+Math.random()*4}s`,animationDelay:`${Math.random()*3}s`,
          }}/>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={()=>{soundEngine.click();onBack();}} className="text-white/50 hover:text-white flex items-center gap-2 transition-colors text-sm">
            ← Home
          </button>
          <div className="flex items-center gap-2">
            <div className="text-2xl">⚡</div>
            <div>
              <div className="text-white font-black text-lg leading-none">Smart Calc Arena</div>
              <div className="text-yellow-400/60 text-xs">Premium Math Mode</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>{setShowLB(s=>!s);soundEngine.click();}}
              className="hidden sm:flex items-center gap-1 bg-yellow-500/12 border border-yellow-500/30 text-yellow-400 rounded-full px-3 py-1.5 text-xs font-bold hover:bg-yellow-500/20 transition-colors">
              🏆 Board
            </button>
            <MusicPlayer category="home" compact/>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-500/12 border border-green-500/30 text-green-400 text-xs font-bold px-4 py-2 rounded-full mb-5">
            <span className="animate-pulse">●</span> 1,842 students battling live right now
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3" style={{textShadow:'0 0 60px rgba(168,85,247,0.3)'}}>
            Choose Your<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">Battle Mode</span>
          </h1>
          <p className="text-white/40 text-lg max-w-lg mx-auto">Master mental math through competitive, adaptive, and live multiplayer challenges</p>
        </div>

        {/* Leaderboard panel */}
        {showLB && (
          <div className="mb-8 bg-black/40 border border-yellow-500/20 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">🏆</span>
              <h3 className="text-white font-black text-lg">This Week's Champions</h3>
              <span className="ml-auto text-white/30 text-sm">Live Rankings</span>
            </div>

            {/* House standings */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {HOUSE_SCORES.sort((a,b)=>b.score-a.score).map((h,i)=>(
                <div key={h.house} className="p-3 rounded-xl border text-center" style={{borderColor:h.color+'40',background:h.color+'10'}}>
                  <div className="text-xl mb-0.5">{h.icon}</div>
                  <div className="font-black text-sm text-white">{h.house}</div>
                  <div className="font-bold text-xs" style={{color:h.color}}>{(h.score/1000).toFixed(1)}K</div>
                  {i===0&&<div className="text-yellow-400 text-xs">👑 Leading</div>}
                </div>
              ))}
            </div>

            {/* Player list */}
            <div className="space-y-2">
              {LEADERBOARD.map((p,i)=>(
                <div key={p.rank} className={`flex items-center gap-3 p-3 rounded-xl ${i===0?'bg-yellow-500/10 border border-yellow-500/20':'bg-white/4 border border-white/6'}`}>
                  <div className="w-8 text-center font-black text-sm" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#ffffff40'}}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${p.rank}`}
                  </div>
                  <div className="text-2xl">{p.avatar}</div>
                  <div className="flex-1"><div className="text-white font-bold text-sm">{p.name}</div><div className="text-white/30 text-xs">House {p.house}</div></div>
                  <div className="text-right"><div className="text-yellow-400 font-black text-sm">{p.pts.toLocaleString()}</div><div className="text-white/25 text-xs">pts</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {MODES.map(mode=>(
            <button key={mode.id}
              onClick={()=>{soundEngine.click();onMode(mode.id);}}
              onMouseEnter={()=>setHovered(mode.id)}
              onMouseLeave={()=>setHovered(null)}
              className={`relative text-left p-6 rounded-3xl border-2 transition-all duration-300 bg-gradient-to-br ${mode.gradient} ${mode.border} ${mode.hover} hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] overflow-hidden`}
              style={hovered===mode.id?{boxShadow:`0 0 40px ${mode.color}30`}:{}}>
              {/* Glow */}
              {hovered===mode.id&&<div className="absolute inset-0 rounded-3xl opacity-15 pointer-events-none" style={{background:`radial-gradient(ellipse at center,${mode.color},transparent)`}}/>}

              {/* HOT badge */}
              {mode.hot&&(
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <div className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">🔴 LIVE</div>
                </div>
              )}
              {!mode.hot&&(
                <div className={`absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full border ${mode.badgeColor}`}>{mode.badge}</div>
              )}

              <div className="text-5xl mb-4" style={hovered===mode.id?{filter:`drop-shadow(0 0 20px ${mode.color})`}:{}}>{mode.icon}</div>
              <h3 className="text-white font-black text-xl mb-0.5">{mode.title}</h3>
              <div className="text-xs font-bold mb-3" style={{color:mode.color}}>{mode.subtitle}</div>
              <p className="text-white/45 text-sm mb-4 leading-relaxed">{mode.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {mode.tags.map(tag=>(
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/8 text-white/50">{tag}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 font-bold text-sm" style={{color:mode.color}}>
                {mode.id==='host'?'Host or Join →':'Play Now →'}
              </div>
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[['42,819','Questions Answered','🎯'],['8,312','Students Active','👥'],['1,247','Battles Today','⚔️'],['99.2%','Arena Uptime','⚡']].map(([v,k,icon])=>(
            <div key={k} className="bg-white/4 border border-white/8 rounded-2xl p-4 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-2xl font-black text-white">{v}</div>
              <div className="text-white/35 text-xs">{k}</div>
            </div>
          ))}
        </div>

        {/* House competition */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-600/10 border border-purple-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="text-white font-black">School House Competition</h3>
              <p className="text-white/40 text-sm">Weekly battle — earn XP for your house</p>
            </div>
            <div className="ml-auto bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse">● LIVE</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {HOUSE_SCORES.map((h,i)=>(
              <div key={h.house} className="text-center p-3 rounded-2xl bg-white/4 border border-white/8">
                <div className="text-2xl mb-1">{h.icon}</div>
                <div className="text-xs font-black text-white">{h.house}</div>
                <div className="text-xs font-bold mt-0.5" style={{color:h.color}}>{(h.score/1000).toFixed(1)}K</div>
                {i===0&&<div className="text-yellow-400 text-xs mt-0.5">👑 #1</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
