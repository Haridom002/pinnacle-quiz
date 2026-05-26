import { useState } from 'react';

interface MockUser { id:string; full_name:string; email:string; avatar_id:string; role:string; house:string; xp:number; level:number; }
interface Props { user: MockUser; onClose: () => void; }

export default function StatsModal({ user, onClose }: Props) {
  const [tab, setTab] = useState<'overview'|'history'|'leaderboard'>('overview');

  const weeklyData = [42, 67, 55, 88, 73, 95, 61];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const maxVal = Math.max(...weeklyData);

  const history = [
    { quiz:'Algebra Foundations', score:8240, accuracy:'94%', date:'Today',    grade:'S+', icon:'📐' },
    { quiz:'Pythagoras & Trigonometry', score:7100, accuracy:'87%', date:'Yesterday', grade:'A', icon:'📏' },
    { quiz:'Basic Statistics', score:6800, accuracy:'82%', date:'2 days ago', grade:'A', icon:'📊' },
    { quiz:'Number Theory', score:5900, accuracy:'76%', date:'3 days ago', grade:'B', icon:'🔢' },
    { quiz:'Geometry Basics', score:5200, accuracy:'70%', date:'4 days ago', grade:'B', icon:'📐' },
  ];

  const leaderboard = [
    { rank:1, name:'MathGod_Kwame',    xp:45230, avatar:'🦁', house:'Alpha',  change:0 },
    { rank:2, name:'SpeedCalc_Ama',    xp:38910, avatar:'🦋', house:'Pulsar', change:1 },
    { rank:3, name:'EinsteinJr_Kofi',  xp:35670, avatar:'⭐', house:'Gamma',  change:-1 },
    { rank:4, name:'QuickMind_Yaa',    xp:29340, avatar:'🔥', house:'Beta',   change:2 },
    { rank:5, name:user.full_name,     xp:user.xp, avatar:'⚡', house:user.house, change:0, isMe:true },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0f1729] border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-yellow-600/20 to-orange-700/20 border-b border-white/10 p-6">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">✕</button>
          <h2 className="text-white font-black text-xl flex items-center gap-2"><span>🏆</span> My Stats</h2>
          <p className="text-white/40 text-sm mt-1">{user.full_name}'s performance dashboard</p>
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              {v:`${user.level}`, k:'Level', icon:'🏅', c:'text-yellow-400'},
              {v:`${user.xp}`, k:'Total XP', icon:'⭐', c:'text-purple-400'},
              {v:'87%', k:'Accuracy', icon:'🎯', c:'text-green-400'},
              {v:'x12', k:'Best Combo', icon:'🔥', c:'text-orange-400'},
            ].map(s=>(
              <div key={s.k} className="bg-black/30 rounded-2xl p-3 text-center border border-white/5">
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className={`font-black text-lg ${s.c}`}>{s.v}</div>
                <div className="text-white/30 text-xs">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20">
          {([['overview','📈','Overview'],['history','📋','History'],['leaderboard','🏆','Ranks']] as const).map(([t,icon,label])=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-bold transition-all ${tab===t?'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5':'text-white/40 hover:text-white/60'}`}>
              <span>{icon}</span><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

          {/* OVERVIEW */}
          {tab==='overview' && (
            <div className="space-y-5">
              {/* Weekly activity bar chart */}
              <div>
                <div className="text-white/50 text-xs font-bold tracking-wider uppercase mb-4">This Week's Activity</div>
                <div className="flex items-end gap-2 h-28">
                  {weeklyData.map((v,i)=>(
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-white/30 text-xs">{v}</div>
                      <div className="w-full rounded-t-lg transition-all"
                        style={{
                          height:`${(v/maxVal)*80}px`,
                          background:i===6?'linear-gradient(to top,#8b5cf6,#a78bfa)':'linear-gradient(to top,#1e1b4b,#4338ca)',
                          minHeight:'4px',
                        }}/>
                      <div className="text-white/30 text-xs">{days[i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject breakdown */}
              <div>
                <div className="text-white/50 text-xs font-bold tracking-wider uppercase mb-3">Subject Performance</div>
                <div className="space-y-2.5">
                  {[
                    {sub:'Mathematics', pct:94, color:'#8b5cf6', icon:'📐'},
                    {sub:'Science', pct:78, color:'#10b981', icon:'🔬'},
                    {sub:'English', pct:85, color:'#3b82f6', icon:'📚'},
                    {sub:'History', pct:62, color:'#f59e0b', icon:'🏛️'},
                  ].map(s=>(
                    <div key={s.sub} className="flex items-center gap-3">
                      <span className="text-lg w-7">{s.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1"><span className="text-white/70 text-xs font-semibold">{s.sub}</span><span className="font-bold text-xs" style={{color:s.color}}>{s.pct}%</span></div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{width:`${s.pct}%`,background:s.color}}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arena stats */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
                <div className="text-yellow-400 text-xs font-bold mb-3">⚡ MATH ARENA STATS</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {v:'23', k:'Battles'},
                    {v:'17', k:'Wins'},
                    {v:'74%', k:'Win Rate'},
                  ].map(s=>(
                    <div key={s.k} className="text-center">
                      <div className="text-white font-black text-xl">{s.v}</div>
                      <div className="text-white/40 text-xs">{s.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab==='history' && (
            <div className="space-y-3">
              {history.map((h,i)=>(
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl p-4 hover:border-white/20 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600/40 to-indigo-700/40 flex items-center justify-center text-2xl flex-shrink-0">{h.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{h.quiz}</div>
                    <div className="text-white/40 text-xs">{h.date} · {h.accuracy} accuracy</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-white font-black text-sm">{h.score.toLocaleString()}</div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.grade==='S+'?'bg-yellow-400/20 text-yellow-400':h.grade==='A'?'bg-green-400/20 text-green-400':'bg-blue-400/20 text-blue-400'}`}>{h.grade}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEADERBOARD */}
          {tab==='leaderboard' && (
            <div className="space-y-2">
              {leaderboard.map((p,i)=>(
                <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${(p as any).isMe?'bg-purple-500/10 border-purple-400/30':'bg-white/5 border-white/8 hover:border-white/15'}`}>
                  <div className="w-8 text-center font-black text-sm flex-shrink-0" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#ffffff50'}}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${p.rank}`}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">{p.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate flex items-center gap-1">
                      {p.name}{(p as any).isMe&&<span className="text-xs text-purple-400 font-normal">(you)</span>}
                    </div>
                    <div className="text-white/30 text-xs">House {p.house}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-yellow-400 font-black text-sm">{p.xp.toLocaleString()}</div>
                    <div className="text-white/30 text-xs">XP</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
