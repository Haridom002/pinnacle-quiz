// 30 cartoon-style SVG avatars rendered as colored emoji+label combos
// Each avatar has: id, emoji, label, bgColor, skinTone category
// These are used across auth, lobby, profiles, leaderboards

export interface CartoonAvatar {
  id: string;
  emoji: string;
  label: string;
  bg: string;       // tailwind bg gradient
  glow: string;     // glow color hex
  category: 'animals' | 'heroes' | 'fantasy' | 'space' | 'nature';
}

export const CARTOON_AVATARS: CartoonAvatar[] = [
  // Animals (0–7)
  { id: '0',  emoji: '🦁', label: 'Lion',       bg: 'from-amber-400 to-orange-500',   glow: '#f59e0b', category: 'animals' },
  { id: '1',  emoji: '🐯', label: 'Tiger',      bg: 'from-orange-400 to-red-500',     glow: '#ef4444', category: 'animals' },
  { id: '2',  emoji: '🦊', label: 'Fox',        bg: 'from-orange-300 to-amber-500',   glow: '#f97316', category: 'animals' },
  { id: '3',  emoji: '🐺', label: 'Wolf',       bg: 'from-slate-400 to-slate-600',    glow: '#94a3b8', category: 'animals' },
  { id: '4',  emoji: '🐼', label: 'Panda',      bg: 'from-gray-200 to-gray-400',      glow: '#e2e8f0', category: 'animals' },
  { id: '5',  emoji: '🦝', label: 'Raccoon',    bg: 'from-slate-300 to-zinc-500',     glow: '#a1a1aa', category: 'animals' },
  { id: '6',  emoji: '🐸', label: 'Frog',       bg: 'from-green-400 to-emerald-600',  glow: '#10b981', category: 'animals' },
  { id: '7',  emoji: '🦋', label: 'Butterfly',  bg: 'from-purple-400 to-pink-500',    glow: '#a855f7', category: 'animals' },
  // Heroes (8–13)
  { id: '8',  emoji: '🦸', label: 'Hero',       bg: 'from-blue-500 to-indigo-600',    glow: '#3b82f6', category: 'heroes' },
  { id: '9',  emoji: '🦹', label: 'Villain',    bg: 'from-violet-600 to-purple-800',  glow: '#7c3aed', category: 'heroes' },
  { id: '10', emoji: '🧑‍🚀', label: 'Astronaut', bg: 'from-sky-400 to-blue-600',    glow: '#0ea5e9', category: 'heroes' },
  { id: '11', emoji: '🧑‍🎨', label: 'Artist',   bg: 'from-pink-400 to-rose-500',    glow: '#f43f5e', category: 'heroes' },
  { id: '12', emoji: '🧑‍💻', label: 'Coder',    bg: 'from-green-500 to-teal-600',   glow: '#14b8a6', category: 'heroes' },
  { id: '13', emoji: '🧑‍🔬', label: 'Scientist',bg: 'from-cyan-400 to-blue-500',    glow: '#06b6d4', category: 'heroes' },
  // Fantasy (14–19)
  { id: '14', emoji: '🧙', label: 'Wizard',     bg: 'from-indigo-500 to-purple-700',  glow: '#6366f1', category: 'fantasy' },
  { id: '15', emoji: '🧝', label: 'Elf',        bg: 'from-emerald-400 to-green-600',  glow: '#34d399', category: 'fantasy' },
  { id: '16', emoji: '🧜', label: 'Mermaid',    bg: 'from-teal-400 to-cyan-600',      glow: '#2dd4bf', category: 'fantasy' },
  { id: '17', emoji: '🧚', label: 'Fairy',      bg: 'from-pink-300 to-fuchsia-500',   glow: '#e879f9', category: 'fantasy' },
  { id: '18', emoji: '🦄', label: 'Unicorn',    bg: 'from-purple-300 to-pink-400',    glow: '#d946ef', category: 'fantasy' },
  { id: '19', emoji: '🐲', label: 'Dragon',     bg: 'from-red-500 to-rose-700',       glow: '#e11d48', category: 'fantasy' },
  // Space (20–24)
  { id: '20', emoji: '🚀', label: 'Rocket',     bg: 'from-slate-700 to-slate-900',    glow: '#475569', category: 'space' },
  { id: '21', emoji: '👾', label: 'Alien',      bg: 'from-lime-400 to-green-600',     glow: '#84cc16', category: 'space' },
  { id: '22', emoji: '🤖', label: 'Robot',      bg: 'from-zinc-400 to-zinc-600',      glow: '#71717a', category: 'space' },
  { id: '23', emoji: '⭐', label: 'Star',       bg: 'from-yellow-300 to-amber-500',   glow: '#fbbf24', category: 'space' },
  { id: '24', emoji: '🌙', label: 'Moon',       bg: 'from-indigo-300 to-blue-500',    glow: '#818cf8', category: 'space' },
  // Nature / Power (25–29)
  { id: '25', emoji: '⚡', label: 'Lightning',  bg: 'from-yellow-400 to-orange-500',  glow: '#facc15', category: 'nature' },
  { id: '26', emoji: '🔥', label: 'Fire',       bg: 'from-orange-500 to-red-600',     glow: '#f97316', category: 'nature' },
  { id: '27', emoji: '🌊', label: 'Wave',       bg: 'from-blue-400 to-cyan-600',      glow: '#38bdf8', category: 'nature' },
  { id: '28', emoji: '💎', label: 'Diamond',    bg: 'from-sky-300 to-blue-400',       glow: '#7dd3fc', category: 'nature' },
  { id: '29', emoji: '🎯', label: 'Target',     bg: 'from-red-400 to-rose-600',       glow: '#fb7185', category: 'nature' },
];

export function getAvatar(id: string): CartoonAvatar {
  return CARTOON_AVATARS.find(a => a.id === id) ?? CARTOON_AVATARS[0];
}
