import { useState, useEffect, useRef } from 'react';
import { soundEngine, PLAYLISTS } from '../utils/soundEngine';
import type { MusicCategory, TrackInfo } from '../utils/soundEngine';

interface Props {
  category?: MusicCategory;
  compact?: boolean;
}

export const CATEGORY_META: Record<MusicCategory, { icon: string; label: string; color: string }> = {
  lightning:  { icon: '⚡', label: 'Lightning',  color: '#f59e0b' },
  formation:  { icon: '🧠', label: 'Training',   color: '#06b6d4' },
  tug:        { icon: '⚔️', label: 'Battle',     color: '#ef4444' },
  home:       { icon: '🏠', label: 'Chill',      color: '#8b5cf6' },
  quiz:       { icon: '🎮', label: 'Quiz',       color: '#10b981' },
  victory:    { icon: '🏆', label: 'Victory',    color: '#fbbf24' },
  suspense:   { icon: '😰', label: 'Suspense',   color: '#6366f1' },
  countdown:  { icon: '⏱️', label: 'Countdown',  color: '#f97316' },
  tournament: { icon: '🎯', label: 'Tournament', color: '#ec4899' },
  classroom:  { icon: '👨‍🏫', label: 'Classroom', color: '#34d399' },
};

// Global shared state so all MusicPlayer instances stay in sync
let _globalMuted  = false;
let _globalVolume = 0.65;
let _globalCat: MusicCategory = 'home';
let _globalPlaying = true;
let _globalTrackIdx = 0;
const _listeners: Set<() => void> = new Set();
function notifyAll() { _listeners.forEach(fn => fn()); }

