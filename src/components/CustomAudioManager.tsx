import { useState, useRef } from 'react';
import type { MusicCategory } from '../utils/soundEngine';
import { CATEGORY_META } from './MusicPlayer';

// Custom uploaded tracks stored in memory (per session)
interface CustomTrack {
  id: string;
  name: string;
  category: MusicCategory;
  url: string; // object URL from File
  size: string;
}

let _customTracks: CustomTrack[] = [];
let _activeCustomTrack: string | null = null;
let _customAudio: HTMLAudioElement | null = null;

export function playCustomTrack(id: string) {
  const track = _customTracks.find(t => t.id === id);
  if (!track) return;
  if (_customAudio) { _customAudio.pause(); _customAudio = null; }
  _activeCustomTrack = id;
  _customAudio = new Audio(track.url);
  _customAudio.loop = true;
  _customAudio.volume = 0.6;
  _customAudio.play().catch(() => {});
}

export function stopCustomAudio() {
  if (_customAudio) { _customAudio.pause(); _customAudio = null; }
  _activeCustomTrack = null;
}

export function getCustomTracks() { return _customTracks; }

interface Props {
  onClose: () => void;
}

export default function CustomAudioManager({ onClose }: Props) {
  const [tracks, setTracks] = useState<CustomTrack[]>([..._customTracks]);
  const [activeId, setActiveId] = useState<string | null>(_activeCustomTrack);
  const [dragging, setDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory>('quiz');
  const fileRef = useRef<HTMLInputElement>(null);

  const SUPPORTED = ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/aac','audio/m4a','audio/flac'];

  const addFiles = (files: File[]) => {
    const newTracks: CustomTrack[] = [];
    files.forEach(file => {
      if (!SUPPORTED.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/i)) return;
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(file);
      const size = file.size > 1024*1024 ? `${(file.size/1024/1024).toFixed(1)}MB` : `${Math.round(file.size/1024)}KB`;
      const track: CustomTrack = { id, name: file.name.replace(/\.[^/.]+$/, ''), category: selectedCategory, url, size };
      newTracks.push(track);
    });
    _customTracks = [..._customTracks, ...newTracks];
    setTracks([..._customTracks]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handlePlay = (id: string) => {
    playCustomTrack(id);
    setActiveId(id);
  };

  const handleStop = () => {
    stopCustomAudio();
    setActiveId(null);
  };

  const handleDelete = (id: string) => {
    const track = _customTracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    if (activeId === id) handleStop();
    _customTracks = _customTracks.filter(t => t.id !== id);
    setTracks([..._customTracks]);
  };

  const handleCategoryChange = (id: string, cat: MusicCategory) => {
    _customTracks = _customTracks.map(t => t.id === id ? { ...t, category: cat } : t);
    setTracks([..._customTracks]);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-[#0a0f1e] border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/25 to-indigo-700/25 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-xl flex items-center gap-2">🎵 Custom Audio</h2>
            <p className="text-white/40 text-sm">Upload your own songs · MP3, WAV, OGG, AAC, FLAC</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-5">
          {/* Category for upload */}
          <div>
            <label className="text-white/50 text-xs font-bold tracking-wider uppercase block mb-2">Assign to Category</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['lightning','formation','tug','quiz','victory','suspense','countdown','tournament','classroom','home'] as MusicCategory[]).map(cat => {
                const m = CATEGORY_META[cat];
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-center transition-all ${selectedCategory===cat?'border-opacity-60 scale-[1.02]':'border-white/8 hover:border-white/20'}`}
                    style={selectedCategory===cat?{background:m.color+'20',borderColor:m.color+'60'}:{background:'rgba(255,255,255,0.03)'}}>
                    <span className="text-lg leading-none">{m.icon}</span>
                    <span className="text-xs leading-none" style={{color:selectedCategory===cat?m.color:'rgba(255,255,255,0.4)',fontSize:'9px'}}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging ? 'border-purple-400 bg-purple-400/10 scale-[1.01]' : 'border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5'
            }`}>
            <div className="text-4xl mb-3">{dragging ? '📂' : '🎵'}</div>
            <div className="text-white font-bold mb-1">{dragging ? 'Drop songs here!' : 'Drag & drop your songs here'}</div>
            <div className="text-white/35 text-sm mb-3">or click to browse files</div>
            <div className="text-white/20 text-xs">MP3 · WAV · OGG · AAC · M4A · FLAC</div>
            <input ref={fileRef} type="file" multiple accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a,.flac"
              className="hidden" onChange={handleFileInput} />
          </div>

          {/* Track list */}
          {tracks.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/50 text-xs font-bold tracking-wider uppercase">Your Tracks ({tracks.length})</label>
                {activeId && <button onClick={handleStop} className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors">⏹ Stop</button>}
              </div>
              <div className="space-y-2">
                {tracks.map(track => {
                  const m = CATEGORY_META[track.category];
                  const isPlaying = activeId === track.id;
                  return (
                    <div key={track.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isPlaying?'border-green-400/40 bg-green-400/8':'border-white/8 bg-white/3 hover:border-white/15'}`}>
                      <button onClick={() => isPlaying ? handleStop() : handlePlay(track.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all ${isPlaying?'bg-green-500/30 text-green-300 animate-pulse':'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{track.name}</div>
                        <div className="text-white/30 text-xs">{track.size}</div>
                      </div>
                      {/* Category selector */}
                      <select value={track.category}
                        onChange={e => handleCategoryChange(track.id, e.target.value as MusicCategory)}
                        className="bg-white/8 border border-white/12 text-xs rounded-lg px-2 py-1 text-white/70 focus:outline-none focus:ring-1 focus:ring-purple-400"
                        style={{background:'rgba(255,255,255,0.05)'}}>
                        {(Object.keys(CATEGORY_META) as MusicCategory[]).map(cat => (
                          <option key={cat} value={cat} style={{background:'#0a0f1e'}}>{CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}</option>
                        ))}
                      </select>
                      {/* Category badge */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{background:m.color+'20',border:`1px solid ${m.color}40`}}>
                        {m.icon}
                      </div>
                      <button onClick={() => handleDelete(track.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 flex items-center justify-center text-sm flex-shrink-0 transition-all">
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-white/25">
              <div className="text-4xl mb-2">🎶</div>
              <p className="text-sm">No custom tracks yet</p>
              <p className="text-xs mt-1">Upload songs to replace YouTube music</p>
            </div>
          )}

          {/* How to use */}
          <div className="bg-blue-500/8 border border-blue-400/20 rounded-2xl p-4">
            <div className="text-blue-400 text-xs font-bold mb-2">💡 How it works</div>
            <ul className="text-white/40 text-xs space-y-1">
              <li>• Upload any song from your device (MP3, WAV, etc.)</li>
              <li>• Assign it to a game category (Quiz, Battle, Victory, etc.)</li>
              <li>• Press ▶ to preview — it loops automatically during games</li>
              <li>• Custom tracks play instead of YouTube in that category</li>
              <li>• Tracks are session-only (cleared when you close the tab)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
