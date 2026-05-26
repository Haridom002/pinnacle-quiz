import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAvatar } from '../lib/avatars';

interface UserMenuProps {
  onProfile?: () => void;
}

export default function UserMenu({ onProfile }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;
  const avatar = getAvatar(user.avatar_id);

  const roleColors: Record<string, string> = {
    student: 'text-purple-400',
    teacher: 'text-blue-400',
    parent: 'text-green-400',
  };
  const roleIcons: Record<string, string> = {
    student: '🎓', teacher: '📋', parent: '👨‍👩‍👧',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-full pl-1 pr-3 py-1 transition-all"
      >
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}
          style={{ boxShadow: `0 0 8px ${avatar.glow}50` }}>
          {avatar.emoji}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-white text-xs font-bold leading-none">{user.full_name.split(' ')[0]}</div>
          <div className={`text-xs leading-none mt-0.5 ${roleColors[user.role]}`}>Lv.{user.level}</div>
        </div>
        <span className="text-white/40 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#16213e] border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          {/* Profile header */}
          <div className="p-4 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-2xl flex-shrink-0`}
                style={{ boxShadow: `0 0 15px ${avatar.glow}60` }}>
                {avatar.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold truncate">{user.full_name}</div>
                <div className="text-white/50 text-xs truncate">{user.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-xs font-bold ${roleColors[user.role]}`}>
                    {roleIcons[user.role]} {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {user.house && (
                    <span className="text-white/40 text-xs">· House {user.house}</span>
                  )}
                </div>
              </div>
            </div>
            {/* XP bar */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-yellow-400/70">Lv.{user.level}</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  style={{ width: `${Math.min((user.xp % 100), 100)}%` }} />
              </div>
              <span className="text-xs text-white/30">{user.xp} XP</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            {onProfile && (
              <button onClick={() => { onProfile(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left">
                <span className="text-lg">👤</span>
                <span className="text-white/80 text-sm font-medium">My Profile</span>
              </button>
            )}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left">
              <span className="text-lg">🏆</span>
              <span className="text-white/80 text-sm font-medium">My Stats</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left">
              <span className="text-lg">⚙️</span>
              <span className="text-white/80 text-sm font-medium">Settings</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left text-red-400">
              <span className="text-lg">🚪</span>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
