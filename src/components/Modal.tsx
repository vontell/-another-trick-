import type { ReactNode } from 'react';

export default function Modal({
  title,
  onClose,
  children,
  accent = 'accent',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  accent?: 'accent' | 'gold';
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-center bg-black/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-edge bg-panel shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-edge/60 p-4">
          <h2 className={['text-lg font-bold', accent === 'gold' ? 'text-gold' : 'text-white'].join(' ')}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-white/50 hover:bg-panel2 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
