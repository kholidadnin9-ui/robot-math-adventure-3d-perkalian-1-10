import type { ReactNode } from "react";
import {
  Building2,
  Coins,
  Cpu,
  Heart,
  Music2,
  Orbit,
  Rocket,
  Star,
  Trees,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { LevelConfig } from "../game/levels";

export function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Robot Math Adventure">
      <defs>
        <linearGradient id="logo-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ce7ff" />
          <stop offset="100%" stopColor="#2f7dff" />
        </linearGradient>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe79a" />
          <stop offset="100%" stopColor="#ffb01f" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="#0c1834" stroke="rgba(119,222,255,.35)" />
      <path d="M24 8v5" stroke="#ffd257" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="8" r="2.8" fill="#ffd257" />
      <rect x="12" y="14" width="24" height="20" rx="7" fill="url(#logo-blue)" />
      <rect x="16" y="19" width="16" height="8" rx="4" fill="#0b1730" stroke="#c8f5ff" strokeWidth="1.2" />
      <circle cx="20.5" cy="23" r="1.9" fill="#8ffaff" />
      <circle cx="27.5" cy="23" r="1.9" fill="#8ffaff" />
      <rect x="21" y="36" width="6" height="3" rx="1.5" fill="url(#logo-gold)" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={compact ? 38 : 44} />
      <div className="leading-none">
        <div className="font-display text-[15px] font-semibold tracking-[0.08em] text-white">
          ROBOT MATH
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="font-display text-[10px] font-medium tracking-[0.22em] text-electric">
            ADVENTURE
          </span>
          <span className="rounded bg-sun/15 px-1 py-0.5 font-display text-[9px] font-semibold tracking-wider text-sun">
            3D
          </span>
        </div>
      </div>
    </div>
  );
}

const levelIcons = {
  building: Building2,
  trees: Trees,
  tunnel: Orbit,
  cpu: Cpu,
  rocket: Rocket,
};

export function LevelIcon({ level, size = 20 }: { level: LevelConfig; size?: number }) {
  const Icon = levelIcons[level.icon];
  return <Icon size={size} strokeWidth={2.1} />;
}

export function Hearts({ lives, max = 3, size = 17 }: { lives: number; max?: number; size?: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${lives} dari ${max} nyawa`}>
      {Array.from({ length: max }).map((_, index) => (
        <Heart
          key={index}
          size={size}
          strokeWidth={2.4}
          className={index < lives ? "fill-coral text-coral drop-shadow-[0_0_6px_rgba(255,101,122,.45)]" : "text-slate-500/60"}
        />
      ))}
    </span>
  );
}

export function CoinValue({ value, size = 17 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-display font-semibold tabular-nums">
      <span className="grid place-items-center rounded-full bg-sun text-amber-900 shadow-[0_0_10px_rgba(255,210,87,.25)]" style={{ width: size, height: size }}>
        <Coins size={size * 0.68} strokeWidth={2.6} />
      </span>
      {value.toLocaleString("id-ID")}
    </span>
  );
}

export function StarRow({ value, size = 18, muted = false }: { value: number; size?: number; muted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} dari 3 bintang`}>
      {[0, 1, 2].map((index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={2}
          className={
            index < value
              ? "fill-sun text-sun drop-shadow-[0_0_6px_rgba(255,210,87,.45)]"
              : muted
                ? "text-slate-600/60"
                : "text-slate-500/50"
          }
        />
      ))}
    </span>
  );
}

export function SoundControls({
  sound,
  music,
  onSound,
  onMusic,
  compact = false,
}: {
  sound: boolean;
  music: boolean;
  onSound: () => void;
  onMusic: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="icon-btn"
        data-active={sound}
        onClick={onSound}
        aria-label={sound ? "Matikan efek suara" : "Nyalakan efek suara"}
        title={sound ? "Efek suara aktif" : "Efek suara mati"}
      >
        {sound ? <Volume2 size={compact ? 17 : 18} /> : <VolumeX size={compact ? 17 : 18} />}
      </button>
      <button
        type="button"
        className="icon-btn"
        data-active={music}
        onClick={onMusic}
        aria-label={music ? "Matikan musik" : "Nyalakan musik"}
        title={music ? "Musik aktif" : "Musik mati"}
      >
        <Music2 size={compact ? 17 : 18} className={music ? "" : "opacity-50"} />
        {!music && <span className="sr-only">Musik mati</span>}
      </button>
    </div>
  );
}

export function Confetti({ count = 26 }: { count?: number }) {
  const colors = ["#ffd257", "#5de2ff", "#69f0ae", "#ff8de0", "#b695ff", "#ffb01f"];
  const pieces = Array.from({ length: count }, (_, index) => ({
    left: `${(index * 37) % 100}%`,
    delay: `${(index % 9) * 0.35}s`,
    duration: `${3.4 + (index % 5) * 0.45}s`,
    color: colors[index % colors.length],
    rotate: `${(index * 47) % 180}deg`,
    rounded: index % 3 === 0,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="confetti"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotate})`,
            borderRadius: piece.rounded ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  accent = "text-white",
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="stat-tile">
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-display text-xl font-semibold tabular-nums ${accent}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}
