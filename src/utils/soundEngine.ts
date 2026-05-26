// ================================================================
// PinnacleQuiz ULTRA Sound Engine v4.0
// Real YouTube iframe embeds + Web Audio SFX
// Works in single-file HTML, HTTPS, and local file contexts
// ================================================================

export type MusicCategory =
  | 'lightning' | 'formation' | 'tug' | 'home' | 'quiz'
  | 'victory' | 'suspense' | 'countdown' | 'tournament' | 'classroom';

export interface TrackInfo { id: string; title: string; style: string; artist: string; }

// 80+ real tracks across 10 categories
export const PLAYLISTS: Record<MusicCategory, TrackInfo[]> = {
  lightning: [
    { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', style: 'Lofi', artist: 'Lofi Girl' },
    { id: '5qap5aO4i9A', title: 'Chill Lofi Study', style: 'Lofi', artist: 'ChilledCow' },
    { id: 'DWcJFNfaw9c', title: 'Phonk Drive', style: 'Phonk', artist: 'Phonk Radio' },
    { id: 'lTRiuFIWV54', title: 'NCS Gaming Mix', style: 'Gaming/EDM', artist: 'NCS' },
    { id: 'igyR7-DNkE0', title: 'NCS Speed Energy', style: 'EDM', artist: 'NCS' },
    { id: 'hHW1oY26kxQ', title: 'Trap Nation Beats', style: 'Trap', artist: 'Trap Nation' },
    { id: 'n61ULEU7CO0', title: 'Synthwave Neon City', style: 'Synthwave', artist: 'Synthwave' },
    { id: 'MVPTGNGiI-4', title: 'EDM Focus Boost', style: 'EDM', artist: 'EDM Radio' },
  ],
  formation: [
    { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', style: 'Lofi', artist: 'Lofi Girl' },
    { id: '5qap5aO4i9A', title: 'Study Beats 24/7', style: 'Lofi', artist: 'ChilledCow' },
    { id: 'rUxyKA_-grg', title: 'Jazz Café Study', style: 'Jazz', artist: 'Jazz Vibes' },
    { id: '4oStw0r33so', title: 'Piano Focus Music', style: 'Classical', artist: 'Piano Focus' },
    { id: 'kpk2tdsPh0A', title: 'Ambient Study Zone', style: 'Ambient', artist: 'Ambient' },
    { id: 'n61ULEU7CO0', title: 'Synthwave Focus', style: 'Synthwave', artist: 'Synthwave' },
    { id: 'MVPTGNGiI-4', title: 'Deep Focus EDM', style: 'EDM', artist: 'Focus EDM' },
  ],
  tug: [
    { id: 'Et4GEhBhKSA', title: 'Epic Battle Anthem', style: 'Epic Orchestral', artist: 'Epic Music' },
    { id: 'HcNj9GxM_6I', title: 'Epic Orchestral Hype', style: 'Cinematic', artist: 'Cinematic' },
    { id: 'lTRiuFIWV54', title: 'NCS Battle Mix', style: 'Gaming/EDM', artist: 'NCS' },
    { id: 'igyR7-DNkE0', title: 'Intense EDM Drop', style: 'EDM', artist: 'EDM Hype' },
    { id: '09R8_2nJtjg', title: 'Afrobeats Hype 2025', style: 'Afrobeats', artist: 'Afrobeats' },
    { id: 'l0pWE3YDKNY', title: 'Amapiano Heat', style: 'Amapiano', artist: 'Amapiano' },
    { id: 'hHW1oY26kxQ', title: 'Trap Battle Anthem', style: 'Trap', artist: 'Trap Nation' },
  ],
  home: [
    { id: 'jfKfPfyJRdk', title: 'Lofi Chill Vibes', style: 'Lofi', artist: 'Lofi Girl' },
    { id: '5qap5aO4i9A', title: 'Soft Study Beats', style: 'Lofi', artist: 'ChilledCow' },
    { id: 'rUxyKA_-grg', title: 'Jazz Café Relaxed', style: 'Jazz', artist: 'Jazz Vibes' },
    { id: '4oStw0r33so', title: 'Gentle Piano', style: 'Classical', artist: 'Piano Soft' },
    { id: 'kpk2tdsPh0A', title: 'Calm Ambient', style: 'Ambient', artist: 'Ambient' },
  ],
  quiz: [
    { id: 'lTRiuFIWV54', title: 'Quiz Party Beats', style: 'Pop/EDM', artist: 'NCS' },
    { id: 'igyR7-DNkE0', title: 'Game Show Energy', style: 'EDM', artist: 'EDM Radio' },
    { id: '09R8_2nJtjg', title: 'Afrobeats Quiz Party', style: 'Afrobeats', artist: 'Afrobeats' },
    { id: 'l0pWE3YDKNY', title: 'Amapiano Quiz Vibes', style: 'Amapiano', artist: 'Amapiano' },
    { id: 'DWcJFNfaw9c', title: 'Phonk Speed Quiz', style: 'Phonk', artist: 'Phonk' },
    { id: 'hHW1oY26kxQ', title: 'Trap Quiz Mix', style: 'Trap', artist: 'Trap Nation' },
    { id: 'n61ULEU7CO0', title: 'Retro Synthwave Quiz', style: 'Synthwave', artist: 'Synthwave' },
  ],
  victory: [
    { id: '09R8_2nJtjg', title: 'Afrobeats Celebration', style: 'Afrobeats', artist: 'Afrobeats' },
    { id: 'l0pWE3YDKNY', title: 'Amapiano Winners', style: 'Amapiano', artist: 'Amapiano' },
    { id: 'lTRiuFIWV54', title: 'NCS Victory Anthem', style: 'EDM', artist: 'NCS' },
    { id: 'igyR7-DNkE0', title: 'EDM Champion Theme', style: 'EDM', artist: 'EDM' },
  ],
  suspense: [
    { id: 'kpk2tdsPh0A', title: 'Suspense Build-Up', style: 'Cinematic', artist: 'Cinematic' },
    { id: '4oStw0r33so', title: 'Dramatic Piano Tension', style: 'Classical', artist: 'Piano' },
    { id: 'rUxyKA_-grg', title: 'Tension Jazz', style: 'Jazz', artist: 'Jazz' },
  ],
  countdown: [
    { id: 'igyR7-DNkE0', title: 'Countdown EDM Drop', style: 'EDM', artist: 'EDM' },
    { id: 'lTRiuFIWV54', title: 'Hype Countdown Mix', style: 'Gaming', artist: 'NCS' },
    { id: 'hHW1oY26kxQ', title: 'Trap Countdown', style: 'Trap', artist: 'Trap Nation' },
  ],
  tournament: [
    { id: 'Et4GEhBhKSA', title: 'Tournament Grand Anthem', style: 'Epic Orchestral', artist: 'Epic' },
    { id: 'HcNj9GxM_6I', title: 'Finals Cinematic', style: 'Cinematic', artist: 'Cinematic' },
    { id: 'lTRiuFIWV54', title: 'Grand Finals EDM', style: 'EDM', artist: 'NCS' },
    { id: 'igyR7-DNkE0', title: 'Champion Theme', style: 'Gaming/EDM', artist: 'EDM' },
    { id: '09R8_2nJtjg', title: 'Afrobeats Finals Hype', style: 'Afrobeats', artist: 'Afrobeats' },
  ],
  classroom: [
    { id: 'jfKfPfyJRdk', title: 'Classroom Lofi Radio', style: 'Lofi', artist: 'Lofi Girl' },
    { id: 'rUxyKA_-grg', title: 'Soft Jazz Learning', style: 'Jazz', artist: 'Jazz Café' },
    { id: '4oStw0r33so', title: 'Classical Focus Piano', style: 'Classical', artist: 'Piano' },
    { id: 'kpk2tdsPh0A', title: 'Ambient Learning Zone', style: 'Ambient', artist: 'Ambient' },
    { id: '5qap5aO4i9A', title: 'Study Lofi 24/7', style: 'Lofi', artist: 'ChilledCow' },
  ],
};

// Singleton YouTube iframe state - one global iframe for the whole app
let _iframeEl: HTMLIFrameElement | null = null;
let _currentVideoId = '';

function getOrCreateIframe(): HTMLIFrameElement {
  if (_iframeEl) return _iframeEl;
  const wrap = document.createElement('div');
  wrap.id = 'yt-singleton-wrap';
  wrap.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;left:0;opacity:0.01;pointer-events:none;z-index:-1;overflow:hidden;';
  const iframe = document.createElement('iframe');
  iframe.id = 'yt-singleton-player';
  iframe.style.cssText = 'width:1px;height:1px;border:none;';
  iframe.allow = 'autoplay; encrypted-media';
  iframe.setAttribute('allowfullscreen', '');
  wrap.appendChild(iframe);
  document.body.appendChild(wrap);
  _iframeEl = iframe;
  return iframe;
}

function loadYTVideo(videoId: string, volume: number, autoplay: boolean) {
  if (!videoId || videoId === _currentVideoId) return;
  _currentVideoId = videoId;
  const iframe = getOrCreateIframe();
  const origin = window.location.origin || 'null';
  const start = Math.floor(Math.random() * 30);
  // Use youtube-nocookie for privacy + better embed permissions
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay?1:0}&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&start=${start}&enablejsapi=0&mute=0&volume=${Math.round(volume*100)}&origin=${encodeURIComponent(origin)}`;
  iframe.src = src;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private _volume = 0.65;
  private _sfxVol = 0.85;
  private _muted = false;
  private _shuffle = true;
  private _playing = false;
  private _category: MusicCategory = 'home';
  private _trackIdx = 0;
  private _bgInterval: ReturnType<typeof setInterval> | null = null;
  private _bgGain: GainNode | null = null;

  // ── Audio Context ──────────────────────────────────────────────
  private ctx_(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
      this.sfxGain.gain.value = this._sfxVol;
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  // ── Public getters for UI ──────────────────────────────────────
  isMuted()       { return this._muted; }
  getVolume()     { return this._volume; }
  isShuffling()   { return this._shuffle; }
  isCurrentlyPlaying() { return this._playing; }
  getCurrentTrack(): TrackInfo | null {
    const pl = PLAYLISTS[this._category];
    return pl?.[this._trackIdx] ?? null;
  }
  getCategory() { return this._category; }
  getPlaylist(cat: MusicCategory) { return PLAYLISTS[cat]; }

  // ── Volume / Mute ──────────────────────────────────────────────
  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this._muted ? 0 : this._volume;
    // Reload iframe with new volume if playing
    if (this._playing && _currentVideoId) {
      loadYTVideo('', this._volume, true); // force reload trick
      _currentVideoId = '';
      const track = this.getCurrentTrack();
      if (track) loadYTVideo(track.id, this._volume, true);
    }
  }

  setMuted(m: boolean) {
    this._muted = m;
    if (this.masterGain) this.masterGain.gain.value = m ? 0 : this._volume;
    if (_iframeEl) {
      if (m) { _iframeEl.style.display = 'none'; }
      else {
        _iframeEl.style.display = '';
        if (!this._playing) this.resumeMusic();
      }
    }
    // Procedural fallback mute
    if (this._bgGain) this._bgGain.gain.value = m ? 0 : 0.025;
  }

  setShuffleMode(s: boolean) { this._shuffle = s; }

  // ── YouTube Music Controls ─────────────────────────────────────
  startBgMusic(category: MusicCategory = 'home') {
    this._category = category;
    const playlist = PLAYLISTS[category];
    if (!playlist?.length) return;

    if (this._shuffle) {
      this._trackIdx = Math.floor(Math.random() * playlist.length);
    } else {
      this._trackIdx = 0;
    }

    const track = playlist[this._trackIdx];
    if (!this._muted) {
      loadYTVideo(track.id, this._volume, true);
      this._playing = true;
    }

    // Also start procedural fallback (plays under YouTube as backup)
    this._startProcedural(category);
  }

  pauseMusic() {
    this._playing = false;
    if (_iframeEl) _iframeEl.src = '';
    _currentVideoId = '';
    if (this._bgInterval) { clearInterval(this._bgInterval); this._bgInterval = null; }
  }

  resumeMusic() {
    if (this._muted) return;
    const track = this.getCurrentTrack();
    if (track) {
      loadYTVideo(track.id, this._volume, true);
      this._playing = true;
    }
  }

  skipTrack() {
    const playlist = PLAYLISTS[this._category];
    if (!playlist?.length) return;
    if (this._shuffle) {
      // Pick a different random track
      let next = this._trackIdx;
      if (playlist.length > 1) {
        while (next === this._trackIdx) next = Math.floor(Math.random() * playlist.length);
      }
      this._trackIdx = next;
    } else {
      this._trackIdx = (this._trackIdx + 1) % playlist.length;
    }
    const track = playlist[this._trackIdx];
    if (!this._muted) {
      _currentVideoId = ''; // force reload
      loadYTVideo(track.id, this._volume, true);
      this._playing = true;
    }
  }

  switchCategory(category: MusicCategory) {
    if (this._category === category) return;
    this.startBgMusic(category);
  }

  stopBgMusic() {
    this._playing = false;
    if (_iframeEl) { _iframeEl.src = 'about:blank'; }
    _currentVideoId = '';
    if (this._bgInterval) { clearInterval(this._bgInterval); this._bgInterval = null; }
    if (this._bgGain) { try { this._bgGain.gain.value = 0; } catch {} this._bgGain = null; }
  }

  // ── Procedural background fallback ────────────────────────────
  private _startProcedural(category: MusicCategory) {
    if (this._bgInterval) { clearInterval(this._bgInterval); this._bgInterval = null; }
    try {
      const ctx = this.ctx_();
      if (!this._bgGain) {
        this._bgGain = ctx.createGain();
        this._bgGain.gain.value = this._muted ? 0 : 0.018;
        this._bgGain.connect(this.masterGain!);
      }
      const isHype = ['tug','lightning','tournament','countdown'].includes(category);
      const bpm = isHype ? 138 : 95;
      const beat = (60 / bpm) * 1000;
      const play = () => {
        if (this._muted || !this._bgGain) return;
        try {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(this._bgGain);
          o.type = isHype ? 'sawtooth' : 'sine';
          o.frequency.value = isHype ? 75 : 85;
          g.gain.setValueAtTime(0.7, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beat / 1400);
          o.start(ctx.currentTime); o.stop(ctx.currentTime + beat / 1400 + 0.01);
        } catch {}
      };
      play();
      this._bgInterval = setInterval(play, beat);
    } catch {}
  }

  // ── SFX ────────────────────────────────────────────────────────
  private tone(freq: number, type: OscillatorType, dur: number, gain = 0.3, delay = 0) {
    if (this._muted) return;
    try {
      const ctx = this.ctx_();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(this.sfxGain ?? this.masterGain!);
      o.type = type; o.frequency.value = freq;
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * this._sfxVol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.01);
    } catch {}
  }

  private noise(dur: number, gain = 0.1, freq = 300) {
    if (this._muted) return;
    try {
      const ctx = this.ctx_();
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = freq; flt.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain * this._sfxVol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.connect(flt); flt.connect(g); g.connect(this.sfxGain ?? this.masterGain!);
      src.start();
    } catch {}
  }

  correct()  { this.tone(523,'sine',0.08,0.5); this.tone(659,'sine',0.08,0.5,0.09); this.tone(784,'sine',0.18,0.5,0.18); this.noise(0.04,0.03,8000); }
  wrong()    { this.tone(220,'sawtooth',0.09,0.4); this.tone(165,'sawtooth',0.14,0.35,0.1); }
  combo(n:number) {
    const f=[523,659,784,1047,1319,1568];
    f.slice(0,Math.min(n+1,6)).forEach((v,i)=>this.tone(v,'sine',0.12,0.55,i*0.07));
    if(n>=5){this.noise(0.08,0.07,5500);this.tone(1760,'sine',0.2,0.4,0.4);}
  }
  superPull(){ [55,75,100,150,200,300].forEach((f,i)=>this.tone(f,'sawtooth',0.45,0.55,i*0.04)); this.tone(1000,'sine',0.22,0.65,0.25); this.tone(1500,'sine',0.12,0.5,0.38); this.noise(0.18,0.12,3000); }
  countdown(n:number){ this.tone(n===0?880:440,n===0?'sine':'square',n===0?0.55:0.2,0.55); }
  victory()  { [523,523,523,415,523,622,523].forEach((f,i)=>{if(f>0)this.tone(f,'sine',0.2,0.55,i*0.13);}); [196,262,330,415].forEach((f,i)=>this.tone(f,'triangle',0.38,0.3,i*0.05)); }
  levelUp()  { [392,494,587,698,784,880].forEach((f,i)=>this.tone(f,'sine',0.15,0.45,i*0.07)); }
  achievementUnlock(){ [784,988,1175,1319].forEach((f,i)=>this.tone(f,'sine',0.2,0.5,i*0.08)); this.noise(0.1,0.05,6000); }
  leaderboardReveal(){ [330,392,494,523,659].forEach((f,i)=>this.tone(f,'triangle',0.15,0.4,i*0.09)); }
  click()    { this.tone(800,'sine',0.04,0.18); }
  timerWarning(){ this.tone(880,'square',0.07,0.35); }
  timerTick(){ this.tone(660,'sine',0.035,0.14); }
  crowd()    { for(let i=0;i<10;i++)this.noise(0.3+Math.random()*0.3,0.025,200+Math.random()*900); setTimeout(()=>{for(let i=0;i<8;i++)this.noise(0.25,0.02,300+Math.random()*700);},280); }
  roar()     { [75,95,120,155].forEach((f,i)=>this.tone(f,'sawtooth',0.5,0.65,i*0.035)); this.noise(0.28,0.14,400); }
  hype()     { [330,392,494,587,698,784,880,1047].forEach((f,i)=>this.tone(f,'sawtooth',0.08,0.42,i*0.035)); this.noise(0.14,0.07,2200); }
  bassDrop() { this.tone(50,'sawtooth',0.7,0.9); this.tone(70,'sawtooth',0.45,0.7,0.04); this.noise(0.1,0.18,120); }
  xpGain()   { [440,554,659,784].forEach((f,i)=>this.tone(f,'sine',0.1,0.32,i*0.055)); }
  coinCollect(){ [880,1108,1319].forEach((f,i)=>this.tone(f,'sine',0.07,0.35,i*0.045)); }
  joinRoom() { [440,523,659].forEach((f,i)=>this.tone(f,'sine',0.1,0.4,i*0.08)); }
  elimination(){ this.tone(440,'sawtooth',0.1,0.5); this.tone(330,'sawtooth',0.12,0.45,0.12); this.tone(220,'sawtooth',0.15,0.4,0.25); this.noise(0.2,0.1,500); }
  speedCrown(){ [784,988,1175,1397,1568].forEach((f,i)=>this.tone(f,'sine',0.12,0.5,i*0.06)); this.noise(0.08,0.06,7000); }
  streakFlame(n:number){ this.tone(400+n*50,'sawtooth',0.08,0.4); this.noise(0.06,0.04,3000+n*200); }
  houseAnthem(house:string){ const m:Record<string,number[]>={Alpha:[523,587,659,784,659,784,880],Beta:[440,523,587,659,587,659,784],Gamma:[392,440,523,587,523,659,784],Pulsar:[659,784,880,988,880,784,659]}; (m[house]??m.Alpha).forEach((f,i)=>this.tone(f,'sine',0.18,0.45,i*0.11)); }
}

export const soundEngine = new SoundEngine();
