import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Level, ResolvedRoom } from './types';
import { normalize, resolveLevel } from './bridges';

const STORAGE_VERSION = 'v3';

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export interface Progress {
  /** IDs of solved rooms. */
  solved: string[];
  /** Total submit attempts per room (used to detect first-try solves). */
  tries: Record<string, number>;
  /** Letter indices revealed (via Reveal token or Vowel Flare), per room. */
  revealed: Record<string, number[]>;
  /** Power-up tokens currently held. */
  tokens: { reveal: number; vowel: number };
  /** Letters collected for the meta puzzle, in order collected. */
  collected: { roomId: string; letter: string }[];
  metaSolved: boolean;
  metaTries: number;
  /** Total wrong guesses across the level. */
  mistakes: number;
  /** Timers (ms). The maze timer runs until the final room is solved; the meta
   *  timer runs from when the meta is first opened until it is solved. */
  started: boolean;
  mazeMs: number;
  metaStarted: boolean;
  metaMs: number;
}

const emptyProgress = (): Progress => ({
  solved: [],
  tries: {},
  revealed: {},
  tokens: { reveal: 0, vowel: 0 },
  collected: [],
  metaSolved: false,
  metaTries: 0,
  mistakes: 0,
  started: false,
  mazeMs: 0,
  metaStarted: false,
  metaMs: 0,
});

type Action =
  | { type: 'CORRECT'; roomId: string; awardReveal: boolean; awardVowel: boolean; letter?: string }
  | { type: 'WRONG'; roomId: string }
  | { type: 'REVEAL'; roomId: string; index: number }
  | { type: 'VOWELS'; roomId: string; indices: number[] }
  | { type: 'META_SOLVED' }
  | { type: 'META_WRONG' }
  | { type: 'START_MAZE' }
  | { type: 'START_META' }
  | { type: 'TICK'; maze: boolean; meta: boolean; delta: number }
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
        tokens: {
          reveal: state.tokens.reveal + (action.awardReveal ? 1 : 0),
          vowel: state.tokens.vowel + (action.awardVowel ? 1 : 0),
        },
        collected,
      };
    }
    case 'WRONG':
      return {
        ...state,
        mistakes: state.mistakes + 1,
        tries: { ...state.tries, [action.roomId]: (state.tries[action.roomId] ?? 0) + 1 },
      };
    case 'REVEAL': {
      if (state.tokens.reveal <= 0) return state;
      const current = state.revealed[action.roomId] ?? [];
      if (current.includes(action.index)) return state;
      return {
        ...state,
        tokens: { ...state.tokens, reveal: state.tokens.reveal - 1 },
        revealed: { ...state.revealed, [action.roomId]: [...current, action.index] },
      };
    }
    case 'VOWELS': {
      if (state.tokens.vowel <= 0 || action.indices.length === 0) return state;
      const current = state.revealed[action.roomId] ?? [];
      const merged = Array.from(new Set([...current, ...action.indices]));
      return {
        ...state,
        tokens: { ...state.tokens, vowel: state.tokens.vowel - 1 },
        revealed: { ...state.revealed, [action.roomId]: merged },
      };
    }
    case 'META_SOLVED':
      return { ...state, metaSolved: true, metaTries: state.metaTries + 1 };
    case 'META_WRONG':
      return { ...state, metaTries: state.metaTries + 1, mistakes: state.mistakes + 1 };
    case 'START_MAZE':
      return state.started ? state : { ...state, started: true };
    case 'START_META':
      return state.metaStarted ? state : { ...state, metaStarted: true };
    case 'TICK':
      return {
        ...state,
        mazeMs: state.mazeMs + (action.maze ? action.delta : 0),
        metaMs: state.metaMs + (action.meta ? action.delta : 0),
      };
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
  const byId = useMemo(() => new Map(resolved.rooms.map((r) => [r.id, r])), [resolved]);
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

  const finalSolved = solvedSet.has(level.finalRoomId);

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
      dispatch({
        type: 'CORRECT',
        roomId,
        awardReveal: room.powerUp === 'reveal' && firstTry,
        awardVowel: room.powerUp === 'vowel' && firstTry,
        letter: room.metaLetterIndex !== undefined ? room.answer[room.metaLetterIndex] : undefined,
      });
      return true;
    },
    [byId, solvedSet, progress.tries],
  );

  const revealLetter = useCallback(
    (roomId: string): number | null => {
      const room = byId.get(roomId);
      if (!room || progress.tokens.reveal <= 0) return null;
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
    [byId, progress.tokens.reveal, progress.revealed],
  );

  const vowelFlare = useCallback(
    (roomId: string): boolean => {
      const room = byId.get(roomId);
      if (!room || progress.tokens.vowel <= 0) return false;
      const indices = room.answer
        .split('')
        .map((ch, i) => (VOWELS.has(ch) ? i : -1))
        .filter((i) => i >= 0);
      if (indices.length === 0) return false;
      dispatch({ type: 'VOWELS', roomId, indices });
      return true;
    },
    [byId, progress.tokens.vowel],
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

  const startMaze = useCallback(() => dispatch({ type: 'START_MAZE' }), []);
  const startMeta = useCallback(() => dispatch({ type: 'START_META' }), []);
  const tick = useCallback(
    (delta: number) => {
      const maze = progress.started && !finalSolved;
      const meta = progress.metaStarted && !progress.metaSolved;
      if (maze || meta) dispatch({ type: 'TICK', maze, meta, delta });
    },
    [progress.started, progress.metaStarted, progress.metaSolved, finalSolved],
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const solvedCount = progress.solved.length;
  const firstTries = progress.solved.filter((id) => (progress.tries[id] ?? 0) === 1).length;

  return {
    resolved,
    rooms: resolved.rooms as ResolvedRoom[],
    byId,
    progress,
    isSolved,
    isUnlocked,
    submit,
    revealLetter,
    vowelFlare,
    submitMeta,
    startMaze,
    startMeta,
    tick,
    reset,
    finalSolved,
    solvedCount,
    firstTries,
  };
}
