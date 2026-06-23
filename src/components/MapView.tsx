import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import Icon from './Icon';

interface Props {
  game: ReturnType<typeof useGame>;
  onOpenRoom: (id: string) => void;
  /** Larger nodes / spacing on desktop. */
  big?: boolean;
  /** Id of the room currently open (highlighted as "you are here"). */
  currentId?: string | null;
}

// X position on a 0..100 scale (matches the nodes' left%).
function xPct(col: number): number {
  return 8 + (col / 6) * 84;
}

// Deterministic ±1 from a string, so each route always bows the same way.
function bowSign(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h % 2 === 0 ? 1 : -1;
}

export default function MapView({ game, onOpenRoom, big = false, currentId }: Props) {
  const { rooms } = game;
  const NODE = big ? 80 : 56; // px diameter
  const ROW_GAP = big ? 152 : 104;
  const TOP_PAD = big ? 90 : 64;
  const BOTTOM_PAD = big ? 78 : 56;
  const half = NODE / 2;
  const R = half + 3; // trim routes to just outside the medallion rim

  const maxRow = useMemo(() => Math.max(...rooms.map((r) => r.row)), [rooms]);
  const height = TOP_PAD + maxRow * ROW_GAP + BOTTOM_PAD;
  const yPx = (row: number) => TOP_PAD + (maxRow - row) * ROW_GAP;

  // Measure the container so routes can be drawn in true pixel space (and so
  // we can trim each line to the circle edges instead of node centers).
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const xPx = (col: number) => (xPct(col) / 100) * width;

  const state = (r: ResolvedRoom): 'solved' | 'available' | 'locked' => {
    if (game.isSolved(r.id)) return 'solved';
    if (game.isUnlocked(r.id)) return 'available';
    return 'locked';
  };

  // Fill the tree in from the top (final room first), cascading down to the start.
  const fillDelay = (row: number) => (maxRow - row) * 70;

  return (
    <div
      ref={ref}
      className={['relative mx-auto w-full', big ? 'max-w-3xl' : 'max-w-2xl'].join(' ')}
      style={{ height }}
    >
      {/* Routes — gently curved, trimmed to the medallion rims, drawn in from the top */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" width={width} height={height}>
        {width > 0 &&
          rooms.flatMap((r) =>
            r.next.map((nid) => {
              const child = game.byId.get(nid);
              if (!child) return null;
              const active = game.isSolved(r.id);
              const ax = xPx(r.col);
              const ay = yPx(r.row);
              const bx = xPx(child.col);
              const by = yPx(child.row);
              const dx = bx - ax;
              const dy = by - ay;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              // Trim both ends to the circle rim.
              const x1 = ax + ux * R;
              const y1 = ay + uy * R;
              const x2 = bx - ux * R;
              const y2 = by - uy * R;
              // Perpendicular bow for a hand-drawn wind.
              const bow = bowSign(r.id + nid) * Math.min(len * 0.12, 16);
              const mx = (x1 + x2) / 2 + -uy * bow;
              const my = (y1 + y2) / 2 + ux * bow;
              return (
                <path
                  key={`${r.id}-${nid}`}
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  fill="none"
                  stroke={active ? '#8a3b2e' : '#9c8550'}
                  strokeWidth={active ? 2.6 : 2}
                  strokeLinecap="round"
                  pathLength={1}
                  opacity={active ? 0.95 : 0.62}
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
        const isCurrent = r.id === currentId;
        const showPower = r.powerUp;
        const showMeta = r.metaLetterIndex !== undefined;
        const collected = game.progress.collected.some((c) => c.roomId === r.id);

        const look =
          st === 'solved'
            ? 'border-meta text-meta'
            : st === 'available'
              ? 'border-accent text-accent hover:scale-110'
              : 'border-edge text-ink/30';

        const iconSize = big ? 34 : 24;

        return (
          <div
            key={r.id}
            className="absolute z-10 animate-riseIn"
            style={{
              left: `calc(${xPct(r.col)}% - ${half}px)`,
              top: yPx(r.row) - half,
              animationDelay: `${fillDelay(r.row) + r.col * 6}ms`,
            }}
          >
            {/* "You are here" pulse ring */}
            {isCurrent && (
              <span
                className="pointer-events-none absolute -inset-1.5 animate-glowpulse rounded-full border-2 border-accent"
                aria-hidden
              />
            )}
            <button
              disabled={st === 'locked'}
              onClick={() => onOpenRoom(r.id)}
              className={[
                'relative flex items-center justify-center rounded-full border-2 shadow-map transition-transform',
                isCurrent ? 'bg-accent text-cream' : 'bg-panel',
                isCurrent ? 'border-accent' : look,
                r.isFinal ? 'ring-2 ring-gold ring-offset-2 ring-offset-paper' : '',
                st === 'available' && !isCurrent ? 'animate-glowpulse' : '',
              ].join(' ')}
              style={{ width: NODE, height: NODE }}
              title={st === 'locked' ? 'Locked' : r.isFinal ? 'Final chamber' : r.clue}
            >
              {st === 'solved' && !isCurrent ? (
                <Icon name="check" size={iconSize} strokeWidth={2.2} />
              ) : st === 'locked' ? (
                <Icon name="lock" size={iconSize - 4} />
              ) : r.isFinal ? (
                <Icon name="chest" size={iconSize} className={isCurrent ? 'text-cream' : 'text-gold'} />
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