export default function MusicPlayer({ category = 'home', compact = false }: Props) {
  const [, forceRender] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  // Subscribe to global state changes
  useEffect(() => {
    const fn = () => forceRender(n => n + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  // Start music when category prop changes or on mount
  useEffect(() => {
    if (_globalCat !== category) {
      _globalCat = category;
      _globalTrackIdx = 0;
      _globalPlaying = true;
      soundEngine.startBgMusic(category);
      notifyAll();
    }
  }, [category]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!showPanel) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPanel]);

  const currentTrack: TrackInfo | null = PLAYLISTS[_globalCat]?.[_globalTrackIdx] ?? null;
  const meta = CATEGORY_META[_globalCat];

  const handleMute = () => {
    _globalMuted = !_globalMuted;
    soundEngine.setMuted(_globalMuted);
    notifyAll();
  };

  const handleVolume = (v: number) => {
    _globalVolume = v;
    soundEngine.setVolume(v);
    notifyAll();
  };

  const handlePlayPause = () => {
    _globalPlaying = !_globalPlaying;
    if (_globalPlaying) soundEngine.resumeMusic();
    else soundEngine.pauseMusic();
    notifyAll();
  };

  const handleSkip = () => {
    const pl = PLAYLISTS[_globalCat];
    let next = _globalTrackIdx;
    if (pl.length > 1) while (next === _globalTrackIdx) next = Math.floor(Math.random() * pl.length);
    _globalTrackIdx = next;
    soundEngine.skipTrack();
    notifyAll();
  };

  const handleShuffle = () => {
    soundEngine.setShuffleMode(!soundEngine.isShuffling());
    notifyAll();
  };

  const handleCategory = (cat: MusicCategory) => {
    _globalCat = cat;
    _globalTrackIdx = 0;
    _globalPlaying = true;
    soundEngine.switchCategory(cat);
    notifyAll();
  };

  const handleStart = () => {
    // Unlock audio context on first user interaction
    soundEngine.startBgMusic(_globalCat);
    _globalPlaying = true;
    notifyAll();
  };

  if (compact) return (
    <div className="relative flex items-center gap-1">
      {/* Floating panel — smart positioning */}
      {showPanel && (
        <div ref={panelRef}
          className="absolute bottom-full mb-2 right-0 w-72 bg-[#0a0f1e]/98 border border-white/20 rounded-2xl shadow-2xl shadow-black/60 p-4 backdrop-blur-xl z-[200]"
          style={{ boxShadow: '0 0 40px rgba(139,92,246,0.2), 0 20px 60px rgba(0,0,0,0.8)' }}>

          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: _globalPlaying && !_globalMuted ? '#10b981' : '#6b7280' }}/>
            <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Music Player</span>
            <button onClick={() => setShowPanel(false)} className="ml-auto text-white/30 hover:text-white text-sm">✕</button>
          </div>

          {/* Now playing */}
          <div className="flex items-center gap-2.5 mb-3 p-2.5 rounded-xl border"
            style={{ background: meta.color + '12', borderColor: meta.color + '30' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: meta.color + '25' }}>
              {meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-bold truncate">{currentTrack?.title ?? 'Select category below'}</div>
              <div className="text-xs truncate" style={{ color: meta.color + 'cc' }}>
                {currentTrack?.style} · {currentTrack?.artist ?? meta.label}
              </div>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={handleShuffle}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${soundEngine.isShuffling() ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'bg-white/8 text-white/40 border border-white/10 hover:bg-white/15'}`}>
              🔀
            </button>
            <button onClick={handleStart}
              className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 hover:bg-white/15 text-white/60 text-sm transition-all flex items-center justify-center"
              title="Restart / Reload music">
              ↺
            </button>
            <button onClick={handlePlayPause}
              className="flex-1 h-9 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5"
              style={{ background: meta.color + '30', border: `1px solid ${meta.color}50`, color: 'white' }}>
              {_globalPlaying && !_globalMuted ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={handleSkip}
              className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 hover:bg-white/15 text-white/60 text-sm transition-all flex items-center justify-center">
              ⏭
            </button>
          </div>

          {/* Volume row */}
          <div className="flex items-center gap-2 mb-4">
            <button onClick={handleMute} className="text-lg w-6 flex-shrink-0">
              {_globalMuted ? '🔇' : _globalVolume > 0.5 ? '🔊' : '🔉'}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={_globalMuted ? 0 : _globalVolume}
              onChange={e => handleVolume(parseFloat(e.target.value))}
              className="flex-1 accent-purple-400" style={{ height: '4px', cursor: 'pointer' }} />
            <span className="text-white/40 text-xs w-8 text-right font-mono">
              {_globalMuted ? '0' : Math.round(_globalVolume * 100)}%
            </span>
          </div>

          {/* Category grid */}
          <div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2">Categories</div>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(CATEGORY_META) as MusicCategory[]).map(cat => {
                const m = CATEGORY_META[cat];
                const active = _globalCat === cat;
                return (
                  <button key={cat} onClick={() => handleCategory(cat)}
                    className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl transition-all hover:scale-105 active:scale-95 border"
                    style={{
                      background: active ? m.color + '25' : 'rgba(255,255,255,0.04)',
                      borderColor: active ? m.color + '60' : 'rgba(255,255,255,0.08)',
                    }}>
                    <span className="text-base leading-none">{m.icon}</span>
                    <span className="text-xs font-semibold leading-none" style={{ color: active ? m.color : 'rgba(255,255,255,0.45)', fontSize: '9px' }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track list for current category */}
          <div className="mt-3">
            <div className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2">
              {meta.icon} {meta.label} Playlist ({PLAYLISTS[_globalCat].length} tracks)
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-hide">
              {PLAYLISTS[_globalCat].map((t, i) => (
                <button key={t.id} onClick={() => { _globalTrackIdx = i; soundEngine.skipTrack(); notifyAll(); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${_globalTrackIdx === i ? 'bg-white/12 border border-white/15' : 'hover:bg-white/6'}`}>
                  <span className="text-xs" style={{ color: _globalTrackIdx === i ? meta.color : 'rgba(255,255,255,0.25)' }}>
                    {_globalTrackIdx === i ? '▶' : `${i + 1}.`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-white/80 text-xs truncate font-medium" style={_globalTrackIdx === i ? { color: 'white' } : {}}>{t.title}</div>
                    <div className="text-white/30 text-xs truncate">{t.style} · {t.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* YouTube note */}
          <div className="mt-3 pt-2 border-t border-white/8 text-center">
            <span className="text-white/20 text-xs">Powered by YouTube · Allow autoplay in browser settings</span>
          </div>
        </div>
      )}

      {/* Trigger buttons */}
      <button ref={btnRef} onClick={() => { soundEngine.click(); setShowPanel(s => !s); }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border text-base ${
          showPanel ? 'border-purple-400/50 text-purple-300' : 'border-white/10 text-white/60 hover:text-white hover:border-white/25'
        }`}
        style={{ background: showPanel ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)' }}
        title="Music Player">
        🎵
      </button>
      <button onClick={handleMute}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border text-base ${
          _globalMuted ? 'border-red-500/40 text-red-400' : 'border-white/10 text-white/60 hover:text-white hover:border-white/25'
        }`}
        style={{ background: _globalMuted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)' }}
        title={_globalMuted ? 'Unmute' : 'Mute'}>
        {_globalMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );

  // ── Full Player (non-compact) ──────────────────────────────────
  return (
    <div className="bg-[#0a0f1e]/90 border border-white/12 rounded-2xl p-5 backdrop-blur-sm"
      style={{ boxShadow: '0 0 30px rgba(139,92,246,0.1)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0"
          style={{ background: meta.color + '25', border: `1px solid ${meta.color}40` }}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold truncate">{currentTrack?.title ?? 'Music Player'}</div>
          <div className="text-xs" style={{ color: meta.color + 'aa' }}>{currentTrack?.style} · {meta.label}</div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: _globalPlaying && !_globalMuted ? '#10b981' : '#374151', boxShadow: _globalPlaying && !_globalMuted ? '0 0 8px #10b981' : 'none' }}/>
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={handleShuffle} className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${soundEngine.isShuffling() ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' : 'bg-white/6 text-white/40 border-white/10'}`}>🔀</button>
        <button onClick={handlePlayPause} className="flex-1 py-2 rounded-xl font-bold text-sm transition-all" style={{ background: meta.color + '25', border: `1px solid ${meta.color}40`, color: 'white' }}>
          {_globalPlaying && !_globalMuted ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={handleSkip} className="px-2.5 py-2 rounded-xl text-xs bg-white/6 text-white/50 border border-white/10 hover:bg-white/12 transition-all">⏭</button>
        <button onClick={handleMute} className={`px-2.5 py-2 rounded-xl text-sm border transition-all ${_globalMuted ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-white/6 border-white/10 text-white/60'}`}>{_globalMuted ? '🔇' : '🔊'}</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/30 w-6">Vol</span>
        <input type="range" min="0" max="1" step="0.05" value={_globalMuted ? 0 : _globalVolume}
          onChange={e => handleVolume(parseFloat(e.target.value))}
          className="flex-1 accent-purple-400" style={{ height: '4px' }}/>
        <span className="text-xs text-white/40 w-8 text-right">{Math.round(_globalVolume * 100)}%</span>
      </div>
    </div>
  );
}

// Export a hook to open the custom audio manager
export { default as CustomAudioManager } from './CustomAudioManager';
