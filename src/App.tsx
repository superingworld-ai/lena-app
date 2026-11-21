import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Volume2, VolumeX } from "lucide-react";
import { playChime, setMuted, startAmbient, stopAmbient } from "./lib/sound";

type ParticleKind = "petal" | "heart";

interface Particle {
  id: number;
  kind: ParticleKind;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  swayDuration: number;
  opacity: number;
  hue: number;
  spin: number;
}

const PHRASES = [
  "Ты не одна — я рядом с тобой.",
  "Твои чувства важны, и они имеют значение.",
  "Ты справляешься лучше, чем думаешь.",
  "Дыши. Ты в безопасности, и ты любима.",
  "Позволь себе отдохнуть — ты заслужил это.",
  "Ты — целая вселенная, а не только заботы.",
  "Даже в самые серые дни ты — чей-то свет.",
  "Слёзы — это тоже сила, ты имеешь право чувствовать.",
  "Ты делаешь достаточно. Правда достаточно.",
  "Я горжусь тобой за каждый маленький шаг.",
  "Ты не обязана быть сильной постоянно.",
  "Пусть этот день будет мягким к тебе.",
  "Ты стоишь всех хороших вещей, что случаются.",
  "Обнимаю тебя — тепло, крепко и по-настоящему.",
  "Всё пройдёт, а ты останешься прекрасной.",
];

const PARTICLE_COUNT = 24;

function spawnParticle(id: number): Particle {
  const kind: ParticleKind = Math.random() < 0.7 ? "petal" : "heart";
  return {
    id,
    kind,
    left: Math.random() * 100,
    size: kind === "petal" ? 10 + Math.random() * 14 : 8 + Math.random() * 10,
    duration: 11 + Math.random() * 12,
    delay: Math.random() * 18,
    drift: 24 + Math.random() * 40,
    swayDuration: 2.6 + Math.random() * 2.8,
    opacity: 0.45 + Math.random() * 0.4,
    hue: 336 + Math.random() * 22,
    spin: Math.random() < 0.5 ? 1 : -1,
  };
}

function ParticleLayer(): React.JSX.Element {
  const [particles, setParticles] = useState<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => spawnParticle(i)),
  );
  const nextId = useRef(PARTICLE_COUNT);

  const recycle = useCallback((id: number) => {
    setParticles((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const next = prev.slice();
      next[idx] = spawnParticle(nextId.current++);
      return next;
    });
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="fall-anim absolute top-[-6vh]"
          style={{
            left: `${p.left}%`,
            ['--fall-duration' as string]: `${p.duration}s`,
            ['--fall-delay' as string]: `${p.delay}s`,
          }}
        >
          <PetalHeartSprite particle={p} onDone={recycle} />
        </div>
      ))}
    </div>
  );
}

