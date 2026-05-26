import { useState, useEffect, useCallback, useRef } from 'react';
import { MathQuestion, DifficultyLevel } from '../types';
import { generateMathQuestion } from '../utils/mathEngine';
import { soundEngine } from '../utils/soundEngine';
import SoundControl from './SoundControl';
import ParticleExplosion from './ParticleExplosion';

interface Props { onBack: () => void; }
type Phase = 'setup' | 'playing' | 'victory';

interface Team {
  id: 'red' | 'blue'; name: string;
  color: string; score: number; combo: number; power: number;
}

// Each team has a large animated animal character
const TEAM_ANIMALS = {
  red: {
    svgPath: `
      <!-- Lion Body -->
      <ellipse cx="80" cy="140" rx="55" ry="40" fill="#c2410c"/>
      <!-- Lion Head -->
      <circle cx="80" cy="85" r="38" fill="#ea580c"/>
      <!-- Mane -->
      <circle cx="80" cy="85" r="48" fill="#92400e" opacity="0.9"/>
      <circle cx="80" cy="85" r="38" fill="#ea580c"/>
      <!-- Eyes -->
      <circle cx="67" cy="78" r="7" fill="white"/>
      <circle cx="93" cy="78" r="7" fill="white"/>
      <circle cx="69" cy="80" r="4" fill="#1c1917"/>
      <circle cx="95" cy="80" r="4" fill="#1c1917"/>
      <circle cx="70" cy="79" r="1.5" fill="white"/>
      <circle cx="96" cy="79" r="1.5" fill="white"/>
      <!-- Nose -->
      <ellipse cx="80" cy="93" rx="6" ry="4" fill="#9d174d"/>
      <!-- Mouth -->
      <path d="M74 97 Q80 104 86 97" stroke="#1c1917" stroke-width="2" fill="none"/>
      <!-- Whiskers -->
      <line x1="50" y1="92" x2="72" y2="94" stroke="#fbbf24" stroke-width="1.5" opacity="0.7"/>
      <line x1="50" y1="97" x2="72" y2="97" stroke="#fbbf24" stroke-width="1.5" opacity="0.7"/>
      <line x1="88" y1="94" x2="110" y2="92" stroke="#fbbf24" stroke-width="1.5" opacity="0.7"/>
      <line x1="88" y1="97" x2="110" y2="97" stroke="#fbbf24" stroke-width="1.5" opacity="0.7"/>
      <!-- Left Arm pulling rope -->
      <path d="M35 135 Q15 145 8 155 Q5 160 10 162 Q20 155 35 148" fill="#c2410c"/>
      <!-- Right Arm back -->
      <path d="M125 135 Q140 125 145 120 Q148 115 144 113 Q138 118 125 128" fill="#c2410c"/>
      <!-- Legs -->
      <ellipse cx="60" cy="175" rx="18" ry="12" fill="#b45309"/>
      <ellipse cx="100" cy="175" rx="18" ry="12" fill="#b45309"/>
      <ellipse cx="60" cy="185" rx="14" ry="8" fill="#92400e"/>
      <ellipse cx="100" cy="185" rx="14" ry="8" fill="#92400e"/>
      <!-- Tail -->
      <path d="M130 145 Q155 130 160 110 Q162 95 155 90" stroke="#c2410c" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="154" cy="88" r="8" fill="#92400e"/>
      <!-- Crown / Power indicator -->
      <text x="80" y="50" text-anchor="middle" font-size="22" fill="#fbbf24">👑</text>
    `,
    color: '#ef4444', label: 'Red Lions', emoji: '🦁',
    gradient: 'from-red-700 via-red-600 to-orange-600',
    glow: '#ef4444',
  },
  blue: {
    svgPath: `
      <!-- Hawk/Eagle Body -->
      <ellipse cx="80" cy="145" rx="35" ry="45" fill="#1d4ed8"/>
      <!-- Wing Left (back, pulling) -->
      <path d="M45 130 Q10 110 5 85 Q3 70 15 72 Q30 85 50 120" fill="#1e40af"/>
      <!-- Wing Right (forward, tucked) -->  
      <path d="M115 130 Q148 115 152 90 Q154 76 143 77 Q130 88 112 122" fill="#1e40af"/>
      <!-- Head -->
      <ellipse cx="80" cy="85" rx="30" ry="32" fill="#2563eb"/>
      <!-- White face mask -->
      <ellipse cx="80" cy="93" rx="20" ry="22" fill="white" opacity="0.9"/>
      <!-- Eyes -->
      <circle cx="72" cy="83" r="7" fill="#fbbf24"/>
      <circle cx="88" cy="83" r="7" fill="#fbbf24"/>
      <circle cx="73" cy="84" r="4" fill="#1c1917"/>
      <circle cx="89" cy="84" r="4" fill="#1c1917"/>
      <circle cx="74" cy="83" r="1.5" fill="white"/>
      <circle cx="90" cy="83" r="1.5" fill="white"/>
      <!-- Beak -->
      <path d="M74 96 L80 108 L86 96 Z" fill="#f97316"/>
      <!-- Talons / Feet holding rope -->
      <path d="M55 185 Q45 192 38 198 M55 185 Q50 195 45 203 M55 185 Q57 196 54 204" stroke="#f97316" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M105 185 Q115 192 122 198 M105 185 Q110 195 115 203 M105 185 Q103 196 106 204" stroke="#f97316" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Legs -->
      <rect x="62" y="175" width="16" height="18" rx="4" fill="#1d4ed8"/>
      <rect x="82" y="175" width="16" height="18" rx="4" fill="#1d4ed8"/>
      <!-- Feather details on wing -->
      <path d="M15 78 Q20 90 30 100" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M10 90 Q18 98 28 106" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- Crown -->
      <text x="80" y="55" text-anchor="middle" font-size="22" fill="#fbbf24">⚡</text>
    `,
    color: '#3b82f6', label: 'Blue Hawks', emoji: '🦅',
    gradient: 'from-blue-700 via-blue-600 to-cyan-600',
    glow: '#3b82f6',
  },
};

