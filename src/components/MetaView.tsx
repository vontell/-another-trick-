import { useState } from 'react';
import type { useGame } from '../game/useGame';
import AnswerInput from './AnswerInput';

interface Props {
  game: ReturnType<typeof useGame>;
  onClose: () => void;
}

export default function MetaView({ game, onClose }: Props) {
  const meta = game.resolved.meta;
  const alreadySolved = game.progress.metaSolved;
  const [value, setValue] = useState(alreadySolved ? meta.answer : '');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>(
    alreadySolved ? 'correct' : 'idle',
  );
  const [showHint, setShowHint] = useState(false);

  const solved = status === 'correct';
  const collected = game.progress.collected;

  const handleSubmit = () => {
    if (solved || value.length !== meta.answer.length) return;
    const ok = game.submitMeta(value);
    if (ok) {
      setValue(meta.answer);
      setStatus('correct');
    } else {
      setStatus('wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border border-gold/40 bg-panel p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            ★ Meta Puzzle
          </span>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-white/50 hover:bg-panel2 hover:text-white"
            aria-label="Back to map"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-base leading-snug text-white/90">{meta.prompt}</p>

        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
            Letters you collected ({collected.length})
          </p>
          {collected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {collected.map((c) => (
                <span
                  key={c.roomId}
                  className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-meta bg-meta/20 font-mono text-lg font-bold text-white"
                >
                  {c.letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">
              You didn&apos;t collect any blue letters — you can still try to solve it!
            </p>
          )}
        </div>

        <div className="mb-4">
          <AnswerInput
            length={meta.answer.length}
            value={value}
            onChange={(v) => {
              setValue(v);
              if (status === 'wrong') setStatus('idle');
            }}
            onSubmit={handleSubmit}
            status={status}
            autoFocus={!alreadySolved}
            disabled={solved}
          />
        </div>

        {!solved ? (
          <>
            <button
              onClick={handleSubmit}
              disabled={value.length !== meta.answer.length}
              className="w-full rounded-xl bg-gold px-4 py-3 font-semibold text-ink transition enabled:hover:brightness-110 disabled:opacity-40"
            >
              Solve the meta
            </button>
            {status === 'wrong' && (
              <p className="mt-3 text-center text-sm text-bad">Not the treasure — keep thinking.</p>
            )}
            {meta.hint && (
              <button
                onClick={() => setShowHint((s) => !s)}
                className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70"
              >
                {showHint ? meta.hint : 'Need a hint?'}
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3 animate-pop text-center">
            <p className="text-2xl">🏆</p>
            <p className="text-lg font-semibold text-gold">Level complete!</p>
            <p className="text-sm text-white/60">
              You uncovered <span className="font-bold text-white">{meta.answer}</span> and conquered
              the labyrinth.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-ink hover:brightness-110"
            >
              Back to the map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
