import { useEffect, useState } from 'react';
import {
  fetchPuzzleStats,
  globalStatsEnabled,
  type PuzzleStats,
  type TimeBucket,
} from '../services/globalStats';
import { formatMs } from '../game/store';

function bucketLabel(startSec: number): string {
  const m = Math.floor(startSec / 60);
  const s = startSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** A compact solve-time histogram with the player's own bucket highlighted. */
function Histogram({
  title,
  buckets,
  bucketSeconds,
  youMs,
}: {
  title: string;
  buckets: TimeBucket[];
  bucketSeconds: number;
  youMs?: number;
}) {
  if (buckets.length === 0) {
    return (
      <div>
        <p className="mb-1 text-sm text-ink/60">{title}</p>
        <p className="text-xs text-ink/40">No finishes recorded yet — be the first.</p>
      </div>
    );
  }
  const max = Math.max(...buckets.map((b) => b.count));
  const youBucket =
    youMs !== undefined && isFinite(youMs)
      ? Math.floor(youMs / 1000 / bucketSeconds) * bucketSeconds
      : undefined;

  return (
    <div>
      <p className="mb-1.5 text-sm text-ink/60">{title}</p>
      <div className="flex items-end gap-1" style={{ height: 64 }}>
        {buckets.map((b) => {
          const mine = b.start === youBucket;
          return (
            <div key={b.start} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] leading-none text-ink/40">{b.count}</span>
              <div
                className={[
                  'w-full rounded-t',
                  mine ? 'bg-accent' : 'bg-meta/50',
                ].join(' ')}
                style={{ height: Math.max(3, (b.count / max) * 44) }}
                title={`${bucketLabel(b.start)}–${bucketLabel(b.start + bucketSeconds)}: ${b.count}`}
              />
              <span
                className={[
                  'text-[9px] leading-none',
                  mine ? 'font-semibold text-accent' : 'text-ink/35',
                ].join(' ')}
              >
                {bucketLabel(b.start)}
              </span>
            </div>
          );
        })}
      </div>
      {youBucket !== undefined && (
        <p className="mt-1 text-[11px] text-accent">Your time: {formatMs(youMs)}</p>
      )}
    </div>
  );
}

/** Shared, anonymous global stats for a single puzzle. Hidden when Supabase
 *  isn't configured, or while the fetch is in flight / fails. */
export default function GlobalStats({
  puzzleId,
  title,
  yourMazeMs,
  yourMetaMs,
}: {
  puzzleId: string;
  title: string;
  yourMazeMs?: number;
  yourMetaMs?: number;
}) {
  const [stats, setStats] = useState<PuzzleStats | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!globalStatsEnabled) return;
    let live = true;
    setState('loading');
    fetchPuzzleStats(puzzleId)
      .then((s) => {
        if (!live) return;
        if (s) {
          setStats(s);
          setState('ready');
        } else {
          setState('error');
        }
      })
      .catch(() => live && setState('error'));
    return () => {
      live = false;
    };
  }, [puzzleId]);

  if (!globalStatsEnabled) return null;

  return (
    <div className="rounded-xl border border-meta/40 bg-meta/5 p-3">
      <p className="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
        <span>Everyone — {title}</span>
        <span className="text-xs font-normal text-ink/40">live</span>
      </p>

      {state === 'loading' && <p className="text-xs text-ink/40">Loading global stats…</p>}
      {state === 'error' && <p className="text-xs text-ink/40">Global stats are unavailable right now.</p>}

      {state === 'ready' && stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ['Played', stats.played],
                ['Solved maze', stats.mazeSolved],
                ['Cracked meta', stats.metaSolved],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-panel2 px-2 py-1.5">
                <div className="text-lg font-bold text-ink">{value.toLocaleString()}</div>
                <div className="text-[11px] text-ink/50">{label}</div>
              </div>
            ))}
          </div>

          <Histogram
            title="Maze solve times"
            buckets={stats.mazeBuckets}
            bucketSeconds={stats.bucketSeconds}
            youMs={yourMazeMs}
          />
          <Histogram
            title="Meta solve times"
            buckets={stats.metaBuckets}
            bucketSeconds={stats.bucketSeconds}
            youMs={yourMetaMs}
          />
        </div>
      )}
    </div>
  );
}
