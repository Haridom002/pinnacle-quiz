import { useState, useEffect, useRef } from 'react';
import { MathOperation, DifficultyLevel, MathQuestion } from '../types';
import { generateMathQuestion, getComboMultiplier, calculateXP, getLevelFromXP } from '../utils/mathEngine';
import { soundEngine } from '../utils/soundEngine';
import { getAvatar, CARTOON_AVATARS } from '../lib/avatars';
import MusicPlayer from './MusicPlayer';
import ParticleExplosion from './ParticleExplosion';

interface Props { onBack: () => void; }

type Phase = 'landing' | 'host-setup' | 'join' | 'lobby' | 'countdown' | 'playing' | 'between' | 'podium';

const HOUSES = [
  { id:'Alpha',  color:'#ef4444', bg:'from-red-600 to-red-900',     icon:'🔴', motto:'Strength & Honor' },
  { id:'Beta',   color:'#3b82f6', bg:'from-blue-600 to-blue-900',   icon:'🔵', motto:'Wisdom & Truth' },
  { id:'Gamma',  color:'#10b981', bg:'from-green-600 to-green-900', icon:'🟢', motto:'Growth & Unity' },
  { id:'Pulsar', color:'#f59e0b', bg:'from-amber-500 to-yellow-700',icon:'🟡', motto:'Speed & Light' },
];

const NICKNAME_SUGGESTIONS = [
  'MathKing','SpeedStar','NumberNinja','QuickBrain','LightningBoy',
  'GeniusGirl','MathDestroyer','BrainStorm','AlgebraAce','SpeedCalc',
  'ComboKing','ArenaChamp','MathWizard','ThinkFast','NumberCrusher',
  'CalcMaster','SwiftMind','MathHero','RapidFire','Equation X',
];

// ALL roles can host or join — no restrictions
const ROLE_LABELS: Record<string,{icon:string;label:string}> = {
  student: { icon:'🎓', label:'Student' },
  teacher: { icon:'📋', label:'Teacher' },
  parent:  { icon:'👨‍👩‍👧', label:'Parent' },
  guest:   { icon:'👁️', label:'Guest' },
};

const QUICK_REACTIONS = ['🔥','😎','💯','⚡','🚀','👑','🎯','💪','😤','🤩'];
const QUICK_MESSAGES  = ["Easy!","Let's go!","Too fast!","I'm winning!","🔥 On fire!","Next one!","Watch me!","COMBO!"];

const ENCOURAGEMENTS_WIN  = ['🏆 Math Champion! Incredible!','⚡ Unstoppable genius!','🥇 Born to calculate!'];
const ENCOURAGEMENTS_MID  = ['⭐ Great improvement!','💪 Nearly there — push harder!','🎯 Fantastic accuracy!'];
const ENCOURAGEMENTS_LOSS = ['💡 Next round is yours!','🚀 Keep pushing — you\'re improving!','😤 Use your speed next time!'];

interface LivePlayer {
  id: string; nickname: string; house: string; avatarId: string; role: string;
  score: number; combo: number; streak: number; accuracy: number;
  totalAnswered: number; correctCount: number; lastPoints: number;
  speedMs: number; rank: number; isHost: boolean;
  reactions: string[]; xp: number; level: number;
}

function generateRoomCode() { return Math.floor(100000 + Math.random() * 900000).toString(); }

function makeBotPlayer(i: number): LivePlayer {
  const houses = ['Alpha','Beta','Gamma','Pulsar'];
  return {
    id: `bot-${i}`, nickname: NICKNAME_SUGGESTIONS[i % NICKNAME_SUGGESTIONS.length],
    house: houses[i % 4], avatarId: String(Math.floor(Math.random() * CARTOON_AVATARS.length)),
    role: 'student', score:0, combo:0, streak:0, accuracy:0,
    totalAnswered:0, correctCount:0, lastPoints:0, speedMs:0,
    rank: i+2, isHost:false, reactions:[], xp:0, level:1,
  };
}

