import CustomAudioManager from './CustomAudioManager';
import { useState } from 'react';
import { Quiz } from '../types';
import { SAMPLE_QUIZZES, SUBJECTS } from '../data/quizzes';
import { getAvatar } from '../lib/avatars';

interface MockUser { id:string; full_name:string; email:string; avatar_id:string; role:string; house:string; xp:number; level:number; }

interface Props {
  user: MockUser | null;
  crestSrc?: string;
  onStartQuiz: (q:Quiz)=>void;
  onViewQuiz: (q:Quiz)=>void;
  onCreateQuiz: ()=>void;
  onArena: ()=>void;
  onSignOut: ()=>void;
  onProfile: ()=>void;
  onStats: ()=>void;
  onSettings: ()=>void;
  quizzes?: Quiz[];
}

const HOUSE_ICONS: Record<string,string> = {Alpha:'🏛️',Beta:'⚗️',Gamma:'☢️',Pulsar:'✨'};

export default function HomeScreenPreview({ user, crestSrc, onStartQuiz, onViewQuiz, onCreateQuiz, onArena, onSignOut, onProfile, onStats, onSettings, quizzes:propQuizzes }: Props) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const quizzes = propQuizzes ?? SAMPLE_QUIZZES;
  const avatar = user ? getAvatar(user.avatar_id) : null;

  const filtered = quizzes.filter(q => {
    const m = q.title.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase());
    return m && (subject==='All' || q.subject===subject);
  });

  return (
    <>
      {showAudio && <CustomAudioManager onClose={() => setShowAudio(false)} />}
      <div className="min-h-screen bg-[#0d0d1a]">

      {/* ═══ HEADER ═══ */}
      <header className="bg-[#070b18]/95 backdrop-blur-xl border-b border-white/8 sticky top-0 z-50 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 py-0 flex items-center justify-between gap-3" style={{height:'60px'}}>

          {/* ── LOGO: Crest + Name ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Crest container */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-blue-400/40 shadow-lg"
                style={{boxShadow:'0 0 16px rgba(59,130,246,0.35), 0 2px 8px rgba(0,0,0,0.5)'}}>
                {crestSrc
                  ? <img src={crestSrc} alt="Pinnacle Educational Centre" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl">🏔️</div>
                }
              </div>
              {/* Live dot */}
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#070b18] animate-pulse"/>
            </div>

            {/* Name block */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-base leading-none tracking-wide">PinnacleQuiz</span>
                <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">PRO</span>
              </div>
              <div className="text-blue-400/60 text-[11px] font-medium leading-none mt-0.5 tracking-wide">Pinnacle Educational Centre · EST 2009</div>
            </div>
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            <button onClick={onArena}
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-3 py-2 rounded-full text-xs sm:text-sm transition-all shadow-md shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95">
              <span>⚡</span><span className="hidden sm:inline">Math Arena</span>
            </button>
            {user?.role!=='parent'&&(
              <button onClick={onCreateQuiz}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold px-3 py-2 rounded-full text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-500/20">
                <span className="hidden sm:inline">+ Create</span><span className="sm:hidden">+</span>
              </button>
            )}

            {/* ── User Menu ── */}
            {user && avatar && (
              <div className="relative">
                <button onClick={()=>setMenuOpen(o=>!o)}
                  className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/12 rounded-full pl-1 pr-2.5 py-1 transition-all">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-base shadow-sm flex-shrink-0`}
                    style={{boxShadow:`0 0 10px ${avatar.glow}60`}}>
                    {avatar.emoji}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-white text-xs font-bold leading-none">{user.full_name.split(' ')[0]}</div>
                    <div className="text-purple-400 text-[10px] leading-none mt-0.5">Lv.{user.level}</div>
                  </div>
                  <span className="text-white/30 text-xs">{menuOpen?'▲':'▼'}</span>
                </button>

                {menuOpen&&(
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0f1729] border border-white/12 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
                    {/* Profile header */}
                    <div className="p-4 bg-gradient-to-br from-purple-600/25 to-indigo-700/25 border-b border-white/8">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-2xl flex-shrink-0`}
                          style={{boxShadow:`0 0 20px ${avatar.glow}70`}}>
                          {avatar.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-bold truncate">{user.full_name}</div>
                          <div className="text-white/40 text-xs truncate">{user.email}</div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-purple-400 text-xs font-bold">🎓 {user.role.charAt(0).toUpperCase()+user.role.slice(1)}</span>
                            {user.house&&<span className="text-white/30 text-xs">{HOUSE_ICONS[user.house]} {user.house}</span>}
                          </div>
                        </div>
                      </div>
                      {/* XP bar */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-yellow-400/70 w-10">Lv.{user.level}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                            style={{width:`${Math.min((user.xp%500)/5,100)}%`}}/>
                        </div>
                        <span className="text-xs text-white/30">{user.xp} XP</span>
                      </div>
                    </div>

                    {/* Menu items — ALL FUNCTIONAL */}
                    <div className="p-2">
                      <button onClick={()=>{setMenuOpen(false);onProfile();}}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors text-left group">
                        <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                        <div><div className="text-white/90 text-sm font-medium">My Profile</div><div className="text-white/30 text-xs">Edit name, avatar, house</div></div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 text-xs">→</span>
                      </button>
                      <button onClick={()=>{setMenuOpen(false);onStats();}}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors text-left group">
                        <span className="text-lg group-hover:scale-110 transition-transform">🏆</span>
                        <div><div className="text-white/90 text-sm font-medium">My Stats</div><div className="text-white/30 text-xs">Scores, badges, rankings</div></div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 text-xs">→</span>
                      </button>
                      <button onClick={()=>{setMenuOpen(false);onSettings();}}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors text-left group">
                        <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                        <div><div className="text-white/90 text-sm font-medium">Settings</div><div className="text-white/30 text-xs">Sounds, display, account</div></div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 text-xs">→</span>
                      </button>
                      <div className="h-px bg-white/8 my-1.5 mx-3"/>
                      <button onClick={()=>{setMenuOpen(false);onSignOut();}}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/8 transition-colors text-left group text-red-400">
                        <span className="text-lg">🚪</span>
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Arena banner */}
      <div onClick={onArena} className="cursor-pointer bg-gradient-to-r from-yellow-500/10 via-orange-500/8 to-red-500/10 border-b border-yellow-500/15 hover:from-yellow-500/18 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-pulse">⚡</span>
            <span className="text-white font-bold text-sm">Smart Calculation Arena</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">NEW</span>
            <span className="text-white/30 text-xs hidden md:inline">Lightning · Formation · Tug of War</span>
          </div>
          <span className="text-yellow-400 text-sm font-bold">Play →</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0818] via-[#1a1040] to-[#0d1525] py-14 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-15 animate-pulse" style={{background:'radial-gradient(circle,#7c3aed,transparent)'}}/>
          <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full opacity-10 animate-pulse" style={{background:'radial-gradient(circle,#1e40af,transparent)',animationDelay:'2s'}}/>
          {[...Array(16)].map((_,i)=>(
            <div key={i} className="absolute rounded-full opacity-25 animate-pulse"
              style={{width:`${3+Math.random()*5}px`,height:`${3+Math.random()*5}px`,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,background:['#a855f7','#3b82f6','#f472b6','#34d399'][i%4],animationDuration:`${2+Math.random()*3}s`,animationDelay:`${Math.random()*2}s`}}/>
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          {user&&avatar&&(
            <div className="flex items-center justify-center gap-3 mb-7">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-3xl shadow-xl flex-shrink-0`}
                style={{boxShadow:`0 0 25px ${avatar.glow}60`}}>
                {avatar.emoji}
              </div>
              <div className="text-left">
                <div className="text-white font-black text-xl leading-none">Welcome, {user.full_name.split(' ')[0]}! 👋</div>
                <div className="text-white/40 text-sm mt-0.5">Level {user.level} · {user.xp.toLocaleString()} XP{user.house?` · ${HOUSE_ICONS[user.house]} House ${user.house}`:''}</div>
              </div>
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-5">
            <span className="animate-pulse">●</span> Live Interactive Quizzes — Veritas et Virtus
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Learn. Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Excel.</span>
          </h2>
          <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto">Compete in real-time quizzes, earn XP, and climb the leaderboard at Pinnacle Educational Centre.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button onClick={onArena} className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-7 py-4 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/30">⚡ Enter Math Arena</button>
            <button onClick={onCreateQuiz} className="flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-7 py-4 rounded-2xl text-lg hover:bg-white/12 transition-all">+ Create Quiz</button>
          </div>
          <div className="relative max-w-lg mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25">🔍</span>
            <input type="text" placeholder="Search quizzes..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full bg-white/8 backdrop-blur border border-white/12 text-white placeholder-white/25 rounded-full py-3.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"/>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-6 justify-center">
          {[{icon:'🎮',v:quizzes.length,k:'Quizzes'},{icon:'👥',v:'2,847',k:'Students'},{icon:'🏆',v:quizzes.reduce((a,b)=>a+b.playCount,0).toLocaleString(),k:'Total Plays'},{icon:'⚡',v:'1,247',k:'Arena Battles'}].map(s=>(
            <div key={s.k} className="flex items-center gap-2"><span>{s.icon}</span><span className="text-white font-black text-sm">{s.v}</span><span className="text-white/35 text-xs">{s.k}</span></div>
          ))}
        </div>
      </div>

      {/* Subject filter */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All',...SUBJECTS].map(s=>(
            <button key={s} onClick={()=>setSubject(s)}
              className={`flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all ${subject===s?'bg-purple-500 text-white shadow-lg shadow-purple-500/25':'bg-white/6 text-white/55 hover:bg-white/12 border border-white/8'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">{subject==='All'?'All Quizzes':subject} <span className="text-white/25 text-sm font-normal">({filtered.length})</span></h3>
          <span className="text-white/25 text-xs hidden sm:block">Click to preview · Play Now to join lobby</span>
        </div>
        {filtered.length===0?(
          <div className="text-center py-20 text-white/25"><div className="text-5xl mb-4">🔍</div><p className="text-lg font-semibold">No quizzes found</p></div>
        ):(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(quiz=>(
              <div key={quiz.id} className="group bg-white/4 border border-white/6 rounded-2xl overflow-hidden hover:border-white/18 hover:bg-white/6 transition-all duration-200 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer" onClick={()=>onViewQuiz(quiz)}>
                <div className={`h-24 bg-gradient-to-br ${quiz.coverColor} flex items-center justify-center relative`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-200">{quiz.icon}</span>
                  <div className="absolute top-2 right-2 bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">{quiz.grade}</div>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">{quiz.title}</h4>
                  <p className="text-white/35 text-xs mb-3 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/25 mb-3">
                    <span>{quiz.questions.length} questions</span><span>▶ {quiz.playCount.toLocaleString()}</span>
                  </div>
                  <button onClick={e=>{e.stopPropagation();onStartQuiz(quiz);}} className={`w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${quiz.coverColor} opacity-80 hover:opacity-100 transition-all active:scale-95`}>Play Now</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
