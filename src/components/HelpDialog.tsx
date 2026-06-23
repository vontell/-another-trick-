import Modal from './Modal';
import Icon from './Icon';

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play Cryptic Maze" onClose={onClose}>
      <div className="space-y-4 text-base leading-relaxed text-ink/80">
        <p>
          Each room is a single crossword clue. Solve a path of rooms from the entrances at the{' '}
          <span className="text-ink">bottom</span> up to the final chamber at the{' '}
          <span className="text-ink">top</span>. You don&apos;t have to clear every room — any
          route to the top wins.
        </p>

        <div>
          <p className="mb-1 font-semibold text-ink">Typing</p>
          <p>
            Use the on-screen (or your device) keyboard. Tap any square to move the cursor there.
            After solving, press Enter or the button to jump into a connected room.
          </p>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-gold">
            <Icon name="star" size={15} /> Bridges
          </p>
          <p>
            When you solve a room, a 2-letter pair is outlined — it is{' '}
            <span className="text-ink">guaranteed</span> to appear somewhere in every room directly
            ahead. Each step up the maze guarantees a different pair, a running head-start.
          </p>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-meta">
            <Icon name="meta" size={14} /> Meta letters
          </p>
          <p>
            Some rooms hide a blue square. Solve them to collect that letter. The blue letters are
            spread so no single path holds them all — explore to gather every one, then unscramble
            them into the level&apos;s <span className="text-ink">meta answer</span> after the final
            room.
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-gold">Power-ups</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Icon name="reveal" size={16} className="mt-0.5 shrink-0 text-gold" />
              <span><span className="font-semibold text-gold">Reveal token</span> — earned by solving a token room on the first try. Spend one to reveal a single letter.</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="vowel" size={16} className="mt-0.5 shrink-0 text-gold" />
              <span><span className="font-semibold text-gold">Vowel Flare</span> — earned by solving a flare room on the first try. Spend one to reveal all the vowels in a room.</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-1 font-semibold text-ink">Timer &amp; stats</p>
          <p>
            Two timers run: one for the maze, one for the meta. Your best times, first-try solves and
            mistakes are saved on this device — open the stats panel (top bar) any time.
          </p>
        </div>

        <p className="text-ink/50">
          Beginner? Turn on <span className="text-ink/80">Reveal wrong letters</span> in Settings for
          Wordle-style feedback after a wrong guess.
        </p>
      </div>
    </Modal>
  );
}
