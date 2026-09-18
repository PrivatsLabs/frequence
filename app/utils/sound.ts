let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
  const audioCtx = getCtx()
  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  osc.type = type
  osc.frequency.value = freq

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime + start)
  gainNode.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + start + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration)

  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(audioCtx.currentTime + start)
  osc.stop(audioCtx.currentTime + start + duration + 0.05)
}

// Tâche validée : tick net, discipliné
export function playTaskComplete() {
  tone(720, 0, 0.09, 'sine', 0.18)
  tone(1080, 0.06, 0.12, 'sine', 0.14)
}

// Journée complète : petit accord ascendant, triomphe sobre
export function playAllComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // Do5, Mi5, Sol5, Do6
  notes.forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.16))
}