function PetalHeartSprite({
  particle,
  onDone,
}: {
  particle: Particle;
  onDone: (id: number) => void;
}): React.JSX.Element {
  const { kind, size, opacity, hue, swayDuration, spin, id } = particle;

  const style: React.CSSProperties = {
    width: size,
    height: kind === "petal" ? size * 0.82 : size,
    opacity,
    ['--sway-duration' as string]: `${swayDuration}s`,
    animationDirection: spin === 1 ? 'normal' : 'alternate-reverse',
  };

  useEffect(() => {
    const total = (particle.delay + particle.duration) * 1000;
    const timer = window.setTimeout(() => onDone(id), total);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (kind === "heart") {
    return (
      <svg viewBox="0 0 24 24" className="sway-anim" style={style} fill="none">
        <path
          d="M12 21s-7.2-4.7-9.4-9.1C.9 8.6 2.6 4.9 6.2 4.3c2-.3 4 .6 5.8 2.7 1.8-2.1 3.8-3 5.8-2.7 3.6.6 5.3 4.3 3.6 7.6C19.2 16.3 12 21 12 21z"
          fill={`hsl(${hue} 62% 74%)`}
        />
      </svg>
    );
  }

  return (
    <div
      className="sway-anim"
      style={{
        ...style,
        borderRadius: "62% 38% 55% 45% / 55% 45% 62% 38%",
        background: `linear-gradient(135deg, hsl(${hue} 78% 82%), hsl(${hue + 14} 64% 70%))`,
        boxShadow: "inset 0 0 4px rgba(255,255,255,0.55)",
      }}
    />
  );
}


function App(): React.JSX.Element {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [hugCount, setHugCount] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [visible, setVisible] = useState(true);
  const avatarProgress = Math.min(hugCount / 12, 1);
  const avatarStyle: React.CSSProperties = {
    ['--avatar-contrast' as string]: `${1.02 + avatarProgress * 0.3}`,
    ['--avatar-saturation' as string]: `${1.04 + avatarProgress * 0.25}`,
    ['--avatar-brightness' as string]: `${0.98 + avatarProgress * 0.06}`,
    ['--avatar-ring-opacity' as string]: `${0.32 + avatarProgress * 0.48}`,
    ['--avatar-glow' as string]: `${0.16 + avatarProgress * 0.22}`,
  };

  const hug = useCallback(() => {
    playChime();
    setHugCount((c) => c + 1);
    setPhraseIndex((i) => (i + 1) % PHRASES.length);
    setVisible(false);
    window.setTimeout(() => setVisible(true), 120);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      setMuted(next);
      if (!next) startAmbient();
      else stopAmbient();
      return next;
    });
  }, []);

  useEffect(() => {
    const unlock = () => {
      startAmbient();
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-14">
      <button
        onClick={toggleMute}
        aria-label={muted ? "Включить звук" : "Выключить звук"}
        className="fixed top-4 right-4 z-20 rounded-full border border-blush-200 bg-white/70 p-2.5 text-rosewood-400 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:text-rosewood-500 active:scale-95"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <ParticleLayer />

      <main className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8 text-center sm:gap-10">
        <div className="avatar-frame animate-float-in" style={avatarStyle}>
          <div className="avatar-ring" aria-hidden="true" />
          <img
            src="/images/photo_2026-07-08_20-40-12.jpg"
            alt="Нежный портрет с розовыми пионами"
            className="avatar-photo"
            width={224}
            height={224}
          />
          <div className="avatar-shine" aria-hidden="true" />
        </div>

        <h1 className="animate-float-in font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-rosewood-600 sm:text-5xl">
          Я рядом с тобой
        </h1>

        <div
          key={phraseIndex}
          className={`w-full rounded-3xl border border-blush-200/70 bg-white/75 p-8 shadow-[0_10px_40px_-16px_rgba(185,94,119,0.35)] backdrop-blur-md transition-all duration-700 ease-out sm:p-10 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"}`}
        >
          <p className="font-[family-name:var(--font-body)] text-xl leading-relaxed text-rosewood-500 sm:text-2xl">
            {PHRASES[phraseIndex]}
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {PHRASES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === phraseIndex ? "w-6 bg-blush-400" : "w-1.5 bg-blush-200"}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={hug}
          className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-blush-400 to-blush-500 px-9 py-4 font-[family-name:var(--font-display)] text-lg font-semibold text-white shadow-lg shadow-blush-300/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blush-300/60 active:scale-95"
        >
          <Heart className="h-5 w-5 fill-white/90 transition-transform duration-300 group-hover:scale-125 group-active:scale-100" />
          Обнять меня
        </button>

        <div className="flex items-center gap-2 text-sm text-rosewood-400 sm:text-base">
          <Heart className="h-4 w-4 fill-blush-300 text-blush-300" />
          <span>
            Отправлено тепла и объятий:{" "}
            <span className="font-semibold text-rosewood-500">{hugCount}</span>
          </span>
        </div>
      </main>
    </div>
  );
}

export default App;