export default function ArenaHostMode({ onBack }: Props) {
  const [phase,          setPhase]          = useState<Phase>('landing');
  const [isHost,         setIsHost]         = useState(false);
  const [roomCode,       setRoomCode]       = useState('');
  const [joinCode,       setJoinCode]       = useState('');
  const [joinError,      setJoinError]      = useState('');
  const [nickname,       setNickname]       = useState('');
  const [selectedHouse,  setSelectedHouse]  = useState('Alpha');
  const [selectedAvatar, setSelectedAvatar] = useState('0');
  const [players,        setPlayers]        = useState<LivePlayer[]>([]);
  const [myPlayer,       setMyPlayer]       = useState<LivePlayer|null>(null);
  const [question,       setQuestion]       = useState<MathQuestion|null>(null);
  const [questionNum,    setQuestionNum]    = useState(0);
  const totalQuestions = 10;
  const [timeLeft,       setTimeLeft]       = useState(0);
  const [answered,       setAnswered]       = useState(false);
  const [userInput,      setUserInput]      = useState('');
  const [feedback,       setFeedback]       = useState<'correct'|'wrong'|null>(null);
  const [scorePopup,     setScorePopup]     = useState<{v:string;correct:boolean}|null>(null);
  const [countdownVal,   setCountdownVal]   = useState(3);
  const [operation,      setOperation]      = useState<MathOperation>('mixed');
  const [difficulty,     setDifficulty]     = useState<DifficultyLevel>('intermediate');
  const [showParticle,   setShowParticle]   = useState(false);
  const [reactions,      setReactions]      = useState<{emoji:string;x:number;y:number;id:number}[]>([]);
  const [leaderboardAnim,setLeaderboardAnim]= useState(false);
  const [mvp,            setMvp]            = useState<LivePlayer|null>(null);
  const [roundWinner,    setRoundWinner]    = useState<LivePlayer|null>(null);
  const [hostMsg,        setHostMsg]        = useState('');
  const [hostMsgVisible, setHostMsgVisible] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const botTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Game logic ──────────────────────────────────────────────────
  const nextQuestion = () => {
    const q = generateMathQuestion(operation, difficulty);
    setQuestion(q); setTimeLeft(q.timeLimit);
    setUserInput(''); setFeedback(null); setAnswered(false);
    setQuestionNum(n => n+1); setScorePopup(null);
    simulateBots(q);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const simulateBots = (q: MathQuestion) => {
    setPlayers(prev => {
      const bots = prev.filter(p => p.id !== myPlayer?.id);
      bots.forEach(p => {
        const correct = Math.random() < 0.70;
        const delay   = 900 + Math.random() * q.timeLimit * 700;
        const t = setTimeout(() => {
          const pts = correct ? Math.floor((q.points + (1 - delay/(q.timeLimit*1000))*400) * getComboMultiplier(p.combo + (correct?1:0))) : 0;
          setPlayers(pp => pp.map(pl => {
            if (pl.id !== p.id) return pl;
            const nc = correct ? pl.combo+1 : 0;
            const nCr = pl.correctCount + (correct?1:0);
            const nTo = pl.totalAnswered+1;
            return { ...pl, score:pl.score+pts, combo:nc, streak:correct?pl.streak+1:0,
              lastPoints:pts, totalAnswered:nTo, correctCount:nCr,
              accuracy:Math.round((nCr/nTo)*100), xp:pl.xp+calculateXP(pts,nc,correct),
              level:getLevelFromXP(pl.xp+calculateXP(pts,nc,correct)) };
          }));
        }, delay);
        botTimers.current.push(t);
      });
      return prev;
    });
  };

  // Timer
  useEffect(() => {
    if (phase!=='playing'||answered) return;
    if (timeLeft<=0) {
      setAnswered(true);
      if (!feedback) { setFeedback('wrong'); soundEngine.wrong(); }
      setTimeout(() => advanceRound(), 1600);
      return;
    }
    if (timeLeft<=3) soundEngine.timerWarning();
    timerRef.current = setTimeout(() => setTimeLeft(t => t-0.1), 100);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, phase, answered]);

  const advanceRound = () => {
    botTimers.current.forEach(clearTimeout); botTimers.current=[];
    const sorted = [...players].sort((a,b)=>b.score-a.score);
    setRoundWinner(sorted[0]);
    setLeaderboardAnim(true);
    soundEngine.leaderboardReveal();
    if (questionNum >= totalQuestions) {
      setTimeout(()=>{
        setMvp(sorted[0]);
        setPhase('podium');
        soundEngine.startBgMusic('victory');
        soundEngine.victory();
        soundEngine.crowd();
      }, 1600);
    } else {
      setPhase('between');
      setTimeout(()=>{ setPhase('playing'); setLeaderboardAnim(false); nextQuestion(); }, 4200);
    }
  };

  const handleSubmit = () => {
    if (!question||answered) return;
    const val = parseInt(userInput.trim(),10);
    if (isNaN(val)) return;
    const isCorrect  = val === question.answer;
    const timeTaken  = question.timeLimit - timeLeft;
    const speedBonus = Math.floor((1 - timeTaken/question.timeLimit)*450);
    const myCombo    = myPlayer?.combo ?? 0;
    const newCombo   = isCorrect ? myCombo+1 : 0;
    const pts        = isCorrect ? Math.floor((question.points+speedBonus)*getComboMultiplier(newCombo)) : 0;
    const earnedXP   = calculateXP(pts, newCombo, isCorrect);

    setAnswered(true);
    setFeedback(isCorrect?'correct':'wrong');
    setScorePopup({ v: isCorrect?`+${pts.toLocaleString()}`:`✗ ${question.answer}`, correct: isCorrect });

    if (isCorrect) {
      soundEngine.correct();
      if (newCombo>=3) { soundEngine.combo(newCombo); setShowParticle(true); setTimeout(()=>setShowParticle(false),900); }
      if (newCombo>=5) soundEngine.hype();
      soundEngine.xpGain();
    } else {
      soundEngine.wrong();
    }

    const updater = (p: LivePlayer): LivePlayer => {
      if (p.id !== myPlayer?.id) return p;
      const nCr = p.correctCount+(isCorrect?1:0);
      const nTo = p.totalAnswered+1;
      return { ...p, score:p.score+pts, combo:newCombo, streak:isCorrect?p.streak+1:0,
        lastPoints:pts, totalAnswered:nTo, correctCount:nCr,
        accuracy:Math.round((nCr/nTo)*100),
        xp:p.xp+earnedXP, level:getLevelFromXP(p.xp+earnedXP) };
    };
    setMyPlayer(mp => mp ? updater(mp) : mp);
    setPlayers(prev => prev.map(updater));
    setTimeout(()=>advanceRound(), isCorrect?1300:1700);
  };

  const handleReaction = (emoji:string) => {
    soundEngine.click();
    const id = Date.now();
    setReactions(r => [...r, { emoji, x:5+Math.random()*90, y:10+Math.random()*75, id }]);
    setTimeout(()=>setReactions(r=>r.filter(x=>x.id!==id)),2500);
  };

  const sendHostMsg = (msg:string) => {
    setHostMsg(msg); setHostMsgVisible(true);
    setTimeout(()=>setHostMsgVisible(false),3000);
  };

  // Countdown
  useEffect(()=>{
    if (phase!=='countdown') return;
    if (countdownVal<=0) {
      setPhase('playing'); soundEngine.startBgMusic('lightning'); nextQuestion(); return;
    }
    soundEngine.countdown(countdownVal);
    const t=setTimeout(()=>setCountdownVal(v=>v-1),1000);
    return ()=>clearTimeout(t);
  }, [phase,countdownVal]);

  const startGame = () => { setCountdownVal(3); setPhase('countdown'); };

  const joinGame = () => {
    if (joinCode.length!==6) { setJoinError('Enter the 6-digit room code'); return; }
    if (!nickname.trim())    { setJoinError('Choose a nickname'); return; }
    setJoinError('');
    const me: LivePlayer = {
      id:'player-me', nickname:nickname.trim(), house:selectedHouse,
      avatarId:selectedAvatar, role:'student',
      score:0,combo:0,streak:0,accuracy:0,totalAnswered:0,correctCount:0,
      lastPoints:0,speedMs:0,rank:1,isHost:false,reactions:[],xp:0,level:1,
    };
    setMyPlayer(me); setRoomCode(joinCode);
    const bots = Array.from({length:6},(_,i)=>makeBotPlayer(i));
    setPlayers([me,...bots]);
    soundEngine.joinRoom();
    setPhase('lobby');
  };

  const createRoom = () => {
    if (!nickname.trim()) return;
    const code = generateRoomCode();
    setRoomCode(code); setIsHost(true);
    const me: LivePlayer = {
      id:'player-host', nickname:nickname.trim(), house:selectedHouse,
      avatarId:selectedAvatar, role:'host',
      score:0,combo:0,streak:0,accuracy:0,totalAnswered:0,correctCount:0,
      lastPoints:0,speedMs:0,rank:1,isHost:true,reactions:[],xp:0,level:1,
    };
    setMyPlayer(me); setPlayers([me]);
    soundEngine.startBgMusic('home');
    setPhase('lobby');
    // Simulate players joining
    const delays=[1800,3200,5000,6600,8200,9800];
    delays.forEach((d,i)=>{
      setTimeout(()=>{
        const bot=makeBotPlayer(i);
        setPlayers(prev=>[...prev,bot]);
        soundEngine.joinRoom();
      }, d);
    });
  };

  // Derived
  const sortedPlayers = [...players].sort((a,b)=>b.score-a.score).map((p,i)=>({...p,rank:i+1}));
  const myRank = sortedPlayers.findIndex(p=>p.id===myPlayer?.id)+1;
  const houseScores: Record<string,number> = {};
  sortedPlayers.forEach(p=>{houseScores[p.house]=(houseScores[p.house]??0)+p.score;});
  const topHouse = Object.entries(houseScores).sort((a,b)=>b[1]-a[1])[0];

  const numpad = ['7','8','9','4','5','6','1','2','3','0','-','⌫'];
  const handleNumpad = (k:string) => {
    if(k==='⌫')setUserInput(i=>i.slice(0,-1));
    else if(k==='-')setUserInput(i=>i.startsWith('-')?i.slice(1):'-'+i);
    else setUserInput(i=>i.length<6?i+k:i);
  };

  // ════════════════════════════════════════════════════════════════
  // LANDING
  if (phase==='landing') return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        {['#ef4444','#3b82f6','#10b981','#f59e0b'].map((c,i)=>(
          <div key={i} className="absolute w-80 h-80 rounded-full opacity-10 animate-pulse"
            style={{background:`radial-gradient(circle,${c},transparent)`,left:`${i*25}%`,top:'50%',transform:'translateY(-50%)',animationDelay:`${i*0.8}s`}}/>
        ))}
      </div>
      <div className="relative z-10 w-full max-w-md">
        <button onClick={onBack} className="text-white/35 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors">← Back to Arena</button>

        <div className="text-center mb-10">
          <div className="text-6xl mb-3">⚡</div>
          <h1 className="text-5xl font-black text-white mb-2" style={{textShadow:'0 0 40px #f59e0b60'}}>Live Arena</h1>
          <p className="text-white/40">Real-time multiplayer math battles</p>
          <div className="flex justify-center gap-2 mt-3">
            {HOUSES.map(h=>(<div key={h.id} className="w-9 h-9 rounded-xl flex items-center justify-center text-xl border" style={{background:h.color+'18',borderColor:h.color+'40'}}>{h.icon}</div>))}
          </div>
        </div>

        {/* WHO CAN HOST notice */}
        <div className="bg-purple-500/10 border border-purple-400/25 rounded-2xl p-4 mb-6 text-center">
          <div className="text-purple-300 text-sm font-bold mb-1">🌐 Open to Everyone</div>
          <div className="text-white/40 text-xs">Teachers, parents, students & guests can all host or join — everyone plays together!</div>
          <div className="flex justify-center gap-2 mt-2">
            {Object.values(ROLE_LABELS).map(r=>(
              <span key={r.label} className="text-xs bg-white/8 border border-white/10 px-2 py-1 rounded-full text-white/50">{r.icon} {r.label}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={()=>setPhase('host-setup')}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/25 to-indigo-700/25 border-2 border-purple-400/40 hover:border-purple-400 hover:scale-[1.02] transition-all text-left group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎮</div>
            <div className="text-white font-black text-lg leading-tight">Host a Game</div>
            <div className="text-white/40 text-xs mt-1">Create a room, invite everyone</div>
          </button>
          <button onClick={()=>setPhase('join')}
            className="p-6 rounded-2xl bg-gradient-to-br from-yellow-600/25 to-orange-700/25 border-2 border-yellow-400/40 hover:border-yellow-400 hover:scale-[1.02] transition-all text-left group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🚀</div>
            <div className="text-white font-black text-lg leading-tight">Join a Game</div>
            <div className="text-white/40 text-xs mt-1">Enter 6-digit code</div>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[['⚡','Live Now','247 rooms'],['👥','Playing','1,842 users'],['🏆','Today','34K battles']].map(([icon,k,v])=>(
            <div key={k} className="bg-white/4 border border-white/8 rounded-2xl p-3 text-center">
              <div className="text-xl mb-0.5">{icon}</div>
              <div className="text-white font-black text-sm">{v}</div>
              <div className="text-white/30 text-xs">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // HOST SETUP
  if (phase==='host-setup') return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-8 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={()=>setPhase('landing')} className="text-white/40 hover:text-white text-sm flex items-center gap-2 transition-colors">← Back</button>
          <MusicPlayer category="home" compact/>
        </div>
        <h2 className="text-3xl font-black text-white mb-6">🎮 Create a Room</h2>
        <div className="bg-green-500/10 border border-green-400/25 rounded-2xl p-3 mb-5 text-center text-sm text-green-300">
          ✅ Any role can host — Teachers, Parents, Students & Guests welcome!
        </div>

        {/* Nickname */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Your Nickname</label>
          <div className="flex gap-2">
            <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="e.g. MathKing..." maxLength={20}
              className="flex-1 bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"/>
            <button onClick={()=>setNickname(NICKNAME_SUGGESTIONS[Math.floor(Math.random()*NICKNAME_SUGGESTIONS.length)])}
              className="px-3 py-3 bg-white/8 border border-white/15 text-white/50 rounded-xl hover:bg-white/15 transition-all" title="Random name">🎲</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {NICKNAME_SUGGESTIONS.slice(0,6).map(n=>(
              <button key={n} onClick={()=>setNickname(n)} className="text-xs px-2.5 py-1 bg-white/5 border border-white/8 text-white/40 rounded-full hover:bg-white/12 hover:text-white/70 transition-all">{n}</button>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Pick Avatar</label>
          <div className="grid grid-cols-8 gap-1.5">
            {CARTOON_AVATARS.slice(0,16).map(av=>{
              const a = getAvatar(av.id);
              return (
                <button key={av.id} onClick={()=>setSelectedAvatar(av.id)}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 ${selectedAvatar===av.id?'ring-2 ring-yellow-400 scale-110':''}`}
                  style={selectedAvatar===av.id?{boxShadow:`0 0 12px ${a.glow}`}:{}}>{av.emoji}</button>
              );
            })}
          </div>
        </div>

        {/* House */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Your House</label>
          <div className="grid grid-cols-2 gap-3">
            {HOUSES.map(h=>(
              <button key={h.id} onClick={()=>setSelectedHouse(h.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedHouse===h.id?'scale-[1.02]':''}`}
                style={{borderColor:selectedHouse===h.id?h.color:h.color+'35',background:selectedHouse===h.id?h.color+'20':h.color+'08'}}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-2xl">{h.icon}</span>
                  <span className="text-white font-black">{h.id}</span>
                  {selectedHouse===h.id&&<span className="ml-auto" style={{color:h.color}}>✓</span>}
                </div>
                <div className="text-white/35 text-xs italic">"{h.motto}"</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game settings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Operation</label>
            <select value={operation} onChange={e=>setOperation(e.target.value as MathOperation)}
              className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm">
              <option value="mixed">🔀 Mixed</option>
              <option value="multiply">✖️ Multiply</option>
              <option value="add">➕ Addition</option>
              <option value="subtract">➖ Subtract</option>
              <option value="divide">➗ Division</option>
            </select>
          </div>
          <div>
            <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Difficulty</label>
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm">
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🔵 Intermediate</option>
              <option value="advanced">🟡 Advanced</option>
              <option value="genius">🔴 Genius</option>
            </select>
          </div>
        </div>

        <button onClick={createRoom} disabled={!nickname.trim()}
          className="w-full py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed">
          🎮 Create Room & Get Code
        </button>
      </div>
    </div>
  );

  // JOIN
  if (phase==='join') return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={()=>setPhase('landing')} className="text-white/40 hover:text-white text-sm flex items-center gap-2 transition-colors">← Back</button>
          <MusicPlayer category="home" compact/>
        </div>
        <div className="text-center mb-7">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-3xl font-black text-white mb-1">Join a Game</h2>
          <p className="text-white/40 text-sm">Enter the room code from your host</p>
        </div>

        {/* PIN display */}
        <div className="mb-6">
          <label className="text-white/40 text-xs font-bold tracking-widest uppercase block mb-3 text-center">6-DIGIT ROOM CODE</label>
          <div className="flex gap-2 justify-center mb-3">
            {[0,1,2,3,4,5].map(i=>(
              <div key={i} className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                joinCode[i] ? 'border-yellow-400 bg-yellow-400/10 text-white' : 'border-white/12 bg-white/4 text-white/20'
              }`} style={{height:'52px'}}>{joinCode[i]??'·'}</div>
            ))}
          </div>
          <input value={joinCode} onChange={e=>{setJoinCode(e.target.value.replace(/\D/g,'').slice(0,6));setJoinError('');}}
            placeholder="Type 6-digit code" maxLength={6} inputMode="numeric"
            className="w-full bg-white/8 border-2 border-white/15 text-white text-center text-3xl font-black placeholder-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all tracking-[0.3em]"/>
        </div>

        {/* Nickname */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Nickname</label>
          <div className="flex gap-2">
            <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="MathKing..." maxLength={20}
              className="flex-1 bg-white/8 border border-white/15 text-white placeholder-white/25 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"/>
            <button onClick={()=>setNickname(NICKNAME_SUGGESTIONS[Math.floor(Math.random()*NICKNAME_SUGGESTIONS.length)])}
              className="px-3 bg-white/8 border border-white/15 text-white/50 rounded-xl hover:bg-white/15">🎲</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {NICKNAME_SUGGESTIONS.slice(0,5).map(n=>(
              <button key={n} onClick={()=>setNickname(n)} className="text-xs px-2 py-1 bg-white/5 border border-white/8 text-white/40 rounded-full hover:bg-white/12 transition-all">{n}</button>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Avatar</label>
          <div className="grid grid-cols-8 gap-1.5">
            {CARTOON_AVATARS.slice(0,16).map(av=>{
              const a=getAvatar(av.id);
              return (
                <button key={av.id} onClick={()=>setSelectedAvatar(av.id)}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl transition-all hover:scale-110 ${selectedAvatar===av.id?'ring-2 ring-yellow-400 scale-110':''}`}
                  style={selectedAvatar===av.id?{boxShadow:`0 0 12px ${a.glow}`}:{}}>{av.emoji}</button>
              );
            })}
          </div>
        </div>

        {/* House */}
        <div className="mb-6">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Your House</label>
          <div className="grid grid-cols-4 gap-2">
            {HOUSES.map(h=>(
              <button key={h.id} onClick={()=>setSelectedHouse(h.id)}
                className={`py-3 rounded-xl border-2 text-center transition-all ${selectedHouse===h.id?'scale-105':''}`}
                style={{borderColor:selectedHouse===h.id?h.color:h.color+'35',background:selectedHouse===h.id?h.color+'20':'transparent'}}>
                <div className="text-xl mb-0.5">{h.icon}</div>
                <div className="text-xs font-bold text-white">{h.id}</div>
              </button>
            ))}
          </div>
        </div>

        {joinError&&<div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">⚠ {joinError}</div>}
        <button onClick={joinGame}
          className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-yellow-500/25">
          🚀 Join Game!
        </button>
      </div>
    </div>
  );

  // LOBBY
  if (phase==='lobby') return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      <div className="bg-black/50 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-white/35 hover:text-white text-sm transition-colors">✕ Exit</button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <span className="text-green-400 text-xs font-bold tracking-wider">LIVE LOBBY</span>
        </div>
        <MusicPlayer category="home" compact/>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 overflow-y-auto">
        {/* Room code */}
        <div className="text-center mb-7">
          <p className="text-white/35 text-xs font-bold tracking-widest uppercase mb-3">Room PIN — Share with players</p>
          <div className="inline-flex items-center gap-3 bg-white/6 border-2 border-yellow-400/50 rounded-2xl px-8 py-4 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={()=>{navigator.clipboard.writeText(roomCode).catch(()=>{})}}>
            <span className="text-white font-black text-5xl tracking-[0.3em]">{roomCode}</span>
            <span className="text-yellow-400/60 text-sm">📋</span>
          </div>
          <p className="text-white/25 text-xs mt-2">Tap to copy · Enter this code at pinnacle.quiz</p>
        </div>

        {/* House tiles */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {HOUSES.map(h=>{
            const count = players.filter(p=>p.house===h.id).length;
            return (
              <div key={h.id} className="p-3 rounded-2xl border text-center" style={{borderColor:h.color+'35',background:h.color+'0d'}}>
                <div className="text-2xl mb-0.5">{h.icon}</div>
                <div className="text-white font-bold text-xs">{h.id}</div>
                <div className="font-black text-xl" style={{color:h.color}}>{count}</div>
                <div className="text-white/25 text-xs">players</div>
              </div>
            );
          })}
        </div>

        {/* Player grid */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">{players.length} Players in Lobby</h3>
            {isHost&&<div className="text-green-400 text-xs font-bold animate-pulse">● Waiting for players to join...</div>}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto scrollbar-hide">
            {players.map((p)=>{
              const av=getAvatar(p.avatarId);
              const house=HOUSES.find(h=>h.id===p.house);
              const isMe=p.id===myPlayer?.id;
              return (
                <div key={p.id} className={`p-3 rounded-xl border text-center animate-fade-in ${isMe?'border-yellow-400/50 bg-yellow-400/8':'border-white/8 bg-white/3'}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-2xl mx-auto mb-1.5`}
                    style={isMe?{boxShadow:`0 0 14px ${av.glow}`}:{}}>{av.emoji}</div>
                  <div className="text-white text-xs font-bold truncate">{p.nickname}</div>
                  <div className="text-xs mt-0.5" style={{color:house?.color}}>{house?.icon} {p.house}</div>
                  {isMe&&<div className="text-yellow-400 text-xs font-black mt-0.5">YOU</div>}
                  {p.isHost&&<div className="text-purple-400 text-xs">👑 Host</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Host controls */}
        {isHost ? (
          <div className="space-y-3">
            {/* Quick messages for host */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_MESSAGES.slice(0,4).map(m=>(
                <button key={m} onClick={()=>sendHostMsg(m)}
                  className="text-xs px-2.5 py-1.5 bg-white/8 border border-white/10 text-white/60 rounded-full hover:bg-white/15 hover:text-white transition-all">
                  💬 {m}
                </button>
              ))}
            </div>
            <button onClick={startGame} disabled={players.length<2}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-500/25 disabled:opacity-40">
              🚀 Start Game ({players.length} players)
            </button>
          </div>
        ) : (
          <div className="w-full py-5 bg-white/4 border border-white/10 text-white/50 font-bold text-center rounded-2xl text-sm">
            ⏳ Waiting for the host to start…
          </div>
        )}
      </div>
    </div>
  );

  // COUNTDOWN
  if (phase==='countdown') return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 text-lg font-bold uppercase tracking-widest mb-4">Game starts in</p>
        <div className="text-[10rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-500">
          {countdownVal}
        </div>
        <div className="flex gap-3 justify-center mt-6">
          {HOUSES.map(h=>(<div key={h.id} className="text-center"><div className="text-2xl mb-0.5">{h.icon}</div><div className="text-xs font-bold" style={{color:h.color}}>{players.filter(p=>p.house===h.id).length}p</div></div>))}
        </div>
        <p className="text-white/40 mt-4 text-sm">{players.length} players ready! Get your fingers ready!</p>
      </div>
    </div>
  );

  // BETWEEN rounds leaderboard
  if (phase==='between') return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      <div className="text-center py-5 border-b border-white/10 bg-black/30">
        <p className="text-white/35 text-xs uppercase tracking-widest mb-1">Round {questionNum} of {totalQuestions}</p>
        <h2 className="text-white font-black text-2xl">🏆 Leaderboard</h2>
        {roundWinner&&<p className="text-yellow-400 text-sm mt-1 font-bold">⚡ Fastest: {roundWinner.nickname}</p>}
      </div>
      <div className="max-w-2xl mx-auto w-full px-4 py-4 flex-1 overflow-y-auto">
        {/* House scores */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {HOUSES.map(h=>(
            <div key={h.id} className="p-3 rounded-2xl border text-center" style={{borderColor:h.color+'35',background:h.color+'0d'}}>
              <div className="text-xl">{h.icon}</div>
              <div className="font-black text-lg" style={{color:h.color}}>{(houseScores[h.id]??0).toLocaleString()}</div>
              <div className="text-white/30 text-xs">{h.id}</div>
            </div>
          ))}
        </div>
        {/* Players */}
        <div className="space-y-2">
          {sortedPlayers.slice(0,8).map((p,i)=>{
            const av=getAvatar(p.avatarId);
            const house=HOUSES.find(h=>h.id===p.house);
            const isMe=p.id===myPlayer?.id;
            return (
              <div key={p.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${leaderboardAnim?'animate-slide-up':''} ${isMe?'border-yellow-400/35 bg-yellow-400/6':'border-white/8 bg-white/3'}`}
                style={{animationDelay:`${i*0.07}s`}}>
                <div className="w-8 text-center font-black text-sm flex-shrink-0"
                  style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'rgba(255,255,255,0.35)'}}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl flex-shrink-0`}>{av.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm flex items-center gap-1.5">
                    {p.nickname}{isMe&&<span className="text-yellow-400 text-xs">(you)</span>}
                    {p.streak>=3&&<span className="text-orange-400 text-xs">🔥{p.streak}x</span>}
                  </div>
                  <div className="text-xs text-white/30 flex items-center gap-2">
                    <span style={{color:house?.color}}>{house?.icon}{p.house}</span>
                    <span>✓{p.accuracy}%</span>
                    {p.combo>=2&&<span className="text-yellow-400">💥{p.combo}x</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-black">{p.score.toLocaleString()}</div>
                  {p.lastPoints>0&&<div className="text-green-400 text-xs font-bold">+{p.lastPoints}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-4 border-t border-white/8 text-center">
        <div className="text-white/35 text-sm animate-pulse">⏳ Next question in 4 seconds…</div>
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({length:totalQuestions}).map((_,i)=>(
            <div key={i} className={`h-1.5 w-5 rounded-full ${i<questionNum?'bg-purple-500':i===questionNum?'bg-yellow-400 animate-pulse':'bg-white/12'}`}/>
          ))}
        </div>
      </div>
    </div>
  );

  // PLAYING
  if (phase==='playing'&&question) {
    const timerPct = (timeLeft/question.timeLimit)*100;
    const timerColor = timerPct>60?'#10b981':timerPct>30?'#f59e0b':'#ef4444';
    const myAv = getAvatar(myPlayer?.avatarId??'0');
    const myHouse = HOUSES.find(h=>h.id===myPlayer?.house);

    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col select-none">
        {showParticle&&(
          <div className="fixed inset-0 pointer-events-none z-50">
            <ParticleExplosion active x={50} y={35} count={35} colors={['#f59e0b','#fbbf24','#fff','#10b981']} onComplete={()=>setShowParticle(false)}/>
          </div>
        )}
        {reactions.map(r=>(
          <div key={r.id} className="fixed z-50 pointer-events-none text-3xl animate-float-up" style={{left:`${r.x}%`,top:`${r.y}%`}}>{r.emoji}</div>
        ))}
        {hostMsgVisible&&(
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-purple-600/90 border border-purple-400/40 text-white font-bold px-5 py-2.5 rounded-2xl shadow-xl animate-slide-up">
            👑 Host: {hostMsg}
          </div>
        )}

        {/* Header */}
        <div className="bg-black/50 border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${myAv.bg} flex items-center justify-center text-xl`}>{myAv.emoji}</div>
            <div>
              <div className="text-white text-xs font-bold leading-none">{myPlayer?.nickname}</div>
              <div className="text-xs font-bold leading-none mt-0.5" style={{color:myHouse?.color}}>#{myRank} · {myHouse?.icon}{myHouse?.id}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/35 text-xs">Q {questionNum}/{totalQuestions}</div>
            <div className="text-white font-black text-sm">{myPlayer?.score.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            {(myPlayer?.combo??0)>=2&&<div className="text-yellow-400 font-black text-sm animate-pulse">🔥{myPlayer?.combo}x</div>}
            <MusicPlayer category="lightning" compact/>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-0.5 px-4 py-1.5 bg-black/25">
          {Array.from({length:totalQuestions}).map((_,i)=>(
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i<questionNum-1?'bg-purple-500':i===questionNum-1?'bg-yellow-400':'bg-white/10'}`}/>
          ))}
        </div>

        {/* Mini leaderboard */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-black/20">
          {sortedPlayers.slice(0,6).map((p,i)=>{
            const av2=getAvatar(p.avatarId);
            return (
              <div key={p.id} className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border ${p.id===myPlayer?.id?'border-yellow-400/35 bg-yellow-400/6':'border-white/5 bg-white/3'}`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${av2.bg} flex items-center justify-center text-lg`}>{av2.emoji}</div>
                <div className="text-white/65 text-xs font-bold truncate max-w-[52px]">{p.nickname.slice(0,6)}</div>
                <div className="text-xs font-black" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':'rgba(255,255,255,0.7)'}}>{p.score.toLocaleString()}</div>
              </div>
            );
          })}
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-3">
          <div className="w-full max-w-lg">
            {/* Timer ring */}
            <div className="flex justify-center mb-5">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke={timerColor} strokeWidth="6"
                    strokeDasharray={`${2*Math.PI*34}`}
                    strokeDashoffset={`${2*Math.PI*34*(1-timerPct/100)}`}
                    style={{transition:'stroke-dashoffset 0.1s linear,stroke 0.3s'}}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{Math.ceil(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Question card */}
            <div className={`text-center p-7 rounded-3xl border-2 mb-5 relative transition-all ${
              feedback==='correct'?'border-green-400 bg-green-400/8':feedback==='wrong'?'border-red-400 bg-red-400/8':'border-white/12 bg-white/3'
            }`}>
              <div className="text-5xl md:text-6xl font-black text-white">
                {question.question} = ?
              </div>
              {scorePopup&&(
                <div className={`absolute top-3 right-4 text-2xl font-black animate-bounce ${scorePopup.correct?'text-green-400':'text-red-400'}`}>
                  {scorePopup.v}
                </div>
              )}
              {feedback&&(
                <div className={`mt-3 text-base font-bold ${feedback==='correct'?'text-green-400':'text-red-400'}`}>
                  {feedback==='correct'
                    ? (myPlayer&&myPlayer.streak>=5?ENCOURAGEMENTS_WIN[0]:'⚡ Correct! Speed bonus earned!')
                    : `✗ Answer: ${question.answer} · ${ENCOURAGEMENTS_LOSS[Math.floor(Math.random()*ENCOURAGEMENTS_LOSS.length)]}`}
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <input ref={inputRef} type="number" value={userInput}
                onChange={e=>setUserInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                placeholder="Your answer…" disabled={answered}
                className="flex-1 bg-white/8 border-2 text-white text-2xl font-black rounded-2xl px-4 py-3 outline-none transition-colors placeholder-white/18"
                style={{borderColor:answered?(feedback==='correct'?'#10b981':'#ef4444'):'rgba(255,255,255,0.15)'}}/>
              <button onClick={handleSubmit} disabled={answered||!userInput}
                className="px-6 py-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-black font-black rounded-2xl disabled:opacity-30 hover:scale-105 active:scale-95 transition-all text-xl">
                GO!
              </button>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {numpad.map(k=>(
                <button key={k} onClick={()=>{soundEngine.click();handleNumpad(k);}} disabled={answered}
                  className={`py-3.5 rounded-xl font-black text-xl transition-all active:scale-95 disabled:opacity-30 ${
                    k==='⌫'?'bg-red-500/18 text-red-400 border border-red-500/22':
                    k==='-'?'bg-blue-500/18 text-blue-400 border border-blue-500/22':
                    'bg-white/7 text-white border border-white/8 hover:bg-white/14'
                  }`}>{k}</button>
              ))}
            </div>

            {/* Reactions */}
            <div className="flex gap-1.5 justify-center flex-wrap">
              {QUICK_REACTIONS.map(e=>(
                <button key={e} onClick={()=>handleReaction(e)}
                  className="w-9 h-9 rounded-full bg-white/7 hover:bg-white/16 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90 border border-white/8">
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PODIUM
  if (phase==='podium') {
    const podiumOrder = [sortedPlayers[1],sortedPlayers[0],sortedPlayers[2]].filter(Boolean);
    const podiumH   = ['h-24','h-36','h-20'];
    const podiumLbl = ['🥈 2nd','🥇 1st','🥉 3rd'];
    const myFinalRank = sortedPlayers.findIndex(p=>p.id===myPlayer?.id)+1;
    const encouragement = myFinalRank===1 ? ENCOURAGEMENTS_WIN[0] : myFinalRank<=3 ? ENCOURAGEMENTS_MID[0] : ENCOURAGEMENTS_LOSS[Math.floor(Math.random()*ENCOURAGEMENTS_LOSS.length)];
    const winHouse = HOUSES.find(h=>h.id===topHouse?.[0]);

    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col overflow-hidden relative">
        <ParticleExplosion active count={80} colors={['#ffd700','#f59e0b','#fff','#a855f7','#10b981']}/>
        {reactions.map(r=>(
          <div key={r.id} className="fixed z-50 pointer-events-none text-4xl animate-float-up" style={{left:`${r.x}%`,top:`${r.y}%`}}>{r.emoji}</div>
        ))}

        <div className="relative z-10 max-w-lg mx-auto w-full px-4 py-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2 animate-bounce">🏆</div>
            <h2 className="text-4xl font-black text-white mb-1">Game Over!</h2>
            {mvp&&<p className="text-yellow-400 font-bold">👑 MVP: {mvp.nickname} — {mvp.score.toLocaleString()} pts</p>}
            {winHouse&&<p className="font-bold mt-1" style={{color:winHouse.color}}>🏆 {winHouse.icon} {winHouse.id} House Wins! ({(topHouse?.[1]??0).toLocaleString()} pts)</p>}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-3 mb-6 w-full">
            {podiumOrder.map((p, i) => {
              if (!p) return <div key={i} className="flex-1"/>;
              const av3=getAvatar(p.avatarId);
              const house3=HOUSES.find(h=>h.id===p.house);
              return (
                <div key={p.id} className="flex-1 flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${av3.bg} flex items-center justify-center text-3xl mb-2 shadow-xl`}
                    style={{boxShadow:`0 0 20px ${av3.glow}`}}>{av3.emoji}</div>
                  <div className="text-white font-bold text-sm text-center mb-0.5 truncate w-full px-1">{p.nickname}</div>
                  <div className="text-xs mb-2" style={{color:house3?.color}}>{house3?.icon}{p.house}</div>
                  <div className={`w-full ${podiumH[i]} rounded-t-2xl flex flex-col items-center justify-end pb-3`}
                    style={{background:i===1?'linear-gradient(to top,#92400e,#d97706)':i===0?'linear-gradient(to top,#374151,#6b7280)':'linear-gradient(to top,#7c2d12,#c2410c)'}}>
                    <div className="text-xs font-bold text-white/80">{podiumLbl[i]}</div>
                    <div className="text-lg font-black text-white">{p.score.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My result */}
          {myPlayer&&(
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
              <div className="text-white/35 text-xs font-bold mb-3 text-center tracking-wider uppercase">Your Result</div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  {v:`#${myFinalRank}`,k:'Rank',c:'text-yellow-400'},
                  {v:myPlayer.score.toLocaleString(),k:'Score',c:'text-white'},
                  {v:`${myPlayer.accuracy}%`,k:'Accuracy',c:'text-green-400'},
                  {v:`x${myPlayer.combo}`,k:'Combo',c:'text-orange-400'},
                ].map(s=>(
                  <div key={s.k} className="text-center">
                    <div className={`font-black text-lg leading-none ${s.c}`}>{s.v}</div>
                    <div className="text-white/30 text-xs mt-0.5">{s.k}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm font-semibold" style={{color:myFinalRank===1?'#ffd700':myFinalRank<=3?'#c0c0c0':'#a78bfa'}}>
                {encouragement}
              </div>
            </div>
          )}

          {/* Reaction bar */}
          <div className="flex gap-2 justify-center mb-5 flex-wrap">
            {QUICK_REACTIONS.map(e=>(
              <button key={e} onClick={()=>handleReaction(e)}
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/18 flex items-center justify-center text-xl transition-all hover:scale-110 border border-white/8">
                {e}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={()=>{
              setPhase('lobby');
              setPlayers(p=>p.map(x=>({...x,score:0,combo:0,streak:0,correctCount:0,totalAnswered:0,accuracy:0,lastPoints:0,xp:0,level:1})));
              setQuestionNum(0);
            }} className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-lg">
              🔄 Play Again
            </button>
            <button onClick={onBack} className="flex-1 py-4 bg-white/8 border border-white/12 text-white font-bold rounded-2xl hover:bg-white/14 transition-all">
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
