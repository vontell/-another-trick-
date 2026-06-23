import type { CellFeedback } from './AnswerInput';

const ORDER: Record<CellFeedback, number> = { correct: 0, present: 1, absent: 2 };
const CHIP: Record<CellFeedback, string> = {
  correct: 'border-good bg-good/25 text-good',
  present: 'border-gold bg-gold/20 text-gold',
  absent: 'border-edge/60 bg-panel text-ink/30 line-through',
};

/** A persistent tray of letters discovered so far via the "reveal wrong letters" aid. */
export default function FoundLetters({ discovered }: { discovered: Record<string, CellFeedback> }) {
  const entries = Object.entries(discovered);
  if (entries.length === 0) return null;
  entries.sort((a, b) => ORDER[a[1]] - ORDER[b[1]] || a[0].localeCompare(b[0]));

  return (
    <div className="rounded-lg bg-panel2/60 px-3 py-2">
      <p className="mb-1.5 text-center text-xs uppercase tracking-wide text-ink/50">Letters found</p>
      <div className="flex flex-wrap justify-center gap-1">
        {entries.map(([letter, status]) => (
          <span
            key={letter}
            className={[
              'flex h-7 w-6 items-center justify-center rounded border font-display text-sm font-bold uppercase',
              CHIP[status],
            ].join(' ')}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
