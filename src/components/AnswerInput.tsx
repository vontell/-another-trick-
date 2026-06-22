interface Props {
  length: number;
  value: string;
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
  revealed,
  metaIndex,
  bridgeStart,
  status,
}: Props) {
  const boxes = Array.from({ length }, (_, i) => {
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
  });

  return (
    <div className={['flex flex-wrap justify-center gap-1.5', status === 'wrong' ? 'animate-shake' : ''].join(' ')}>
      {boxes}
    </div>
  );
}
