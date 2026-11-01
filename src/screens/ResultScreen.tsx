import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  Heart,
  Home,
  Lightbulb,
  Medal,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type { LevelConfig } from "../game/levels";
import type { RunResult } from "./GameScreen";
import RobotStage from "../three/RobotStage";
import { Brand, Confetti, LevelIcon, StarRow } from "../components/GameChrome";

interface ResultScreenProps {
  level: LevelConfig;
  result: RunResult;
  bestScore: number;
  totalCoins: number;
  isNewBest: boolean;
  onReplay: () => void;
  onNext: () => void;
  onMenu: () => void;
}

export default function ResultScreen({
  level,
  result,
  bestScore,
  totalCoins,
  isNewBest,
  onReplay,
  onNext,
  onMenu,
}: ResultScreenProps) {
  const success = result.completed;
  const isLastLevel = level.id === 5;
  const wrongTables = Array.from(
    result.missed.reduce((map, item) => {
      map.set(item.a, (map.get(item.a) ?? 0) + 1);
      return map;
    }, new Map<number, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([table]) => table);

  const feedbackTitle = success
    ? result.stars === 3
      ? "Sempurna! Kamu Master Perkalian!"
      : result.stars === 2
        ? "Hebat! Kamu semakin pintar!"
        : "Satu langkah lagi menjadi Master Perkalian!"
    : "Kesalahan adalah kesempatan untuk belajar!";

  const feedbackBody = success
    ? result.wrong === 0
      ? "Semua jawaban tepat. Robot sangat bangga dengan ketelitianmu."
      : "Petualangan selesai! Pelajari kembali soal yang belum tepat, lalu coba raih tiga bintang."
    : "Nyawamu habis, tetapi kamu sudah berusaha. Ulangi level ini dan tunjukkan kemampuan terbaikmu!";

  return (
    <div className="app-bg relative min-h-[100dvh] overflow-x-hidden">
      <div className="star-field" />
      {success && <Confetti count={34} />}

      <header className="relative z-20 mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 py-4 sm:px-7 lg:px-10">
        <Brand compact />
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 sm:flex">
            <Coins size={15} className="fill-sun text-sun" />
            <span className="font-display text-xs font-semibold text-white">{totalCoins.toLocaleString("id-ID")} koin</span>
          </div>
          <button type="button" onClick={onMenu} className="btn btn-ghost !min-h-[38px] !rounded-xl !px-3 text-[11px]">
            <Home size={14} />
            MENU
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1320px] px-4 pb-8 sm:px-7 lg:px-10">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">
              <LevelIcon level={level} size={13} />
              Level {level.id} • {level.themeLabel}
            </div>
            <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.4rem)] font-semibold uppercase leading-none text-white">
              {success ? (
                <>
                  Level <span className="text-sun">Selesai</span>
                </>
              ) : (
                <>
                  Petualangan <span className="text-coral">Belum Selesai!</span>
                </>
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-400">{feedbackTitle}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <Trophy size={15} className="text-sun" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Rekor</span>
              <span className="font-display text-sm font-semibold text-white">{bestScore.toLocaleString("id-ID")}</span>
            </div>
            {success && <StarRow value={result.stars} size={20} />}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
          <section className="hero-stage relative min-h-[300px] overflow-hidden sm:min-h-[350px] lg:min-h-[560px]">
            <div className="orbit left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2" />
            <div className="orbit left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 opacity-50" />

            <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-night-950/55 px-2.5 py-2 backdrop-blur-md">
                <span className="grid h-7 w-7 place-items-center rounded-lg text-night-950" style={{ background: level.colors.accent }}>
                  <LevelIcon level={level} size={15} />
                </span>
                <div>
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Misi selesai</div>
                  <div className="font-display text-[11px] font-semibold leading-tight text-white">{level.shortName}</div>
                </div>
              </div>
              {success ? (
                <div className="flex items-center gap-1.5 rounded-full border border-sun/35 bg-sun/15 px-2.5 py-1.5 text-sun backdrop-blur-md">
                  <Star size={12} className="fill-current" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wider">{result.stars === 3 ? "Luar biasa" : "Bagus"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full border border-coral/30 bg-coral/15 px-2.5 py-1.5 text-rose-300 backdrop-blur-md">
                  <Heart size={12} className="fill-current" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wider">Coba lagi</span>
                </div>
              )}
            </div>

            <div className="absolute inset-0 z-10 px-5 pb-10 pt-16 sm:px-8 lg:pt-20">
              <RobotStage mode={success ? "celebrate" : "sad"} colors={level.colors} compact />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#060c1b]/95 via-[#060c1b]/50 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                    <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-mint">
                      {success ? "Robot merayakan kemenangan" : "Robot tetap semangat"}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold text-white">ROBO-KID</div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {success ? "Kerja bagus, penjelajah!" : "Jangan menyerah, ya!"}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-right backdrop-blur-md">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Skor akhir</div>
                  <div className="font-display text-xl font-semibold text-white">{result.score.toLocaleString("id-ID")}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel relative overflow-hidden p-4 sm:p-5 lg:p-6">
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-electric/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-electric">
                    {success ? <Trophy size={13} /> : <Heart size={13} />}
                    {success ? "Evaluasi akhir level" : "Evaluasi usaha"}
                  </div>
                  <h2 className="mt-1.5 font-display text-[22px] font-semibold leading-tight text-white sm:text-2xl">
                    {success ? feedbackTitle : "Petualangan belum selesai!"}
                  </h2>
                  <p className="mt-1 max-w-md text-[11px] font-semibold leading-relaxed text-slate-400 sm:text-xs">{feedbackBody}</p>
                </div>
                {isNewBest && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-sun/30 bg-sun/10 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider text-sun">
                    <Sparkles size={10} />
                    Rekor baru
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="stat-tile border-sun/20 bg-sun/[0.06]">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-sun/80"><Medal size={12} /> Skor</div>
                  <div className="mt-1 font-display text-2xl font-semibold text-white">{result.score.toLocaleString("id-ID")}</div>
                </div>
                <div className="stat-tile">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><Check size={12} className="text-mint" /> Benar</div>
                  <div className="mt-1 font-display text-2xl font-semibold text-mint">{result.correct}<span className="text-sm text-slate-500">/10</span></div>
                </div>
                <div className="stat-tile">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><X size={12} className="text-coral" /> Salah</div>
                  <div className="mt-1 font-display text-2xl font-semibold text-coral">{result.wrong}</div>
                </div>
                <div className="stat-tile">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><Target size={12} className="text-electric" /> Ketepatan</div>
                  <div className="mt-1 font-display text-xl font-semibold text-white">{result.accuracy}<span className="text-sm text-slate-500">%</span></div>
                </div>
                <div className="stat-tile">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><Coins size={12} className="text-sun" /> Koin level</div>
                  <div className="mt-1 font-display text-xl font-semibold text-sun">+{result.coins}</div>
                </div>
                <div className="stat-tile">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><Flame size={12} className="text-coral" /> Combo</div>
                  <div className="mt-1 font-display text-xl font-semibold text-white">×{result.maxCombo}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-electric/10 text-electric"><Target size={16} /></span>
                    <div>
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Ketepatan jawaban</div>
                      <div className="font-display text-lg font-semibold leading-tight text-white">{result.accuracy}% benar</div>
                    </div>
                  </div>
                  <StarRow value={result.stars} size={18} />
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full ${result.accuracy >= 80 ? "bg-mint" : result.accuracy >= 50 ? "bg-sun" : "bg-coral"}`}
                    style={{ width: `${result.accuracy}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-bold text-slate-500">
                  <span>Jawaban benar: {result.correct}</span>
                  <span>Jawaban salah: {result.wrong}</span>
                  <span>Sisa nyawa: {result.lives}</span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.08] bg-night-950/35 p-3">
                <div className="flex items-center gap-2">
                  <Lightbulb size={15} className="text-sun" />
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-white">Materi yang perlu dilatih lagi</div>
                </div>
                {result.missed.length === 0 ? (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-mint/[0.08] px-2.5 py-2 text-[11px] font-bold text-mint">
                    <Sparkles size={14} />
                    Semua jawaban tepat! Pertahankan ketelitianmu.
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {wrongTables.map((table) => (
                        <span key={table} className="rounded-md border border-coral/25 bg-coral/10 px-2 py-1 font-display text-[11px] font-semibold text-rose-200">
                          Tabel ×{table}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {result.missed.slice(0, 4).map((item, index) => (
                        <div key={`${item.a}-${item.b}-${index}`} className="flex items-center justify-between rounded-md bg-white/[0.04] px-2 py-1.5 text-[10px] font-bold text-slate-300">
                          <span>{item.a} × {item.b} = <span className="text-mint">{item.answer}</span></span>
                          <span className="font-display text-[9px] text-slate-500">{item.b} kelompok × {item.a}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {success ? (
                  isLastLevel ? (
                    <div className="flex items-center gap-2 rounded-xl border border-sun/25 bg-sun/[0.08] px-3 py-2 text-sun">
                      <Crown size={17} />
                      <span className="text-[11px] font-bold">Seluruh 5 dunia selesai! Kamu resmi menjadi Master Perkalian.</span>
                    </div>
                  ) : (
                    <button type="button" onClick={onNext} className="btn btn-primary w-full !min-h-[50px]">
                      LEVEL BERIKUTNYA
                      <ArrowRight size={18} />
                    </button>
                  )
                ) : (
                  <button type="button" onClick={onReplay} className="btn btn-primary w-full !min-h-[50px]">
                    <RotateCcw size={17} />
                    COBA LAGI
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {success && (
                    <button type="button" onClick={onReplay} className="btn btn-secondary !min-h-[44px] text-[12px]">
                      <RotateCcw size={15} />
                      ULANGI LEVEL
                    </button>
                  )}
                  {isLastLevel && success && (
                    <button type="button" onClick={onReplay} className="btn btn-secondary !min-h-[44px] text-[12px]">
                      <RotateCcw size={15} />
                      MAIN LAGI
                    </button>
                  )}
                  {!success && (
                    <button type="button" onClick={onMenu} className="btn btn-secondary !min-h-[44px] text-[12px]">
                      <Home size={15} />
                      KE MENU
                    </button>
                  )}
                  {success && (
                    <button type="button" onClick={onMenu} className="btn btn-ghost !min-h-[44px] text-[12px]">
                      <Home size={15} />
                      KEMBALI KE MENU
                    </button>
                  )}
                </div>
                {!success && (
                  <p className="text-center text-[9px] font-semibold text-slate-500">
                    {10 - (result.correct + result.wrong)} soal belum dicoba. Terus berlatih, ya!
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[9px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><BookOpen size={11} /> {level.focus}</span>
                <button type="button" onClick={onReplay} className="flex items-center gap-1 text-electric transition hover:text-white">
                  Coba misi lagi <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
