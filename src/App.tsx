import { useCallback, useEffect, useRef, useState } from "react";
import HelpModal from "./components/HelpModal";
import { gameAudio } from "./game/audio";
import { getLevel } from "./game/levels";
import {
  loadProgress,
  recordRun,
  saveProgress,
  type Progress,
  type RunSummary,
} from "./game/storage";
import GameScreen, { type RunResult } from "./screens/GameScreen";
import MenuScreen from "./screens/MenuScreen";
import ResultScreen from "./screens/ResultScreen";

type Screen = "menu" | "game" | "result";

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>("menu");
  const [activeLevelId, setActiveLevelId] = useState<number>(() => {
    const saved = loadProgress();
    return Math.min(5, Math.max(1, saved.unlockedLevel));
  });
  const [sessionKey, setSessionKey] = useState(0);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  // Browsers require a user gesture before audio can start.
  useEffect(() => {
    const unlock = () => {
      gameAudio.init();
      gameAudio.setSound(progressRef.current.settings.sound);
      gameAudio.setMusic(progressRef.current.settings.music);
      if (progressRef.current.settings.music) gameAudio.startMusic();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    gameAudio.setSound(progress.settings.sound);
    gameAudio.setMusic(progress.settings.music);
  }, [progress.settings.sound, progress.settings.music]);

  const startLevel = useCallback(
    (levelId: number) => {
      const settings = progressRef.current.settings;
      gameAudio.init();
      gameAudio.setSound(settings.sound);
      gameAudio.setMusic(settings.music);
      gameAudio.startMusic();
      setActiveLevelId(levelId);
      setSessionKey((value) => value + 1);
      setLastResult(null);
      setIsNewBest(false);
      setHelpOpen(false);
      setScreen("game");
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [],
  );

  const handleToggleSound = useCallback(() => {
    gameAudio.init();
    const next = !progressRef.current.settings.sound;
    gameAudio.setSound(next);
    const updated: Progress = {
      ...progressRef.current,
      settings: { ...progressRef.current.settings, sound: next },
    };
    persist(updated);
  }, [persist]);

  const handleToggleMusic = useCallback(() => {
    gameAudio.init();
    const next = !progressRef.current.settings.music;
    gameAudio.setMusic(next);
    if (screen === "menu" && next) gameAudio.startMusic();
    const updated: Progress = {
      ...progressRef.current,
      settings: { ...progressRef.current.settings, music: next },
    };
    persist(updated);
  }, [persist, screen]);

  const handleFinish = useCallback(
    (result: RunResult) => {
      const current = progressRef.current;
      const previousBest = current.records[result.levelId]?.bestScore ?? 0;
      setIsNewBest(result.score > previousBest && result.score > 0);

      const summary: RunSummary = {
        level: result.levelId,
        score: result.score,
        coins: result.coins,
        correct: result.correct,
        wrong: result.wrong,
        stars: result.stars,
        accuracy: result.accuracy,
        completed: result.completed,
      };
      const updated = recordRun(current, summary);
      persist(updated);
      setLastResult(result);
      gameAudio.stopMusic();
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [persist],
  );

  const handleMenu = useCallback(() => {
    setScreen("menu");
    setHelpOpen(false);
    if (progressRef.current.settings.music) {
      gameAudio.init();
      gameAudio.resumeMusic();
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleNext = useCallback(() => {
    const latest = lastResult ?? { levelId: activeLevelId };
    const nextId = Math.min(5, latest.levelId + 1);
    startLevel(nextId);
  }, [activeLevelId, lastResult, startLevel]);

  const activeLevel = getLevel(activeLevelId);
  const resultLevel = getLevel(lastResult?.levelId ?? activeLevelId);
  const resultBest = lastResult
    ? Math.max(progress.bestScore, progress.records[lastResult.levelId]?.bestScore ?? 0)
    : progress.bestScore;

  return (
    <>
      {screen === "menu" && (
        <MenuScreen
          progress={progress}
          onStart={startLevel}
          onHowTo={() => setHelpOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {screen === "game" && (
        <GameScreen
          key={`level-${activeLevelId}-session-${sessionKey}`}
          level={activeLevel}
          settings={progress.settings}
          onFinish={handleFinish}
          onExit={handleMenu}
          onHowTo={() => setHelpOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {screen === "result" && lastResult && (
        <ResultScreen
          level={resultLevel}
          result={lastResult}
          bestScore={resultBest}
          totalCoins={progress.coins}
          isNewBest={isNewBest}
          onReplay={() => startLevel(lastResult.levelId)}
          onNext={handleNext}
          onMenu={handleMenu}
        />
      )}

      {helpOpen && (
        <HelpModalStateful
          onClose={() => setHelpOpen(false)}
          screen={screen}
          onStart={() => startLevel(Math.min(5, progress.unlockedLevel))}
        />
      )}
    </>
  );
}

function HelpModalStateful({
  onClose,
  onStart,
  screen,
}: {
  onClose: () => void;
  onStart: () => void;
  screen: Screen;
}) {
  return <HelpModal onClose={onClose} onStart={screen === "menu" ? onStart : undefined} />;
}
