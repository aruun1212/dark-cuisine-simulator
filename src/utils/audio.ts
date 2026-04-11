import { reactive } from 'vue'

/**
 * 音效定义：使用 AudioContext 合成简短电子音
 * 每个音效定义为 { freq, duration, type, gain } 或多个音调序列
 */
interface SynthNote {
  freq: number
  duration: number
  type: OscillatorType
  gain?: number
  delay?: number
}

const SFX_DEFS: Record<string, SynthNote[]> = {
  click:  [{ freq: 800, duration: 0.06, type: 'sine', gain: 0.3 }],
  buy:    [{ freq: 600, duration: 0.08, type: 'sine', gain: 0.3 }, { freq: 900, duration: 0.1, type: 'sine', gain: 0.25, delay: 0.08 }],
  place:  [{ freq: 400, duration: 0.1, type: 'triangle', gain: 0.3 }],
  cook:   [{ freq: 200, duration: 0.15, type: 'sawtooth', gain: 0.15 }, { freq: 300, duration: 0.15, type: 'sawtooth', gain: 0.12, delay: 0.15 }],
  crit:   [{ freq: 500, duration: 0.08, type: 'square', gain: 0.2 }, { freq: 800, duration: 0.08, type: 'square', gain: 0.25, delay: 0.08 }, { freq: 1200, duration: 0.15, type: 'square', gain: 0.3, delay: 0.16 }],
  result: [{ freq: 523, duration: 0.15, type: 'sine', gain: 0.3 }, { freq: 659, duration: 0.15, type: 'sine', gain: 0.3, delay: 0.15 }, { freq: 784, duration: 0.25, type: 'sine', gain: 0.35, delay: 0.3 }],
  share:  [{ freq: 1000, duration: 0.05, type: 'sine', gain: 0.2 }, { freq: 1200, duration: 0.08, type: 'sine', gain: 0.2, delay: 0.06 }],
}

const LS_MUSIC_KEY = 'dcs_music'
const LS_SFX_KEY = 'dcs_sfx'

function loadBool(key: string, defaultVal: boolean): boolean {
  const val = localStorage.getItem(key)
  if (val === null) return defaultVal
  return val === 'true'
}

/** Reactive state for UI binding */
export const audioState = reactive({
  musicEnabled: loadBool(LS_MUSIC_KEY, true),
  sfxEnabled: loadBool(LS_SFX_KEY, true),
})

class AudioManager {
  private bgm: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private bgmReady = false

  /** Initialize BGM element (lazy, does not play until user interaction) */
  initBGM() {
    if (this.bgm) return
    // Use import.meta.env.BASE_URL so the path works on both dev and GitHub Pages
    const base = import.meta.env.BASE_URL ?? '/'
    const bgmUrl = `${base}audio/bgm.mp3`
    this.bgm = new Audio(bgmUrl)
    this.bgm.loop = true
    this.bgm.volume = 0.3

    // Handle missing BGM file gracefully
    this.bgm.addEventListener('canplaythrough', () => {
      this.bgmReady = true
    }, { once: true })
    this.bgm.addEventListener('error', () => {
      this.bgmReady = false
    }, { once: true })
    this.bgm.load()
  }

  /** Start BGM playback (call after user interaction) */
  playBGM() {
    if (!audioState.musicEnabled) return
    this.initBGM()
    if (this.bgm && this.bgmReady) {
      this.bgm.play().catch(() => {})
    } else if (this.bgm && !this.bgmReady) {
      // File still loading — play as soon as it's ready
      this.bgm.addEventListener('canplaythrough', () => {
        this.bgmReady = true
        if (audioState.musicEnabled) {
          this.bgm!.play().catch(() => {})
        }
      }, { once: true })
    }
  }

  /** Stop BGM */
  stopBGM() {
    if (this.bgm) {
      this.bgm.pause()
      this.bgm.currentTime = 0
    }
  }

  /** Pause BGM (resume with playBGM) */
  pauseBGM() {
    if (this.bgm) {
      this.bgm.pause()
    }
  }

  /** Toggle music on/off */
  toggleMusic() {
    audioState.musicEnabled = !audioState.musicEnabled
    localStorage.setItem(LS_MUSIC_KEY, String(audioState.musicEnabled))
    if (audioState.musicEnabled) {
      this.playBGM()
    } else {
      this.pauseBGM()
    }
  }

  /** Toggle SFX on/off */
  toggleSFX() {
    audioState.sfxEnabled = !audioState.sfxEnabled
    localStorage.setItem(LS_SFX_KEY, String(audioState.sfxEnabled))
  }

  /** Get or create AudioContext */
  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  /** Play a synthesized sound effect (with dedup guard) */
  private lastSfx = ''
  private lastSfxTime = 0

  playSFX(name: string) {
    if (!audioState.sfxEnabled) return
    const notes = SFX_DEFS[name]
    if (!notes) return

    // Prevent duplicate plays within 80ms (mobile double-fire guard)
    const now = performance.now()
    if (name === this.lastSfx && now - this.lastSfxTime < 80) return
    this.lastSfx = name
    this.lastSfxTime = now

    try {
      const ctx = this.getContext()
      for (const note of notes) {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        osc.type = note.type
        osc.frequency.value = note.freq
        gainNode.gain.value = note.gain ?? 0.3
        // Fade out to avoid clicks
        const startTime = ctx.currentTime + (note.delay ?? 0)
        gainNode.gain.setValueAtTime(note.gain ?? 0.3, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration)
        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + note.duration + 0.01)
      }
    } catch {
      // AudioContext not available, silently fail
    }
  }
}

/** Global singleton */
export const audioManager = new AudioManager()
