import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Coins,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Keyboard,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import type { LevelConfig } from "../game/levels";
import {
  explanationFor,
  QUESTIONS_PER_LEVEL,
  buildQuestions,
  type Question,
} from "../game/questions";
import { starRating, type Settings } from "../game/storage";
import { gameAudio } from "../game/audio";
import GameScene, { type Feedback } from "../three/GameScene";
import { Hearts, LevelIcon } from "../components/GameChrome";

export interface RunResult {
  levelId: number;
  completed: boolean;
  score: number;
  coins: number;
  correct: number;
  wrong: number;
  accuracy: number;
  stars: number;
  maxCombo: number;
  lives: number;
  missed: { a: number; b: number; answer: number }[];
}

interface GameScreenProps {
  level: LevelConfig;
  settings: Settings;
  onFinish: (result: RunResult) => void;
  onExit: () => void;
  onHowTo: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

const LANE_LABELS = ["KIRI", "TENGAH", "KANAN"];
const LETTERS = ["A", "B", "C"];

export default function GameScreen({
  level,
  settings,
  onFinish,
  onExit,
  onHowTo,
  onToggleSound,
  onToggleMusic,
}: GameScreenProps) {
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions(level.id));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [commitId, setCommitId] = useState(0);
  const [committed, setCommitted] = useState(false);
  const [lane, setLane] = useState(1);
  const [phase, setPhase] = useState<"asking" | "feedback">("asking");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [missed, setMissed] = useState<Question[]>([]);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timer ? level.timer : level.timer * 1.7);
  const [lastGain, setLastGain] = useState(0);
  const [showPauseHelp, setShowPauseHelp] = useState(false);

  const question = questions[questionIndex];
  const roundDuration = settings.timer ? level.timer : level.timer * 1.7;
  const phaseRef = useRef(phase);
  const pausedRef = useRef(paused);
  const advanceTimeout = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const mountedRef = useRef(true);

  phaseRef.current = phase;
  pausedRef.current = paused;

  useEffect(() => {
    gameAudio.init();
    gameAudio.setSound(settings.sound);
    gameAudio.setMusic(settings.music);
    gameAudio.startMusic();
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (advanceTimeout.current !== null) window.clearTimeout(advanceTimeout.current);
      gameAudio.stopMusic();
    };
    // Audio setup only needs to run when this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameAudio.setSound(settings.sound);
    gameAudio.setMusic(settings.music);
  }, [settings.sound, settings.music]);

  useEffect(() => {
    if (paused) gameAudio.pauseMusic();
    else if (settings.music) gameAudio.resumeMusic();
  }, [paused, settings.music]);

  const chooseLane = useCallback(
    (nextLane: number) => {
      if (pausedRef.current || phaseRef.current !== "asking") return;
      const clamped = Math.max(0, Math.min(2, nextLane));
      setLane((previous) => {
        if (previous !== clamped) gameAudio.click();
        return clamped;
      });
      setCommitted(true);
      setCommitId((value) => value + 1);
    },
    [],
  );

  const resetGame = useCallback(() => {
    if (advanceTimeout.current !== null) window.clearTimeout(advanceTimeout.current);
    finishedRef.current = false;
    setQuestions(buildQuestions(level.id));
    setQuestionIndex(0);
    setRunId((value) => value + 1);
    setCommitted(false);
    setLane(1);
    setPhase("asking");
    phaseRef.current = "asking";
    setFeedback(null);
    setSelectedValue(null);
    setScore(0);
    setCoins(0);
    setLives(3);
    setCorrect(0);
    setWrong(0);
    setCombo(0);
    setMaxCombo(0);
    setMissed([]);
    setPaused(false);
    setLastGain(0);
    setTimeLeft(roundDuration);
  }, [level.id, roundDuration]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "feedback") return;
    setPaused((value) => {
      if (!value) gameAudio.click();
      return !value;
    });
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const key = event.key.toLowerCase();
      const handled = ["arrowleft", "arrowright", "a", "d", "1", "2", "3", " ", "escape"].includes(key);
      if (!handled) return;
      event.preventDefault();
      if (key === " " || key === "escape") {
        togglePause();
        return;
      }
      if (pausedRef.current || phaseRef.current !== "asking") return;
      if (key === "arrowleft" || key === "a") chooseLane(lane - 1);
      if (key === "arrowright" || key === "d") chooseLane(lane + 1);
      if (key === "1") chooseLane(0);
      if (key === "2") chooseLane(1);
      if (key === "3") chooseLane(2);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chooseLane, lane, togglePause]);

  const resolveAnswer = useCallback(
    (chosenLane: number) => {
      if (finishedRef.current || phaseRef.current !== "asking") return;
      const safeLane = Math.max(0, Math.min(2, chosenLane));
      const currentQuestion = questions[questionIndex];
      if (!currentQuestion) return;

      phaseRef.current = "feedback";
      setPhase("feedback");
      setLane(safeLane);

      const picked = currentQuestion.options[safeLane];
      const isCorrect = picked === currentQuestion.answer;
      const nextCombo = isCorrect ? combo + 1 : 0;
      const comboBonus = isCorrect && nextCombo >= 2 ? (nextCombo - 1) * 25 : 0;
      const gained = isCorrect ? 100 + comboBonus : 0;
      const nextLives = isCorrect ? lives : lives - 1;
      const nextScore = score + gained;
      const nextCoins = coins + (isCorrect ? 3 : 0);
      const nextCorrect = correct + (isCorrect ? 1 : 0);
      const nextWrong = wrong + (isCorrect ? 0 : 1);
      const nextMissed = isCorrect ? missed : [...missed, currentQuestion];
      const isLastQuestion = questionIndex + 1 >= QUESTIONS_PER_LEVEL;

      setFeedback(isCorrect ? "correct" : "wrong");
      setSelectedValue(picked);
      setScore(nextScore);
      setCoins(nextCoins);
      setLives(Math.max(0, nextLives));
      setCorrect(nextCorrect);
      setWrong(nextWrong);
      setCombo(nextCombo);
      setMaxCombo((value) => Math.max(value, nextCombo));
      setMissed(nextMissed);
      setLastGain(gained);

      if (isCorrect) {
        gameAudio.correct();
        window.setTimeout(() => gameAudio.coin(), 280);
      } else {
        gameAudio.wrong();
      }

      advanceTimeout.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        if (nextLives <= 0) {
          finishedRef.current = true;
          onFinish({
            levelId: level.id,
            completed: false,
            score: nextScore,
            coins: nextCoins,
            correct: nextCorrect,
            wrong: nextWrong,
            accuracy: Math.round((nextCorrect / (nextCorrect + nextWrong)) * 100),
            stars: 0,
            maxCombo: Math.max(maxCombo, nextCombo),
            lives: 0,
            missed: nextMissed.map((item) => ({ a: item.a, b: item.b, answer: item.answer })),
          });
          return;
        }

        if (isLastQuestion) {
          finishedRef.current = true;
          gameAudio.levelComplete();
          onFinish({
            levelId: level.id,
            completed: true,
            score: nextScore,
            coins: nextCoins,
            correct: nextCorrect,
            wrong: nextWrong,
            accuracy: Math.round((nextCorrect / QUESTIONS_PER_LEVEL) * 100),
            stars: starRating(nextCorrect),
            maxCombo: Math.max(maxCombo, nextCombo),
            lives: nextLives,
            missed: nextMissed.map((item) => ({ a: item.a, b: item.b, answer: item.answer })),
          });
          return;
        }

        setQuestionIndex((value) => value + 1);
        setRunId((value) => value + 1);
        setCommitted(false);
        setLane(1);
        setFeedback(null);
        setSelectedValue(null);
        setPhase("asking");
        phaseRef.current = "asking";
        setTimeLeft(roundDuration);
      }, 1950);
    },
    [
      coins,
      combo,
      correct,
      level.id,
      lives,
      maxCombo,
      missed,
      onFinish,
      questionIndex,
      questions,
      roundDuration,
      score,
      wrong,
    ],
  );

  const handleTime = useCallback((seconds: number) => {
    setTimeLeft(seconds);
  }, []);

  const handleSwipeStart = (clientX: number, clientY: number, target: EventTarget | null) => {
    if (target instanceof HTMLElement && target.closest("button, a, input, select")) return;
    touchStart.current = { x: clientX, y: clientY };
  };

  const handleSwipeEnd = (clientX: number, clientY: number) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = clientX - start.x;
    const dy = clientY - start.y;
    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy)) return;
    chooseLane(lane + (dx > 0 ? 1 : -1));
  };

  const timerWarning = settings.timer && timeLeft <= 2.2;
  const awaitingChoice = !committed && phase === "asking" && settings.timer && timeLeft <= 0.05;
  const progressPercent = (questionIndex / QUESTIONS_PER_LEVEL) * 100;
  const isResolvedCorrect = feedback === "correct";
  const robotMode = feedback === "correct" ? "celebrate" : feedback === "wrong" ? "sad" : "run";

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-night-950 select-none"
      onTouchStart={(event) => handleSwipeStart(event.touches[0].clientX, event.touches[0].clientY, event.target)}
      onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].clientX, event.changedTouches[0].clientY)}
      style={{
        background: `radial-gradient(ellipse at 50% 58%, ${level.colors.fog} 0%, #050817 72%)`,
      }}
    >
      <GameScene
        level={level}
        question={question}
        runId={runId}
        commitId={commitId}
        committed={committed}
        paused={paused}
        mode={robotMode}
        targetLane={lane}
        feedback={feedback}
        roundDuration={roundDuration}
        onGatePass={resolveAnswer}
        onTime={handleTime}
      />

      <div className="game-vignette pointer-events-none absolute inset-0 z-10" />
      <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-70" />

      <div className="relative z-30 flex flex-1 flex-col px-2 pt-2 sm:px-4 sm:pt-3">
        <div className="mx-auto w-full max-w-[1030px]">
          <div className="hud-panel flex items-center gap-2 rounded-xl px-2 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2">
            <button
              type="button"
              onClick={() => setPaused(true)}
              disabled={phase === "feedback"}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1.5 transition hover:bg-white/[0.07] disabled:opacity-60 sm:px-2.5"
              aria-label="Buka menu jeda"
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-night-950 sm:h-8 sm:w-8"
                style={{ background: level.colors.accent }}
              >
                <LevelIcon level={level} size={16} />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Level {level.id}</span>
                <span className="block max-w-[120px] truncate font-display text-[11px] font-semibold leading-tight text-white">{level.shortName}</span>
              </span>
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <div className="stat-pill !gap-1.5 !rounded-lg !px-2 !py-1.5 sm:!px-2.5" title="Skor">
                <Star size={13} className="shrink-0 fill-sun text-sun" />
                <span className="font-display text-[12px] font-semibold tabular-nums text-white sm:text-sm">{score}</span>
              </div>
              <div className="stat-pill !gap-1.5 !rounded-lg !px-2 !py-1.5 sm:!px-2.5" title="Koin">
                <Coins size={13} className="shrink-0 fill-sun text-sun" />
                <span className="font-display text-[12px] font-semibold tabular-nums text-white sm:text-sm">{coins}</span>
              </div>
              <div className="stat-pill !gap-0 !rounded-lg !px-2 !py-1.5 sm:!px-2.5" title="Nyawa">
                <Hearts lives={lives} size={14} />
              </div>
              {combo >= 2 && (
                <div className="combo-badge hidden items-center gap-1 rounded-lg px-2 py-1.5 sm:flex">
                  <Flame size={12} className="fill-current" />
                  <span className="font-display text-[11px] font-semibold">×{combo}</span>
                </div>
              )}
              <button
                type="button"
                onClick={togglePause}
                disabled={phase === "feedback"}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 transition hover:bg-white/10 disabled:opacity-50 sm:h-9 sm:w-9"
                aria-label="Jeda permainan"
              >
                <Pause size={16} className="fill-current" />
              </button>
            </div>
          </div>

          <div className="question-panel relative mt-1.5 overflow-hidden rounded-2xl px-3 pb-3 pt-2.5 sm:mt-2 sm:rounded-[22px] sm:px-4 sm:pb-4 sm:pt-3">
            <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-electric/10 blur-3xl" />
            <div className="relative flex items-center gap-2.5 sm:gap-4">
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-electric sm:text-[10px]">Soal</span>
                <span className="font-display text-sm font-semibold text-white sm:text-base">
                  {questionIndex + 1}
                  <span className="text-slate-500">/{QUESTIONS_PER_LEVEL}</span>
                </span>
              </div>

              <div className="flex flex-1 items-center gap-1">
                {Array.from({ length: QUESTIONS_PER_LEVEL }).map((_, index) => {
                  const state =
                    index < questionIndex
                      ? "done"
                      : index === questionIndex
                        ? "active"
                        : "waiting";
                  return (
                    <span
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition-all sm:h-2 ${
                        state === "done"
                          ? "bg-mint/80"
                          : state === "active"
                            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,.45)]"
                            : "bg-white/[0.12]"
                      }`}
                    />
                  );
                })}
              </div>

              {committed && phase === "asking" ? (
                <div className="flex shrink-0 items-center gap-1 rounded-md border border-mint/35 bg-mint/12 px-1.5 py-1 text-mint sm:px-2">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-mint" />
                  <span className="font-display text-[10px] font-semibold sm:text-[11px]">MELUNCUR</span>
                </div>
              ) : awaitingChoice ? (
                <div className="flex shrink-0 items-center gap-1 rounded-md border border-sun/40 bg-sun/15 px-1.5 py-1 text-sun sm:px-2">
                  <Clock size={11} className="animate-pulse" />
                  <span className="font-display text-[10px] font-semibold sm:text-[11px]">PILIH GERBANG</span>
                </div>
              ) : settings.timer ? (
                <div
                  className={`flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-1 sm:px-2 ${
                    timerWarning
                      ? "border-coral/45 bg-coral/15 text-coral"
                      : "border-white/10 bg-white/[0.045] text-slate-200"
                  }`}
                >
                  <Clock size={11} className={timerWarning ? "animate-pulse" : ""} />
                  <span className="font-display text-[11px] font-semibold tabular-nums sm:text-xs">{timeLeft.toFixed(1)}<span className="ml-0.5 hidden text-[8px] font-bold text-slate-500 sm:inline">dtk</span></span>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-1 rounded-md border border-mint/20 bg-mint/10 px-1.5 py-1 text-mint sm:px-2">
                  <ShieldCheck size={11} />
                  <span className="font-display text-[10px] font-semibold">SANTai</span>
                </div>
              )}
            </div>

            <div className="relative mt-2 flex flex-col gap-2.5 sm:mt-2.5 md:flex-row md:items-center md:gap-5">
              <div className="flex shrink-0 items-center justify-between gap-3 md:w-[31%] md:flex-col md:items-start md:justify-center">
                <div>
                  <div className="flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                    <Target size={10} className="text-sun" />
                    Pilih gerbang jawaban
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2 font-display leading-none">
                    <span className="text-[30px] font-semibold text-white sm:text-[36px]">{question.a}</span>
                    <span className="text-lg font-medium text-electric sm:text-xl">×</span>
                    <span className="text-[30px] font-semibold text-white sm:text-[36px]">{question.b}</span>
                    <span className="text-lg font-medium text-electric sm:text-xl">=</span>
                    <span className="text-[30px] font-semibold text-sun sm:text-[36px]">?</span>
                  </div>
                </div>
                <div className="hidden items-center gap-1.5 text-[10px] font-bold text-slate-500 md:flex">
                  {committed && phase === "asking" ? (
                    <>
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                      <span className="text-mint">Robot menuju gerbang {LANE_LABELS[lane]}...</span>
                    </>
                  ) : awaitingChoice ? (
                    <>
                      <Clock size={11} className="text-sun" />
                      <span className="text-sun">Waktu habis? Tenang, gerbang menunggumu. Pilih jawabanmu!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} className="text-sun" />
                      Ketuk jawaban, robot langsung meluncur
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 md:hidden">
                  <span className={`h-1.5 w-6 rounded-full ${lane === 0 ? "bg-white" : "bg-white/15"}`} />
                  <span className={`h-1.5 w-6 rounded-full ${lane === 1 ? "bg-white" : "bg-white/15"}`} />
                  <span className={`h-1.5 w-6 rounded-full ${lane === 2 ? "bg-white" : "bg-white/15"}`} />
                </div>
              </div>

              <div className="grid flex-1 grid-cols-3 gap-1.5 sm:gap-2.5">
                {question.options.map((option, index) => {
                  const isSelected = lane === index;
                  const isCorrectOption = option === question.answer;
                  const state =
                    phase === "feedback" && isCorrectOption
                      ? "correct"
                      : phase === "feedback" && isSelected
                        ? "wrong"
                        : undefined;
                  return (
                    <button
                      key={`${question.id}-${index}`}
                      type="button"
                      className={`answer-card answer-${LETTERS[index].toLowerCase()} flex flex-col items-center justify-center !min-h-[60px] px-1.5 py-2 sm:!min-h-[76px] sm:px-3`}
                      data-selected={isSelected}
                      data-state={state}
                      disabled={phase === "feedback" || paused}
                      onClick={() => chooseLane(index)}
                      aria-label={`Jalur ${LANE_LABELS[index]}, pilihan ${LETTERS[index]}: ${option}`}
                    >
                      <span className="absolute left-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-night-950/45 font-display text-[8px] font-semibold text-white sm:left-2.5 sm:top-2.5 sm:h-5 sm:w-5 sm:text-[10px]">
                        {LETTERS[index]}
                      </span>
                      {phase === "feedback" && isCorrectOption && (
                        <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-white text-emerald-700 sm:right-2.5 sm:top-2.5 sm:h-5 sm:w-5">
                          <CheckGlyph />
                        </span>
                      )}
                      {phase === "feedback" && isSelected && !isCorrectOption && (
                        <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-white text-rose-600 sm:right-2.5 sm:top-2.5 sm:h-5 sm:w-5">
                          <X size={11} strokeWidth={3} />
                        </span>
                      )}
                      <span className="font-display text-[25px] font-semibold leading-none tabular-nums drop-shadow-[0_2px_2px_rgba(0,0,0,.22)] sm:text-[32px]">
                        {option}
                      </span>
                      <span className="mt-1 text-[7px] font-extrabold uppercase tracking-[0.14em] text-white/75 sm:text-[8px]">
                        {LANE_LABELS[index]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2 px-1 text-[9px] font-bold text-slate-400 sm:mt-1.5 sm:text-[10px]">
            <span className="flex items-center gap-1.5" aria-live="polite">
              <Lightbulb size={11} className="text-sun" />
              {committed && phase === "asking" ? (
                <span className="text-mint">Robot menuju gerbang {LANE_LABELS[lane]} — jawaban dibaca saat melewati gerbang.</span>
              ) : awaitingChoice ? (
                <span className="text-sun">Gerbang menunggu di depan robot. Tidak ada pengurangan nyawa karena terlambat.</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Ketuk jawaban, gunakan panah, atau geser robot ke jalur.</span>
                  <span className="sm:hidden">Ketuk jawaban atau geser robot.</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1 font-display tabular-nums text-slate-300">
              {progressPercent.toFixed(0)}%
              <span className="hidden text-slate-500 sm:inline">selesai</span>
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-30 mt-auto">
        <div className="mx-auto flex w-full max-w-[1030px] items-end justify-between gap-2 px-2 pb-2 sm:px-4 sm:pb-3">
          <div className="hud-panel hidden rounded-xl px-3 py-2 md:block">
            <div className="flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              <Gamepad2 size={11} className="text-electric" />
              Jalur aktif
            </div>
            <div className="mt-1 flex items-center gap-1">
              {LANE_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider transition ${
                    lane === index ? "bg-white text-night-950" : "bg-white/[0.06] text-slate-500"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="hud-panel flex items-center gap-2 rounded-2xl p-1.5 sm:gap-3 sm:p-2">
            <button
              type="button"
              className="lane-btn !h-[52px] !w-[64px] sm:!h-[58px] sm:!w-[78px]"
              onPointerDown={(event) => {
                event.preventDefault();
                chooseLane(lane - 1);
              }}
              disabled={phase === "feedback" || paused}
              aria-label="Pindah ke jalur kiri"
            >
              <ChevronLeft size={24} className="text-white" />
              <span className="hidden flex-col items-start leading-none sm:flex">
                <span className="text-[9px] font-extrabold tracking-wide">KIRI</span>
                <span className="mt-0.5 text-[7px] font-bold text-slate-500">← / A</span>
              </span>
            </button>

            <div className="hidden flex-col items-center px-1 sm:flex">
              <div className="flex items-center gap-1">
                {["A", "B", "C"].map((letter, index) => (
                  <span
                    key={letter}
                    className={`grid h-5 w-5 place-items-center rounded-md border text-[9px] font-extrabold transition ${
                      lane === index
                        ? "border-white/45 bg-white/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-600"
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <span className="mt-1.5 text-[7px] font-extrabold uppercase tracking-[0.15em] text-slate-500">
                Posisi robot
              </span>
            </div>

            <button
              type="button"
              className="lane-btn !h-[52px] !w-[64px] sm:!h-[58px] sm:!w-[78px]"
              onPointerDown={(event) => {
                event.preventDefault();
                chooseLane(lane + 1);
              }}
              disabled={phase === "feedback" || paused}
              aria-label="Pindah ke jalur kanan"
            >
              <span className="hidden flex-col items-end leading-none sm:flex">
                <span className="text-[9px] font-extrabold tracking-wide">KANAN</span>
                <span className="mt-0.5 text-[7px] font-bold text-slate-500">→ / D</span>
              </span>
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="hud-panel rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                <Zap size={11} className="text-sun" />
                Fokus materi
              </div>
              <div className="mt-0.5 font-display text-[11px] font-semibold text-white">{level.focus}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                onHowTo();
              }}
              className="icon-btn !h-[42px] !w-[42px]"
              aria-label="Buka petunjuk"
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1030px] items-center justify-between gap-2 px-3 pb-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-600 sm:px-5">
          <span className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Swipe kiri/kanan • Spasi untuk jeda</span>
            <span className="sm:hidden">Tekan tombol untuk pindah jalur</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Coins size={10} className="text-sun/70" />
            Jawaban tepat +3 koin
          </span>
        </div>
      </div>

      {phase === "feedback" && feedback && (
        <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center px-4 pt-24">
          <div
            className={`animate-slide-up w-full max-w-[430px] rounded-2xl border p-3.5 text-center sm:p-4 ${
              isResolvedCorrect ? "feedback-correct" : "feedback-wrong"
            }`}
          >
            <div
              className={`mx-auto grid h-10 w-10 place-items-center rounded-full sm:h-11 sm:w-11 ${
                isResolvedCorrect ? "bg-mint text-emerald-950" : "bg-coral text-rose-950"
              }`}
            >
              {isResolvedCorrect ? <Sparkles size={22} strokeWidth={2.4} /> : <Heart size={21} className="fill-current" />}
            </div>
            <div className={`mt-2 font-display text-[17px] font-semibold uppercase tracking-[0.04em] sm:text-lg ${isResolvedCorrect ? "text-mint" : "text-rose-300"}`}>
              {isResolvedCorrect ? "Hebat! Jawabanmu benar!" : "Belum tepat, ayo coba lagi!"}
            </div>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-300 sm:text-xs">
              {isResolvedCorrect
                ? `${combo >= 2 ? `Combo ×${combo}! ` : ""}Kamu memilih gerbang ${selectedValue}, tepat sekali.`
                : `Gerbang ${selectedValue} belum tepat. Jawaban yang benar adalah ${question.answer}.`}
            </p>
            <div className="mt-2 rounded-lg border border-white/10 bg-night-950/40 px-2.5 py-1.5 text-left">
              <div className="font-display text-[12px] font-semibold text-white sm:text-[13px]">{explanationFor(question)}</div>
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-3 text-[9px] font-extrabold uppercase tracking-[0.08em]">
              {isResolvedCorrect ? (
                <>
                  <span className="flex items-center gap-1 text-sun"><Star size={11} className="fill-current" />+{lastGain} poin</span>
                  <span className="flex items-center gap-1 text-sun"><Coins size={11} />+3 koin</span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-rose-300"><Heart size={11} className="fill-current" />Sisa {lives} nyawa</span>
              )}
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-1 w-1 animate-pulse rounded-full bg-slate-400" />
                Lanjut...
              </span>
            </div>
          </div>
        </div>
      )}

      {paused && (
        <div className="modal-backdrop !z-50 !bg-night-950/75">
          <div className="modal-card max-w-[470px] overflow-hidden">
            <div className="relative border-b border-white/[0.08] px-5 pb-4 pt-5 text-center">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_50%_0%,rgba(93,226,255,.18),transparent_70%)]" />
              <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-electric/30 bg-electric/10 text-electric">
                <Pause size={23} className="fill-current" />
              </div>
              <h2 className="relative mt-2.5 font-display text-2xl font-semibold text-white">Jeda Sebentar</h2>
              <p className="relative mt-1 text-xs font-semibold text-slate-400">
                Robot, gerbang, dan timer berhenti. Siap melanjutkan?
              </p>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5">
              <button type="button" onClick={() => setPaused(false)} className="btn btn-primary w-full !min-h-[50px]">
                <Play size={17} className="fill-current" />
                LANJUTKAN PETUALANGAN
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaused(false);
                    resetGame();
                  }}
                  className="btn btn-secondary min-h-[44px] text-[12px]"
                >
                  <RotateCcw size={15} />
                  ULANGI
                </button>
                <button type="button" onClick={onExit} className="btn btn-ghost min-h-[44px] text-[12px]">
                  <Home size={15} />
                  KE MENU
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Pengaturan suara</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-slate-500">Bisa diubah kapan saja</div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="icon-btn !h-9 !w-9"
                    data-active={settings.sound}
                    onClick={onToggleSound}
                    aria-label="Efek suara"
                  >
                    {settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button
                    type="button"
                    className="icon-btn !h-9 !w-9"
                    data-active={settings.music}
                    onClick={onToggleMusic}
                    aria-label="Musik latar"
                  >
                    <MusicGlyph muted={!settings.music} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPauseHelp((value) => !value)}
                className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-[11px] font-bold text-slate-400 transition hover:text-white"
              >
                <span className="flex items-center gap-1.5"><Keyboard size={13} /> Kontrol permainan</span>
                <span className="text-slate-600">{showPauseHelp ? "Tutup" : "Lihat"}</span>
              </button>
              {showPauseHelp && (
                <div className="rounded-xl border border-white/[0.08] bg-night-950/40 p-3 text-[10px] font-semibold leading-relaxed text-slate-400">
                  <div className="grid grid-cols-2 gap-2">
                    <span><Keycap>←</Keycap> <Keycap>A</Keycap> jalur kiri</span>
                    <span><Keycap>→</Keycap> <Keycap>D</Keycap> jalur kanan</span>
                    <span><Keycap>1</Keycap> <Keycap>2</Keycap> <Keycap>3</Keycap> pilih jawaban</span>
                    <span>Di HP: swipe kiri / kanan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Keycap({ children }: { children: ReactNode }) {
  return (
    <span className="inline-grid min-w-[18px] place-items-center rounded border border-white/15 bg-white/[0.07] px-1 py-0.5 font-mono text-[9px] text-white">
      {children}
    </span>
  );
}

function MusicGlyph({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={muted ? "opacity-50" : ""}>
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      {muted && <path d="m2 2 20 20" stroke="currentColor" />}
    </svg>
  );
}