const INITIAL_TEAMS: Team[] = [
  { id:'red',  name:'Red Lions',  color:'#ef4444', score:0, combo:0, power:50 },
  { id:'blue', name:'Blue Hawks', color:'#3b82f6', score:0, combo:0, power:50 },
];

export default function TugOfWar({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [teams, setTeams] = useState<Team[]>(JSON.parse(JSON.stringify(INITIAL_TEAMS)));
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [ropePos, setRopePos] = useState(50);
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{correct:boolean; team:'red'|'blue'; points:number} | null>(null);
  const [currentTeam, setCurrentTeam] = useState<'red'|'blue'>('red');
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameTime, setGameTime] = useState(120);
  const [showSuperPull, setShowSuperPull] = useState(false);
  const [showParticle, setShowParticle] = useState<{x:number;y:number}|null>(null);
  const [winner, setWinner] = useState<Team|null>(null);
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [teamNames, setTeamNames] = useState(['Red Lions','Blue Hawks']);
  const [ropeShake, setRopeShake] = useState(false);
  const [redPull, setRedPull] = useState(false);
  const [bluePull, setBluePull] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  const nextQuestion = useCallback((team:'red'|'blue') => {
    const q = generateMathQuestion('mixed', difficulty);
    setQuestion(q); setTimeLeft(q.timeLimit);
    setUserInput(''); setFeedback(null);
    setQuestionKey(k=>k+1); setCurrentTeam(team);
    setTimeout(()=>inputRef.current?.focus(), 50);
  }, [difficulty]);

  // Question timer
  useEffect(() => {
    if (phase!=='playing'||feedback) return;
    if (timeLeft<=0) {
      soundEngine.wrong();
      setFeedback({correct:false,team:currentTeam,points:0});
      setTeams(prev=>prev.map(t=>t.id===currentTeam?{...t,combo:0,power:Math.max(t.power-5,0)}:t));
      setTimeout(()=>nextQuestion(currentTeam==='red'?'blue':'red'),1000); return;
    }
    if (timeLeft<=3) soundEngine.timerWarning();
    timerRef.current = setTimeout(()=>setTimeLeft(t=>t-0.1),100);
    return ()=>{if(timerRef.current)clearTimeout(timerRef.current);};
  }, [timeLeft,phase,feedback,currentTeam,nextQuestion]);

  // Game timer
  useEffect(() => {
    if (phase!=='playing') return;
    if (gameTime<=0) {
      soundEngine.stopBgMusic();
      const w = ropePos>55?teams[0]:ropePos<45?teams[1]:null;
      if (!w) { setSuddenDeath(true); setGameTime(30); soundEngine.hype(); return; }
      setWinner(w); setPhase('victory'); soundEngine.victory(); soundEngine.crowd(); return;
    }
    const t = setTimeout(()=>setGameTime(g=>g-1),1000);
    return ()=>clearTimeout(t);
  }, [gameTime,phase,ropePos,teams]);

  const handleAnswer = useCallback(() => {
    if (!question||feedback) return;
    const val = parseInt(userInput.trim(),10);
    if (isNaN(val)) return;
    const isCorrect = val===question.answer;
    const team = currentTeam;

    setTeams(prev=>prev.map(t=>{
      if (t.id!==team) return t;
      const newCombo = isCorrect?t.combo+1:0;
      const pull = isCorrect?(newCombo>=3?18:10):-4;
      return {...t,combo:newCombo,score:t.score+(isCorrect?100+newCombo*25:0),power:Math.min(Math.max(t.power+pull,0),100)};
    }));

    if (isCorrect) {
      soundEngine.correct();
      const teamObj = teams.find(t=>t.id===team)!;
      const newCombo = teamObj.combo+1;
      if (newCombo>=3) {
        soundEngine.superPull(); soundEngine.roar();
        setShowSuperPull(true);
        setTimeout(()=>setShowSuperPull(false),2500);
      } else if (newCombo>=2) soundEngine.combo(newCombo);
      soundEngine.crowd();

      // Animate the pulling animal
      if (team==='red') { setRedPull(true); setTimeout(()=>setRedPull(false),400); }
      else              { setBluePull(true); setTimeout(()=>setBluePull(false),400); }
      setRopeShake(true); setTimeout(()=>setRopeShake(false),300);

      const pull = newCombo>=3?15:8;
      setRopePos(pos=>{
        const np = team==='red'?Math.min(pos+pull,96):Math.max(pos-pull,4);
        if (np>=96) { soundEngine.stopBgMusic(); setWinner(teams.find(t=>t.id==='red')!); setTimeout(()=>setPhase('victory'),600); }
        if (np<=4)  { soundEngine.stopBgMusic(); setWinner(teams.find(t=>t.id==='blue')!); setTimeout(()=>setPhase('victory'),600); }
        return np;
      });
      setShowParticle({x:team==='red'?20:80,y:50});
      setTimeout(()=>setShowParticle(null),800);
    } else {
      soundEngine.wrong();
      setRopePos(pos=>team==='red'?Math.max(pos-4,4):Math.min(pos+4,96));
    }

    setFeedback({correct:isCorrect,team,points:isCorrect?100:0});
    setTimeout(()=>nextQuestion(team==='red'?'blue':'red'),isCorrect?700:1000);
  }, [question,userInput,feedback,currentTeam,teams,nextQuestion]);

  const handleKeyDown=(e:React.KeyboardEvent)=>{if(e.key==='Enter')handleAnswer();};
  const numpadKeys=['7','8','9','4','5','6','1','2','3','0','-','⌫'];
  const handleNumpad=(k:string)=>{
    if(k==='⌫')setUserInput(i=>i.slice(0,-1));
    else if(k==='-')setUserInput(i=>i.startsWith('-')?i.slice(1):'-'+i);
    else setUserInput(i=>i.length<6?i+k:i);
  };

  const startGame=()=>{
    const t=JSON.parse(JSON.stringify(INITIAL_TEAMS)) as Team[];
    t[0].name=teamNames[0]; t[1].name=teamNames[1];
    setTeams(t); setRopePos(50); setGameTime(120); setSuddenDeath(false);
    setPhase('playing'); soundEngine.startBgMusic('tug'); soundEngine.crowd();
    setTimeout(()=>nextQuestion('red'),200);
  };

  // ── SETUP ──
  if (phase==='setup') return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/60 hover:text-white transition-colors flex items-center gap-2">← Back</button>
          <SoundControl/>
        </div>

        <div className="text-center mb-8">
          {/* Giant animal preview */}
          <div className="flex justify-center gap-6 mb-5">
            <div className="relative">
              <svg width="120" height="200" viewBox="0 0 160 210" dangerouslySetInnerHTML={{__html:TEAM_ANIMALS.red.svgPath}}/>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">🦁 Lions</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-white font-black text-3xl">VS</div>
              <div className="text-white/30 text-xs mt-1">Math Tug Arena</div>
            </div>
            <div className="relative">
              <svg width="120" height="200" viewBox="0 0 160 210" style={{transform:'scaleX(-1)'}} dangerouslySetInnerHTML={{__html:TEAM_ANIMALS.blue.svgPath}}/>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">🦅 Hawks</div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Math Tug Arena</h1>
          <p className="text-white/40">Two beasts. One rope. Pure math power.</p>
        </div>

        {/* Team names */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {INITIAL_TEAMS.map((t,i)=>(
            <div key={t.id} className="p-4 rounded-2xl border-2" style={{borderColor:t.color,background:t.color+'18'}}>
              <div className="text-lg mb-1">{TEAM_ANIMALS[t.id].emoji}</div>
              <input value={teamNames[i]} onChange={e=>{const n=[...teamNames];n[i]=e.target.value;setTeamNames(n);}}
                className="bg-transparent text-white font-bold text-sm outline-none border-b w-full" style={{borderColor:t.color+'60'}} placeholder={t.name}/>
              <div className="text-xs mt-1 font-semibold" style={{color:t.color}}>Team {t.id.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <label className="text-white/50 text-xs font-bold tracking-wider uppercase mb-3 block">Math Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {(['beginner','intermediate','advanced','genius'] as DifficultyLevel[]).map(d=>(
              <button key={d} onClick={()=>setDifficulty(d)}
                className={`py-3 rounded-xl text-xs font-bold transition-all border ${difficulty===d?'bg-red-500 border-red-400 text-white':'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}>
                {d==='genius'?'🔥 Genius':d.charAt(0).toUpperCase()+d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* House competition */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
          <div className="text-white/50 text-xs font-bold mb-3">SCHOOL HOUSE COMPETITION</div>
          <div className="grid grid-cols-4 gap-2">
            {[['Alpha','🏛️'],['Beta','⚗️'],['Gamma','☢️'],['Pulsar','✨']].map(([h,icon])=>(
              <div key={h} className="text-center py-2.5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xl mb-0.5">{icon}</div>
                <div className="text-white/60 text-xs font-bold">{h}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startGame} className="w-full py-5 bg-gradient-to-r from-red-600 via-orange-500 to-blue-600 text-white font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
          ⚔️ START TUG BATTLE
        </button>
      </div>
    </div>
  );

  // ── VICTORY ──
  if (phase==='victory'&&winner) {
    const animal = TEAM_ANIMALS[winner.id];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
        style={{background:`radial-gradient(ellipse at center, ${winner.color}25, #0d0d1a)`}}>
        <ParticleExplosion active count={80} colors={[winner.color,'#ffd700','#fff',winner.color+'aa']}/>
        <div className="relative z-10 text-center">
          <svg width="180" height="220" viewBox="0 0 160 210" className="mx-auto mb-2"
            style={{filter:`drop-shadow(0 0 30px ${animal.glow})`}}
            dangerouslySetInnerHTML={{__html:animal.svgPath}}/>
          <div className="text-6xl font-black text-white mb-1">{winner.name}</div>
          <div className="text-2xl font-bold mb-2" style={{color:winner.color}}>WINS THE BATTLE!</div>
          <div className="text-white/40 mb-6 text-sm">🏆 Math Champion</div>
          <div className="flex gap-8 justify-center mb-8">
            {teams.map(t=>(
              <div key={t.id} className="text-center">
                <div className="text-3xl mb-1">{TEAM_ANIMALS[t.id].emoji}</div>
                <div className="text-2xl font-black text-white">{t.score}</div>
                <div className="text-xs" style={{color:t.color}}>{t.name}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={startGame} className="px-8 py-4 font-black text-white rounded-2xl text-lg"
              style={{background:`linear-gradient(135deg, ${winner.color}, #1e1b4b)`}}>⚔️ Rematch!</button>
            <button onClick={onBack} className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20">🏠 Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const activeTeam = teams.find(t=>t.id===currentTeam)!;
  const animal = TEAM_ANIMALS[currentTeam];

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col overflow-hidden select-none">
      {/* Particles */}
      {showParticle&&(
        <div className="fixed inset-0 pointer-events-none z-50">
          <ParticleExplosion active x={showParticle.x} y={showParticle.y} count={28}
            colors={[activeTeam.color,'#fff','#ffd700']} onComplete={()=>setShowParticle(null)}/>
        </div>
      )}

      {/* SUPER PULL overlay */}
      {showSuperPull&&(
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl font-black text-white mb-2 animate-bounce"
              style={{textShadow:`0 0 50px ${activeTeam.color}, 0 0 100px ${activeTeam.color}80`, WebkitTextStroke:`2px ${activeTeam.color}`}}>
              ⚡ SUPER PULL! ⚡
            </div>
            <div className="text-3xl font-black" style={{color:activeTeam.color}}>{animal.emoji} {activeTeam.name}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10">
        {suddenDeath&&<div className="bg-red-500/20 border border-red-500/50 rounded-full px-3 py-1 text-red-400 text-xs font-black animate-pulse">☠️ SUDDEN DEATH</div>}
        {!suddenDeath&&<div/>}
        <div className={`text-2xl font-black px-4 py-1 rounded-xl ${gameTime<=10?'text-red-400 bg-red-400/20 animate-pulse':'text-white bg-white/10'}`}>{gameTime}s</div>
        <SoundControl/>
      </div>

      {/* Team scores */}
      <div className="grid grid-cols-2 divide-x divide-white/10">
        {teams.map(t=>(
          <div key={t.id} className={`px-4 py-2.5 flex items-center gap-3 transition-all ${currentTeam===t.id?'bg-white/8':'bg-black/20'}`}>
            <span className="text-2xl">{TEAM_ANIMALS[t.id].emoji}</span>
            <div>
              <div className="text-white font-bold text-xs">{t.name}</div>
              <div className="text-2xl font-black" style={{color:t.color}}>{t.score}</div>
            </div>
            {t.combo>=2&&<div className="ml-auto text-xs font-black animate-pulse" style={{color:t.color}}>🔥{t.combo}x</div>}
          </div>
        ))}
      </div>

      {/* ═══ ANIMATED TUG OF WAR SCENE ═══ */}
      <div className="relative bg-gradient-to-b from-[#0a0a1a] to-[#111827] overflow-hidden" style={{height:'220px'}}>
        {/* Arena floor */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1e1b4b] to-transparent"/>
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400/20 border-r border-dashed border-yellow-400/20"/>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-yellow-400/50 text-xs font-bold">CENTER</div>

        {/* RED TEAM animal — left side */}
        <div className="absolute bottom-8 transition-all duration-700 ease-out"
          style={{
            left:`${Math.max(ropePos-45,2)}%`,
            transform:`translateX(-50%) ${redPull?'scaleX(-1) translateX(-8px)':'scaleX(-1)'}`,
            filter:`drop-shadow(0 0 ${teams[0].combo>=3?'20px':'8px'} #ef444480)`,
          }}>
          <svg width="130" height="170" viewBox="0 0 160 210"
            style={{transition:'transform 0.2s',transform:redPull?'rotate(-5deg)':'rotate(0deg)'}}
            dangerouslySetInnerHTML={{__html:TEAM_ANIMALS.red.svgPath}}/>
        </div>

        {/* BLUE TEAM animal — right side */}
        <div className="absolute bottom-8 transition-all duration-700 ease-out"
          style={{
            right:`${Math.max(100-ropePos-45,2)}%`,
            transform:`translateX(50%) ${bluePull?'translateX(8px)':''}`,
            filter:`drop-shadow(0 0 ${teams[1].combo>=3?'20px':'8px'} #3b82f680)`,
          }}>
          <svg width="130" height="170" viewBox="0 0 160 210"
            style={{transition:'transform 0.2s',transform:bluePull?'rotate(5deg)':'rotate(0deg)'}}
            dangerouslySetInnerHTML={{__html:TEAM_ANIMALS.blue.svgPath}}/>
        </div>

        {/* THE ROPE */}
        <div className={`absolute ${ropeShake?'animate-rope-shake':''}`}
          style={{top:'55%',left:'5%',right:'5%',height:'24px',transform:'translateY(-50%)'}}>
          {/* Rope segments */}
          <svg width="100%" height="24" viewBox="0 0 400 24" preserveAspectRatio="none">
            {/* Rope fibers */}
            <path d="M0 12 Q100 8 200 12 Q300 16 400 12" stroke="#92400e" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M0 10 Q100 6 200 10 Q300 14 400 10" stroke="#a16207" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6"/>
            <path d="M0 14 Q100 10 200 14 Q300 18 400 14" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
            {/* Rope hash marks */}
            {[...Array(16)].map((_,i)=>(
              <line key={i} x1={i*26} y1="6" x2={i*26+10} y2="18" stroke="#fbbf2440" strokeWidth="2"/>
            ))}
          </svg>

          {/* Centre knot */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700"
            style={{left:`${ropePos}%`}}>
            <div className="w-10 h-10 rounded-full border-4 border-yellow-400 bg-[#0d0d1a] flex items-center justify-center text-base shadow-lg"
              style={{boxShadow:`0 0 20px #fbbf24, 0 0 40px #fbbf2440`}}>
              ⚡
            </div>
          </div>
        </div>

        {/* Power indicators */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center gap-3">
          {/* Red power */}
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-red-400 text-xs font-bold w-8 text-right">{teams[0].power}%</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:`${teams[0].power}%`,background:'#ef4444'}}/>
            </div>
          </div>
          <span className="text-white/20 text-xs">PWR</span>
          {/* Blue power */}
          <div className="flex items-center gap-1.5 flex-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all ml-auto" style={{width:`${teams[1].power}%`,background:'#3b82f6'}}/>
            </div>
            <span className="text-blue-400 text-xs font-bold w-8">{teams[1].power}%</span>
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="flex items-center justify-center gap-2 py-2 border-b border-white/5 bg-black/20">
        <span className="text-lg">{animal.emoji}</span>
        <span className="font-bold text-sm" style={{color:activeTeam.color}}>{activeTeam.name}'s turn</span>
        {activeTeam.combo>=2&&<span className="text-xs font-black animate-pulse" style={{color:activeTeam.color}}>🔥{activeTeam.combo}x COMBO!</span>}
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-3">
        {question&&(
          <div key={questionKey} className="w-full max-w-md">
            {/* Timer bar */}
            <div className="h-2 rounded-full overflow-hidden mb-4 border border-white/10">
              <div className="h-full rounded-full transition-none"
                style={{width:`${(timeLeft/question.timeLimit)*100}%`,background:activeTeam.color,transition:'width 0.1s linear'}}/>
            </div>

            <div className={`text-center p-5 rounded-3xl border-2 mb-4 transition-all ${
              feedback?.correct?'border-green-400 bg-green-400/8':feedback&&!feedback.correct?'border-red-400 bg-red-400/8':'border-white/15 bg-white/4'
            }`} style={!feedback?{borderColor:activeTeam.color+'50'}:{}}>
              <div className="text-4xl md:text-5xl font-black text-white">{question.question} = ?</div>
              {feedback&&(
                <div className={`mt-2 text-base font-bold ${feedback.correct?'text-green-400':'text-red-400'}`}>
                  {feedback.correct?`✓ PULL! ${activeTeam.name} gains ground!`:`✗ Answer was ${question.answer}`}
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <input ref={inputRef} type="number" value={userInput}
                onChange={e=>setUserInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type answer..." disabled={!!feedback}
                className="flex-1 bg-white/10 border-2 text-white text-xl font-black rounded-2xl px-4 py-3 outline-none transition-colors placeholder-white/20"
                style={{borderColor:feedback?(feedback.correct?'#10b981':'#ef4444'):activeTeam.color+'70'}}/>
              <button onClick={handleAnswer} disabled={!!feedback||!userInput}
                className="px-6 py-3 font-black text-white rounded-2xl disabled:opacity-30 active:scale-95 transition-all text-lg"
                style={{background:`linear-gradient(135deg, ${activeTeam.color}, ${activeTeam.color}80)`}}>
                PULL!
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {numpadKeys.map(k=>(
                <button key={k} onClick={()=>{soundEngine.click();handleNumpad(k);}} disabled={!!feedback}
                  className={`py-3 rounded-xl font-black text-lg transition-all active:scale-95 disabled:opacity-30 ${
                    k==='⌫'?'bg-red-500/20 text-red-400 border border-red-500/30':
                    k==='-'?'bg-blue-500/20 text-blue-400 border border-blue-500/30':
                    'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  }`}>{k}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
