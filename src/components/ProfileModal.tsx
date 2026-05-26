import { useState } from 'react';
import { getAvatar } from '../lib/avatars';
import AvatarPicker from '../auth/AvatarPicker';

interface MockUser { id:string; full_name:string; email:string; avatar_id:string; role:string; house:string; xp:number; level:number; }

interface Props {
  user: MockUser;
  onClose: () => void;
  onUpdate: (u: Partial<MockUser>) => void;
}

const HOUSES = ['Alpha','Beta','Gamma','Pulsar'] as const;
const HOUSE_DATA: Record<string,{icon:string;color:string}> = {
  Alpha:  {icon:'🏛️', color:'from-yellow-500 to-amber-600'},
  Beta:   {icon:'⚗️',  color:'from-blue-500 to-cyan-600'},
  Gamma:  {icon:'☢️',  color:'from-green-500 to-emerald-600'},
  Pulsar: {icon:'✨', color:'from-purple-500 to-violet-600'},
};

export default function ProfileModal({ user, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<'profile'|'avatar'|'settings'>('profile');
  const [name, setName] = useState(user.full_name);
  const [house, setHouse] = useState(user.house);
  const [avatarId, setAvatarId] = useState(user.avatar_id);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState<'sm'|'md'|'lg'>('md');

  const av = getAvatar(avatarId);

  const handleSave = () => {
    onUpdate({ full_name: name, house, avatar_id: avatarId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const badges = [
    { icon:'🎯', label:'First Blood',   unlocked: true },
    { icon:'🔟', label:'Ten Streak',    unlocked: true },
    { icon:'🔥', label:'On Fire',       unlocked: user.xp > 200 },
    { icon:'⚡', label:'Unstoppable',  unlocked: user.xp > 500 },
    { icon:'⭐', label:'XP Master',    unlocked: user.xp > 1000 },
    { icon:'💎', label:'Legend',        unlocked: user.xp > 5000 },
    { icon:'🏆', label:'Centurion',    unlocked: false },
    { icon:'👑', label:'Arena King',   unlocked: false },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0f1729] border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-600/30 to-indigo-700/30 border-b border-white/10 p-6">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">✕</button>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-5xl shadow-xl flex-shrink-0`}
              style={{boxShadow:`0 0 30px ${av.glow}60`}}>
              {av.emoji}
            </div>
            <div>
              <h2 className="text-white font-black text-xl">{user.full_name}</h2>
              <p className="text-white/40 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  🎓 {user.role.charAt(0).toUpperCase()+user.role.slice(1)}
                </span>
                <span className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  Lv.{user.level} · {user.xp} XP
                </span>
                {user.house && (
                  <span className="bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full">
                    {HOUSE_DATA[user.house]?.icon} {user.house}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20">
          {([['profile','👤','Profile'],['avatar','🎭','Avatar'],['settings','⚙️','Settings']] as const).map(([t,icon,label])=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-bold transition-all ${tab===t?'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5':'text-white/40 hover:text-white/70'}`}>
              <span>{icon}</span><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <div>
                <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Display Name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} maxLength={30}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-white/30"
                  placeholder="Your display name"/>
              </div>

              {user.role === 'student' && (
                <div>
                  <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-3">School House</label>
                  <div className="grid grid-cols-4 gap-2">
                    {HOUSES.map(h=>(
                      <button key={h} onClick={()=>setHouse(h)}
                        className={`py-3 rounded-xl text-center border-2 transition-all ${house===h?'border-purple-400 bg-purple-500/10 scale-[1.03]':'border-white/10 bg-white/5 hover:border-white/25'}`}>
                        <div className="text-2xl mb-1">{HOUSE_DATA[h].icon}</div>
                        <div className="text-white text-xs font-bold">{h}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div>
                <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-3">Achievements & Badges</label>
                <div className="grid grid-cols-4 gap-2">
                  {badges.map(b=>(
                    <div key={b.label} className={`p-3 rounded-xl text-center border transition-all ${b.unlocked?'border-yellow-400/40 bg-yellow-400/5':'border-white/5 bg-white/3 opacity-40'}`}
                      title={b.unlocked?b.label:'Locked'}>
                      <div className="text-2xl mb-1">{b.unlocked?b.icon:'🔒'}</div>
                      <div className={`text-xs font-semibold leading-tight ${b.unlocked?'text-white/70':'text-white/20'}`}>{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSave}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20">
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── AVATAR TAB ── */}
          {tab === 'avatar' && (
            <div>
              <p className="text-white/40 text-sm mb-4">Choose your character for quizzes and the Math Arena</p>
              <AvatarPicker selectedId={avatarId} onChange={setAvatarId} size="md"/>
              <button onClick={handleSave}
                className="w-full mt-5 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-purple-500/20">
                {saved ? '✓ Avatar Saved!' : 'Save Avatar'}
              </button>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div className="space-y-4">
              {/* Toggle rows */}
              {[
                { label:'Sound Effects & Music', sub:'Game sounds and background music', val:sounds, set:setSounds, icon:'🔊' },
                { label:'Notifications', sub:'Achievement alerts and reminders', val:notifs, set:setNotifs, icon:'🔔' },
                { label:'Dark Mode', sub:'Dark interface (recommended)', val:darkMode, set:setDarkMode, icon:'🌙' },
              ].map(item=>(
                <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{item.label}</div>
                      <div className="text-white/40 text-xs">{item.sub}</div>
                    </div>
                  </div>
                  <button onClick={()=>item.set(v=>!v)}
                    className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${item.val?'bg-purple-500':'bg-white/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${item.val?'left-7':'left-1'}`}/>
                  </button>
                </div>
              ))}

              {/* Font size */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔤</span>
                  <div>
                    <div className="text-white font-semibold text-sm">Text Size</div>
                    <div className="text-white/40 text-xs">Adjust quiz question text size</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm','md','lg'] as const).map(s=>(
                    <button key={s} onClick={()=>setFontSize(s)}
                      className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${fontSize===s?'border-purple-400 bg-purple-500/10 text-purple-300':'border-white/10 text-white/50 hover:border-white/30'}`}>
                      {s==='sm'?'Small':s==='md'?'Medium':'Large'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account info */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-white/50 text-xs font-bold tracking-wider uppercase mb-3">Account</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/40">Member since</span><span className="text-white/70">May 2025</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Account type</span><span className="text-white/70 capitalize">{user.role}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Platform</span><span className="text-white/70">PinnacleQuiz v1.0</span></div>
                </div>
              </div>

              <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all text-sm">
                🗑️ Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
