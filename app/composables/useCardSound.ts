/**
 * Small UI sounds for the badge designer, synthesised with Web Audio (no audio files to load).
 *
 *   tick  - picking something up
 *   drop  - an image landing in its slot (a soft, falling "pop")
 *   chime - template saved (two bell-like notes)
 *   whoosh - the finished card flying out
 *   deal  - one card snapping into the fan (paper flick + a low thud)
 *
 * Off by default. Turning it on happens on a click, which also satisfies the browsers'
 * autoplay rules, and plays one tick so you hear that it works. Everything goes through
 * one master gain and a compressor, so overlapping sounds never clip. If Web Audio is
 * unavailable, it stays silent.
 */
export function useCardSound() {
  const enabled = ref(false)
  let ctx: AudioContext | null = null
  let out: AudioNode | null = null
  let noise: AudioBuffer | null = null

  function ensureContext() {
    if (ctx || !import.meta.client) return ctx
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    const master = ctx.createGain()
    master.gain.value = 0.9
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 4
    master.connect(comp).connect(ctx.destination)
    out = master
    // half a second of white noise, shaped per sound below
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return ctx
  }

  function toggle() {
    enabled.value = !enabled.value
    if (enabled.value) {
      ensureContext()?.resume().then(() => tick()).catch(() => {})
    }
  }

  /** Start time `delay` seconds from now, or null when sound is off. */
  const at = (delay: number) => (enabled.value && ctx && out && ctx.state === 'running' ? ctx.currentTime + delay : null)

  /** A gain envelope: quick attack to `peak`, exponential fade over `decay` seconds. */
  function env(t: number, peak: number, decay: number, attack = 0.005) {
    const g = ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
    g.connect(out!)
    return g
  }

  /** Filtered noise burst. */
  function hiss(t: number, len: number, type: BiquadFilterType, freq: number, q: number) {
    const src = ctx!.createBufferSource()
    src.buffer = noise
    const f = ctx!.createBiquadFilter()
    f.type = type
    f.frequency.setValueAtTime(freq, t)
    f.Q.value = q
    src.connect(f)
    src.start(t)
    src.stop(t + len)
    return { src, f }
  }

  /** A short sine/triangle note gliding from `from` to `to` Hz. */
  function tone(t: number, type: OscillatorType, from: number, to: number, len: number) {
    const o = ctx!.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(from, t)
    if (to !== from) o.frequency.exponentialRampToValueAtTime(to, t + len)
    o.start(t)
    o.stop(t + len + 0.05)
    return o
  }

  function tick(delay = 0) {
    const t = at(delay)
    if (t === null) return
    tone(t, 'sine', 2100, 1700, 0.03).connect(env(t, 0.05, 0.035, 0.002))
    hiss(t, 0.03, 'highpass', 4000, 0.7).f.connect(env(t, 0.03, 0.02, 0.001))
  }

  function drop(delay = 0) {
    const t = at(delay)
    if (t === null) return
    tone(t, 'sine', 720, 260, 0.16).connect(env(t, 0.12, 0.16, 0.004))
    tone(t, 'triangle', 1440, 520, 0.08).connect(env(t, 0.025, 0.08, 0.002))
  }

  function chime(delay = 0) {
    const t = at(delay)
    if (t === null) return
    const notes: [number, number][] = [[1318.5, 0], [1975.5, 0.11]] // E6, B6
    for (const [hz, d] of notes) {
      tone(t + d, 'sine', hz, hz, 0.9).connect(env(t + d, 0.06, 0.9, 0.006))
      tone(t + d, 'sine', hz * 2.76, hz * 2.76, 0.3).connect(env(t + d, 0.012, 0.3, 0.004)) // bell overtone
    }
  }

  function whoosh(delay = 0) {
    const t = at(delay)
    if (t === null) return
    const len = 0.55
    const { f } = hiss(t, len, 'bandpass', 380, 1.1)
    f.frequency.exponentialRampToValueAtTime(2600, t + len * 0.55)
    f.frequency.exponentialRampToValueAtTime(900, t + len)
    f.connect(env(t, 0.1, len - 0.12, 0.12))
  }

  function deal(delay = 0, pitch = 1) {
    const t = at(delay)
    if (t === null) return
    // paper flick
    const { f } = hiss(t, 0.12, 'bandpass', 3200 * pitch, 1.4)
    f.frequency.exponentialRampToValueAtTime(1500 * pitch, t + 0.09)
    f.connect(env(t, 0.11, 0.09, 0.003))
    // the card settling: a soft low thud
    tone(t + 0.015, 'sine', 160 * pitch, 70, 0.1).connect(env(t + 0.015, 0.09, 0.1, 0.004))
  }

  onBeforeUnmount(() => {
    ctx?.close().catch(() => {})
    ctx = null
    out = null
  })

  return { enabled, toggle, tick, drop, chime, whoosh, deal }
}
