import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Level, ResolvedRoom } from './types';
import { normalize, resolveLevel } from './bridges';

const STORAGE_VERSION = 'v1';

export interface Progress {
  /** IDs of solved rooms. */
  solved: string[];
  /** Total submit attempts per room (used to detect first-try solves). */
  tries: Record<string, number>;
  /** Letter indices revealed via a token, per room. */
  revealed: Record<string, number[]>;
  /** Reveal-letter tokens currently held. */
  tokens: number;
  /** Letters collected for the meta puzzle, in order collected. */
  collected: { roomId: string; letter: string }[];
  metaSolved: boolean;
  metaTries: number;
}

const emptyProgress = (): Progress => ({
  solved: [],
  tries: {},
  revealed: {},
  tokens: 0,
  collected: [],
  metaSolved: false,
  metaTries: 0,
});

type Action =
  | { type: 'CORRECT'; roomId: string; firstTry: boolean; awardToken: boolean; letter?: string }
  | { type: 'WRONG'; roomId: string }
  | { type: 'REVEAL'; roomId: string; index: number }
  | { type: 'META_SOLVED' }
  | { type: 'META_WRONG' }
  | { type: 'RESET' };

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case 'CORRECT': {
      if (state.solved.includes(action.roomId)) return state;
      const collected =
        action.letter && !state.collected.some((c) => c.roomId === action.roomId)
          ? [...state.collected, { roomId: action.roomId, letter: action.letter }]
          : state.collected;
      return {
        ...state,
        solved: [...state.solved, action.roomId],
        tries: { ...state.tries, [action.roomId]: (state.tries[action.roomId] ?? 0) + 1 },
        tokens: state.tokens + (action.awardToken ? 1 : 0),
        collected,
      };
    }
    case 'WRONG':
      return {
        ...state,
        tries: { ...state.tries, [action.roomId]: (state.tries[action.roomId] ?? 0) + 1 },
      };
    case 'REVEAL': {
      if (state.tokens <= 0) return state;
      const current = state.revealed[action.roomId] ?? [];
      if (current.includes(action.index)) return state;
      return {
        ...state,
        tokens: state.tokens - 1,
        revealed: { ...state.revealed, [action.roomId]: [...current, action.index] },
      };
    }
    case 'META_SOLVED':
      return { ...state, metaSolved: true, metaTries: state.metaTries + 1 };
    case 'META_WRONG':
      return { ...state, metaTries: state.metaTries + 1 };
    case 'RESET':
      return emptyProgress();
    default:
      return state;
  }
}

function load(key: string): Progress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return emptyProgress();
  }
}

export function useGame(level: Level) {
  const resolved = useMemo(() => resolveLevel(level), [level]);
  const byId = useMemo(
    () => new Map(resolved.rooms.map((r) => [r.id, r])),
    [resolved],
  );
  const storageKey = `cryptic-maze:${level.id}:${STORAGE_VERSION}`;

  const [progress, dispatch] = useReducer(reducer, storageKey, load);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [storageKey, progress]);

  const solvedSet = useMemo(() => new Set(progress.solved), [progress.solved]);

  const isSolved = useCallback((id: string) => solvedSet.has(id), [solvedSet]);

  const isUnlocked = useCallback(
    (id: string) =>
      level.startRoomIds.includes(id) ||
      resolved.rooms.some((r) => r.next.includes(id) && solvedSet.has(r.id)),
    [level.startRoomIds, resolved.rooms, solvedSet],
  );

  /** Submit a guess for a room. Returns true on a correct answer. */
  const submit = useCallback(
    (roomId: string, guess: string): boolean => {
      const room = byId.get(roomId);
      if (!room || solvedSet.has(roomId)) return false;
      if (normalize(guess) !== room.answer) {
        dispatch({ type: 'WRONG', roomId });
        return false;
      }
      const firstTry = (progress.tries[roomId] ?? 0) === 0;
      const awardToken = room.powerUp === 'reveal' && firstTry;
      const letter =
        room.metaLetterIndex !== undefined ? room.answer[room.metaLetterIndex] : undefined;
      dispatch({ type: 'CORRECT', roomId, firstTry, awardToken, letter });
      return true;
    },
    [byId, solvedSet, progress.tries],
  );

  const revealLetter = useCallback(
    (roomId: string): number | null => {
      const room = byId.get(roomId);
      if (!room || progress.tokens <= 0) return null;
      const used = progress.revealed[roomId] ?? [];
      const candidates = room.answer
        .split('')
        .map((_, i) => i)
        .filter((i) => !used.includes(i));
      if (candidates.length === 0) return null;
      const index = candidates[Math.floor(Math.random() * candidates.length)];
      dispatch({ type: 'REVEAL', roomId, index });
      return index;
    },
    [byId, progress.tokens, progress.revealed],
  );

  const submitMeta = useCallback(
    (guess: string): boolean => {
      if (normalize(guess) === level.meta.answer) {
        dispatch({ type: 'META_SOLVED' });
        return true;
      }
      dispatch({ type: 'META_WRONG' });
      return false;
    },
    [level.meta.answer],
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const finalSolved = solvedSet.has(level.finalRoomId);
  const solvedCount = progress.solved.length;

  return {
    resolved,
    rooms: resolved.rooms as ResolvedRoom[],
    byId,
    progress,
    isSolved,
    isUnlocked,
    submit,
    revealLetter,
    submitMeta,
    reset,
    finalSolved,
    solvedCount,
  };
}
