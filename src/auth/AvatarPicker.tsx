import { useState } from 'react';
import { CARTOON_AVATARS, CartoonAvatar } from '../lib/avatars';

interface AvatarPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const CATEGORIES = ['all', 'animals', 'heroes', 'fantasy', 'space', 'nature'] as const;
type Category = typeof CATEGORIES[number];

export default function AvatarPicker({ selectedId, onChange, size = 'md' }: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered = activeCategory === 'all'
    ? CARTOON_AVATARS
    : CARTOON_AVATARS.filter(a => a.category === activeCategory);

  const selected = CARTOON_AVATARS.find(a => a.id === selectedId) ?? CARTOON_AVATARS[0];

  const tileSize = size === 'sm' ? 'w-11 h-11 text-2xl' : size === 'lg' ? 'w-16 h-16 text-4xl' : 'w-13 h-13 text-3xl';

  return (
    <div>
      {/* Selected preview */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selected.bg} flex items-center justify-center text-4xl shadow-lg ring-2 ring-white/30`}
          style={{ boxShadow: `0 0 20px ${selected.glow}60` }}>
          {selected.emoji}
        </div>
        <div>
          <div className="text-white font-bold">{selected.label}</div>
          <div className="text-white/40 text-xs capitalize">{selected.category}</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-none px-3 py-1 rounded-full text-xs font-bold transition-all capitalize ${
              activeCategory === cat
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {cat === 'all' ? '✦ All' : cat === 'animals' ? '🐾 Animals' : cat === 'heroes' ? '🦸 Heroes' : cat === 'fantasy' ? '🧙 Fantasy' : cat === 'space' ? '🚀 Space' : '⚡ Power'}
          </button>
        ))}
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto scrollbar-hide">
        {filtered.map((avatar: CartoonAvatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            title={avatar.label}
            className={`relative rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${tileSize} ${
              selectedId === avatar.id
                ? 'ring-2 ring-offset-1 ring-offset-transparent scale-110'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
              boxShadow: selectedId === avatar.id ? `0 0 12px ${avatar.glow}80` : undefined,
              ...(selectedId === avatar.id ? { ringColor: avatar.glow } : {}),
            }}
          >
            {/* Gradient bg */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${avatar.bg} ${
              selectedId === avatar.id ? 'opacity-100' : 'opacity-60'
            }`} />
            {/* Selected ring */}
            {selectedId === avatar.id && (
              <div className="absolute inset-0 rounded-xl ring-2" style={{ boxShadow: `inset 0 0 0 2px ${avatar.glow}` }} />
            )}
            <span className="relative z-10 text-2xl leading-none">{avatar.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
