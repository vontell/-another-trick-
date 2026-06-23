import Modal from './Modal';
import Icon from './Icon';

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play Cryptic Maze" onClose={onClose}>
      <div className="space-y-3 text-base leading-relaxed text-ink/80">
        <p>
          Each room is one crossword clue. Solve a path from the{' '}
          <span className="text-ink">bottom</span> entrances up to the chamber at the{' '}
          <span className="text-ink">top</span> — any route wins, you needn&apos;t clear every room.
        </p>

        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5">
            <Icon name="star" size={17} className="mt-0.5 shrink-0 text-gold" />
            <span>
              <span className="font-semibold text-gold">Bridges</span> — solving a room outlines a
              2-letter pair guaranteed to appear in every room directly ahead.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="meta" size={16} className="mt-0.5 shrink-0 text-meta" />
            <span>
              <span className="font-semibold text-meta">Blue letters</span> — hidden on different
              paths. Gather them all, then unscramble them into the{' '}
              <span className="text-ink">meta answer</span> after the final room.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="reveal" size={16} className="mt-0.5 shrink-0 text-gold" />
            <span>
              <span className="font-semibold text-gold">Power-ups</span> — first-try solves earn
              tokens to reveal a letter, or flares to reveal every vowel.
            </span>
          </li>
        </ul>

        <p className="text-sm text-ink/50">
          Tip: turn on <span className="text-ink/80">Reveal wrong letters</span> in Settings for
          Wordle-style hints. Best times &amp; stats are saved on this device.
        </p>
      </div>
    </Modal>
  );
}
