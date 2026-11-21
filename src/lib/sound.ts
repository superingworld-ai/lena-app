let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
let muted = false;

function ensureAudio(): AudioContext {
  if (!ctx) {
    const Ctor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function makeNoiseBuffer(audio: AudioContext): AudioBuffer {
  const seconds = 4;
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    // Paul Kellet pink-noise approximation: softer, warmer than white noise.
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
  }
  return buffer;
}

export function playChime(): void {
  const audio = ensureAudio();
  const now = audio.currentTime;

  const gentle = audio.createGain();
  gentle.gain.value = 0.9;
  gentle.connect(master!);

  // Warm low "embrace" swell, mostly felt rather than heard.
  const swell = audio.createOscillator();
  swell.type = "sine";
  swell.frequency.setValueAtTime(98, now);
  swell.frequency.exponentialRampToValueAtTime(82, now + 1.4);
  const swellGain = audio.createGain();
  swellGain.gain.setValueAtTime(0.0001, now);
  swellGain.gain.exponentialRampToValueAtTime(0.075, now + 0.12);
  swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  swell.connect(swellGain).connect(gentle);
  swell.start(now);
  swell.stop(now + 1.6);

  // Soft muted chord (F major add9), staggered like a music box.
  const notes = [174.61, 220, 261.63, 293.66, 392];
  const lowpass = audio.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1600;
  lowpass.Q.value = 0.4;
  lowpass.connect(gentle);

  notes.forEach((freq, i) => {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const partial = audio.createOscillator();
    partial.type = "triangle";
    partial.frequency.value = freq * 2;
    const partialGain = audio.createGain();
    partialGain.gain.value = 0.035;

    const gain = audio.createGain();
    const t0 = now + i * 0.05;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.085, t0 + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4 - i * 0.08);

    osc.connect(gain);
    partial.connect(partialGain).connect(gain);
    gain.connect(lowpass);
    osc.start(t0);
    partial.start(t0);
    const end = t0 + 1.5 - i * 0.08;
    osc.stop(end);
    partial.stop(end);
  });

  // Slight fade on the shared bus so overlapping clicks never clip.
  gentle.gain.setValueAtTime(0.9, now);
  gentle.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  setTimeout(() => gentle.disconnect(), 2000);
}

export function startAmbient(): void {
  const audio = ensureAudio();
  if (ambient) return;

  const buffer = makeNoiseBuffer(audio);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.3;

  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 180;

  const gain = audio.createGain();
  gain.gain.value = 0.0001;
  gain.gain.setTargetAtTime(0.05, audio.currentTime, 2.5);

  // Slow LFO breathing, like a gentle draft.
  const lfo = audio.createOscillator();
  lfo.frequency.value = 0.13;
  const lfoGain = audio.createGain();
  lfoGain.gain.value = 0.018;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();

  source.connect(hp).connect(lp).connect(gain).connect(master!);
  source.start();

  ambient = { source, gain };
  // Keep the LFO reference via source.onended noop; store for stop.
  (ambient as { lfo?: OscillatorNode }).lfo = lfo;
}

export function stopAmbient(): void {
  if (!ambient || !ctx) return;
  const { source, gain } = ambient;
  const lfo = (ambient as { lfo?: OscillatorNode }).lfo;
  gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.9);
  const stopAt = ctx.currentTime + 3;
  try {
    source.stop(stopAt);
  } catch {
    // already stopped
  }
  if (lfo) {
    try {
      lfo.stop(stopAt);
    } catch {
      // already stopped
    }
  }
  ambient = null;
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.15);
  }
  if (next) {
    stopAmbient();
  }
}
