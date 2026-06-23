import Modal from './Modal';
import Icon from './Icon';
import type { Level, Difficulty } from '../game/types';
import type { Stats } from '../game/store';

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: 'bg-good/20 text-good',
  Medium: 'bg-accent/20 text-accent',
  Hard: 'bg-gold/20 text-gold',
  'Extra Hard': 'bg-bad/20 text-bad',
};

export default function PuzzlesDialog({
  puzzles,
  stats,
  currentId,
  onSelect,
  onClose,
}: {
  puzzles: Level[];
  stats: Stats;
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  // Most recent date first.
  const ordered = [...puzzles].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')).reverse();

  return (
    <Modal title="Daily puzzles" onClose={onClose}>
      <p className="mb-3 text-sm text-ink/60">Pick a day to play. New puzzles get harder as the week goes on.</p>
      <div className="space-y-2">
        {ordered.map((p) => {
          const done = stats.perLevel[p.id]?.completed;
          const active = p.id === currentId;
          return (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p.id);
                onClose();
              }}
              className={[
                'flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                active ? 'border-accent bg-accent/10' : 'border-edge/70 hover:bg-panel2',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                {done ? (
                  <Icon name="check" size={16} strokeWidth={2.4} className="text-good" />
                ) : (
                  <Icon name="spot" size={16} className="text-ink/30" />
                )}
                <span className="font-display font-semibold text-ink">{p.title}</span>
              </span>
              <span
                className={['rounded-full px-2 py-0.5 font-display text-[11px] font-semibold tracking-wide', DIFF_STYLE[p.difficulty]].join(' ')}
              >
                {p.difficulty}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
