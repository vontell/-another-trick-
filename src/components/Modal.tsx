import type { ReactNode } from 'react';
import Icon from './Icon';

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
      className="fixed inset-0 z-40 flex animate-fadeIn items-stretch justify-center bg-ink/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md animate-riseIn flex-col border-edge bg-panel shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-edge/60 p-4">
          <h2 className={['font-display text-xl font-bold tracking-wide', accent === 'gold' ? 'text-gold' : 'text-ink'].join(' ')}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 leading-none text-ink/50 hover:bg-panel2 hover:text-ink"
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
