import { useMemo } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import Icon from './Icon';

interface Props {
  game: ReturnType<typeof useGame>;
  onOpenRoom: (id: string) => void;
  /** Larger nodes / spacing on desktop. */
  big?: boolean;
}

// X position on a 0..100 scale (matches both the SVG viewBox and the nodes' left%).
function xPct(col: number): number {
  return 8 + (col / 6) * 84;
}

// Deterministic ±1 from a string, so each route always bows the same way.
function bowSign(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h % 2 === 0 ? 1 : -1;
}

export default function MapView({ game, onOpenRoom, big = false }: Props) {
  const { rooms } = game;
  const NODE = big ? 80 : 56; // px diameter
  const ROW_GAP = big ? 152 : 104;
  const TOP_PAD = big ? 90 : 64;
  const BOTTOM_PAD = big ? 78 : 56;
  const half = NODE / 2;

  const maxRow = useMemo(() => Math.max(...rooms.map((r) => r.row)), [rooms]);
  const height = TOP_PAD + maxRow * ROW_GAP + BOTTOM_PAD;
  // Invert so depth 0 (the start) sits at the BOTTOM and the final room at the top.
  const yPx = (row: number) => TOP_PAD + (maxRow - row) * ROW_GAP;

  const state = (r: ResolvedRoom): 'solved' | 'available' | 'locked' => {
    if (game.isSolved(r.id)) return 'solved';
    if (game.isUnlocked(r.id)) return 'available';
    return 'locked';
  };

  // Fill the tree in from the top (final room first), cascading down to the start.
  const fillDelay = (row: number) => (maxRow - row) * 70;

  return (
    <div
      className={['relative mx-auto w-full', big ? 'max-w-3xl' : 'max-w-2xl'].join(' ')}
      style={{ height }}
    >
      {/* Routes between rooms — gently curved, hand-inked, drawn in from the top */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        {rooms.flatMap((r) =>
          r.next.map((nid) => {
            const child = game.byId.get(nid);
            if (!child) return null;
            const active = game.isSolved(r.id);
            const x1 = xPct(r.col);
            const y1 = yPx(r.row);
            const x2 = xPct(child.col);
            const y2 = yPx(child.row);
            const mx = (x1 + x2) / 2 + bowSign(r.id + nid) * 5;
            const my = (y1 + y2) / 2;
            return (
              <path
                key={`${r.id}-${nid}`}
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                fill="none"
                stroke={active ? '#8a3b2e' : '#a8915f'}
                strokeWidth={active ? 2.4 : 1.8}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                opacity={active ? 0.95 : 0.5}
                style={{ strokeDasharray: 1, animationDelay: `${fillDelay(child.row) + 120}ms` }}
                className="animate-[draw_0.9s_ease-out_both]"
              />
            );
          }),
        )}
      </svg>

      {/* Rooms */}
      {rooms.map((r) => {
        const st = state(r);
        const showPower = r.powerUp;
        const showMeta = r.metaLetterIndex !== undefined;
        const collected = game.progress.collected.some((c) => c.roomId === r.id);

        const look =
          st === 'solved'
            ? 'border-meta text-meta'
            : st === 'available'
              ? 'border-accent text-accent animate-glowpulse hover:scale-110'
              : 'border-edge text-ink/30';

        const iconSize = big ? 34 : 24;

        return (
          // Wrapper handles positioning (centered via offset, NOT transform) + entrance.
          <div
            key={r.id}
            className="absolute z-10 animate-riseIn"
            style={{
              left: `calc(${xPct(r.col)}% - ${half}px)`,
              top: yPx(r.row) - half,
              animationDelay: `${fillDelay(r.row) + r.col * 6}ms`,
            }}
          >
            <button
              disabled={st === 'locked'}
              onClick={() => onOpenRoom(r.id)}
              className={[
                'relative flex items-center justify-center rounded-full border-2 bg-panel shadow-map transition-transform',
                look,
                r.isFinal ? 'ring-2 ring-gold ring-offset-2 ring-offset-paper' : '',
              ].join(' ')}
              style={{ width: NODE, height: NODE }}
              title={st === 'locked' ? 'Locked' : r.isFinal ? 'Final chamber' : r.clue}
            >
              {st === 'solved' ? (
                <Icon name="check" size={iconSize} strokeWidth={2.2} />
              ) : st === 'locked' ? (
                <Icon name="lock" size={iconSize - 4} />
              ) : r.isFinal ? (
                <Icon name="chest" size={iconSize} className="text-gold" />
              ) : (
                <Icon name="spot" size={iconSize} />
              )}

              {showPower && st !== 'solved' && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-gold bg-panel text-gold">
                  <Icon name={r.powerUp === 'vowel' ? 'vowel' : 'reveal'} size={11} strokeWidth={2} />
                </span>
              )}
              {showMeta && (
                <span
                  className={[
                    'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border',
                    collected ? 'border-meta bg-meta text-cream' : 'border-meta bg-panel text-meta',
                  ].join(' ')}
                >
                  <Icon name="meta" size={11} strokeWidth={2} />
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
