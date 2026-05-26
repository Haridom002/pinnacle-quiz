import { useState } from 'react';
import { Quiz } from '../types';
import { SAMPLE_QUIZZES, SUBJECTS } from '../data/quizzes';
import { useAuth } from '../contexts/AuthContext';
import { getAvatar } from '../lib/avatars';
import UserMenu from './UserMenu';

interface HomeScreenProps {
  onStartQuiz: (quiz: Quiz) => void;
  onViewQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
  onArena: () => void;
  quizzes?: Quiz[];
}

export default function HomeScreen({ onStartQuiz, onViewQuiz, onCreateQuiz, onArena, quizzes: propQuizzes }: HomeScreenProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const quizzes = propQuizzes ?? SAMPLE_QUIZZES;
  const avatar = user ? getAvatar(user.avatar_id) : null;

  const filtered = quizzes.filter(q => {
    const matchSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    return matchSearch && matchSubject;
  });

  const roleLabel = user?.role === 'teacher' ? '📋 Teacher Dashboard' : user?.role === 'parent' ? '👨‍👩‍👧 Parent View' : null;

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      {/* ── Header ── */}
      <header className="bg-[#0d0d1a]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 text-lg">
              🏔️
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-black text-base leading-none">PinnacleQuiz</div>
              <div className="text-purple-400/70 text-[11px]">Pinnacle Educational Centre</div>
            </div>
          </div>

          {/* Center: role label */}
          {roleLabel && (
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-white/60 text-xs font-semibold">
              {roleLabel}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Arena button */}
            <button onClick={onArena}
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-3 py-2 rounded-full text-xs sm:text-sm transition-all shadow-md hover:shadow-yellow-500/30 hover:scale-105 active:scale-95">
              <span>⚡</span>
              <span className="hidden sm:inline">Math Arena</span>
            </button>

            {/* Create quiz (teachers + students) */}
            {user?.role !== 'parent' && (
              <button onClick={onCreateQuiz}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-3 py-2 rounded-full text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95">
                <span className="hidden sm:inline">+ Create</span>
                <span className="sm:hidden">+</span>
              </button>
            )}

            {/* User menu */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Arena banner ── */}
      <div onClick={onArena}
        className="cursor-pointer bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-b border-yellow-500/20 hover:from-yellow-500/20 hover:to-red-500/20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span className="text-white font-bold text-sm">Smart Calculation Arena</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">NEW</span>
            <span className="text-white/40 text-xs hidden sm:inline">· Lightning · Formation · Tug of War</span>
          </div>
          <span className="text-yellow-400 text-sm font-bold">Play →</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-14 px-4">
        {/* particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: `${3+Math.random()*6}px`, height: `${3+Math.random()*6}px`,
                left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                background: ['#a855f7','#818cf8','#f472b6','#34d399'][i%4],
                animationDuration: `${2+Math.random()*3}s`,
                animationDelay: `${Math.random()*2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Personalized greeting */}
          {user && avatar && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-2xl shadow-lg`}
                style={{ boxShadow: `0 0 20px ${avatar.glow}50` }}>
                {avatar.emoji}
              </div>
              <div className="text-left">
                <div className="text-white font-black text-lg leading-none">
                  Welcome back, {user.full_name.split(' ')[0]}! 👋
                </div>
                <div className="text-white/40 text-sm">
                  Level {user.level} · {user.xp} XP{user.house ? ` · House ${user.house}` : ''}
                </div>
              </div>
            </div>
          )}

          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-4 py-2 rounded-full mb-5">
            <span className="animate-pulse">●</span> Live Interactive Quizzes
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Learn. Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Excel.</span>
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Compete in real-time quizzes, earn XP, and climb the leaderboard.
          </p>

          {/* Arena CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button onClick={onArena}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-7 py-4 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/30">
              ⚡ Enter Math Arena
            </button>
            {user?.role !== 'parent' && (
              <button onClick={onCreateQuiz}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-7 py-4 rounded-2xl text-lg hover:bg-white/15 transition-all">
                + Create Quiz
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input type="text" placeholder="Search quizzes..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/30 rounded-full py-3.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-6 justify-center">
          {[
            { icon: '🎮', v: quizzes.length, k: 'Quizzes' },
            { icon: '👥', v: '2,847', k: 'Students' },
            { icon: '🏆', v: quizzes.reduce((a, b) => a + b.playCount, 0).toLocaleString(), k: 'Total Plays' },
            { icon: '⚡', v: '1,247', k: 'Arena Battles' },
          ].map(s => (
            <div key={s.k} className="flex items-center gap-2">
              <span>{s.icon}</span>
              <span className="text-white font-black text-sm">{s.v}</span>
              <span className="text-white/40 text-xs">{s.k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Subject filter ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', ...SUBJECTS].map(subject => (
            <button key={subject} onClick={() => setSelectedSubject(subject)}
              className={`flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedSubject === subject
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
              }`}>
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quiz grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">
            {selectedSubject === 'All' ? 'All Quizzes' : selectedSubject}
            <span className="ml-2 text-white/30 text-sm font-normal">({filtered.length})</span>
          </h3>
          <div className="text-white/30 text-sm hidden sm:block">
            Click any quiz to preview · Play to enter lobby
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold">No quizzes found</p>
            <p className="text-sm mt-1">Try a different search or subject</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(quiz => (
              <div key={quiz.id}
                className="group bg-white/4 border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/7 transition-all duration-200 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer"
                onClick={() => onViewQuiz(quiz)}>
                <div className={`h-24 bg-gradient-to-br ${quiz.coverColor} flex items-center justify-center relative`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-200">{quiz.icon}</span>
                  <div className="absolute top-2 right-2 bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">
                    {quiz.grade}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {quiz.title}
                  </h4>
                  <p className="text-white/40 text-xs mb-3 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/30 mb-3">
                    <span>{quiz.questions.length} questions</span>
                    <span>▶ {quiz.playCount.toLocaleString()}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onStartQuiz(quiz); }}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${quiz.coverColor} opacity-85 hover:opacity-100 transition-all active:scale-95`}>
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
