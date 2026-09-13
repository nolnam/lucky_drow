/**
 * 9절 사운드. 오디오 파일을 두지 않고 Web Audio로 합성한다 — 오프라인 행사장에서도
 * 네트워크나 에셋 로딩에 걸리지 않는다. 자동재생 정책 때문에 AudioContext는
 * 첫 사용자 조작 시점에 만들고, 실패해도 추첨 자체는 막지 않는다.
 */
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function blip(freq: number, startAt: number, duration: number, gain: number, type: OscillatorType) {
  const ac = audio()
  if (!ac) return

  const osc = ac.createOscillator()
  const vol = ac.createGain()
  const t0 = ac.currentTime + startAt

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  vol.gain.setValueAtTime(0, t0)
  vol.gain.linearRampToValueAtTime(gain, t0 + 0.008)
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(vol).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** 세그먼트가 포인터를 지나갈 때. */
export function playTick() {
  blip(1180, 0, 0.045, 0.09, 'square')
}

/** 당첨 효과음 — 짧은 상승 아르페지오. */
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((f, i) => blip(f, i * 0.1, 0.42, 0.16, 'triangle'))
}

/** 사운드를 켠 직후 등 사용자 조작 시점에 컨텍스트를 미리 깨워 둔다. */
export function primeAudio() {
  audio()
}
