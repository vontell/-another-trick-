import Modal from './Modal';
import type { Settings } from '../game/store';

export default function SettingsDialog({
  settings,
  setSettings,
  onResetStats,
  onClose,
}: {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  onResetStats: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="space-y-5 text-base text-ink/80">
        <label className="flex cursor-pointer items-start justify-between gap-4">
          <span>
            <span className="font-semibold text-ink">Reveal wrong letters</span>
            <span className="mt-0.5 block text-sm text-ink/60">
              Beginner aid: after a wrong guess, each square is coloured — green (right spot), amber
              (in the word, wrong spot) or grey (not in the word).
            </span>
          </span>
          <button
            role="switch"
            aria-checked={settings.assistWrongLetters}
            onClick={() => setSettings({ assistWrongLetters: !settings.assistWrongLetters })}
            className={[
              'mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition',
              settings.assistWrongLetters ? 'bg-good' : 'bg-edge',
            ].join(' ')}
          >
            <span
              className={[
                'block h-5 w-5 rounded-full bg-white transition',
                settings.assistWrongLetters ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </label>

        <div className="border-t border-edge/60 pt-4">
          <button
            onClick={() => {
              if (confirm('Erase all saved stats and best times? (Level progress is kept.)')) {
                onResetStats();
              }
            }}
            className="rounded-lg border border-bad/40 px-3 py-2 text-sm font-medium text-bad hover:bg-bad/10"
          >
            Reset all stats
          </button>
        </div>
      </div>
    </Modal>
  );
}
