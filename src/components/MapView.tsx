import { useMemo } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import Icon from './Icon';

interface Props {
  game: ReturnType<typeof useGame>;
  onOpenRoom: (id: string) => void;
}

const TOP_PAD = 64;
const ROW_GAP = 104;
const BOTTOM_PAD = 56;

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

export default function MapView({ game, onOpenRoom }: Props) {
  const { rooms } = game;
  const maxRow = useMemo(() => Math.max(...rooms.map((r) => r.row)), [rooms]);
  const height = TOP_PAD + maxRow * ROW_GAP + BOTTOM_PAD;
  // Invert so depth 0 (the start) sits at the BOTTOM and the final room at the top.
  const yPx = (row: number) => TOP_PAD + (maxRow - row) * ROW_GAP;

  const state = (r: ResolvedRoom): 'solved' | 'available' | 'locked' => {
    if (game.isSolved(r.id)) return 'solved';
    if (game.isUnlocked(r.id)) return 'available';
    return 'locked';
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl" style={{ height }}>
      {/* Routes between rooms — gently curved, hand-inked, drawn in on load */}
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
            const mx = (x1 + x2) / 2 + bowSign(r.id + nid) * 6;
            const my = (y1 + y2) / 2 + 6;
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
                style={{ strokeDasharray: 1, animationDelay: `${250 + r.row * 90}ms` }}
                className="animate-[draw_0.9s_ease-out_both]"
              />
            );
          }),
        )}
      </svg>

      {/* Rooms */}
      {rooms.map((r, i) => {
        const st = state(r);
        const left = `${xPct(r.col)}%`;
        const top = yPx(r.row);
        const showPower = r.powerUp;
        const showMeta = r.metaLetterIndex !== undefined;
        const collected = game.progress.collected.some((c) => c.roomId === r.id);

        const base =
          'absolute z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 animate-riseIn items-center justify-center rounded-full border-2 bg-panel shadow-map transition-transform';
        const look =
          st === 'solved'
            ? 'border-meta text-meta'
            : st === 'available'
              ? 'border-accent text-accent animate-glowpulse hover:scale-110'
              : 'border-edge text-ink/30';

        return (
          <button
            key={r.id}
            disabled={st === 'locked'}
            onClick={() => onOpenRoom(r.id)}
            className={[base, look, r.isFinal ? 'ring-2 ring-gold ring-offset-2 ring-offset-paper' : ''].join(' ')}
            style={{ left, top, animationDelay: `${Math.min(i * 26, 520)}ms` }}
            title={st === 'locked' ? 'Locked' : r.isFinal ? 'Final chamber' : r.clue}
          >
            {st === 'solved' ? (
              <Icon name="check" size={24} strokeWidth={2.2} />
            ) : st === 'locked' ? (
              <Icon name="lock" size={20} />
            ) : r.isFinal ? (
              <Icon name="chest" size={24} className="text-gold" />
            ) : (
              <Icon name="spot" size={24} />
            )}

            {/* Badges */}
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
        );
      })}
    </div>
  );
}
