export interface Settings {
  sound: boolean;
  music: boolean;
  timer: boolean;
}

export interface LevelRecord {
  bestScore: number;
  bestStars: number;
  completed: boolean;
  bestAccuracy: number;
  plays: number;
}

export interface Progress {
  unlockedLevel: number;
  coins: number;
  bestScore: number;
  records: Record<number, LevelRecord>;
  settings: Settings;
}

const STORAGE_KEY = "robot-math-adventure-3d-v1";

export const defaultProgress: Progress = {
  unlockedLevel: 1,
  coins: 0,
  bestScore: 0,
  records: {},
  settings: { sound: true, music: true, timer: true },
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...defaultProgress,
      ...parsed,
      settings: { ...defaultProgress.settings, ...(parsed.settings ?? {}) },
      records: parsed.records ?? {},
      unlockedLevel: Math.min(5, Math.max(1, Number(parsed.unlockedLevel) || 1)),
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: Progress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Private browsing / disabled storage should never stop the game.
  }
}

export interface RunSummary {
  level: number;
  score: number;
  coins: number;
  correct: number;
  wrong: number;
  stars: number;
  accuracy: number;
  completed: boolean;
}

export function recordRun(progress: Progress, summary: RunSummary): Progress {
  const previous = progress.records[summary.level];
  const record: LevelRecord = {
    bestScore: Math.max(previous?.bestScore ?? 0, summary.score),
    bestStars: Math.max(previous?.bestStars ?? 0, summary.stars),
    completed: (previous?.completed ?? false) || summary.completed,
    bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, summary.accuracy),
    plays: (previous?.plays ?? 0) + 1,
  };

  const next: Progress = {
    ...progress,
    coins: progress.coins + summary.coins,
    bestScore: Math.max(progress.bestScore, summary.score),
    unlockedLevel: Math.max(
      progress.unlockedLevel,
      summary.completed ? Math.min(5, summary.level + 1) : summary.level,
    ),
    records: { ...progress.records, [summary.level]: record },
  };
  saveProgress(next);
  return next;
}

export function resetProgress(): Progress {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
  return { ...defaultProgress, records: {} };
}

export function starRating(correct: number): number {
  if (correct >= 10) return 3;
  if (correct >= 8) return 2;
  if (correct >= 5) return 1;
  return 0;
}
