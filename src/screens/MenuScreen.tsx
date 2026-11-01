import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Crown,
  Flame,
  Gamepad2,
  Lock,
  Map as MapIcon,
  Medal,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Volume2,
  Zap,
} from "lucide-react";
import { LEVELS, getLevel } from "../game/levels";
import type { Progress } from "../game/storage";
import RobotStage from "../three/RobotStage";
import {
  Brand,
  Hearts,
  LevelIcon,
  LogoMark,
  SoundControls,
  StarRow,
} from "../components/GameChrome";

interface MenuScreenProps {
  progress: Progress;
  onStart: (levelId: number) => void;
  onHowTo: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export default function MenuScreen({
  progress,
  onStart,
  onHowTo,
  onToggleSound,
  onToggleMusic,
}: MenuScreenProps) {
  const recommended = Math.min(5, Math.max(1, progress.unlockedLevel));
  const recommendedLevel = getLevel(recommended);
  const currentRecord = progress.records[recommended];
  const totalStars = LEVELS.reduce((sum, level) => sum + (progress.records[level.id]?.bestStars ?? 0), 0);
  const completedLevels = LEVELS.filter((level) => progress.records[level.id]?.completed).length;
  const journeyPercent = (completedLevels / LEVELS.length) * 100;

  return (
    <div className="app-bg relative min-h-[100dvh]">
      <div className="star-field" />

      <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-7 lg:px-10 lg:py-5">
        <Brand />
        <nav className="hidden items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1 md:flex">
          <button
            type="button"
            onClick={onHowTo}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <CircleHelp size={15} />
            Cara Bermain
          </button>
          <a
            href="#peta-level"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <MapIcon size={15} />
            Peta Level
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 sm:flex">
            <Star size={14} className="fill-sun text-sun" />
            <span className="text-xs font-extrabold text-white">{totalStars}<span className="text-slate-500">/15</span></span>
            <span className="h-3 w-px bg-white/10" />
            <Coins size={14} className="fill-sun text-sun" />
            <span className="text-xs font-extrabold text-white">{progress.coins.toLocaleString("id-ID")}</span>
          </div>
          <SoundControls
            sound={progress.settings.sound}
            music={progress.settings.music}
            onSound={onToggleSound}
            onMusic={onToggleMusic}
            compact
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-8 sm:px-7 lg:px-10">
        <section className="grid items-center gap-8 pb-10 pt-2 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12 lg:pb-12 lg:pt-6 xl:gap-16">
          <div className="animate-slide-up">
            <div className="eyebrow">
              <Sparkles size={13} className="text-sun" />
              Petualangan Matematika • Kelas 2–3 SD
            </div>

            <h1 className="mt-5 font-display font-semibold uppercase leading-[0.86] tracking-[-0.015em] text-white">
              <span className="block bg-gradient-to-b from-white via-[#e8f8ff] to-[#91c9ea] bg-clip-text text-[clamp(2.75rem,10.7vw,5.4rem)] text-transparent title-glow">
                Robot Math
              </span>
              <span className="mt-1 block text-[clamp(2.75rem,10.7vw,5.4rem)] text-sun drop-shadow-[0_4px_0_rgba(122,75,0,.35)]">
                Adventure
              </span>
              <span className="mt-3 flex items-center gap-3">
                <span className="inline-flex -rotate-2 items-center gap-1.5 rounded-lg bg-gradient-to-br from-electric to-sky-500 px-3 py-1 font-display text-2xl font-semibold tracking-normal text-night-950 shadow-[0_4px_0_#0877a5] sm:text-3xl">
                  3D
                </span>
                <span className="font-display text-xl font-medium uppercase tracking-[0.15em] text-electric/80 sm:text-2xl">
                  Perkalian 1–10
                </span>
              </span>
            </h1>

            <div className="mt-4 inline-flex max-w-full items-center gap-2.5 rounded-full border border-electric/40 bg-[#071329]/90 px-3.5 py-2 shadow-[0_4px_18px_-6px_rgba(0,0,0,.8)] backdrop-blur-md sm:px-4">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mint shadow-[0_0_8px_rgba(105,240,174,.8)]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-white sm:text-[11px]">
                Created by: <span className="text-sun">Widodo</span>
                <span aria-hidden="true" className="mx-1.5 inline-block h-3 w-px align-middle bg-white/35" />
                <span className="text-electric">Guru SD</span>
              </span>
            </div>

            <p className="mt-5 max-w-xl text-[15px] font-medium leading-relaxed text-slate-300 sm:text-base">
              Kendalikan <span className="font-extrabold text-white">Robo-Kid</span>, pilih gerbang jawaban, dan
              kumpulkan koin sambil menaklukkan 5 dunia futuristik. Belajar perkalian jadi sebuah petualangan!
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" className="btn btn-primary group min-h-[56px] px-6 text-[15px] sm:text-base" onClick={() => onStart(recommended)}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-night-900/15">
                  <Play size={15} className="ml-0.5 fill-current" />
                </span>
                {progress.unlockedLevel > 1 ? "LANJUTKAN PETUALANGAN" : "MULAI BERMAIN"}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button type="button" className="btn btn-secondary min-h-[56px] px-5 text-[15px]" onClick={onHowTo}>
                <CircleHelp size={18} />
                PETUNJUK
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-mint" />
                Progres tersimpan otomatis
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone size={13} className="text-electric" />
                Bisa dimainkan di HP
              </span>
              <span className="flex items-center gap-1.5">
                <Volume2 size={13} className="text-sun" />
                Suara bisa diatur
              </span>
            </div>

            <div className="mt-7 grid max-w-xl grid-cols-3 gap-2.5">
              {[
                { value: "5", label: "Dunia", icon: <MapIcon size={15} /> },
                { value: "50", label: "Soal", icon: <Target size={15} /> },
                { value: "3", label: "Nyawa", icon: <HeartGlyph /> },
              ].map((item) => (
                <div key={item.label} className="panel-soft flex items-center gap-2.5 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-electric/10 text-electric">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold leading-none text-white">{item.value}</div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-slide-up [animation-delay:100ms]">
            <div className="hero-stage h-[430px] sm:h-[500px] lg:h-[570px]">
              <div className="orbit left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2" />
              <div className="orbit left-1/2 top-1/2 h-[94%] w-[94%] -translate-x-1/2 -translate-y-1/2 opacity-60" />

              <div className="absolute left-4 right-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2 sm:left-5 sm:right-5 sm:top-5">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-night-950/60 px-2.5 py-2 backdrop-blur-md">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-lg text-night-950"
                    style={{ background: recommendedLevel.colors.accent }}
                  >
                    <LevelIcon level={recommendedLevel} size={16} />
                  </span>
                  <div className="pr-1">
                    <div className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Level {recommendedLevel.id}</div>
                    <div className="font-display text-[12px] font-semibold leading-none text-white">{recommendedLevel.shortName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-night-950/60 px-2.5 py-2 backdrop-blur-md">
                    <Hearts lives={3} size={14} />
                  </div>
                  <div className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-night-950/60 px-2.5 py-2 font-display text-xs font-semibold text-sun backdrop-blur-md sm:flex">
                    <Coins size={14} />
                    {progress.coins}
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-[19%] z-20 flex justify-center">
                <div className="floating-card rounded-xl border border-electric/25 bg-[#08152e]/88 px-3.5 py-2.5 shadow-[0_16px_36px_-16px_rgba(0,0,0,.9)] backdrop-blur-md">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-electric">Soal Berikutnya</div>
                  <div className="mt-0.5 flex items-baseline gap-2 font-display">
                    <span className="text-[11px] font-medium text-slate-400">7 × 2 =</span>
                    <span className="text-2xl font-semibold text-white">?</span>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    <span className="h-1 w-5 rounded-full bg-coral/70" />
                    <span className="h-1 w-5 rounded-full bg-sky-500" />
                    <span className="h-1 w-5 rounded-full bg-mint/70" />
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 z-10 flex items-end justify-center pb-[7%] pt-[23%]">
                <div className="h-full w-full">
                  <RobotStage mode="idle" colors={LEVELS[0].colors} />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 bg-gradient-to-t from-[#060c1b]/95 via-[#060c1b]/55 to-transparent px-4 pb-4 pt-12 sm:px-5 sm:pb-5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-mint">Robot siap berlari</span>
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">ROBO-KID</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-slate-400">Penjelajah perkalian • Seri #03</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-right backdrop-blur-md">
                  <div className="flex items-center justify-end gap-1 text-[8px] font-extrabold uppercase tracking-widest text-slate-400">
                    <Star size={10} className="fill-sun text-sun" />
                    Skor terbaik
                  </div>
                  <div className="font-display text-lg font-semibold text-white">{progress.bestScore.toLocaleString("id-ID")}</div>
                </div>
              </div>

              <div className="floating-card-slow pointer-events-none absolute bottom-[26%] left-2 z-20 hidden -rotate-6 rounded-xl border border-sun/25 bg-[#151125]/85 px-2.5 py-2 backdrop-blur-md sm:block">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-sun" />
                  <span className="font-display text-xs font-semibold text-white">Combo × 3</span>
                </div>
                <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-sun/70">+50 bonus poin</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Zap size={13} className="text-sun" />
                Grafik 3D • Kontrol ketuk atau panah
              </div>
              <button
                type="button"
                onClick={onHowTo}
                className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-electric transition hover:text-white"
              >
                Lihat kontrol <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </section>

        <section id="peta-level" className="scroll-mt-4 pb-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-electric">
                <MapIcon size={14} />
                Peta Petualangan
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-semibold text-white sm:text-[28px]">
                Lima dunia. Satu misi: kuasai perkalian.
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-white/[0.08] sm:block">
                <div className="progress-fill gold h-full" style={{ width: `${journeyPercent}%` }} />
              </div>
              <div className="chip border border-white/[0.08] bg-white/[0.04] text-slate-300">
                <TrophyGlyph />
                {completedLevels}/5 selesai
              </div>
              <div className="chip border border-sun/20 bg-sun/10 text-sun">
                <Star size={11} className="fill-current" />
                {totalStars}/15
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
            {LEVELS.map((level) => {
              const locked = level.id > progress.unlockedLevel;
              const record = progress.records[level.id];
              const isNext = level.id === recommended;
              return (
                <button
                  key={level.id}
                  type="button"
                  disabled={locked}
                  onClick={() => onStart(level.id)}
                  className="level-card p-3.5 sm:p-4"
                  data-active={isNext}
                  style={{ "--card-accent": level.colors.accent } as CSSProperties}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="level-icon"
                      style={{
                        color: level.colors.accent,
                        background: `linear-gradient(150deg, ${level.colors.accent}20, rgba(7,16,34,.8))`,
                      }}
                    >
                      <LevelIcon level={level} size={21} />
                    </span>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Level {level.id}
                      </span>
                      {locked ? (
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.05] text-slate-500">
                          <Lock size={12} />
                        </span>
                      ) : record?.completed ? (
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-mint/15 text-mint">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-sun/15 text-sun">
                          <Play size={11} className="ml-0.5 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 font-display text-[15px] font-semibold leading-tight text-white">{level.shortName}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{level.name}</div>
                  <div className="mt-2 line-clamp-2 min-h-[30px] text-[11px] font-medium leading-snug text-slate-400">{level.focus}</div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5">
                    <StarRow value={record?.bestStars ?? 0} size={13} muted={locked} />
                    <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                      {locked ? (
                        "Terkunci"
                      ) : (
                        <>
                          {isNext ? "Main" : "Buka"}
                          <ChevronRight size={11} />
                        </>
                      )}
                    </span>
                  </div>
                  {isNext && (
                    <div className="absolute right-2 top-2 rounded bg-sun px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-amber-950">
                      Berikutnya
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="panel flex items-center gap-4 p-4">
            <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-electric to-sky-600 text-night-950 shadow-[0_5px_0_#0a6b94]">
              <Crown size={22} strokeWidth={2.3} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-electric">Misi belajar hari ini</div>
              <div className="mt-0.5 truncate font-display text-sm font-semibold text-white sm:text-base">
                {completedLevels === 5 ? "Semua dunia berhasil ditaklukkan!" : `Taklukkan ${recommendedLevel.shortName}`}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="progress-fill h-full" style={{ width: `${journeyPercent}%` }} />
                </div>
                <span className="text-[9px] font-extrabold text-slate-400">{Math.round(journeyPercent)}%</span>
              </div>
            </div>
          </div>

          <div className="panel-soft flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sun/10 text-sun">
              <Medal size={20} />
            </div>
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Skor terbaik</div>
              <div className="mt-0.5 font-display text-lg font-semibold text-white">
                {progress.bestScore.toLocaleString("id-ID")}
                <span className="ml-1.5 text-[10px] font-bold text-slate-500">{currentRecord?.bestScore ? "poin" : "— mulai sekarang"}</span>
              </div>
            </div>
          </div>

          <div className="panel-soft flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/10 text-mint">
              <Gamepad2 size={20} />
            </div>
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Cara bermain cepat</div>
              <div className="mt-0.5 text-[11px] font-bold text-slate-300">
                Tap jawaban / <span className="rounded bg-white/10 px-1 font-mono text-[10px]">← →</span> untuk pindah jalur
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-white/[0.07] py-4 text-[10px] font-semibold text-slate-500 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <LogoMark size={24} />
            <span>Robot Math Adventure 3D • Belajar jadi lebih seru.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Tanpa login • tanpa iklan</span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span>Perkalian 1–10 untuk kelas 2–3 SD</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function HeartGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function TrophyGlyph() {
  return <Star size={11} className="fill-current" />;
}
