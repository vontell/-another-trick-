import { useCallback, useEffect, useState } from 'react';

const STORE_KEY = 'cryptic-maze:store:v1';

export interface Settings {
  /** Beginner aid: after a wrong guess, colour each square (right / wrong-spot / absent). */
  assistWrongLetters: boolean;
}

export interface LevelStat {
  completed: boolean;
  /** Best (lowest) maze-solving time in ms. */
  bestMazeMs?: number;
  /** Best meta-solving time in ms. */
  bestMetaMs?: number;
  /** Most rooms solved on the first try in a single run. */
  bestFirstTries?: number;
  /** Fewest mistakes in a completed run. */
  fewestMistakes?: number;
  plays: number;
}

export interface Stats {
  perLevel: Record<string, LevelStat>;
}

export interface Store {
  settings: Settings;
  seenHelp: boolean;
  stats: Stats;
}

const emptyStore = (): Store => ({
  settings: { assistWrongLetters: false },
  seenHelp: false,
  stats: { perLevel: {} },
});

function load(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    const base = emptyStore();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
      stats: { perLevel: { ...parsed.stats?.perLevel } },
    };
  } catch {
    return emptyStore();
  }
}

export interface Aggregate {
  roomsSolved: number;
  firstTries: number;
  mistakes: number;
  lettersRevealed: number;
  levelsCompleted: number;
}

/** Live totals read from each level's saved progress (v3 keys). */
export function aggregateProgress(levelIds: string[]): Aggregate {
  const agg: Aggregate = {
    roomsSolved: 0,
    firstTries: 0,
    mistakes: 0,
    lettersRevealed: 0,
    levelsCompleted: 0,
  };
  for (const id of levelIds) {
    try {
      const raw = localStorage.getItem(`cryptic-maze:${id}:v3`);
      if (!raw) continue;
      const p = JSON.parse(raw);
      const solved: string[] = p.solved ?? [];
      const tries: Record<string, number> = p.tries ?? {};
      agg.roomsSolved += solved.length;
      agg.firstTries += solved.filter((r) => (tries[r] ?? 0) === 1).length;
      agg.mistakes += p.mistakes ?? 0;
      agg.lettersRevealed += Object.values(p.revealed ?? {}).reduce(
        (n: number, arr) => n + (arr as number[]).length,
        0,
      );
      if (p.metaSolved) agg.levelsCompleted += 1;
    } catch {
      /* ignore */
    }
  }
  return agg;
}

export interface LevelRunResult {
  levelId: string;
  mazeMs: number;
  metaMs: number;
  firstTries: number;
  mistakes: number;
}

/**
 * Global, cross-level store: settings, stats and the first-visit flag.
 * Persisted under its own localStorage key (separate from per-level progress).
 */
export function useStore() {
  const [store, setStore] = useState<Store>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      /* ignore */
    }
  }, [store]);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const markHelpSeen = useCallback(() => {
    setStore((s) => (s.seenHelp ? s : { ...s, seenHelp: true }));
  }, []);

  /** Record a finished level (meta solved), updating its bests. */
  const recordLevelComplete = useCallback((r: LevelRunResult) => {
    setStore((s) => {
      const prev = s.stats.perLevel[r.levelId];
      const next: LevelStat = {
        completed: true,
        plays: (prev?.plays ?? 0) + 1,
        bestMazeMs: Math.min(prev?.bestMazeMs ?? Infinity, r.mazeMs),
        bestMetaMs: Math.min(prev?.bestMetaMs ?? Infinity, r.metaMs),
        bestFirstTries: Math.max(prev?.bestFirstTries ?? 0, r.firstTries),
        fewestMistakes: Math.min(prev?.fewestMistakes ?? Infinity, r.mistakes),
      };
      return { ...s, stats: { perLevel: { ...s.stats.perLevel, [r.levelId]: next } } };
    });
  }, []);

  const resetStats = useCallback(() => {
    setStore((s) => ({ ...s, stats: { perLevel: {} } }));
  }, []);

  return { store, setSettings, markHelpSeen, recordLevelComplete, resetStats };
}

export function formatMs(ms?: number): string {
  if (ms === undefined || !isFinite(ms)) return '—';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
