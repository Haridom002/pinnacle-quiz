import { useState, useEffect, useCallback, useRef } from 'react';
import { Quiz, Player, PlayerAnswer } from './types';
import { SAMPLE_QUIZZES } from './data/quizzes';
import { generateGameCode, simulateBotAnswer, calculatePoints, getStreakMultiplier } from './utils/gameUtils';
import { CARTOON_AVATARS } from './lib/avatars';
import { CREST_B64 } from './lib/crestBase64';
import AvatarPicker from './auth/AvatarPicker';
import HomeScreenPreview from './components/HomeScreenPreview';
import QuizDetail from './components/QuizDetail';
import QuestionScreen from './components/QuestionScreen';
import Leaderboard from './components/Leaderboard';
import Podium from './components/Podium';
import QuizBuilder from './components/QuizBuilder';
import ArenaHub from './components/ArenaHub';
import LightningCalculator from './components/LightningCalculator';
import FormationMode from './components/FormationMode';
import TugOfWar from './components/TugOfWar';
import LobbyPreview from './components/LobbyPreview';
import ProfileModal from './components/ProfileModal';
import StatsModal from './components/StatsModal';
import ArenaHostMode from './components/ArenaHostMode';

type Phase = 'auth'|'home'|'lobby'|'question'|'leaderboard'|'podium'
  |'quiz-builder'|'quiz-detail'|'arena-hub'|'lightning-calc'|'formation-mode'|'tug-war'|'arena-host';
type UserRole = 'student'|'teacher'|'parent';

// Single canonical MockUser type used everywhere
export interface MockUser {
  id: string;
  full_name: string;
  email: string;
  avatar_id: string;
  role: UserRole;
  house: string;
  xp: number;
  level: number;
}

const HOUSES = ['Alpha','Beta','Gamma','Pulsar'] as const;
const ROLES: {id:UserRole;label:string;icon:string;desc:string}[] = [
  {id:'student', label:'Student', icon:'🎓', desc:'Play quizzes & earn XP'},
  {id:'teacher', label:'Teacher', icon:'📋', desc:'Create & host live quizzes'},
  {id:'parent',  label:'Parent',  icon:'👨‍👩‍👧', desc:"Monitor your child's progress"},
];
const HOUSE_ICONS: Record<string,string> = {Alpha:'🏛️',Beta:'⚗️',Gamma:'☢️',Pulsar:'✨'};

