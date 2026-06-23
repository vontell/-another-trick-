import Modal from './Modal';

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play Cryptic Maze" onClose={onClose}>
      <div className="space-y-4 text-sm leading-relaxed text-white/80">
        <p>
          Each room is a single crossword clue. Solve a path of rooms from the entrances at the{' '}
          <span className="text-white">bottom</span> up to the final chamber at the{' '}
          <span className="text-white">top</span>. You don&apos;t have to clear every room — any
          route to the top wins.
        </p>

        <div>
          <p className="mb-1 font-semibold text-white">Typing</p>
          <p>
            Use the on-screen (or your device) keyboard. Tap any square to move the cursor there.
            After solving, press Enter or the button to jump into a connected room.
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-gold">⚡ Bridges</p>
          <p>
            When you solve a room, a 2-letter pair is outlined — it is{' '}
            <span className="text-white">guaranteed</span> to appear somewhere in every room directly
            ahead. Each step up the maze guarantees a different pair, a running head-start.
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-accent">◆ Meta letters</p>
          <p>
            Some rooms hide a blue square. Solve them to collect that letter. The blue letters are
            spread so no single path holds them all — explore to gather every one, then unscramble
            them into the level&apos;s <span className="text-white">meta answer</span> after the final
            room.
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-gold">Power-ups</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-gold">⚡ Reveal token</span> — earned by solving a ⚡ room on the
              first try. Spend one to reveal a single letter.
            </li>
            <li>
              <span className="text-gold">🅰 Vowel Flare</span> — earned by solving a 🅰 room on the
              first try. Spend one to reveal all the vowels in a room.
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-1 font-semibold text-white">Timer &amp; stats</p>
          <p>
            Two timers run: one for the maze, one for the meta. Your best times, first-try solves and
            mistakes are saved on this device — open the 📊 stats panel any time.
          </p>
        </div>

        <p className="text-white/50">
          Beginner? Turn on <span className="text-white/80">Reveal wrong letters</span> in ⚙ Settings
          for Wordle-style feedback after a wrong guess.
        </p>
      </div>
    </Modal>
  );
}
