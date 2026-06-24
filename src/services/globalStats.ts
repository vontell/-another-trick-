// Supabase-backed *global* stats, shared across all players. The design is
// deliberately aggregate-only — no accounts, no per-user rows, no device id is
// ever sent. We just bump anonymous counters and append anonymous run times so
// the game can show "today's" play/solve counts and a solve-time distribution.
//
// Every device guards its own writes with localStorage flags so reloads and
// replays don't inflate the counters: a given browser contributes at most one
// "played", one "maze solved" and one "meta solved" per puzzle id.
//
// All of this no-ops cleanly when Supabase keys aren't configured.
import { SUPABASE_URL, SUPABASE_ANON_KEY, globalStatsEnabled } from './env';

export interface TimeBucket {
  /** Inclusive lower edge of the bucket, in whole seconds. */
  start: number;
  count: number;
}

export interface PuzzleStats {
  played: number;
  mazeSolved: number;
  metaSolved: number;
  /** Histogram of maze-solve times (30s buckets). */
  mazeBuckets: TimeBucket[];
  /** Histogram of meta-solve times (30s buckets). */
  metaBuckets: TimeBucket[];
  /** Bucket width in seconds (matches the SQL function). */
  bucketSeconds: number;
}

// Lazily-created client; null when disabled.
let clientPromise: Promise<import('@supabase/supabase-js').SupabaseClient | null> | null = null;

function getClient() {
  if (!globalStatsEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false },
        }),
      )
      .catch(() => null);
  }
  return clientPromise;
}

// --- one-write-per-device guards -------------------------------------------

function flagKey(kind: string, puzzleId: string) {
  return `cryptic-maze:contributed:${kind}:${puzzleId}`;
}

function alreadyContributed(kind: string, puzzleId: string): boolean {
  try {
    return localStorage.getItem(flagKey(kind, puzzleId)) === '1';
  } catch {
    return false;
  }
}

function markContributed(kind: string, puzzleId: string) {
  try {
    localStorage.setItem(flagKey(kind, puzzleId), '1');
  } catch {
    /* ignore quota / private-mode */
  }
}

// --- writes ----------------------------------------------------------------

/** Count one player opening this puzzle (once per device per puzzle). */
export async function recordPlay(puzzleId: string) {
  if (!globalStatsEnabled || alreadyContributed('played', puzzleId)) return;
  markContributed('played', puzzleId);
  const client = await getClient();
  await client?.rpc('record_played', { p_puzzle: puzzleId }).then(undefined, () => undefined);
}

/** Count one player clearing the maze (reaching/solving the final room). */
export async function recordMazeSolved(puzzleId: string) {
  if (!globalStatsEnabled || alreadyContributed('maze', puzzleId)) return;
  markContributed('maze', puzzleId);
  const client = await getClient();
  await client?.rpc('record_maze_solved', { p_puzzle: puzzleId }).then(undefined, () => undefined);
}

/** Count one player cracking the meta, and append their anonymous run times. */
export async function recordMetaSolved(
  puzzleId: string,
  run: { mazeMs: number; metaMs: number; mistakes: number },
) {
  if (!globalStatsEnabled || alreadyContributed('meta', puzzleId)) return;
  markContributed('meta', puzzleId);
  const client = await getClient();
  await client
    ?.rpc('record_meta_solved', {
      p_puzzle: puzzleId,
      p_maze_ms: Math.round(run.mazeMs),
      p_meta_ms: Math.round(run.metaMs),
      p_mistakes: run.mistakes,
    })
    .then(undefined, () => undefined);
}

// --- reads -----------------------------------------------------------------

interface RawStats {
  played: number;
  maze_solved: number;
  meta_solved: number;
  bucket_seconds: number;
  maze_buckets: { start: number; count: number }[];
  meta_buckets: { start: number; count: number }[];
}

/** Fetch the shared stats for a puzzle, or null if unavailable. */
export async function fetchPuzzleStats(puzzleId: string): Promise<PuzzleStats | null> {
  if (!globalStatsEnabled) return null;
  const client = await getClient();
  if (!client) return null;
  const { data, error } = await client.rpc('get_puzzle_stats', { p_puzzle: puzzleId });
  if (error || !data) return null;
  const raw = data as RawStats;
  return {
    played: raw.played ?? 0,
    mazeSolved: raw.maze_solved ?? 0,
    metaSolved: raw.meta_solved ?? 0,
    bucketSeconds: raw.bucket_seconds ?? 30,
    mazeBuckets: (raw.maze_buckets ?? []).map((b) => ({ start: b.start, count: b.count })),
    metaBuckets: (raw.meta_buckets ?? []).map((b) => ({ start: b.start, count: b.count })),
  };
}

export { globalStatsEnabled };
