import { useState } from 'react';
import type { useGame } from '../game/useGame';
import AnswerInput from './AnswerInput';
import Keyboard from './Keyboard';
import { useTyping } from './useTyping';
import { enumerationText } from '../game/bridges';

interface Props {
  game: ReturnType<typeof useGame>;
  onClose: () => void;
}

const empty = (n: number) => Array.from({ length: n }, () => '');

export default function MetaView({ game, onClose }: Props) {
  const meta = game.resolved.meta;
  const L = meta.answer.length;
  const alreadySolved = game.progress.metaSolved;
  const [cells, setCells] = useState<string[]>(
    alreadySolved ? meta.answer.split('') : empty(L),
  );
  const [caret, setCaret] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>(
    alreadySolved ? 'correct' : 'idle',
  );
  const [showHint, setShowHint] = useState(false);

  const solved = status === 'correct';
  const collected = game.progress.collected;
  const totalBlue = game.rooms.filter((r) => r.metaLetterIndex !== undefined).length;
  const filled = cells.every((c) => c !== '');

  const handleSubmit = () => {
    if (solved || !filled) return;
    if (game.submitMeta(cells.join(''))) {
      setCells(meta.answer.split(''));
      setStatus('correct');
    } else {
      setStatus('wrong');
    }
  };

  const press = useTyping({
    length: L,
    disabled: solved,
    onLetter: (k) => {
      setStatus((s) => (s === 'wrong' ? 'idle' : s));
      setCells((prev) => {
        if (caret >= L) return prev;
        const next = [...prev];
        next[caret] = k;
        let c = caret + 1;
        while (c < L && next[c] !== '') c++;
        setCaret(c);
        return next;
      });
    },
    onBackspace: () => {
      setStatus((s) => (s === 'wrong' ? 'idle' : s));
      setCells((prev) => {
        const next = [...prev];
        if (caret < L && next[caret] !== '') {
          next[caret] = '';
        } else {
          const i = Math.max(0, caret - 1);
          next[i] = '';
          setCaret(i);
        }
        return next;
      });
    },
    onEnter: handleSubmit,
  });

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-center bg-black/80 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-lg flex-col border-gold/40 bg-panel shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl sm:border">
        <div className="flex shrink-0 items-center justify-between p-4 pb-2">
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

        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-base leading-snug text-white/90">{meta.prompt}</p>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
              Blue letters collected — {collected.length} of {totalBlue}
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
                You haven&apos;t collected any blue letters yet — explore the maze to gather them.
              </p>
            )}
            {collected.length < totalBlue && (
              <p className="mt-2 text-xs text-white/40">
                {totalBlue - collected.length} still hidden on other paths. The answer uses every
                blue letter.
              </p>
            )}
          </div>

          <div className="my-4">
            <p className="mb-2 text-center text-xs text-white/40">
              {enumerationText(meta.answer, meta.enumeration)}
            </p>
            <AnswerInput
              cells={cells}
              enumeration={meta.enumeration}
              caret={solved ? undefined : caret}
              onCellClick={solved ? undefined : setCaret}
              status={status}
            />
          </div>

          {status === 'wrong' && (
            <p className="text-center text-sm text-bad">Not the treasure — keep thinking.</p>
          )}

          {solved && (
            <div className="space-y-3 pb-2 text-center animate-pop">
              <p className="text-2xl">🏆</p>
              <p className="text-lg font-semibold text-gold">Level complete!</p>
              <p className="text-sm text-white/60">
                You uncovered <span className="font-bold text-white">{meta.answer}</span> and
                conquered the labyrinth.
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 p-3 pt-2">
          {!solved ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={!filled}
                className="w-full rounded-xl bg-gold px-4 py-2.5 font-semibold text-ink transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                Solve the meta
              </button>
              {meta.hint && (
                <button
                  onClick={() => setShowHint((s) => !s)}
                  className="w-full text-center text-xs text-white/40 hover:text-white/70"
                >
                  {showHint ? meta.hint : 'Need a hint?'}
                </button>
              )}
              <Keyboard onKey={press} enterLabel="Enter" />
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-ink hover:brightness-110"
            >
              Back to the map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
