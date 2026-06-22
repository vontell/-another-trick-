import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A small tooltip that works on both desktop (hover) and mobile (tap).
 * The trigger is rendered inline; tapping toggles an explanatory bubble.
 */
export default function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={label}
        className={className}
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-1.5 w-52 -translate-x-1/2 rounded-lg border border-edge bg-ink px-3 py-2 text-left text-xs font-normal normal-case leading-snug text-white/80 shadow-xl"
        >
          {label}
        </span>
      )}
    </span>
  );
}
