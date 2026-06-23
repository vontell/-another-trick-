export type CellFeedback = 'correct' | 'present' | 'absent';

interface Props {
  /** Current letters, one per square ('' for empty). Length = number of squares. */
  cells: string[];
  /** Word lengths; e.g. [3,3] renders two groups of 3 with a gap. */
  enumeration?: number[];
  /** Index of the active square (where the next letter lands). */
  caret?: number;
  /** Click a square to move the caret there. */
  onCellClick?: (i: number) => void;
  /** Map of position -> revealed letter (shown faintly as a hint). */
  revealed?: Map<number, string>;
  /** Per-square Wordle-style feedback (beginner "reveal wrong letters" aid). */
  feedback?: (CellFeedback | undefined)[];
  /** Position of a single collected (blue) meta-letter square. */
  metaIndex?: number;
  /** Position of the guaranteed bridge bigram (outlined), once revealed. */
  bridgeStart?: number;
  status: 'idle' | 'wrong' | 'correct';
}

/** Answer grid. Squares are tappable to move the caret; typing is handled by the keyboard. */
export default function AnswerInput({
  cells,
  enumeration,
  caret,
  onCellClick,
  revealed,
  feedback,
  metaIndex,
  bridgeStart,
  status,
}: Props) {
  const length = cells.length;

  const cell = (i: number) => {
    const ch = cells[i] ?? '';
    const hint = !ch && revealed?.get(i);
    const isCaret = i === caret && status !== 'correct';
    const isMeta = i === metaIndex;
    const inBridge = bridgeStart !== undefined && (i === bridgeStart || i === bridgeStart + 1);
    const fb = feedback?.[i];

    let bg = 'bg-panel2';
    let border = 'border-edge';
    if (status === 'correct') {
      bg = 'bg-good/20';
      border = 'border-good';
    } else if (fb === 'correct') {
      bg = 'bg-good/25';
      border = 'border-good';
    } else if (fb === 'present') {
      bg = 'bg-gold/20';
      border = 'border-gold';
    } else if (fb === 'absent') {
      bg = 'bg-panel';
      border = 'border-edge/60';
    } else if (status === 'wrong') {
      border = 'border-bad';
    } else if (isCaret) {
      border = 'border-accent';
    }

    return (
      <button
        key={i}
        type="button"
        onClick={() => onCellClick?.(i)}
        className={[
          'relative flex items-center justify-center rounded-md border-2 font-mono font-bold uppercase',
          'h-10 w-9 text-xl sm:h-12 sm:w-11 sm:text-2xl',
          bg,
          border,
          isCaret ? 'ring-2 ring-accent/50' : '',
          inBridge && status === 'correct' ? 'outline outline-2 outline-gold -outline-offset-2' : '',
        ].join(' ')}
      >
        {isMeta && (
          <span className="pointer-events-none absolute inset-0 rounded-md bg-meta/25 ring-2 ring-meta" aria-hidden />
        )}
        {ch ? (
          <span className="relative z-10">{ch}</span>
        ) : hint ? (
          <span className="relative z-10 text-accent/60">{hint}</span>
        ) : null}
      </button>
    );
  };

  // Split the flat square sequence into word-groups per the enumeration.
  const groups = enumeration && enumeration.length > 1 ? enumeration : [length];
  let offset = 0;
  const wordEls = groups.map((len, gi) => {
    const start = offset;
    offset += len;
    return (
      <div key={gi} className="flex gap-1.5">
        {Array.from({ length: len }, (_, j) => cell(start + j))}
      </div>
    );
  });

  return (
    <div
      className={[
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-2',
        status === 'wrong' ? 'animate-shake' : '',
      ].join(' ')}
    >
      {wordEls}
    </div>
  );
}
