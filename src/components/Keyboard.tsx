interface Props {
  onKey: (key: string) => void;
  /** Disable input (e.g. after solving). */
  disabled?: boolean;
  /** Label for the Enter key. */
  enterLabel?: string;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

/** On-screen keyboard so mobile never needs the native (screen-covering) one. */
export default function Keyboard({ onKey, disabled, enterLabel = 'Enter' }: Props) {
  return (
    <div className="select-none space-y-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map((key) => {
            const wide = key === 'ENTER' || key === 'BACK';
            const label = key === 'BACK' ? '⌫' : key === 'ENTER' ? enterLabel : key;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                className={[
                  'flex h-11 items-center justify-center rounded-md border border-edge/70 bg-panel2 font-display font-semibold text-ink shadow-[0_1px_0_rgba(44,33,20,0.18)]',
                  'transition active:translate-y-px active:bg-edge disabled:opacity-40 sm:h-12',
                  wide ? 'px-2 text-xs grow-[1.5]' : 'grow text-base',
                ].join(' ')}
                aria-label={key === 'BACK' ? 'Backspace' : key === 'ENTER' ? enterLabel : key}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
