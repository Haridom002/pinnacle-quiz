import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/supabase';
import AvatarPicker from './AvatarPicker';
import { CARTOON_AVATARS } from '../lib/avatars';

type AuthMode = 'landing' | 'signin' | 'signup';

const ROLES: { id: UserRole; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'student',  label: 'Student',  icon: '🎓', desc: 'Play quizzes & earn XP',      color: 'from-purple-500 to-indigo-600' },
  { id: 'teacher',  label: 'Teacher',  icon: '📋', desc: 'Create & host live quizzes',   color: 'from-blue-500 to-cyan-600' },
  { id: 'parent',   label: 'Parent',   icon: '👨‍👩‍👧', desc: 'Monitor your child\'s progress', color: 'from-green-500 to-emerald-600' },
];

const HOUSES = ['Alpha', 'Beta', 'Gamma', 'Pulsar'] as const;
const HOUSE_ICONS: Record<string, string> = { Alpha: '🏛️', Beta: '⚗️', Gamma: '☢️', Pulsar: '✨' };

export default function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarId, setAvatarId] = useState('0');
  const [house, setHouse] = useState<string>('Alpha');
  const [step, setStep] = useState<1 | 2 | 3>(1); // signup steps
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);


  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const err = await signInWithEmail(email, password);
    setLoading(false);
    if (err) setError(err.message);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (!role) { setError('Please choose a role.'); return; }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!fullName.trim()) { setError('Please enter your name.'); return; }
      if (!email) { setError('Please enter your email.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      setStep(3);
      return;
    }
    // Step 3 — final submit
    setLoading(true);
    const err = await signUpWithEmail(email, password, fullName, role, avatarId, role === 'student' ? house : undefined);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setShowVerify(true);
  };

  // ── VERIFY EMAIL SCREEN ──
  if (showVerify) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6">📬</div>
          <h2 className="text-3xl font-black text-white mb-3">Check your email!</h2>
          <p className="text-white/60 mb-6">We sent a confirmation link to <span className="text-purple-400 font-semibold">{email}</span>. Click it to activate your account, then sign in.</p>
          <button onClick={() => { setMode('signin'); setShowVerify(false); }}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl hover:scale-[1.02] transition-all">
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── LANDING ──
  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col overflow-hidden relative">
        {/* Animated bg */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse"
            style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          {[...Array(25)].map((_, i) => (
            <div key={i} className="absolute rounded-full animate-pulse"
              style={{
                width: `${2+Math.random()*5}px`, height: `${2+Math.random()*5}px`,
                left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                background: ['#7c3aed','#0ea5e9','#f59e0b','#10b981','#f43f5e'][i%5],
                opacity: 0.4 + Math.random()*0.4,
                animationDuration: `${2+Math.random()*4}s`,
                animationDelay: `${Math.random()*3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/40 text-3xl">
              🏔️
            </div>
            <div>
              <div className="text-white font-black text-2xl leading-none">PinnacleQuiz</div>
              <div className="text-purple-400/80 text-sm">Pinnacle Educational Centre</div>
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mb-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-5">
              <span className="animate-pulse">●</span> 2,847 students learning right now
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              Learn Smarter.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
                Play Harder.
              </span>
            </h1>
            <p className="text-white/50 text-lg">
              The competitive quiz & math arena built for JHS learners, teachers, and parents.
            </p>
          </div>

          {/* Avatar showcase */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap max-w-sm">
            {CARTOON_AVATARS.slice(0, 10).map((av, i) => (
              <div key={av.id}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-2xl shadow-md transition-transform hover:scale-110`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: `0 4px 15px ${av.glow}40`,
                }}
              >
                {av.emoji}
              </div>
            ))}
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/40 text-sm font-bold">
              +20
            </div>
          </div>

          {/* CTA buttons */}
          <div className="w-full max-w-sm space-y-3">
            <button onClick={() => setMode('signup')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/30">
              🚀 Get Started — It's Free
            </button>
            <button onClick={() => setMode('signin')}
              className="w-full py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/15 transition-all">
              Already have an account? Sign In
            </button>
            <button onClick={handleGoogleSignIn} disabled={loading}
              className="w-full py-4 bg-white text-gray-800 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-lg disabled:opacity-70">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Role badges */}
          <div className="flex gap-3 mt-8 flex-wrap justify-center">
            {ROLES.map(r => (
              <div key={r.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <span>{r.icon}</span>
                <span className="text-white/60 text-xs font-semibold">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── SIGN IN ──
  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button onClick={() => setMode('landing')} className="text-white/50 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
            ← Back
          </button>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/40">
                🏔️
              </div>
              <h2 className="text-2xl font-black text-white">Welcome back!</h2>
              <p className="text-white/40 text-sm mt-1">Sign in to your PinnacleQuiz account</p>
            </div>

            {/* Google */}
            <button onClick={handleGoogleSignIn} disabled={loading}
              className="w-full py-3.5 bg-white text-gray-800 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-md mb-5 disabled:opacity-70">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10"/>
              <span className="text-white/30 text-xs">or sign in with email</span>
              <div className="flex-1 h-px bg-white/10"/>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm font-semibold block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm font-semibold block mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20">
                {loading ? '⏳ Signing in...' : '→ Sign In'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-5">
              No account?{' '}
              <button onClick={() => { setMode('signup'); setStep(1); }} className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign up free
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── SIGN UP (3 steps) ──
  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <button onClick={() => { if (step > 1) setStep(s => (s - 1) as 1|2|3); else setMode('landing'); }}
          className="text-white/50 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
          ← {step > 1 ? 'Back' : 'Landing'}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-white/10'}`} />
          ))}
          <span className="text-white/40 text-xs ml-2">Step {step}/3</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSignUp}>

            {/* STEP 1: Choose role */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-black text-white mb-2">Who are you?</h2>
                <p className="text-white/40 text-sm mb-6">Your role shapes your experience on PinnacleQuiz</p>

                <div className="space-y-3 mb-6">
                  {ROLES.map(r => (
                    <button key={r.id} type="button"
                      onClick={() => setRole(r.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        role === r.id
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/25'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                        {r.icon}
                      </div>
                      <div>
                        <div className="text-white font-bold">{r.label}</div>
                        <div className="text-white/50 text-xs">{r.desc}</div>
                      </div>
                      {role === r.id && <div className="ml-auto text-purple-400 text-lg">✓</div>}
                    </button>
                  ))}
                </div>

                {/* Google shortcut */}
                <div className="mb-4">
                  <button type="button" onClick={handleGoogleSignIn} disabled={loading}
                    className="w-full py-3 bg-white text-gray-800 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-md disabled:opacity-70 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Quick sign-up with Google
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/10"/>
                  <span className="text-white/30 text-xs">or continue with email</span>
                  <div className="flex-1 h-px bg-white/10"/>
                </div>
              </>
            )}

            {/* STEP 2: Name, email, password */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-black text-white mb-2">Your Details</h2>
                <p className="text-white/40 text-sm mb-6">Set up your {ROLES.find(r=>r.id===role)?.label} account</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm font-semibold block mb-1.5">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm font-semibold block mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm font-semibold block mb-1.5">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Avatar + House (students) */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-black text-white mb-2">Your Identity</h2>
                <p className="text-white/40 text-sm mb-5">Pick your avatar{role === 'student' ? ' and house' : ''}</p>
                <AvatarPicker selectedId={avatarId} onChange={setAvatarId} />
                {role === 'student' && (
                  <div className="mt-5">
                    <label className="text-white/60 text-sm font-semibold block mb-3">School House</label>
                    <div className="grid grid-cols-4 gap-2">
                      {HOUSES.map(h => (
                        <button key={h} type="button"
                          onClick={() => setHouse(h)}
                          className={`py-3 rounded-xl text-center border-2 transition-all ${
                            house === h ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'
                          }`}
                        >
                          <div className="text-xl mb-1">{HOUSE_ICONS[h]}</div>
                          <div className="text-white text-xs font-bold">{h}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-purple-500/20">
              {loading ? '⏳ Creating account...' : step < 3 ? 'Continue →' : `🚀 Create ${ROLES.find(r=>r.id===role)?.label} Account`}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-5">
            Have an account?{' '}
            <button onClick={() => setMode('signin')} className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
