import { useMemo } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';

interface Props {
  game: ReturnType<typeof useGame>;
  onOpenRoom: (id: string) => void;
}

const TOP_PAD = 64;
const ROW_GAP = 104;
const BOTTOM_PAD = 56;

function xPct(col: number): number {
  return 8 + (col / 6) * 84;
}
function yPx(row: number): number {
  return TOP_PAD + row * ROW_GAP;
}

export default function MapView({ game, onOpenRoom }: Props) {
  const { rooms } = game;
  const maxRow = useMemo(() => Math.max(...rooms.map((r) => r.row)), [rooms]);
  const height = TOP_PAD + maxRow * ROW_GAP + BOTTOM_PAD;

  const state = (r: ResolvedRoom): 'solved' | 'available' | 'locked' => {
    if (game.isSolved(r.id)) return 'solved';
    if (game.isUnlocked(r.id)) return 'available';
    return 'locked';
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl px-2" style={{ height }}>
      {/* Edges */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {rooms.flatMap((r) =>
          r.next.map((nid) => {
            const child = game.byId.get(nid);
            if (!child) return null;
            const active = game.isSolved(r.id);
            return (
              <line
                key={`${r.id}-${nid}`}
                x1={`${xPct(r.col)}%`}
                y1={yPx(r.row) + 28}
                x2={`${xPct(child.col)}%`}
                y2={yPx(child.row) - 28}
                stroke={active ? '#6ea8fe' : '#2a3357'}
                strokeWidth={active ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={active ? undefined : '5 6'}
              />
            );
          }),
        )}
      </svg>

      {/* Nodes */}
      {rooms.map((r) => {
        const st = state(r);
        const left = `${xPct(r.col)}%`;
        const top = yPx(r.row);
        const showPower = r.powerUp === 'reveal';
        const showMeta = r.metaLetterIndex !== undefined;
        const collected = game.progress.collected.some((c) => c.roomId === r.id);

        const base =
          'absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-bold transition';
        const look =
          st === 'solved'
            ? 'border-good bg-good/20 text-good'
            : st === 'available'
              ? 'border-accent bg-panel2 text-accent shadow-[0_0_18px_rgba(110,168,254,0.45)] hover:scale-105'
              : 'border-edge bg-panel text-white/25';

        return (
          <button
            key={r.id}
            disabled={st === 'locked'}
            onClick={() => onOpenRoom(r.id)}
            className={[base, look, r.isFinal ? 'ring-2 ring-gold/60' : ''].join(' ')}
            style={{ left, top }}
            title={st === 'locked' ? 'Locked' : r.isFinal ? 'Final chamber' : r.clue}
          >
            {st === 'solved' ? '✓' : st === 'locked' ? '🔒' : r.isFinal ? '★' : '?'}

            {/* Badges */}
            {showPower && st !== 'solved' && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] text-ink">
                ⚡
              </span>
            )}
            {showMeta && (
              <span
                className={[
                  'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                  collected ? 'bg-meta text-white' : 'bg-meta/40 text-white',
                ].join(' ')}
              >
                ◆
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