export default function AppPreview() {
  const [phase,       setPhase]       = useState<Phase>('auth');
  const [authStep,    setAuthStep]    = useState<'landing'|'signin'|'signup-1'|'signup-2'|'signup-3'>('landing');
  const [mockUser,    setMockUser]    = useState<MockUser|null>(null);
  const [role,        setRole]        = useState<UserRole>('student');
  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [avatarId,    setAvatarId]    = useState('0');
  const [house,       setHouse]       = useState('Alpha');
  const [authError,   setAuthError]   = useState('');
  const [quizLibrary, setQuizzes]     = useState<Quiz[]>(SAMPLE_QUIZZES);
  const [selectedQuiz,setSelectedQuiz]= useState<Quiz|null>(null);
  const [gameCode,    setGameCode]    = useState('');
  const [currentPlayer,setCurrentPlayer]= useState<Player|null>(null);
  const [allPlayers,  setAllPlayers]  = useState<Player[]>([]);
  const [questionIndex,setQuestionIndex]= useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showStats,   setShowStats]   = useState(false);
  const gameStarted = useRef(false);

  // ── Auth helpers ────────────────────────────────────────────────
  const makeUser = (overrides: Partial<MockUser> = {}): MockUser => ({
    id: 'preview-user', full_name: fullName || email.split('@')[0] || 'Demo User',
    email: email || 'demo@pinnacle.edu.gh', avatar_id: avatarId,
    role, house, xp: 0, level: 1, ...overrides,
  });

  const signIn = () => {
    if (!email || !password) { setAuthError('Please fill in all fields.'); return; }
    setMockUser(makeUser({ xp: 1240, level: 4 }));
    setPhase('home');
  };

  const signUp = () => {
    if (authStep === 'signup-1') { setAuthStep('signup-2'); return; }
    if (authStep === 'signup-2') {
      if (!fullName)       { setAuthError('Enter your name'); return; }
      if (!email)          { setAuthError('Enter your email'); return; }
      if (password.length < 6) { setAuthError('Password min 6 chars'); return; }
      setAuthStep('signup-3'); return;
    }
    setMockUser(makeUser());
    setPhase('home');
  };

  // ── Bot simulation ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'question' || !selectedQuiz) return;
    const question = selectedQuiz.questions[questionIndex];
    if (!question) return;
    const t = setTimeout(() => {
      setAllPlayers(prev => prev.map(p => {
        if (p.id === currentPlayer?.id) return p;
        const { answerId, timeMs } = simulateBotAnswer(question, 'medium');
        const ans = question.answers.find(a => a.id === answerId);
        const isCorrect = ans?.isCorrect ?? false;
        const pts = Math.floor(calculatePoints(question.points, question.timeLimit, timeMs, isCorrect) * getStreakMultiplier(p.streak));
        return { ...p, score: p.score + pts, streak: isCorrect ? p.streak + 1 : 0,
          answers: [...p.answers, { questionId: question.id, answerId, timeMs, pointsEarned: pts, isCorrect } as PlayerAnswer] };
      }));
    }, 500);
    return () => clearTimeout(t);
  }, [questionIndex, phase, selectedQuiz, currentPlayer?.id]);

  const handleStartGame = useCallback((player: Player, botPlayers: Player[]) => {
    setCurrentPlayer(player); setAllPlayers([player, ...botPlayers]);
    setQuestionIndex(0); setPhase('question'); gameStarted.current = true;
  }, []);

  const handleAnswer = useCallback((answerId: string|null, pointsEarned: number, isCorrect: boolean) => {
    if (!selectedQuiz || !currentPlayer) return;
    const q = selectedQuiz.questions[questionIndex];
    const updated = { ...currentPlayer, score: currentPlayer.score + pointsEarned,
      streak: isCorrect ? currentPlayer.streak + 1 : 0,
      answers: [...currentPlayer.answers, { questionId: q.id, answerId, timeMs: 0, pointsEarned, isCorrect }] };
    setCurrentPlayer(updated);
    setAllPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updated : p));
    setPhase('leaderboard');
  }, [selectedQuiz, currentPlayer, questionIndex]);

  const handleContinue = useCallback(() => {
    if (!selectedQuiz) return;
    if (questionIndex >= selectedQuiz.questions.length - 1) setPhase('podium');
    else { setQuestionIndex(i => i + 1); setPhase('question'); }
  }, [selectedQuiz, questionIndex]);

  const goHome = () => { setPhase('home'); setCurrentPlayer(null); setAllPlayers([]); setQuestionIndex(0); };

  // ── Modals (always rendered so they can animate in/out) ──────────
  const modals = (
    <>
      {showProfile && mockUser && (
        <ProfileModal user={mockUser} onClose={() => setShowProfile(false)}
          onUpdate={u => setMockUser(m => m ? { ...m, ...u } as MockUser : m)} />
      )}
      {showStats && mockUser && (
        <StatsModal user={mockUser} onClose={() => setShowStats(false)} />
      )}
    </>
  );

  // ── AUTH SCREENS ─────────────────────────────────────────────────
  if (phase === 'auth') {
    const Logo = () => (
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-blue-400/35 shadow-xl"
          style={{ boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}>
          <img src={CREST_B64} alt="PEC Crest" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-white font-black text-2xl leading-none">PinnacleQuiz</div>
          <div className="text-blue-400/70 text-sm">Pinnacle Educational Centre · EST 2009</div>
        </div>
      </div>
    );

    const StepBar = ({ step }: { step: number }) => (
      <div className="flex gap-1.5 mb-6 items-center">
        {[1,2,3].map(s => <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-white/10'}`} />)}
        <span className="text-white/35 text-xs ml-2">{step}/3</span>
      </div>
    );

    if (authStep === 'landing') return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 animate-pulse" style={{background:'radial-gradient(circle,#7c3aed,transparent)'}}/>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 animate-pulse" style={{background:'radial-gradient(circle,#1e40af,transparent)',animationDelay:'1s'}}/>
          {[...Array(18)].map((_,i)=>(<div key={i} className="absolute rounded-full animate-pulse" style={{width:`${2+Math.random()*5}px`,height:`${2+Math.random()*5}px`,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,background:['#7c3aed','#1e40af','#f59e0b','#10b981'][i%4],opacity:0.25+Math.random()*0.35,animationDuration:`${2+Math.random()*3}s`,animationDelay:`${Math.random()*2}s`}}/>))}
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <Logo />
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CARTOON_AVATARS.slice(0,12).map(a => (
              <div key={a.id} className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.bg} flex items-center justify-center text-2xl shadow-md hover:scale-110 transition-transform`} style={{boxShadow:`0 4px 12px ${a.glow}35`}}>{a.emoji}</div>
            ))}
            <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-white/35 text-xs font-bold">+18</div>
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <span className="animate-pulse">●</span> 2,847 students learning now
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Learn Smarter.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-yellow-400">Play Harder.</span>
            </h1>
            <p className="text-white/35 text-sm">The competitive quiz & math arena for JHS learners, teachers & parents.</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => setAuthStep('signup-1')} className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/25">🚀 Get Started — It's Free</button>
            <button onClick={() => setAuthStep('signin')} className="w-full py-4 bg-white/8 border border-white/15 text-white font-bold rounded-2xl hover:bg-white/12 transition-all">Already have an account? Sign In</button>
            <button onClick={() => { setMockUser({ id:'demo', full_name:'Demo Student', email:'demo@pinnacle.edu.gh', avatar_id:'25', role:'student', house:'Alpha', xp:1240, level:4 }); setPhase('home'); }}
              className="w-full py-3 bg-white text-gray-800 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-md text-sm">
              👁️ Preview as Guest (No signup needed)
            </button>
          </div>
          <div className="flex gap-2 justify-center mt-5">
            {ROLES.map(r => (<div key={r.id} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-2.5 py-1"><span className="text-sm">{r.icon}</span><span className="text-white/45 text-xs">{r.label}</span></div>))}
          </div>
        </div>
      </div>
    );

    if (authStep === 'signin') return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button onClick={() => setAuthStep('landing')} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">← Back</button>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <Logo />
            <h2 className="text-2xl font-black text-white text-center -mt-4 mb-6">Welcome back!</h2>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-white/50 text-sm font-semibold block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"/>
              </div>
              <div>
                <label className="text-white/50 text-sm font-semibold block mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"/>
              </div>
            </div>
            {authError && <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{authError}</div>}
            <button onClick={signIn} className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">→ Sign In</button>
            <p className="text-center text-white/35 text-sm mt-4">No account? <button onClick={() => { setAuthError(''); setAuthStep('signup-1'); }} className="text-purple-400 font-semibold">Sign up</button></p>
          </div>
        </div>
      </div>
    );

    if (authStep === 'signup-1') return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <button onClick={() => setAuthStep('landing')} className="text-white/40 hover:text-white text-sm mb-5 flex items-center gap-2 transition-colors">← Back</button>
          <StepBar step={1} />
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-white mb-1">Who are you?</h2>
            <p className="text-white/40 text-sm mb-6">Your role shapes your experience</p>
            <div className="space-y-3 mb-6">
              {ROLES.map(r => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${role === r.id ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 bg-white/4 hover:border-white/22'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0 ${r.id==='student'?'bg-gradient-to-br from-purple-500 to-indigo-600':r.id==='teacher'?'bg-gradient-to-br from-blue-500 to-cyan-600':'bg-gradient-to-br from-green-500 to-emerald-600'}`}>{r.icon}</div>
                  <div><div className="text-white font-bold">{r.label}</div><div className="text-white/40 text-xs">{r.desc}</div></div>
                  {role === r.id && <div className="ml-auto text-purple-400 text-lg">✓</div>}
                </button>
              ))}
            </div>
            <button onClick={() => setAuthStep('signup-2')} className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl hover:scale-[1.02] transition-all shadow-lg">Continue →</button>
          </div>
        </div>
      </div>
    );

    if (authStep === 'signup-2') return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <button onClick={() => setAuthStep('signup-1')} className="text-white/40 hover:text-white text-sm mb-5 flex items-center gap-2 transition-colors">← Back</button>
          <StepBar step={2} />
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-white mb-1">Your Details</h2>
            <p className="text-white/40 text-sm mb-5">Set up your {ROLES.find(r => r.id === role)?.label} account</p>
            <div className="space-y-4 mb-4">
              <div><label className="text-white/50 text-sm font-semibold block mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                  className="w-full bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"/></div>
              <div><label className="text-white/50 text-sm font-semibold block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"/></div>
              <div><label className="text-white/50 text-sm font-semibold block mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="w-full bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"/></div>
            </div>
            {authError && <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{authError}</div>}
            <button onClick={signUp} className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl hover:scale-[1.02] transition-all shadow-lg">Continue →</button>
          </div>
        </div>
      </div>
    );

    // signup-3: avatar + house
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <button onClick={() => setAuthStep('signup-2')} className="text-white/40 hover:text-white text-sm mb-5 flex items-center gap-2 transition-colors">← Back</button>
          <StepBar step={3} />
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-white mb-1">Your Identity</h2>
            <p className="text-white/40 text-sm mb-5">Pick your avatar{role === 'student' ? ' and house' : ''}</p>
            <AvatarPicker selectedId={avatarId} onChange={setAvatarId} />
            {role === 'student' && (
              <div className="mt-5">
                <label className="text-white/50 text-sm font-semibold block mb-3">School House</label>
                <div className="grid grid-cols-4 gap-2">
                  {HOUSES.map(h => (
                    <button key={h} type="button" onClick={() => setHouse(h)}
                      className={`py-3 rounded-xl text-center border-2 transition-all ${house === h ? 'border-purple-400 bg-purple-500/10 scale-[1.04]' : 'border-white/10 bg-white/4 hover:border-white/25'}`}>
                      <div className="text-xl mb-0.5">{HOUSE_ICONS[h]}</div>
                      <div className="text-white text-xs font-bold">{h}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={signUp} className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-lg rounded-xl hover:scale-[1.02] transition-all shadow-xl shadow-purple-500/20">
              🚀 Create {ROLES.find(r => r.id === role)?.label} Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── APP ROUTES ───────────────────────────────────────────────────
  if (phase === 'arena-hub') return (
    <>{modals}
    <ArenaHub
      onMode={m => setPhase(m === 'lightning' ? 'lightning-calc' : m === 'formation' ? 'formation-mode' : m === 'tug' ? 'tug-war' : 'arena-host')}
      onBack={() => setPhase('home')}
    /></>
  );
  if (phase === 'arena-host')    return <ArenaHostMode onBack={() => setPhase('arena-hub')} />;
  if (phase === 'lightning-calc') return <LightningCalculator onBack={() => setPhase('arena-hub')} />;
  if (phase === 'formation-mode') return <FormationMode onBack={() => setPhase('arena-hub')} />;
  if (phase === 'tug-war')        return <TugOfWar onBack={() => setPhase('arena-hub')} />;
  if (phase === 'quiz-builder')   return <QuizBuilder onSave={q => { setQuizzes(p => [q, ...p]); setTimeout(() => setPhase('home'), 800); }} onBack={() => setPhase('home')} />;
  if (phase === 'quiz-detail' && selectedQuiz) return <QuizDetail quiz={selectedQuiz} onPlay={() => { setGameCode(generateGameCode()); setPhase('lobby'); }} onBack={() => setPhase('home')} />;
  if (phase === 'lobby' && selectedQuiz) return <LobbyPreview quiz={selectedQuiz} gameCode={gameCode} mockUser={mockUser ? { id: mockUser.id, full_name: mockUser.full_name, avatar_id: mockUser.avatar_id } : null} onStartGame={handleStartGame} onBack={() => setPhase('home')} />;
  if (phase === 'question' && selectedQuiz && currentPlayer) {
    const q = selectedQuiz.questions[questionIndex];
    return <QuestionScreen key={`q-${questionIndex}`} question={q} questionNumber={questionIndex+1} totalQuestions={selectedQuiz.questions.length} player={currentPlayer} allPlayers={allPlayers} onAnswer={handleAnswer} quizCoverColor={selectedQuiz.coverColor} />;
  }
  if (phase === 'leaderboard' && selectedQuiz && currentPlayer) return <Leaderboard players={allPlayers} currentPlayer={currentPlayer} questionNumber={questionIndex+1} totalQuestions={selectedQuiz.questions.length} onContinue={handleContinue} isLastQuestion={questionIndex >= selectedQuiz.questions.length - 1} />;
  if (phase === 'podium' && selectedQuiz && currentPlayer) return <Podium players={allPlayers} currentPlayer={currentPlayer} quiz={selectedQuiz} onPlayAgain={() => { setGameCode(generateGameCode()); setCurrentPlayer(null); setAllPlayers([]); setQuestionIndex(0); setPhase('lobby'); }} onHome={goHome} />;

  return (
    <>{modals}
    <HomeScreenPreview
      user={mockUser}
      crestSrc={CREST_B64}
      onStartQuiz={q => { setSelectedQuiz(q); setGameCode(generateGameCode()); setPhase('lobby'); }}
      onViewQuiz={q => { setSelectedQuiz(q); setPhase('quiz-detail'); }}
      onCreateQuiz={() => setPhase('quiz-builder')}
      onArena={() => setPhase('arena-hub')}
      onSignOut={() => { setMockUser(null); setPhase('auth'); }}
      onProfile={() => setShowProfile(true)}
      onStats={() => setShowStats(true)}
      onSettings={() => setShowProfile(true)}
      quizzes={quizLibrary}
    /></>
  );
}
