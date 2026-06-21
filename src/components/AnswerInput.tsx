import { useEffect, useRef } from 'react';

interface Props {
  length: number;
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  /** Map of position -> revealed letter (shown faintly as a hint). */
  revealed?: Map<number, string>;
  /** Position of a single collected (blue) meta-letter square. */
  metaIndex?: number;
  /** Position of the guaranteed bridge bigram (outlined), once revealed. */
  bridgeStart?: number;
  status: 'idle' | 'wrong' | 'correct';
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function AnswerInput({
  length,
  value,
  onChange,
  onSubmit,
  revealed,
  metaIndex,
  bridgeStart,
  status,
  autoFocus,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && !disabled) inputRef.current?.focus();
  }, [autoFocus, disabled]);

  const focus = () => {
    if (!disabled) inputRef.current?.focus();
  };

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
          'relative flex items-center justify-center rounded-md border-2 font-mono font-bold uppercase select-none',
          'h-10 w-9 text-xl sm:h-12 sm:w-11 sm:text-2xl',
          bg,
          border,
          isMeta && !ch ? 'ring-2 ring-meta ring-offset-0' : '',
          isMeta ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.5)_inset]' : '',
          inBridge && status === 'correct' ? 'outline outline-2 outline-gold -outline-offset-2' : '',
        ].join(' ')}
      >
        {isMeta && (
          <span className="pointer-events-none absolute inset-0 rounded-md bg-meta/20" aria-hidden />
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
    <div
      className={['flex flex-wrap justify-center gap-1.5', status === 'wrong' ? 'animate-shake' : ''].join(
        ' ',
      )}
      onClick={focus}
    >
      {boxes}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        className="absolute h-px w-px opacity-0"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, length))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
        aria-label="Answer"
      />
    </div>
  );
}
