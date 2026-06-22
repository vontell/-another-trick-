interface Props {
  length: number;
  value: string;
  /** Word lengths; e.g. [3,3] renders two groups of 3 with a gap. */
  enumeration?: number[];
  /** Map of position -> revealed letter (shown faintly as a hint). */
  revealed?: Map<number, string>;
  /** Position of a single collected (blue) meta-letter square. */
  metaIndex?: number;
  /** Position of the guaranteed bridge bigram (outlined), once revealed. */
  bridgeStart?: number;
  status: 'idle' | 'wrong' | 'correct';
}

/** Display-only answer grid. Typing is handled by the on-screen/physical keyboard. */
export default function AnswerInput({
  length,
  value,
  enumeration,
  revealed,
  metaIndex,
  bridgeStart,
  status,
}: Props) {
  const cell = (i: number) => {
    const ch = value[i] ?? '';
    const hint = !ch && revealed?.get(i);
    const isCaret = i === value.length && status !== 'correct';
    const isMeta = i === metaIndex;
    const inBridge = bridgeStart !== undefined && (i === bridgeStart || i === bridgeStart + 1);

    let bg = 'bg-panel2';
    let border = 'border-edge';
    if (status === 'correct') {
      bg = 'bg-good/20';
      border = 'border-good';
    } else if (status === 'wrong') {
      border = 'border-bad';
    } else if (isCaret) {
      border = 'border-accent';
    }

    return (
      <div
        key={i}
        className={[
          'relative flex items-center justify-center rounded-md border-2 font-mono font-bold uppercase',
          'h-10 w-9 text-xl sm:h-12 sm:w-11 sm:text-2xl',
          bg,
          border,
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
        {isCaret && (
          <span className="absolute bottom-1 h-0.5 w-5 animate-pulse rounded bg-accent" aria-hidden />
        )}
      </div>
    );
  };

  // Split the flat letter sequence into word-groups per the enumeration.
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
